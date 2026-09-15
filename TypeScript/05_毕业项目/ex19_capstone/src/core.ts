// 05_毕业项目/ex19_capstone/src/core.ts —— 骨架（第 10 课 · 任务 1：纯核间——测试住这）
// 用法：被 cli.ts / capstone.test.ts import（模块天生安静）。这间屋不碰网络、不碰 argv、不打印——
//   正因为什么都不碰，它才是全项目唯一"vitest 扫得动"的间（硬性要求第 3 条的 ≥5 条 it 全住这）。
//
// 剧本：第 8 课的结论——"优先测纯函数"。网络交给 api 间，这间住把数据变成结论的纯函数。
//   选 A 的 buildReport 是第 7 课 countByTag 的表亲（Record<string, number> 又回来了）；
//   选 B 的 parseCard 就是 ex18 parseDb 的原样平移——两层坏两种药，你上礼拜刚写过。
//
// 黑盒照抄（选 A：语言分布的骨架，null 计入"未标注"）：
//   const languageDist: Record<string, number> = {};
//   for (const repo of repos) {
//     const lang = repo.language ?? "未标注";        // ← ?? 的主场：null 归 "未标注"
//     languageDist[lang] = (languageDist[lang] ?? 0) + 1;
//   }
//
// 黑盒照抄（选 B：两层坏，ex18 parseDb 原样搬）：
//   try {
//     const raw: unknown = JSON.parse(text);        // 语法层：throw 直接炸 → catch
//     const r = cardSchema.safeParse(raw);          // 结构层：语法合法但内容不合同 → 拦
//     return r.success ? r.data : null;
//   } catch {
//     return null;
//   }
//
// 规则：全程禁 as / ！；命名 camelCase；本间不 import api / cli（依赖只往"更纯"的方向流）。

// ======================= 主纯函数（TODO 4，约 10 分钟）=======================
// TODO 4) 选一：
//   选 A：export function buildReport(repos: Repo[]): Report
//     —— Report 自己建模（type Report = { total: number; latest: Repo | undefined;
//        languageDist: Record<string, number> }，放本文件顶上）：
//        total = 长度；latest = pushed_at 最大的那条（reduce，ISO 串字典序比较，
//        空数组 → undefined——这个分支测试要摸到）；languageDist 照黑盒骨架。
//   选 B：export function parseCard(text: string): Card | null
//     —— 两层坏都回 null 不裸崩（黑盒照抄）。注意 LLM 的 content 可能裹着 ```json 围栏，
//        想处理的先 trim/剥壳再 parse——剥壳放这层，不放 cli。

// ======================= 副纯函数（TODO 5，约 10 分钟）=======================
// TODO 5) 选一：
//   选 A：export function formatReport(report: Report): string[]
//     —— 报告每行一个元素（总数 / 最近推送：时间+仓库名 / 语言分布排行）。
//        返回 string[] 而不是直接 console.log：打印是 cli 的事，"排版"才是可测的纯函数。
//   选 B：export async function withRetry<T>(fn: () => Promise<T>, times: number): Promise<T>
//     —— ex11 的 retry 原样搬（第 5 课黑盒转正，第 7 课泛型转正）：
//        失败最多重试 times 次，全败 throw 最后一个错误。fn 是参数——这间屋照样不碰网络，
//        测试里喂个"随机失败/必败"的假 fn 就能扫重试边界（times=3 全败 = 共尝试 3 次）。

// 完成判据：选 A 的空数组分支、选 B 的两层坏分支都写得出来且测得到；
//   tsc 沉默；直跑无输出；本文件 import 区最多只有 schema（拿类型）。
