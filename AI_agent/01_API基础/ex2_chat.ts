type Role = "system" | "user" | "assistant";
interface Message { role: Role; content: string }
import { createInterface } from "node:readline/promises";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const llm_messages: Message[] = [
  { role: "system", content: "你是一个乐于助人的 AI 助手。" },
  { role: "user", content: "用一句话解释什么是 token" },
];

async function main() {
  const line = (await rl.question("你: ")).trim();   // ← 读一行输入
  // ……你的循环逻辑写在这里……
  rl.close();                                        // ← 退出前记得关
}
main();