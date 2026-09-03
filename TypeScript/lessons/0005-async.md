# 第 5 课 · 异步——JS/TS 的主旋律

> **TypeScript 开发 · 20 小时速通 · 5 / 10**
> 节奏：**30–40 分钟学**（§0–§2）→ **80 分钟练**（§3，代码放 `03_工程与异步/`）→ **10 分钟复盘**（§4）。
> 前四课的值都已经在手——今天处理"值还没到"的情况：网络请求、定时器、等用户输入。JS 里凡是耗时的活都不肯站着等，而是先塞给你一张**提货单**（Promise），货到了凭单取货。
> 你有 Python 基础——写过 `asyncio` 的话今天几乎没有新概念：Promise ≈ Future，await ≈ await。最大的差别反而在氛围：JS 的异步是默认开的，没有那层事件循环的仪式感，**忘了 await 也不会有人提醒你**——所以它是新手第一大坑，也是今天的主角。

---

## §0 开工准备（5 分钟）

先跑安检：

```bash
npx tsc --noEmit   # 沉默
```

今天从绿开始，全项目唯一的红是你在 ex9 实验里**亲手造出来、观察完、再亲手消掉**的（先例：第 4 课的删 case 实验）。

练习文件已建好三个，都在 `03_工程与异步/`（新目录，今天启用）：

- `ex9_forget_await.ts` —— 忘 await 实验骨架（绿的，实验代码在注释里等你放出来）
- `ex10_serial_concurrent.ts` —— 串行 vs 并发计时（绿的，`sleep` 和三个任务你来写）
- `ex11_retry_settled.ts` —— 重试函数 + allSettled 报告（绿的，`retry` 骨架在注释里）

**开场复查（10 秒）**：第 4 课你修掉过 `{...data, amount} as Order`——那是这门课第一次出现"**图省事**"方向的偏差（此前你一向偏"过严"）。今天整节课讲的就是图省事方向最贵的坑：**忘 await**——少打一个词，省一秒钟，换一个静默错误。带着这个意识上课，见 `Promise<` 开头的类型就条件反射找 `await`。

今天还要拆三件旧家具，全是 ex6 里当黑盒用过的：**top-level await**（你自己发现的那个用法，今天转正）、**`rl.question` 前面的 await**、**`void main()`**（当时一句带过）。§2 逐一拆开。

> 💡 **课前读什么**
> [MDN：Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) + [MDN：使用 Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)——两篇都不长，重点看"承诺"的比喻和链式调用一节（`.then` 今天不用写，但看得懂它，读旧代码就用得上）。

---

## §1 核心认知：提货单，不是货

> ◆ **本课唯一必须带走的东西**
>
> **async 函数返回的永远是 Promise。忘了 await，你拿到的是"提货单"而不是货。**

开场先还债。ex6 你自己干过三件事，当时都是"能用就行"：把骨架的 `async main` 拆了、直接在模块顶层写 `await rl.question(...)`；照抄了 `rl.question` 前面那个 `await`；还见过一句 `void main()` 从眼前溜走。今天三件全部拆开。先看主角：

```typescript
async function getAnswer(): Promise<number> {
  return 42;                        // 明明 return 的是字面量……
}

const r = getAnswer();              // r: Promise<number> —— 提货单。async 只发单，不发货
const v = await getAnswer();        // v: 42              —— 货。await 凭单取货

// 今天实验用的 mock 请求（ex9 里预建的就是它，300ms 后货到；第 6 课换真的 fetch）：
interface User { id: number; name: string }

function fetchUser(): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: 1, name: "小明" }), 300);
  });
}
```

三个推论，今天反复会用到：

1. **async 函数自己不发货，只发单。** `async` 做两件事：把函数的返回值（哪怕是个字面量）包进 Promise；把函数里的 `throw` 变成这张单的 rejection。所以 `fetchUser()` 这个调用永远只给你单子——想拿货，必须再过一道 `await`。
2. **await 是唯一"凭单取货"的操作。** 它做三件事：暂停当前函数、等单子结算、把值取出来（结算成 rejection 就地变成 throw，交给 try/catch）。没这道手续，单子会静默流进你的程序——比报错危险得多。
3. **Promise 创建即启动，await 只是等它。** `taskA()` 这个调用本身就是"开始干活"；`await` 从不派活，只收账。串行 vs 并发的全部谜底就在这一句（§2.4，今天最反直觉的一节）。

