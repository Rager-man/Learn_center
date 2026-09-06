# 第 7 课 · 泛型与工具类型——类型层面的函数

> **TypeScript 开发 · 20 小时速通 · 7 / 10**
> 节奏：**30–40 分钟学**（§0–§2）→ **80 分钟练**（§3，代码放 `04_进阶与质量/`，备课时已建）→ **10 分钟复盘**（§4）。
> 今天是**转正课**。第 5 课你抄过 `retry<T>` 的签名——那个 `<T>` 当时是黑盒；第 6 课你全程在泛型库里游泳——`z.array(z.number())`、`z.infer<typeof schema>`、safeParse 返回的 `ZodSafeParseResult<T>`，全是泛型。今天把这个你天天在用却没正式认识的东西转正：**泛型就是"类型的参数"，工具类型就是"别人写好的类型函数"**。你不需要成为类型体操选手，但必须读得懂 `Array<T>`、写得出简单泛型函数。
> 你有 Python 基础——今天满眼都是熟人：`Array<string>` ≈ `list[str]`，`Record<string, number>` ≈ `dict[str, int]`，`<T>` ≈ `TypeVar("T")`。连"类型注解写进方括号"这个手感都是同款的。

---

## §0 开工准备（5 分钟）

先跑安检：

```bash
npx tsc --noEmit   # 沉默
```

今天**没有新依赖**——泛型是纯语言特性，TypeScript 自带。练习文件已建好两个，都在新目录 `04_进阶与质量/`：

- `ex14_generics_toolkit.ts` —— 泛型小工具三连：groupBy / pluck / chunk（签名自己推，骨架里预建了 contacts 数据）
- `ex15_contact_rework.ts` —— 回炉工作台：纸面展开和留痕写在这；**代码改动落在 `01_语法起步/ex4_contacts.ts`**（第 2 课的老朋友今天再开工）

**开场复查（10 秒）**：这三个东西你早就用过了——`retry<T>`（第 5 课抄的签名）、`Promise<User>`（第 5 课满屏的单子）、`Array<string>`（第 1 课起你就在写 `string[]`——它就是 `Array<string>` 的简写）。加上第 6 课的 zod 全家福，你其实一直在泛型里游泳，只是没人给你正式介绍。今天补上这场介绍。

> ⚠️ **一句丑话（专门写给你的前科）**
> 第 6 课的复盘三题催了三次才交。今天起改规矩：**练习做完，先把 §4 复盘三题的口述发我，再交练习判卷**——复盘没到，练习不判。另一条同步升级：我判卷会拿骨架的 TODO 清单**逐条对账**；交付时你自己先报一遍"哪条 TODO 动了哪几行"——报不出的地方，就是下次整改清单的预订单。

> 💡 **课前读什么**
> [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) 的 "Generics" 章——**读到 Generic Constraints 为止**（再往后今天不碰）；然后扫一眼 [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) 文档里 `Partial` / `Pick` / `Omit` / `Record` 四个的例子区（不用读全，§2.3 会给足上下文）。

---

## §1 核心认知：泛型是"类型的参数"

> ◆ **本课唯一必须带走的东西**
>
> **`<T>` 是类型层面的参数：值参数让函数处理不同的数据，类型参数让函数处理不同的类型。工具类型是标准库里现成的"类型函数"。**

从最小的泛型函数开始（它叫 identity，恒等函数）：

```typescript
function identity<T>(value: T): T {   // T：类型的形参。名字随意，T 是 Type 的惯例
  return value;
}
const a = identity(42);      // 调用点：T 被推导为 number → a 的类型是 number
const b = identity("hi");    // 同一个函数，T 被推导为 string → b 的类型是 string
```

一份实现，每次调用"定制"出一个具体版本——定制发生在**编译期**。运行时只有一份普通的 JavaScript 函数：`<T>` 编译后消失（第 1 课的类型擦除今天有了第二层意思：**泛型只活在编译期**）。

现在回头看第 5 课你抄过的那个签名，逐段拆：

```typescript
async function retry<T>(fn: () => Promise<T>, times: number): Promise<T> {
//              ^^^^ ① 类型的形参：这次调用的"成功类型"还不知道，先用占位符顶着
//                     ② fn: () => Promise<T>——值参数，类型里用到了 T：fn 成功时产出一个 T
//                                          ③ 返回 Promise<T>：重试不改变成功的类型
```

