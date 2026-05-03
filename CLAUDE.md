# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tampermonkey 油猴用户脚本「搜索引擎一键跳转」(Search Engine Quick Redirect)。在搜索结果页面添加其他搜索引擎的快捷跳转按钮，非搜索页面提供「星际搜索」快捷搜索面板。作者: Punkjet & SantaChains。

## Architecture

纯 JavaScript 用户脚本，无构建工具、无外部依赖。通过 Tampermonkey 的 `GM_*` API 持久化用户设置。

**核心模块** (`SearchRedireact/user.js`):

- `searchEngines` — 搜索引擎配置数组，每个引擎定义 `searchUrl`、`searchkeyName`、`matchUrl`（正则匹配当前页面）、`mark`（唯一标识）
- `quickSearchConfig` — 快捷搜索分类配置（综合/学术/社交/图片/壁纸/视频/购物/开发）
- 预设标记常量 (`punkDeafultMark` 等) — 用 `-` 分隔的 mark 字符串，控制默认启用哪些引擎
- `getSearchKeyword()` — 从 URL 参数提取搜索关键词
- `isSearchPage()` — 判断当前页面是否为搜索结果页
- `createSearchButtons()` — 搜索页的引擎跳转面板（可拖拽、可收起）
- `createQuickSearch()` — 非搜索页的浮动快捷搜索按钮
- `showQuickSearch()` — 「星际搜索」全屏面板（含分类标签和设置）

**UI 主题**: 紫蓝渐变 (`#667eea` → `#764ba2`)，所有样式内联。

**持久化键** (`GM_setValue`):
- `punk_setup_search` — 用户选择的引擎列表（`-` 分隔）
- `punk_search_position` — 搜索面板位置 `{x, y}`
- `punk_search_expanded` — 搜索面板展开状态
- `punk_quick_search_position` — 快捷搜索按钮位置 `{left, bottom}`

## Development

脚本直接在 Tampermonkey 中运行，无构建/测试流程。编辑 `SearchRedireact/user.js` 后在 Tampermonkey 中刷新即可生效。

`SearchRedireact/meta.js` 目前为空文件。

## Adding a New Search Engine

在 `searchEngines` 数组中追加对象，格式：
```js
{name: "显示名", searchUrl: "https://example.com/search?q=", searchkeyName: ["q"], matchUrl:/example\.com\/search.*?q=/g, mark:"ExampleMark"}
```

若需加入快捷搜索分类，同时在 `quickSearchConfig` 对应 `tabList` 中添加 `{name, searchUrl}`。

## Language & Encoding

所有注释和 UI 文本使用中文。文件编码 UTF-8，行尾 LF。