> ⚠️ **本课避坑**
> 忘 await 不会响。tsc 只在"你把单子当货用"时才拦（比如点属性——TS2339）；`console.log(user)`、把单子存进变量、传给参数宽的函数，**全都静默放行**。纪律：赋值完悬停看一眼类型——`Promise<` 开头，就是货没到手。全程禁 `as` / `!`、命名 camelCase，延续前两课。

### §1.1 动笔预测（5 分钟）

老规矩，**先别用 IDE**。逐段预测：`npx tsc --noEmit` 报不报？`npx tsx` 直跑打出什么？（`fetchUser` 用上面这个 300ms 的 mock 版，完整代码在 ex9 里。）

```typescript
// A —— 忘 await 的两副面孔
const user = fetchUser();
console.log(user.name);      // ← 第 1 行：tsc 报不报？tsx 跑出什么？

const user2 = fetchUser();
console.log(user2);          // ← 第 2 行：tsc 报不报？tsx 跑出什么？

// B —— await 一个不是 Promise 的东西
const n = await 42;          // ← 合法吗？n 是什么？

// C —— top-level await（ex6 你干过的）
const user3 = await fetchUser();   // 这行写在模块顶层（不在任何函数里），合法吗？

// D —— 没人接的错误
async function boom(): Promise<number> {
  throw new Error("数据库连不上");
}
boom();                      // 不 await、不 catch，程序会怎样？会崩吗？退出码是多少？
// （D 段纸面预测即可；想亲手看：单开一个临时文件跑完就删——别留在项目里，红都不能留，何况崩）
```

写完再对照（猜错很正常，错在哪就是哪没懂；四段的完整亲手版就是今天的任务 1）：

> [!success]- 对照答案（先写完再展开）
> **A：第 1 行两边都出事，第 2 行两边都沉默——但沉默不等于没事。** 第 1 行 `error TS2339: Property 'name' does not exist on type 'Promise<User>'`——单子上没有 name，编译器拦得漂亮；可 `npx tsx` 直跑（tsx 不做类型检查）打出 **`undefined`**：运行时手里是 Promise 对象，`.name` 当然不存在——第 1 课 `data.nama` 的亲戚，"类型说的和运行时拿的是两回事"的第三次兑现。第 2 行 tsc 沉默（`console.log` 什么类型都收），tsx 打出 **`Promise { <pending> }`**——提货单本体，货还没到（300ms 没到，console.log 可不等）。
>
> **B：合法，`n` 就是 42。** await 遇到非 Promise 的值，直接把值还你。这样设计是因为你写的工具函数不该关心参数"是不是已经是值"——await 不伤害值，只拆单子。
>
> **C：合法。** ESM（`"module": "NodeNext"`）下模块顶层允许 await——ex6 你自主发现的那个写法，今天转正：整个模块本身就是一个大的异步上下文。但只有顶层可以，普通函数里不行（§2.2 讲为什么）。
>
> **D：程序会崩。** `boom()` 跑完不报错、好像无事发生；等 Node 22 发现这张 rejected 的单子始终没人接，打印完整错误堆栈，**进程退出码 1**。"没人接"不是"没人知道"，是把整个程序带走——这就是"错误路径必须有人接"在异步世界的分量。

---

## §2 看清你写下的东西（30 分钟）

学前阅读讲"Promise 是什么"。这一节讲五件手册不会直说的事：单子什么时候开始跑、await 为什么只认两个地方、没人接的 rejection 会怎样、all 和 allSettled 的账各怎么算、以及把你 ex6 用过的三件旧家具逐一拆开。

### §2.1 Promise：一张会自己更新的提货单

单据有三态，且**一经结算，终身不再变**：

