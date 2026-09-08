// 04_进阶与质量/ex16_backfill_tests/order-machine.ts —— 骨架（第 8 课 · 任务 1：状态机模块化）
// 用法：npx tsx 04_进阶与质量/ex16_backfill_tests/order-machine.ts   （骨架从出生就是绿的：
//   纯注释无代码，tsx 直跑无输出——而且从今天起"无输出"不再是将就，是模块的美德：
//   一个好模块被 import 时不该有副作用、不该自己打印什么）
//
// 剧本：你在 ex7 写的订单状态机，今天以"模块"身份重生。所谓迁移：把 ex7 里的类型和函数
//   原样搬进这个文件，每个前面加 export（今天唯一的新语法），演示区一个字都不搬——
//   ex7 是第 4 课的结业档案，一行不动；这个文件只住"能力"，不住"表演"。
//   搬完隔壁 order-machine.test.ts 会给它上保险：非法流转、合法流转、终态，逐条验收。
//
// 规则：只搬家不装修——类型与函数体和 ex7 逐字一致，改一个字都算装修；全程禁 as / ！；命名 camelCase。

// ======================= 迁移区（约 5 分钟）=======================
// TODO 1) 从 02_类型建模/ex7_order.ts 迁移四个成员，各加 export：
//        export type OrderStatus = ...
//        export type Order = ...
//        export function assertNever(x: never): never { ... }
//        export function next(order: Order, action: "pay" | "ship" | "cancel"): Order { ... }
//        不搬：TODO 注释、演示区（order1/order2/order3 的故事）、删 case 实验的留痕——
//        那些是"表演"和"档案"，模块只留"能力"。
//        搬完跑 npx tsc --noEmit，应依旧沉默（搬家不动类型，沉默是搬对的证据）。
// TODO 2) 自检一行（写在脑门上，不用写在这）：这个模块被 import 时，会打印东西吗？
//        会发网络请求吗？会改全局变量吗？——都不会，这叫"无副作用"。
//        测试最喜欢的就是这种模块：给它什么输入，它给什么输出，干干净净（课件 §2.4）。
// 完成判据：四个成员全部 export + 与 ex7 逐字一致 + npx tsc --noEmit 沉默 + tsx 直跑无输出
