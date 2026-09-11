// 04_进阶与质量/ex17_weather_split/src/schema.ts —— 骨架（第 8 课 · 任务 2：天气 CLI 拆分 · 校验层）
// 用法：被 cli.ts import（模块天生安静：npx tsx 直跑无输出）
//
// 剧本：ex12 单文件里的"第四关"和"进口①"搬进这间屋。归属今天落定（第 6 课悬置的问题）：
//   parseCoords 校验 argv（用户的进口），weatherSchema 校验 API 响应（网络的进口）——
//   都是"外面的世界的数据进门的地方"。校验住一间屋，这间屋就叫 schema.ts。
//
// 黑盒照抄：① import { z } from "zod";——zod 装在仓库根的 node_modules 里，
//   import 天生会一路向上找（node_modules 查找规则），你在哪一层都能 import 到它。
//
// 规则：只搬家不装修——函数体、schema 定义、打印文案与 ex12 逐字一致；全程禁 as / ！。

// ======================= 迁移区（约 10 分钟）=======================
// TODO 1) 从 03_工程与异步/ex12_weather_cli.ts 迁移三个成员，各加 export：
//        export function parseCoords(args: string[]): [number, number] { ... }  ← 进口①：argv 校验
//        export const weatherSchema = z.object({ ... })                         ← 第四关：API 响应校验
//        export type Weather = z.infer<typeof weatherSchema>                    ← 类型从数据来（第 6 课）
//        不搬：url 模板（去 api.ts）、fetch / try-catch / 打印主流程（去 cli.ts）。
//        parseCoords 原样搬——包括它里面的 console.log(`坐标合法:...`) 和 process.exit(1)。
//        （"校验函数里不该有打印和退出"是对的，但那是装修——今天只搬家；
//         装修等有测试保镖的时候再做，课件 §5 学有余力见。）
// 完成判据：三个成员全部 export + 与 ex12 逐字一致 + tsc 沉默 + tsx 直跑无输出
import { z } from "zod";

// 从 ex12 第 27-47 行逐字搬，只在 function 前加 export
export function parseCoords(args: string[]): [number, number] {
  if(args.length !== 2){
    console.log("参数数量非法，只允许输入两个参数");
    process.exit(1);
  } 
  const lat = Number(args[0]);
  const lon = Number(args[1]);

  if(Number.isNaN(lat) || Number.isNaN(lon)) {
    console.log("参数非法，传入参数要求均为数字");
    process.exit(1);
  } 

  if ((Math.abs(lat) <= 90) && (Math.abs(lon) <= 180)) {
    console.log(`坐标合法:${lat}, ${lon}`);
    return [lat, lon];
  } else {
    console.error("纬度需在-90~90, 经度需在-180~180");
    process.exit(1);
  }
}

// 从 ex12 第 50-56 行逐字搬，const 前加 export
export const weatherSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
  }),
});

// 从 ex12 第 57 行原样搬
export type Weather = z.infer<typeof weatherSchema>;