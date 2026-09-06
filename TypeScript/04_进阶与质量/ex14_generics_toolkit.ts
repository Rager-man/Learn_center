// 04_进阶与质量/ex14_generics_toolkit.ts —— 骨架（第 7 课 · 任务 1：泛型小工具三连）
// 用法：npx tsx 04_进阶与质量/ex14_generics_toolkit.ts   （骨架从出生就是绿的：
//   所有 TODO 都在注释里，写完才跑）
//
// 剧本：你要亲手写三个泛型小工具——groupBy（分组）、pluck（抽列）、chunk（切段），
//   Lodash 里的常客，今天用泛型写出"任何类型都能用"的版本。签名全部自己推：
//   先写实现（就是普通的 map / filter / slice），再在边界上配类型参数；
//   卡住就退回"只支持 Contact"的具体版，跑通再把具体类型参数化（课件提示 1 的正路）。
//   预建的 contacts 照抄自第 2 课 ex4 的形状（tags 用宽版 string[]，让本文件独立可跑）。
//
// 规则：全程禁 as / ！；命名 camelCase；每写完一个函数先用"探针赋值"验证推断再往下走
//   （探针 = 给结果一个具体类型注解的赋值，编译通过 = 推断正确，判卷要留在代码里）

interface Contact {
  id: number;
  name: string;
  phone?: string;      // 可选：有人没电话（探针 4 会用到这个字段的脾气）
  tags: string[];
}
const contacts: Contact[] = [
  { id: 1, name: "Alice", phone: "123-456-7890", tags: ["朋友"] },
  { id: 2, name: "Bob", tags: ["家人", "同事"] },        // 双标签：一个人占两个组
  { id: 3, name: "Charlie", phone: "555-0100", tags: ["同事"] },
  { id: 4, name: "小美", tags: ["家人"] },
];

// ======================= 工具 1：groupBy（约 15 分钟）=======================
// TODO 1) 实现 groupBy(items, keyFn)：
//        行为——把 items 按 keyFn(item) 返回的字符串分组，同组元素保持原顺序；
//        返回——Record<string, T[]>：键是组名，值是这一组的元素
//        参考调用（演示区再正式跑）：
//          groupBy(contacts, c => c.tags[0])                                // 按第一个标签
//          groupBy(contacts, c => c.phone === undefined ? "没电话" : "有电话") // 按有没有电话
// TODO 2) 探针验证（判卷证据，写完保留在函数下方）：
//        const grouped: Record<string, Contact[]> = groupBy(contacts, c => c.tags[0]);

// ======================= 工具 2：pluck（约 15 分钟）=======================
// TODO 3) 实现 pluck(objs, key)：
//        行为——从每个对象里取出 key 属性，组成数组（一个 map 的事）；
//        签名要求——key 只能传 T 的属性名（约束！课件 §2.2 的那个），返回精确到 T[K][]
// TODO 4) 两发探针（判卷证据，写完保留）：
//        const names: string[] = pluck(contacts, "name");                    // 应得 string[]
//        const phones: (string | undefined)[] = pluck(contacts, "phone");    // 可选属性的账（§4 Q5）
// TODO 5) 手滑实验：写 pluck(contacts, "nam")（多打一个字母）→ 跑 npx tsc --noEmit，
//        抄报错原文到留痕区 → 注释掉这行，恢复沉默——这是约束替你值班的活证据

// ======================= 工具 3：chunk（约 20 分钟）=======================
// TODO 6) 实现 chunk(arr, n)：把数组切成 n 个一段，最后一段允许不满
//        参考效果：chunk([1, 2, 3, 4, 5, 6, 7], 3) → [[1,2,3], [4,5,6], [7]]
//        边界（第 6 课的功夫）：n <= 0 时返回 []——不防会发生什么，先想清楚再写（提示 3）
// TODO 7) 探针验证（判卷证据，写完保留）：
//        const pairs: number[][] = chunk(pluck(contacts, "id"), 2);  // 两个工具串起来用

// ======================= 演示区 ========================
// TODO 8) 三连演示，每步 console.log、输出对上预期：
//        ① groupBy(contacts, c => c.tags[0]) —— 看四个标签各分到谁（双标签的 Bob 只进第一组）
//        ② pluck(contacts, "name") —— 抽出所有名字
//        ③ chunk(名字数组, 2) —— 切成 2 个一段

// ======================= 留痕区（判卷证据，逐条写）=======================
// TODO 9) ① 手滑实验的报错原文：
//        ② 三发探针各验证出了什么类型（groupBy / pluck 两发 / chunk）：
//        ③ 一句话：约束 K extends keyof T 到底替你拦了什么——

// 完成判据：npx tsc --noEmit 沉默 + 探针全部编译通过（= 推断类型全对）+
//   演示输出与预期一致 + 留痕三条齐全 + 全程没写 as / !
