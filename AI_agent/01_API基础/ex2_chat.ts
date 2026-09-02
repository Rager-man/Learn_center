const BASE_URL = process.env.LLM_BASE_URL!;   // 末尾的 ! 表示"我确定它已设置"
const API_KEY  = process.env.LLM_API_KEY!;
const MODEL    = process.env.LLM_MODEL!;

type Role = "system" | "user" | "assistant";
interface Message { role: Role; content: string }
import { createInterface } from "node:readline/promises";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const llm_messages: Message[] = [
  { role: "system", content: "你是一个Palantir高级工程师。" },
];

async function api_call(messages: Message[]): Message {
  const resp = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages
    }),
    signal: AbortSignal.timeout(60_000),      // ← 60 秒超时
  });

  const data = await resp.json();
  console.log(resp.status);
  console.log(JSON.stringify(data, null, 2));
  return data.choices[0].message;
}

async function main() {
  let line = (await rl.question("你: ")).trim();   // ← 读一行输入
  llm_messages.push({ role: "user", content: line });
  try {
    await llm_messages.push(api_call(llm_messages));
  } catch (error) {
    console.error("API 调用失败:", error);
  }
  // ……你的循环逻辑写在这里……
  while(line !== "/exit") {
    line = (await rl.question("你: ")).trim();   // ← 读一行输入
    if (line === '/delete') {
      llm_messages.splice(1, 2);
    } else if(line === '') continue;
    llm_messages.push({ role: "user", content: line });
    try {
      await llm_messages.push(api_call(llm_messages));
    } catch (error) {
      console.error("API 调用失败:", error);
    }
  }
  rl.close();                                        // ← 退出前记得关
}
main();