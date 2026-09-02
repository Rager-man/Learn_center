# 第 1 课 · LLM API 的本质——无状态与对话历史

> **AI Agent 开发 · 20 小时速通 · 1 / 10**
> 节奏：**30 分钟学**（§0–§2）→ **80 分钟练**（§3，代码放 `01_API基础/`）→ **10 分钟复盘**（§4）。
> 本课用 **TypeScript + Node.js**：今天几乎不用装东西——Node 22 你的机器上已经有了，只装一个 `tsx` 用来直接跑 `.ts`；连 SDK 都不用，用 Node 内建的 `fetch` 裸调 HTTP。
> 顺带说一句：本课的核心认知与语言无关——无状态就是无状态，换 TypeScript 只是换了发 HTTP 的工具。

---

## §0 开工准备（10 分钟）

今天只需要一样东西：**一个 OpenAI 兼容 API 的 key**。三家任选其一（如果你已经有其中一家的，直接用）：

| 供应商 | base_url | 入门模型 | key 获取 |
|---|---|---|---|
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-5.3` | [bigmodel.cn](https://bigmodel.cn/) 控制台 |
| DeepSeek | `https://api.deepseek.com` | `deepseek-v4-flash`（便宜，练手首选）/ `deepseek-v4-pro` | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| Qwen（阿里百炼） | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` / `qwen-turbo`（便宜） | [百炼控制台](https://bailian.console.aliyun.com/) |

拿到 key 后，在终端里设置三个环境变量（想让它们永久生效就写进 `~/.zshrc`）：

```bash
# 以智谱为例；换供应商就换前两个值
export LLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export LLM_MODEL="glm-5.3"
export LLM_API_KEY="在这里粘贴你的 key"
```

先做一次连通性预检——这一行跑通，今天的路就通了：

```bash
curl -s "$LLM_BASE_URL/chat/completions" \
  -H "Authorization: Bearer $LLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "'"$LLM_MODEL"'", "messages": [{"role": "user", "content": "ping"}]}' \
  | head -c 400
```

返回里能看到 `"choices"` 字样就是通了；看到 `401` 是 key 不对，回到控制台检查。

### §0.1 搭 TypeScript 环境（2 分钟）

先确认 Node（需要 ≥ 18，`fetch` 内建；你机器上是 22）：

```bash
node --version
npm --version
```

npm 项目已经搭好（在工作区根目录：`tsx`、`@types/node` 都装了，另带了 `dotenv`、`openai`、`typescript` 备用）。在 `01_API基础/` 里直接用 `npx tsx` 就行——npx 会自动向上找到根目录的 `node_modules`。确认一下：

```bash
npx tsx --version
```

以后跑练习都是 `npx tsx 文件名.ts`。`@types/node` 是给编辑器的类型提示（`process`、`fetch`、`readline` 的补全都靠它）；`tsx` 本身不编译、不检查类型，只管跑。

开工前跑一次安检（本课起每次开工的第一件事，沉默即绿）：

```bash
npx tsc --noEmit   # 在 AI_agent/ 目录里跑
```

今天是绿的：本课只有你新写的两个练习文件，出生即绿——之后哪天它红了，红的就是你刚写的东西，修到沉默为止。

本课练习文件（都在 `01_API基础/`，任务说明见 §3）：

- `ex1_minimal_call.ts` —— 任务 1：最小调用（起步骨架在 §3，你来新建）
- `ex2_chat.ts` —— 任务 2：多轮聊天机器人（骨架片段在 §3，你来新建——多轮历史的维护正是练习本体，不预建）

