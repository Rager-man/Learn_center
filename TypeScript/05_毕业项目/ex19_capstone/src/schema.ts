// 05_毕业项目/ex19_capstone/src/schema.ts —— 骨架（第 10 课 · 任务 1：合同间）
// 用法：被 api.ts / core.ts / cli.ts / capstone.test.ts import（模块天生安静：npx tsx 直跑无输出）
//
// 剧本：这间屋只住"合同"——zod schema 是运行时的合同，z.infer 推出来的类型是编译期的合同，
//   一份声明锁两头的模式，第 6 课定型、第 9 课 ex18 刚用熟。毕业项目换宾语不换招：
//   选 A 锁的是 GitHub 的仓库条目，选 B 锁的是 LLM 的响应壳 + 结构化输出。
//   第 9 课的"过桥费"别忘了：zod 推断出的类型交给手写注解核对——schema 少个字段，桥那头先红。
//
// 黑盒照抄（文件头，TODO 1 第一步）：
//   import { z } from "zod";
//
// 规则：全程禁 as / ！；命名 camelCase；schema 字段名跟 API 真实字段走（GitHub 是 snake_case
//   的世界——pushed_at 不是 pushedAt，合同如实照抄，别替 API 改名）。

// ======================= 合同区（TODO 1，约 10 分钟）=======================
// TODO 1) 按你在 REQUIREMENTS.md 勾的选项定稿合同——两段草样都在下面，选一删一。
//
// —— 选 A（GitHub 仓库体检）留这段（字段是备课实测 2026-09-15 的真实形状）——
//   const repoSchema = z.object({
//     name: z.string(),                    // 仓库名
//     language: z.string().nullable(),     // ← 实测：octocat 名下 8 个仓库，5 个 language 是 null！
//     pushed_at: z.string(),               // ISO 时间串，字典序 = 时间序（比大小不用转 Date）
//     html_url: z.string(),
//   });
//   export type Repo = z.infer<typeof repoSchema>;      // 过桥费：类型从合同来，不手写第二份
//   export const repoListSchema = z.array(repoSchema);  // 整张列表的合同（safeParse 用它）
//
// —— 选 B（AI 调用加固器）留这段（两份合同：外壳 + 内容）——
//   const llmResponseSchema = z.object({               // ① 响应壳：只要 choices[0].message.content
//     choices: z.array(z.object({ message: z.object({ content: z.string() }) })),
//   });
//   export type LlmResponse = z.infer<typeof llmResponseSchema>;
//   const cardSchema = z.object({                      // ② 结构化输出：字段按你的 5 行需求改
//     term: z.string(),
//     definition: z.string(),
//     example: z.string(),
//   });
//   export type Card = z.infer<typeof cardSchema>;     // 加固对象：LLM 吐的 JSON 必须长这样才算数

// 完成判据：合同与 API 真实字段一致（选 A 的 language 可空！）；类型全部 z.infer 过桥而来；
//   npx tsc --noEmit 沉默；npx tsx 直跑本文件无输出。
