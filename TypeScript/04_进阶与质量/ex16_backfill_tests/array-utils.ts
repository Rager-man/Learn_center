// 04_进阶与质量/ex16_backfill_tests/array-utils.ts —— 骨架（第 8 课 · 任务 1：泛型工具模块化）
// 用法：npx tsx 04_进阶与质量/ex16_backfill_tests/array-utils.ts   （骨架从出生就是绿的：纯注释无输出）
//
// 剧本：ex14 的三件套（groupBy / pluck / chunk）搬进模块——和隔壁状态机同款搬家，
//   但多一条纪律：contacts 数据不搬。模块只放"能力"，测试要什么数据自己造（那叫夹具）。
//   ex14 里的探针赋值（const names: string[] = pluck(...)）也不搬——那是第 7 课的判卷证据，
//   留在 ex14 档案里；从今天起"推断对不对、行为对不对"改由测试文件里的断言来证。
//
// 规则：只搬家不装修——三个签名与函数体和 ex14 逐字一致；全程禁 as / ！；命名 camelCase。

// ======================= 迁移区（约 5 分钟）=======================
// TODO 1) 从 04_进阶与质量/ex14_generics_toolkit.ts 迁移三个函数，各加 export：
//        export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> { ... }
//        export function pluck<T, K extends keyof T>(objs: T[], key: K): T[K][] { ... }
//        export function chunk<T>(arr: T[], n: number): T[][] { ... }
//        不搬：Contact 接口、contacts 数据、探针赋值、演示区、留痕区——全是 ex14 的档案。
//        搬完跑 npx tsc --noEmit 应依旧沉默——想想为什么：泛型签名依赖 contacts 吗？
//        （第 7 课的答案：T 是类型参数，谁调用谁带类型来——模块不需要认识 Contact。）
// 完成判据：三个函数全部 export + 签名与函数体和 ex14 逐字一致 + tsc 沉默 + tsx 直跑无输出
export function groupBy<T>(items:T[], keyFn: (item: T) => string):Record<string, T[]> {
  const groups:Record<string, T[]> = {};
  for (const item of items){
    const key = keyFn(item);
    if(key in groups) groups[key].push(item);
    else groups[key] = [item];
  }
  return groups;
}

export function pluck<T, K extends keyof T>(objs: T[], key: K): T[K][]{
  return objs.map(obj => obj[key]);
}

export function chunk<T>(arr:T[], n:number):T[][]{
  let i = 0;
  const result: T[][] = [];
  if(n <= 0) {
    return [];
  } else {
    while(i < arr.length) {
      result.push(arr.slice(i, i+n));
      i += n;
    }
  }
  return result;
}