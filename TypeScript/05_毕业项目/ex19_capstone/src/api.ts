// 05_毕业项目/ex19_capstone/src/api.ts —— 骨架（第 10 课 · 任务 1：网络间）
// 用法：被 cli.ts import（模块天生安静）。这间屋是全项目唯一碰网络的地方——
//   ex17 的分工原样适用：schema（合同）谁也不 import；api import schema；cli import 全部。
//
// 剧本：第 6 课 ex12 的三条错误路径（断网 reject / 非 2xx 查 res.ok / 响应坏）在这里全部营业。
//   毕业升级版：错误的人话统一在这里 throw，cli 只负责接（instanceof Error 窄化后打印 + exit 1）——
//   ex18 提示 1 的链路（model throw 人话 → cli catch → 用户看见）平移到网络边界。
//
// 黑盒照抄（选 A——GitHub，2026-09-15 备课实测过）：
//   const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
//     headers: { Accept: "application/vnd.github+json", "User-Agent": "capstone-cli" },
//   });
//   实测备忘：用户不存在 → res.ok=false、status=404、fetch 不 reject，body 是
//   {"message":"Not Found","documentation_url":"...","status":"404"}——合法 JSON！
//   只看"parse 成不成"不查 res.ok，错误对象会被当数据使。
//
// 黑盒照抄（选 B——LLM，AI_agent 第 1 课 ex1 的调用骨架，原样搬来）：
//   const resp = await fetch(`${baseUrl}/chat/completions`, {
//     method: "POST",
//     headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
//     body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
//     signal: AbortSignal.timeout(60_000),      // 60 秒超时（AbortSignal 是第 6 课黑盒，照抄即可）
//   });
//   注意：ex1 原文的 `process.env.LLM_API_KEY!` 那三个 `!` 一个都不许带来——见 TODO 3。
//
// 规则：全程禁 as / ！；命名 camelCase；网络只准住这间（cli 不许直接 fetch）。
// ======================= 调用区（TODO 2，约 10 分钟）=======================
// TODO 2) 主调用函数，选一（骨架给签名，错误路径细节在 TODO 3）：
//   选 A：export async function fetchRepos(username: string): Promise<Repo[]>
//     —— fetch（黑盒照抄）→ 查 res.ok → res.json() → repoListSchema.safeParse → 好数据 return
//   选 B：export async function callLlm(prompt: string): Promise<string>
//     —— env 三兄弟（TODO 3）→ fetch（黑盒照抄）→ 查 resp.ok → resp.json()
//       → llmResponseSchema.safeParse → 拿 choices[0].message.content（string）return
//   两个版本都是"进门就验"：safeParse 成功之前，手里只许是 unknown。
import { repoListSchema, type Repo } from "./schema.js"

export async function fetchRepos(username: string): Promise<Repo[]> {
    let res: Response;
    try {
        res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
            headers: { Accept: "application/vnd.github+json", "User-Agent": "capstone-cli" },
        });
    } catch {
        throw new Error("网络不通：检查网络后重试");
    }
    if (!res.ok) {
        if (res.status === 404) {
            throw new Error(`用户 ${username} 不存在（HTTP 404）：检查用户名拼写`);
        }
        if (res.status === 403) {
            throw new Error("GitHub 免登录限额用完（HTTP 403，60 次/小时）：一小时后再试");
        }
        throw new Error(`GitHub 返回了异常状态（HTTP ${res.status}）`);
    }
    const data: unknown = await res.json();
    const parsed = repoListSchema.safeParse(data);
    if (!parsed.success) {
        const detail = parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("；");
        throw new Error(`数据结构不对（zod 拦下）：${detail}`);
    }
    return parsed.data;
}
// ======================= 错误路径区（TODO 3，约 10 分钟）=======================
// TODO 3) 三条错误路径每条 throw 人话（"人话"= 用户看了知道下一步干什么）：
//   ① 断网：fetch reject → try/catch 接住 → throw new Error("网络不通：检查网络后重试")
//   ② 非 2xx：选 A 把 404（用户名不存在）和 403（免 token 限额 60 次/小时）分开说；
//      选 B 是 resp.status + 一句提示（401 = key 不对、429 = 限额）
//   ③ 数据坏：safeParse 不成功 → throw（把 zod 报错的 path/message 拼进人话——
//      备课实测 zod 对 null 的原文：`language: Invalid input: expected string, received null`）
//   选 B 追加：env 三兄弟校验——process.env.LLM_API_KEY 的类型是 string | undefined，
//   窄化后缺谁报谁的名（"环境变量 LLM_API_KEY 没设置——AI_agent 第 1 课 §0 设置过"），
//   这就是 `!` 的合法替代：! 是"我赌它在"，校验是"我查过它在"。

// 完成判据：三条错误路径条条 throw 人话（选 B 四条含 env）；好路径返回的数据已经过合同；
//   本文件没有任何 console 打印（打印是 cli 的事）；tsc 沉默；直跑无输出。
