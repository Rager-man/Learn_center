// 02_类型建模/ex7_order.ts —— 骨架（第 4 课 · 任务 1：订单状态机）
// 用法：npx tsx 02_类型建模/ex7_order.ts   （本文件从出生就是绿的，tsc 沉默开工——今天不是修红，是建模型）
//
// 剧本：订单的一生（状态机，同一时刻只能处于一个状态）
//
//     pending ──pay──▶ paid ──ship──▶ shipped（终态）
//                        └──cancel──▶ cancelled（终态）
//
//   字段的"户口"规则：amount 全程都在；paidAt 只在付过之后存在；
//   trackingNo 只在发过之后存在；reason 只在取消之后存在。
//
// 反面教材（只作对照，别学它——§2.1 的 8 格账算过它的亏）：
//   interface BadOrder { amount: number; isPaid: boolean; isShipped: boolean; isCancelled: boolean; }
//   三个 boolean 拼出 8 种组合，"没付钱就发货""又发货又取消"这些荒唐状态它一个都拦不住。
//
// 规则：全程禁 as / ！；命名一律 camelCase（从本课起判卷标准）。

// TODO 1) 定义 OrderStatus 与 Order 判别联合（四个变体，形状照"户口"规则和剧本）：
//   type OrderStatus = ...
//   type Order = ...

// TODO 2) 哨兵函数（穷尽检查的主角，§2.3）：
//   function assertNever(x: never): never { ... }

// TODO 3) 状态机：
//   function next(order: Order, action: "pay" | "ship" | "cancel"): Order
//   - pending + pay   → paid（补 paidAt：new Date().toISOString()）
//   - paid   + ship   → shipped（补 trackingNo：自己造一个，如 "SF" + 六位随机数）
//   - paid   + cancel → cancelled（补 reason：写死一句也行）
//   - 其余组合全是非法流转：throw new Error，信息说清"什么状态想干什么"
//   - switch (order.status) 四个 case 全写，default 交给 assertNever——这就是穷尽检查
//   - 提示：case 里 order 已收窄成那一支，{ ...order, status: "paid", paidAt } 恰好一个不多一个不少

// ======================= 演示区（TODO 4，写完上面再动手）=======================
// TODO 4) 把订单的一生走一遍：
//   - 第一单：从 { status: "pending", amount: 128.5 } 出发，pay → 打印 → ship → 打印
//     （想点 trackingNo？先想想为什么 next 的返回类型让你必须重新窄化——§3 提示 2）
//   - 第二单：pay 后 cancel → 打印
//   - 非法流转也要演示：对 pending 直接 ship——用 try/catch 接住 throw，打印错误信息（错误路径有人接）
// 完成判据：npx tsc --noEmit 沉默 + 演示区完整跑完订单的一生（含非法流转被拒）

// TODO 5) 删 case 实验（穷尽检查的验收，做完恢复现场）：
//   1. 把 case "cancelled"（或任一 case）整段删掉
//   2. npx tsc --noEmit —— 看编译器怎么骂你（错误码 TS____，报错念的是谁？）
//   3. 把报错原文（连错误码）贴到下一行注释后面（截图存本目录也行）：
//      >
//   4. 恢复删掉的 case，确认回到 0 error
