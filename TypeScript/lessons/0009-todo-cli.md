# 第 9 课 · 综合实战——待办事项完整版

> **TypeScript 开发 · 20 小时速通 · 9 / 10**
> 节奏：**20–30 分钟学**（§0–§2）→ **80 分钟练**（§3，代码放 `03_工程与异步/ex18_todo/`，备课时已建）→ **10 分钟复盘**（§4）。
> 今天是**组装课**——没有新概念，只有一件新工具（`node:fs`）。前八课的家当一次全部装上：判别联合（第 4 课）、zod 边界校验（第 6 课）、多文件与依赖方向（第 8 课）、vitest 测试护航（第 8 课）、状态机转移（ex7/ex16）。装完的东西不再是"演示能跑"，而是**你自己每天敢用的工具**。
> 你有 Python 基础——今天的熟人：`JSON.stringify` / `JSON.parse` ≈ `json.dump` / `json.load`，`existsSync` ≈ `os.path.exists`，"坏数据备份原文件再重建" ≈ 出事先把 db.json 改名留现场、别急着删。

---

## §0 开工准备（5 分钟）

先跑安检，还是两道：

```bash
npx tsc --noEmit   # 第一道：沉默（老规矩）
npm test           # 第二道：绿——Test Files 4 passed (4)，Tests 18 passed (18)
```

测试数的账：15 条是你 ex16/ex17 的（第 8 课），2 条是数据结构课的（`npm test` 扫全仓库，它的测试入镜属正常，别误判成自己的），还有 **1 条是今天新骨架的出生占位**（`ex18_todo/todo.test.ts`，你写完真测试后把它删掉，总数会自己变）。

今天配好了一个新脚本（package.json 的 scripts，第 8 课 §2.1 讲过这个字段）：

- `npm run todo -- add 买牛奶` → tsx 直跑待办 CLI 的入口（`--` 后面的参数转交给它本人）

练习目录已建好，在 `03_工程与异步/ex18_todo/`，五个文件各归各位（**归位表**，丑话②会再提）：

| 文件 | 住什么 | 谁 import 它 |
|---|---|---|
| `src/model.ts` | Task 三态判别联合 + 转移函数（纯类型与纯函数） | store（只搬类型）、cli、todo.test |
| `src/store.ts` | zod 合同 + parseDb 纯函数 + load / save（**fs 只准住这间**） | cli、todo.test |
| `src/cli.ts` | argv 解析 + 四命令分发 + 打印（导演） | **没人** |
| `todo.test.ts` | 转移矩阵 + parseDb 好坏数据 | （vitest） |
| `dogfood.md` | 任务 2 的使用记录表 | （人眼） |

**开场复查（10 秒）**：ex13 的进口清单第 4 行，你当时亲手标过——"文件内容——今天用到了吗？**没用到（第 9 课的待办 CLI 全用上）**"。今天营业。再想一件事：上节课结尾我说过，天气 CLI 每次跑完数据就飞了；今天的数据要**躺到磁盘上过夜**——明天的你、手滑的编辑器、甚至另一个程序，都可能碰它。它还安全吗？

> ⚠️ **一句丑话（专门写给你的前科）**
> 四条。① 涉及语法字符的整改，维持"**整行删掉重新键入**"、不做插字符式修补——并且**先把整行删干净再贴**（上两轮的半行残留都是这么来的）。② 今天五个文件各归各位（上面的归位表 + 每个骨架头部都写了）：**放错文件、或绕过模块直插别的文件，直接打回**——第 8 课"模块化半边跳过"的教训，大项目里代价更高。③ `npm test` 的数字见上：18 条里有 2 条是数据结构课的，报数时别把它们算进来。④ 复盘三题口述**仍然先于**练习判卷。

> 💡 **课前读什么**
> 无新材料。把前 8 次自己写的代码重读一遍，这本身就是最好的复习——重点四站：ex7 的 Order 状态机和 ex16 的测试矩阵（今天转移函数的模板）、ex12→ex17 的三间屋（今天的架构）、ex13 的进口清单（今天第 4 进口营业）、第 2 课通讯录的 id 发放（想想：删掉尾部的联系人再 add，会发生什么——今天要焊死这个 bug）。

---

## §1 核心认知：从"演示能跑"到"自己敢用"

> ◆ **本课唯一必须带走的东西**
>
> **从"演示能跑"到"自己敢用"，中间隔着一堆边界情况。**

