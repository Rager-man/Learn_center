// 03_工程与异步/ex18_todo/todo.test.ts —— 骨架（第 9 课 · 任务 1：测试护航）
// 用法：npm test（全仓库）或 npx vitest run TypeScript/03_工程与异步/ex18_todo（只跑本目录）
//
// 剧本：第 8 课的 vitest 三板斧第一次全量上一个真项目。测两层：
//   model 的转移矩阵（纯函数，天生好测——ex16 的矩阵平移）+
//   store 的 parseDb（纯函数：好文本进门、坏文本 null，fs 一点不碰）。
//   cli 和 load/save 里的 fs 部分今天不进测试——它们交给任务 2 的真手实测。
//
// 黑盒照抄（每个测试的骨架）：
//   it("说人话的断言", () => {
//     const t: Task = { status: "todo", id: 1, title: "买牛奶" };  // 夹具自己造
//     expect(startTask(t).status).toBe("doing");
//   });
//   测 throw：expect(() => startTask(done 任务)).toThrow("不能开始")——toThrow 接箭头函数本身。
//
// 规则：每个测试自己造夹具；测行为不测实现；toBe 给原始值、toEqual 给数组对象。

import { describe, it, expect } from "vitest";

describe("todo · 骨架出生", () => {
  it("占位——真测试写进来后，把这条删掉", () => {
    expect(1 + 1).toBe(2);
  });
});

// ======================= 测试区（TODO 10，约 10 分钟）=======================
// TODO 10) 至少 5 条 it，必测清单（判卷对账用）：
//   ① startTask：todo → doing，status 变了 + startedAt 是 string（时间戳别 toEqual 死值）
//   ② finishTask：doing → done，同款
//   ③ 非法转移被拒 ×2：startTask 吃 doing 任务、finishTask 吃 todo 任务——toThrow 人话子串
//   ④ parseDb：好文本（自己 stringify 一份合法 Db）→ 拿得回数据（nextId / tasks 长度）
//   ⑤ parseDb：坏文本 → null（两种坏至少各来一条：语法坏 '{"nextId":3,' 、结构坏 '{"nextId":3,"tasks":[{"id":1,"status":"stuck","title":"x"}]}'）
//   写完删掉上面的占位 describe。
//
// 完成判据：≥5 条 it 全绿、必测清单逐条有主；占位已删；npm test 全仓库绿。
