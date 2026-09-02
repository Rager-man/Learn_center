// 02_类型建模/ex6_guess.ts —— 骨架（第 3 课 · 任务 2：猜数字命令行游戏）
// 用法：npx tsx 02_类型建模/ex6_guess.ts   （今天 tsc 的红都在 ex5，这个文件从出生就是绿的）
//
// 第 1 课 BMI 埋的坑在这里正式补完：Number("abc") 得 NaN——这次不许绕过，必须窄化处理。
// 读输入的工具 rl 是第 5 课（异步）的内容，今天当黑盒：照抄下面两行的用法，别深究 await

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout });
// ↑ 黑盒说明书：await rl.question("提示语") 会停住等你输入，把你敲的那一行拿回来（string，
//   末尾通常带看不见的空白，先 trim 再处理）

// TODO 1) 出题：1–100 的随机整数 —— Math.floor(Math.random() * 100) + 1
// TODO 2) 游戏循环，反复读输入：
//   - 输入 "q"（大小写都认）→ 打印一句认输的话，退出循环
//   - Number(...) 解析出 NaN → 打印"这不是一个数字"，continue 重新读（第 1 课的坑在这里补完）
//   - 是数字 → 进 TODO 3
// TODO 3) 和答案比大小：大了打印"大了"，小了打印"小了"，猜中打印"猜中了！一共用了 N 轮"并退出
//   - 每读一次有效输入算一轮（乱敲的不算——想想轮数计数器该加在哪一行）
// TODO 4) 收尾：rl.close()，让程序体面退出
// 完成判据：npx tsc --noEmit 沉默 + 真玩一局：正常数字、乱敲、q 三种输入都表现正常

async function main(): Promise<void> {
  // 游戏逻辑全部写在 main 里（函数前的 async、这里的 await 是第 5 课的主角，今天黑盒照抄）
  // 起手姿势：while (true) { const line = await rl.question("猜一个 1–100 的数（q 退出）："); ... }
}

void main(); // 发车。开头的 void 先不管它，第 5 课解释
