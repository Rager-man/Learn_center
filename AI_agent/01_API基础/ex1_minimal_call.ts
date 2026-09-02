// 01_API基础/ex1_minimal_call.ts —— 起步骨架（第 1 课 · 任务 1：最小调用）✅ 2026-09-02 完成
// 用法：npx tsx 01_API基础/ex1_minimal_call.ts   （单轮请求，出生即绿）
//
// 剧本：单轮最小调用——亲手拼出整个请求，把响应的每一层看清楚。
// 亮点（学员产出）：骨架外自加两行打印 typeof content——第 2 课"content 是字符串"的伏笔。
// 完成判据（已达成）：五个字段（id / model / choices / finish_reason / usage）口述得出作用；
//   实验 A（system 文言文）、实验 B（max_tokens: 10 截断）完成

const BASE_URL = process.env.LLM_BASE_URL!;   // §0 设置的环境变量
const API_KEY  = process.env.LLM_API_KEY!;    // 末尾的 ! 表示"我确定它已设置"
const MODEL    = process.env.LLM_MODEL!;      // 智谱：glm-5.3-flash

async function main() {
  const resp = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: "用一句话解释什么是 token" }],
    }),
    signal: AbortSignal.timeout(60_000),      // ← 60 秒超时
  });

  const data = await resp.json();
  console.log(resp.status);
  console.log(JSON.stringify(data, null, 2));

  const content = data.choices[0].message.content;
  console.log(typeof content);
}
main();