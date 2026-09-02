// 02_类型建模/ex5_fix.ts —— 靶场（第 3 课 · 任务 1：修复"满屏红"）
// 用法：在 TypeScript/ 根目录跑 —— npx tsc --noEmit（今天全项目的红都集中在这个文件）
//      npx tsx 02_类型建模/ex5_fix.ts（tsx 不查类型——修好前它跑不出任何东西，这本身就是第 1 课的认知）
//
// 靶场规则：
//   - 下面 8 处病灶，注释里写了每处的"意图"（正确行为应该是什么），照着意图修
//   - 修法只允许两招：窄化（if / typeof / 真值 / !== undefined）+ 空值工具（?. 和 ??）
//   - 全程禁止 as 和 ! ——它们是逃生舱，不是日常工具（§2.5 有完整说明书）
//   - 其中 2 处病灶编译器一声不吭、只在运行时咬人——把它们找出来也是任务的一部分（提示：演示区见真章）

// ---------- 数据与图纸（这部分没病，别动它）----------

interface Student {
  id: number;
  name: string;
  nickname?: string; // 昵称（可选）——有人不用昵称
  email?: string;    // 邮箱（可选）——有人没留
  scores: number[];  // 历次成绩——转来的新生一条都还没有
}

const roster: Student[] = [
  { id: 1, name: "小钟", nickname: "老钟", email: "zhong@example.com", scores: [88, 92] },
  { id: 2, name: "小美", scores: [0, 79] },             // 没昵称没邮箱，还考过一次 0 分
  { id: 3, name: "阿强", nickname: "强子", scores: [] }, // 刚转来，成绩单还空着
];

// 邮箱登记表——另一个人造的"可能没有"来源（Map.get 查不到就……你猜）
const mailbox = new Map<number, string>([
  [1, "zhong@example.com"],
  [3, "qiang@example.com"],
]);

// ---------- 8 处病灶（修我）----------

// 病灶 1 —— 意图：有昵称显示「昵称（本名）」，没昵称就直接用本名
function displayName(s: Student): string {
  return s.nickname.toUpperCase() + "（" + s.name + "）";
}

// 病灶 2 —— 意图：找出第一个有成绩记录的人；一个都没有时，把"可能没有"如实写进返回类型
function firstScored(list: Student[]): Student {
  return list.find(s => s.scores.length > 0);
}

// 病灶 3 —— 意图：查这个学生的登记邮箱；没登记的返回类型上就该是"可能没有"，兜底留给调用方
function mailboxOf(id: number): string {
  return mailbox.get(id).toUpperCase();
}

// 病灶 4 —— 意图：取邮箱 @ 后面的域名；没留邮箱的返回 "没留邮箱"
function emailDomain(s: Student): string {
  return s.email.split("@")[1];
}

// 病灶 5 —— 意图：返回第一场成绩；还没考过显示 -1。注意：0 分是真实成绩，不许吞
function firstScore(s: Student): number {
  return s.scores[0] || -1;
}

// 病灶 6 —— 意图：报告第一场战况。考了 0 分要如实说"首战 0 分"，还没考过才说"还没考过"
function scoreReport(s: Student): string {
  const first = s.scores[0];
  if (first) {
    return "首战 " + first + " 分";
  }
  return "还没考过";
}

// 病灶 7 —— 意图：把编号统一成 "S-" 开头的大写字符串；编号允许传字符串或数字
function studentNo(id: string | number): string {
  return "S-" + id.toUpperCase();
}

// 病灶 8 —— 意图：大声喊出昵称；没昵称就喊本名。shout 只收 string，这意图怎么落地？
function shout(name: string): string {
  return name.toUpperCase() + "！！！";
}
function nicknameShout(s: Student): string {
  return shout(s.nickname);
}

// ======================= 演示区（TODO 9，修完病灶再动手）=======================
// TODO 9) 把每个"没值"的 case 真跑一遍，证明修好的代码不裸崩、兜底说得通：
//   - displayName(小美)   → 没昵称：直接用本名，不炸
//   - firstScored(roster) → 有值；再想想怎么演示"一个都没有"（造个空数组传进去？）
//   - mailboxOf(2)        → 小美没登记：兜底结果打印出来（?? 用武之地）
//   - emailDomain(小美)   → 没邮箱：打印 "没留邮箱"
//   - firstScore(小美)    → 第一场是 0 分：必须打印 0，不是 -1（|| 的坑现场演示）
//   - scoreReport(阿强)   → 空成绩单：打印 "还没考过"；scoreReport(小美) 要打印 "首战 0 分"
//   - studentNo("a01") / studentNo(7) → 两种编号都能过
//   - nicknameShout(小美) → 没昵称：喊的是本名
// 完成判据：npx tsc --noEmit 全项目沉默 + 上面每条都打印出说得通的结果
