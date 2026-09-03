// 03_工程与异步/ex9_forget_await.ts —— 骨架（第 5 课 · 任务 1：忘 await 实验）
// 用法：npx tsx 03_工程与异步/ex9_forget_await.ts   （骨架从出生就是绿的；
//   今天全项目唯一的红，是你在下面实验里亲手造出来、观察完、再亲手消掉的）
//
// 剧本：fetchUser() 模拟一次 300ms 的网络请求（第 6 课换真的 fetch，今天用 mock 专注现象）。
//   三段实验代码都在注释里：先在 §1.1 预测过、再逐段取消注释亲手跑——现象写进「观察留痕」。
//   三段分别对应"忘了 await"的三种下场：编译器拦下 / 静默出错 / 打出提货单本体。
//
// 规则：全程禁 as / ！；命名 camelCase；观察完把实验代码注释回去，项目回到 0 error。

interface User {
  id: number;
  name: string;
}

// 预建：mock 的网络请求——注意返回类型，它返回的从来不是 User，是 Promise<User>
function fetchUser(): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: 1, name: "小明" }), 300);
  });
}

// ======================= 实验 A：忘了 await，直接点属性 =======================
// TODO 1) 先预测：npx tsc --noEmit 报不报？报什么？npx tsx 直跑（不看类型）又打出什么？
//   预测完，取消下面两行注释，各跑一遍，把现象写进「观察留痕」：

// const user = fetchUser();
// console.log(user.name);

// ======================= 实验 B：忘了 await，直接打印 =======================
// TODO 2) 先预测：这段 tsc 报不报？tsx 跑出来打印的是什么东西？
//   取消下面两行注释，跑，留痕：

// const user2 = fetchUser();
// console.log(user2);

// ======================= 实验 C：对照组——有 await =======================
// TODO 3) 取消下面两行注释，跑——这才是"货到手"的样子：

// const user3 = await fetchUser();
// console.log(user3.name);

// ======================= 观察留痕（判卷证据，逐段写） =======================
// A（点属性）—— tsc 现象：
// A（点属性）—— tsx 现象：
// B（直接打印）—— tsc 现象：
// B（直接打印）—— tsx 现象：
// C（有 await）—— 现象：
//
// TODO 4) 用一句话回答：A 段在 tsx 下打出的那个值，和第 1 课 JSON.parse 实验
//   里"data.nama 打出 undefined"是同一类事故吗？为什么？（答案写在这）
//

// 完成判据：三段都亲手跑过 + 留痕写全 + 实验代码全部注释回去后 npx tsc --noEmit 沉默