前 8 课的每个程序，数据都活在一次运行里：跑完即散。今天的 todo CLI 第一次让数据**离开进程、躺到磁盘上过夜**——而磁盘恰恰是编译器管不到的地方：`Task` 类型再精确，也管不住半夜手滑的你自己改坏 todo.json。所以今天的核心动作只有一个：**在"数据进门"的地方重签合同**（zod），并且想好合同签不成时怎么办（兜底）。网络响应要校验（第 6 课）、文件内容同样要校验（今天）——同一个模式，换个进口而已。

三个推论，今天反复会用到：

1. **读回来的每一字节都是 unknown 心态。** 文件内容没有类型——`readFileSync` 给你的是 string，`JSON.parse` 之后是什么，只有天知道。
2. **坏了不许裸崩。** "演示能跑"的程序崩了重来就是；"自己敢用"的工具崩了，用户（明天的你）看到的是一屏调用栈。坏数据 → 备份现场 → 空库重建 → 一句人话。
3. **好工具是自己用出来的。** 所以任务 2 不是写代码，是用 15 分钟——用出别扭来，才知道边界在哪。

> ⚠️ **本课避坑**
> **别在 load 里"先跑起来再说"。** 兜底两分支（文件不存在 vs 文件坏了）是今天的正菜，不是装饰——文件不存在是**正常首跑**（安静起空库，别喊），文件坏了才是**事故**（备份 + 人话）。纪律延续：全程禁 `as` / `!`，命名 camelCase。

### §1.1 动笔预测（5 分钟）

老规矩，**先别用 IDE**。A、B 是 tsc 报不报、报什么；C 是运行时下场；D 只需纸面想。（A、B、C 的原文都是我备课实测的。）

```typescript
// A —— 从文件读回来的文本，直接当 Task[] 用
declare const text: string;
const tasks: Task[] = JSON.parse(text);
// ← tsc 报不报？（Task 三态判别联合，定义就在隔壁 model.ts）

// B —— 按号找任务，找到了就改
const t = tasks.find((task) => task.id === 1);
console.log(t.title);
// ← tsc 报不报？报什么？

// C —— todo.json 被手改坏了一个引号，程序启动时直接：
const text2 = readFileSync("todo.json", "utf8");
const db = JSON.parse(text2);   // 没有任何 try/catch 兜底
// ← 这行跑起来是什么下场？（提示：不是打印一句话的事）

// D —— 磁盘上的 todo.json，记事本改得、别的程序写得、明天的你也未必记得格式——
// 谁替你担保"这个文件里的内容还是 Task[]"？编译器？zod？还是没人？
```

写完再对照（猜错很正常，错在哪就是哪没懂；A、B、C 建议开工后亲手再遇一次）：

> [!success]- 对照答案（先写完再展开）
> **A：不报，一片沉默。** `JSON.parse` 的返回类型是 `any`——第 1 课你亲眼看过它放行 `data.nama`（undefined 的 length 当场 TypeError）。今天这个沉默升级成了正式风险：**文件里的数据冒充 `Task[]`，编译器不吱声**。"注解是声称，数据是事实"——这句从第 1 课跟到现在，今天轮到它当家：声称管不住磁盘，所以要在门口放 zod。
>
> **B：报，TS18048。** 原文：`'t' is possibly 'undefined'.`——find 的签名如实返回 `Task | undefined`（第 2 课起的老朋友），找不到 1 号任务时它就是 undefined。CLI 里 `done 99` 是用户天天会打的手滑，这道墙挡的就是它：先判 undefined 打印人话，再动 `t.title`。
>
> **C：当场炸给你看。** 实测现场（我备课改坏了一个引号）：
> ```
> {"nextId":3,"tasks":[{"id":1,"status":"todo","title":"买菜}]}
>                                                            ^
> SyntaxError: Unterminated string in JSON at position 59 (line 1 column 60)
>     at JSON.parse (<anonymous>)
>     ...
> ```
> 一个箭头指认坏字符 + 一屏调用栈，程序死在启动线上，用户没得到任何人话。**任务 1 的验收线，就是 C 不许发生**：同样的坏文件，你的程序要说"数据文件坏了，原样备份到 todo.json.bad，从空库重新开始"，然后活着继续。
>
> **D：没人——所以要让有人。** 编译器看不见磁盘（类型擦除的世界里根本没有它）；唯一能在运行时核对数据形状的，是你在门口摆的 zod schema。复盘题 2 预演完毕。

