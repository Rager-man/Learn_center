// 03_工程与异步/ex18_todo/src/model.ts —— 骨架（第 9 课 · 任务 1：待办 CLI · 建模层）
// 用法：被 store.ts / cli.ts / todo.test.ts import（模块天生安静：npx tsx 直跑无输出）
//
// 剧本：Task 的三态人生 todo → doing → done，用判别联合建模——
//   ex7 的 Order 状态机（pending → paid / cancelled）的亲兄弟，
//   ex16 刚给它写过测试矩阵：next 的"非法流转 throw 人话"模式原样平移过来。
//   这间屋只住纯类型和纯函数：不碰 fs、不碰 argv、不打印（print 是 cli 的事）。
//
// 黑盒照抄：时间戳用 new Date().toISOString().slice(0, 16)——
//   形如 2026-09-11T07:14，够用、可读、确定（拿到的是 string，测"在不在"方便）。
//
// 规则：全程禁 as / ！；命名 camelCase；非法转移必须 throw（别返回原对象装没事）。

// ======================= 建模区（TODO 1–3，约 15 分钟）=======================
// TODO 1) Task 判别联合，三个变体：
//        { status: "todo",  id: number, title: string }                            ← 刚出生
//        { status: "doing", id: number, title: string, startedAt: string }         ← 开始时补时间
//        { status: "done",  id: number, title: string, finishedAt: string }        ← 完成时换时间
//        想想：为什么 startedAt / finishedAt 只住在各自的变体里（而不是都加 ？）——
//        第 4 课的原则：字段跟着状态走，"写不出来的非法组合不需要防护"。
export type Task = 
        | { status : "todo";  id: number; title: string}
        | { status : "doing"; id: number; title: string; startedAt: string}
        | { status : "done";  id: number; title: string; finishedAt: string};

// TODO 2) 两个转移函数（ex16 的 next 模式平移）：
//        export function startTask(task: Task): Task
//          —— 只吃 todo；产出 doing（补 startedAt）。别的状态进来，throw 人话：
//             throw new Error(`任务 ${task.id} 当前是 ${task.status}，不能开始`)
//        export function finishTask(task: Task): Task
//          —— 只吃 doing；产出 done（补 finishedAt）。别的状态进来，同款 throw。
//        提示：函数体开头 if (task.status !== "todo") throw ...，之后 task 已窄化，
//        {...task, status: "doing", startedAt: now()} 里的字段全是编译器背书的。
export function startTask(task: Task): Task {
    if (task.status === "todo") {
        const nextStatus: Task = {...task, status: "doing", startedAt: now()};
        return nextStatus;
    }
    throw new Error(`任务 ${task.id} 当前是 ${task.status}，不能开始`);
}

export function finishTask(task: Task): Task {
    if (task.status === "doing") {
        const { startedAt:_dropped, ...rest} = task;
        const nextStatus: Task = {...rest, status: "done", finishedAt: now()};
        return nextStatus;
    }
    throw new Error(`任务 ${task.id} 当前是 ${task.status}，不能完成`);
}
// TODO 3) 时间戳小工具：function now(): string（黑盒照抄区那行）。
function now() :string{
    return new Date().toISOString().slice(0, 16);
}

// 完成判据：三个变体字段各就各位；两个转移函数非法输入都 throw、合法输入字段齐全；
//   npx tsc --noEmit 沉默；npx tsx 直跑本文件无输出。