> 💡 **课前读什么**
> 按计划，学前阅读是你所用平台的 **chat completions 文档**，重点看 `messages` 参数结构。入口：[智谱 HTTP 调用指南](https://docs.bigmodel.cn/cn/guide/develop/http/introduction) · [DeepSeek 文档](https://api-docs.deepseek.com/) · [Qwen OpenAI 兼容说明](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope) · [OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat)。
> 先把 §1–§2 读完再去看官方文档，你会发现自己已经看得懂了——那种感觉就是对的学习顺序。

---

## §1 核心认知：模型不记得任何事

> ◆ **本课唯一必须带走的东西**
>
> **LLM API 是无状态的（stateless）。**每次调用都是一次全新的、互不相识的请求。所谓"多轮对话"，是你把全部历史亲手拼进 `messages` 数组，整体重发一遍。模型不是"记得"，是"这次又看见了"。

眼见为实。看一个两轮对话里，**你实际发出去的东西**长什么样（`←` 是我加的旁白，真实请求里没有）：

```jsonc
// 第 1 轮：你发出的全部
[
  { "role": "user", "content": "我叫小钟" }
]
```

模型回复："你好，小钟！"——注意此刻：**这句话只存在于你的变量里，服务器那边什么都没存。**它没有会话记录，没有记忆，什么都不剩。

```jsonc
// 第 2 轮：你发出的全部
[
  { "role": "user",      "content": "我叫小钟" },      // ← 第 1 轮原话，又发了一遍
  { "role": "assistant", "content": "你好，小钟！" },   // ← 模型上轮的话，由你亲手拼回去
  { "role": "user",      "content": "我叫什么？" }      // ← 只有这条是新的
]
```

三个推论，每个都值回今天的学费：

1. **"记忆"是你写的代码提供的**——历史没传，模型就失忆。聊天机器人"不记得上句"，九成是历史没拼对。
2. **assistant 消息是你写进去的**——不是服务器帮你存的。你是唯一保管对话历史的人。
3. **历史是你手里的普通数据**——想删掉一段、想改写、想总结压缩，都是改你自己的数组。后面所有 agent 的"记忆管理"，起点全在这里。

> ⚠️ **本课避坑**
> 别把"无状态"当成模型的缺陷。它正是 agent 可控性的来源：模型每次看到什么，完全由你决定——这意味着对话的上下文**可审计、可裁剪、可重放**。框架替你管历史，管的就是这个数组，仅此而已。

### §1.1 亲手拼一次（动笔，5 分钟）

别只看。打开编辑器新建一个草稿文件（或拿纸），**凭理解**把下面这场对话的完整请求体 `messages` 写出来——对，就是"假如你现在就要 POST，数组里该有几条、顺序怎样、每条 role 是什么"：

> 场景：system 设定为简洁中文助手；第 1 轮用户说"我叫小钟，最喜欢的数字是 42"，模型答"记住了，小钟。你最喜欢的数字是 42。"；第 2 轮用户问"我最喜欢的数字是多少？"

写完再去对照（答错很正常，错在哪就是哪没懂）：

> [!success]- 对照答案（先写完再展开）
> ```jsonc
> [
>   { "role": "system",    "content": "你是一个简洁的中文助手" },
>   { "role": "user",      "content": "我叫小钟，我最喜欢的数字是 42" },
>   { "role": "assistant", "content": "记住了，小钟。你最喜欢的数字是 42。" },
>   { "role": "user",      "content": "我最喜欢的数字是多少？" }
> ]
> ```
>
> 数一下粗略 token：中文约每字 0.7 token，每条消息再加几个结构开销。感受一下：就这 4 条小消息，每次请求都是它们全部重新计费——对话越长，每一轮越贵。
>
> **易错点自查**：system 是不是放在了第一条？assistant 那条是不是模型第 1 轮的原话（而不是你自己新编的）？如果这两条你写对了，无状态的核心你就抓住了。

---

## §2 一次调用到底发生了什么（30 分钟）

把"调一次 LLM"拆到最底层，就是一次普通的 HTTP 请求：**一个 URL + 一个鉴权头 + 一个 JSON 进，一个 JSON 出**。没有魔法，没有连接保持，和你调任何 REST API 没有本质区别。

### §2.1 请求的解剖

```jsonc
// POST {LLM_BASE_URL}/chat/completions
// 头：Authorization: Bearer <你的 key>   ← 鉴权：认 key 不认人
// 头：Content-Type: application/json
{
  "model": "glm-5.3",                     // ← 用哪个模型
  "messages": [                           // ← 灵魂参数：全部历史都在这
    { "role": "system",    "content": "你是一个简洁的中文助手" },
    { "role": "user",      "content": "我叫小钟" },
    { "role": "assistant", "content": "你好，小钟！" },
    { "role": "user",      "content": "我叫什么？" }
  ],
  "temperature": 0.7                      // ← 随机度：0 稳定，1 发散（今天不动它）
}
```

### §2.2 响应的解剖

```jsonc
{
  "id": "chatcmpl-xxxx",                  // ← 本次请求 ID，报障时贴它
  "model": "glm-5.3",                     // ← 实际用的模型
  "choices": [                            // ← 为什么是数组？n>1 时一次出多个候选
    {
      "finish_reason": "stop",            // ← stop=说完了；length=被 max_tokens 截断
      "message": {
        "role": "assistant",              // ← 这整个对象，push 回你的 messages
        "content": "你叫小钟。"            // ← 你唯一关心的正文
        // （思考模式的模型还会多带一个 reasoning_content：思维链，见速查表 §3.1）
      }
    }
  ],
  "usage": {                              // ← 计费三件套，练习 3 的主角
    "prompt_tokens": 38,                  // ← 你发过去的历史（输入，便宜）
    "completion_tokens": 6,               // ← 模型生成的（输出，贵几倍）
    "total_tokens": 44
  }
}
```

完整字段说明见[《Chat Completions API 速查表》](../reference/chat-completions-cheatsheet.md)——练习 1 要逐字段对照着看，建议现在扫一眼，练习时开着它。

### §2.3 三种角色，谁写谁

| role | 谁写的 | 位置 | 干什么用 |
|---|---|---|---|
| `system` | 你，开头一次性写好 | 永远第一条 | 定人设、定规则，全程生效、指令优先级高 |
| `user` | 你（转发用户的输入） | — | 用户说的话 |
| `assistant` | 模型生成，**你抄回去** | — | 模型的历史回复——多轮对话的钥匙 |

值得一记的细节：`system` 只需要写一次，之后每轮重发时它都在列表开头跟着一起发。人设不占轮次，但**每一轮都占 token**。

### §2.4 token 与上下文窗口

**token** 是模型分词器切出来的文本碎片，也是计费和计量的最小单位。粗略量级感（各家分词器不同，感受即可）：英文约 4 个字符 ≈ 1 token；一个汉字 ≈ 0.6–0.7 token。

**上下文窗口（context window）**是单次请求里 `prompt + completion` 的总量上限，主流模型在 128K 量级（以你所用模型文档为准）。结合 §1 的"每轮全量重发"，直接推出本课最后一组结论：

- **越聊越贵、越慢**——第 N 轮的输入，包含前 N−1 轮的全部内容。历史不是只算一次，是每轮都重新计费。
- **历史无节制增长必撞墙**——超窗口会直接报错（`context length exceeded`）。
- **裁剪历史是必修课**——删哪条、留哪条、怎么把老对话总结成一条，是"记忆管理"的全部内容。今天只要知道：这事发生在这个数组上。

---

## §3 练习：80 分钟，主菜上桌

全部代码放在 `01_API基础/`（§0 里已经建好 npm 项目）。先给你**起步骨架**——只给"调用的姿势"，多轮对话的维护是你今天的练习本体，别让我替你写了：

```typescript
// 01_API基础/ex1_minimal_call.ts —— 起步骨架
// 单轮最小调用：亲手拼出整个请求，看清每一层

const BASE_URL = process.env.LLM_BASE_URL!;   // §0 设置的环境变量
const API_KEY  = process.env.LLM_API_KEY!;    // 末尾的 ! 表示"我确定它已设置"
const MODEL    = process.env.LLM_MODEL!;

async function main() {
  const resp = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: "用一句话解释什么是 token" }],
    }),
    signal: AbortSignal.timeout(60_000),      // ← 60 秒超时
  });

  console.log(resp.status);
  console.log(JSON.stringify(await resp.json(), null, 2));
}
main();
```

### 任务 1 · 最小调用（40 分钟）

1. 新建 `ex1_minimal_call.ts`，用骨架跑通（`npx tsx ex1_minimal_call.ts`），打印完整响应 JSON。
2. **逐字段过一遍**：`id` / `model` / `choices[0].message` / `finish_reason` / `usage` 三件套——对照[速查表](../reference/chat-completions-cheatsheet.md)，每个字段能口述作用才算看过。
3. 实验 A：在最前面加一条 `system` 消息（内容：`你是一个只用文言文回答的助手`），再问同一个问题，对比输出变化。
4. 实验 B：请求体里加 `"max_tokens": 10`，重跑，观察 `finish_reason` 变成什么、`content` 是不是被拦腰截断。

> ✅ **检查点（比写完代码更重要）**
> 把响应合上，**口述**五个字段的作用：`id` / `model` / `choices[0].message` / `finish_reason` / `usage` 三件套。哪个口述不出来，就回去再看它一眼——第 2 课开始这些字段天天见。

### 任务 2 · 命令行多轮聊天机器人（30 分钟）

新建 `ex2_chat.ts`。目标：一个支持多轮记忆的命令行聊天机器人——**记忆由你的代码维护**。

1. 程序开头初始化 `messages`（含一条你设计的 `system`）——顺手定个类型，编辑器会帮你防拼写错误：

```typescript
type Role = "system" | "user" | "assistant";
interface Message { role: Role; content: string }
```

2. 循环：读输入 → push 成 `user` 消息 → 调 API → 把返回的 message push 回数组 → 打印回复。读输入用 Node 内建的 `readline/promises`：

```typescript
import { createInterface } from "node:readline/promises";

const rl = createInterface({ input: process.stdin, output: process.stdout });

async function main() {
  const line = (await rl.question("你: ")).trim();   // ← 读一行输入
  // ……你的循环逻辑写在这里……
  rl.close();                                        // ← 退出前记得关
}
main();
```

3. 输入 `/exit` 退出。

- 💡 卡住了？两条提示折叠在下面，想清楚再点开：

> [!tip]- 提示 1：请求和响应怎么接起来（想清楚再点）
> 发送的是**整个 messages 数组 + 新的 user 消息**；收到响应后 `const data = await resp.json()`，把 `data.choices[0].message`（它恰好就是一个 `{ role: "assistant", content: "..." }` 对象）整个 push 回同一个数组。下一轮循环发出去的，就是这个变长了的历史。

> [!tip]- 提示 2：细节清单（想清楚再点）
> 用户直接回车（空输入）就 continue 跳过；`Ctrl+C` 想优雅退出可以包一层 `try/catch`；把 API 调用抽成一个 async 函数 `chat(messages: Message[]): Promise<{ content: string; usage: Usage }>`（返回回复文本和 usage），任务 3 会感谢这个设计。另外：如果拼出来的 URL 里出现 `undefined`，说明环境变量没设——回 §0 把三个 export 跑一遍。

写完必须做**记忆测试**（这步比写代码本身重要）：

> ✅ **记忆测试**
> 第 1 轮告诉它："我叫小钟，我最喜欢的数字是 42"。中间聊 3–4 轮别的。然后问："我叫什么？最喜欢的数字是多少？"——它答得上来，说明历史真的被你传过去了；答不上来，先检查你的 push 逻辑，别怪模型。

### 任务 3 · token 观察器（10 分钟）

1. 在 ex2 里每轮打印 `usage` 三个数。
2. 连聊 5 轮以上，盯着 `prompt_tokens`：它是不是一轮比一轮大？增长量里包含什么？
3. 心算一题：假设每轮新增约 300 token，到第 20 轮时，单次请求的输入大约多大？这次对话你一共为"重发历史"付了多少 token？

> ✅ **检查点（比写完代码更重要）**
> 心算题答得上来，且能指着 `prompt_tokens` 的增长说出"增长量里包含什么"——计费直觉建起来了，这比代码本身值钱。

### §3.4 自查清单

- [x] 任务 1–3 全部跑通，响应每个字段说得出作用 ✅ 2026-09-02
- [x] 记忆测试通过：5 轮后模型仍记得第 1 轮的内容 ✅ 2026-09-02
- [x] 能指着代码说出：模型的"记忆"来自哪一行 ✅ 2026-09-02
- [x] 亲眼看过一次"失忆"：手动删掉 messages 中间两条再问，模型懵了（这一眼，比读十篇讲无状态的文章都管用） ✅ 2026-09-02
- [x] 能解释 prompt_tokens 为什么单调递增 ✅ 2026-09-02

> 💡 **卡住 20 分钟就求助**
> 老规矩：期望什么、实际发生什么、完整报错、相关代码，四样贴给我。TS 环境报错（tsx 装不上、类型提示不动之类）也直接贴——环境问题不是学习问题，不该耗你的时间。

---

## §4 复盘：10 分钟检索练习

规则：**合上代码**，先在心里把答案完整说出来，再点开下方折叠对照。"感觉我知道"不算数——说得出来才算。答完之后，把计划里的三道复盘问题口述成文字发给我，我来判卷：

1. 不看代码，说出模型为什么"不记得"上一轮你说过的话？
2. 想删掉第 2 轮的对话，你会怎么改 messages？这对 token 消耗意味着什么？
3. system 和 user 消息的区别是什么？改动 system 内容，模型行为有什么变化？

自测五题（每题先默答，再点开「看答案」）：

**Q1. 两次独立调用之间，模型靠什么"知道"上一轮聊了什么？**

> [!question]- 看答案（先默答再点开）
> **你把全部历史拼进本次 messages。**
>
> API 是 stateless 的：服务器不存任何会话。上一轮的内容之所以"还在"，只因为你这次把它拼进了 messages 一起发过去。（"服务器用会话 ID 自动关联"是最大的迷惑项——没有这回事。）

**Q2. 想让第 3 轮的模型彻底"忘记"第 2 轮，正确做法是？**

> [!question]- 看答案（先默答再点开）
> **删掉那轮的 user 和 assistant 两条消息。**
>
> 历史只活在你手里的列表里：物理删除那两条消息，模型就无从得知。发一条 system 命令它"忘记"没用——内容仍在 messages 里占 token，模型依然看得见。

**Q3. 想让模型全程用固定人设和规则回答，设定应放在哪里？**

> [!question]- 看答案（先默答再点开）
> **第一条 system 消息里。**
>
> system 消息写在列表开头、一次编写全程生效、指令优先级高。塞进每轮 user 消息里有时也能起效，但浪费 token 且效力不稳——人设有专属车位。

**Q4. 多轮对话进行到第 10 轮时，单次请求的 prompt token 大致怎么变？**

> [!question]- 看答案（先默答再点开）
> **随历史累积而单调增长。**
>
> 每轮都是全量重发：第 10 轮的输入 = 前 9 轮全部内容 + 新消息。所以越聊越贵、越慢，直到撞上下文窗口的墙。

**Q5. 第 2 轮请求里那条 assistant 消息，是谁写进去的？**

> [!question]- 看答案（先默答再点开）
> **你的代码，拼回上一轮的回复。**
>
> 模型的回复只在你拿到响应那一刻存在你的变量里。把响应里 `resp["choices"][0]["message"]` append 回 messages 的那行代码，就是你写的"记忆"。（"API 服务器自动帮你补全"不存在——服务器什么都记不住。）

---

## §5 下课

**学有余力（可选）**：给机器人加 `/reset` 清空历史、退出时把对话存成 JSON 文件（用 `node:fs` 的 `writeFileSync` 加 `JSON.stringify`）——这是长期路线图等级 1 的正式练习，现在做等于提前打卡。

**完成后回来找我**：告诉我练习完成情况，我帮你勾掉计划里的 checkbox、记录你的第一条学习档案；有失败案例更好，那正是下一课的引子。然后随时可以喊"开始第 2 次课"——**结构化输出：让模型说"机器话"，以及为什么模型输出永远不可全信**。

> 💡 **我是你的导师，不是课件**
> 这页是提词器，提问的地方在对话框里。任何"为什么"、任何报错、任何"我感觉哪里不对"，直接问——20 小时速通的前提，是卡点不过夜。

---

*第 0 课：不存在，你已经在第一线了 ｜ 下一课：第 2 课 · 结构化输出（完成本课后解锁）*
*AI Agent 开发 · 20 小时速通 · 总计划见 [00_20小时速通计划.md](../00_20小时速通计划.md) · [API 速查表](../reference/chat-completions-cheatsheet.md)*
