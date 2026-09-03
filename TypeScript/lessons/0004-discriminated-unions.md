# 第 4 课 · 判别联合——让非法状态不可表示

> **TypeScript 开发 · 20 小时速通 · 4 / 10**
> 节奏：**30–40 分钟学**（§0–§2）→ **80 分钟练**（§3，代码放 `02_类型建模/`）→ **10 分钟复盘**（§4）。
> 第 3 课你练的是"值已经在手，怎么确认它是什么"；今天把问题前移到建模：让形状不对的数据**从一开始就写不出来**。`in` / `typeof` / `switch` 今天全部转正，还来了两个新面孔：`never` 和 `unknown`。
> 你有 Python 基础——`Literal["pending", "paid"]` 这类玩法可能眼熟；TS 多给的一层是：比较一下判别字段，整个联合自动收窄，证据链编译器自己走。

---

## §0 开工准备（5 分钟）

先跑安检：

```bash
npx tsc --noEmit   # 沉默
```

第 3 课开工是红的（那是剧本）；今天从绿开始——**不修别人的红，建自己的模型**。今天唯一一次红，是你在任务 1 的删 case 实验里亲手造出来、再亲手消掉的。

练习文件已建好两个，都在 `02_类型建模/`：

- `ex7_order.ts` —— 订单状态机骨架（绿的，图纸全在注释里，你来建模型）
- `ex8_parse.ts` —— 手写解析器骨架（绿的，好坏数据已备好，你来写守卫）

**开场复查（10 秒）**：第 3 课你曾在 `if (s.nickname !== undefined)` 分支里还写 `s.nickname?.toUpperCase()`——"不信任自己的窄化"，后来修掉了。今天满屏都是守卫，留意同一个冲动：**证据生效的范围内，不需要再上保险。**

> 💡 **课前读什么**
> [官方 Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) "Narrowing" 章的 **discriminated union 部分**——第 3 课你读过整章，这次只精读这一节，应该会有"原来那表格里的 `in` 是为今天准备的"之感。`unknown` vs `any` 不用查资料，§2.4 就是讲稿。

---

## §1 核心认知：非法状态不可表示

> ◆ **本课唯一必须带走的东西**
>
> **一堆 boolean 字段（isPaid + isShipped + isCancelled）组合出大量非法状态；判别联合让非法组合在编译期就不存在。**

开场先做个回忆。第 3 课病灶 7（`studentNo` 接收 `string | number`）你交过两种解：`toString()` 双边通吃的聪明绕行，和 `typeof` 窄化的正面回应。两种都是在**值已经拿到手之后**救火。今天上第三个层次——在数据成型之前就把出口堵死：

```typescript
type Order =
  | { status: "pending"; amount: number }                                    // 等待支付
  | { status: "paid"; amount: number; paidAt: string }                       // 付过了，才有 paidAt
  | { status: "shipped"; amount: number; paidAt: string; trackingNo: string }
  | { status: "cancelled"; amount: number; reason: string };

const o: Order = { status: "pending", amount: 9.9 };
console.log(o.paidAt);   // ✗ error TS2339——"还没付钱就想看支付时间"根本编译不过
```

三个推论，今天反复会用到：

1. **判别联合 = 第 3 课的窄化原理 × 建模。** 第 3 课窄化回答"值在不在"（`T | undefined`），今天回答"**它是哪一种**"。`status` 一比较，联合立刻收窄到那一支——同一套控制流证明，换了个问法。`in` / `typeof` / `instanceof` 上次只在表格露脸，今天天天用。
2. **穷尽检查让"新增状态"从祈祷变成点名。** `switch` 配上 `never` 哨兵，漏处理的分支自己红给你看——改造点被编译器列成清单，不用全局搜索加烧香。
3. **边界的数据没有类型。** JSON、argv、网络响应——它们进门时身份不明。第一反应是 `unknown` + 守卫，不是 `as any`："unknown 是我还不知道，any 是我放弃了。"

> ⚠️ **本课避坑**
> `switch` 写完、`default: assertNever(order)` 没落笔之前，别相信"我都处理了"——§1.1 的 C 段有个删了 case 却一声不吭的版本，那就是没有哨兵的样子。纪律延续：**全程禁 `as` 和 `!`**；命名一律 **camelCase**（第 3 课的 Python 手感晾干了，从本课起判卷标准）。

