// 02_ToolUse/ex4_tool_call.ts —— 骨架（第 3 课 · 任务 1：calculator 单次往返 · 任务 2：双工具选择观察）
// 用法：npx tsx 02_ToolUse/ex4_tool_call.ts
//       骨架状态：tsc 出生即绿（npx tsc --noEmit 沉默）；直接跑则什么都不做——
//       main 的身体是 TODO 3，按课文 §3 的顺序逐步填。管路 chatWithTools 已由导师预检验证可用。
//
// 剧本：你问数学题 → 模型不亲自算，递来一张"申请单"（tool_calls：工具名 + 参数）→
//       你的 calculator 真正执行 → 结果以 role:"tool" 消息回传 → 模型这才看见结果、总结成答案。
//       两次 API 调用，中间夹着一次你的代码执行——这就是 agent 与聊天机器人的分水岭。
//       第 2 课的回传修复（坏输出 assistant + 报错 user 喂回去）就是这次回传的预演，
//       区别只是角色换成了 assistant(带 tool_calls) + tool。
// 伏笔：glm-5.3-flash 强制思考——带 tool_calls 的 assistant 消息里还躺着 reasoning_content，
//       官方要求回传时原样保留。所以第 ⑤ 步是"整个 message 原样 append"，别手工重拼（课文 §2.5）。
// 规则：fetch 裸调不用 SDK；工具执行报错不许裸崩——catch 住，把报错文本作为 tool 消息回传（课文 §2.4）；
//       判卷看：单次往返能逐步指认"谁在干活" + 12 题观察记录（expect 只是锚点，
//       模型选"错"先问"是不是我的描述没写清"，再问"模型错了吗"）。
const BASE_URL = process.env.LLM_BASE_URL!;
const API_KEY  = process.env.LLM_API_KEY!;
const MODEL    = process.env.LLM_MODEL!;

// ── 消息类型（第 1–2 课 Message 的升级版：多了两种新角色）──
interface SystemMsg { role: "system"; content: string }
interface UserMsg   { role: "user";   content: string }

// 模型递来的"申请单"——tool_calls 数组里的一张
interface ToolCall {
  id: string;                                    // ← 这次调用的"工单号"，回传 tool 消息时靠它对号
  type: "function";
  function: { name: string; arguments: string }; // ← arguments 是 JSON 格式字符串！又是 JSON.parse（第 2 课肌肉）
}

// 模型要调工具时，它的回复长这样（注意 content 空了、答案不在 content 里）
interface AssistantMsg {
  role: "assistant";
  content: string | null;         // ← 要调工具时是空串或 null
  tool_calls?: ToolCall[];        // ← 申请单，可能一次多张
  reasoning_content?: string;     // ← glm-5.3-flash 强制思考的思维链；回传时原样保留（课文 §2.5）
}

// 你的执行结果，靠 tool_call_id 和申请单对上号
interface ToolMsg { role: "tool"; tool_call_id: string; content: string }

type ChatMessage = SystemMsg | UserMsg | AssistantMsg | ToolMsg;

// ── 工具 schema：写给模型看的说明书（TODO 1 你来填 calculator 这份的描述）──
interface ToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;  // ← 写给模型看：我是干什么的、什么情况下该用我、参数什么格式
    parameters: { type: "object"; properties: Record<string, unknown>; required?: string[] };
  };
}

// ── API 管路（预建，导师已实测）── 注意它返回完整 message + finish_reason，自己不碰 messages——
// 和第 2 课 §5 布置的 ex2 api_call 改造同一个姿势："发出去的"和"记进历史的"分开，调用方说了算
async function chatWithTools(messages: ChatMessage[], tools: ToolSchema[]) {
  const resp = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, tools }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  }
  const data = await resp.json();               // ← any：编译器不管，路径自己看准（第 2 课 §1 避坑）
  const choice = data.choices[0];
  return { message: choice.message as AssistantMsg, finish_reason: choice.finish_reason as string };
}

