# Learning Record 0001 · LLM API 无状态与对话历史

- **日期**：2026-09-02（第 1 课完成）
- **状态**：练习完成、checklist 已勾；复盘三题口述**待判卷**
- **关联**：[课件](../lessons/0001-llm-api-stateless-messages.md) · [答案册](../lessons/0001-answers.md) · [API 速查表](../reference/chat-completions-cheatsheet.md) · [TS 调试速查](../reference/ts-debug-repl.md)

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

## 复盘（口述判卷）

- 计划三题口述答案：**待用户提交，判卷后补入本节**。
- 课件自测五题：已完成（答案册对照）。

## 下次课衔接

第 2 课结构化输出。两个注意点：① 第 2 课课件主线按 DeepSeek 写，用户实际用智谱——开课前确认是按 §2.5 智谱对照行还是改主线；② 任务 3 的 token 观察当时是整包 JSON 顺带看的，热身时可补一行 `console.log(data.usage)` 专打三件套。
