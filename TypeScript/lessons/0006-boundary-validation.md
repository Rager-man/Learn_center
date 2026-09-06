# 第 6 课 · 边界校验——fetch、JSON 与 zod

> **TypeScript 开发 · 20 小时速通 · 6 / 10**
> 节奏：**30–40 分钟学**（§0–§2）→ **80 分钟练**（§3，代码放 `03_工程与异步/`）→ **10 分钟复盘**（§4）。
> 今天是**还债课**。这门课到现在攒了三笔 any 旧账：第 1 课 `JSON.parse` 的 any（`data.nama` 打出 undefined）、第 5 课 `r.reason` 的 any（你用 `instanceof` 窄化绕了过去）、今天见第三笔——`res.json()` 的 any。三笔账同根同源：**类型是你单方面的声称，外面进来的数据没读过你的声称**。今天把 mock 换成真的 fetch，在数据进口修一道关卡——用 zod，你在第 4 课手写的那个守卫漏斗的自动化版。
> 你有 Python 基础——今天满眼都是熟人：`fetch` ≈ `requests.get`（连"404 不报错"的脾气都一样），`res.json()` ≈ `r.json()`，zod ≈ pydantic。

---

## §0 开工准备（5 分钟）

先跑安检：

```bash
npx tsc --noEmit   # 沉默
```

今天有一个新依赖 **zod**（备课时装好了；装它的命令是 `npm i zod`）。注意它落进了 `package.json` 的 **dependencies** 而不是 devDependencies——为什么？第 8 课正式讲，先记一眼：它是**运行时**要用的，不是只在写代码时用的。

练习文件已建好两个，都在 `03_工程与异步/`：

- `ex12_weather_cli.ts` —— 天气 CLI：真的 fetch + open-meteo + zod 校验（骨架不发请求，写完才跑）
- `ex13_boundary_checklist.ts` —— 边界清单审计台（清单和留痕写在这，代码改动落 ex12）

**开场复查（10 秒）**：第 5 课 ex11 你亲手用过 `PromiseSettledResult`——`r.status === "fulfilled"` 一比较，成功分支里才有 `.value`。今天 zod 的 `safeParse` 返回**同款结构**：判别联合第三次官方现身（第一次是你第 4 课手写的 Order，第二次是官方的 settled 结果）。另外两笔旧账今天到期：ex11 里 `r.reason` 的 any 你绕过去了，ex9 里 `.then` 你也点破过了——今天 top-level await 一条道写到底，fetch 的错误路径一条不漏地接。

> ⚠️ **一句丑话（专门写给你的前科）**
> 第 5 课 ex11 的"必败版演示"你漏过一整段指令，整改 3 条才修净。今天任务 1 的压轴是"**三连实测**"——三条错误路径逐条触发、逐条留痕，一段都不能漏。开工前先把 §3 的两个检查点读一遍，照着清单做。