---

## §2 看清你写下的东西（20 分钟）

学前阅读是"重读旧代码"。这一节讲五件组装手册的事：第 4 进口的边界姿态、node:fs 三板斧、两层坏与兜底设计、Task 建模与 nextId 入库、三间屋的依赖方向。

### §2.1 第 4 进口营业：文件内容同样是边界

数一数这个 CLI 的数据进口：argv（add 的标题、doing 的 id）、**文件内容**（todo.json）——就这两个。对照 ex13 的四进口清单（argv / API 响应 / process.env / 文件内容），今天的进口比天气 CLI 少，但更凶：API 响应好歹有 open-meteo 的服务器在对面守约，**文件这边的"对面"是谁都可能**。第 6 课的结论原样适用，只换宾语：文件内容进门之前，谁看过它？没人看过的，都当 unknown。

### §2.2 node:fs 三板斧 + JSON 往返

```typescript
import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";

existsSync(DB_PATH)                          // 在不在（不抛错的探路者）
readFileSync(DB_PATH, "utf8")                // 读文本——"utf8" 不能省，见下
writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8")   // 写文本
renameSync(DB_PATH, DB_PATH + ".bad")        // 改名（备份坏文件现场）
```

- **`"utf8"` 为什么不能省**：实测省了它，tsc 当场报 `TS2345: Argument of type 'NonSharedBuffer' is not assignable to parameter of type 'string'.`——不带编码参数的 readFileSync 还给你的不是 string，是 Buffer（字节块）。有趣的是运行时它**碰巧能跑**（JSON.parse 会把 Buffer 隐式转成字符串）——又一个"类型层拦住、运行时碰巧"的样本：碰巧不是保证，这次是 tsc 救了你。
- **`JSON.stringify(db, null, 2)`**：null 占位（replacer，今天不用）、2 是缩进两格——写出的文件人能直接读。你的数据文件**长得像给人看的**，这是任务 2 能"手动改坏它做实验"的前提。
- **往返的裂缝就在中间**：stringify 出去的合法 JSON，过一夜回来可能什么都不剩——A 段的沉默（parse 返回 any）+ C 段的 SyntaxError 都发生在这条返程路上。所以下一节。

### §2.3 读回校验与兜底：两层坏，三分支

坏数据有两种坏法，**必须分清**——它们死在不同层：

1. **语法层坏**：引号丢了、多了个尾巴——`JSON.parse` 直接 throw（C 段那个 `Unterminated string`）。
2. **结构层坏**：语法合法，但内容不是你的格式——`status: "stuck"`、doing 任务缺 `startedAt`。JSON.parse 放行（它只管语法），**safeParse 在这里拦**。实测 zod 的报错相当清楚：`Invalid discriminator value. Expected 'todo' | 'doing' | 'done'`。

所以 `parseDb(text: string): Db | null` 是个纯函数，两层都接（骨架里给了完整写法）：try/catch 接语法层，safeParse 接结构层，任何一层坏 → null，**不裸崩**。它不碰 fs——这正是它可测的原因（§2.5）。

`load()` 拿着 parseDb 的结果走三分支：

- **文件不存在** → 首跑，**正常**：安静返回空库 `{ nextId: 1, tasks: [] }`。（它不是错误——第一次用工具的用户不该被"找不到文件"吓一跳。）
- **parseDb 返回 null** → 事故，兜底三连：`renameSync` 把坏文件改名成 `.bad` **保留现场** + 打印一句人话 + 空库重建。
- **好数据** → 原样进门。

为什么备份而不是直接覆盖重写？ex13 你自己写过结论——"把关口修在离根因最近的地方"；这里同理：**坏文件是案发现场**，覆盖等于毁尸。任务 2 里你要打开 `.bad` 看一眼自己改坏的样子——留着它，你才能验尸。

### §2.4 Task 三态与 nextId 入库

```typescript
type Task =
  | { status: "todo";  id: number; title: string }
  | { status: "doing"; id: number; title: string; startedAt: string }
  | { status: "done";  id: number; title: string; finishedAt: string };
```

