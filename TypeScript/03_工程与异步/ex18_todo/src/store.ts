// 03_工程与异步/ex18_todo/src/store.ts —— 骨架（第 9 课 · 任务 1：待办 CLI · 存储层）
// 用法：被 cli.ts / todo.test.ts import（模块天生安静；fs 只准住这一间屋）
//
// 剧本：数据躺在磁盘上，下次读回来还安全吗——第 6 课"文件内容同样是边界"的正式兑现。
//   ex13 进口清单第 4 行你亲手标过："文件内容——今天用到了吗？没用到（第 9 课全用上）"。
//   今天营业：读回来的每一字节都当 unknown 对待，过 zod 才进门。
//   磁盘上的 JSON 没有编译器盯着它——你手滑、编辑器存了一半、别的程序改过，都可能。
//
// 黑盒照抄：
//   ① import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
//      （第 1 课 tsconfig 的 types:["node"] 早就配好了，直接用）
//   ② 数据文件路径写死成仓库根的相对路径，约定从仓库根跑（npm run todo 或 npx tsx）：
//      const DB_PATH = "TypeScript/03_工程与异步/ex18_todo/todo.json";
//      （路径也是运行时事实——和第 8 课 .js 扩展名一个道理：编译器不替你对账 cwd）
//   ③ 判别联合的 zod 表亲（v4 现成工具，schema 长得和 model 里的 Task 一模一样）：
//      const taskSchema = z.discriminatedUnion("status", [
//        z.object({ status: z.literal("todo"),  id: z.number().int(), title: z.string() }),
//        z.object({ status: z.literal("doing"), id: z.number().int(), title: z.string(), startedAt: z.string() }),
//        z.object({ status: z.literal("done"),  id: z.number().int(), title: z.string(), finishedAt: z.string() }),
//      ]);
//   ④ 写盘格式：JSON.stringify(db, null, 2)——2 = 缩进两格，人能直接读（改坏它做实验也方便）。
//
// 规则：全程禁 as / ！；坏数据不许裸崩——备份原文件 + 从空库重建，打印人话。
import { z } from "zod";
import { type Task } from "./model.js"
import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";

const DB_PATH = "TypeScript/03_工程与异步/ex18_todo/todo.json";
const taskSchema = z.discriminatedUnion("status", [
    z.object({ status: z.literal("todo"),  id: z.number().int(), title: z.string() }),
    z.object({ status: z.literal("doing"), id: z.number().int(), title: z.string(), startedAt: z.string() }),
    z.object({ status: z.literal("done"),  id: z.number().int(), title: z.string(), finishedAt: z.string() }),
]);
// ======================= 存储区（TODO 4–6，约 20 分钟）=======================
// TODO 4) dbSchema = z.object({ nextId: z.number().int(), tasks: z.array(taskSchema) })
//        再补两份本地类型（model 的 Task 是编译期的"声称"，schema 是运行时的"合同"）：
//          type Db = { nextId: number; tasks: Task[] };   ← import type { Task } from "./model.js"
//        想想 nextId 为什么要一起入库：第 2 课通讯录的 id 复活 bug——
//        id 从"当前数据推导"（尾部 id + 1），删掉尾部再 add 就复用旧 id；
//        nextId 写进文件，程序重启也单调递增，bug 从根上焊死。
const dbSchema = z.object({ nextId: z.number().int(), tasks: z.array(taskSchema) });
type Db = { nextId: number; tasks: Task[] };
// TODO 5) parseDb(text: string): Db | null —— 纯函数，两层坏都接住（不碰 fs，测试就测它）：
//          ① JSON 语法层坏（手改丢了引号）→ JSON.parse 直接 throw；
//          ② 语法对但结构坏（status: "stuck"、缺 startedAt）→ safeParse 不成功。
//        两层任何一层坏 → 返回 null。写法：try { const r = dbSchema.safeParse(JSON.parse(text));
//        return r.success ? r.data : null; } catch { return null; }
//        过桥费一行：const db: Db = r.data —— 把推断类型交给 Db 注解过一道桥，
//        schema 哪天和 Task 走散（少个字段、多个字段），这行先红——tsc 替你盯两份声明。
export function parseDb(text: string): Db | null {
    try {
        const r = dbSchema.safeParse(JSON.parse(text));
        return r.success? r.data : null;
    } catch {
        return null;
    }
}
// TODO 6) load(): Db 和 save(db: Db): void —— 本课唯一碰 fs 的两个门：
//          load 三分支——
//            a. !existsSync(DB_PATH) → 首跑，正常：return { nextId: 1, tasks: [] }（安静，别喊）
//            b. parseDb(...) === null → 坏数据兜底：
//               renameSync(DB_PATH, DB_PATH + ".bad")（备份现场，别覆盖——坏了的文件要留着验尸）
//               console.log("数据文件坏了，原样备份到 todo.json.bad，从空库重新开始")
//               return { nextId: 1, tasks: [] }
//            c. 好数据 → 原样返回
//          save 一行主力：writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8")
//        备课实测参照：改坏 JSON 后不带兜底的启动会裸崩——
//          SyntaxError: Unterminated string in JSON at position 59 (line 1 column 60)
//          （§1.1 C 段就是这段现场）——带上兜底后它变成一句人话。
export function load(): Db {
    if (!existsSync(DB_PATH)) return { nextId: 1, tasks: [] };  
    const text = readFileSync(DB_PATH, "utf8");
    const parsed = parseDb(text);
    if (parsed === null) {                                       
        renameSync(DB_PATH, DB_PATH + ".bad");
        console.log("数据文件坏了，原样备份到 todo.json.bad，从空库重新开始");
        return { nextId: 1, tasks: [] };
    }
    return parsed;                                              
}

export function save(db: Db):void {
    const saveData = JSON.stringify(db, null, 2);
    writeFileSync(DB_PATH, saveData, "utf-8");
}
// 完成判据：parseDb 两层坏都回 null；load 三分支齐 + 坏文件留 .bad 现场 + 不裸崩；
//   save 写出的文件人能读；npx tsc --noEmit 沉默；npx tsx 直跑本文件无输出。