你当时抄得稳、用得对（ex11 一遍成型）——因为泛型的**调用方**本来就只需要"看得懂推导"：`retry(fetchUser, 3)` 一调用，编译器看见 `fetchUser: () => Promise<User>`，就替你定了 `T = User`。黑盒转正，就这么点事。

三个推论，今天反复会用到：

1. **值参数管数据流，类型参数管类型流。** 函数体里 `value` 是值的通道，`T` 是类型的通道——两条通道并行，`value: T` 就是它们的交点。
2. **推导发生在调用点，大多数时候不用手写。** `identity(42)` 不必写成 `identity<number>(42)`。什么时候必须显式写？推导不出来的时候——今天的练习用不到，知道有这回事即可。
3. **工具类型是标准库里的类型函数，你一直在"调用"它们。** `Array<string>`、`Promise<User>`、`Record<string, number>`——全是别人写好的泛型，方括号里传的是**类型实参**。`string[]` 和 `Array<string>` 是同一个类型的两种拼法。

> ⚠️ **本课避坑**
> **别为泛型而泛型。** 泛型的成本是读的人要多想一层抽象；收益是"第二个调用方免费"。判断标准（复盘题 3 伏笔）：**出现第二种类型之前，具体类型比泛型好**——只有一个调用方的泛型，是把具体问题故意复杂化。今天练的是"写得出"，不是"逢函数必泛型"。纪律延续：全程禁 `as` / `!`，命名 camelCase。

### §1.1 动笔预测（5 分钟）

老规矩，**先别用 IDE**。逐段预测：tsc 报不报？报什么？（C 段是"没有约束的 pluck"——正是 §2.2 要治的病；D 段的 Tag 就是 ex4 里你那个 as const 的产物。）

```typescript
// A —— 数组类型的另一种拼法
const nums: Array<string> = [1, 2, 3];
// ← tsc 报不报？

// B —— 同一个函数，两次调用
function identity<T>(value: T): T { return value; }
const a = identity(42);
const b = identity("hi");
// ← a、b 的类型各是什么？谁定的？

// C —— 没有约束的 pluck（病夫版）
function badPluck<T>(objs: T[], key: string) {
  return objs.map(obj => obj[key]);
}
// ← tsc 报不报？报在哪一行？

// D —— Record 的全键强制
type Tag = "家人" | "朋友" | "同事" | "工作";
const counts: Record<Tag, number> = { "家人": 1, "朋友": 2 };
// ← tsc 报不报？
```

写完再对照（猜错很正常，错在哪就是哪没懂；A、C、D 建议亲手跑一遍——D 就是任务 2 漏键实验的预告）：

> [!success]- 对照答案（先写完再展开）
> **A：报，TS2322。** `Type 'number' is not assignable to type 'string'`——`Array<string>` 和 `string[]` 完全等价，方括号写法只是把"类型实参"摆到了明面上：数组的元素类型，是你传给 `Array` 这个类型函数的参数。
>
> **B：a 是 number，b 是 string——调用点的实参定的。** 42 进去，T = number；"hi" 进去，T = string。同一份实现，两个定制版，全程没人手写 `<number>`。这就是推论 2。
>
> **C：报，TS7053。** `Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'unknown'`——病在 `obj[key]`：T 是"某个还不知道的类型"（TS7 直接把它当 `unknown` 对待——第 4 课以来的老朋友），key 是任意 string，编译器无法承诺"T 里有这个键"。这和第 6 课"编译器没法替网络做担保"同款无奈：**没有依据的承诺，编译器一律不给**。药方 §2.2 就开：`K extends keyof T`。
>
> **D：报，TS2739。** `Type '{ 家人: number; 朋友: number; }' is missing the following properties from type 'Record<Tag, number>': 同事, 工作`——Record 的键是**闭集**：四个键，一个不能少。对照 `{ [key: string]: number }`（开集：随便什么键都收，少写不报）——闭集把"键写漏了"从运行时的 NaN 变成编译期一行红。

---

## §2 看清你写下的东西（30 分钟）

学前阅读讲"泛型怎么写、工具类型有哪些"。这一节讲六件手册不会直说的事：类型参数的写方与调用方各干什么、`keyof` 和约束到底承诺了什么、五件套工具类型各自在你旧代码里的对应物、值世界和类型世界的镜像关系、Object.assign 为什么不查 readonly（第 2 课欠的深讲）、以及泛型的哪些深处今天继续黑盒。

