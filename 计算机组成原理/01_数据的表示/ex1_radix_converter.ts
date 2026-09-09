// 计算机组成原理/01_数据的表示/ex1_radix_converter.ts —— 练习骨架
// 用法（在 计算机组成原理/ 目录下执行）：
//   npx tsx 01_数据的表示/ex1_radix_converter.ts
//
// 任务：十进制 ↔ 二进制 / 十六进制，整数和小数都手动实现（第 1 课任务 2）。
// 规则：
//   1. 禁用一步到位：parseInt(s, 2) / Number("0b1011") 读位串、toString(2) / toString(16)
//      出位串，一律不许出现在"转换"本身——过程必须手写（除基取余 / 乘基取整 / 按权展开）
//   2. Math.floor、数组方法、模板字符串随便用
//   3. 小数最多 12 位，转不尽时末尾标 "..."
//   4. 完成标准：内置对拍表 T1–T4 全 ✅，且 npx tsc --noEmit 沉默
//
// 剧本：你就是"进制转换"这件事本身。手算时笔怎么动，代码就怎么写——
//       每实现一个函数前，先在纸上用小例子（45 / 0.6875）走一遍你的算法。

// ---------- TODO 1) 整数部分：十进制 → 二进制 ----------
// 除 2 取余，倒排。0 → "0"，45 → "101101"
// 提示：最先算出的余数是最低位——注释里写一句"为什么方向是反的"
function intToBits(n: number): string {
  return "TODO-1"; // ← 实现后删除
}

// ---------- TODO 2) 小数部分：十进制 → 二进制 ----------
// 乘 2 取整，正排；最多 maxBits 位，转不尽时末尾加 "..."
// 0.6875 → "1011"（4 位转尽）；0.1 → "000110011001..."（12 位截断）
// 三个出口：剩余变 0 / 攒满 maxBits 位 / 剩余不再变化却没归零（防御）
function fracToBits(x: number, maxBits: number): string {
  return "TODO-2"; // ← 实现后删除
}

// ---------- 组装：十进制数 → 完整二进制串（给定的胶水，读懂即可） ----------
// 45 → "101101"；0.6875 → "0.1011"；11.6875 → "1011.1011"
// 只处理 n ≥ 0：负数怎么办是 §5"学有余力"的思考题，本练习不掺进来
function toBinary(n: number): string {
  if (n < 0) throw new Error(`本练习只处理 n ≥ 0，收到 ${n}（负数见课件 §5 思考题）`);
  const intPart = intToBits(Math.floor(n));
  if (Number.isInteger(n)) return intPart;
  return `${intPart}.${fracToBits(n - Math.floor(n), 12)}`;
}

// ---------- TODO 3) 反向：二进制串（可含小数点）→ 十进制 ----------
// 按权展开：整数位权 …8,4,2,1，小数位权 0.5,0.25,0.125…
// "101101" → 45；"1011.1011" → 11.6875（这些值在 double 里都是精确的，=== 比较不怕误差）
function bitsToDecimal(bits: string): number {
  return NaN; // ← 实现后删除
}

// ---------- TODO 4) 十进制整数 → 十六进制 ----------
// 两种"手动"路线任选其一，注释里写明你选了哪种：
//   a) 复用 intToBits 再 4 位一组读成一位十六进制
//   b) 除 16 取余，倒排
// 45 → "2D"（大写字母）
function toHex(n: number): string {
  return "TODO-4"; // ← 实现后删除
}

// ---------- 内置对拍表：就是手算热身 T1–T4 ----------
// 先手算（过程记 NOTES.md），再跑这里对照——"手算对了、程序只是确认"才算会
const cases: Array<{ name: string; actual: () => string; expected: string }> = [
  { name: "T1  45 → 二进制      ", actual: () => toBinary(45), expected: "101101" },
  { name: "T2  0.6875 → 二进制  ", actual: () => toBinary(0.6875), expected: "0.1011" },
  { name: "T3  1011.1011 → 十进制", actual: () => String(bitsToDecimal("1011.1011")), expected: "11.6875" },
  { name: "T4  45 → 十六进制    ", actual: () => toHex(45), expected: "2D" },
];

let pass = 0;
for (const c of cases) {
  const actual = c.actual();
  const ok = actual === c.expected;
  if (ok) pass += 1;
  console.log(`${ok ? "✅" : "❌"} ${c.name}  期望 ${c.expected}  实际 ${actual}`);
}
console.log(`\n${pass}/${cases.length} 通过。全部 ✅ 且 npx tsc --noEmit 沉默才算完成。`);

// ---------- 留痕区 ----------
// 1. 跑通后把终端输出原样贴到下面，和 NOTES.md 里 T1–T4 的手算过程并排对照：
//
//
// 2. 学有余力：给对拍表加一行 toBinary(0.1)，把输出贴在这里（应是 12 位 + "..."），
//    并用一句自己的话解释它为什么转不尽：
//
