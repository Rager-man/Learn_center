# 第 8 课 · 工程化与测试——从脚本到项目

> **TypeScript 开发 · 20 小时速通 · 8 / 10**
> 节奏：**30–40 分钟学**（§0–§2）→ **80 分钟练**（§3，代码放 `04_进阶与质量/`，备课时已建）→ **10 分钟复盘**（§4）。
> 今天是**发装备课**。先还三笔债：zod 为什么装在 dependencies（第 6 课你记的那一眼）、ex12 单文件拆模块（第 6 课埋的）、第 7 课学有余力的等价重构"怎么证明行为没变"。再发三件装备：npm 工程认知、ESM 多文件、vitest——第 9、10 课的实战，全在这套底盘上组装。
> 你有 Python 基础——今天满眼都是熟人：vitest ≈ pytest（describe/it/expect ≈ 测试类 + test 函数 + assert），`npm i -D` ≈ 只装在开发机的依赖，package-lock.json ≈ 锁死版本的 requirements.txt，入口文件 cli.ts ≈ `if __name__ == "__main__"` 那一段。

---

## §0 开工准备（5 分钟）

先跑安检——今天起是**两道**：

```bash
npx tsc --noEmit   # 第一道：沉默（老规矩）
npm test           # 第二道：绿——Test Files 2 passed (2)。骨架的 *.test.ts 还是空壳，0 test 也判绿
```

今天有一个新依赖 **vitest**（备课时装好了；装它的命令是 `npm i -D vitest`，`-D` = 装进 devDependencies）。注意它落进了 **devDependencies**——和 zod 的 dependencies 正好凑成一对对照组，第 6 课记下的那一眼，今天 §2.1 正式算账。顺带配好了两个脚本（package.json 的 `scripts` 字段，§2.1 逐行讲）：

- `npm test` → 单趟跑完所有测试就退出（判卷用一个稳定姿势）
- `npm run dev -- 39.9 116.4` → tsx 直跑拆分版天气 CLI 的入口（任务 2 的验收命令）

练习目录已建好两个，都在 `04_进阶与质量/`：

- `ex16_backfill_tests/` —— 任务 1：状态机 + 泛型三件套搬进模块，vitest 上保险（4 个文件）
- `ex17_weather_split/src/` —— 任务 2：天气 CLI 从单文件拆成三间屋（3 个文件）

**开场复查（10 秒）**：第 7 课任务 2 你做过一次"类型层面的等价重构"——update 换成白名单类型，行为不动。当时你凭什么信"行为不动"？`tsc --noEmit` 沉默说的是**类型等价**；演示跑了一遍说的是"抽查了三个输入"。第 100 次输入呢？空数组呢？`n = 0` 呢？**"我试过没问题"和"它保证没问题"之间，隔着的就是今天要装的东西。**

> ⚠️ **一句丑话（专门写给你的前科）**
> 四条。① 第 7 课整改三处全角字符事故（`？` 顶替 `?`、占位符没清）——升级政策：**凡涉及语法字符的整改，一律整行删掉重新键入、不做插字符式修补**，这轮试效果。② 今天 import 数量暴增，而你有过两次死 import 前科——**判卷第一步先扫每个文件的 import 区**，import 了没用的当场定罪。③ TODO 自报规则停用（两课两次没执行，不再假装它存在）——对账全在我这，你只管报疑问点。④ 复盘三题口述**仍然先于**练习判卷（第 7 课验证有效，保持）。

