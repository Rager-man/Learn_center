// 03_工程与异步/ex10_serial_concurrent.ts —— 骨架（第 5 课 · 任务 2：串行 vs 并发计时）
// 用法：npx tsx 03_工程与异步/ex10_serial_concurrent.ts   （骨架从出生就是绿的）
//
// 剧本：三个 mock 任务分别要跑 300 / 500 / 800 毫秒。你先用直觉写下预期的两个总耗时
//   （串行多少？并发多少？），再各跑一遍计时对照——"体感"就是靠数字长出来的。
//   最后有一道思考题，验证今天 §2.4 最反直觉的那个事实。
//
// 规则：全程禁 as / ！；命名 camelCase；计时用 Date.now()。

// TODO 1) 预测先行（没跑之前写，写完不许改）：把你的预测写在这两行注释里——
//   串行版预期总耗时：约 ____ ms；并发版预期总耗时：约 ____ ms
//

// TODO 2) 写 sleep：把 setTimeout 包装成 Promise——今天的地基，就一行
//   function sleep(ms: number): Promise<void> { ... }
//   提示：new Promise((resolve) => { setTimeout(?, ?) })  —— setTimeout 的第一个参数
//   就是"时间到了该干的事"，把它交给 resolve

// TODO 3) 三个 mock 任务（模拟三次网络请求，各自的时长不同）：
//   任务A 300ms、任务B 500ms、任务C 800ms——每个都 async，开始时打印"[名字] 开始"，
//   结束时打印"[名字] 结束"。三个任务写成三个独立的函数（taskA/taskB/taskC），
//   别在函数里 console.log 耗时——耗时由外面的计时器统一算

// TODO 4) 串行版：t0 = Date.now() 起，三个任务一个 await 完再 await 下一个，
//   打印"串行总耗时：xxx ms"

// TODO 5) 并发版：三个任务**先全部创建**（存进三个变量），再 Promise.all 一起 await，
//   打印"并发总耗时：xxx ms"
//   注意写法顺序：const pa = taskA(); const pb = taskB(); const pc = taskC();
//   然后 await Promise.all([pa, pb, pc])——为什么必须先创建再 all？跑完思考题你就懂了

// TODO 6) 思考题（先预测再跑）：不开 all——
//   const slow = taskC();      // 创建 800ms 的任务
//   await sleep(200);          // 先去干等 200ms
//   await slow;                // 再等 slow
//   从创建到 await 完，总共过了多少 ms？____
//   如果 slow 是"被 await 时才开始跑"，总耗时该是多少？____
//   把两个数字和一句结论写进下面的留痕：

// 思考题留痕：
//

// 完成判据：串行 ≈ 1600、并发 ≈ 800（±50ms 都算达标）；思考题的实测数字 + 一句结论
//   （结论就一句话：Promise 是什么时候开始跑的？）
