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

## 安装

[Tampermonkey 安装](https://www.tampermonkey.net/script_installation.php#url=https://github.com/SantaChains/scripts/raw/main/data-markdown/user.js)

## License

[MIT](../LICENSE)
