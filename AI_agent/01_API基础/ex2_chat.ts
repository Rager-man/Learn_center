// 01_API基础/ex2_chat.ts —— 骨架（第 1 课 · 任务 2：命令行多轮聊天机器人）✅ 2026-09-02 完成
// 用法：npx tsx 01_API基础/ex2_chat.ts   （交互式；/exit 退出，/delete 删除最早一轮）
//
// 剧本：自己维护 messages 数组实现多轮记忆——"记忆由你的代码维护"的实操证明。
// 亮点（学员产出）：/delete 命令为学员自创（splice 掉最早一轮 = 失忆实验常驻化，上下文裁剪的雏形）；
//   system 人设自定为 Palantir 高级工程师。
// 伏笔（第 3 课 agent loop 前按第 2 课 §5 改造）：api_call 内部直接 push 全局 llm_messages（隐藏副作用）；
//   首行输入 /exit 仍会先发一次请求（循环入口边界）。
// 完成判据（已达成）：记忆测试通过（聊 5 轮仍记得第 1 轮）+ 亲眼见过一次"失忆"

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

async function api_call(messages: Message[]): Promise<Message> {
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
    const reply = await api_call(llm_messages);
    llm_messages.push(reply);
  } catch (error) {
    console.error("API 调用失败:", error);
  }
  while(line !== "/exit") {
    line = (await rl.question("你: ")).trim();   // ← 读一行输入
    if (line === '/delete') {
      llm_messages.splice(1, 2);
    } else if(line === '') continue;
    llm_messages.push({ role: "user", content: line });
    try {
      const reply = await api_call(llm_messages);
      llm_messages.push(reply);
    } catch (error) {
      console.error("API 调用失败:", error);
    }
  }
  rl.close();                                        // ← 退出前记得关
}
main();