```
pending（在途）──→ fulfilled（货到了，带 value）
              └─→ rejected（黄了，带 reason）
```

- 结算是**一次性的**：fulfilled 之后不管谁、不管什么时候 `await` 这张单，立刻拿到那个值——不会重跑一遍。
- `new Promise(...)` 你几乎不会手写（用的都是别人造好的单：`setTimeout` 包装、`fetch`、`rl.question`）——但今天 ex10 要手写一次 `sleep`，因为它是理解"Promise 是容器"的最短路径：一行，把"将来才发生的事"变成一张可等待的单。
- 等待期间你手里的单子类型是 `Promise<T>`——**T 才是货的类型**。看类型先撕掉一层 `Promise<` 再读，这是今天养成的新反射。

Python 对照：`asyncio.Future` / coroutine 就是同款单据；差别是 Python 里你得 `asyncio.run(...)` 启动整个循环，JS 里循环永远在转，没有这个仪式。

### §2.2 await：凭单取货（以及它只认两个地方）

`await p` 的完整动作：**暂停当前函数**（不是暂停线程——别的代码照跑）→ 等单子结算 → fulfilled 取值继续，rejected 就地变 throw。两个补充：

- **await 非 Promise 直接得值**（A 段 B 行实测 `await 42 === 42`）。所以"不确定是不是 Promise"的值，await 一下永远安全。
- **await 只写在两个地方**：`async` 函数体内，或模块顶层。原因：暂停的是"当前函数"，得有人保证这个函数**能暂停、之后还能从断点继续**——async 函数有这个机制，普通函数和回调没有。`setInterval(() => await sleep(1000), ...)` 编译报错，就是因为箭头函数不是 async。**top-level await 合法**是因为整个 ESM 模块本身就是一个大的异步上下文——ex6 你拆掉 `async main` 直接顶层 await，拆得完全正确，而且从此再不需要"main 包装"这个套路（`void main()` 也就退休了，§2.3）。

Python 对照：`await` 只能出现在 `async def` 里，一模一样；JS 多送的是模块顶层这一档。

### §2.3 错误路径：rejection 必须有人接

async 函数里的 `throw` 不会原地炸——它把返回的那张单子变成 rejected。于是**接错误也有异步版本的一对**：

```typescript
try {
  const user = await fetchUser();   // await 把 rejection 还原成 throw，catch 才接得住
} catch (err) {
  // 恢复逻辑：兜底值、重试（今天的 retry！）、或打印后体面退出
}
```

- 忘了 `await` 的 try/catch 接不到异步错误：`try { return fn(); } catch` 抓不到 rejection（fn 同步阶段只是发单，失败发生在将来）——`return await fn()` 才行。这是忘 await 的进阶变体，**这次连 tsc 都不响**，ex11 提示 3 专门讲。
- **没人接会怎样**：D 段实测——Node 22 把 unhandled rejection 当致命错误，打完整堆栈，退出码 1。第 4 课"错误路径要有人接"的判卷标准，今天起同样适用于每张单子。
- 接错误的三个位置，按顺手程度：`try/catch`（要恢复逻辑）；`.catch(兜底)`（一句话了事）；`allSettled`（批量收账，§2.5）。

**拆旧家具 ①②：`void main()` 为什么存在，又为什么退休了。** ex6 骨架时代的写法是：定义 `async function main()`，最后一行 `void main()` 启动。那行 `void` 是"**我故意不 await 这张单子**"的声明——不带它，`main()` 返回的 Promise 悬空没人接，里面任何 rejection 都会触发 D 段的崩溃；带了它，读代码的人（和 lint）至少知道你是故意的。而你拆成 top-level await 之后，模块顶层可以直接 `await`，main 包装整个不存在了——旧家具两件（包装函数 + void 启动）一起退休。**`rl.question` 前面的 await**：`question("提示")` 返回 `Promise<string>`，await 它 = 等用户敲完回车 + 拿到那一行——它和你 ex10 要写的 `sleep` 是同一个物种：把"将来才发生的事"（时间到 / 用户敲回车）包装成一张可等待的单。

