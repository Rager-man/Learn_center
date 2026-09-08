// 04_进阶与质量/ex17_weather_split/src/api.ts —— 骨架（第 8 课 · 任务 2：天气 CLI 拆分 · 网络层）
// 用法：被 cli.ts import（模块天生安静：npx tsx 直跑无输出）
//
// 剧本：ex12 的 url 模板 + fetch + res.ok 检查 + res.json() 搬进这间屋。它对外的全部承诺
//   就一个函数：fetchWeather(lat, lon)——给我坐标，还你一个 unknown。
//   为什么返回 unknown 不是 Weather？因为"信不信这份数据"是 schema 的职责，
//   api 只管"把数据搬回来"——职责分居，各住各屋。
//
// 黑盒照抄：① 本文件零 import——只用到全局 fetch（Node 22 自带，不用装任何包）。
//   ② 路径 2 的打印与 process.exit(1) 原样搬进 fetchWeather（不 ok 就打印 + 体面退出）——
//   搬家后行为必须和 ex12 逐字节一致，别手痒改成 throw（throw 版会被 cli 的 catch 打上
//   "路径 1 或 3"前缀，关卡就分不清了——备课实测踩过这个坑，你别再踩）。
//
// 规则：只搬家不装修；全程禁 as / ！。

// ======================= 迁移区（约 5 分钟）=======================
// TODO 1) 从 ex12 迁移并组装：
//        const url = (lat: number, lon: number): string => `...`（原样搬，不加 export——
//          URL 怎么拼是这间屋的私事，外人不需要知道）
//        export async function fetchWeather(lat: number, lon: number): Promise<unknown> {
//          // ① const res = await fetch(url(lat, lon))
//          // ② 不 ok：打印"路径 2"那句 + process.exit(1)（文案与 ex12 逐字一致）
//          // ③ return res.json()
//        }
//        对比：ex12 里这三步散在 try 块顶层；现在它们有了一个有名字的家。
// 完成判据：url 不 export、fetchWeather export 且返回 Promise<unknown> + tsc 沉默 + tsx 直跑无输出