### §2.1 写方与调用方：T 的依据从哪来

泛型函数有两方：**写方**（声明 `<T>`，用 T 搭签名）和**调用方**（提供实参，让 T 落地）。你前六课当的都是调用方（抄签名、传实参），今天任务 1 第一次当写方。写方的义务只有一条：**签名里对 T 的每次使用都要有依据**——要么来自值参数（`value: T` 把 T 和实参绑在一起，推导由此发生），要么来自约束（§2.2）。

调用方也可以显式指定类型实参，但那样"声称"就要和"事实"当场对质（实测）：

```typescript
identity<string>(42);
// error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
```

你声称 T = string，实参却是 number——编译器照单全收你的声称，然后拿事实逐一对质。这是"注解是声称、数据是事实"（第 1 课）在泛型课的变体：**类型实参是声称，值实参是事实，对质发生在调用点**。所以日常不写，让事实自己说话。

### §2.2 约束：`K extends keyof T`（本课的技术核心）

先认识两个类型层面的小运算（不是工具类型，是**类型运算符**）：

```typescript
interface Contact {
  id: number;
  name: string;
  phone?: string;
  tags: string[];
}

type ContactKeys = keyof Contact;    // "id" | "name" | "phone" | "tags"——所有属性名的联合
type ContactName = Contact["name"];  // string——索引访问：按属性名取出属性的类型
```

- `keyof T`："T 的所有属性名"组成的联合。注意属性名在这里不是值，是**类型**（字符串字面量类型——第 2 课 as const 的老朋友）。
- `T[K]`：索引访问——"T 里 K 对应的那个属性的类型"。K 是 `"name"` 时，`T["name"]` 就是 string。

现在给病夫版 pluck 开药：

```typescript
function pluck<T, K extends keyof T>(objs: T[], key: K): T[K][] {
  return objs.map(obj => obj[key]);   // 上一版在这报 TS7053；现在 obj[key] 的类型是 T[K]，有依据，合法
}
```

`K extends keyof T` 读作："**K 这个类型参数，实参必须落在 T 的属性名里**"——它是对类型参数的**参数校验**（值参数的校验写 `n: number`，类型参数的校验写 `K extends keyof T`）。校验通过后，编译器获得了一个此前没有的依据：**K 确实是 T 的键**——`obj[key]` 从"无法承诺"变成"T[K]，合法"。

验证药效（实测）：

```typescript
pluck(contacts, "name");   // 返回 string[]——T = Contact、K = "name"，全在调用点推导，零手写
pluck(contacts, "nam");    // 手滑一个字母：
// error TS2345: Argument of type '"nam"' is not assignable to parameter of type 'keyof Contact'.
```

手滑版被拦，报错把规则说得明明白白（"必须是 Contact 的键"）；想知道合法选项有哪些，悬停参数或看 `keyof Contact` 的展开——四个，一个不多。第 1 课 `data.nama` 打出 undefined 那笔账，在这里终于有了编译期的岗哨。

还有一个细节值得盯一眼：`pluck(contacts, "phone")` 的返回不是 `string[]`，是 `(string | undefined)[]`——`T["phone"]` 如实反映 phone 是可选属性。**泛型不替你美化事实，它只是把事实算得更准**（第 4 课"签名如实"的老纪律，泛型自动遵守；自测 Q5 还会回来看这个坑）。

### §2.3 工具类型五件套：消灭重复类型

先看 `Partial` 在标准库里的真身（见过即可，**不要求会写**——这叫映射类型，今天新增黑盒之一）：

```typescript
type Partial<T> = { [K in keyof T]?: T[K] };   // 遍历 T 的每个键，逐一加 ?
```

读一遍你会发现这就是"对每个属性做同一件事"的类型版循环：`[K in keyof T]` 是遍历，`?` 是加工，`T[K]` 是取原料（上一节刚认识的运算符，立刻被标准库用上了）。五件套的账：

| 工具类型 | 干什么 | 你见过的对应物 |
| --- | --- | --- |
| `Partial<T>` | 所有属性变可选 | 第 2 课 update 的 changes——你超前手写的 |
| `Pick<T, K>` | 白名单：只挑 K 列出的属性 | 今天的 `Pick<Contact, "name" \| "phone">` |
| `Omit<T, K>` | 黑名单：删掉 K 列出的属性 | 第 2 课你写的 `Omit<Contact, "id" \| "tags">` |
| `Record<K, V>` | 键×值的表，K 闭集全键强制 | 今天的 `Record<Tag, number>` 标签计数 |
| `ReturnType<F>` | 从函数类型里取出返回类型 | `ReturnType<typeof fetchUser>` = `Promise<User>`，第 5 课的 mock |

