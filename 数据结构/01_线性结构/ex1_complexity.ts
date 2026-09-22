// 01_线性结构/ex1_complexity.ts —— 骨架（第 1 课 · 任务 1：六段复杂度标注）
// 用法：本文件不用跑——六段函数只定义、不调用（npx tsx 直跑静默是正常的）。
//   答案写在每段下方的 TODO 注释处；全部标完后合上代码口述一遍，复盘时由导师抽问判卷。
//
// 剧本：Big-O 数的不是循环层数，是"基本操作执行了多少次"——而次数由什么决定，
//   每段都不一样：有的由 n 决定、有的由常数决定、有的藏在方法调用的暗价里。
//   六段覆盖 O(1) / O(log n) / O(n) / O(n log n) / O(n²) 五个档位 + 一个"看起来便宜其实很贵"的陷阱。
//
// 规则：每段下面写一行——Big-O + 一句话理由。理由必须点到"循环次数由什么决定"
//   或"哪个方法调用本身就是 O(什么)"；拿不准的段标 ？，复盘时问，别猜。

// ────────────────────────────── 第 1 段 ──────────────────────────────
function sumUpTo(n: number): number {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}
// TODO 1) Big-O = ？，理由：___

// ────────────────────────────── 第 2 段 ──────────────────────────────
function firstTen(arr: number[]): number {
  let total = 0;
  for (let i = 0; i < 10; i++) {
    // ← 注意：循环条件里没有 n
    total += arr[i];
  }
  return total;
}
// TODO 2) Big-O = ？，理由：___

// ────────────────────────────── 第 3 段 ──────────────────────────────
function triangle(n: number): number {
  let total = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      // ← 注意：内层次数不是 n，是 i
      total += 1;
    }
  }
  return total;
}
// TODO 3) Big-O = ？，理由：___（提示：内层共跑 0+1+2+…+(n-1) 次，加起来是多少？）

// ────────────────────────────── 第 4 段 ──────────────────────────────
function halveUntilSmall(n: number): number {
  let steps = 0;
  while (n > 1) {
    n = Math.floor(n / 2);
    steps++;
  }
  return steps;
}
// TODO 4) Big-O = ？，理由：___（提示：n 每轮减半，多少轮后掉到 1？从 1024 到 1 数一数）

// ────────────────────────────── 第 5 段 ──────────────────────────────
function sortThenScan(arr: number[]): boolean {
  const sorted = [...arr].sort((a, b) => a - b); // ← 这一行干了三件事：复制、排序；复制是多少？排序又是多少？
  return sorted[0] === sorted[sorted.length - 1]; // ← 下标访问是多少？
}
// TODO 5) Big-O = ？，理由：___（提示：顺序段相加取最大——三段各是多少？）

// ────────────────────────────── 第 6 段（陷阱）──────────────────────────────
function drainFromHead(arr: string[]): string[] {
  const drained: string[] = [];
  while (arr.length > 0) {
    const head = arr.shift(); // ← 表面一行，底下在干什么？
    if (head !== undefined) {
      drained.push(head);
    }
  }
  return drained;
}
// TODO 6) Big-O = ？，理由：___（提示：一层循环 ≠ O(n)。循环跑了多少次？shift 每执行一次又是 O(什么)？）
