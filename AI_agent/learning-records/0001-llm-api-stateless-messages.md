# Learning Record 0001 · LLM API 无状态与对话历史

- **日期**：2026-09-02（第 1 课完成）
- **状态**：练习完成、checklist 已勾；复盘三题全过（Q1 于 2026-09-02 重述通过），第 1 课关闭
- **关联**：[课件](../lessons/0001-llm-api-stateless-messages.md) · [API 速查表](../reference/chat-completions-cheatsheet.md) · [TS 调试速查](../reference/ts-debug-repl.md)

---

## 本课核心认知

LLM API 是**无状态**的：每次调用都是全新请求，"多轮对话"= 把全部历史亲手拼进 `messages` 整体重发。三个推论：记忆由你的代码维护；assistant 消息由你抄回去；历史是可审计、可裁剪、可重放的普通数据。外加计费机制：历史每轮全量重发 → `prompt_tokens` 单调递增 → 越聊越贵。

## 练习产出（01_API基础/，TypeScript）

- `ex1_minimal_call.ts`：单轮最小调用，打印完整响应 ✓
- `ex2_chat.ts`：多轮聊天机器人 ✓。**亮点**：自己加了 `/delete` 命令（splice 掉 messages 第 1–2 条），把"失忆实验"做成了常驻功能——无状态认知的直接证据；system 人设自定义为 Palantir 工程师（个性化，非照抄）。
- 实际供应商：**智谱 glm-5.3-flash**（NOTES 早先记录 DeepSeek，与实际不符，已更正）。

## 踩坑与教训（本课非显然的部分）

1. **API key 硬编码进源码（安全）**：ex1/ex2 把智谱 key 明文写死，还保留了 `process.env` 的注释。已改回 `process.env.LLM_API_KEY!` 写法；该 key 需在智谱控制台作废重发。教训：secret 只走环境变量，永不进源码——这是以后 `git init` 前的第一道检查。
2. **npm init -y 在中文目录名失败**：`01_API基础` 不是合法 npm 包名（限小写 ASCII），package.json 需手写。
3. **macOS `/private` 符号链接**：`import.meta.filename === process.argv[1]` 直接比较失败，需 `realpathSync` 两边归一。
4. **`<details>` 折叠在其 markdown 查看器里无效**：课程自此采用"独立答案册 + 锚点链接"模式。
5. **代码设计小瑕疵（不影响跑通）**：`api_call` 内部直接 push 全局 `llm_messages`（隐藏副作用），第 2 课的兜底重试会需要"发出去 ≠ 已记入历史"，建议改成返回 `{ content, usage }` 由调用方 push；另外首行输入 `/exit` 仍会被当消息发一次（循环入口边界）。

## 复盘（口述判卷，2026-09-02）

**Q1 为什么模型"不记得"上一轮**：首次口述 ❌ 差半步。用户答"返回给 api 接口的 message 中两条信息被删除了"——把实验里的删除当成了不记得的*原因*，且方向说反（messages 是**发给** API 的请求体，不是 API 返回的）。正确核心：API 无状态，两次调用之间服务器什么都不存；模型"记得"的唯一来源是每次全量重发历史。
**2026-09-02 重述通过**："API 是无状态的，服务器不会存信息，API 唯一的信息来源是我发过去的历史信息"——三要素齐（无状态 / 服务器不存 / 唯一信息来源 = 发过去的历史）。压缩记法：**没发的，等于不存在。**

**Q2 删第 2 轮 + token 影响**：✅ 过（splice(1, 2)、prompt token 减少）。判卷补强两点：① 数组是 `[system, u1, a1, u2, a2…]`，`splice(1, 2)` 删的是**第 1 轮**——他的 `/delete` 实为"遗忘最早一轮"（上下文裁剪的雏形，好功能，名字可以叫 forget-oldest）；要删第 2 轮得 `splice(3, 2)`，对话越长索引越要算。② token 省的不止一次：历史每轮重发，删掉后**之后每一轮**输入都少这一段。

**Q3 system vs user**：✅ 过（system 定角色/人设，user 是用户输入，改 system 影响人设）。补强：改 system 从下一轮立即生效（数组整体重发、模型每轮重读人设）——其 ex2 换 Palantir 人设时已亲历。

- 课件自测五题：已完成（课件内折叠对照）。

## 下次课衔接

第 2 课结构化输出，主线已改智谱（2026-09-02）。注意点：① glm-5.3-flash **强制思考不可关**，分类练习的响应会带 `reasoning_content`、`completion_tokens` 偏大——属正常；② 第 1 课任务 3 的 token 观察当时是整包 JSON 顺带看的，做第 2 课热身时补一行 `console.log(data.usage)` 专打三件套。
