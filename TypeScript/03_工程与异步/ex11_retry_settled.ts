// 03_工程与异步/ex11_retry_settled.ts —— 骨架（第 5 课 · 任务 3：重试函数 + allSettled 报告）
// 用法：npx tsx 03_工程与异步/ex11_retry_settled.ts   （骨架从出生就是绿的）
//
// 剧本：网络请求会失败，失败就再试——retry 是真实世界里最常用的异步工具之一。
//   你要写 retry（失败重试最多 N 次）+ 一个"随机失败"的任务来折磨它；
//   最后 5 个任务丢进 allSettled，输出一份成功/失败报告。
//
// 黑盒照抄（先例：ex6 的 rl）：retry 签名里的 <T> 是"类型的参数"，第 7 课正式讲，
//   今天当黑盒抄——抄的时候你会发现它不影响你写函数体，它只是告诉编译器
//   "返回什么类型，取决于 fn 返回什么类型"。
//
// 规则：全程禁 as / ！；命名 camelCase；报告的失败理由不许直接点 .message——
//   r.reason 的类型是 any，先用 instanceof Error 窄化（第 4 课功夫，本任务判卷眼之二）。

// ======================= 第一幕：随机失败的任务 =======================
// TODO 1) 写 flaky：模拟一个不稳定的服务——
//   async function flaky(name: string, failRate: number): Promise<string>
//   - await sleep(100) 左右（让失败来得像真的网络；sleep 从 ex10 抄过来，或重写一遍练手）
//   - Math.random() < failRate 就 throw new Error(name + " 服务超时")
//   - 否则返回 name + " 成功返回的数据"
//   （failRate: 0.5 = 一半概率失败）

// ======================= 第二幕：retry =======================
// TODO 2) 写 retry——签名照抄：
//   async function retry<T>(fn: () => Promise<T>, times: number): Promise<T>
//   行为：最多尝试 times 次；某次成功就返回它的值；全部失败，把**最后一次**的错误抛出去。
//   提示：for 循环 attempt 从 1 到 times；try 里 return await fn()；catch 里记下错误
//   继续下一轮；循环走完还没 return，说明全败了——throw 记下的那个错误
//   （错误变量注解写 unknown，throw 一个 unknown 变量在 TS 里是允许的）

// TODO 3) 验证 retry 真的在重试：
//   包一个带计数器的 fn —— const countingFlaky = () => flaky("服务A", 0.5) 之前，
//   先在外面 let attempts = 0，箭头函数里 attempts++ 并打印"第 X 次尝试"。
//   然后跑：成功版 await retry(countingFlaky, 4)，打印结果和尝试次数；
//   再跑一个必败版验证边界：await retry(() => flaky("坏服务", 1), 3) —— failRate 1
//   必败，retry 该在第 3 次尝试后把错误抛出来；用 try/catch 接住它，
//   打印"3 次全败，最后错误：xxx"（times = 3 的含义是"总共试 3 次"，不是"重试 3 次+首次"）

// ======================= 第三幕：allSettled 报告 =======================
// TODO 4) 造 5 个任务丢进 allSettled：
//   const results = await Promise.allSettled([
//     retry(() => flaky("服务A", 0.2), 3),
//     retry(() => flaky("服务B", 0.5), 3),
//     retry(() => flaky("服务C", 0.8), 3),
//     retry(() => flaky("服务D", 0.5), 3),
//     retry(() => flaky("服务E", 0.5), 3),
//   ]);
//
// TODO 5) 出报告（判卷眼之一：用 r.status 窄化——第 4 课的判别联合，今天在官方 API 里现身）：
//   先打印总账："5 个任务：成功 X 个，失败 Y 个"
//   再逐条打印：成功 → "✓ 服务名：值"；失败 → "✗ 服务名：理由"
//   提示：results 的类型是 PromiseSettledResult<string>[]——foreach 循环里
//   if (r.status === "fulfilled") 的分支里 r 才有 .value，else 分支里才有 .reason
//   （窄化谁教你的？第 4 课。它就是官方写好的判别联合：status 是判别字段）

// 完成判据：tsc 沉默；成功版/必败版 retry 都有演示输出；报告总账 + 明细齐全；
//   失败理由的打印经过 instanceof Error 窄化（不许裸点 any 的 .message）
