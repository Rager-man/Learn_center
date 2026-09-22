// 01_线性结构/ex2_dynamic_array.ts —— 骨架（第 1 课 · 任务 2：手写动态数组）
// 用法：写完方法后 npx tsx ex2_dynamic_array.ts（放开底部演示区注释）；
//   平时写一个测一个：npm test 或在 数据结构/ 目录下 npx vitest run。
//
// 剧本：JS 的数组不是魔法——V8 里它就是一个动态数组：一块按需增长的连续内存。
//   今天亲手重造它：三个字段（data / _length / _capacity）、六个方法、每个方法标复杂度。
//   写完你会知道 push 偶尔慢一下的那一次，到底发生了什么（课件 §1.1 D 的尖刺，亲手复刻）。
//
// 规则：① 每个方法的注释里标 Big-O——涉及扩容的把 最好/最坏/均摊 三个数都标，标不出来的方法等于没写懂；
//   ② 全程禁 as / ！；③ 越界一律 throw new Error("...")，绝不静默返回 undefined；
//   ④ strict 下 0 error（npx tsc --noEmit 沉默为准）。
//
// 设计图纸（已给）：data 是真正装元素的底层数组，但只认前 _length 个位置，尾部允许有空座；
//   _length 是"坐下的人数"（用户视角），_capacity 是"预订的座位数"（实现视角）；
//   两个 getter 只读开放——测试靠它们从外部观察行为（测行为不测实现）。

export class DynamicArray<T> {
  private data: T[];
  private _length = 0;
  private _capacity: number;

  constructor(initialCapacity: number = 4) {
    if (!Number.isInteger(initialCapacity) || initialCapacity < 1) {
      throw new Error(`初始容量必须是 ≥ 1 的整数，收到的是 ${initialCapacity}`);
    }
    this._capacity = initialCapacity;
    this.data = new Array<T>(initialCapacity); // 预订座位：尾部的空座不算元素
  }

  /** 用户视角的元素个数——注意不是 data.length（data 尾部可能有空座） */
  get length(): number {
    return this._length;
  }

  /** 当前已预订的座位数——测试用它观察扩容有没有发生 */
  get capacity(): number {
    return this._capacity;
  }

  // ======================= 六个方法（约 45 分钟）=======================

  // TODO 1) private resize(newCapacity: number): void —— 搬家：订一张 newCapacity 的新桌子，
  //        把 data 的前 _length 个元素全部搬过去，然后 this.data = 新数组、_capacity = newCapacity。
  //        行为：newCapacity < _length 时 throw（座位不能少于已坐人数）。
  //        复杂度：O(?)——搬了多少个元素？
  //        （private：它是扩容的内部机关，外界通过 push 间接触发；capacity getter 供测试观察）

  // TODO 2) push(item: T): void —— 尾部追加一个元素，_length 加一。
  //        座位满了（_length === _capacity）先 this.resize(this._capacity * 2) 再落座。
  //        复杂度：最好 O(?) / 最坏 O(?) / 均摊 O(?)——三个都标；均摊的理由写总账：
  //        从空数组连续 push n 次，总共搬了多少次家？（课件 §2.5 的 1+2+4+…，用你自己的话）

  // TODO 3) pop(): T —— 弹出并返回尾部元素，_length 减一。
  //        行为：空数组 pop 直接 throw（返回 undefined 是"看起来没炸"，throw 才是把错误递到脸上）。
  //        复杂度：O(?)

  // TODO 4) get(index: number): T —— 按下标取元素。
  //        行为：index < 0 或 index >= _length 一律 throw；注释里写一句——
  //        连续内存在这里帮了什么忙，凭什么 O(1)？
  //        复杂度：O(?)

  // TODO 5) insert(index: number, item: T): void —— 把 item 插到 index 位置，
  //        原 index 及之后的元素整体后移一位，_length 加一。
  //        行为：index === _length 合法（等价 push）；其余越界规则同 get。座位不够先扩容。
  //        提示：后移从尾巴那头开始挪（课件任务 2 的折叠提示讲过为什么）。
  //        复杂度：最好 O(?)（插尾部时）/ 最坏 O(?)（插头部时）

  // TODO 6) remove(index: number): T —— 删除并返回 index 位置的元素，
  //        之后的元素整体前移一位补位，_length 减一。越界规则同 get。
  //        复杂度：最好 O(?)（删尾部时）/ 最坏 O(?)（删头部时）
}

// ======================= 演示区（全部写完后放开注释自测）=======================
// const arr = new DynamicArray<string>(2);
// arr.push("a"); arr.push("b"); arr.push("c");   // 第 3 次 push 触发扩容：capacity 2 → 4
// console.log(arr.length, arr.capacity);          // 预期：3 4
// console.log(arr.get(0), arr.get(2));            // 预期：a c
// arr.insert(1, "X");                             // 变成 a X b c
// console.log(arr.remove(1));                     // 预期：X，回到 a b c
// console.log(arr.pop());                         // 预期：c
// console.log(arr.length);                        // 预期：2
