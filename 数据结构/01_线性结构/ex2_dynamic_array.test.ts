// 01_线性结构/ex2_dynamic_array.test.ts —— 骨架（第 1 课 · 任务 2：给动态数组配测试）
// 用法：在 数据结构/ 目录下 npx vitest run（只跑本课程）；仓库根 npm test 则跑全仓库。
//
// 剧本：TS 第 8 课的 vitest 三板斧（describe / it / expect）在数据结构课的第一站。
//   从今天起这门课的纪律是：每个结构测试全绿才准进下一课。
//   下面两个出生自带的 smoke 测试就是照抄模板——你后面写的每个测试都长这个样子。
//
// 黑盒照抄（每个测试的骨架）：
//   it("说人话的断言", () => {
//     const arr = new DynamicArray<number>(4);   // 夹具自己造，测试之间不共享变量
//     expect(arr.length).toBe(0);                // 断言一个可观察的行为
//   });
//   报错断言：expect(() => arr.pop()).toThrow()——toThrow 接"箭头函数"本身，不是调用结果
//   （TS 第 8 课 ex16 的同款规矩，忘了就翻那边对照）。
//
// 规则：每个测试自己造夹具；测行为不测实现——不窥探私有字段，
//   只用 length / capacity / get 这些公开面观察外部可见的变化。

import { describe, it, expect } from "vitest";
import { DynamicArray } from "./ex2_dynamic_array.js"; // ← .js 不是笔误，NodeNext 的规矩（TS 第 8 课讲过）

describe("DynamicArray · 出生自检", () => {
  it("默认容量实例化，初始长度为 0", () => {
    const arr = new DynamicArray<number>();
    expect(arr.length).toBe(0);
  });

  it("指定初始容量生效", () => {
    const arr = new DynamicArray<string>(8);
    expect(arr.capacity).toBe(8);
  });
});

// ======================= 测试区（写一个方法测一个，约 15 分钟）=======================
// TODO 1) describe("push", ...)：
//        ① push 3 个后 length 是 3，get(0..2) 逐个对得上
//        ② 扩容触发：new DynamicArray<number>(2)，push 3 个后 capacity 变 4（翻倍），
//           且前 2 个老数据原样可查——搬家没丢人
//        ③ 连 push 1000 个：length === 1000，capacity ≥ 1000（翻了约 10 次——log 关系）
// TODO 2) describe("pop", ...)：
//        ① push "a" "b" 后 pop() 返回 "b"（尾部后进先出），length 归 1
//        ② 空数组 pop：expect(() => arr.pop()).toThrow()
// TODO 3) describe("get", ...)：
//        ① 合法下标取对值
//        ② get(-1) 与 get(length) 都 toThrow
// TODO 4) describe("insert", ...)：
//        ① 中间插入：push a b c 后 insert(1, "X")，get(0..3) 依次是 a X b c
//        ② insert(length, x) 合法，等价 push
//        ③ insert(length + 1, x) toThrow
// TODO 5) describe("remove", ...)：
//        ① remove(1) 返回被删的那个，之后的元素前移补位（get 逐个验证）
//        ② 越界 toThrow
// 完成判据：≥ 2 个 describe 全绿 + describe / it 的名字连起来读像句子（红的时候一眼看出哪坏了）+ tsc 沉默