### §2.4 串行 vs 并发：谜底是"创建即启动"

先看实测（300 / 500 / 800ms 三个任务）：

| 写法                                | 总耗时  | 发生了什么                          |
| ----------------------------------- | ------- | ----------------------------------- |
| `await a(); await b(); await c();`  | ≈1602ms | 一个干完，下一个**才开始**          |
| `const pa=a(), pb=b(), pc=c();`<br>`await Promise.all([pa,pb,pc]);` | ≈801ms  | 三个**创建那一刻就同时开跑**，等最慢的 |

关键事实：**Promise 在被创建的那一刻就开始执行了**。`a()` 这个调用就是"开始干活"；`await` 从不启动任何东西，它只是等。所以：

- 串行慢，不是因为 await 慢，是因为**第二个任务在第一个 await 完之前压根没被创建**；
- 并发快，不是 `Promise.all` 有什么魔法，是因为你**先创建了三张单**——all 只是拿着三张单一起等（收账）。

反直觉验证（ex10 思考题的答案，先自己跑再看）：`const slow = taskC()` 创建 800ms 任务，先 `await sleep(200)` 干别的，再 `await slow`——总耗时 **≈800ms，不是 1000ms**。因为 slow 从创建那刻就在跑，你等的那 200ms 里它也在跑。如果实测出来是 1000，说明你把 `taskC()` 写到了 `sleep(200)` 之后——那就真的变成"后创建"了。

Python 对照：`asyncio.gather` ≈ `Promise.all`；"忘了先 create_task 就直接 await"是 Python 侧的同款坑。

### §2.5 all vs allSettled：一个失败全失败，还是各自结算

|                      | `Promise.all`                          | `Promise.allSettled`                       |
| -------------------- | -------------------------------------- | ------------------------------------------ |
| 语义                 | 全成才成                               | 各自结算，永不 reject                      |
| 一个失败时           | **立刻**整体 reject——一个 100ms 就失败的任务，能让 800ms 的任务白等（实测 101ms 抛出时，它还没跑完） | 没有失败时——失败只是结果之一                |
| 返回类型             | `T[]`（全成才拿到）                    | `PromiseSettledResult<T>[]`                 |
| 适用场景             | 缺一不可的成组操作（5 个配置必须全到位）| 允许部分失败的批量操作（抓 10 个网页，单个失败不中断）|

两个手册不强调的补充：

- **all 短路后，其余单子并不消失。** 已经在跑的任务会跑完（JS 的 Promise 没有取消这回事），只是它们的结果被丢弃、你的 catch 先到一步。
- **`PromiseSettledResult<T>` 就是官方判别联合**——第 4 课你给 `Order` 手写的那个东西，标准库里的现身：

```typescript
type PromiseSettledResult<T> =
  | { status: "fulfilled"; value: T }        // 成功变体：才有 value
  | { status: "rejected"; reason: any };     // 失败变体：才有 reason
```

`status` 是判别字段，`r.status === "fulfilled"` 一比较，联合立刻收窄——成功分支里才有 `.value`。你上周手写的整套机制，这里原样运转。⚠️ 唯一的坑：`reason` 的类型是 `any`（和 `JSON.parse` 同款历史包袱）——直接点 `.message` 编译器不拦但纪律不许，**`instanceof Error` 窄化之后再点**，第 4 课功夫直接沿用。

### §2.6 黑盒清单（今天的和以前的）

今天新增两个黑盒，都只需要"照抄会用"：`retry` 签名里的 `<T>`（类型的参数，第 7 课转正）；`new Promise` 的完整深水区（手写 `sleep` 那一行够用，executor 细节不用学）。今天退休三个：top-level await（转正为正式用法）、`void main()`（§2.3 已拆）、`rl.question` 的 await（§2.3 已拆）。下一课新增一个大件：`fetch`——它也是 Promise 物种，但带着三条各不相同的错误路径，是第 6 课的主菜。

---

## §3 练习：80 分钟，主菜上桌

