// 04_进阶与质量/ex16_backfill_tests/array-utils.test.ts —— 骨架（第 8 课 · 任务 1：三件套上保险 + 破坏实验场）
// 用法：npm test   （骨架阶段纯注释零测试，vitest 判 0 test 绿）
//
// 剧本：groupBy / pluck / chunk 搬进模块后，第一次有"官方验收"：分组对不对、空数组怂不怂、
//   边界 n<=0 拦不拦。压轴是破坏实验——故意改坏一处实现，亲眼看哪个测试变红。
//   那一下红，就是"测试是重构的胆量"这句话的体感版：以后每次改代码，都有人替你盯着这一下。
//
// 黑盒照抄：① 文件头两行 import（.js 扩展名 + vitest 三板斧，同隔壁）：
//        import { describe, it, expect } from "vitest";
//        import { groupBy, pluck, chunk } from "./array-utils.js";
//        ② 断言纪律：toBe 只用于原始值（字符串/数字/布尔）——它比的是"同一个值"（===）；
//        数组、对象一律 toEqual——它比"内容相同"。内容相同的两个数组过不了 toBe
//        （课件 §1.1 C 段预测过它的红法：serializes to the same string）。
//
// 规则：先把隔壁 array-utils.ts 迁移完再动本文件；夹具自己造（两三个元素，小而准）；全程禁 as / ！。
import { describe, it, expect } from "vitest";
import { groupBy, pluck, chunk } from "./array-utils.js";
// ======================= 测试区（约 15 分钟）=======================
// TODO 1) describe("groupBy")：至少 2 个 it——
//        ① 基本分组：3 个元素按 keyFn 分成 2 组，toEqual 整个 Record 精确对账
//        ② 空数组：groupBy([], 任意 keyFn) → toEqual({})——"空输入"是必测清单第二条
describe("groupBy", () => {
    it("group function check", () => {
        const groupArr = [
            {id:1, tag:"朋友"},
            {id:2, tag:"朋友"},
            {id:3, tag:"家人"},
            ];
        expect(groupBy(groupArr, g => g.tag)).toEqual({
            "家人" : [{id: 3, tag: "家人"}],
            "朋友" : [{id: 1, tag:"朋友"}, {id: 2, tag: "朋友"}]
        });
    })

    it("空数组分组得到空对象", () => {
        const empty: {id :number; tag:string}[] = [];
        expect(groupBy(empty, g => g.tag)).toEqual({});
    })
})
// TODO 2) describe("pluck")：至少 2 个 it——
//        ① 普通属性：pluck(夹具, 某键) → toEqual([值, 值])
//        ② 可选属性：夹具里故意少一个字段的人，pluck(..., 可选键) 的结果里有 undefined
//           ——第 7 课探针验过的 (string | undefined)[]，今天由断言站岗
describe("pluck", () => {
    it("普通属性测试", () => {
        const groupArr = [
            {id:1, name: "Bob", tag:"朋友"},
            {id:2, name: "Alice", tag:"朋友"},
            {id:3, name: "John", tag:"家人"},
            ]; 
        expect(pluck(groupArr, "id")).toEqual([1, 2, 3]);
    })

    it("可选属性测试", () => {
        const groupArr = [
            {id:1, name: "Bob", tag:"朋友"},
            {id:2, name: "Alice"},
            {id:3, name: "John", tag:"家人"},
            ]; 
        expect(pluck(groupArr, "tag")).toEqual(["朋友", undefined, "家人"]);
    })
})
// TODO 3) describe("chunk")：至少 3 个 it——
//        ① 整除切法：8 个切 4 → 两段整（toEqual 二维数组）
//        ② 尾段不满：7 个切 3 → [3 个, 3 个, 1 个]（ex14 演示过的形状）
//        ③ 边界：chunk(任意数组, 0) → toEqual([])——第 7 课防过的死循环，今天上保险
// ======================= 破坏实验（压轴，判卷重点，一段不能漏）=======================
describe("chunk", () => {
    it("整数切法", () => {
        const numArr = [1, 2, 3, 4, 5, 6, 7, 8];
        expect(chunk(numArr, 4)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8]]);
    })
    it("尾段不满", () => {
        const numArr = [1, 2, 3, 4, 5, 6, 7];
        expect(chunk(numArr, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    })
    it("边界", () => {
        const numArr = [1, 2, 3, 4, 5, 6, 7];
        expect(chunk(numArr, 0)).toEqual([]);
    })
})

// TODO 4) 亲眼看一次红（顺序不能倒）：
//        1. 去隔壁 array-utils.ts 挑一处下手：比如把 chunk 的 i += n 改成 i += n + 1（任何一处逻辑改坏都行）
//        2. npm test → 看哪个 it 红了，读报错里的 expected / received 各是什么
//        3. 把红的那两行（测试名 + AssertionError 那行）抄进下面留痕区
//        4. 改回正确实现，npm test 回全绿——恢复现场，一步不能少
// ======================= 留痕区（判卷证据，写在下面）=======================
// FAIL  TypeScript/04_进阶与质量/ex16_backfill_tests/array-utils.test.ts > chunk > 整数切法
// AssertionError: expected [ [ 1, 2, 3, 4 ], [ 6, 7, 8 ] ] to deeply equal [ [ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ] ]
// FAIL  TypeScript/04_进阶与质量/ex16_backfill_tests/array-utils.test.ts > chunk > 尾段不满
// AssertionError: expected [ [ 1, 2, 3 ], [ 5, 6, 7 ] ] to deeply equal [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7 ] ]

// TODO 5) 四行齐全：
//        改坏的位置：array-utils.ts 的 chunk——把 i += n 改成了 i += n + 1（整改后在新模块上重验，同样两条红后恢复）
//        红的测试：chunk > 整数切法、chunk > 尾段不满（改坏一处，两个 it 一起红）
//        AssertionError 原文（一行即可）：AssertionError: expected [ [ 1, 2, 3, 4 ], [ 6, 7, 8 ] ] to deeply equal [ [ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ] ]
//        恢复后 npm test：Test Files  3 passed (3)
// 完成判据：本文件 ≥7 个 it 全绿 + 两个测试文件合计 ≥8 个 + toBe 与 toEqual 各至少用一次 +
//   破坏实验留痕四行齐全 + 现场已恢复全绿 + tsc 沉默
