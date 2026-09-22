# 《软件设计哲学》参考资源索引

> 服务于本目录的《20 小时学习计划》与《练习手册》。按章节定位资料时看这里。

原书：*A Philosophy of Software Design*, 2nd Edition — John Ousterhout，Yaknyam Press, 2021。
原书**没有免费正版电子版**，官方只在 Amazon 售卖纸质/电子版。本目录收录的是「官方免费材料 + 开放许可社区译本」。

---

## 一、本目录已有的资料

### 1. 官方免费 PDF（作者本人放出）

| 文件 | 说明 |
| --- | --- |
| `官方-第二版新增内容节选.pdf` | 作者为已购第一版的读者免费提供的节选，13 MB。内含**第二版新增的「第 21 章 决定什么是重要的」全文**，以及第 6 章改写内容、与 Robert Martin《Clean Code》的观点对比小节。 |

来源：https://web.stanford.edu/~ouster/cgi-bin/aposd2ndEdExtract.pdf

> 用途提示：学习计划里的 S10（L5）要用第 21 章。这份 PDF 是唯一合法的免费全文来源。

### 2. 第二版简体中文全译本（Markdown）

**单文件全本**：`软件设计哲学-第二版-中文全本.md`

- 前言 + 22 章 + 总结 + 附录（译名说明与术语表），约 13.8 万字，328 KB，带目录锚点与封面图。
- 适合全文检索（`Cmd+F` 一次搜全书）、通读、导出到其他工具。
- 已清理站点专有语法，纯标准 Markdown，Typora / Obsidian / VSCode 均可正常渲染。

**分章目录**：`A-Philosophy-of-Software-Design-2nd-zh/`

- `preface.md`、`ch01.md` ~ `ch22.md`、`summary.md`，逐章打开，便于对照学习计划按次推进。
- 含 `figures/`（封面 + 原书插图）、`LICENSE-CC-BY-4.0.txt`。
- 译本来源：GitHub 开源项目 [yingang/aposd2e-zh](https://github.com/yingang/aposd2e-zh)
- 在线阅读：https://yingang.github.io/aposd2e-zh/
- 许可：**CC-BY-4.0**（见 `LICENSE-CC-BY-4.0.txt`），允许在署名前提下复制、分发、改编。
- 引用时请署名为：yingang/aposd2e-zh 译本。

对应关系（第二版目录）：

```
preface      前言
ch01   介绍                      ch12   不写注释的四个借口
ch02   复杂性的本质               ch13   注释应该描述代码中难以理解的内容
ch03   能工作的代码是不够的        ch14   选取名称
ch04   模块应该是深的              ch15   先写注释
ch05   信息隐藏和信息泄露          ch16   修改现有的代码
ch06   通用的模块是更深的          ch17   一致性
ch07   不同的层级，不同的抽象      ch18   代码应该是易理解的
ch08   下沉复杂性                  ch19   软件发展趋势
ch09   在一起更好还是分开更好？    ch20   性能设计
ch10   通过定义来规避错误          ch21   决定什么是重要的 ★第二版新增
ch11   设计两次                    ch22   结论
summary      总结
```

---

## 二、官方免费公开课（强烈推荐，配合练手）

作者在斯坦福开设的 **CS 190: Software Design Studio**，全部讲义公开，是全书内容的「课堂实操版」——比读书更适合练设计判断力。

- 课程主页（最新一届）：https://www.stanford.edu/~ouster/cs190-winter24
- 讲义「管理复杂性」（复杂度的经典论述）：https://web.stanford.edu/~ouster/cgi-bin/cs190-spring15/lecture.php?topic=complexity
- 讲义「模块化设计」（对应第 4–6 章）：https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php?topic=modularDesign
- 课程介绍讲义（复杂性 + 设计在研发流程中的位置）：https://web.stanford.edu/~ouster/cgi-bin/cs190-winter21/lecture.php?topic=intro
- 全书讨论课（学生需先读完 1–18 章）：https://www.web.stanford.edu/~ouster/cgi-bin/cs190-winter19/lecture.php?topic=bookReview
- 作者书籍主页（版本差异说明 / 勘误）：https://web.stanford.edu/~ouster/cgi-bin/book.php

---

## 三、延伸阅读

| 资源 | 链接 | 为什么值得看 |
| --- | --- | --- |
| Parnas, *On the Criteria To Be Used in Decomposing Systems into Modules* (1972) | https://dl.acm.org/doi/10.1145/361598.361623 | 「信息隐藏」思想的源头，第 5 章的祖师爷论文 |
| *The Grug Brained Developer* | 见 CS190 主页 Useful Links | 幽默版软件设计，多处借用 APoSD 观点 |
| Rob Pike 关于 Google 软件复杂度的博客 | 见 CS190 主页 Useful Links | 工业界视角的真实复杂度案例 |
| Raft 论文 + 可视化 | 见 CS190 主页 Useful Links | 课程项目载体，想动手做大项目时用 |

---

## 四、版权说明

1. 原书《A Philosophy of Software Design》**受版权保护**，本目录不含原书完整英文 PDF，也不建议从非官方渠道获取。
2. `官方-第二版新增内容节选.pdf` 由作者本人公开发布，可自由阅读。
3. `A-Philosophy-of-Software-Design-2nd-zh/` 为社区译本，遵循 CC-BY-4.0，使用请署名。
4. 如长期学习使用，建议购买正版（Amazon 有纸质与电子版）以支持作者：https://www.amazon.com/dp/173210221X
