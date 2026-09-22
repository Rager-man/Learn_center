# 数据结构课程 · 导师备忘

> 给 AI 导师的工作记忆：记录学员进度、踩过的坑、已纠正的观念。每次课后更新，新课开工前先读这份。

## 学员档案

- 背景：Python 基础起步，TypeScript 课已学到第 8 课（strict、泛型、vitest 三板斧均已在手）。中文交流，术语保留英文。Obsidian 用户。
- 环境：macOS，Node 22，工作区 `/Users/clock1/Project/Learn_center/数据结构`（npm 项目在仓库根，TypeScript 7.0.2 + vitest 5 + tsx；课程目录自带 tsconfig：strict / noEmit / NodeNext，与 TS 课同款）。
- TS 课已确立的教学约定原样继承：全程禁 as / !；camelCase；整改清单原子化（一个点一个编号、带行号带改法）；任务布置到文件级（学员曾把答案写错文件）。
- 本课新增纪律（每次判卷的硬门禁）：**每个方法注释标复杂度**——标不出来的方法等于没写懂。

## 进度总览

- **第 1 课 · 开工（2026-09-09）**：课件与骨架已备（`lessons/0001` + `01_线性结构/` 三件，全绿出生：tsc 沉默、2 个 smoke 测试绿、tsx 直跑静默）。备课要点：ex1 六段覆盖 O(1)/O(log n)/O(n)/O(n log n)/O(n²) 五档 + shift 陷阱段——第 2 段（常数次循环）与第 6 段（一层循环的 O(n²)）是两处反直觉题；ex2 主线是均摊分析（resize 定为 private，capacity getter 供测试观察扩容）；vitest 首次在数据结构课落地，test 骨架内嵌"黑盒照抄"模板与出生 smoke 测试。课件 §1.1 四个动笔预测的参考数字均备课实测（2026-09-09，本机）：push 1.4ms vs unshift 558ms（≈400 倍）、shift 558ms vs pop 1ms（≈600 倍）、includes 74ms vs Set.has 0.6ms（≈130 倍）、100 万次 push 含 359 个尖刺且间隔递增（V8 扩容证据）。判卷时留意：学员对"均摊 ≠ 平均"的区分是本课最可能含糊的点；先扫 import 区与复杂度注释齐全性，再逐方法对账。
