# 搜索引擎一键跳转

Tampermonkey 油猴用户脚本 — 在搜索结果页面添加其他搜索引擎的快捷跳转按钮，非搜索页面提供「星际搜索」快捷搜索面板。

> **当前版本 v6.0** | Nerd Dark 终端主题 · Tokyo Night 配色 · SVG 图标 · 50+ 搜索引擎 · 拖拽面板 · 分类快捷搜索

## 安装

### 第一步：安装 Tampermonkey 扩展

[Tampermonkey 官网下载](https://www.tampermonkey.net/)

### 第二步：安装脚本

> Chrome/Edge 等 Chromium 浏览器可能阻止直接安装，请使用以下方式之一：

**方式一：通过 Tampermonkey 仪表盘安装（推荐）**

1. 复制脚本代码：[user.js](https://raw.githubusercontent.com/SantaChains/scripts/main/SearchRedireact/user.js)
2. 点击浏览器 Tampermonkey 图标 → **添加新脚本**
3. 清空编辑区，粘贴复制的代码
4. 按 `Ctrl + S` 保存

**方式二：GitHub 直接安装**

[点击安装脚本](https://www.tampermonkey.net/script_installation.php#url=https://github.com/SantaChains/scripts/raw/main/SearchRedireact/user.js)

> 若浏览器阻止，请使用方式一。后续更新自动推送。

## 功能

- 搜索页面自动识别关键词，在页面上显示可跳转的其他搜索引擎按钮
- 支持 50+ 搜索引擎（国内/国际/图片/壁纸/视频/购物/学术/社交/开发）
- 「星际搜索」快捷面板，分类浏览，一键搜索
- 按钮可拖拽，位置自动保存
- 预设配置：国内预设、国际预设、图片预设、壁纸预设、全部预设
- 自定义启用/禁用搜索引擎

## 使用

- 在任意搜索结果页面，点击左上角 ⭐ 按钮打开引擎跳转面板
- 在非搜索页面，点击右下角 🪐 浮动按钮打开「星际搜索」面板
- 点击 ⚙️ 可自定义启用的搜索引擎
- ESC 键关闭所有面板

## 支持的搜索引擎

**国内**: 百度、必应、360、夸克、头条、微博、知乎、豆瓣、搜狗、搜狗微信、MitaAI、360AI

**国际**: Google、Bing、Yahoo、Yandex、DuckDuckGo、Brave、Startpage、Ecosia、Qwant、WolframAlpha

**AI**: Perplexity、Kagi、Claude、ChatGPT、Sage

**学术**: Google Scholar、Google Patents

**图片/壁纸**: Unsplash、Pixabay、Pexels、Wallpaper Engine

**视频**: YouTube、B站

**开发**: GitHub、GitLab

## 自定义

点击 ⚙️ 设置按钮，可：

- 选择预设配置快速切换
- 勾选/取消单个搜索引擎
- 保存后页面自动刷新生效

## License

[MIT](LICENSE)
