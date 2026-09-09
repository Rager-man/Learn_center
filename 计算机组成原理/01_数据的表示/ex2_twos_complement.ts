// 计算机组成原理/01_数据的表示/ex2_twos_complement.ts —— 练习骨架
// 用法（在 计算机组成原理/ 目录下执行）：
//   npx tsx 01_数据的表示/ex2_twos_complement.ts
//
// 任务：8 位补码加减法器（第 1 课任务 3）。每次运算输出六件套：
//   操作数位串 a、b ｜ 结果位串 ｜ int8 语境值 ｜ uint8 语境值 ｜ carry ｜ overflow
// 规则：
//   1. encode8 的负数路径必须走"取反加一"的位级实现（先编码绝对值，再逐位取反、末位加一）
//   2. addBits 必须按位算进位链（从最低位到最高位逐位带上进位），不是"数值相加再转位串"
//      ——这是第 3 课 Nand2Tetris Add16 芯片的预演，写了不亏
//   3. overflow 用"同号相加得异号"判定——只看三个符号位（硬件视角）
//   4. 减法 a − b = a + (−b)；b = −128 时 −b 编不出来——抛一句人话错误
//   5. 完成标准：内置对拍表 T5–T8 全 ✅，且 npx tsc --noEmit 沉默
//
// 剧本：你写的是一台只会加法的 8 位机器。负数、减法、溢出报告，全是这台加法器的衍生品。

// ---------- TODO 1) 编码：int8 → 8 位位串 ----------
// 100 → "01100100"；-100 → "10011100"（取反加一的位级实现）
function encode8(n: number): string {
  if (!Number.isInteger(n) || n < -128 || n > 127) {
    throw new Error(`encode8 只吃 int8（-128..127 的整数），收到 ${n}`);
  }
  return "TODO-1"; // ← 实现后删除
}

// ---------- TODO 2) 位串按位加法（进位链） ----------
// 从最低位（最右）到最高位（最左）逐位相加，记录向第 9 位的进位
// "01100100" + "00110010" → { bits: "10010110", carry: 0 }
// 提示：当前位的和 = a 位 + b 位 + 低位来的进位；写出本位、算出往高位的进位
function addBits(a: string, b: string): { bits: string; carry: 0 | 1 } {
  return { bits: "TODO-2", carry: 0 }; // ← 实现后删除
}

// ---------- TODO 3) 解码：位串 → 两个语境的值 ----------
// 值公式：值 = u − 256×s（u = 无符号读法，s = 符号位）——在这里落地成两个函数
// signed8:   "11001110" → -50（最高位按 -128 计入）
// unsigned8: "11001110" → 206（最高位按 +128 计入）
function signed8(bits: string): number {
  return NaN; // ← 实现后删除
}

function unsigned8(bits: string): number {
  return NaN; // ← 实现后删除
}

// ---------- TODO 4) 溢出判定：只看三个符号位 ----------
// 同号相加得异号 = 溢出；异号相加永不溢出。返回 0 | 1
function overflowOf(a: string, b: string, sum: string): 0 | 1 {
  return 0; // ← 实现后删除
}

// ---------- 组装：一次运算的完整报告（胶水已给一半，TODO 5 在中间） ----------
interface Report {
  expr: string;
  a: string;
  b: string;
  sum: string;
  signed: number;
  unsigned: number;
  carry: 0 | 1;
  overflow: 0 | 1;
}

function run(op: "+" | "-", x: number, y: number): Report {
  let b = encode8(y);
  // TODO 5) 减法转加法：op 为 "-" 时，把 y 换成 -y 重新编码（a − b = a + (−b)）
  //          y = -128 时 -y 编不出来 —— throw 一句人话错误（为什么？留痕区写一句）
  const { bits, carry } = addBits(encode8(x), b);
  return {
    expr: `${x} ${op} ${y}`,
    a: encode8(x),
    b,
    sum: bits,
    signed: signed8(bits),
    unsigned: unsigned8(bits),
    carry,
    overflow: overflowOf(encode8(x), b, bits),
  };
}

// ---------- 内置对拍表：就是手算热身 T5–T8（六件套都要对上才算 ✅） ----------
const cases: Array<{
  op: "+" | "-";
  x: number;
  y: number;
  want: { sum: string; signed: number; unsigned: number; carry: 0 | 1; overflow: 0 | 1 };
}> = [
  { op: "+", x: 100, y: 50, want: { sum: "10010110", signed: -106, unsigned: 150, carry: 0, overflow: 1 } },
  { op: "+", x: -100, y: 50, want: { sum: "11001110", signed: -50, unsigned: 206, carry: 0, overflow: 0 } },
  { op: "-", x: -100, y: 50, want: { sum: "01101010", signed: 106, unsigned: 106, carry: 1, overflow: 1 } },
  { op: "+", x: 127, y: 1, want: { sum: "10000000", signed: -128, unsigned: 128, carry: 0, overflow: 1 } },
];

let pass = 0;
for (const c of cases) {
  const r = run(c.op, c.x, c.y);
  const ok =
    r.sum === c.want.sum &&
    r.signed === c.want.signed &&
    r.unsigned === c.want.unsigned &&
    r.carry === c.want.carry &&
    r.overflow === c.want.overflow;
  if (ok) pass += 1;
  console.log(`${ok ? "✅" : "❌"} T ${r.expr}`);
  console.log(
    `     a=${r.a}  b=${r.b}  sum=${r.sum}  int8=${r.signed}  uint8=${r.unsigned}  carry=${r.carry}  overflow=${r.overflow}`
  );
}
console.log(`\n${pass}/${cases.length} 通过。全部 ✅ 且 npx tsc --noEmit 沉默才算完成。`);
console.log(`检查点：手动调用 run("-", 100, -128) 应看到人话报错——在下面留痕区写清为什么。`);

// ---------- 留痕区 ----------
// 1. 跑通后把终端输出原样贴到下面，和 NOTES.md 里 T5–T8 的手算六件套并排对照：
//
//
// 2. 用一句自己的话回答：b = -128 时减法为什么报错？
//
// 3. 思考题（可不写）：如果把 addBits 换成"数值相加再转位串"，这个练习还剩多少价值？
//    你的答案和课件 §3 任务 3 的提示对得上吗？
//
