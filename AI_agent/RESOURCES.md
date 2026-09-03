# AI Agent 开发 Resources

## Knowledge

- [Article: Building Effective Agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)
  官方架构指南：workflow vs agent 的分界、五种编排模式、"先直连 API 再谈框架"的原则、附录的工具设计（ACI）最佳实践。用于：第 5、10 次课的核心阅读，以及所有架构判断问题。
- [Article: Writing effective tools for AI agents — Anthropic](https://www.anthropic.com/engineering/writing-tools-for-agents)
  工具（ACI）设计专题。用于：第 3 次课学前阅读、第 5 次课工具描述改写。
- [Article: Demystifying evals for AI agents — Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
  agent 评估方法论：为什么需要评估集、如何设计。用于：第 8 次课学前阅读。
- [Docs: MCP 官方文档](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro)
  工具开放标准的概念介绍与 [server 构建教程](https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server)。用于：第 9 次课全部内容。
- [Article: What Is the AI Agent Loop? — Oracle Developers](https://blogs.oracle.com/developers/what-is-the-ai-agent-loop-the-core-architecture-behind-autonomous-ai-systems)
  agent loop（reason → act → observe）架构讲解。用于：第 4 次课学前阅读。
- [Article: The AI Agent Loop: Architecture and Failure Modes — Atlan](https://atlan.com/know/ai-agent/what-is-an-agent-loop/)
  agent loop 的失败模式分析。用于：第 8 次课护栏设计的扩展阅读。
- [Docs: OpenAI Function Calling 指南](https://platform.openai.com/docs/guides/function-calling)
  function calling 机制的权威参考（OpenAI 兼容 API 通用）。用于：第 3、4 次课的接口细节查询。
- [Glossary: AI Agent Glossary — Digital Applied](https://www.digitalapplied.com/blog/ai-agent-glossary-2026-60-essential-terms)
  60 个 agent 术语速查。用于：遇到陌生名词时查。

### 供应商接入文档（OpenAI 兼容，2026-08-28 核实）

- [Docs: 智谱开放平台 HTTP API 调用指南](https://docs.bigmodel.cn/cn/guide/develop/http/introduction)
  base_url `https://open.bigmodel.cn/api/paas/v4`，入门模型 `glm-5.3`，含 curl/Python(requests)/JS/Java 示例与错误码说明。用于：第 1 课学前阅读（messages 参数结构）。
- [Docs: 智谱 · 工具调用（Function Calling）](https://docs.bigmodel.cn/cn/guide/capabilities/function-calling)
  tools 请求格式、tool_calls 响应结构、role:"tool" 回传流程的官方权威来源（含工具设计最佳实践）。用于：第 3 次课学前阅读、第 4 次课接口细节查询；配套速查表 §8。
- [Docs: DeepSeek API 文档](https://api-docs.deepseek.com/)
  base_url `https://api.deepseek.com`，入门模型 `deepseek-v4-flash` / `deepseek-v4-pro`，key 在 platform.deepseek.com/api_keys。用于：第 1 课学前阅读（备选供应商）。
- [Docs: 阿里云百炼 OpenAI 兼容接口](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope)
  base_url `https://dashscope.aliyuncs.com/compatible-mode/v1`，入门模型 `qwen-plus` / `qwen-turbo`。用于：第 1 课学前阅读（备选供应商）。
- 速查表：工作区 [reference/chat-completions-cheatsheet.md](reference/chat-completions-cheatsheet.md)——四家接入参数、请求/响应逐字段、错误码第一反应。
- 速查表：工作区 [reference/ts-debug-repl.md](reference/ts-debug-repl.md)——TS 调试与 REPL（`debugger;`、VS Code launch.json、tsx REPL、main guard），Node 22 + tsx 实测结论。

## Wisdom (Communities)

- [Anthropic Discord](https://discord.gg/anthropic)
  agent 开发与 MCP 讨论质量最高的官方社区。用于：工具设计、MCP 实操问题提问。
- [Latent Space Discord / Newsletter](https://www.latent.space/)
  2026 年 AI 工程文化的中心社区（swyx 创办），每周活动。用于：跟上 agent 工程实践前沿。
- [r/AI_Agents](https://www.reddit.com/r/AI_Agents/)
  最大的 agent 专题 subreddit。用于：看别人踩坑、项目展示。
- [Hacker News](https://news.ycombinator.com/)
  高信噪比的工程讨论。用于：重大技术动态与深度讨论。

## Gaps

- 中文高信噪比社区尚未核实（知乎/掘金的 agent 话题质量参差），待后续调研补充。
