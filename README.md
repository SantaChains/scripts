# Scripts

Tampermonkey 油猴用户脚本合集。

## 安装

### 第一步：安装 Tampermonkey 扩展

[Tampermonkey 官网下载](https://www.tampermonkey.net/)

### 第二步：选择脚本安装

> Chrome/Edge 等 Chromium 浏览器可能阻止直接安装，请使用「仪表盘方式」。

---

### 搜索引擎一键跳转

在搜索结果页面添加其他搜索引擎的快捷跳转按钮，非搜索页面提供「星际搜索」快捷搜索面板。

> v6.2 | Nerd Dark 终端主题 · 50+ 搜索引擎 · 拖拽面板 · 分类快捷搜索

[GitHub 安装](https://www.tampermonkey.net/script_installation.php#url=https://github.com/SantaChains/scripts/raw/main/SearchRedireact/user.js) | [源码](SearchRedireact/user.js) | [说明](SearchRedireact/use.md)

---

### Link Clear

去除链接追踪参数、解析搜索引擎跳转、净化 URL。右键带追踪的链接即可一键获取干净 URL。

> v1.4 | 50+ 追踪参数 · B站/淘宝/京东等站点适配 · 搜索引擎跳转解析

[GitHub 安装](https://www.tampermonkey.net/script_installation.php#url=https://github.com/SantaChains/scripts/raw/main/link-clear/user.js) | [源码](link-clear/user.js) | [说明](link-clear/use.md)

---

### Data Markdown

将 HTML 中 `data-markdown` 元素的 Markdown 内容渲染为 HTML。

> v2.2 | Showdown 2.x · XSS 防护 · MutationObserver 动态渲染

[GitHub 安装](https://www.tampermonkey.net/script_installation.php#url=https://github.com/SantaChains/scripts/raw/main/data-markdown/user.js) | [源码](data-markdown/user.js) | [说明](data-markdown/use.md)

---

### B站字幕下载器 Pro

下载B站视频字幕（JSON/SRT），支持多P和语言选择，可通过菜单重新显示面板。

> v2.1.1 | 多P支持 · 多语言 · 菜单控制

[GitHub 安装](https://www.tampermonkey.net/script_installation.php#url=https://github.com/SantaChains/scripts/raw/main/BiliSubtitle-down/user.js) | [源码](BiliSubtitle-down/user.js)

---

### Steam 成就 BBCode 生成器

一键生成 Steam 成就列表的 BBCode，多种样式可选，支持自定义样式，支持全球成就和个人成就页面，还能复制单个成就的代码！

> v1.5 | 多样式模板 · 自定义格式 · 单成就复制

[GitHub 安装](https://www.tampermonkey.net/script_installation.php#url=https://github.com/SantaChains/scripts/raw/main/SteamAchieveBBCode/user.js) | [源码](SteamAchieveBBCode/user.js)

---

## 安装方式

**方式一：仪表盘安装（推荐，兼容所有浏览器）**

1. 点击上方「GitHub 安装」链接，复制脚本源码
2. 点击浏览器 Tampermonkey 图标 → **添加新脚本**
3. 清空编辑区，粘贴复制的代码
4. 按 `Ctrl + S` 保存

**方式二：直接安装**

点击「GitHub 安装」链接，若浏览器允许则 Tampermonkey 直接弹出安装确认。

## 更新

所有脚本通过 `@updateURL` 自动检查更新，Tampermonkey 会自动推送新版本。

## License

[MIT](LICENSE)
