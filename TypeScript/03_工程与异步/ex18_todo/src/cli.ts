// 03_工程与异步/ex18_todo/src/cli.ts —— 骨架（第 9 课 · 任务 1：待办 CLI · 入口层）
// 用法：npm run todo -- add 买牛奶   或   npx tsx TypeScript/03_工程与异步/ex18_todo/src/cli.ts list
//   （骨架阶段跑它无输出是正常的——模块无副作用是美德；写完才有戏）
//
// 剧本：整场戏的导演。三件事：解析 argv → 调 model / store 干活 → 打印人话。
//   import 一切，没人 import 它（第 8 课 ex17 的依赖方向原样适用）。
//   四个命令：add（加任务）/ list（列任务）/ doing <id>（开始）/ done <id>（完成）。
//
// 黑盒照抄：import { startTask, finishTask, type Task } from "./model.js";
//           import { load, save } from "./store.js";
//          （相对路径带 .js——TS2835 的老规矩；从哪个目录跑都行，npm 自己向上找 package.json）
//
// 规则：全程禁 as / ！；命名 camelCase；每条错误路径打印人话 + process.exit(1)，
//   不许裸崩（§1.1 C 段那个死法就是验收的反面教材）。

// ======================= 入口区（TODO 7–9，约 15 分钟）=======================
// TODO 7) main() 骨架：const [cmd, ...rest] = process.argv.slice(2)
//        cmd === undefined → 打印用法（todo <add|list|doing|done> [参数]）+ exit 1
//        const db = load() —— 开场先把数据请进门（兜底在 store 里已经办完）
//
// TODO 8) add 和 list：
//          add：rest.join(" ") 当标题（支持空格）；空标题 → 人话 + exit 1；
//               db.tasks.push({ status: "todo", id: db.nextId, title });
//               db.nextId += 1; save(db); 打印"已添加 #id title"
//          list：空库 → "暂无任务"；否则每行一条。
//               格式自定，建议： [ ] #1 买牛奶 /  [>] #2 写周报（开始于 2026-09-11T07:14）
//               /  [x] #3 ...（完成于 ...）——标记一眼分得清三态。
//
// TODO 9) doing <id> 和 done <id>：
//          Number(rest[0]) 转 id；db.tasks.find(t => t.id === id)
//          —— find 的返回是 Task | undefined：先判 undefined（找不到 → 人话 + exit 1，
//             TS18048 那道墙别硬闯），再动它。
//          doing 调 startTask / done 调 finishTask（非法转移它们自己会 throw 人话——
//          这里用 try/catch 接住：error instanceof Error 窄化后 console.log(e.message) + exit 1，
//          第 4 课 ex7 演示区的同款动作）。
//          成功路径：把旧任务换成新任务（想想 db.tasks.indexOf + 展开，或者 map 一遍）、
//          save(db)、打印"已更新"。
//
// 完成判据：四命令全通；五条错误路径（无命令 / 空标题 / 找不到 id / 非法转移 / 不认识的命令）
//   都有人话 + exit 1；npm run todo -- add 买牛奶 → list → doing 1 → done 1 一条龙跑通；
//   npx tsc --noEmit 沉默。