> 💡 **课前读什么**
> [MDN：使用 Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)——重点就一句：**fetch 不会因为 404/500 而 reject，必须查 `res.ok`**（§2.2 展开为什么）。[zod 官网](https://zod.dev/) 的 "Basic usage"——看 schema 长什么样、`parse` 和 `safeParse` 的区别即可，今天的用量比文档短。

---

## §1 核心认知：类型管不到的地方，恰恰是数据进来的地方

> ◆ **本课唯一必须带走的东西**
>
> **类型只管编译期。数据进来的边界（网络、文件、用户输入）必须做一次运行时校验，之后才能全程类型安全。**

先算第三笔账。`res.json()` 把响应体读成对象——它的返回类型是什么？给编译器上刑（实测）：`never` 什么类型都塞不进去，报错信息会招供真相——

```typescript
const raw: never = await res.json();
// error TS2322: Type 'any' is not assignable to type 'never'.
//                                          ^^^^ 它自己招了
```

和 `JSON.parse`（第 1 课）、`r.reason`（第 5 课）一字不差的家伙。不是巧合：**编译器没法替网络做担保**——它没见过那个服务器、那份数据，它凭什么知道返回长什么样？凡是从进程外面进来的数据，类型检查一律够不着。

三个推论，今天反复会用到：

1. **边界在"数据进来"的地方，不在代码中间。** 你自己写的代码之间，类型是可信的——编译器全程盯着每一行。数据跨过进程边界那一刻（网络响应、命令行参数、文件内容、环境变量），检查就失效了——**那里才是唯一需要设防的关口**。在代码中间四处设卡是浪费（第 3 课的窄化已经覆盖了内部流动），边界裸奔才是事故。
2. **校验一次，之后全程。** 在进口验一次身，拿到手的数据在程序内部就真的配得上它的类型了——后面每个函数的参数类型都不再是"声称"。复盘第 3 题问的"一次"和"之后"，分界线就是**边界本身**。
3. **zod 不是新学科，是第 4 课手写守卫的自动化版。** ex8 你用 `typeof` / `in` / `Array.isArray` 逐层搭漏斗，二十行守一个对象；zod 用一份 schema 把漏斗、类型、报错三件事一次做完。今天你会亲手验证这个"自动化版"到底自动了什么。

> ⚠️ **本课避坑**
> **fetch 不因 404/500 reject。** 它认为"服务器应答了"就是成功——状态码是服务器说的话，属于**数据**，不是事故。所以"try/catch 包住 fetch 就算处理完错误"会漏掉整条非 2xx 路径。三条错误路径怎么各就各位是 §2.2 的主菜。纪律延续：全程禁 `as` / `!`，命名 camelCase。

### §1.1 动笔预测（5 分钟）

老规矩，**先别用 IDE**。逐段预测：tsc 报不报？tsx 跑出什么？（C 段的 `schema` 就是 §2.3 要写的那份天气 schema；D 段只需纸面想。）

```typescript
// A —— fetch 一个不存在的路径（服务器会好好回你一个 404）
const res = await fetch("https://api.open-meteo.com/v1/badpath");
// ← 这行会 reject 吗？res.ok 是什么？res.status 是什么？

// B —— JSON.parse 不是 JSON（第 1 课的旧账）
const d = JSON.parse("不是JSON");
// ← tsc 报不报？tsx 会怎样？

// C —— schema 拦截（字段名故意改错：MAX 大写）
const r = schema.safeParse({ daily: { time: ["2026-09-05"], temperature_2m_MAX: [32.9] } });
// ← r.success 是什么？失败信息从哪个属性读？

// D —— 校验之后的类型
type Weather = z.infer<typeof schema>;
// ← 这个 Weather 类型从哪来的？和手写 interface Weather {...} 比，差在哪？
```

写完再对照（猜错很正常，错在哪就是哪没懂；A/B 两段今天的任务 1 会亲手触发）：

> [!success]- 对照答案（先写完再展开）
> **A：不 reject，正常返回。** 实测：这行 fetch **成功 resolve**，`res.ok === false`、`res.status === 404`——而且 body 还是好好的 JSON（`{"reason":"Not Found","error":true}`）。reject 留给"连话都没说上"的事故（断网、域名解析失败）。这是 fetch 最反直觉的一条，也是三错误路径里唯一需要**手动**查的。
>
> **B：tsc 沉默，tsx 抛错。** 沉默是因为返回类型是 any（第 1 课的账）；抛的是 `SyntaxError: Unexpected token ...`——运行时炸、没人接就把整个程序带走（第 5 课 D 段）。今天这条账由 fetch 的同款 try/catch 一起结算：`res.json()` 底层就是 `JSON.parse`（实测报错堆栈里赫然 `at JSON.parse`）。
>
> **C：`r.success === false`，失败信息在 `r.error.issues`。** 实测 `issues[0].message` 是 `"Invalid input: expected array, received undefined"`、`issues[0].path` 是 `["daily", "temperature_2m_max"]`——**它告诉你差在哪一层、差什么**，比"打出 undefined"体面得多。成功的分支里才有 `r.data`——判别联合，你早就会了。
>
> **D：类型从 schema 推导出来，schema 是唯一真相源。** 手写 interface 时，"类型声明"和"校验逻辑"是**两份**可能打架的代码（改了 interface 忘改守卫，编译器不吱声）；z.infer 让类型直接从 schema 生成——**一份真相**。这就是"类型从数据来"。

---

## §2 看清你写下的东西（30 分钟）

学前阅读讲"fetch 怎么用、zod 怎么写"。这一节讲六件手册不会直说的事：fetch 其实是你认识的 Promise 物种、三条错误路径各在哪、为什么 404 不算事故、zod 自动化了你手写的什么、safeParse 为什么又是判别联合、以及——你的程序到底有几个"门"。

### §2.1 fetch 是 Promise 物种（换装不换纪律）

第 5 课的全部纪律照搬：`fetch(url)` 返回 `Promise<Response>`——见 `Promise<` 就 await。但拿到手的 **Response 不是数据**，是一张**回执**：状态码、响应头、和一个**还没读**的 body。读 body 又是一张单：

```typescript
const res = await fetch(url);        // 单子 1：回执。await 之后就永远不会再 pending
const raw = await res.json();        // 单子 2：把 body 读出来、parse 成对象
```

两次 await、两张单子——第 5 课"见单就 await"的纪律刚好用两次。而第二张单的货，类型是 `any`（§1 实测的第三笔账）。Python 对照：`requests.get()` 的 Response / `r.json()`，几乎逐字对应，连"两步走"都一样。

### §2.2 三条错误路径：各在哪，谁来拦（主菜）

| #   | 路径           | 发生什么                          | 谁来拦                |
| --- | -------------- | --------------------------------- | --------------------- |
| 1   | 网络错误       | `fetch()` **自己 reject**          | try/catch 接          |
| 2   | 非 2xx（404/400/500…） | **正常 resolve**，`res.ok === false` | **你手动查** `res.ok` |
| 3   | JSON 损坏      | `res.json()` **抛错**              | try/catch 接          |

三条路径今天全部实测过，原文在案：

```text
路径 1 —— 把主机名改坏（api.open-meteo.com → api.open-meteo.comx）：
  TypeError: fetch failed          ← 这句话几乎没信息量！
  真凶在 err.cause 里（e.cause.code，实测是 ENOTFOUND——域名解析失败）

路径 2 —— 纬度传 999（open-meteo 的规则：纬度 -90~90）：
  fetch 正常 resolve；res.ok === false；res.status === 400
  body 是 {"error":true,"reason":"Latitude must be in range of -90 to 90°. Given: 999.0."}

路径 3 —— 响应 200 但 body 不是 JSON（实测用 example.com，HTML 页面）：
  SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
  （报错堆栈里赫然 at JSON.parse —— json() 底层就是它，第 1 课的账在这结算）
```

标准形状（今天 ex12 的骨架就是这么挖的）：

```typescript
try {
  const res = await fetch(url);            // 路径 1 在这 reject → 落进 catch
  if (!res.ok) {                           // 路径 2 在这拦（唯一要手动查的一条）
    console.log(`HTTP ${res.status}：API 拒绝了这次请求`);
    process.exit(1);                       // 黑盒照抄：打印完人话，退出码 1（第 5 课 D 段见过它的分量）
  }
  const raw: unknown = await res.json();   // 路径 3 在这抛 → 落进同一个 catch
  // …第四关（zod）从这继续
} catch (err) {
  if (err instanceof Error) {              // 第 4 课纪律：先验明正身再点
    console.log(`网络层出事：${err.message}`);
  }
}
```

三个要点：

- **路径 1 和 3 共用一个 catch**，不冲突——打印靠 `err.message` 天然分得清（`fetch failed` vs `Unexpected token`）。第 5 课"错误路径必须有人接"的判卷标准，今天升到网络版。
- **路径 2 没有 try/catch 可指望**——fetch 认为这次请求**成功了**，你不查 `res.ok` 它就静默流过去，后面 zod 帮你兜住还好，没 zod 就是下一课的 `data.nama`。这是三路径里唯一"纯手动"的，也是 fetch 设计哲学的必然——**HTTP 状态码是协议的一部分，是服务器说的话（数据），不是"说话失败"（事故）**；reject 留给 TCP 层。Python 的 requests 同款脾气：不调 `raise_for_status()` 它也不炸。
- `err.cause` 是个冷知识：fetch 的 reject 把真正的原因藏在 cause 里（实测 `ENOTFOUND`）。打印错误时顺手带上它，报错才有定位价值。

### §2.3 zod：把第 4 课的漏斗写成一份 schema

回忆 ex8：守一个 `JSON.parse` 的结果，你手写了五层漏斗——`typeof` 是对象 → `in` 有 daily → `Array.isArray` → 数组长度 → 每个元素是 number。二十行，守一个对象，还只守得了一个对象。zod 版：

```typescript
import { z } from "zod";

const weatherSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),                 // 日期数组：["2026-09-05", "2026-09-06"]
    temperature_2m_max: z.array(z.number()),   // 每天最高温：[32.9, 31.2]
    temperature_2m_min: z.array(z.number()),   // 每天最低温：[22.3, 22.1]
  }),
});

type Weather = z.infer<typeof weatherSchema>;   // 类型不用手写——从 schema 推导
```

读法：schema 是**数据的图纸**（和第 2 课 interface 一个意思），但这份图纸是**可执行的**——它不只是描述，还能真的跑一遍校验。`z.infer<typeof ...>` 把图纸反向生成类型：**类型从数据来，不再从手写来**。

为什么这是质变？手写 interface + 手写守卫是**两份真相**：改 interface 忘改守卫，编译器不吱声，校验和类型就开始撒不同的谎。schema 是**一份真相**：类型是它的影子，影子永远不会和本体打架。这也回收了 ex9 思考题的同族共性——"类型声称 vs 运行时事实"的裂缝，靠"让声称从事实生成"来焊死。

Python 对照：pydantic 的 `BaseModel` + `model_validate`，连"类型注解即校验规则"的思路都同款。

### §2.4 safeParse：第四关，还是判别联合

校验入口有两个，别选错：`schema.parse(data)` 失败**直接 throw**（适合把 schema 当断言用）；`schema.safeParse(data)` **不炸**，把结果装好还你——CLI 要自己打印人话，用 safeParse：

```typescript
type ZodSafeParseResult<T> =            // zod 的返回值（示意）——眼熟吗？
  | { success: true;  data: T }         // 成功变体：才有 data，类型 T 就是 z.infer 来的 Weather
  | { success: false; error: ZodError }; // 失败变体：才有 error

const r = weatherSchema.safeParse(raw);
if (r.success) {
  console.log(r.data.daily.time[0]);    // 判别字段一比较，联合收窄——.data 才存在
} else {
  console.log(r.error.issues[0].message);       // "Invalid input: expected array, received undefined"
  console.log(r.error.issues[0].path.join(".")); // "daily.temperature_2m_max" —— 差在哪一层，指名道姓
}
```

判别联合的现身史，值得列一次：**Order（第 4 课，你手写）→ `PromiseSettledResult`（第 5 课，官方）→ safeParse 结果（今天，第三方库）**。同一个建模思想三层出现——"一个结果，多种下场，下场决定带什么字段"。你不是在学新东西，是在看旧功夫到处都在用。

至此错误路径凑齐**四关**：① 网络错误（fetch reject）② 非 2xx（`res.ok`）③ JSON 损坏（`json()` 抛错）④ 结构不符（safeParse 失败）。前三关是 fetch 的，第四关是 zod 的——而且只有第四关能发现"`{reason, error}` 也是好好的 JSON，但根本不是你要的天气"这种**结构层面的答非所问**。open-meteo 的 400 响应就是现成例子：路径 2 拦下它之后，如果你不退出而继续 parse——第四关照样能拦住。

### §2.5 "一次"与"之后"：数清你的进口

判断一个东西是不是"边界"，一句话：**这份数据进我的进程之前，谁看过它？** 没人看过、验过的，都是进口。今天天气 CLI 的进口有两个：**命令行参数**（argv）和 **API 响应**。环境变量、文件内容同样是进口——今天用不上，第 9 课的待办 CLI 会全用上（文件里存的 JSON 读回来，一样要过 zod）。

argv 是最常被裸奔的进口。第 1 课 BMI 你就见过 `Number("abc")` 的下场是 NaN；纬度传 999 更隐蔽——`Number("999")` 是个好好的数字，编译器毫无意见，实测要**一路走到 open-meteo、被它用 400 打回来**（那句 "Latitude must be in range of -90 to 90°"）才发现错。错误离根因隔了一整趟网络往返。"校验一次"的深层好处：**把关口修在进口，错误离根因最近**；过了关，程序内部所有类型就都是真的了——这就是"之后全程类型安全"。任务 2 就是给你的 CLI 做一次进口大盘点。

### §2.6 黑盒清单（今天的和以前的）

今天新增三个黑盒，都只需"照抄会用"：zod 的内部机制（schema 怎么编译、怎么校验——会定义、会读 issues 就够）；Response 的全貌（headers、body 方法族——今天只用 `ok` / `status` / `json()` 三件套）；`process.exit(1)`（打印完人话体面退出，退出码 1）。今天退休三个：`fetchUser` mock（第 5 课道具，功成身退）；`JSON.parse` 的裸用（从此它的产物要么进 zod 要么进守卫，any 账清了）；三笔 any 旧账（`JSON.parse` / `r.reason` / `res.json()`——今天全部结清）。下一课预告一个大件：`retry` 签名里的 `<T>` 第 7 课转正——顺便说，`z.infer<typeof weatherSchema>` 里那个 `typeof` 已经在偷偷用泛型的思想了。

---

## §3 练习：80 分钟，主菜上桌

两个文件都在 `03_工程与异步/`：任务 1 在 `ex12_weather_cli.ts` 写真的 fetch + zod，任务 2 在 `ex13_boundary_checklist.ts` 做进口审计。

### 任务 1 · 天气 CLI（60 分钟）

打开 `03_工程与异步/ex12_weather_cli.ts`——URL 模板是黑盒照抄（参数名是 API 的合同条款），其余都是你的。硬性要求：

1. argv 取纬度、经度（`process.argv.slice(2)` + `Number()`）——**校验先不做**，任务 2 会回来统一清算这个进口（伏笔明示：先按第 1 课 BMI 的老办法裸取）；
2. 三条错误路径按 §2.2 的形状各就各位：一个 try/catch 接住路径 1 和 3（打印 `err.message`，分得清是哪条）、`res.ok` 查路径 2（打印 `res.status`）；
3. `res.json()` 的结果**注解成 `unknown`**——它是 any，但你的程序里从今天起不欠任何 any 账；
4. `weatherSchema` 照 §2.3 写（两层 `z.object`、三个数组），类型用 `z.infer` 推导——**全程不许手写数据 interface**；
5. `safeParse` 失败：打印 `issues[0]` 的 `message` 和 `path.join(".")`，然后 `process.exit(1)`；成功：从 `r.data` 取今明两天，逐天打印日期、最高、最低；
6. **三连实测（判卷重点，一段不能漏）**：①把 URL 主机名改坏，跑 ②纬度传 999，跑 ③把 schema 里 `temperature_2m_max` 故意改成 `temperature_2m_MAX`，跑——每条留痕"哪一关拦下、打出什么"；实测完**全部改回**，正常参数（如 39.9 116.4）再跑一遍确认健康。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：三关的骨架形状，§2.2 照抄就行
> `try { const res = await fetch(url); if (!res.ok) {...} const raw: unknown = await res.json(); ... } catch (err) {...}`。catch 里先 `instanceof Error` 再点 `.message`（第 4 课纪律）；路径 2 的打印里带上 `res.status`——判卷时分不清"哪关拦的"算不过。

> [!tip]- 提示 2：schema 就两层楼，别盖三层
> 外层只有一个字段 `daily`；`daily` 里面三个数组字段。`z.array(z.string())` 读作"string 数组"。写完把鼠标悬停在 schema 名上看看推导出的类型——那就是 `z.infer` 要给你的东西。

> [!tip]- 提示 3：实测 ② 之后可以顺手多看一眼
> 纬度 999 被 `res.ok` 拦下时，body 里那句 `reason`（"Latitude must be in range of -90 to 90°"）就是 open-meteo 自己的校验规则——任务 2 的 `parseCoords` 会把这条规则**抄到本地**，999 就不用跑一趟网络才被打回了。

> ✅ **检查点（比写完代码更重要）**
> 三连留痕齐全、每条分得清是哪一关拦的；类型全部来自 `z.infer`，没手写数据 interface；`safeParse` 失败信息带 `message` 和 `path`；实测后代码已改回、正常参数能出今明温度；`npx tsc --noEmit` 沉默。

### 任务 2 · 边界清单（20 分钟）

打开 `03_工程与异步/ex13_boundary_checklist.ts`——这个文件是**审计台**：清单和留痕写在这，代码改动落在 ex12。硬性要求：

1. 数进口：用 §2.5 那句判断标准（"进我的进程之前，谁看过它？"），把天气 CLI 的数据进口**全部**列进清单（至少 2 个；今天没用到的环境变量、文件也各占一行，标注"未使用"）；
2. 每个进口标注：有校验吗？哪一关？没有的写清"坏输入会走到哪"；
3. 给没校验的进口补防：在 **ex12** 里写 `parseCoords(args)`，三关——① 个数不对 ② `NaN` ③ 越界（纬度 ±90、经度 ±180，规则抄 open-meteo 的）——然后把裸取换成它；
4. 补前 vs 补后对比：三个坏输入（`abc 116.4` / `999 116.4` / `39.9`）各跑一遍，留痕"以前走到哪、现在第几关拦下"，最后一句话结论（把关口修在哪最划算）。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：进口可能比你直觉的多，也比你想的少
> URL 字符串不是进口——它是你**自己拼的**（编译器全程盯着）；`process.env` 今天没用到——但只要用了它就是进口（环境变量从来没人替你验过）。判断标准就一句：外面进来的、没验过的。

> [!tip]- 提示 2：NaN 怎么判
> `Number.isNaN(Number(s))`。为什么不能 `NaN === NaN`——因为 NaN 谁都不等于，包括它自己（第 1 课的坑，第 3 课也路过）。个数关用 `args.length !== 2` 拦。

> [!tip]- 提示 3：999 的前后对比是最值钱的一行留痕
> 补前：999 一路拼进 URL、走完一趟网络、被 open-meteo 用 400 打回（path 2 拦）；补后：argv 第一关就拦下，**网络都没碰**。把这两行并排写进留痕——"错误离根因的距离"从一趟往返缩到零。

> ✅ **检查点**
> 清单写全（用到的 ≥2 个 + 没用到的两个各一行）；`parseCoords` 三关在 ex12 生效；三个坏输入的补前/补后对比留痕齐全；正常输入仍能出结果；`npx tsc --noEmit` 沉默。

### §3.4 自查清单

- [x] ex12：三条错误路径的打印分得清是哪一条拦下的 ✅ 2026-09-06
- [x] ex12：三连实测留痕齐全（坏主机名 / 纬度 999 / schema 改错），实测后代码已改回 ✅ 2026-09-06
- [x] ex12：`res.json()` 结果注解了 `unknown`；类型全部来自 `z.infer` ✅ 2026-09-06
- [x] ex12：`safeParse` 失败信息带 `message` 和 `path` ✅ 2026-09-06
- [x] ex13：进口清单写全，每个进口有校验标注 ✅ 2026-09-06
- [x] ex13：`parseCoords` 三关生效；坏输入补前/补后对比留痕 + 一句结论 ✅ 2026-09-06
- [x] 全程没写 `as` / `!`，命名 camelCase ✅ 2026-09-06

> 💡 **卡住 20 分钟就求助**
> 老规矩四样：期望什么、实际发生什么、完整报错、相关代码。今天尤其欢迎两类问题：三连实测里打出**和课件原文不一样**的东西（比如网络环境的差异——那正是讨论"路径 1 的 cause 里到底有什么"的好机会）；以及任务 2 数进口数出了第三个（多想了一层还是真有——两种都值得说）。

---

## §4 复盘：10 分钟检索练习

规则同前五课：**合上代码**，先在心里把答案完整说出来，再点开折叠对照。"感觉我知道"不算数——说得出来才算。答完之后，把三道复盘问题口述成文字发我，我来判卷：

1. fetch 的三条错误路径分别是什么？各自怎么处理？
2. 用了 zod 之后，类型从哪来？和手写 interface 比有什么本质优势？
3. "边界校验一次，之后全程类型安全"——这句话里的"一次"和"之后"分别指什么？

自测五题（每题先默答，再点开「看答案」）：

**Q1. `fetch` 遇到 404 会怎样？为什么设计成这样？**

> [!question]- 看答案（先默答再点开）
> 正常 resolve——`res.ok === false`、`res.status === 404`，reject 都不算。因为 fetch 认为"服务器应答了"就是通信成功，**状态码是服务器说的话，属于数据**；reject 留给 TCP 层事故（断网、域名解析失败）。所以非 2xx 必须手动查 `res.ok`——指望 catch 会漏掉整条路径。

**Q2. `res.json()` 的返回类型是什么？这条账和哪两笔旧账同源？**

> [!question]- 看答案（先默答再点开）
> `any`。和第 1 课 `JSON.parse` 的 any、第 5 课 `r.reason` 的 any 同根同源：编译器没见过外面的数据，无法担保——而且 `json()` 底层就是 `JSON.parse`（报错堆栈可证）。处理纪律也同源：接住后注解/视作 `unknown`，交给守卫或 zod。

**Q3. `safeParse` 的返回值是什么结构？它和你第 4 课学的什么机制同款？**

> [!question]- 看答案（先默答再点开）
> 判别联合：`{ success: true; data: T } | { success: false; error }`——`success` 是判别字段，一比较联合就收窄，成功分支才有 `.data`。和第 4 课你手写的 Order 状态机、第 5 课官方的 `PromiseSettledResult` 同款："一个结果多种下场，下场决定带什么字段"。

**Q4. `z.infer<typeof schema>` 推出的类型，和手写 interface 比，本质差在哪？**

> [!question]- 看答案（先默答再点开）
> 真相源的数量。手写 interface + 手写守卫是两份可能打架的真相（改了声明忘改校验，没人报错）；z.infer 让类型从 schema 生成，**校验逻辑和类型声明同源**——一份真相，影子不会和本体打架。

**Q5. 你的天气 CLI 一共有几个数据进口？哪一个是今天补防的？**

> [!question]- 看答案（先默答再点开）
> 两个：argv（命令行参数）和 API 响应。API 响应在任务 1 设了防（四关的后三关 + zod 第四关）；argv 是任务 2 补防的（`parseCoords` 三关）——补防前，纬度 999 要走完一趟网络才被 API 的 400 打回。

---

## §5 下课

**学有余力（可选）**：两道都通向真实世界。① **超时控制**：真实网络会挂起——给 ex12 的 fetch 套 3 秒超时：`Promise.race([fetch(url), timeout(3000)])`，`timeout` 用第 5 课的 `sleep` 改造（睡醒就 throw "超时"）。这是第 5 课选做伏笔的网络版。② **parseCoords 回炉**：把它的返回值建模成判别联合 `{ ok: true; lat: number; lon: number } | { ok: false; reason: string }`——第 4 课功夫在返回值上的应用，调用方被迫处理失败分支。

**完成后回来找我**：把复盘三题的口述发我，我判卷、勾计划里的 checkbox、记学习档案。第 6 课到这里，这门课的地基就齐了——类型建模（第 2、4 课）、窄化（第 3 课）、异步（第 5 课）、边界（今天）。下一课换挡：**第 7 课 · 泛型与工具类型**——`retry` 签名里那个 `<T>` 黑盒正式转正；顺便你会发现 `z.infer<typeof weatherSchema>` 里早就藏着泛型的影子。然后随时可以喊"**开始第 7 次课**"。

> 💡 **我是你的导师，不是课件**
> 这页是提词器，提问的地方在对话框里。今天特别欢迎拿来讨论的两类问题：三连实测打出和课件原文不一样的现象（网络环境人人不同，那正是"路径 1 的 cause"的活教材）；以及任务 2 你数出的进口个数——比"标准答案"多一个少一个都没关系，说得出判断理由就是好答案。

---

*上一课：[第 5 课 · 异步](0005-async.md) ｜ 下一课：第 7 课 · 泛型与工具类型（完成本课后解锁）*
*TypeScript 开发 · 20 小时速通 · 总计划见 [00_20小时速通计划.md](../00_20小时速通计划.md)*