- **判别联合**：ex7 的 Order（pending / paid / cancelled）的亲兄弟，规则一条没变：判别字段 `status` + 各变体只带自己的字段。"doing 却带 finishedAt"这种非法组合，**写都写不出来**。
- **转移函数**：`startTask`（todo→doing）和 `finishTask`（doing→done），非法输入 throw 人话——ex16 刚测过的 next 模式原样平移：`if (task.status !== "todo") throw new Error(...)` 之后，窄化生效，`{...task, status: "doing", startedAt: now()}` 里每个字段都有编译器背书。
- **nextId 为什么入库**：第 2 课通讯录的 bug——id 从"尾部 id + 1"推导，删掉尾部再 add，新联系人**复活了旧 id**。当时你修成 `nextId++` 内存计数；今天内存隔夜就没了，所以计数器必须跟着数据一起写进文件：`{ nextId, tasks }` 才是完整的库。重启也单调递增，bug 从根上焊死。任务 1 验收有一条专门查它。

### §2.5 三间屋与"纯到可测"的线

依赖方向第 8 课定过型，今天原样适用：**model 谁也不 import；store import model（只搬类型）；cli import 全部，没人 import cli**。两条新加的线：

- **fs 只准住 store**。model 纯类型与纯函数（不碰文件、不碰 argv、不打印）——所以转移矩阵能用 vitest 扫（todo.test.ts 的 ①–③）；cli 只做编排（解析、调用、打印、exit）——它的对错交给任务 2 的真手实测。
- **让 tsc 替你盯两份声明**。Task（model 里的手写类型）和 taskSchema（store 里的 zod 合同）是**两份独立的声明**——走散了怎么办？骨架里那行"过桥费"：`const db: Db = r.data`（把 zod 推断出的类型交给 Db 注解）。schema 哪天少写一个字段，这行先红。运行时 zod 核对数据，编译期 tsc 核对两份声明——复盘题 2 的完整答案在这。

### §2.6 黑盒清单（今天的和以前的）

今天新增三个黑盒，都只需"见过名字"：**流式 fs**（createReadStream 一族——大文件才需要，今天用同步三板斧够）；**并发写与文件锁**（两个进程同时写同一个 todo.json 会怎样——真有一门学问，今天假装世界上只有一个你）；**import.meta.url 定位自身目录**（比"约定从仓库根跑"更硬的路径方案，等级 3 见）。今天退休一个：**node:fs**（从"没见过"到"三板斧会用"）。下一课预告：**第 10 课毕业实战**——GitHub 仓库体检 CLI 或 AI 调用加固器二选一，2 小时独立交付，允许且鼓励复用今天的一切。

---

## §3 练习：80 分钟，前八课的家当一次装上

目录 `03_工程与异步/ex18_todo/`，五个文件的归位表见 §0。**顺序有讲究**：model → store → cli（前一间是后一间的 import 来源），测试最后写（得先有东西可测）。

### 任务 1 · 待办 CLI（60 分钟）

硬性要求（判卷对账用）：

1. **model.ts**：Task 三态判别联合（字段见 §2.4）+ `startTask` / `finishTask` 转移函数——非法输入 throw 人话（ex16 模式平移）；
2. **store.ts**：zod 合同（`z.discriminatedUnion` 模板在骨架黑盒区）+ `parseDb` 纯函数（两层坏都回 null，不裸崩）+ `load` 三分支（首跑安静空库 / 坏文件备份 `.bad` + 人话 + 重建 / 好数据进门）+ `save` 格式化写盘；
3. **cli.ts**：add / list / doing / done 四命令；五条错误路径（无命令 / 空标题 / 找不到 id / 非法转移 / 不认识的命令）**每条都打印人话 + `process.exit(1)`**，全程不许裸崩；
4. **todo.test.ts**：≥5 条 it（必测清单在骨架 TODO 10：合法转移 ×2、非法被拒 ×2、parseDb 好 / 坏各 1），写完删掉出生占位；
5. **坏文件实测留痕**：手动改坏 todo.json → 启动 → 拿到人话 + `.bad` 现场 + 空库（对照 §1.1 C 的死法，一句话写进 dogfood.md 第 11 行）；
6. **nextId 验证留痕**：add 两条 → 删库文件重来一遍没必要——直接验证"add 3 条后重启程序再 add，id 是 4 不是 1"（nextId 活过了重启，第 2 课 bug 的回马枪验尸）。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：find 之后那道墙，和 throw 的接法
> `db.tasks.find(t => t.id === id)` 返回 `Task | undefined`——先判 undefined（打印"找不到任务 #99" + exit 1）再动它，TS18048 别硬闯。转移函数 throw 出来的 Error 用 try/catch 接：`error instanceof Error` 窄化后打印 `error.message`——第 4 课 ex7 演示区的同款动作，错误的人话从 model 一路送到用户眼前。

