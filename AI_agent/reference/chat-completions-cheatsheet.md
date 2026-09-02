# 速查表 · Chat Completions API（OpenAI 兼容）

> **AI Agent 开发 · Reference**
> 智谱 GLM / DeepSeek / Qwen / OpenAI 通用 · 2026-08-28 依据各家官方文档核实。
> 练习 1 逐字段对照用；第 2–4 课的接口细节也回这查。

---

## §1 接入参数

四家都是同一套姿势：请求 `{base_url}/chat/completions`，头里带 `Authorization: Bearer <key>`，体里 `model` + `messages`。换供应商 = 换三个环境变量。

| 供应商 | LLM_BASE_URL | LLM_MODEL（入门） | 文档 |
|---|---|---|---|
| 智谱 GLM | `https://open.bigmodel.cn/api/paas/v4` | `glm-5.3` / `glm-5.3-flash`（约 1/10 价，多模态但纯文本照用） | [HTTP 调用指南](https://docs.bigmodel.cn/cn/guide/develop/http/introduction) |
| DeepSeek | `https://api.deepseek.com` | `deepseek-v4-flash`（便宜）/ `deepseek-v4-pro` | [API 文档](https://api-docs.deepseek.com/) |
| Qwen（百炼） | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` / `qwen-turbo`（便宜） | [OpenAI 兼容说明](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope) |
| OpenAI | `https://api.openai.com/v1` | 以[模型列表页](https://platform.openai.com/docs/models)为准 | [API Reference](https://platform.openai.com/docs/api-reference/chat) |

---

## §2 请求体参数

| 参数 | 必填 | 说明 |
|---|---|---|
| `model` | 是 | 模型名，见上表 |
| `messages` | 是 | 消息数组，**整个 API 的灵魂**：全部历史按时间序排列，system 在第一条 |
| `temperature` | 否 | 采样随机度，0 ≈ 最稳定，1 更发散。默认 0.7 上下，练习阶段不用动 |
| `max_tokens` | 否 | 输出上限。截断时 `finish_reason` 变 `length`（练习 1 实验 B） |
| `stream` | 否 | 流式输出，默认 false。第 1 课不用，长期路线等级 1 再学 |

### messages 三种角色

| role | 谁写 | 作用 |
|---|---|---|
| `system` | 你，一次写好放第一条 | 人设与规则，全程生效，指令优先级高；每轮重发都占 token |
| `user` | 你（转发用户输入） | 用户本轮说的话 |
| `assistant` | 模型生成、**你的代码抄回去** | 模型的历史回复——多轮对话的钥匙 |

---

## §3 响应体逐字段

```jsonc
{
  "id": "chatcmpl-xxxx",          // ← 本次请求 ID；找供应商报障时贴它
  "model": "glm-5.3",             // ← 实际服务的模型
  "created": 1770000000,          // ← 时间戳（秒）
  "choices": [                    // ← 数组：n>1 时会有多个候选，日常恒为 1 个
    {
      "finish_reason": "stop",    // ← 为什么停，见 §4
      "index": 0,                 // ← 候选序号
      "message": {
        "role": "assistant",      // ← 整个对象原样 append 回 messages
        "content": "回复正文",     // ← 99% 的场景你只取这个字段
        "reasoning_content": "……" // ← 思考模式的思维链，非 OpenAI 标准字段，见 §3.1
      }
    }
  ],
  "usage": {
    "prompt_tokens": 38,          // ← 输入计费（你发的历史，含 system）
    "completion_tokens": 6,       // ← 输出计费（单价通常是输入的数倍）
    "total_tokens": 44
  }
}
```

---

## §3.1 思考模式（reasoning_content）

> 2026-08-31 依据三家官方文档核实。

开了思考模式的模型（DeepSeek V4 默认就开）会先生成一段**思维链**再给最终答案，这段思考过程通过 `message.reasoning_content` 返回（流式在 `delta.reasoning_content`），与 `content` 同级。**它不是 OpenAI 标准字段**——DeepSeek 率先使用、国内各家跟进的事实惯例；OpenAI 自家推理模型并不通过它暴露思考过程。取正文照旧 `choices[0].message.content`，不受影响。

| 供应商 | 默认状态 | 开关 |
|---|---|---|
| DeepSeek V4 | 默认开启，effort 默认 high | `"thinking": {"type": "enabled/disabled"}`；强度 `"reasoning_effort": "low/high/max"` |
| 智谱 GLM | 默认开启；**glm-5.3 / 5.3-flash 强制思考，关不掉** | `"thinking": {"type": "disabled"}`（其余型号可用） |
| Qwen（百炼） | 默认**关闭** | 请求体加 `"enable_thinking": true` |

**多轮对话要不要把 reasoning_content 传回去？**

- **不带工具调用**：无需回传；传了也会被忽略（DeepSeek 官方明示）。所以把整个 message 对象 push 回 messages 无害，放心做任务 2。
- **带工具调用**：DeepSeek / GLM 都要求**完整回传**历史轮次的 reasoning_content，漏传直接 400——第 3 课的主角，先混个脸熟。

**两个坑**：

1. 思考内容也是模型输出，**照常计入 completion_tokens 计费**——观察 usage 时输出 token 比答案字数多，多出来的就是思考开销。
2. DeepSeek 思考模式下 `temperature` / `top_p` 等采样参数**不生效**（设了不报错但被忽略）。

参考：[DeepSeek · Thinking Mode](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode) · [智谱 · 思考模式](https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode) · [阿里云百炼 · 深度思考](https://www.alibabacloud.com/help/zh/model-studio/deep-thinking)

---

## §4 finish_reason 对照

| 值 | 含义 | 你该做什么 |
|---|---|---|
| `stop` | 自然说完 | 正常处理 |
| `length` | 被 `max_tokens` 截断 | 要完整回答就调大 max_tokens 或精简输入 |
| `content_filter` | 触发内容安全策略 | 改写输入；换问法 |
| `tool_calls` | 模型要调工具（第 3 课的主角） | 先欠着，第 3 课见 |

---

## §5 常见错误码 · 第一反应

| HTTP 码 | 症状 | 第一反应 |
|---|---|---|
| `401` | 鉴权失败 | key 抄错 / 没设环境变量 / 没加 `Bearer ` 前缀 |
| `400` | 参数错误 | 读返回体里的 message；看到 *context length* = 历史超窗口了，裁剪 messages |
| `404` | 路径不对 | base_url 末尾多了/少了 `/v1` 或 `/v4`，对照 §1 表 |
| `429` | 限流（rate limit） | 等几秒重试；连发太快就加 sleep。长期路线等级 1 学指数退避 |
| `5xx` | 服务器侧故障 | 稍后重试；持续出现带着 `id` 去报障 |

---

## §6 你会写一千遍的三行

```typescript
// TypeScript（Node 内建 fetch）
const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
const data = await resp.json();
const text  = data.choices[0].message.content;   // ← 取正文
const usage = data.usage;                        // ← 记账
```

```python
# Python（requests）
resp = requests.post(url, headers=..., json=payload, timeout=60)
data = resp.json()
text = data["choices"][0]["message"]["content"]   # ← 取正文
usage = data["usage"]                             # ← 记账
```

记住取数路径 `choices[0].message.content`——TypeScript 里是 `data.choices[0].message.content`，Python 里是 `data["choices"][0]["message"]["content"]`；以后用 SDK 只是把这段路径换成属性访问：`resp.choices[0].message.content`。路还是同一条。

---

## §7 结构化输出（response_format）

> 2026-08-29 依据各家官方文档核实，智谱行 2026-09-02 复核。第 2 课主线，换供应商先看这张表。

用法就一行（加在请求体里）：

```jsonc
"response_format": {"type": "json_object"}
```

| 供应商 | 支持的类型 | 硬性要求 / 已知坑 |
|---|---|---|
| DeepSeek | `json_object` | **prompt 必须含 "json" 字样**（否则 400），建议附格式示例；**有概率返回空 `content`**（官方文档明示）；不支持 `json_schema` |
| 智谱 GLM | `json_object` | **无 prompt 字样硬要求**，但需在 system 消息中定义期望结构；不支持 `json_schema`；官方示例自带客户端二次校验（Python jsonschema、TS zod） |
| Qwen（百炼） | `json_object`；`json_schema` 仅 Qwen3.8-Max / 3.7-Max / 3.7-Plus / 3.8-Flash / 3.7-Flash 系列 | `json_object` 要求 messages 里含 "JSON" 字样，否则 400；**开启结构化输出时不要设 `max_tokens`** |

（OpenAI 另支持最严格的 `json_schema` 严格模式，本次未逐条核实，用得上时以[官方文档](https://platform.openai.com/docs/guides/structured-outputs)为准。）

**通用纪律**（与供应商无关）：`response_format` 只保证"整体是个合法 JSON"，**不保证字段齐、类型对**——本地解析 + 字段校验 + 兜底（重试 / 报错回传修复）永远省不掉。兜底的完整阶梯见[第 2 课课件 §2.4](../lessons/0002-structured-output.md)。

---

*发现文档与本表不符？以官方文档为准，然后告诉我改这里。*