### §1.1 动笔预测（5 分钟）

老规矩，**先别用 IDE**。逐段预测：`npx tsc --noEmit` 报不报错？报的话是什么？跑起来呢？（C 段里的 `assertNever` 先照抄，哨兵函数，§2.3 正式讲。）

```typescript
// A —— 三个 boolean 的"宽松"
interface BadOrder { amount: number; isPaid: boolean; isShipped: boolean; isCancelled: boolean; }
const weird: BadOrder = { amount: 9.9, isPaid: false, isShipped: true, isCancelled: true };
// 没付钱、已发货、还取消了——tsc 报不报？

// B —— 判别联合的"严格"（Order 用上面 §1 那个定义）
const o: Order = { status: "pending", amount: 9.9 };
console.log(o.paidAt);                                // ← 第 1 行
const o2: Order = { status: "payed", amount: 9.9 };   // ← 第 2 行（手滑）
const o3: Order = { status: "pending", amount: 9.9, paidAt: "2026-01-01" };  // ← 第 3 行

// C —— 两个 switch，都删掉了 cancelled 的 case
function textChecked(order: Order): string {
  switch (order.status) {
    case "pending": return "等待支付";
    case "paid": return "已支付";
    case "shipped": return "已发货";
    default: return assertNever(order);   // ← 版本一：这行红不红？
  }
}
function textQuiet(order: Order): string {
  switch (order.status) {
    case "pending": return "等待支付";
    case "paid": return "已支付";
    case "shipped": return "已发货";
    default: return "???";                // ← 版本二：这版红不红？跑起来 cancelled 订单得到什么？
  }
}

// D —— JSON.parse 的两张脸
const data: unknown = JSON.parse('{"status":"paid"}');
console.log(data.status);      // ← 第 1 行
const raw = JSON.parse('{"status":"paid"}');
console.log(raw.paidAt);       // ← 第 2 行：报不报？跑起来打出什么？
```

写完再对照（猜错很正常，错在哪就是哪没懂）：

> [!success]- 对照答案（先写完再展开）
> **A：不报。** 四个字段各自类型合法，组合的荒唐编译器看不见——`isPaid` / `isShipped` / `isCancelled` 互相不认识。这就是病根：**把"互斥的状态"建成了"独立的开关"**。8 格账 §2.1 算给你看。
>
> **B：三行全红，且红得各有道理。** 第 1 行 `error TS2339: Property 'paidAt' does not exist on type '{ status: "pending"; amount: number; }'`——paidAt 只在付过之后才"存在"，现在存在性归类型管；第 2 行 `error TS2322: Type '"payed"' is not assignable to type '"cancelled" | "paid" | "pending" | "shipped"'`——手滑在编译期被拦下，而不是一个 `"payed"` 静默混进运行时；第 3 行 `error TS2353`——pending 变体没有 paidAt，多写的字段它也不要。三个报错守的是同一条门：**非法形状写不出来**。
>
> **C：版本一红，版本二不红。** 版本一：`error TS2345: Argument of type '{ status: "cancelled"; amount: number; reason: string; }' is not assignable to parameter of type 'never'`——default 里剩下的正是被漏掉的 cancelled 变体，塞不进 `never`，报错原文点名列出它。版本二：编译器沉默，跑起来 cancelled 订单拿到 `"???"`——无声地错。同一处遗漏，一个当场翻脸一个静默放行，**差别只在有没有那行哨兵**。
>
> **D：第 1 行红，第 2 行不红。** 第 1 行 `error TS18046: 'data' is of type 'unknown'`——unknown 不许直接用；第 2 行编译过，跑起来打出 `undefined`——`raw` 是 any（`JSON.parse` 的签名就是 any），编译器沉默、运行时翻车，第 1 课 `data.nama` 的老朋友。两行的差别，就是 any 和 unknown 的全部差别（§2.4）。

---

## §2 看清你写下的东西（30 分钟）

学前阅读讲"每个语法是什么"。这一节讲五件手册不会直说的事：三个 boolean 的账本怎么算亏、判别字段为什么必须是字面量、`never` 哨兵的工作原理、`unknown` 和 `any` 在"收"与"用"上的不对称、以及守卫和解析器的分工。

### §2.1 三个 boolean 的账本：一半组合是非法的

