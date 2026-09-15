// 05_毕业项目/ex19_capstone/src/cli.ts —— 骨架（第 10 课 · 任务 1：导演间）
// 用法：npm run capstone -- <参数>（备课时已在根 package.json 配好 script，-- 后面的参数转交给本文件）
//   例（选 A）：npm run capstone -- octocat
//   例（选 B）：npm run capstone -- 用一句话解释什么是闭包
// 全项目没人 import 本文件——导演不被别人依赖（ex17/ex18 定型）。
//
// 剧本：argv 解析 → 调 api（可能 throw）→ 喂 core → 打印 → exit。
//   每一步都是旧课的家当：argv 是边界（第 6 课 ex13 进口清单第 1 行）、
//   throw 的接法是 ex18 提示 1（catch + instanceof Error 窄化 + 打印人话）、
//   退出码纪律：错误路径 exit 1、正常跑完 exit 0（空库 list 退出码 1 那个案子你亲手验过尸）。
//
// 黑盒照抄（argv 取参）：
//   const [, , arg] = process.argv;   // argv[0]=node、argv[1]=脚本路径、argv[2] 起才是用户的输入
//
// 规则：全程禁 as / ！；命名 camelCase；本文件不许出现第二处 fetch / JSON.parse——
//   网络在 api、解析在 core，导演只编排。

// ======================= 进口区（TODO 6，约 5 分钟）=======================
// TODO 6) argv 解析 + 空输入：
//   取 argv[2]；undefined / 空串 / 纯空格（trim 后为空）→ 打印人话（带用法示例一行）+ process.exit(1)。
//   这就是"空输入"那条错误路径的岗哨——它守在离根因最近的地方（第 6 课 ex13 的老结论）。

// ======================= 编排区（TODO 7，约 10 分钟）=======================
// TODO 7) 主流程编排：
//   选 A：fetchRepos(username) → buildReport → formatReport → 逐行打印 → exit 0
//   选 B：callLlm(prompt) → parseCard：
//        拿到 Card → 打印（字段逐个排版）→ exit 0；
//        parseCard 回 null → withRetry(callLlm + parseCard 再来一轮) → 仍 null
//          → 打印人话（"模型没按要求说话，重试 N 次仍失败"）→ exit 1
//   两版共通：api/core 的 throw 用 try/catch 接，error instanceof Error 窄化后打印 error.message，
//   exit 1——从合同到人话的完整链路，一步不许裸奔。

// 完成判据：空输入有人话 + exit 1；正常路径完整报告 + exit 0；api 的每条错误路径传到用户眼前都是人话；
//   tsc 沉默；npm run capstone -- 实测跑得通（README 验收流水第 1 行的出处）。