> [!tip]- 提示 2：finishTask 里的 spread 会偷渡
> `{...task, status: "done", finishedAt: now()}` 把 doing 的 `startedAt` 也展开带上了——done 变体身上多了个不该有的字段。编译器不拦（spread 不做多余属性检查），文件里也看不出来，但它就是脏数据。白名单重建：`{ status: "done", id: task.id, title: task.title, finishedAt: now() }`——一个字段一个字段报，报不出私货。

> [!tip]- 提示 3：两层坏是两种病，别开错药
> try/catch 接的是 **JSON.parse 的 throw**（语法层）；safeParse 拦的是**结构层**（语法合法但内容不对）。只写 safeParse 不包 try——语法层坏照样裸崩（C 段）；只包 try 不用 safeParse——`status: "stuck"` 畅通无阻（A 段的 any 就这么进门）。两个都要，骨架 TODO 5 的写法就是完整版。

> ✅ **检查点（比写完代码更重要）**
> 四命令一条龙跑通（add → list → doing 1 → done 1）；五条错误路径人人有话说、exit 1；坏文件实测：人话 + `.bad` 现场 + 空库重建，程序活着；重启后 nextId 单调；≥5 条 it 全绿、占位已删；`npx tsc --noEmit` 沉默 + `npm test` 绿（Test Files 4，报数剔除数据结构课的 2 条）；五个文件各归各位（§0 归位表）；全程没写 `as` / `!`，命名 camelCase。

### 任务 2 · 真实使用 15 分钟（20 分钟）

打开 `dogfood.md`——命令流水表和建议路线都画好了（⑧ Ctrl+C 打断后再启动、⑨ 手动改坏 JSON 再启动，两个破坏性场景**必须做**）。跑完 10+ 条命令，把 **3 个失败或别扭的瞬间**记进表里（现场 / 现象 / 根因猜一层 / 怎么改）——根因那栏就是复盘题 1 的答案来源。

> ✅ **检查点**
> 10+ 条命令流水原样记录（不美化）；两个破坏性场景有现场；3 个别扭瞬间四栏齐全；一句结论。

### §3.4 自查清单

- [ ] model：三态判别联合 + 两个转移函数，非法输入 throw 人话（ex16 模式平移）
- [ ] store：parseDb 两层坏都回 null；load 三分支齐，坏文件留 `.bad` 现场 + 人话 + 空库重建，不裸崩
- [ ] cli：四命令全通；五条错误路径人话 + exit 1；find 之后先判 undefined（TS18048 没硬闯）
- [ ] 测试：≥5 条 it 全绿（合法 ×2 / 非法 ×2 / parseDb 好 ×1 坏 ×1），出生占位已删
- [ ] 留痕：坏文件实测 + nextId 重启验证，都记进 dogfood.md
- [ ] 重启后 id 单调（第 2 课 bug 的回马枪通过）
- [ ] `npx tsc --noEmit` 沉默 + `npm test` 绿；全程没写 `as` / `!`，命名 camelCase

> 💡 **卡住 20 分钟就求助**
> 老规矩四样：期望什么、实际发生什么、完整报错、相关代码。今天尤其欢迎三类：`JSON.parse` 相关的炸（贴完整现场，我们对一看是哪层坏）；zod 报错看不懂的（`Invalid discriminator value` 这类其实说的是人话，一起读）；以及 dogfood 里用出来的别扭瞬间——那不是麻烦，是任务 2 的交付物本身。

---

## §4 复盘：10 分钟检索练习

**规矩不变（§0 丑话④）**：练习做完，**先把三题口述发我，再交练习判卷**。合上代码先在心里说完整，再点开折叠对照——"感觉我知道"不算数。

1. 你记录的 3 个别扭瞬间，根因分别在哪一层：类型建模、边界校验、还是错误处理？
2. 文件里存的数据和内存里的 `Task` 类型是什么关系？谁保证它们一致？
3. 这个项目和第 2 次的内存通讯录比，复杂度涨在哪里？这些复杂度哪些是本质的？

自测五题（每题先默答，再点开「看答案」）：

**Q1. `readFileSync(DB_PATH)` 少写了 `"utf8"`，tsc 报什么？运行时呢？**

