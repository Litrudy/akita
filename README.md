# Akita Group · 秋田集团 — 官方网站

纯静态多页官网（HTML/CSS/JS，无构建步骤、无框架依赖），内容以 `AKITA_Build/` 中的官方 Word 文档为准。本地直接双击 `index.html` 即可预览。

- 线上地址：https://litrudy.github.io/akita/
- 仓库：https://github.com/Litrudy/akita （GitHub Pages，main 分支根目录发布）
- 更新流程：改完文件后 `git add -A` → `git commit` → `git push`，约 1 分钟后线上生效

## 页面结构（7 页）

```
index.html        首页：Hero 航线图 + 核心数据（10+ 年 / 100+ 车 / 3M 吨 / 9 国）
                  + 追踪查询条 + 关于/服务/愿景/运营/案例概览 + 客户与行业背书 + CTA
about.html        关于：集团简介（九国版图 + 深圳区域管理中心）/ 发展历程
                  （2019 · 2021 · 2025 公司主体）/ 本地团队 / 合作伙伴 logo / 使命愿景
services.html     服务：船舶代理 / 项目重件 / 清关（效率 +40%）/ 货运代理 /
                  仓储堆场 / 矿业运输，六段详情 + 吸顶子导航
operations.html   运营：九国港口网络表（含吉布提 DMP、达喀尔、阿比让、的黎波里）/
                  运营现场实拍 / 车队设备 / 仓储设施 / HSE 与合规
cases.html        案例：CMEC 几内亚变电站 / 中车资阳机车出口 / 矿卡进口与目的港执行
                  （含照片画廊）+ 长期合约 + 推荐语
news.html         新闻：吉布提 DMP 港口合作 / WBX 2026 上海参展（三语全文）
contact.html      联系：结构化询价表单（mailto → logistics@akitagn.com）/ 货物追踪 /
                  七地办事处（集团总部 + 刚果黑角 + 弗里敦 + 几内亚 + 尼日利亚邮箱，
                  深圳与香港含完整地址）/ FAQ
```

## 目录说明

```
css/styles.css      设计系统：CSS 变量驱动亮（海军蓝 #0b1535）/ 暗（炭黑 #0f1117）双主题
js/main.js          主题切换 / EN·FR·中文 三语切换 / 导航 / 动效 / 表单 mailto
images/
  us/               品牌资产：akita-mark.png（页头犬头标）、akita-logo.png、favicon.png
  clients/          客户背书：clients-wall.png 大墙 + 8 家船东伙伴单独 logo
  cases/            案例照片：cmec-substation / crrc-loco-* / mining-01~05 / case-01~02
  ops/              运营现场：ops-01~05（通达号、COSCO、吊装、甲板）
  team/             团队：team-guinea-01.jpg（几内亚团队合影）
AKITA_Build/        官方内容源文档（Word + logo 源文件）—— 已 gitignore，仅保留本地
_source/            原站抓取底稿与 docx 提取文本 —— 已 gitignore，仅保留本地
```

## 三语维护方法

英文写在 HTML 标签内，法文、中文放同一元素的 `data-fr` / `data-zh` 属性，JS 自动切换：

```html
<h3 data-fr="Dédouanement" data-zh="清关服务">Customs clearance</h3>
```

输入框占位文本用 `data-ph-fr` / `data-ph-zh`；页面 `<title>` 同样带 data 属性。三处保持同步修改即可，不要改动 `js/main.js` 的切换逻辑。

## 功能清单

| 功能 | 说明 |
| --- | --- |
| 亮 / 暗主题 | 海军蓝 ↔ 炭黑；跟随系统偏好，localStorage 记忆 |
| 三语切换 | EN / FR / 中文，localStorage 记忆 |
| 下拉导航 | 7 项主导航 + 悬停二级菜单；≤1200px 折叠为汉堡菜单 |
| 动效 | 滚动渐入、数字计数、航线流动、跑马灯（均尊重 prefers-reduced-motion） |
| 表单 | 询价 / 追踪均为 mailto 方式，收件人 logistics@akitagn.com |

## 换色入口

所有颜色集中在 `css/styles.css` 顶部 `:root`（亮色）与 `:root[data-theme="dark"]`（暗色）两个变量块，改 `--accent` / `--accent-2` 即可整站更换点缀渐变色。