展开给你看（任务 2 要你**亲手**展开再验证，这里是参考答案的锚点）：

```typescript
Pick<Contact, "name" | "phone">   // → { name: string; phone?: string }
Omit<Contact, "id" | "tags">      // → { name: string; phone?: string }   ← 同一个东西！
Partial<上面任意一个>              // → { name?: string; phone?: string }
```

**Pick 和 Omit 是同一刀的两面**：Contact 一共 4 个字段，"去掉 id 和 tags"和"挑出 name 和 phone"切出来的是同一块——你第 2 课选了黑名单写法，今天任务 2 换白名单，换完类型分毫不差（这个"分毫不差"要你亲手验证，不是信我）。什么时候用哪面？**排除少数几个用黑名单，其余全要时用白名单**——你第 2 课 Omit 掉 id/tags 恰是好判断：语义是"不许改的排除掉"，直白。

Record 再多看一眼，因为它和 `{ [key: string]: number }` 长得像、脾气完全不同：

```typescript
Record<Tag, number>        // 键闭集：四个键一个不能少，多写一个也不行
{ [key: string]: number }  // 键开集：任意 string 键都收，少写、写错都不报
```

闭集的强制力是双向的：漏键，TS2739 指名道姓（§1.1 D 段见过）；而读 `counts["家人"]` 时，类型是干干净净的 number——开集版读一个没写过的键，类型照样说 number、运行时却是 undefined（第 6 课"声称与事实"的裂缝在索引上的翻版）。**开集省事，闭集诚实**——第 6 课"类型从数据来"，在 Record 上就是"键集从类型来"。

### §2.4 值世界 / 类型世界：一张镜像地图

| 值世界（你写了六课的） | 类型世界（今天转正的） |
| --- | --- |
| 函数参数 `n: number` | 类型参数 `<T>`（带校验的：`K extends keyof T`） |
| 函数调用 `retry(fn, 3)` | 类型调用 `Array<string>`、`Partial<Contact>` |
| 函数签名是合同 | 泛型签名是类型的合同（承诺推导、承诺约束） |
| 标准库函数（`Math.round`…） | 工具类型（`Partial` / `Pick` / `Record`…） |
| 你写业务函数 | 你写泛型函数（ex14 三连） |
| 抄库，不造轮子 | 优先工具类型，不手写展开 |

这张表也是复盘题 3 的答案来源：值世界里，只调用一次的逻辑你不会包八层函数——类型世界同理。**抽泛型的时机 = 第二个调用方（或第二种类型）出现时**；在那之前，具体类型读得快、改得也快。你不需要成为类型体操选手——**读得懂别人的泛型（库文档、报错信息），写得出自己需要的简单泛型（今天的三个），到此为止就够**。

### §2.5 Object.assign 为什么不查 readonly（第 2 课欠的深讲）

第 2 课的镜子实验你亲眼看过：`phone` 加了 readonly，`contacts[0].phone = "..."` 报 TS2540，但 `Object.assign(contacts[0], { phone: "..." })` **不报**。当时说"拦截盲区，深讲留第 7 课"——今天能看懂它的签名了（备课实测，标准库第一重载）：

```typescript
Object.assign<T extends {}, U>(target: T, source: U): T & U;
```

看清楚它承诺了什么：把 source 的属性并进 target、返回合并类型。它对 target 的全部要求是 `T extends {}`——**"是个对象"**，仅此而已：没承诺任何属性可写。而 readonly 的强制力只覆盖一种写法——`obj.prop = value` 这种点赋值；assign 是函数调用，参数检查只看"类型匹配"，看不到属性头上的 readonly 标记。（顺带一提：这个签名自己就带着一个 `extends` 约束——上一节刚学的语法，标准库里到处都是。）

这不是 bug，是取舍：assign 若要查 readonly，签名就得约束"source 的键 ∏ target 的 readonly 键 = 空"——标准库选了宽签名换通用性。教训两条：**① readonly 防"手滑直赋"，不防间接写**——真要不可变，得换新对象（`{ ...contact, phone }`，第 2 课实验区的另一半，一直就是正解）；**② 签名的强制力范围 = 它承诺的范围**——今天你开始自己写签名了，这条双向适用于你：写宽了拦不住，写窄了到处红。