把 A 段的 `BadOrder` 摊开算账——三个开关，2³ = 8 种组合：

| isPaid | isShipped | isCancelled | 是什么                | 判定 |
| ------ | --------- | ----------- | ------------------- | ---- |
| F      | F         | F           | pending（等待支付）    | ✓ 合法 |
| T      | F         | F           | paid（已支付）        | ✓ 合法 |
| T      | T         | F           | shipped（已发货）     | ✓ 合法 |
| T      | F         | T           | cancelled（已取消）   | ✓ 合法 |
| F      | T         | F           | **没付钱就发货**      | ✗ 非法 |
| F      | F         | T           | **没付钱就取消**      | ✗ 非法 |
| F      | T         | T           | **没付钱，又发货又取消** | ✗ 非法 |
| T      | T         | T           | **又发货又取消**      | ✗ 非法 |

三笔亏：

- **8 格里 4 格非法，`BadOrder` 一格都拦不住**——A 段亲眼所见。每一段用它的代码都得自己记着"哪些组合别碰"，记漏一次就是线上事故。
- **每加一个 boolean，组合翻倍。** 明天产品说加"已退款"，16 格；再加"货到付款"，32 格。合法状态永远只有几格，剩下的全是等着踩的雷。
- **合法的 4 格也不省心**：想知道"付过没"看 `isPaid`，想知道"取消没"看 `isCancelled`——描述一个状态要同时盯三个字段。而状态机的事实是：**订单在同一时刻只能处于一个状态**——这本来就是"或"的关系，被建模拆成了三个"且"。

Python 对照：Python 里你多半会写 `status: str` + 一堆 Optional 字段，靠运行时纪律保证一致性——本质上已经是判别联合的手工版，只是没有编译器帮你站岗。

### §2.2 判别字段：给每个状态一个独一无二的路标

判别联合（discriminated union）的配方就两条：

1. **每个变体共享一个字段**（习惯叫 `status` / `kind` / `type`），类型是**互不相同的字面量**——这个字段叫判别字段（discriminant）；
2. **每个变体只声明该状态成立时才存在的字段**——paidAt 付过才有，trackingNo 发过才有。

```typescript
type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

type Order =
  | { status: "pending"; amount: number }
  | { status: "paid"; amount: number; paidAt: string }
  | { status: "shipped"; amount: number; paidAt: string; trackingNo: string }
  | { status: "cancelled"; amount: number; reason: string };
```

为什么判别字段**必须是字面量**：收窄的原理是"比较即筛除"。`order.status === "paid"` 能把联合筛到只剩 paid 那一支，前提是各变体的 `status` 类型互不相同。写成 `status: string` 的话——每个变体的路标都一样，比完一个也筛不掉任何一支，联合窄化不成立。字面量（或第 2 课的 `as const`）才让路标独一无二。

它和第 3 课的关系一句话：**第 3 课你窄化 `T | undefined`（值在不在），今天窄化整个联合（它是哪一种）**——`if (order.status === "paid")` 里面，`order` 就是 `{ status: "paid"; amount: number; paidAt: string }`，点 paidAt 畅通无阻。B 段三个报错守的门，反过来开：

| 想干的事                    | boolean 建模        | 判别联合                       |
| --------------------------- | ------------------- | ------------------------------ |
| 造一个非法状态              | 造得出来，没人拦     | TS2322 / TS2353 当场红          |
| 访问还没到的状态的字段       | undefined（运行时雷）| TS2339（编译期指出）            |
| 判断当前状态                | 盯三个字段组合        | 比一次 status                   |
| 新增状态                    | 组合翻倍，静默       | 见 §2.3：编译器点名             |

### §2.3 `switch` + `never`：穷尽检查的哨兵

`never` 是"永远不会有值"的类型——四个变体都被 case 掉之后，`default` 分支在类型上不可到达，那里的 `order` 就被收窄成 `never`。哨兵函数利用这一点站岗：

```typescript
function assertNever(x: never): never {
  throw new Error("未处理的状态: " + JSON.stringify(x));
}

function statusText(order: Order): string {
  switch (order.status) {
    case "pending":   return "等待支付";
    case "paid":      return "已支付";
    case "shipped":   return "已发货";
    case "cancelled": return "已取消";
    default:
      return assertNever(order);   // 四个 case 齐时，这里的 order: never——合法
  }
}
```