三个文件都在 `03_工程与异步/`：任务 1 在 `ex9_forget_await.ts` 做忘 await 实验，任务 2 在 `ex10_serial_concurrent.ts` 做计时对照，任务 3 在 `ex11_retry_settled.ts` 写 retry 和报告。

### 任务 1 · 忘 await 实验（20 分钟）

打开 `03_工程与异步/ex9_forget_await.ts`——三段实验代码在注释里，逐段放出来跑。硬性要求：

1. 每段**先预测**（§1.1 已经预演过，这里验证你的版本）、再取消注释、`tsc` 和 `tsx` 各跑一遍、现象写进「观察留痕」；
2. A 段的两个现象分开记：tsc 的报错**原文连错误码一起贴**（这份留痕是判卷证据，先例：第 4 课删 case 实验）；tsx 打出的那个值是什么、**为什么是它**；
3. B 段记下 tsc 的沉默和 tsx 打出的单子本体；
4. TODO 4 的一句话答案：A 段 tsx 打出的值，和第 1 课 `data.nama` 打出 undefined 是不是同一类事故？
5. 观察完把实验代码**注释回去**，项目回到 0 error——今天的红，亲手造、亲手消。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：A 段 tsx 打出 undefined，冤有头债有主
> tsx 不做类型检查，类型注解擦掉后 `user` 就是个 Promise 对象——`.name` 找不到，JS 给 undefined。和第 1 课 `data.nama` 同一个家族：**类型声称的和运行时拿到的可以不是一回事**。不一样的是病因：第 1 课是数据拼错字，这次是整张单子被你当货用了。

> [!tip]- 提示 2：B 段打出的是 Promise { <pending> }——这是今天最有教育价值的一行输出
> `console.log` 立刻执行，此刻 300ms 还没到，单子还在途。它至少是**看得见的**提货单；忘 await 更狠的下场是 A 段那种——单子被当成货，一路 silent undefined。

> [!tip]- 提示 3：C 段对照不是走过场
> 同样一行 `console.log(user3.name)`，只多一个 `await`，打出"小明"。今天整节课浓缩在这一处对比：**单子 vs 货**。

> ✅ **检查点（比写完代码更重要）**
> 三段留痕齐全；A 段的 TS2339 报错原文（含错误码）在案，tsx 的 undefined 有"为什么"；实验代码已注释回去、`npx tsc --noEmit` 回到沉默。

### 任务 2 · 串行 vs 并发计时（30 分钟）

打开 `03_工程与异步/ex10_serial_concurrent.ts`——预测先行，没跑之前写下两个数。硬性要求：

1. **预测先行**：跑之前把串行/并发的预期总耗时写进 TODO 1 的注释，写完不许改——对照差值就是"体感"本身；
2. 写 `sleep(ms)`（一行地基，提示 1 给了形状）；
3. 三个任务函数（300/500/800ms），各自开始/结束时打印一句——**并发时三个"开始"连着出现**，就是"同时开跑"的肉眼证据；
4. 串行版：三个 await 排队；并发版：**先创建三个变量、再 `Promise.all`**——写法顺序是本题题眼；
5. 思考题（TODO 6）：预测 → 实测 → 一句结论。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：sleep 的形状
> `new Promise((resolve) => { setTimeout(resolve, ms); })`——setTimeout 的第一个参数是"时间到了该干的事"，直接把 resolve 交给它。返回类型标 `Promise<void>`（没有货，只有"到点了"这件事本身）。

> [!tip]- 提示 2：计时模式，Date.now() 差值
> `const t0 = Date.now();` 开跑前存；结束后 `Date.now() - t0`。±50ms 都算达标，别追求毫秒级精确。

> [!tip]- 提示 3：思考题数字不对，先查创建位置
> 实测 ≈1000 而不是 ≈800，几乎一定是把 `taskC()` 写到了 `await sleep(200)` **之后**——那就真的是后创建了。单子什么时候开始跑，只由**创建那一刻**决定。

> ✅ **检查点**
> 预测两个字先写下了（且没改）；串行 ≈1600、并发 ≈800（±50ms）；并发输出里三个"开始"连续出现；思考题有一句结论——用你自己的话说出"Promise 什么时候开始跑"。