> 💡 **课前读什么**
> [vitest 官方 Getting Started](https://vitest.dev/guide/)——很短，重点看 "Writing Tests" 一节里 describe / it / expect 长什么样就够。另外按大纲找我用 10 分钟讲清 **package.json 常用字段与 dependencies / devDependencies 的区别**——这是学前阅读的一部分，开口要就是了。

---

## §1 核心认知：测试是重构的胆量

> ◆ **本课唯一必须带走的东西**
>
> **编译器担保"类型等价"，测试担保"行为没变"。有了后者，改代码才从赌命变成常规操作。**

开场复查那个问题的完整答案：类型等价有 tsc 站岗，行为没变靠什么站岗？靠测试——把"我试过这三个输入"升级成"每次改完代码，机器替我把这些输入全部重试一遍，试不过当场翻脸"。

三个推论，今天反复会用到：

1. **测行为，不测实现。** 断言写"给这个输入、该得到那个输出"，不写"函数内部第几行干了什么"。实现随便换（换算法、收拾类型、重构），测试一条不用动——这正是它够格给重构当保镖的原因。
2. **优先测纯函数。** 无网络、无 argv、无状态——输入定了输出就定。今天的状态机和三件套恰好全是纯函数；不可控的值（时间戳、随机数）测"在不在、是什么类型"，不测内容。这就是"哪些值得测"的第一条标准。
3. **测试的价值在"红"的那一下被证明。** 一套从来没红过的测试，你不知道它是真站岗还是摆设。所以今天有破坏实验：亲手改坏实现、亲眼看红、再恢复——见过红的测试，你才敢信它的绿。

> ⚠️ **本课避坑**
> **别追覆盖率数字。** "80% 覆盖率"不等于"改坏了会怕"——console.log 的格式、zod 的内部、演示区都不值得测（zod 有它自己的测试）。判断标准只有一条：**这个地方改坏了，我会不会怕？会，就配一条测试。**纪律延续：全程禁 `as` / `!`，命名 camelCase。

### §1.1 动笔预测（5 分钟）

老规矩，**先别用 IDE**。A、B 是 tsc 报不报、报什么；C 是这条测试绿还是红；D 只需纸面想。（A、B、C 的原文都是我备课实测的，包括报错码。）

```typescript
// A —— import 少写了扩展名（order-machine.ts 就在隔壁，里面有 next）
import { next } from "./order-machine";
// ← tsc 报不报？报什么？

// B —— 搬家时手滑：隔壁模块里写了 function assertNever(...) 但忘了加 export
import { assertNever } from "./order-machine.js";
// ← tsc 报不报？报什么？

// C —— vitest 断言：两边内容一模一样
it("chunk 切段", () => {
  expect(chunk([1, 2, 3, 4, 5, 6, 7], 3)).toBe([[1, 2, 3], [4, 5, 6], [7]]);
});
// ← 这条 it 是绿是红？为什么？

// D —— package.json 的户口
// zod 装在 dependencies，vitest 装在 devDependencies——
// 把 vitest 挪进 dependencies，程序会坏吗？那为什么还要分两边？
```

写完再对照（猜错很正常，错在哪就是哪没懂；A、B、C 建议开工后亲手再遇一次）：

> [!success]- 对照答案（先写完再展开）
> **A：报，TS2835。** 原文：`Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean './order-machine.js'?`——tsconfig 里 moduleResolution 是 **NodeNext**：TS 按 Node 的规矩找模块，而 Node 的 ESM 规矩是**相对路径必须写全扩展名**。报错甚至把正确答案递到嘴边（Did you mean...）。为什么是 `.js` 不是 `.ts`？§2.2 展开——这是今天的头号坑。
>
> **B：报，TS2305。** 原文：`Module '"./order-machine.js"' has no exported member 'assertNever'.`——export 是模块的"户口"：没 export 的名字是模块的私事，外面 import 不到。今天搬家唯一要加的语法就是它：**搬进模块的每个成员，前面加 export**。
>
> **C：红。** chunk 切出的数组和字面量 `[[1,2,3],[4,5,6],[7]]` 内容一样、**不是同一个对象**——toBe 比的是 Object.is（≈ Python 的 `is`），两个各自新建的数组永远过不了。实测报错原文：`AssertionError: expected [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7 ] ] to be [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7 ] ] // Object.is equality`，下面还补一句扎心的 `Received: serializes to the same string`——序列化成字符串一模一样（内容相等的铁证），但引用不同（判决书）。**数组、对象一律 toEqual**（深比较，≈ Python 的 `==`）；toBe 留给字符串、数字、布尔。
>
> **D：不会坏。** 挪过去照样能跑——分两边不是技术必然，是**账本纪律**：dependencies 记"运行时要用的"（zod：天气 CLI 每次跑都在 safeParse，它是产品的一部分）；devDependencies 记"只在开发机上用的"（vitest：用户拿到你的代码不需要跑你的测试）。账分清了，看账的人一眼知道哪些是产品依赖。复盘题 1 预演完毕。

---

## §2 看清你写下的东西（30 分钟）

学前阅读讲"vitest 怎么写、npm 怎么用"。这一节讲六件手册不会直说的事：package.json 每个字段在记什么账、import/export 的规矩与 `.js` 伏笔、vitest 三板斧的脾气、哪些行为值得测、红-绿循环怎么玩、以及哪些深处今天继续黑盒。

### §2.1 package.json：项目的户口本（zod 那笔账今天清）

拿着仓库根目录的真身逐字段看（省略号是版本号，没抄进来的 `main` / `repository` 等字段是 `npm init` 的模板残留，今天用不上，见过即可）：

```json
{
  "name": "learn_center",
  "version": "1.0.0",
  "scripts": {
    "test": "vitest run --passWithNoTests",
    "dev": "tsx TypeScript/04_进阶与质量/ex17_weather_split/src/cli.ts"
  },
  "type": "module",
  "dependencies":       { "dotenv": "...", "openai": "...", "zod": "..." },
  "devDependencies":    { "@types/node": "...", "tsx": "...", "typescript": "...", "vitest": "^5.0.0" }
}
```

- **scripts：给长命令起外号。** `npm run dev` = 跑那条 tsx 命令；`npm test` 是 npm 的亲儿子（`run` 可省）；`npm run dev -- 39.9 116.4` 里的 `--` 表示"后面的参数转交给脚本本人"。`--passWithNoTests` 是骨架期的护栏：一个测试文件都找不到时也判绿（等你写完测试，它就再也没机会出场）。
- **两本账的分界线就一条：运行时用不用。** zod 在 dependencies——CLI 跑起来每次都在校验，它是产品的一部分（第 6 课那一眼，销账）。vitest / typescript / tsx / @types/node 在 devDependencies——用户不需要测试框架、不需要编译器。顺带看一个耐人寻味的：**typescript 本人在 devDependencies**——"类型检查完就退场，运行时没有它"，第 1 课的类型擦除，在账本上的样子。
- **版本号的 `^`**：允许小版本升（5.x 都行、6.0 不装）。**package-lock.json**：把"今天实际装的每一个包的每一个版本"钉死记档——别人 clone 你的仓库后 `npm install`，装出和你一致的环境（≈ 你 pip 世界里锁定版本的 requirements.txt）。它随 `npm i` 自动更新，进 git、别手编。
- 这份户口本第 1 课你亲手 `npm init -y` 生成的——今天算是回头看清每一行在记什么。学习目标里的"npm init 从零建项目"，至此闭环。

### §2.2 ESM 多文件：import / export 与 `.js` 的真相

- **export 两种写法**：定义时直接加（`export function next(...)`——今天用这个），或文件尾统一列（`export { next, Order }`）。没 export 的名字是模块私事——TS2305 那道墙（§1.1 B 段）。
- **import 的对面**：`import { next, type Order } from "./order-machine.js"`——花括号里挑要的；`type Order` 表示"只搬类型不搬值"，类型擦除后这半边消失，运行时根本没有这次搬运。
- **`"type": "module"`**：告诉 Node 本项目的 .js 按 ESM 规矩跑（import/export 是合法语法）。第 1 课起 tsx 一直在 ESM 下跑你的文件——今天你第一次自己写 import/export，算正式认识。
- **`.js` 扩展名（头号坑，三个世界一图流）**：你写 `.ts` → 运行时跑的是（概念上的）`.js` → **import 路径是写给运行时看的**。所以：不写扩展名，TS2835（Node 的 ESM 要求写全）；写 `.ts`，TS5097（`An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled`——运行时根本没有 .ts 文件）；写 `.js`，编译器和 tsx 都知道你要的是隔壁的 `.ts` 源文件。这是类型擦除的第三层意思：**import 路径是字符串，编译器不替你改写字符串**——它和 `data.nama` 一样是"运行时事实"。
- **依赖方向**：ex17 拆完后的 import 图只有一种形状——cli → schema、cli → api，而 api 和 schema 谁也不 import 谁。规则自然浮现：**入口 import 一切，没人 import 入口；被 import 的屋彼此不认识（无环）**。为什么入口没人 import？它是整场戏的导演，导演不需要被演。复盘题 3 的全部素材在这。
- **模块的美德是无副作用**：不打印、不发请求、不改全局——被 import 时安安静静把能力交出来。这就是骨架注释里"tsx 直跑无输出是模块的美德"的意思，也是 §2.4"优先测纯函数"的前提。

### §2.3 vitest 三板斧：describe / it / expect

```typescript
import { describe, it, expect } from "vitest";
import { next, type Order } from "./order-machine.js";

describe("next（订单状态机）", () => {
  it("pending + pay → paid", () => {
    const pending: Order = { status: "pending", amount: 42 };   // 夹具：测试自己造的小数据
    const result = next(pending, "pay");
    expect(result.status).toBe("paid");                          // 期望：实际值 = 期望值
  });
});
```

- **describe** 分组（一屋测试一个主题）、**it** 一条行为断言（名字要读起来像句子——红的时候一眼知道哪坏了）、**expect** 断言。pytest 对照：describe ≈ 测试类、it ≈ `test_` 函数、expect ≈ assert，只是断言写成链式。
- **匹配器两个就够**：`toBe`（原始值；Object.is，同值才过）和 `toEqual`（数组对象；深比较，内容相同即过）。§1.1 C 段见过 toBe 比数组的下场——多看一眼它给的善意提示：报错里直接建议你换 `toStrictEqual`（toEqual 的严格亲戚，今天不用分这一层）。
- **测 throw**：`expect(() => next(pending, "ship")).toThrow("非法流转")`——注意传的是**箭头函数**（"把这个调用包起来"），不是调用结果（调用当场就炸，轮不到 expect 来接）。参数是报错 message 需要包含的子串。
- **跑法三姿势**：`npm test`（单趟跑完全部，判卷姿势）；`npx vitest run 某个文件`（只跑一个）；`npx vitest`（watch 模式：文件一保存立刻重跑——写测试时的舒服姿势，学有余力去体验）。vitest 认测试全靠文件名 `*.test.ts` 这个暗号，目录里放别的它不看。
- 一个好消息（备课实测过）：vitest 的类型和 TS 7 相安无事，`import { describe, it, expect } from "vitest"` 写了就过，tsconfig 一个字不用改。

### §2.4 哪些行为值得测：改坏了会怕的地方

不追覆盖率数字，用三问筛选——过一问，配一条：

1. **这里改坏了，调用方会遭殃吗？** 非法流转被放行 = 订单系统地基因裂缝；chunk 死循环 = 程序卡死。会遭殃的才配测试。
2. **这里容易悄悄坏吗？** 边界最招灾：`n <= 0`、空数组、`<=` 的等号——第 6 课 parseCoords 的等号、第 7 课 chunk 的死循环，你亲手修过的坑都算前科。
3. **坏了会沉默吗？** 类型红是大声的坏（tsc 喊）；groupBy 分错组是沉默的坏（没人喊）——**沉默的坏最需要测试**，因为除了测试没人替你盯着。

不值得测的清单：console.log 的格式（人眼看的，改了顶多难看）、zod 内部（人家有自己的测试）、演示区（本来就是表演）。你 8 个测试里哪条性价比最高？复盘题 2 提前想。

### §2.5 红-绿循环：亲手红一次

流程五步：**绿**（写完全绿）→ **改坏**（挑一处实现下手）→ **红**（亲眼看哪个测试翻脸）→ **读红** → **恢复**（回全绿，一步不能少）。

读红就三行：测试名（**谁**在喊）→ AssertionError 的 expected / received（喊的**内容**）→ 文件名:行号（在**哪**喊）。§1.1 C 段那段报错就是标准样本：名字、expected、received、"serializes to the same string"的诊断语，三行齐活。

这一下红就是全部意义：从此每次改代码，`npm test` 都替你把全部行为重演一遍。第 7 课的等价重构从"我试过"升级成"有人担保"——**测试是重构的胆量**，这句话的红字版。破坏实验的硬性步骤在 ex16 骨架 TODO 4，一段不能漏（ex11 必败版、ex12 三连实测的前科——丑话里没点名，这里点一下）。

### §2.6 黑盒清单（今天的和以前的）

今天新增三个黑盒，都只需"见过名字"：**vitest 内部**（匹配器怎么实现、为什么它接得住 throw——会用就行）；**node_modules 布局与查找算法**（import 天生会一路向上找 node_modules，知道这个行为就够）；**tsconfig 的 module 字段全家桶**（知道 NodeNext ≈ "按 Node 规矩办" + `.js` 扩展名这一条就够）。今天退休三个：`"type": "module"`（第 1 课起 tsx 一直在 ESM 下跑你，今天正式认识）；package.json（从"一坨 JSON"变成账本）；vitest（上节课预告过，今天转正进日常）。下一课预告：**第 9 课综合实战 todo CLI**——判别联合 + 文件持久化 + 读回校验 + 多文件 + 测试护航，前八课的家当一次组装。

---

## §3 练习：80 分钟，主菜上桌

两个目录都在 `04_进阶与质量/`。**顺序有讲究**：任务 1 先搬模块后写测试（import 得有东西可 import）；任务 2 按 **schema → api → cli** 搬（前两间不 import 谁，最后 cli 才 import 全部）。

### 任务 1 · 给旧代码补测试（40 分钟）

打开 `ex16_backfill_tests/`——order-machine.ts / array-utils.ts 是"新家"，两个 `.test.ts` 是"岗哨"。硬性要求：

1. **先搬家**（两个模块文件，约 10 分钟）：从 ex7 迁移 Order / OrderStatus / assertNever / next，从 ex14 迁移 groupBy / pluck / chunk——各加 export，**只搬家不装修**（函数体和你原版逐字一致），演示区、探针、contacts 数据一个不搬，ex7 / ex14 原文件一行不动（它们是结业档案，从此模块是正身）；
2. **再上保险**（两个测试文件，约 20 分钟）：合计 **≥8 个 it**，必测清单（判卷对账用）：非法流转被拒 ≥2 条、终态不可再动、groupBy 基本分组 + 空数组、pluck 可选属性含 undefined、chunk 整除 + 尾段不满 + **`n <= 0` 边界**；
3. toBe 与 toEqual 各至少用一次，且说得出为什么这条用这个（原始值 vs 数组对象）；
4. **破坏实验**（约 10 分钟，压轴）：去 array-utils.ts 改坏一处逻辑 → `npm test` 看红 → 留痕四行（改哪 / 谁红 / AssertionError 原文 / 恢复后）→ 恢复全绿。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：红在 import 上，先查扩展名和户口
> 症状对照：TS2835 = 漏 `.js`；TS2305 = 隔壁没 export 这个名字（或你手滑打错一个字母）；TS2307 = 路径本身就找不到（`Cannot find module './xxx.js' or its corresponding type declarations`）。import 区有问题时 vitest 会报"测试文件加载失败"——**先 `npx tsc --noEmit` 过类型这关，再跑 `npm test`**，报错才轮得到断言层。

> [!tip]- 提示 2：toThrow 接函数，不接调用结果
> `expect(next(pending, "ship")).toThrow(...)` 会在 expect 之前当场 throw，整个文件报错而不是"断言失败"。正确姿势：`expect(() => next(pending, "ship")).toThrow("非法流转")`——把调用包进箭头函数，expect 在自己的地盘里试跑它、接住它、审判它。

> [!tip]- 提示 3：paidAt 是时间戳，测不了内容
> next 补的 paidAt 是 `new Date().toISOString()`，每次都不一样，硬 toEqual 一个写死的时间串必红。测行为不测实现：`expect(result.status).toBe("paid")` + `expect(typeof result.paidAt).toBe("string")`——"从 pending 变成了 paid、还带上了付款时间"，这就是行为的全部。trackingNo 的随机数同理。

> ✅ **检查点（比写完代码更重要）**
> 两个模块与 ex7 / ex14 逐字一致（只多 export）；≥8 个 it 全绿、必测清单逐条有主；toBe / toEqual 各至少一次且用对地方；破坏实验留痕四行齐全、现场已恢复全绿；`npx tsc --noEmit` 沉默 + `npm test` 绿；ex7 / ex14 原文件未动。

### 任务 2 · 拆项目：天气 CLI 三间屋（40 分钟）

打开 `ex17_weather_split/src/`——schema.ts / api.ts / cli.ts，从 ex12 搬家。硬性要求：

1. 按 **schema → api → cli** 顺序搬；三间屋的归属骨架里写了说理——校验住 schema（argv 和 API 响应都是"外面的数据进门"）、网络住 api（fetchWeather 返回 **unknown**——"信不信这数据"是 schema 的事）、编排打印 exit 住 cli；
2. **只搬家不装修**：打印文案与 ex12 逐字一致——特别是路径 2 那句打印和 `process.exit(1)` 原样留在 fetchWeather 里，**别改成 throw**（骨架注释里写了为什么：throw 版会被 cli 的 catch 打上"路径 1 或 3"前缀，关卡就分不清了）；ex12 原文件一行不动；
3. 所有相对 import 带 `.js`（TS2835 预防针，骨架黑盒照抄区有现成的）；
4. 跑通 `npm run dev -- 39.9 116.4` 出今明温度（骨架注释里有备课实测参考数字，结构对上即过）；
5. 错误路径复测任一条（打印必须分得清"哪一关拦的"——第 6 课的验收标准，搬家后不许降级）+ 留痕三行（正常输出 / 复测 / 依赖方向一句话）。

- 💡 三条提示折叠在下面：

> [!tip]- 提示 1：Weather 类型 import 了却没用到？
> cli.ts 大概率用不上 `Weather`（safeParse 之后 `r.data` 的类型是推出来的）——那就别 import 它（判卷先扫 import 区，丑话②）。schema.ts 里照样 export 它：模块对外提供能力，用不用是 import 方的事。

> [!tip]- 提示 2：npm run dev 的姿势
> `npm run dev` 从哪个目录跑都行（npm 自己向上找 package.json）；参数要跟在 `--` 后面转交。cli.ts 还是空壳时跑它无输出是正常的——模块无副作用是美德，不是故障。

> [!tip]- 提示 3：想清楚再答"为什么没人 import cli"
> 反着想：如果 api.ts 反过来 import 了 cli.ts，会怎样？网络层指挥入口、入口指挥网络层——环一成，谁都不能单独拿出去用。单向依赖的口诀：**被 import 的，不知道谁在 import 它**（schema 不知道谁在用 parseCoords）。这句话翻译成复盘题 3 的答案就齐了。

> ✅ **检查点**
> 三间屋职责分明；import 全带 `.js` 且零死 import；`npm run dev -- 39.9 116.4` 出今明温度；错误路径复测留痕齐全、打印分得清关卡；ex12 一行未动；`npx tsc --noEmit` 沉默。

### §3.4 自查清单

- [x] ex16：两个模块迁移完成——只多 export、逐字一致；ex7 / ex14 未动 ✅ 2026-09-11
- [x] ex16：≥8 个 it 全绿，必测清单全覆盖（非法流转×2、终态、空数组、可选属性、`n <= 0` 边界……）✅ 2026-09-11
- [x] ex16：toBe / toEqual 各至少一次且用对；破坏实验留痕四行 + 现场恢复全绿 ✅ 2026-09-11
- [x] ex17：三间屋拆分到位，import 全带 `.js`、零死 import ✅ 2026-09-11
- [x] ex17：`npm run dev -- 39.9 116.4` 跑通；错误路径复测 + 依赖方向留痕；ex12 未动 ✅ 2026-09-11
- [x] 全程没写 `as` / `!`，命名 camelCase ✅ 2026-09-11

> 💡 **卡住 20 分钟就求助**
> 老规矩四样：期望什么、实际发生什么、完整报错、相关代码。今天尤其欢迎三类：TS2835 / TS2307 / TS2305 这类 import 报错（十有八九是扩展名或忘 export，贴给我 30 秒定位）；vitest 报"测试文件加载失败"（先把 tsc 那关过了再看断言层）；以及破坏实验里你看到的那段红——贴给我，我们一起把三行读全。

---

## §4 复盘：10 分钟检索练习

**规矩不变（§0 丑话④）**：练习做完，**先把三题口述发我，再交练习判卷**。合上代码先在心里说完整，再点开折叠对照——"感觉我知道"不算数。

1. dependencies 和 devDependencies 的区别？zod 和 vitest 各该放哪边、为什么？
2. 你写的 8 个测试里，哪个性价比最高？哪些行为其实不值得测？
3. 拆完文件后，`import` 依赖的方向是什么？为什么入口文件不该包含业务逻辑？

自测五题（每题先默答，再点开「看答案」）：

**Q1. `import { next } from "./order-machine"` 少了 `.js`，报什么？为什么补的偏偏是 `.js` 不是 `.ts`？**

> [!question]- 看答案（先默答再点开）
> TS2835，报错还附赠 `Did you mean './order-machine.js'`。NodeNext 按 Node 的 ESM 规矩办：相对路径写全扩展名，且指**运行时文件**——你写 `.ts` 会报 TS5097（编译产物里只有 `.js`）。import 路径是写给运行时看的字符串，编译器不替你改写字符串——类型擦除的第三层意思：路径是运行时事实。

**Q2. `expect(chunk([1,2,3,4], 2)).toBe([[1,2],[3,4]])`，绿还是红？怎么改？**

> [!question]- 看答案（先默答再点开）
> 红。toBe 是 Object.is（同一个对象才过，≈ Python 的 `is`）；两个各自新建的数组内容一样也不是同一个。实测输出还会补一句 `serializes to the same string`——内容相等的铁证、引用不同的判决。改用 toEqual（深比较，≈ Python 的 `==`）。toBe 留给字符串、数字、布尔。

**Q3. 测"`next(pending, 'ship')` 必须 throw"，expect 该怎么写？为什么？**

> [!question]- 看答案（先默答再点开）
> `expect(() => next(pending, "ship")).toThrow("非法流转")`。传箭头函数 = 把"调用这件事"包起来交给 expect，它在内部试跑并接住 throw；直接传调用结果会在 expect 之前当场炸掉，测试框架连出场机会都没有。toThrow 的参数 = message 需包含的子串。

**Q4. 把 zod 挪进 devDependencies，程序会坏吗？那为什么还要分两边？**

> [!question]- 看答案（先默答再点开）
> 不会坏——分边是账本纪律，不是技术必然。dependencies = 运行时要用的（zod：CLI 每次跑都在校验，是产品的一部分）；devDependencies = 只在开发机用的（vitest / typescript / tsx：用户不需要替你的开发和测试过程买单）。账分清了，看 package.json 的人一眼知道产品真正依赖什么。

**Q5. ex17 拆完，为什么 api.ts 不 import schema.ts？**

> [!question]- 看答案（先默答再点开）
> 职责分居 + 单向依赖：api 只管"把数据搬回来"（所以返回 unknown——校验不是它的职责），"信不信这数据"由 cli 拿着 schema 去办。被 import 的模块不知道也不需要知道谁在用它；一旦 api 和 cli 互相 import，模块图成环，哪间屋都别想单独拿出去复用。入口编排一切、没人编排入口——这就是复盘题 3 的后半问。

---

## §5 下课

**学有余力（可选，做多少算多少）**：① **Order 等价重构**（第 4 课埋、第 7 课预告的那笔，今天正式回收）：order-machine.ts 里 Order 四变体的公共字段 `amount` 重复了四遍——用 `Pick<Order, "amount">` 收出一个基础类型，四个变体各自只写独有部分（ex8 那版 Order 还有 id，同款思路）。**现在你有保镖了**：改完 `npm test` 全绿 = 行为没变的证据——本课认知的实弹演习，第一次开火。注意改的是 order-machine.ts（正身），ex7 仍一行不动（档案）。② **watch 模式体验**：`npx vitest` 跑起来别关，随手改坏一条断言保存，看它秒红、再保存看它复绿——退出按 q。③ 给你自己的任何旧代码（ex4 通讯录、猜数字游戏……）补两条测试，练习"三问筛选法"。

**完成后回来找我**：先把复盘三题口述发我（丑话④），我判卷、勾计划里的 checkbox、记学习档案。今天过后，你的代码第一次同时站着两排岗哨——编译期的 tsc 和运行时的 vitest——第 9 课的 todo CLI、第 10 课的毕业项目，都在这套底盘上组装。下一课：**第 9 课 · 综合实战——待办事项完整版**：判别联合建模 + 文件持久化 + 读回校验 + 多文件 + 测试护航——"从演示能跑到自己敢用"。然后随时可以喊"**开始第 9 次课**"。

> 💡 **我是你的导师，不是课件**
> 这页是提词器，提问的地方在对话框里。今天特别欢迎拿来讨论的两类问题：你的 8 个测试的取舍（哪条你觉得不值、哪条想加——测试品味是聊出来的，不是抄出来的）；以及破坏实验里那段红（贴给我，我们一起把"谁在喊、喊什么、在哪喊"读全——读报错的功夫，从测试的报错练起最便宜）。

---

*上一课：[第 7 课 · 泛型与工具类型](0007-generics-utility-types.md) ｜ 下一课：[第 9 课 · 综合实战——待办事项完整版](0009-todo-cli.md)*
*TypeScript 开发 · 20 小时速通 · 总计划见 [00_20小时速通计划.md](../00_20小时速通计划.md)*