> [!question]- 看答案（先默答再点开）
> tsc 报 `TS2345: Argument of type 'NonSharedBuffer' is not assignable to parameter of type 'string'.`——不带编码参数，还给你的是 Buffer（字节块），而 JSON.parse 只收 string。运行时**碰巧能跑**（JSON.parse 会把 Buffer 隐式转字符串）——但"碰巧"不是"保证"，这次是类型层拦住了一个运行时隐患：带 `"utf8"`，拿到的直接就是 string。

**Q2. parseDb 里的 try/catch 和 safeParse，各拦哪层坏？只写一个会漏什么？**

> [!question]- 看答案（先默答再点开）
> try/catch 接**语法层**（JSON.parse 的 throw——引号丢了、尾巴多了）；safeParse 拦**结构层**（语法合法但内容不合同——status: "stuck"、缺 startedAt）。只写 safeParse：语法层坏照样裸崩（§1.1 C 段）。只包 try：结构坏畅通无阻（any 进门，A 段的沉默）。两层都要——两种病，两种药。

**Q3. 坏文件为什么改名备份成 `.bad`，而不是直接覆盖重写？**

> [!question]- 看答案（先默答再点开）
> 坏文件是**案发现场**：怎么坏的、坏在哪，覆盖了就永远不知道（ex13 的结论——把关口修在离根因最近的地方；验尸需要尸体）。空库重建让程序活下来，`.bad` 让你有机会回头查为什么坏——"活着"和"知道为什么"两个都要。

**Q4. `{...task, status: "done", finishedAt: now()}`——这行 done 转移有什么隐患？**

> [!question]- 看答案（先默答再点开）
> doing 的 `startedAt` 被 spread 偷渡进 done 变体——多余字段。编译器不拦（spread 不触发多余属性检查），但文件里从此躺着脏数据。白名单重建——逐字段报出 done 该有的三样 + finishedAt——一个不多一个不少。和第 4 课 `as` 那课的教训同根：**黑名单式搬运（留旧的加新的）会走私，白名单式申报才干净**。

**Q5. nextId 为什么要跟 tasks 一起写进文件？不存它会怎样？**

> [!question]- 看答案（先默答再点开）
> nextId 是内存计数器，不落盘就活不过重启。不存它、改从数据推导（尾部 id + 1）——第 2 课通讯录的 bug 原样复发：删掉尾部任务再 add，新任务**复活旧 id**（旧 id 的引用全部错乱）。`{ nextId, tasks }` 整库落盘，重启后计数照旧单调——那个 bug 的持久版清算。

---

## §5 下课

**学有余力（可选，做多少算多少）**：① **原子写**：`writeFileSync` 先写 `todo.json.tmp` 再 `renameSync` 成 `todo.json`——Ctrl+C 打断在写盘中途，半截文件就不会成为正身（dogfood 第 10 行体验的正式解法，文件系统圈的"先搬家再改口"）。② **list 过滤**：`npm run todo -- list todo / list done`——argv 第二参数过滤状态，顺手体会"命令也是数据进门"。③ 给 parseDb 再补两条用例：空文件（`""`）、合法 JSON 但不是对象（`"3"`）——它会刷新你对"结构层坏"的理解。

**完成后回来找我**：先把复盘三题口述发我（丑话④），我判卷、勾计划里的 checkbox、记学习档案。今天过后，你有了第一个**数据能过夜、坏数据不裸崩、测试全绿护航**的真工具——最后一课的毕业项目，就是把这套底盘开出去交付一个完整的小东西。下一课：**第 10 课 · 毕业实战——mini 项目从零到一**（二选一：GitHub 仓库体检 CLI / AI 调用加固器，允许且鼓励复用前 9 次的一切代码）。然后随时可以喊"**开始第 10 次课**"。

> 💡 **我是你的导师，不是课件**
> 这页是提词器，提问的地方在对话框里。今天特别欢迎拿来讨论的三类问题：你的 parseDb 和兜底设计（备份命名、人话文案——工程品味是聊出来的）；dogfood 里用出来的别扭瞬间（那是你的工具和你的第一次正式对话）；以及"我能不能再加个命令"——能，加什么、放哪个文件、要不要配测试，先说给我听。

---

*上一课：[第 8 课 · 工程化与测试](0008-engineering-testing.md) ｜ 下一课：第 10 课 · 毕业实战（完成本课后解锁）*
*TypeScript 开发 · 20 小时速通 · 总计划见 [00_20小时速通计划.md](../00_20小时速通计划.md)*
