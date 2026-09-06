// 03_工程与异步/ex12_weather_cli.ts —— 骨架（第 6 课 · 任务 1：天气 CLI）
// 用法：npx tsx 03_工程与异步/ex12_weather_cli.ts 39.9 116.4   （骨架从出生就是绿的：
//   骨架阶段不发请求——所有 TODO 都在注释里，写完才跑）
//
// 剧本：第 5 课的 fetchUser 是 mock，今天换真的——open-meteo，免注册的天气 API。
//   命令行传纬度、经度，输出今明两天的日期、最高、最低温度。
//   主菜是错误路径：三条 fetch 错误路径 + zod 的第四关，逐关亲手触发、观察、留痕。
//   （导师备课实测参考：北京 39.9 116.4，2026-09-05 当天最高 32.9°C 最低 22.3°C——
//   你的数字以运行当天为准；数字不一样很正常，结构一样就行）
//
// 黑盒照抄：① 下面的 URL 模板——参数名一个都不能错，open-meteo 只认这些名字
//   （把 daily 参数名改错 = 故意撕合同，是 TODO 7 第 ③ 条要触发的第四关）；
//   ② process.exit(1)——打印完人话就体面退出，括号里的 1 是退出码（第 5 课 D 段见过它的分量）。
//
// 规则：全程禁 as / ！；命名 camelCase；错误路径的打印必须分得清"是哪一关拦下的"。

import { z } from "zod";

// 预建：URL 模板（黑盒照抄）。forecast_days=2 就是今明两天；timezone=auto 按坐标自动定时区
const url = (lat: number, lon: number): string =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
  `&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=2`;

// ======================= 进口 ①：argv（先裸取——任务 2 回来清算） =======================
// TODO 1) process.argv.slice(2) 取出纬度、经度两个参数，Number() 转成数字。
//   校验先不做——ex13 会回来统一清算这个进口（伏笔明示：先按第 1 课 BMI 的老办法裸取）。
function parseCoords(args: string[]): [number, number]{
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
};

const [lat, lon] = parseCoords(process.argv.slice(2));

// ======================= 进口 ②：fetch + 三条错误路径 =======================
// TODO 2) 顶层 await，一个 try/catch 包住 fetch 和 res.json()（§2.2 的形状照用）：
//   - fetch 之后立刻查 res.ok（路径 2）：不 ok 就打印 res.status 和一句人话，process.exit(1)
//   - catch 接住路径 1（fetch reject）和路径 3（json() 抛错）：
//     instanceof Error 窄化后打印 err.message（打印要分得清是哪条路径）
// TODO 3) const raw: unknown = await res.json()——注解 unknown，它是 any（第三笔旧账，今天结清）
try {
  const res = await fetch(url(lat, lon));
  if (!res.ok) {
    console.error(`路径 2：fetch 成功但返回不 ok，status 是：${res.status}`);
    process.exit(1);
  }
  const raw: unknown = await res.json();

// ======================= 第四关：zod schema =======================
// TODO 4) 照 §2.3 写 weatherSchema：外层一个字段 daily；daily 里三个数组——
//   time（z.array(z.string())）、temperature_2m_max / temperature_2m_min（z.array(z.number())）
  const weatherSchema = z.object({
    daily: z.object({
      time: z.array(z.string()),
      temperature_2m_max: z.array(z.number()),
      temperature_2m_min: z.array(z.number()),
    }),
  });
// TODO 5) type Weather = z.infer<typeof weatherSchema>——今天的类型全部从这来，不许手写数据 interface
  type Weather = z.infer<typeof weatherSchema>;
// ======================= 校验 + 输出 =======================
// TODO 6) weatherSchema.safeParse(raw)：
//   - 失败分支：打印 r.error.issues[0].message 和 r.error.issues[0].path.join(".")，然后 process.exit(1)
//   - 成功分支：从 r.data 取今明两天，逐天打印 日期、最高、最低（r.data.daily.time[0] 是今天）
  const r = weatherSchema.safeParse(raw);
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
  if( err instanceof Error) {
    console.error(`路径 1 或 3：fetch 或 json() 抛错，message 是：${err.message}`);
    process.exit(1);
  }
}

// ======================= 错误路径实测（判卷重点，一段不能漏） =======================
// TODO 7) 三连触发，每条写清"哪一关拦下、打出什么"，留痕写在下面：
//   ① 路径 1：把 URL 里主机名改坏（api.open-meteo.com → api.open-meteo.comx），跑
//   ② 路径 2：参数传纬度 999（npx tsx ... 999 116.4），跑——注意打印里的 status
//   ③ 第四关：把 schema 里 temperature_2m_max 故意改成 temperature_2m_MAX，跑——看 issues 报的 path
//   实测完：全部改回正常版，再跑一遍 39.9 116.4 确认健康。

// ======================= 观察留痕（TODO 7 写这，判卷证据） =======================
// ①坏主机名（路径 1）——拦截关卡：网络错误；打出：路径 1 或 3：fetch 或 json() 抛错，message 是：fetch failed
// ②纬度 999（路径 2）——拦截关卡：非2xx；status 是：fetch 成功但返回不 ok，status 是：400
// ③schema 改错（第四关）——拦截关卡：zod结构校验错误；path 报的是:Invalid input: expected array, received undefined. daily.temperature_2m_MAX
// ④边界放行复跑（<= 修正后）—— 90 116.4：放行，API 返回数据；39.9 180：放行，API 接受
// 完成判据：正常输入出今明温度；三连留痕齐全且分得清关卡；safeParse 失败信息带 message 和 path；
//   类型全部来自 z.infer；实测后代码已改回，npx tsc --noEmit 沉默