现在删掉 `case "cancelled"` 那行再跑 `npx tsc --noEmit`：

```
error TS2345: Argument of type '{ status: "cancelled"; amount: number; reason: string; }'
is not assignable to parameter of type 'never'.
```

报错**原样念出你漏掉的那个变体**——不是"哪里漏了什么"的猜谜，是点名的通缉令。这就是 C 段版本一红、版本二静默的全部机制。

两种写法（认得即可，本课主用哨兵函数）：

```typescript
// 写法二：never 赋值——漏 case 时这行报 TS2322
default: {
  const exhaustive: never = order;
  return "未处理: " + String(exhaustive);
}
```

两个手册不强调的补充：

- **新增状态的那天，才是它真正值钱的时候。** 假设加第五个状态 `refunded`：所有带哨兵的 switch 同时红——要改哪里，编译器列成清单。没有哨兵，你就只能全局搜索 `status` 然后祈祷。学有余力里让你亲手试一次。
- **哨兵自己也活在运行时。** `assertNever` 里的 throw 平时永远不会触发（类型已保证走不到），但万一有数据绕过类型检查混进来（比如被谁 `as` 强转过），它是最后一道会喊出声的防线——第 1 课"类型管不到运行时"的极少数例外：这个哨兵不是类型，是一段真的会跑的代码。

### §2.4 `unknown` vs `any`：边界的第一行

一句话总纲：**unknown 是"我还不知道"，any 是"我放弃了"。** 两个方向的待遇完全不对称：

| 方向                     | any                 | unknown                        |
| ------------------------ | ------------------- | ------------------------------ |
| 收（任何值赋给它）        | ✓                   | ✓                              |
| 用（点属性 / 调用 / 传参） | 随便用，检查全关     | 先窄化，否则 TS18046 拦下        |
| 给出去（赋给具体类型）    | 能赋给任何类型       | 只能赋给 unknown / any / never  |

```typescript
const data: unknown = JSON.parse('{"status":"paid"}');
console.log(data.status);   // ✗ error TS18046: 'data' is of type 'unknown'.
                            //   想用？先出示证据（§2.5）

const raw = JSON.parse('{"status":"paid"}');
console.log(raw.paidAt);    // ✓ 编译过——跑起来打出 undefined（D 段第 2 行）
```

`JSON.parse` 的签名返回 `any`，是历史包袱：它比 `unknown`（TS 3.0 才引入）老得多，改签名会毁掉全世界的存量代码。所以**边界的第一行**永远是主动标注：

```typescript
const data: unknown = JSON.parse(text);   // any 一碰到 unknown 注解就被驯服
```

纪律一句话：**边界用 unknown，核心永不 any。** argv、JSON、fetch 响应、读回来的文件——凡是"从外面进来的"，进门是 unknown，过守卫（§2.5），之后全程类型安全。第 6 课的 zod 干的就是这件事的自动化版，但手写这一遍你才知道 zod 替你扛了什么。

### §2.5 自定义守卫与解析器：认数据，还是造数据

**守卫（guard）：数据本来就该长这样，我来认。**

```typescript
function isOrderStatus(x: unknown): x is OrderStatus {
  return x === "pending" || x === "paid" || x === "shipped" || x === "cancelled";
}
```

- 返回类型写 `x is OrderStatus`（**类型谓词**）而不是 `boolean`——这一笔是给编译器的授权书：return true 的控制流里，`x` 收窄成 `OrderStatus`。
- 证据必须写进 **return 表达式**（字面量比较是它认的证明）；返回 `boolean` 的普通函数没有这个效力。
- 用起来：`if (!isOrderStatus(data.status)) return undefined;` 之后，`data.status` 就是 `OrderStatus`——你在替编译器作证。

⚠️ **守卫是支票，不是铁闸。** 签名承诺"return true ⟺ x 真的是 T"，但编译器**不检查你的 return 逻辑是否兑现承诺**——写 `return true` 的假守卫编译照样过（学有余力亲手试）。第 1 课"注解是声称，数据是事实"的第三次兑现：声称家族到目前为止有三位——注解、`as`、守卫，每一位都是"你说了算，运行时见真章"。所以守卫里的检查要覆盖 `T` 的全部要求，一行不能少。

