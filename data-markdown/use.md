# Data Markdown

将 HTML 中 `[data-markdown]` 元素的 Markdown 内容渲染为 HTML。

## 使用

在 HTML 元素上添加 `data-markdown` 属性，内容写 Markdown：

```html
<div data-markdown>
## 标题

- 列表项 1
- 列表项 2

**加粗** 和 *斜体*
</div>

<script src="data-markdown.user.js"></script>
```

## 支持的 Markdown 特性

- 标题、粗体、斜体、删除线
- 表格
- 任务列表（`- [x]`）
- 代码块
- 链接（自动新窗口打开）
- 简单换行

## 安全防护

渲染后的 HTML 经过 sanitize 处理：

- **标签白名单**：仅允许 `h1-h6`、`p`、`a`、`img`、`table`、`code`、`pre` 等安全标签
- **属性白名单**：仅允许 `href`、`src`、`alt`、`class`、`id` 等必要属性
- **协议拦截**：`href`/`src` 中的 `javascript:`、`data:`、`vbscript:` 协议会被移除（含控制字符注入变体）
- 非白名单标签会被剥离标签但保留内容，非白名单属性直接移除

## 安装

[Tampermonkey 安装](https://www.tampermonkey.net/script_installation.php#url=https://github.com/SantaChains/scripts/raw/main/data-markdown/user.js)

## License

[MIT](../LICENSE)