### 任务 3 · retry + allSettled 报告（30 分钟）

打开 `03_工程与异步/ex11_retry_settled.ts`——`retry` 签名照抄（`<T>` 黑盒，先例：ex6 的 rl），函数体是你的。硬性要求：

1. `flaky(name, failRate)`：`sleep(100)` 左右 + `Math.random() < failRate` 就 throw，否则返回数据串；
2. `retry<T>(fn, times)`：签名照抄；for + try/catch；某次成功返回值；全败把**最后一次**的错误抛出去（错误变量注解 `unknown`）；
3. **try 里必须是 `return await fn()`**——为什么不能是 `return fn()`，提示 3 是本题最值钱的一句；
4. 成功版 + 必败版（`failRate: 1`）都演示：必败版用 try/catch 接住（times = 3 是"总共试 3 次"）；成功版能看到"第 X 次尝试"的重试轨迹；
5. 5 个任务（失败率 0.2 / 0.5 / 0.8 / 0.5 / 0.5）丢进 `allSettled`，先打印总账"成功 X 个，失败 Y 个"，再逐条明细：成功带值、失败带理由；
6. 明细两道窄化：`r.status === "fulfilled"` 分支里才有 `.value`（判别联合）；失败理由**先 `instanceof Error` 再点 `.message`**——不许裸点 any。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：retry 的骨架
> `for (let attempt = 1; attempt <= times; attempt++)` 里 `try { return await fn(); } catch (err) { 记下 err，继续 }`。循环自然走完就是全败——throw 最后记下的那个。错误变量注解 `unknown`（第 4 课纪律），`throw` 一个 unknown 变量在 TS 里合法。

> [!tip]- 提示 2：PromiseSettledResult 是老朋友
> `r.status === "fulfilled"` 一比较，成功分支里 `r` 才有 `.value`——你第 4 课给 Order 手写的判别联合 + 窄化，官方 API 里原样运转（§2.5 有它的类型定义）。

> [!tip]- 提示 3：`return fn()` 和 `return await fn()`，差一个词，差一个世界
> `fn()` 同步阶段只是**发出单子**，失败发生在将来；不 await，catch 的管辖范围够不到那张单子——失败全部静默溜走，全败也"成功"返回。这是忘 await 的进阶变体：**这次连 tsc 都不响**，只有你脑子里那根弦。

> ✅ **检查点**
> 总账数字和明细条数对得上；失败明细的打印过了 `instanceof Error`；必败版演示输出里看得到 3 次尝试 + 最后的"3 次全败"；能口述 `return await` 的原因；`npx tsc --noEmit` 沉默。

### §3.4 自查清单

- [ ] ex9：三段现象留痕齐全，TS2339 报错原文（含错误码）在案
- [ ] ex9：实验代码注释回去，项目回到 0 error
- [ ] ex10：预测先写且未改；串行 ≈1600 / 并发 ≈800
- [ ] ex10：思考题实测数字 + 一句结论（创建即启动）
- [ ] ex11：`return await fn()` 的原因能说出来（catch 管辖范围）
- [ ] ex11：明细经 `status` 窄化；失败理由经 `instanceof Error` 窄化
- [ ] 全程没写 `as` / `!`，命名 camelCase

> 💡 **卡住 20 分钟就求助**
> 老规矩四样：期望什么、实际发生什么、完整报错、相关代码。今天尤其欢迎两类问题：任务 2 思考题的数字和你预测对不上（对不上才最有讨论价值）；任务 3 的 retry"全败了却没抛错"（十有八九是提示 3 那个词，但我想听你自己找到它）。

---

## §4 复盘：10 分钟检索练习

规则同前四课：**合上代码**，先在心里把答案完整说出来，再点开折叠对照。"感觉我知道"不算数——说得出来才算。答完之后，把三道复盘问题口述成文字发我，我来判卷：