**解析器（parser）：数据是脏的，我把它加工成合法的。**

守卫只能"认"，不能"改"。当 amount 在老系统导出的 JSON 里是字符串 `"128.5"`、而目标是 `number`——给这种数据写 `x is Order` 就是撒谎（过了守卫，运行时它还是字符串）。这时写解析器：

```typescript
function parseOrder(data: unknown): Order | undefined {
  // ……逐层守卫，全部通过之后：
  return { status: "pending", amount: Number(amountText) };   // 造一个全新的、类型属实的对象
}
```

返回类型 `Order | undefined` 是第 3 课"把可能没有如实写进签名"的直接续集：**解析失败不是异常，是正常结果之一**，调用方 `??` 兜底。一句话分工：**守卫认数据，解析器造数据**——ex8 两个都要写。

---

## §3 练习：80 分钟，主菜上桌

两个文件都在 `02_类型建模/`：任务 1 在 `ex7_order.ts` 里建订单状态机，任务 2 在 `ex8_parse.ts` 里写手写解析器。

### 任务 1 · 订单状态机（45 分钟）

打开 `02_类型建模/ex7_order.ts`——图纸全在文件头注释里。剧本：`pending →(pay)→ paid →(ship)→ shipped`，`paid →(cancel)→ cancelled`。硬性要求：

1. 定义 `OrderStatus` 和 `Order` 判别联合，四个变体只带各状态成立的字段（形状见文件头）；
2. 写哨兵 `assertNever`；
3. 写 `next(order: Order, action: "pay" | "ship" | "cancel"): Order`——合法流转照剧本走（`paidAt` 用 `new Date().toISOString()`，`trackingNo` 自己造一个）；**非法组合一律 `throw new Error`**，错误信息要说清"什么状态想干什么"；
4. `switch (order.status)` 四个 case 全写，`default` 交给 `assertNever`——这就是穷尽检查；
5. 演示区：订单的一生走全（pay→ship 一单、pay→cancel 一单，每步打印）+ 非法流转演示（用 `try/catch` 接住 throw 打印出来——错误路径要有人接）；
6. **删 case 实验**（文件底部 TODO 5 有步骤）：删掉一个 case → `npx tsc --noEmit` 看编译器怎么骂你 → 报错原文贴回文件里的注释（截图存本目录也行）→ 恢复 case，确认回到 0 error；
7. 全程禁 `as` / `!`，命名 camelCase。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：流转用展开，一个不多一个不少
> case 里面 `order` 已经收窄成那一支，`{ ...order, status: "paid", paidAt: ... }` 恰好带上该带的字段、覆盖 status、补上新字段。这就是"变体只装自己的字段"的分红：换状态时不需要搬行李。

> [!tip]- 提示 2：想点 trackingNo 会红——这不是退步，是边界的本来面目
> `next` 的返回类型是宽的 `Order`：出了函数，窄化就被还回去了（第 3 课"证明活在使用点上游"的续集）。演示时想打印 trackingNo，先 `if (shippedOrder.status === "shipped")` 再点。要是嫌烦——想想为什么返回类型不该是某个窄变体：调用方拿到的是"四种皆可"的订单，这才是事实。

> [!tip]- 提示 3：删 case 实验删哪个都行，推荐 cancelled
> 报错信息（TS2345）会原样念出被漏掉的变体。贴回注释时**连错误码一起贴**——这份留痕是判卷证据。

> ✅ **检查点（比写完代码更重要）**
> `npx tsc --noEmit` 沉默；`npx tsx 02_类型建模/ex7_order.ts` 演示区打印出完整的一生 + 非法流转被拒的错误信息；删 case 实验的报错已留痕、恢复后回到 0 error；演示里对独有字段（trackingNo / reason）的访问都是**窄化之后**的。

### 任务 2 · 手写解析器（35 分钟）

打开 `02_类型建模/ex8_parse.ts`——坏数据已备好三组，好数据一组。剧本：老系统导出的订单 JSON，`amount` 一律是字符串（`"128.5"`），目标是把它安全加工成 `Order`（`amount: number`）。硬性要求：

