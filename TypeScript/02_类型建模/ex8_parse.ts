// 02_类型建模/ex8_parse.ts —— 骨架（第 4 课 · 任务 2：手写解析器）
// 用法：npx tsx 02_类型建模/ex8_parse.ts   （从出生就是绿的）
//
// 剧本：老系统导出的订单 JSON，amount 一律是字符串（"128.5"）——把它安全加工成 Order。
//   守卫认数据（isOrderStatus），解析器造数据（parseOrder）——§2.5 的分工，两个都写。
//   注意：本文件的 Order 和 ex7 的形状一致但各自定义（amount: number 等四变体）——
//   这份重复第 8 课拆模块时正式消灭，今天先各自为政。
//
// 第 3 课 ex6 欠下的坑今天正式补考：Number("") === 0——空串能"成功"解析成 0，
// NaN 检查抓不住它，必须自己拦（见 TODO 2 第 4 行）。
//
// 规则：全程禁 as（一个都不许，in 的窄化够用）；禁 ！；命名 camelCase。

// TODO 1) 类型图纸（和 ex7 相同的形状）+ 小守卫：
//   type OrderStatus = ...（四个字面量）
//   type Order = ...（四个变体：pending/paid/shipped/cancelled，amount: number）
//   function isOrderStatus(x: unknown): x is OrderStatus { ... }
//   —— 你第一次亲手写类型谓词：return 里写它认的证据（字面量比较）

// TODO 2) 解析器（守门员风格：每层不过就 return undefined）：
//   function parseOrder(data: unknown): Order | undefined
//   逐层顺序（漏斗的形状）：
//     1. typeof data 是 "object" 且不是 null——否则 undefined
//     2. "status" in data 且 isOrderStatus(data.status)——否则 undefined
//     3. "amount" in data 且 typeof data.amount === "string"——否则 undefined（老系统的字符串金额）
//     4. ★坑：amountText.trim() === "" 就 undefined——Number("") === 0，空串不许静默变 0
//     5. Number(amountText) 之后 Number.isFinite 为 false（"abc" 之类）就 undefined
//     6. 按 data.status 逐支检查独有字段：
//        pending 直接造；paid 查 paidAt；shipped 查 paidAt + trackingNo；cancelled 查 reason
//        （每项都是 "xx" in data + typeof 是 "string"）
//     7. 全过之后：return { status: ..., amount: ... } —— 造一个全新的、类型属实的对象
//   提示："status" in data 之后才能点 data.status（类型 unknown）；isOrderStatus 一过它就是 OrderStatus

// ======================= 数据与演示区（TODO 3）=======================
// 好数据：结构齐全，amount 是字符串——解析成功后它应该是数字 128.5
const goodPaid: unknown = JSON.parse('{"status":"paid","amount":"128.5","paidAt":"2026-09-03T10:00:00Z"}');

// 坏数据三组（每组被拒的理由都不同）：
const bad1: unknown = JSON.parse('{"status":"refund","amount":"9.9"}');      // 坏 1：非法状态（refund 不在四个字面量里）
const bad2: unknown = JSON.parse('{"status":"paid","amount":"88"}');         // 坏 2：paid 缺 paidAt
const bad3: unknown = JSON.parse('{"status":"pending","amount":""}');        // 坏 3：空串金额（★第 3 课的坑，判卷眼）

// TODO 3) 演示区：
//   - parseOrder(goodPaid) → 打印结果，确认 amount 是数字 128.5（不是字符串 "128.5"）
//   - parseOrder(bad1 / bad2 / bad3) → 各打印一行，全部是"已拒绝"（?? "已拒绝" 兜底）
//   - 学有余力：再造一条 pending / shipped / cancelled 的合法数据各验一遍；
//     再喂 JSON.parse('不是JSON') 试试——它直接 throw，这条错误路径第 6 课正式处理，今天知道即可
// 完成判据：npx tsc --noEmit 沉默 + 好数据 amount 是数字 + 三组坏数据全被拒 + 全程没写 as
