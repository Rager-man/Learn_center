// 01_语法起步/ex4_contacts.ts —— 起步骨架（第 2 课 · 内存通讯录）
// 用法：在 TypeScript/ 根目录跑 —— npx tsx 01_语法起步/ex4_contacts.ts
// 今天两个任务都在这一个文件里：任务 1 做 TODO 0–5，任务 2 做底部的实验区

// TODO 0) 先画图纸：interface Contact ——
//        id: number（自增编号）；name: string；phone?: string（可选，有人没电话）；tags: string[]
//        再建仓库：const contacts: Contact[] = []   （数据只活在内存里，所以叫"内存通讯录"）
interface Contact {
  id: number;          // 自增编号
  name: string;        // 姓名
  phone?: string;      // 电话（可选）
  tags: Tag[];      // 标签列表
}
const contacts: Contact[] = [];   // 仓库：内存通讯录
let nextId = 1; // 自增编号起点
// TODO 1) add(...)：新建联系人 —— 分配新 id、存进仓库、把新建的联系人返回去
function add(name: string, tags: Tag[], phone?: string): Contact {
  const newContact: Contact = { id: nextId++, name, ...(phone === undefined ? {} : { phone }), tags }; // 新建联系人对象
  contacts.push(newContact); // 存进仓库
  return newContact; // 返回新建的联系人
}
// TODO 2) remove(id)：删除 —— "要删的东西不存在"时返回什么，返回类型就写什么，你来定
function remove(id: number): boolean {
  const index = contacts.findIndex(contact => contact.id === id); // 找到要删的联系人索引
  if (index !== -1) { // 如果找到了
    contacts.splice(index, 1); // 删除联系人
    return true; // 返回 true 表示删除成功
  }
  return false; // 返回 false 表示删除失败（不存在）
}
// TODO 3) update(id, changes)：只改 changes 里给的字段，其余字段保持原样
function update(id: number, changes: Partial<Omit<Contact, 'id' | 'tags'>>): Contact | undefined {
  const contact = contacts.find(contact => contact.id === id); // 找到要改的联系人
  if (contact) { // 如果找到了
    Object.assign(contact, changes); // 用 changes 覆盖原来的字段
    return contact; // 返回更新后的联系人
  }
  return undefined; // 返回 undefined 表示更新失败（不存在）
}
// TODO 4) findByTag(tag)：找出带这个标签的所有联系人（一个 filter 就够）
function findByTag(tag: Tag): Contact[] {
  return contacts.filter(contact => contact.tags.includes(tag)); // 过滤出带这个标签的联系人
}
// TODO 5) 演示区：add 三条（其中一条没有电话、一条带两个标签）→ findByTag → update →
//        删一个存在的 id 和一个不存在的 id —— 每步结果都 console.log 出来对照预期
// 完成判据：npx tsc --noEmit 沉默（四个函数的参数、返回值全有类型）+ 演示输出与预期一致
add("Alice", ["朋友"], "123-456-7890");
add("Bob", ["家人", "同事"], "987-654-3210");
add("Charlie", ["工作"]); // 没有电话
remove(2); // 删除 Bob
remove(999); // 删除不存在的 id
console.log("所有联系人:", contacts);

update(1, { phone: "111-222-3333" }); // 更新 Alice 的电话
console.log("更新后的联系人:", contacts.find(contact => contact.id === 1));

console.log("查找标签为 '朋友' 的联系人:");
findByTag("朋友").forEach(contact => console.log(contact));

// ======================= 实验区（任务 2 · 改造实验）=======================
// TODO 6) readonly 实验：给 phone 加 readonly → 在实验区写"改属性"和"换新对象"各一行 →
//        跑 npx tsc --noEmit，把报错原文 + 一句中文翻译写在下面（格式参考课文任务 2）→
//        观察完：错误行注释掉、readonly 撤销，恢复沉默
// contacts[0].phone = "111-222-3333";  
// error TS2540: Cannot assign to 'phone' because it is a read-only property.
// 不能对readonly属性赋值
// contacts[0] = { ...contacts[0], phone: "111-222-3333" };  // ← 换新对象：不报错（观察完注释，导师归位）

// TODO 7) as const 实验：定义 VALID_TAGS 常量数组（as const）→ 照课文抄 type Tag = ... →
//        把 tags 相关的类型换成 Tag → 试着 add 一个非法标签 → 抄报错 → 注释掉非法行。
//        这个改造**保留**——它是通讯录的升级，不是实验废料
const VALID_TAGS = ["家人", "朋友", "同事", "工作"] as const;
type Tag = (typeof VALID_TAGS)[number];

// add("David", ["同学"], "555-555-5555");
// error TS2322: Type '"同学"' is not assignable to type '"同事" | "家人" | "工作" | "朋友"'.
// “同学” 不能赋值给类型 '"同事" | "家人" | "工作" | "朋友"'。
findByTag("家人").forEach(contact => console.log(contact));
findByTag("朋友").forEach(contact => console.log(contact));