### §2.6 黑盒清单（今天的和以前的）

今天新增两个黑盒，都只需"见过名字"：**映射类型**（`[K in keyof T]?: T[K]`——Partial 的真身，会读即可，不要求会写）；**条件类型**（`T extends U ? X : Y`——zod 内部大量使用，本课不碰）。今天退休四个：`retry` 的 `<T>`（转正！）；`z.infer<typeof schema>` 里的 `typeof`（取值的类型——泛型思想的日常应用）；`Array<T>` / `Promise<T>` 的读法（从此是"类型函数调用"）；第 2 课你手写的 `Partial<Omit<...>>`（今天知道它每个字符在干嘛了）。下一课预告：**vitest**——测试框架，"重构的胆量"；顺带回收一个伏笔：zod 为什么装在 dependencies 而不是 devDependencies（第 6 课记的那一眼，第 8 课正式算账）。

---

## §3 练习：80 分钟，主菜上桌

两个文件都在 `04_进阶与质量/`：任务 1 在 `ex14_generics_toolkit.ts` 写三个泛型工具，任务 2 以 `ex15_contact_rework.ts` 为工作台回炉第 2 课的 ex4。

### 任务 1 · 泛型小工具三连（50 分钟）

打开 `04_进阶与质量/ex14_generics_toolkit.ts`——contacts 数据是预建的（照抄自 ex4 的形状，让文件独立可跑），其余都是你的。硬性要求：

1. 三个函数（groupBy / pluck / chunk）**签名全部自己推**——课件只给了 pluck 的药方，groupBy 和 chunk 的签名是同款思路的自己变体。先写实现（就是普通的 map/filter/slice），再在边界上配类型参数；
2. pluck 必须带约束 `K extends keyof T`，返回类型精确到 `T[K][]`；
3. **探针验证**（判卷证据，保留在代码里）：每写完一个函数，用"给结果一个具体类型注解的赋值"验证推断——`const names: string[] = pluck(contacts, "name")` 编译通过 = 推断正确。编辑器悬停和探针二选一都行，但**探针的痕迹要留在代码里**；
4. 手滑实验：`pluck(contacts, "nam")` → 跑 `npx tsc --noEmit`，抄报错原文进留痕区 → 注释掉这行，恢复沉默；
5. chunk 的边界（第 6 课的功夫别丢）：`n <= 0` 时返回 `[]`；
6. 演示区三连：groupBy（按第一个标签分组）→ pluck（抽名字）→ chunk（名字数组 2 个一段），每步输出对上预期。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：推不出来的正路——先具体，再泛化
> 卡在签名上就退一步：先写"只支持 Contact"的版本——`function myPluck(objs: Contact[], key: "id" | "name" | "phone" | "tags")`。咦，这个键的联合怎么这么眼熟？它就是 `keyof Contact` 的手写展开。跑通了再把 `Contact` 换成 `T`、把键联合换成 `K extends keyof T`。**从具体到泛化是写泛型的正路**——反过来（先抽象再找用例）正是复盘题 3 要拦的病。

> [!tip]- 提示 2：groupBy 的返回类型
> `Record<string, T[]>`——组名是 string（keyFn 想怎么分就怎么分），值是同组元素。实现骨架：先建空表 `const groups: Record<string, T[]> = {}`，遍历 items，`groups[key]` 还不是数组就先放一个空数组，然后 push。往开集 Record 的任意 string 键写值都是合法的（§2.3 讲过开集的脾气）。

> [!tip]- 提示 3：chunk 的 n = 0 是个死循环
> 常见实现是 `while (i < arr.length) { result.push(arr.slice(i, i + n)); i += n; }`——n 为 0 时 `i += 0` 永不前进，push 无限塞空数组，程序卡死。入口一句 `if (n <= 0) return [];` 了断。想想第 6 课 parseCoords 的边界等号——**写循环的人有义务问一句"推进量会不会是 0"**。

> ✅ **检查点（比写完代码更重要）**
> 三个签名是自己推出来的（groupBy / chunk 课件根本没给签名）；探针赋值留在代码里且全部编译通过；手滑报错原文在留痕区、实验行已注释回去；chunk 的 `n <= 0` 边界处理了；`npx tsc --noEmit` 沉默。

### 任务 2 · 回炉改造（30 分钟）

