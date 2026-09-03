// 01_API基础/ex2_chat.ts —— 骨架（第 1 课 · 任务 2：命令行多轮聊天机器人）✅ 2026-09-02 完成
// 用法：npx tsx 01_API基础/ex2_chat.ts   （交互式；/exit 退出，/delete 删除最早一轮）
//
// 剧本：自己维护 messages 数组实现多轮记忆——"记忆由你的代码维护"的实操证明。
// 亮点（学员产出）：/delete 命令为学员自创（splice 掉最早一轮 = 失忆实验常驻化，上下文裁剪的雏形）；
//   system 人设自定为 Palantir 高级工程师。
// 还债（2026-09-04，第 2 课 §5 改造）：api_call 只返回 { content, usage }、不碰全局数组，由调用方 push；
//   首行 /exit 不再发请求（判定提前到 push 之前），/delete 误把命令当消息发出去的 fall-through 一并修掉。
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

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// 第 2 课 §5 改造（2026-09-04 还债）：不再返回整条 Message、不碰全局 llm_messages——
// 返回 { content, usage }，push 什么由调用方决定（第 3 课 chatWithTools 同款姿势）
async function api_call(messages: Message[]): Promise<{ content: string; usage: Usage }> {
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
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
  };
}

async function main() {
  let line = (await rl.question("你: ")).trim();
  while (line !== "/exit") {                    // /exit 判定先于 push/请求——首行 /exit 不再发请求
    if (line === '/delete') {
      llm_messages.splice(1, 2);                // 学员自创：splice 掉最早一轮；删完直接读下一行，不把 "/delete" 当消息发
    } else if (line !== '') {
      llm_messages.push({ role: "user", content: line });
      try {
        const { content, usage } = await api_call(llm_messages);
        llm_messages.push({ role: "assistant", content });   // ← 调用方 push：发出去的和记进历史的分得清
        console.log(`AI: ${content}`);
        console.log(`(tokens: prompt ${usage.prompt_tokens} + completion ${usage.completion_tokens} = ${usage.total_tokens})`);
      } catch (error) {
        console.error("API 调用失败:", error);
      }
    }
    line = (await rl.question("你: ")).trim();
  }
  rl.close();                                        // ← 退出前记得关
}
main();