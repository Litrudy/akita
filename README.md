# Akita Group · 秋田集团 — 官网重设计

基于 akitagroup.com 的内容重新设计的纯静态多页官网。无构建步骤、无依赖，直接双击 `index.html` 即可打开。

## 页面结构（参考 COSCO Shipping Lines 的导航组织方式）

```
index.html        首页：Hero + 数据 + 追踪查询入口 + 各版块概览（带"完整页面"链接）
about.html        关于：简介 / 发展历程* / 管理团队* / 合作伙伴墙 / 使命愿景
services.html     服务：6 个服务详情段（流程* + 范围），吸顶子导航
operations.html   运营：港口网络图表 / 运营现场 / 车队设备* / 仓储设施* / HSE*
cases.html        案例：2 个项目案例 + 长期合约 + 客户评价*
contact.html      联系：结构化询价表单 / 货物追踪* / 7 地办事处* / FAQ*
```

带 `*` 的模块含占位内容，页面上有虚线 "Placeholder" 标签标注，素材到位后替换。
顶部导航悬停出现下拉子菜单；内页有面包屑与横幅，长页面有吸顶子导航。

## 设计方向

高端咨询公司 / 现代建筑事务所式的极简编辑风：

- **字体**：Fraunces（衬线大标题）+ Inter（正文）+ IBM Plex Mono（等宽标签/数据）；中文对应 Noto Serif SC / Noto Sans SC
- **色彩**：冷调墨蓝（#0f1117）/ 雾白（#f7f8fc）双主题，青色 → 紫色双点缀渐变（暗色 #6ee7ff→#a78bfa，亮色 #0ea5b7→#7c3aed）
- **背景**：Hero 区双色径向光晕 + 48px 蓝图网格线（径向遮罩向四周渐隐）
- **版式**：细线分隔（hairline rules）、章节编号（01–06）、大量留白、等宽字大写小标签
- **图形**：手绘 SVG 西非航线图（替代原站照片）、线稿作业图标、港口数据表

## 功能

| 功能 | 说明 |
| --- | --- |
| 亮 / 暗主题 | 右上角圆形按钮切换；跟随系统偏好；localStorage 记忆 |
| 三语切换 | EN / FR / 中文，与原站一致；localStorage 记忆 |
| 滚动动效 | 渐入显示、数字滚动计数、航线虚线流动（均尊重 `prefers-reduced-motion`） |
| 资质跑马灯 | 悬停暂停 |
| 联系表单 | 静态站无后端，提交时调起邮件客户端（mailto → logistics@akitagn.com） |
| 响应式 | 980px 以下汉堡菜单，移动端全部网格降级 |

## 文件结构

```
index.html        页面结构 + 全部三语文案
css/styles.css    设计系统（CSS 变量驱动双主题）
js/main.js        主题/语言切换、动效、表单
_source/          原站抓取的文字内容备份（仅作内容参考）
```

## 如何修改文案

英文直接写在 HTML 标签内；法文、中文放在同一元素的 `data-fr` / `data-zh` 属性里：

```html
<h3 data-fr="Dédouanement" data-zh="清关服务">Customs clearance</h3>
```

三处保持同步修改即可，JS 会自动切换。

## 如何调整配色

所有颜色集中在 `css/styles.css` 顶部的 `:root`（亮色）与 `:root[data-theme="dark"]`（暗色）两个变量块中，改 `--accent` / `--accent-2` 即可整站更换点缀渐变色。