1. 写小守卫 `isOrderStatus(x: unknown): x is OrderStatus`——你第一次亲手写类型谓词；
2. 写解析器 `parseOrder(data: unknown): Order | undefined`：`typeof` / `in` 逐层守卫（守门员风格：不过就 `return undefined`）；
3. **amount 的安全转换**：先确认是字符串，再 **trim 后判空**（`Number("") === 0`——NaN 检查抓不住空串！第 3 课 ex6 欠下的加固今天正式补考），再 `Number` + `Number.isFinite` 拦住解析不出数字的；
4. 全程禁 `as`——一个都不许（`in` 的窄化够用，见提示 2）；
5. 演示区：好数据打印出**已是数字**的 amount；三组坏数据全部打印"已拒绝"，缺一不可。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：逐层的顺序就是漏斗的形状
> 先 `typeof data !== "object" || data === null` 挡掉非对象和 null，再 `"status" in data`，再 `isOrderStatus(data.status)`，再按 `data.status` 逐支检查独有字段（`"paidAt" in data` + `typeof ... !== "string"`）。每层"不过就 return undefined"——第 3 课守门员风格原样搬过来。

> [!tip]- 提示 2：`in` 之后才能点，点了类型是 unknown——这就是不用 as 的路
> `"status" in data` 通过后，`data.status` 才能访问，类型是 unknown；接着 `isOrderStatus(data.status)` 把它收窄。同理 `"amount" in data` + `typeof data.amount !== "string"` 挡完，`data.amount` 就是 string，存进局部变量再加工。全程没有任何一步需要"我断言它是什么"。

> [!tip]- 提示 3：空串那关，NaN 帮不了你
> `Number("") === 0`、`Number("  ") === 0`——空串和全空白串都能"成功"解析成 0，`Number.isFinite` 一点意见都没有。必须在 Number 之前自己判：`text.trim() === ""` 就拒绝。想想 ex6 里空回车差点被当成猜了 0——同一个坑，这次站在数据边界上堵它。

> ✅ **检查点**
> 好数据的 amount 打出数字 `128.5`（不是字符串 `"128.5"`）；坏数据 3（空串金额）打印"已拒绝"而不是 `amount: 0`——这是本任务的判卷眼；`npx tsc --noEmit` 沉默；全程没写 `as`。

### §3.4 自查清单

- [ ] ex7：Order 四变体只装各状态成立的字段；试着造过非法状态（手滑字面量 / 多余字段），确认被 TS2322 / TS2353 拦下
- [ ] ex7：删 case 实验完成，报错原文已留痕（含错误码），恢复后 0 error
- [ ] ex7：非法流转被拒有演示，throw 被 try/catch 接住
- [ ] ex8：`isOrderStatus` 签名是 `x is OrderStatus`，能说出它和返回 `boolean` 的区别
- [ ] ex8：空串金额被拦——`Number("") === 0` 的坑补上了
- [ ] ex8：全程没写 `as` / `!`，命名 camelCase
- [ ] 复查：守卫生效的范围内，没有再上多余的 `?.`（第 3 课回潮点，开场复查过的那条）

> 💡 **卡住 20 分钟就求助**
> 老规矩四样：期望什么、实际发生什么、完整报错、相关代码。今天尤其欢迎两类问题：任务 1 里"这个流转的返回类型该怎么写"（建模判断正是今天的课）；任务 2 里"这层守卫我写了 X，够不够"（边界刻画欢迎拿来一起看）。

---

## §4 复盘：10 分钟检索练习

规则同前三课：**合上代码**，先在心里把答案完整说出来，再点开折叠对照。"感觉我知道"不算数——说得出来才算。答完之后，把三道复盘问题口述成文字发我，我来判卷：

1. 判别联合比 `isPaid` + `isShipped` + `isCancelled` 三个 boolean 好在哪？后者能表达出多少种非法状态？
2. `never` 穷尽检查是怎么工作的？为什么新增状态时它会强制你处理？
3. "边界用 unknown，核心永不 any"——这句话你怎么理解？

自测五题（每题先默答，再点开「看答案」）：

**Q1. 判别字段为什么必须是字面量类型？`status: string` 行不行？**

> [!question]- 看答案（先默答再点开）
> **不行。** 收窄的原理是"比较即筛除"：`order.status === "paid"` 能把联合筛到只剩 paid 那支，前提是各变体的 status 类型互不相同。全是 `string` 的话路标全一样，比完了哪一支也筛不掉。字面量（或 `as const`）才让每个变体的路标独一无二——这是判别联合里"判别"二字的全部含义。