async function main() {
  // TODO 3) 单次往返五步（课文 §3 任务 1 第 3 步，对照 §2.1 时序图逐步写）：
  //   ① const messages: ChatMessage[] = [{ role: "user", content: "123 乘以 456 等于多少？" }];
  //   ② const { message, finish_reason } = await chatWithTools(messages, [CALCULATOR_SCHEMA]);
  //      打印 finish_reason 和整个 message——亲眼看看：finish_reason 是 "tool_calls"、
  //      content 是空的、申请单躺在 tool_calls 里、reasoning_content 也在一起
  //   ③ const args = JSON.parse(message.tool_calls![0].function.arguments);
  //      打印 args——注意它在申请单里刚才是字符串，第 2 课的 parse 肌肉直接复用
  //   ④ const result = calculate(args.expression);   // ← 包 try/catch：报错就把 error.message 当结果
  //   ⑤ 回传，第二次请求：
  //      messages.push(message);  ← 原样 append 整个对象（含 reasoning_content），别手工重拼！
  //      messages.push({ role: "tool", tool_call_id: message.tool_calls![0].id, content: result });
  //      再 chatWithTools 一次，打印 message.content——这次的 finish_reason 应该是 "stop"
  //   完成判据：tsc 沉默 + 终端输出里能逐行指认"哪几行是模型在干活、哪几行是你的代码在干活"
}
main();

// ======================= 任务 1 待写区（TODO 1–2，课文 §3 任务 1）=======================
// TODO 1) 把 CALCULATOR_SCHEMA 的两处 description 改写成"给模型看的说明书"（课文 §2.2）：
//   好描述回答模型关心的两件事：我能干什么？expression 什么格式（给个示例）？
//   （结构不用动——JSON Schema 的骨架是固定姿势，功夫全在措辞上，第 5 课的主课）
const CALCULATOR_SCHEMA: ToolSchema = {
  type: "function",
  function: {
    name: "calculator",
    description: "TODO(1)：给模型看的说明书——我能算什么、什么时候该用我",
    parameters: {
      type: "object",
      properties: {
        expression: { type: "string", description: "TODO(1)：这个参数长什么样？给个示例格式" },
      },
      required: ["expression"],
    },
  },
};

// TODO 2) calculate(expr: string): string —— 真正执行计算的是这段代码，三道关（课文 §2.4）：
//   第 1 关 白名单：只放行 数字、空白、+ - * / ( ) . ^——"hello*3" 在这里拒绝
//          （参数校验：模型给的参数不可全信，第 2 课肌肉）
//   第 2 关 翻译：把 ^ 换成 **——JS 里 ^ 是按位异或，不翻译的话 2^64 会算成 66
//   第 3 关 除零：求值结果是 Infinity 或 NaN（除零）→ throw new Error("除数为零")。
//          别让它静默流出去：报错就是要回传给模型看的（课文 §2.4），调用方会 catch 住
//   姿势：白名单过了之后 new Function("return (" + 表达式 + ")") 求值；
//   提醒：2^64 超出 JS Number 精度边界（2^53），结果不精确——先记下这个现象，§5 学有余力再治
function calculate(expr: string): string {
  // TODO(2)：三道关。写完先自测：calculate("(17+3)*12-8/2")、calculate("2^64")、calculate("hello*3")
  throw new Error("TODO(2)：还没写");
}

// ======================= 任务 2 待写区（TODO 4–5，课文 §3 任务 2）=======================
// TODO 4) get_current_time 工具（课文 §3 任务 2 第 1 步）：
//   - TIME_SCHEMA：无参数工具——parameters 就一个 { type: "object", properties: {} }；
//     description 想清楚模型什么时候该找我（"任何需要当前日期/时间/星期的问题"）
//   - 实现 get_current_time(): string —— 返回格式要"信息够用"：日期 + 星期 + 时刻。
//     只返回 "14:30" 的话，第 12 题（今天星期几、距国庆多少天）就缺原料了——返回值设计是第 5 课伏笔
//   - 注册表（两张申请单都从这里派活）：
//       const TOOLS: ToolSchema[] = [CALCULATOR_SCHEMA, TIME_SCHEMA];
//       const REGISTRY: Record<string, (args: Record<string, unknown>) => string> = {
//         calculator: (args) => calculate(String(args.expression)),
//         get_current_time: () => get_current_time(),
//       };
//
// TODO 5) 小循环跑 12 题测试集（课文 §3 任务 2 第 2 步）——这就是第 4 课 agent loop 的雏形：
//   for (const q of QUESTIONS) {
//     const messages: ChatMessage[] = [{ role: "user", content: q.q }];
//     let rounds = 0;
//     while (rounds < 4) {                    // ← 上限 4：护栏雏形，防止模型无限递申请单
//       const { message, finish_reason } = await chatWithTools(messages, TOOLS);
//       if (finish_reason !== "tool_calls") { // ← 模型不递申请单 = 它想直接回答了
//         打印：expect、实际调过什么、模型最终回答 → break 进下一题
//       }
//       messages.push(message);              // ← 原样 append（含 reasoning_content）
//       for (const tc of message.tool_calls!) {  // ← 申请单可能多张，逐张处理
//         try {
//           执行：JSON.parse(tc.function.arguments) → 查注册表 → 结果字符串
//         } catch (e) {
//           结果 = 报错文本（e instanceof Error ? e.message : String(e)）——报错也要回传，不许裸崩
//         }
//         messages.push({ role: "tool", tool_call_id: tc.id, content: 结果 });
//       }
//       rounds++;
//     }
//   }
//   逐题记进你的观察表（课文 §3 任务 2 第 3 步的表格）：实际选择 vs expect，
//   对不上先问"我的描述写清了吗"，再问"模型错了吗"——第 5 课的核心素材。
//   完成判据：12 题全跑完零裸崩，每题有记录（重点：第 8 题无工具、第 10 题除零、第 9 题两步依赖）

