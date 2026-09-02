# 教学备忘（AI 导师专用）

## 用户偏好

- 教学语言：中文；技术术语保留英文（function calling、RAG、MCP、chunk 等）
- 文档格式：markdown，与现有 `00_学习路线图.md` 风格一致（直接、重避坑、每次课有一条"核心认知"）
- **课件一律 markdown**（2026-08-28 用户明确要求：把已生成的 HTML 课件改成 markdown；此后不再产出 HTML/JS 课件）
- **"卡住再看"的内容用 Obsidian 折叠 callout 内嵌课件**（2026-08-31 更新，取代原"独立答案册"模式）：提示、对照答案、自测答案以 `> [!success]-` / `> [!tip]-` / `> [!question]-` 折叠块直接放课件内，默认收起、点击展开（用户已确认现在主要在 Obsidian 里看课件）。注意环境差异：`<details>` 在用户旧查看器（浏览器 md 预览）里无法折叠（2026-08-30 教训）；折叠 callout 在 GitHub / VS Code 预览里则退化为普通引用块（内容仍完整，只是不折叠）。不再维护独立 `000N-answers.md`
- 学习风格：重实操——每次 80 分钟写代码，学前阅读只给最小必读
- 复盘方式：合上代码凭记忆口述复盘问题，再验证（检索练习，非重读）

## 工作区结构

- `00_学习路线图.md`：4–6 个月长期完整路线（等级 1–5）
- `00_20小时速通计划.md`：10 次 × 2 小时速通计划（本次交付），与长期路线共存
- `01_API基础/` `02_ToolUse/` `03_RAG/` `04_多步Agent/` `05_毕业项目/`：练习代码目录（速通计划复用同一套目录）
- `lessons/`（课件）、`reference/`（速查表）、`learning-records/`（学习档案）：课程素材
- `RESOURCES.md`：精选资源；`MISSION.md`：学习使命

## 待确认

- MISSION.md 为推断版，等用户修正
- 全课程语言已实际转向 TypeScript（第 1、2 课均为 TS，用户另有并行 TS 课程）；速通计划"前置要求"（Python 基础）与 MISSION 的措辞待下次修改时一并改写。用户的 Python 练习文件（ex1/ex2/ex2.ipynb）保留未删
- 用户可用的 MCP 客户端未确认（第 9 次课需要，届时确认装的是 Claude Desktop 还是其他）

## 用户环境（2026-08-28 检查）

- anaconda Python 3.13.9（/Users/clock1/tools/anaconda3/bin/python3）
- requests 2.32.5 已装；openai SDK 未装
- **Node 22.22.2 + npm 10.9.7 已确认（2026-08-30）**；bun/deno 未装。npm 项目在**工作区根目录**（package.json 名 `ai_agent`，`type: module`；2026-08-31 核实）：tsx ^4.23、@types/node、typescript ^7.0 已装，另有 dotenv 与 openai ^7.8 备用（openai SDK 已装，但课程在 function calling 课前仍刻意不用）。跑法 `npx tsx 文件名.ts`（在 01_API基础/ 里跑，npx 自动向上找根目录 node_modules）
- API 供应商已确认（2026-09-02 用户拍板）：**智谱 GLM，glm-5.3-flash**（原生多模态但纯文本照用；1M 上下文；**强制思考不可关**——文档明示仅支持 enabled，2026-09-02 复核）。第 2 课课件已改智谱主线

## 教学进度