1. 忘了 `await` 会发生什么？为什么 TypeScript 有时报错、有时不报？
2. `Promise.all` 和 `allSettled` 各自适用什么场景？"抓取 10 个网页，单个失败不中断"该用哪个？
3. `async` 函数里 `throw` 出去的错误，谁接得住？没人接会发生什么？

自测五题（每题先默答，再点开「看答案」）：

**Q1. async 函数里 `return 42`，调用方拿到什么？怎么变成 42？**

> [!question]- 看答案（先默答再点开）
> 拿到的是 `Promise<number>`——async 函数自己不发货，只发单，哪怕 return 的是字面量。`await` 之后才是 42。看类型先撕掉最外层 `Promise<` 再读，是这个课时的日常动作。

**Q2. `await 42` 合法吗？为什么这么设计？**

> [!question]- 看答案（先默答再点开）
> 合法，结果就是 42。await 遇到非 Promise 直接还值。这样你写的工具函数不必关心参数"是不是已经是值"——await 不伤害值，只拆单子，所以"不确定就 await 一下"永远安全。

**Q3. 三个 `sleep(800)` 一起 `await Promise.all`，总耗时多少？为什么既不是 2400 也不是 0？**

> [!question]- 看答案（先默答再点开）
> ≈800ms。不是 2400：三个单子在**创建那一刻**就同时开跑（前提：先创建再 all）；不是 0：await 是"等最慢的那张单结算"，不是"不等"。串行 2400 的病因从来不是 await 慢，是第二个任务在第一个结束前**压根没被创建**。

**Q4. `Promise.all` 短路了，其余任务怎么办？**

> [!question]- 看答案（先默答再点开）
> 已经在跑的照跑完（JS 的 Promise **没有取消**这回事），但结果被丢弃，catch 先到一步。所以"部分成功"的结果用 all 是拿不到的——要拿得到，用 allSettled。

**Q5. 失败分支的 `r.reason` 为什么不许直接点 `.message`？**

> [!question]- 看答案（先默答再点开）
> 它的类型是 `any`（历史包袱，`JSON.parse` 同款）——直接点编译器不拦、运行时 reason 不是 Error 就炸。先 `instanceof Error` 窄化再点，第 4 课"边界数据先验明正身"的纪律，在异步错误上原样适用。

---

## §5 下课

**学有余力（可选）**：两道都通向真实世界。① **超时赛跑**：给 `fetchUser()` 套一个 500ms 超时——`Promise.race([fetchUser(), timeout(500)])`，`timeout` 是你自己写的小函数（sleep 500ms 后 throw "超时"）。这是所有"请求超时控制"的最小原型。② **随机耗时**：`randomSleep(min, max)` 替换 ex11 里 flaky 的固定 100ms——离真实网络的抖动又近一步。

**完成后回来找我**：把复盘三题的口述发我，我判卷、勾计划里的 checkbox、记学习档案。第 5 课到这里，JS/TS 的主旋律你已经有体感了——单子与货、创建即启动、错误有人接。下一课换挡：**第 6 课 · 边界校验**。今天的 `fetchUser` mock 换成真的 `fetch`，带着三条各不相同的错误路径（断网 / 非 2xx / JSON 损坏）；再加上 zod——你在第 4 课手写的守卫，这次用官方自动化版重写。伏笔点名：`r.reason` 的 any、`JSON.parse` 的 any，第 6 课一起算总账。然后随时可以喊"**开始第 6 次课**"。

> 💡 **我是你的导师，不是课件**
> 这页是提词器，提问的地方在对话框里。今天特别欢迎拿来讨论的两类问题：任务 2 思考题的实测数字（和你预测对不上的那次，比做对十次都值钱）；以及"什么时候该用 all"——说你的**场景**（缺一不可还是允许部分失败），别背 API 名，场景判断才是今天的真功夫。

---

*上一课：[第 4 课 · 判别联合](0004-discriminated-unions.md) ｜ 下一课：第 6 课 · 边界校验（完成本课后解锁）*
*TypeScript 开发 · 20 小时速通 · 总计划见 [00_20小时速通计划.md](../00_20小时速通计划.md)*