// ======================= 测试集（12 题工具选择测试集，任务 2 用）=======================
// expect 不是标准答案，是观察锚点：模型选"错"了，先想想是模型的问题还是你的工具描述没写清。
// 这个区分是第 5 课（工具设计）的核心线索，现在先攒素材。（TS 化自 ex4_questions.py）
interface QuestionItem {
  q: string;                                                                // 提问文本
  expect: "calculator" | "get_current_time" | "both" | "none" | "any";      // 期望的工具选择行为
  note: string;                                                             // 这道题想让你观察什么
}
const QUESTIONS: QuestionItem[] = [
  {
    q: "123 乘以 456 等于多少？",
    expect: "calculator",
    note: "最基础的用例：明确需要计算，模型心算大概率出错",
  },
  {
    q: "(17 + 3) * 12 - 8 / 2 等于多少？",
    expect: "calculator",
    note: "含括号与优先级。观察模型是否把完整表达式原样传进参数，还是自己先算了一部分"
        + "（如果它先算了，说明它没理解工具的用途）",
  },
  {
    q: "计算 2 的 64 次方",
    expect: "calculator",
    note: "大整数，模型心算必错。这是最能体现工具价值的用例（另注意 JS 精度边界，课文 §2.4）",
  },
  {
    q: "现在几点了？",
    expect: "get_current_time",
    note: "模型天然不知道当前时间。这是工具的第二个价值：连外部世界",
  },
  {
    q: "今年是闰年吗？",
    expect: "get_current_time",
    note: "必须先知道「今年」是哪年。观察模型会不会跳过工具直接编一个答案",
  },
  {
    q: "你好，介绍一下你自己",
    expect: "none",
    note: "不该调任何工具。观察它是否为用工具而用工具（过度调用）",
  },
  {
    q: "1 + 1 等于几？",
    expect: "any",
    note: "简单到模型自己就能算，两种选择都合理。记录它的实际行为，"
        + "并想想：你希望它调工具吗？为什么？",
  },
  {
    q: "北京今天的气温是多少度？",
    expect: "none",
    note: "★ 重点观察：根本没有对应工具。模型是承认「我没有这个工具」，"
        + "还是硬凑一个工具去调（比如用 calculator 算气温），还是直接编一个温度？"
        + "这是幻觉的头号来源，第 5 课和第 8 课会正面解决",
  },
  {
    q: "从现在开始再过 3 小时 20 分钟是几点？",
    expect: "both",
    note: "★ 两步依赖：必须先拿到当前时间，才能计算。观察模型是"
        + "一轮只调一个（串行、需要多轮），还是一轮并行调两个？"
        + "并行调用在这里是错的，因为它有依赖关系",
  },
  {
    q: "123 除以 0 等于多少？",
    expect: "calculator",
    note: "工具执行必然报错（除零）。观察：你的程序崩了，"
        + "还是把错误回传给了模型？模型看到错误后怎么反应？",
  },
  {
    q: "把 hello 这个词乘以 3",
    expect: "calculator",
    note: "模型可能硬凑一个非法表达式如 hello*3 传进来。"
        + "观察你的计算器怎么拒绝它。这是不可信输入的第一课",
  },
  {
    q: "今天是星期几？距离 2026 年国庆还有多少天？",
    expect: "both",
    note: "需要当前日期 + 日期差计算。观察 get_current_time 的返回值"
        + "是否包含足够信息（只返回「14:30」就不够用了）。"
        + "这是第 5 课工具返回值设计的伏笔",
  },
];
