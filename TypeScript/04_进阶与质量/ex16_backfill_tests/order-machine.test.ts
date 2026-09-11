// 04_进阶与质量/ex16_backfill_tests/order-machine.test.ts —— 骨架（第 8 课 · 任务 1：给状态机上保险）
// 用法：npm test   （在 TypeScript/ 目录跑也行——npm 会自己向上找到仓库根的 package.json。
//   文件名 *.test.ts 是暗号：vitest 靠它认出"这是测试"。骨架阶段纯注释零测试，vitest 判 0 test 绿）
//
// 剧本：第 4 课你"删 case 看红"验收过穷尽检查——那是编译期的岗哨。今天给运行时也配岗哨：
//   非法流转必须被拒（throw）、合法流转必须到位、终态必须纹丝不动。写完的瞬间，
//   ex7 那个状态机就从"演示能跑"升级成"有人站岗"——以后谁改坏它，npm test 当场翻脸。
//
// 黑盒照抄：① 文件头两行 import——
//        import { describe, it, expect } from "vitest";
//        import { next, type Order } from "./order-machine.js";
//        （第二行的 .js 不是笔误，是 NodeNext 的规矩，漏了报 TS2835——课件 §1.1 A 段刚预测过；
//         type Order 是"只搬类型、不搬值"的写法——测试里要给夹具写注解，用它）
//
// 规则：先把隔壁 order-machine.ts 迁移完再动本文件（import 要有东西可 import）；
//   每个测试自己造夹具，不共享变量；全程禁 as / ！。
import { describe, it, expect } from "vitest";
import { type Order, next } from "./order-machine.js";
// ======================= 测试区（约 20 分钟）=======================
// TODO 1) describe("next", ...) 里至少 4 个 it（必测清单，判卷逐条对账）：
//        ① pending + pay → status 变 "paid"：expect(result.status).toBe("paid")
//        ② paid + cancel → status 变 "cancelled"（先 pay 一下，再 cancel）
//        ③ 非法流转被拒：expect(() => next(待付订单, "ship")).toThrow("非法流转")
//           ——注意 toThrow 接的是"函数"本身，不是调用结果（课件 §2.3 讲为什么）
//        ④ 终态不可再动：对 shipped 或 cancelled 再来任何动作，都被 toThrow 拦下
//        夹具自己造、别抄 ex7 的 128.5：const pending: Order = { status: "pending", amount: 42 };
//        paidAt / trackingNo 是运行时生成的（时间戳、随机数）——不可控的值不测内容，
//        测它在不在、是什么类型（typeof === "string"）——"测行为不测实现"的第一课。
// 完成判据：≥4 个 it 全绿 + describe/it 的名字连起来读像句子（红的时候一眼看出哪坏了）+ tsc 沉默
const allActions: ("pay" | "ship" | "cancel")[] = ["pay", "ship", "cancel"];
describe ("next(订单状态机)", () => {
    // --- test 1
    it("pending + pay -> paid", () => {
        const pending: Order = {status: "pending", amount: 42};
        const result = next(pending, "pay");
        expect(result.status).toBe("paid");
    })
    // --- test 2
    it("paid + cancel -> cancelled", () => {
        const paid: Order = {status: "paid", amount: 42, paidAt:new Date().toISOString()};
        const result = next(paid, "cancel");
        expect(result.status).toBe("cancelled")
    })
    // --- test 3
    it("pending + ship -> reject", () => {
        const pending: Order = {status: "pending", amount: 42};
        expect(() => next(pending, "ship")).toThrow("非法流转")
    })
    // --- test 4
    it("shipped + any -> reject", () => {
        const shipped:Order = {status: "shipped", amount:42, paidAt:new Date().toISOString(), trackingNo:"011"};
        for(const action of allActions) {
            expect(() => next(shipped, action)).toThrow("非法流转");
        }
    })
    // --- test 5
    it("cancelled + any -> reject", () => {
        const cancelled:Order = {status: "cancelled", amount:42,  reason:"不要了"};
        for(const action of allActions) {
            expect(() => next(cancelled, action)).toThrow("非法流转");
        }
    })
    // --- test 6
    it("paid + ship -> shipped", () => {
        const paid :Order = {status: "paid", amount:100, paidAt:new Date().toISOString()};
        const result = next(paid, "ship");
        expect(result.status).toBe("shipped");
    })
    // --- test 7
    it("paid + pay -> reject", () => {
        const paid :Order = {status: "paid", amount:100, paidAt:new Date().toISOString()};
        expect(() => next(paid, "pay")).toThrow("非法流转")
    })
    // --- test 8
    it("pending + cancel -> reject", () => {
        const pending :Order = {status: "pending", amount:100};
        expect(() => next(pending, "cancel")).toThrow("非法流转")
    })
});