// 01_API基础/ex1_minimal_call.ts —— 起步骨架
// 单轮最小调用：亲手拼出整个请求，看清每一层

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

  console.log(resp.status);
  console.log(JSON.stringify(await resp.json(), null, 2));
}
main();