打开 `04_进阶与质量/ex15_contact_rework.ts`——它是工作台：纸面展开和留痕写在这，代码改动落在 `01_语法起步/ex4_contacts.ts`。硬性要求：

1. **先纸面后动手（顺序不能倒）**：把 `Partial<Omit<Contact, 'id' | 'tags'>>` 和 `Partial<Pick<Contact, 'name' | 'phone'>>` 逐属性展开，写进 ex15 的留痕区；
2. 去 ex4 把 update 的 changes 参数换成白名单版 `Partial<Pick<Contact, 'name' | 'phone'>>`（只换类型，行为不动）；换完把鼠标悬停在参数上，和你的纸面展开对照——**第 2 课欠的"展开口述"，今天补验**；
3. 还在 ex4：挨着 findByTag 新增 `countByTag()`，遍历 contacts 统计每个合法标签出现在几个联系人身上，返回 `Record<Tag, number>`（注意 tags 是数组——一个人带两个标签，两个都要数到）；演示区加一行打印；
4. 漏键实验：初始化计数表时故意漏掉一个标签 → 跑 `npx tsc --noEmit` 抄报错原文进留痕区 → 修回。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：纸面展开的写法
> 照 §2.3 锚点的格式：先展开最里层（Omit / Pick 各得到什么），再套 Partial（每个属性加 `?`）。两栏并排写，最后一句话结论：相等吗？为什么（Contact 一共几个字段，"去掉 id/tags"和"挑 name/phone"是什么关系）？

> [!tip]- 提示 2：countByTag 先建"全零仓库"
> `const counts: Record<Tag, number> = { "家人": 0, "朋友": 0, "同事": 0, "工作": 0 }`——闭集逼你把每个键都初始化，这恰好就是正确的起点。然后遍历 contacts、再遍历每个人的 tags，`counts[tag] += 1`。这就是漏键实验"想漏都漏不进运行时"的原因——编译期就红给你看。

> [!tip]- 提示 3：改 ex4 之前想清楚它为什么安全
> 换类型不动行为——update 的函数体 `Object.assign(contact, changes)` 一个字都不用改。为什么换类型不用改实现？因为两个展开**相等**（你纸面验证过的）。这就是**类型层面的等价重构**：第 8 课有测试保镖之后，你敢做更狠的——今天先体感一次"编译器替你担保等价"。

> ✅ **检查点**
> 纸面展开两栏齐全、与悬停对照一致、等价结论一句话；ex4 的 update 已换白名单版、行为不变；countByTag 计数正确（双标签的人两头都数到）；漏键报错留痕后已修回；`npx tsc --noEmit` 沉默。

### §3.4 自查清单

- [ ] ex14：三个签名自己推出（groupBy / chunk 的签名课件没给），探针赋值留在代码里
- [ ] ex14：pluck 带约束 `K extends keyof T`，返回 `T[K][]`
- [ ] ex14：手滑实验报错原文留痕，实验行已注释回去
- [ ] ex14：chunk 的 `n <= 0` 边界处理了
- [ ] ex15：纸面展开两栏 + 与悬停对照 + 等价结论一句话
- [ ] ex15：ex4 的 update 已换 `Partial<Pick<Contact, 'name' | 'phone'>>`；countByTag 计数正确、漏键报错留痕
- [ ] 全程没写 `as` / `!`，命名 camelCase

> 💡 **卡住 20 分钟就求助**
> 老规矩四样：期望什么、实际发生什么、完整报错、相关代码。今天尤其欢迎两类问题：推签名卡住十分钟以上的（把你的"具体版"发我——从具体到泛化那一步，每个人卡的位置不一样）；以及探针赋值报 TS2322 但你确信函数写对了的（十有八九是推断和你预期差一点——差的那一点往往正是本课要点，比如可选属性带出的 `| undefined`）。

---

## §4 复盘：10 分钟检索练习

**新规矩重申（§0 的丑话）**：练习做完，**先把三题口述发我，再交练习判卷**。规则同前六课：合上代码，先在心里把答案完整说出来，再点开折叠对照——"感觉我知道"不算数。

1. `pluck<T, K extends keyof T>(objs: T[], key: K): T[K][]`——逐段说出这个签名每个部分在承诺什么。
2. `Partial<Contact>` 展开是什么？它解决了 update 函数的什么麻烦？
3. 什么时候不该抽泛型？你的判断标准是什么？

自测五题（每题先默答，再点开「看答案」）：