**Q2. 删掉一个 case 后，报错为什么恰好落在 assertNever 那一行？**

> [!question]- 看答案（先默答再点开）
> switch 的 case 是逐支收窄的过程：每处理一个字面量，default 里剩下的类型就少一支。四个全写完，default 里 `order` 只剩 `never`——传给 `assertNever(x: never)` 合法。删掉 cancelled 那支，default 里就剩下它：`{ status: "cancelled"; ... }` 塞不进 `never` 参数，TS2345 当场红，报错原文念的就是被漏掉的那支。反过来，没有哨兵的 switch 删 case 是静默的——遗漏从运行时事故提前成编译期事故，靠的就是这一行。

**Q3. unknown 和 any 各用一句话？"收"和"用"两个方向待遇差在哪？**

> [!question]- 看答案（先默答再点开）
> **any 是"我放弃了"（检查全关），unknown 是"我还不知道"（用之前必须窄化）。** 收的方向两者一样宽：任何值都能赋进来。差别全在后面：any 随便点、随便传、还能赋给任何类型；unknown 点一下就 TS18046，也只能赋给 unknown / any / never。`JSON.parse` 签名返回 any 是历史包袱，所以边界第一行永远是自己标 `const data: unknown = JSON.parse(text)`。

**Q4. 守卫写成 `return true` 的假守卫，编译器拦不拦？这呼应第 1 课的哪句话？**

> [!question]- 看答案（先默答再点开）
> **不拦。** `x is T` 是开给编译器的支票，它只认签名、不验账。第 1 课"注解是声称，数据是事实"的第三次兑现——声称家族三位成员：注解、`as`、守卫，都是"你说了算，运行时见真章"。所以守卫的 return 必须真实覆盖 T 的全部要求；这也是第 6 课 zod 的卖点——校验逻辑和类型声明同源，支票和账本是一家。

**Q5. 什么时候写守卫（`isOrderStatus`），什么时候写解析器（`parseOrder`）？**

> [!question]- 看答案（先默答再点开）
> **数据本来就长对、只需确认——守卫（认数据）；数据要加工（字符串金额转数字）——解析器（造数据）。** 解析器返回全新构造的属实对象，签名 `Order | undefined` 如实带上"可能解析失败"。给需要加工的数据写 `x is Order` 是撒谎：过了守卫，运行时它还不是 T——编译全绿、运行时真错，比 any 还隐蔽。

---

## §5 下课

**学有余力（可选）**：两道都很有戏。① **假守卫实验**：写一个 `function isAlwaysOrder(x: unknown): x is Order { return true; }`——编译过；把它换进 parseOrder 跑坏数据，亲眼看"类型说的"和"运行时拿的"两回事，两行备注写进演示区。② **第五个状态**：给状态机加 `refunded`（从 shipped 退款），全项目哪些地方红了？数一数这份"改造清单"——这就是新增状态的代价被编译器列成 TODO 的样子（体验完撤掉，别把项目留红）。

**完成后回来找我**：把复盘三题的口述发我，我判卷、勾计划里的 checkbox、记学习档案。第 4 课到这里，你已经会"用类型建模业务状态"了——这 20 小时里最值钱的一招。下一课换挡：**第 5 课 · 异步**。你在 ex6 里自己拆掉 `async main` 黑盒用上的 top-level await、`rl.question` 前面那个 `await`、还有当时一句带过的 `void main()`——第 5 课全部拆开。核心认知剧透：async 函数返回的永远是 Promise——**提货单，不是货**。然后随时可以喊"**开始第 5 次课**"。

> 💡 **我是你的导师，不是课件**
> 这页是提词器，提问的地方在对话框里。今天特别欢迎拿来讨论的两类问题：任务 1 里"这个字段该归哪个变体"（建模判断没有唯一解，说出你的理由比答案本身值钱）；以及复盘题 3——它没有标准答案，"边界"和"核心"的界线你画在哪，本身就是这份学习档案最值钱的一页。

---

*上一课：[第 3 课 · 可空与窄化](0003-narrowing.md) ｜ 下一课：第 5 课 · 异步（完成本课后解锁）*
*TypeScript 开发 · 20 小时速通 · 总计划见 [00_20小时速通计划.md](../00_20小时速通计划.md)*
