// 01_API基础/ex3_reviews.ts —— 骨架（第 2 课 · 任务 1：评论分类器 · 任务 2：加兜底）▶ 进行中
// 用法：npx tsx 01_API基础/ex3_reviews.ts   （当前 = 任务 1 招式一二合体版：裸 parse 压测，
//       遇坏输出会裸崩——这是剧本，先亲眼看它崩，任务 2 再一层层垫起来）
//
// 剧本：商品评论 → {"情感","类别","置信度"}。任务 1 已完成（Schema 进 prompt + response_format
//       + temperature 0；压测评论 9 条，其中 3 条刁钻题为学员自加）。
// 规则：任务 2 之后，压测三件套（乱码 / 空文本 / 超长）每条都要有明确出路——解析成功、
//       兜底救回、或明确的失败结果，不许再有一条裸崩。
const BASE_URL = process.env.LLM_BASE_URL!;
const API_KEY  = process.env.LLM_API_KEY!;
const MODEL    = process.env.LLM_MODEL!;

const SYSTEM_PROMPT = `你是商品评论分析器。只输出一个 JSON 对象，不要输出任何其他文字。
格式：
{"情感": "正面|负面|中性", "类别": "质量|物流|价格|服务|其他", "置信度": 0到1之间的小数}
示例：
输入"快递两天就到了，质量意外地好" → 输出 {"情感": "正面", "类别": "物流", "置信度": 0.9}
字段一个都不能多、不能少。"置信度"必须是数字，不要加引号。`;

type Role = "system" | "user" | "assistant";       // 和第 1 课 ex2 同款：
interface Message { role: Role; content: string }  // role 拼错编译期就报警——TS 送的第一份礼物
interface Review {
    情感: "正面" | "负面" | "中性";
    类别: string;
    置信度 : number;
}

async function chat(messages: Message[]): Promise<string> {
  const resp = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0,                  // ← 随机度拧到最低——分类要稳定
      response_format: {"type": "json_object"},            // ← 让模型只输出 JSON，别夹杂其他文字
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  }
  const data = await resp.json();          // ← 返回 any：编译器放行，风险自担（§1 避坑）
  return data.choices[0].message.content;  // 取数路径和第 1 课一模一样，只是从 [] 换成了点号
}

async function classify(review: string): Promise<Review> {
  const messages: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: review },
  ];
  const content = await chat(messages);
  return JSON.parse(content);  // ← 这里的 content 是 JSON 字符串，parse 出来就是 Review
}

async function main() {
    const reviews = [
    "快递两天就到了，质量意外地好",
    "用了三次就坏了，客服还踢皮球",
    "东西还行，价格一般",
    "@@##￥%%……&**（（——乱码输入",
    "",                      // 空文本
    "很好用，".repeat(200),   // 超长文本
    "dslansidi拼扫地你**7293",  // 乱七八糟的文本
    "物流慢，客服态度差，价格贵，质量也不好",  // 多个负面因素
    "服务态度好，但价格偏高gaogaogaoago",  // 正面和负面因素并存
    ];
  for (const review of reviews) {
    const result = await classify(review);
    console.log(`评论: ${review}`);
    console.log(`分析结果: ${JSON.stringify(result)}`);
  }
}

main();

// ======================= 任务 2 待写区（TODO，写完再动 main）=======================
// TODO 1) parseReview(content: string): Review —— 兜底阶梯 1–2 级（课文 §2.4）：
//   - 预处理：trim() 剥围栏 → indexOf("{") / lastIndexOf("}") 截取花括号之间那一段
//   - 解析：JSON.parse 包 try/catch，失败抛 BadJSON（自定义异常，带上原始 content 和报错信息——
//     回传修复要用它们；catch 变量是 unknown，先 instanceof Error 再取 message）
//
// TODO 2) classify 升级成三级兜底（§2.4 阶梯 3–4 级）：
//   - 解析失败 → 原样重试一次（temperature 已是 0 还失败，说明真不是抖动）
//   - 仍失败 → 回传修复：坏输出以 assistant 身份进历史 + 报错作为新 user 消息
//     （messages 拼法见课文 §3 任务 2——这正是第 1 课练的多轮对话结构）
//
// TODO 3) 重跑全部压测评论，逐条记录出路：成功 / 兜底救回 / 明确失败结果
// 完成判据：压测三件套零裸崩 + 自查清单 6 项全勾（课文 §3.4）+ npx tsc --noEmit 沉默