- 2026-08-27：创建 20 小时速通计划，尚未开始第 1 次课
- 2026-08-28：第 1 次课开课。交付（markdown 版）：课件 `lessons/0001-llm-api-stateless-messages.md`（含动笔拼 messages 练习 + 5 题折叠自测）、`reference/chat-completions-cheatsheet.md`（三家供应商接入信息已核实）。早先的 HTML 版课件与 `assets/`（course.css、quiz.js）已按用户要求删除。待用户完成 80 分钟练习并回报后：勾计划 checkbox、写第一条 learning-record、判卷口述复盘题
- 2026-08-29：曾交付一版第 2 课（结构化输出），次日用户要求整体回退，已全部还原（详见 `.workbuddy-ai/memory/2026-08-30.md`）
- 2026-08-30：第 2 次课开课（重做版）。回退原因已向用户确认：当时还没准备上第 2 课（节奏问题，非课件问题）；废纸篓已清空、旧版不可找回，本次全新重写。交付：课件 `lessons/0002-structured-output.md`（以 DeepSeek 为主线；因第 1 课练习未做，§0 内置热身——速通版 ex1 最小调用）、`reference/chat-completions-cheatsheet.md` 加回 §7 结构化输出（三家核实结论沿用 08-29 版）。已知状态：第 1 课 ex1/ex2 练习未做（计划 checkbox 均未勾），第 2 课课件已提示课后补 ex2。待用户完成第 2 课 80 分钟练习并回报后：勾两课 checkbox、写 learning-record、判卷口述复盘题
- 2026-08-30：用户反馈 `<details>` 折叠在其实际查看器（浏览器内 md 预览）里无效——渲染为永远展开。已把第 1、2 课的全部折叠块迁移为独立答案册模式：新增 `lessons/0001-answers.md`、`lessons/0002-answers.md`，课件内改为锚点链接（#sec-1-1 / #hint-N / #qN）。后续课件直接沿用此模式
- 2026-08-30：按用户要求把第 1 课改为 TypeScript：`lessons/0001-llm-api-stateless-messages.md` 全部代码换 `fetch`/`tsx`/`readline`（新增 §0.1 环境搭建），`0001-answers.md` 提示同步，速查表 §6 改双语言代码块（TS 在前，Python 保留）。第 2 课仍为 Python 未动；用户已有的 ex1/ex2 Python 练习文件保留未删
- 2026-08-30：用户问 TS 如何像 Python 一样 debug + 控制台执行函数。已实测（Node 22 + tsx）：tsx REPL 支持 TS 语法/跨行变量/顶层 await；`--inspect-brk` 可转发；macOS `/private` 符号链接导致 `import.meta.filename === process.argv[1]` 失效，需 realpathSync 比较。整理成 `reference/ts-debug-repl.md` 速查表
- 2026-08-31：按用户要求把第 2 课也改为 TypeScript：重写 `lessons/0002-structured-output.md` 全部代码（fetch/tsx，约定对齐第 1 课 TS 版：main() 包裹、AbortSignal.timeout、type Role/interface Message、答案册链接模式），`0002-answers.md` 同步措辞，速查表 §7 去 Python 化。要点：chat() 骨架加 `"thinking": {"type": "disabled"}` + `temperature: 0`（依据 §3.1——DeepSeek V4 默认开思考、思考模式下 temperature 失效）；§1 新增"TS 类型管不到运行时"避坑（贴合本课主题）；热身改为"把用户已完成的 Python ex1 翻译成 TS"。发现用户已完成第 1 课 Python 练习（ex1/ex2/ex2.ipynb，08-30 晚），checkbox/learning-record/判卷仍待用户回报。顺手修正两处过时表述：第 1 课 §0.1（原 npm init 指引——目录名报 Invalid name 且项目已不在那里）、ts-debug-repl §1（项目实际在根目录）。第 2 课 TS 骨架已经 tsx 烟雾测试（转译执行、parseReview 剥围栏/BadJSON、中文键 interface 均通过）
- 2026-08-31：按用户要求把第 1、2 课答案册内容并回课件，改用 Obsidian 折叠 callout（用户确认现在主要在 Obsidian 里看课件）：§1.1 对照答案 → `[!success]-`、任务提示 → `[!tip]-`、自测 Q1–Q5 → `[!question]-`，第 1 课 7 处、第 2 课 6 处；答案册 `0001-answers.md`、`0002-answers.md` 已 `git rm`；§4 复盘措辞同步（"跳到答案册"→"点开折叠"）。上条记录里的"答案册链接模式"自此作废，后续课件直接用折叠 callout 内嵌
- 2026-09-02：第 1 课完成（TypeScript 版）。用户自查清单已自己勾选（带 ✅ 日期）；我勾了计划第 1 课三 checkbox、写了 learning-record `learning-records/0001-llm-api-stateless-messages.md`。⚠️ 安全事件：用户曾在 ex1 硬编码智谱 API key 并推送到**公开** GitHub 仓库（Rager-man/Learn_center，commit 934515d）——ex1/ex2 工作树已改回 process.env 写法（未提交），已提醒 revoke key + 查账单；git 历史清理待用户决定。复盘三题口述待判卷
- 2026-09-02：判卷第 1 课复盘三题：Q2/Q3 过；Q1 差半步（把"删了两条消息"当成不记得的原因、把 messages 说成"返回给 API 的"——实为发给 API 的请求体；"无状态 + 全量重发"待用户重述）。用户拍板智谱主线，第 2 课课件已完成智谱化改造（§0 env/热身改"跑通 ex1"、课前读改智谱结构化输出文档、§2.1 规矩换智谱版、chat() 骨架删 thinking:disabled、任务 1 第 4 步改"招式一二合体"、自查清单/Q2 换智谱题、§5 语言迁移改"顺手改造 api_call"）；速查表 §1 智谱行加 glm-5.3-flash、§7 智谱行按当日核实更新。智谱事实来源：glm-5.3-flash 模型页 / thinking-mode / struct-output 三页官方文档
- 2026-09-02：Q1 重述通过（无状态 / 服务器不存 / 唯一信息来源 = 发过去的历史，三要素齐），第 1 课复盘关闭。下一步：用户做第 2 课练习（课件已智谱化，glm-5.3-flash 强制思考属正常现象）
