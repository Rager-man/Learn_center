// 04_进阶与质量/ex17_weather_split/src/cli.ts —— 骨架（第 8 课 · 任务 2：天气 CLI 拆分 · 入口/编排层）
// 用法：npm run dev -- 39.9 116.4   （npm run dev 从哪个目录跑都行；-- 是"后面是传给脚本的参数"的暗号。
//   等价的直跑：在 TypeScript/ 目录下 npx tsx 04_进阶与质量/ex17_weather_split/src/cli.ts 39.9 116.4。
//   骨架阶段纯注释，跑起来无输出——写完才有天气）
//
// 剧本：入口文件是"总调度"：读 argv → 找 schema 要坐标 → 找 api 要数据 → 找 schema 验数据 → 打印。
//   它自己不校验、不拼 URL、不碰网络——每件事都有专门的屋。依赖方向今天只有一种：
//   cli import 别人，没人 import cli（想清楚为什么，复盘题 3 就是它）。
//   （导师备课实测参考：北京 39.9 116.4，2026-09-09 当天最高 24.7°C 最低 16.2°C，次日 29.1 / 15.1——
//   你的数字以运行当天为准；数字不一样很正常，结构一样就行）
//
// 黑盒照抄：① 头两行 import（.js 扩展名，TS2835 预防针）：
//        import { parseCoords, weatherSchema } from "./schema.js";
//        import { fetchWeather } from "./api.js";
//        ② 主流程的形状（内容从 ex12 搬，打印文案逐字一致）：
//        const [lat, lon] = parseCoords(process.argv.slice(2));
//        try {
//          const raw: unknown = await fetchWeather(lat, lon);
//          const r = weatherSchema.safeParse(raw);
//          // 成功：逐天打印 日期、最高、最低；失败：打印 issues 的 message 和 path + process.exit(1)
//        } catch (err) {
//          // 路径 1 或 3：instanceof Error 窄化后打印 message + process.exit(1)
//        }
//
// 规则：只搬家不装修；全程禁 as / ！。
// ======================= 迁移区（约 10 分钟）=======================
// TODO 1) 按"黑盒照抄 ②"的形状把 ex12 的主流程搬进来：
//        - fetch 的三步已经在 fetchWeather 里了——入口里只剩 await 一个函数（这就是"入口不含业务"）
//        - safeParse 成功/失败分支、catch 分支的打印文案：与 ex12 逐字一致
import { parseCoords, weatherSchema } from "./schema.js";
import { fetchWeather } from "./api.js";

const [lat, lon] = parseCoords(process.argv.slice(2));
try {
    const raw: unknown = await fetchWeather(lat, lon);
    const r = weatherSchema.safeParse(raw);
    // 成功：逐天打印 日期、最高、最低；失败：打印 issues 的 message 和 path + process.exit(1)
    if(r.success) {
        for(let i=0; i < r.data.daily.time.length; i++) {
            console.log(`${r.data.daily.time[i]}：最高 ${r.data.daily.temperature_2m_max[i]}°C，最低 ${r.data.daily.temperature_2m_min[i]}°C`);
        }
    } else {
        console.log(r.error.issues[0].message);
        console.log(r.error.issues[0].path.join("."));
        process.exit(1);
    }
} catch (err) {
    // 路径 1 或 3：instanceof Error 窄化后打印 message + process.exit(1)
    if( err instanceof Error) {
        console.error(`路径 1 或 3：fetch 或 json() 抛错，message 是：${err.message}`);
        process.exit(1);
    }
}

// TODO 2) 跑通 + 错误路径复测（判卷对账用）：
//        ① npm run dev -- 39.9 116.4 → 今明两行温度（结构对上参考即过）
//        ② 复测任一条错误路径：不传参数 / 传 abc / （想测路径 1 就临时把 api.ts 的主机名改坏，测完改回）
//           ——打印必须分得清"是哪一关拦下的"（第 6 课的验收标准，搬家后不许降级）
// TODO 3) 留痕区（写在下面）：
//        正常输入的输出（两行温度）：
//          坐标合法:39.9, 116.4
//          2026-09-11：最高 30.7°C，最低 16.9°C
//          2026-09-12：最高 28°C，最低 17.5°C
//        错误路径复测（选的哪条 / 哪关拦下 / 打出什么）： 不传参数，打出参数数量非法，只允许输入两个参数
//        依赖方向一句话（谁 import 谁、为什么没人 import cli）： cli import schema 和 api，因为 cli 是总调度，它要用别人；schema 和 api 谁也不 import cli，因为被 import 的一方不能认识使用方——一旦有人 import cli，依赖成环，谁都没法被单独使用、单独测试了。
// 完成判据：npm run dev -- 39.9 116.4 出今明温度 + 留痕三行齐全 + ex12 原文件一行未动 + tsc 沉默
