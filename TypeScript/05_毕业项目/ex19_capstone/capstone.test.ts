// 05_毕业项目/ex19_capstone/capstone.test.ts —— 骨架（第 10 课 · 任务 1：测试护航）
// 用法：npm test（全仓库）或 npx vitest run TypeScript/05_毕业项目（只跑本目录）
//
// 剧本：硬性要求第 3 条的 ≥5 条 it 全住这。老规矩（第 8 课定的）：优先测纯函数——
//   core 间的两个函数 + schema 合同放行/拦截，就是"改坏了会怕的地方"。
//   api 间的网络部分不进测试（vitest 里发真请求 = 又慢又不稳）——它交给 README 的验收流水。
//
// 黑盒照抄（夹具自己造 + 两个骨架）：
//   it("说人话的断言", () => {
//     const repo: Repo = { name: "demo", language: null, pushed_at: "2026-01-01T00:00:00Z", html_url: "https://github.com/x/demo" };
//     expect(buildReport([repo]).total).toBe(1);
//   });
//   测 throw：expect(() => fn(坏输入)).toThrow("人话子串")——toThrow 接箭头函数本身（ex16）。
//   测 async 的 withRetry：await expect(withRetry(必败假函数, 3)).rejects.toThrow("……")——
//   假函数自己造：let calls = 0; const fail = async () => { calls++; throw new Error("必败"); }，
//   rejects 之后还能 expect(calls).toBe(3)——重试边界（"共尝试 3 次"）一起验了。
//
// 规则：每个测试自己造夹具；测行为不测实现；toBe 给原始值、toEqual 给数组对象；
//   本文件不许 import api（不发网络请求）。

import { describe, it, expect } from "vitest";

// ======================= 测试区（TODO 8，约 10 分钟）=======================
// TODO 8) 至少 5 条 it，必测清单（判卷对账用）：
//   ① 主纯函数 · 好数据：选 A buildReport（总数、latest 取最大 pushed_at、分布数字对）
//      / 选 B parseCard（合法 JSON 且字段齐 → 拿得回 Card）
//   ② 主纯函数 · 坏数据：选 B 两种坏各一条（语法坏 '{"term":' / 结构坏 '{"term":123}'）→ null；
//      选 A 造"字段缺"的坏仓库对象喂 schema → 拦下
//   ③ 边界：选 A 空数组 → total 0 + latest undefined（这个分支最容易漏）；
//      选 B 合法 JSON 但不是对象（'"3"'）→ null——第 9 课学有余力③的"结构层坏"刷新版
//   ④ 副纯函数：选 A formatReport 行数/关键字 / 选 B withRetry 必败 3 次 → rejects + 调用数 3
//   ⑤ schema 合同：null 过 nullable 放行一条 + 坏类型拦一条
//   写完删掉下面的出生占位。

describe("capstone 出生占位", () => {
  it("写真测试前保持绿（TODO 8 完成后删掉本条）", () => {
    expect(true).toBe(true);
  });
});

// 完成判据：≥5 条 it 全绿、必测清单逐条有主；占位已删；npm test 全仓库绿（报数剔除数据结构课 2 条 + todo 6 条）。
