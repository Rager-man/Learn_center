# 第 2 课 · 用类型建模数据——写代码之前先画图纸

> **TypeScript 开发 · 20 小时速通 · 2 / 10**
> 节奏：**30 分钟学**（§0–§2）→ **80 分钟练**（§3，代码放 `01_语法起步/`）→ **10 分钟复盘**（§4）。
> 第 1 课你知道了"类型会被擦除"、管不到运行时。这一课讲它真正管得到、也最值钱的地方：**写代码之前，逼你把数据的形状想清楚**。
> 你有 Python 基础，今天的 interface / type 就是你熟悉的"给字典定形状"，但多了几样 Python 没有的玩具：字面量联合你已经会了，今天再加 `?`、`readonly` 和 `as const`。

---

## §0 开工准备（5 分钟）

环境第 1 课已经就位，只需确认它还活着。在 `TypeScript/` 根目录：

```bash
npx tsc --noEmit   # 应该沉默——第 1 课的成果还在
```

练习文件我已经为你建好：`01_语法起步/ex4_contacts.ts`——**今天两个任务全在这一个文件里**，骨架和 TODO 列表都在里面，不用自己建文件。

> 💡 **课前读什么**
> [官方 Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) "Everyday Types" 的**对象类型（Object Types）、数组（Arrays）、函数（Functions）**三部分；顺带把[现代 JavaScript 教程](https://zh.javascript.info)的**数组方法**（map / filter / find）扫一遍——那是 Python 列表推导在这里的对应物，§2.4 有对照表兜底。
> 老顺序：先把 §1–§2 读完再去看——你会发现自己已经看得懂了，那种感觉就是对的学习顺序。

---

## §1 核心认知：类型是数据的图纸

> ◆ **本课唯一必须带走的东西**
>
> **类型的真正价值不是"编译器不报错"，而是逼你在写代码之前，把数据的形状想清楚。**

第 1 课的安检比喻，管的是"你写代码的手"（别把字符串当数字用）；这一课管的是**数据本身长什么样**。先看没有图纸的世界：

```typescript
// Python 联系人：形状活在你的记忆里，代码里查无实据
contact = {"name": "小钟", "tags": ["家人"]}
contact["phon"]        # 拼错键名——运行时才 KeyError，不碰这行就永远不知道

// TypeScript：先画图纸，再施工
interface Contact {
  id: number;
  name: string;
  phone?: string;      // ← 业务事实一：有人没电话 → 这个字段可以缺席
  tags: string[];      // ← 业务事实二：标签不止一个 → 数组
}
const c: Contact = { id: 1, name: "小钟", tags: ["家人"] };
c.phon;                // ← 红线当场亮起，拼错走不出这一行
```

**图纸 = 在写第一行函数之前，先回答一串关于数据的问题**：每个联系人一定有电话吗（`?`）？什么字段创建后不许改（`readonly`）？标签是随便填的字符串，还是只有固定几个合法值（`as const`）？——这些问题不回答，代码照样能跑；回答了，一大类 bug 在出生前就不存在。这就是计划里那句话的分量：**类型的真正价值是逼你把数据形状想清楚**。

> ⚠️ **本课避坑**
> 图纸画得太早或太细，和没画一样糟。今天的实战顺序永远是：**想清楚字段 → 定义 Contact → 再写函数**。反过来（写着函数顺手补类型）也能跑，但你会错过"逼你想清楚"的那一下——本课练习按这个顺序设计，别跳。

### §1.1 动笔预测（5 分钟）

老规矩，**先别用 IDE**。假设 `contacts` 是 `Contact[]` 且里面暂时没有人，逐段预测：`npx tsc --noEmit` 报不报错？`npx tsx` 跑起来炸不炸？

```typescript
// A —— phone 是可选的
const c: Contact = { id: 1, name: "小钟", tags: [] };
const len: number = c.phone.length;

// B —— phone 被标了 readonly（假设 Contact 里写的是 readonly phone?: string）
c.phone = "13800000000";

// C —— 不报错题：悬停（或猜）VALID_TAGS 的推断类型
const VALID_TAGS = ["家人", "朋友", "同事", "工作"] as const;

// D —— 从数组里找人
const found: Contact = contacts.find(c => c.id === 1);
```

写完再对照（猜错很正常，错在哪就是哪没懂）：

> [!success]- 对照答案（先写完再展开）
> **A：只编译错。**`error TS18048: 'c.phone' is possibly 'undefined'.`——可选属性访问出来是 `string | undefined`，而 `undefined` 身上没有 `.length`。tsx 跑呢？**看运气**：这条数据恰好有 phone 就不炸，没有才 TypeError。编译期必拦、运行时看数据——第 1 课"声称 vs 事实"的续集。这个 `| undefined` 是第 3 次课的主角，今天先记住它的长相。
>
> **B：只编译错，而且运行时改得悄无声息。**`error TS2540: Cannot assign to 'phone' because it is a read-only property.`但 tsx 跑起来**不拦、直接改成功**——readonly 和所有类型一样会被擦除（第 1 课认知直接复用）。它的全部作用，是把"这东西不该改"从一句注释升级成一条红线。
>
> **C：`readonly ["家人", "朋友", "同事", "工作"]`。**as const 一次干了两件事：数组变成 readonly 元组（长度焊死为 4）、每个元素收窄成字面量类型。对照：不加 as const，推断出来的是 `string[]`——"只有这四个词"的信息丢了。任务 2 就靠它圈住合法标签。
>
> **D：只编译错。**`Type 'Contact | undefined' is not assignable to type 'Contact'`——`find` 找不到时返回 undefined，签名如实相告。注意它和 A 是**同一个形状**："可能没值"在类型世界的写法就是 `| undefined`。编译器为什么这么"悲观"？因为数组里可能根本没有 id 为 1 的人——它在替运行时担心。
>
> 四段合起来：`?`、`readonly`、`as const`、`find` 四个新玩具，干的都是同一件事——**把业务事实画进类型**：缺席合法、不许修改、只有四个值、可能找不到。

---

## §2 看清你写下的东西（30 分钟）

学前阅读讲"每个语法是什么"。这一节讲四件手册不会直说的事：两支笔怎么选、缺席和禁改怎么画、长度有几种态度、数组方法怎么和列表推导对上。

### §2.1 interface 与 type：图纸的两支笔

|                         | `interface` | `type` |
| ----------------------- | ----------- | ------ |
| 描述对象形状            | ✅          | ✅     |
| 联合类型 `A \| B`       | ❌          | ✅     |
| 交并集 `A & B`          | ❌          | ✅     |
| 从已有类型加工（工具类型、索引取值） | ❌ | ✅ |
| 同名自动合并            | ✅（一般当坑看） | ❌ |

取舍规则一条：**描述"一个东西长什么样"用 `interface`；做"类型的计算"（联合、交并、从别的类型加工出来）用 `type`——后者没得选，只能它。** 都能用时任选其一并不重要，团队统一才重要——本课程统一按这条走。

今天你两支笔都会用到：`Contact` 用 interface（它就是"一个东西长什么样"）；任务 2 的 `type Tag = (typeof VALID_TAGS)[number]` 只能是 type——它是一次"从数组类型里取出元素类型"的计算。

### §2.2 `?` 与 `readonly`：把业务事实画进图纸

```typescript
interface Contact {
  id: number;
  name: string;
  phone?: string;            // ← 业务事实一：有人没电话 → 字段可以整个缺席
  readonly createdAt: string; // ← 业务事实二（示意）：创建时间不许改
}
```

**`?` 的完整含义**：访问 `contact.phone` 得到的是 `string | undefined`——不是"可能是 string"，而是**类型系统如实告诉你它可能没有**。这不是找麻烦，是"可能没有"这个业务事实在类型世界的投影。怎么把 `string | undefined` 安抚成能安全使用的 `string`，是第 3 次课（窄化）的全部内容；今天先体验编译器拦你，习惯这个红线。

**`readonly` 的两个真相**：

1. 它是**浅层的**：只锁"在这个对象上改这个属性"，不锁属性指向的东西。`readonly tags: string[]` 拦得住 `contact.tags = []`，拦不住 `contact.tags.push("家人")`——要连元素都锁，得写 `readonly string[]`（学有余力会踩到）。
2. 它**只存在于编译期**：§1.1 的 B 你已亲眼看过，tsx 跑起来照改不误。它的价值不是"防止修改"，是**把"不该改"的意图写进签名**——所有读到这个类型的人（包括半年后的你）都被红线拦一次。

Python 对照：`phone?: string` ≈ `str | None`，但 TS 的可选是"字段可以整个不出现"，比 Python 的 `Optional`（字段仍在、值可为 None）少一层纠缠；`readonly` 没有直接对应物，最接近 frozen dataclass 的味道。

> ⚠️ **复查点（第 1 课的约定，回来查岗）**
> 第 1 课约好的："边界写死、内部放手"。今天升级半句：**类型定义（Contact）就是最大的边界**——值得写全写死；函数签名是第二道边界——必须完整；函数体内的局部变量，继续让推断干活。任务 1 写完后回来对照：你是不是又给每个局部变量都标注解了？

### §2.3 数组、元组、as const：对长度的三种态度

```typescript
const tags: string[] = ["家人", "紧急"];          // 数组：个数随便变
const point: [number, number] = [121.5, 30.9];    // 元组：位置和类型焊死
const VALID = ["家人", "朋友", "同事", "工作"] as const;  // as const：个数 + 值全焊死
```

| 写法                     | 长度       | 元素类型           | Python 对应            |
| ------------------------ | ---------- | ------------------ | ---------------------- |
| `string[]`               | 任意       | 全是 string        | `list[str]`            |
| `[string, number]`       | 焊死       | 每个位置各定       | `tuple[str, int]`      |
| `as const` 数组          | 焊死       | 每个位置的字面量   | `Final` + `Literal` 的合体 |

两个值得知道的细节：

- 元组的长度是**类型信息**：越界访问直接编译错——`error TS2493: Tuple type '[string, number]' of length '2' has no element at index '5'.`普通数组可没这个待遇（第 1 课 §1.1 的 C：`scores[9]` 编译放行，跑出 NaN）。
- 元组日常用得少（"返回多个值"的场合第 5 课有更好的工具），今天认识长相即可；**as const 是主角**——任务 2 见真章。

### §2.4 数组方法：列表推导的对应物

今天写通讯录，三个方法天天见：

| 你想干的事       | Python                                  | TypeScript                |
| ---------------- | --------------------------------------- | ------------------------- |
| 每个元素变形     | `[x * 2 for x in xs]`                   | `xs.map(x => x * 2)`      |
| 按条件筛选       | `[x for x in xs if x > 0]`              | `xs.filter(x => x > 0)`   |
| 找第一个满足的   | `next((x for x in xs if x > 0), None)`  | `xs.find(x => x > 0)`     |
| 找下标           | `xs.index(x)`（找不到抛异常）           | `xs.findIndex(...)`（找不到得 **-1**，不是 undefined） |
| 存不存在         | `x in xs` / `any(...)`                  | `xs.some(...)` / `xs.includes(x)` |

三个要紧的注意：

- **`find` 返回 `T | undefined`**——找不到就是 undefined，签名如实写着，别直接当 `T` 用（§1.1 的 D）；
- **`map` / `filter` 返回新数组**，不动原数组——和 Python 列表推导一样；要原地增删得用 `push` / `splice`（任务 1 的 remove 会碰到 splice，用到时查一下即可）；
- `findIndex` 找不到返回 `-1`——历史包袱（它比 undefined 早出生二十年），判断时用 `=== -1`。

### §2.5 函数完整签名：每个函数都是一条边界

第 1 课的规则今天落地成四个函数。签名 = 函数对外的全部承诺：**收什么、还什么、什么会缺席**。两个新玩具会出现在签名里：

```typescript
// 玩具一：可选参数——排在最后，调用时可以不传
function add(name: string, tags: string[], phone?: string): Contact { ... }

// 玩具二：对象参数——参数本身是一张小图纸，字段各自可选
function update(id: number, changes: { name?: string; phone?: string }): Contact | undefined { ... }
```

第二个玩具就是"部分更新"的类型写法：`changes` 里每个字段都可选，"只改给的字段"靠它 + 展开运算符实现（提示 2 见）。第 7 次课会用工具类型把这张小图纸一行写完——今天手写一次，你才记得住它替你干了什么。

---

## §3 练习：80 分钟，主菜上桌

全部代码在**同一个文件**：`01_语法起步/ex4_contacts.ts`（骨架已建好，TODO 0–7 就在文件里）。任务 1 写通讯录本体，任务 2 在同文件底部的实验区做改造实验——**不需要建任何新文件**。

### 任务 1 · 内存通讯录（60 分钟）

打开 `01_语法起步/ex4_contacts.ts`，从 TODO 0 做到 TODO 5。硬性要求两条：

1. `Contact` 四个字段：`id: number`（自增，从 1 开始）、`name: string`、`phone?: string`、`tags: string[]`；
2. `add` / `remove` / `update` / `findByTag` 四个函数，**参数和返回值全部有类型**，strict 下 0 error。

先画图纸再动工（§1 的避坑）。另外三个**设计决策留给你**——没有标准答案，但写完你必须能说出为什么这么选：

1. `remove(id)` 要删的东西**不存在**时：返回 `false`？返回被删的那个？还是打印一句返回 `void`？选一个，返回类型照着写。
2. `update(id, changes)` 的 `changes` 长什么样：哪些字段允许改、哪些不许？（§2.5 玩具二就是它的形状。）
3. `add` 的 `phone` 参数：没电话的联系人怎么 add？（§2.5 玩具一。）

- 💡 三条提示折叠在下面，想清楚再点开：

> [!tip]- 提示 1：自增 id 最简单的做法
> 模块顶层放一个计数器：
> ```typescript
> let nextId = 1;
> // add 里：
> const contact: Contact = { id: nextId, name, phone, tags };
> nextId += 1;
> ```
> 顺手想一个建模问题：为什么不让调用方自己传 id？（提示：调用方传，就得有人保证不重号——这个保证该写在哪一侧的签名里？）

> [!tip]- 提示 2：update"只改给的字段"用展开运算符一行
> ```typescript
> const updated: Contact = { ...old, ...changes };  // ← changes 里没有的字段，保持 old 的
> ```
> 剩下的问题是：`old` 找不到怎么办？——对，又是 `T | undefined`。今天它已经第三次出场了（§1.1 两次 + 这次），第 3 课它转正。

> [!tip]- 提示 3：remove 要真的动原数组
> `filter` 返回新数组、不动原数组。要真删，用 `splice` 原地删：
> ```typescript
> const i = contacts.findIndex(c => c.id === id);  // ← 找不到得 -1，不是 undefined（§2.4 的坑）
> if (i === -1) return ???;                         // ← 你的设计决策在这里落地
> contacts.splice(i, 1);                            // ← 从下标 i 开始删 1 个
> ```

> ✅ **检查点（比写完代码更重要）**
> 跑 `npx tsx 01_语法起步/ex4_contacts.ts`，演示区（TODO 5）应能看到：add 三条后打印出 3 个联系人——**没有电话的那条，打印出来压根没有 phone 字段**（不是 `null`，是整个缺席）；`findByTag` 只出该出的；`update` 后只有目标字段变了；删存在的 id 成功、删不存在的 id 走你设计的分支。最后 `npx tsc --noEmit` 沉默。

### 任务 2 · 改造实验（20 分钟）

继续在 `01_语法起步/ex4_contacts.ts` 底部的**实验区**做（TODO 6–7）。两个实验：一个观察完**要撤销**，一个**保留**——看清指令再动手。

**实验 1 · readonly 拦什么、不拦什么（10 分钟）**

1. 给 `Contact` 的 `phone` 加上 `readonly`（改成 `readonly phone?: string`）；
2. 在实验区写两行代码：一行**在旧对象上改属性**（`某联系人.phone = "..."`），一行**造个新对象整个换掉**（`contacts[0] = { ...contacts[0], phone: "..." }`）；
3. 跑 `npx tsc --noEmit`：哪行红、哪行不红？把红的**报错原文 + 一句中文翻译**写进实验区注释，格式照这样：
   ```typescript
   // error TS2540: Cannot assign to 'phone' because it is a read-only property.
   // ↑ 翻译：phone 是只读属性，不许在旧对象上赋值
   ```
4. 再看你的 `update` 函数红没红——红，说明你是直接改属性；没红，说明你是整体换新对象。两种实现都对，但现在你能用 readonly 这面镜子照出自己写的哪一种；
5. 观察完：**错误行注释掉（报错记录留着）、readonly 撤销**，恢复 `npx tsc --noEmit` 沉默。这个实验观察完就撤，别留在代码里。

**实验 2 · as const 圈住合法值（10 分钟）**

1. 定义合法标签：`const VALID_TAGS = ["家人", "朋友", "同事", "工作"] as const;`
2. 悬停 `VALID_TAGS`，确认类型是 `readonly ["家人", "朋友", "同事", "工作"]`（§1.1 C 答案兑现）；
3. 照抄这一行（`(typeof X)[number]` 读作"X 这个数组里元素的类型"，第 7 次课正式讲原理，今天先照抄）：
   ```typescript
   type Tag = (typeof VALID_TAGS)[number];   // ← 现在它是 "家人" | "朋友" | "同事" | "工作"
   ```
4. 改造：`Contact` 的 `tags` 换成 `Tag[]`，`findByTag` 的参数换成 `tag: Tag`，`add` 的 tags 参数换成 `Tag[]`；
5. 在演示区试着 `add` 一个带**非法标签**（比如 `"同学"`）的联系人 → 跑 `npx tsc --noEmit` → 把报错原文 + 翻译写进注释 → 把非法那行注释掉；
6. **这个改造保留，不撤销**——你的通讯录从此标签永不出错，合法值清单就写在代码里。

> ✅ **检查点**
> 实验 1：能说出"readonly 拦旧对象上改属性（TS2540）、不拦造新对象整体换"，且 tsc 已恢复沉默；实验 2：`findByTag("家人")` 能过、非法标签编译期被拦（TS2322 抄进注释），改造保留、tsc 沉默。

### §3.4 自查清单

- [x] 四个函数签名完整（参数 + 返回值都有类型），`npx tsc --noEmit` 沉默 ✅ 2026-09-01
- [x] 没有电话的联系人 add 成功，打印出来**整个没有 phone 字段**（不是 null） ✅ 2026-09-01
- [x] 能说出 remove / update 的"找不到"分支各返回什么、为什么这么选 ✅ 2026-09-01
- [x] 实验 1：亲眼见过 TS2540，能解释为什么 readonly 拦不住"换新对象"；实验后已恢复沉默 ✅ 2026-09-01
- [x] 实验 2：非法标签编译期被拦（TS2322 抄进注释），`type Tag` 改造保留在代码里 ✅ 2026-09-01
- [x] 复查：没有给函数体内的局部变量逐个写注解（边界写死、内部放手） ✅ 2026-09-01

> 💡 **卡住 20 分钟就求助**
> 老规矩：期望什么、实际发生什么、完整报错、相关代码，四样贴给我。今天的"设计决策"题（remove 返回什么）想不透也可以直接问——设计讨论不是作弊，是学习本体。

---

## §4 复盘：10 分钟检索练习

规则同第 1 课：**合上代码**，先在心里把答案完整说出来，再点开折叠对照。"感觉我知道"不算数——说得出来才算。答完之后，把三道复盘问题口述成文字发我，我来判卷：

1. `interface` 和 `type` 你会怎么选？说得出一条自己的规则。
2. 可选属性 `phone?: string`，访问 `contact.phone` 时拿到的是什么类型？这为下一次课埋了什么伏笔？
3. 你的通讯录里，哪个函数的返回类型最难写？为什么？

自测五题（每题先默答，再点开「看答案」）：

**Q1. `interface` 和 `type` 各自的"独占领地"是什么？**

> [!question]- 看答案（先默答再点开）
> **interface 只能描述形状（对象、函数）；type 还能做"类型的计算"——联合、交并、从已有类型加工。**
>
> 取舍规则：描述"一个东西长什么样"用 interface（Contact）；需要联合或加工（`type Tag = (typeof VALID_TAGS)[number]`）只能用 type。都能用时选哪个不重要，统一才重要。

**Q2. `contact.phone` 的类型是什么？直接 `.length` 会发生什么？**

> [!question]- 看答案（先默答再点开）
> **`string | undefined`；直接 `.length` 编译错——`error TS18048: 'contact.phone' is possibly 'undefined'`。**
>
> `?` 的完整含义就是"访问它可能没有"。伏笔：怎么把"可能没有"安抚成"确定有"（窄化），是第 3 次课的全部内容——今天它已经在 phone、find、update 的 old 身上出场三次了。

**Q3. `readonly` 拦得住什么、拦不住什么？运行时呢？**

> [!question]- 看答案（先默答再点开）
> **拦"在旧对象上改属性"（TS2540）；不拦"造个新对象整个换掉"；运行时完全不拦——类型已擦除，tsx 跑起来照改不误。**
>
> 它还是浅层的：`readonly tags: string[]` 拦不住 `tags.push(...)`。它的价值不是"防住修改"，而是把"不该改"的意图写进签名，让所有读类型的人都被红线拦一次。

**Q4. `as const` 一次干了几件事？**

> [!question]- 看答案（先默答再点开）
> **两件：数组变 readonly 元组（长度焊死）+ 每个元素收窄成字面量类型。**
>
> 之后 `(typeof X)[number]` 把"所有合法值"提取成一个联合——实验 2 的 `Tag` 就是这么来的，从此非法标签在编译期就写不进去。

**Q5. map / filter / find，谁的返回值可能"没值"？和 Q2 什么关系？**

> [!question]- 看答案（先默答再点开）
> **find——找不到返回 undefined，签名如实标着 `T | undefined`；map 最差返回空数组，filter 同理，都不会 undefined。**
>
> 和 Q2 是同一个形状：**"可能没值"在类型世界的写法就是 `| undefined`**。第 3 课你学会逐个安抚它们——这行字就是那节课的门票。

---

## §5 下课

**学有余力（可选）**：把 `Contact` 的 `tags` 标成 `readonly string[]`（注意是元素也只读），然后试两个操作：`contact.tags.push("家人")` 和 `contact.tags = []`——一个报 TS2339、一个报 TS2540，报错码为什么不同？对照 §2.2 "readonly 是浅层的"和"它只锁这个属性本身"，现在你能分层解释了吗。观察完照旧撤销。

**完成后回来找我**：把复盘三题的口述发我，我判卷、勾计划里的 checkbox、记学习档案。你今天写的 `Contact` 不是一次性的——第 7 次课它会带着 `Partial<Pick<...>>` 回炉重造，第 9 次的待办 CLI 里它的判别联合表亲才是主角。然后随时可以喊"**开始第 3 次课**"——可空与窄化：`string | undefined` 转正，strict 下满屏红的正确打开方式。

> 💡 **我是你的导师，不是课件**
> 这页是提词器，提问的地方在对话框里。今天的设计决策题（remove 返回什么、changes 允许改哪些字段）尤其欢迎拿来讨论——**建模没有唯一答案，讨论本身才是课**。

---

*上一课：[第 1 课 · 跑起来 + 类型擦除](0001-type-erasure.md) ｜ 下一课：[第 3 课 · 可空与窄化](0003-narrowing.md)*
*TypeScript 开发 · 20 小时速通 · 总计划见 [00_20小时速通计划.md](../00_20小时速通计划.md)*