**Q1. `Array<string>` 和 `string[]` 是什么关系？**

> [!question]- 看答案（先默答再点开）
> 同一个类型的两种拼法。`Array` 是标准库的泛型，`<string>` 是传类型实参；方括号是语法糖。`Promise<User>` 没有糖可蹭，只能用泛型写法——所以认识 `Array<string>` 是认识一切泛型调用的入口。

**Q2. `identity(42)` 的返回类型是谁定的、在哪定的？**

> [!question]- 看答案（先默答再点开）
> number，调用点定的——实参 42 进来，T 被推导为 number。函数定义处只有占位符，每次调用定制一个版本；编译结束后 `<T>` 擦除，运行时只有一份普通函数（第 1 课类型擦除的第二层意思）。

**Q3. `Record<Tag, number>` 少写一个键会怎样？它和 `{ [key: string]: number }` 的本质区别是什么？**

> [!question]- 看答案（先默答再点开）
> TS2739，编译期红，漏了哪几个键指名道姓。区别在键集：Record 的键是**闭集**（列出的才合法，一个不能少、一个不能多）；索引签名是**开集**（任意 string 键都收，漏写、写错全沉默）。闭集把错误从运行时提前到编译期——和第 6 课"类型从数据来"是同一条纪律的键版："键集从类型来"。

**Q4. 第 2 课的 Object.assign 没被 readonly 拦住，机制是什么？**

> [!question]- 看答案（先默答再点开）
> assign 的签名是 `assign<T extends {}, U>(target: T, source: U): T & U`——对 target 只承诺"是个对象"，不承诺属性可写；readonly 的强制力只覆盖点赋值一种写法，函数调用的参数检查看不到 readonly 标记。教训：readonly 防手滑不防间接写（真不可变靠换新对象）；签名的强制力范围 = 它承诺的范围。

**Q5. `pluck(contacts, "phone")` 返回 `string[]`，对吗？**

> [!question]- 看答案（先默答再点开）
> 不对——`(string | undefined)[]`（实测 TS2322 报错原文写得分明）。`T["phone"]` 如实反映 phone 是可选属性：有人没电话，pluck 不知道这次取到的是谁，类型就把两种可能都带上。泛型不美化事实，只把事实算准——想收窄，回调用方处理 undefined（第 3 课的旧功夫）。

---

## §5 下课

**学有余力（可选，做多少算多少）**：① **第 6 课的两笔欠账**：给 ex12 的 fetch 套 3 秒超时（`Promise.race`）/ parseCoords 返回值改判别联合——原题在第 6 课 §5，欠着不追，但今天做有加成：判别联合的返回类型正好用今天的眼光重看一遍。② **Order 公共字段收拾**（第 4 课埋的伏笔）：ex7/ex8 的 Order 四变体里 `id`、`amount` 这类公共字段重复了四遍——用 `Pick<Order, "id" | "amount">` 收出一个基础类型，四个变体各自只写独有部分。改完 `npx tsc --noEmit` 必须依旧沉默、行为不变——**类型层面的等价重构**，第 8 课测试保镖上岗前的热身。

**完成后回来找我**：先把复盘三题口述发我（丑话在 §0），我判卷、勾计划里的 checkbox、记学习档案。到这，类型系统的大件你已全部见过：建模（第 2、4 课）、窄化（第 3 课）、异步（第 5 课）、边界（第 6 课）、泛型（今天）——剩下的全是工程化的事。下一课：**第 8 课 · 工程化与测试**——npm 项目从零建、模块拆分、vitest 三板斧；"测试是重构的胆量"，今天学有余力里做的等价重构，下一课有保镖之后就能放开手脚。然后随时可以喊"**开始第 8 次课**"。

> 💡 **我是你的导师，不是课件**
> 这页是提词器，提问的地方在对话框里。今天特别欢迎拿来讨论的两类问题：推签名时"差一步就出来"卡住的（把半成品发我——从具体到泛化的那一步，每个人卡的位置不一样）；以及你在别处（库文档、别人的代码）见到的看不懂的泛型签名——今天之后，你可以开始拿真实的签名来问了。

---

*上一课：[第 6 课 · 边界校验](0006-boundary-validation.md) ｜ 下一课：第 8 课 · 工程化与测试（完成本课后解锁）*
*TypeScript 开发 · 20 小时速通 · 总计划见 [00_20小时速通计划.md](../00_20小时速通计划.md)*
