# Link Clear

去除链接追踪参数、解析搜索引擎跳转链接、净化 URL。右键带追踪参数的链接即可一键获取干净 URL。

## 功能

- **通用追踪清除**：UTM、gclid、fbclid、msclkid 等 50+ 追踪参数
- **站点适配**：B站、淘宝、天猫、京东、拼多多、YouTube、Twitter/X、知乎、微博、抖音、小红书
- **搜索引擎跳转解析**：百度、搜狗、360、Google、Bing 跳转链接自动提取真实 URL
- **右键净化面板**：右键带追踪的链接，显示清洁 URL，一键复制/打开
- **页面统计**：左下角浮动按钮显示当前页追踪链接数量

## 使用

1. 安装脚本后，浏览任意网页
2. 左下角出现红色数字气泡 = 当前页有 N 个带追踪的链接
3. 右键任意带追踪的链接，弹出操作面板：
   - **Copy Clean URL** — 复制干净链接到剪贴板
   - **Open Clean** — 新窗口打开干净链接
   - **Open Original** — 新窗口打开原始链接

## 支持清除的追踪参数

**通用**：utm_*、gclid、fbclid、msclkid、twclid、_ga、_gl、ref、from、source 等

**B站**：vd_source、spm_id_from、from_source、share_source 等

**电商**：淘宝/天猫 scm/pvid/ut_sk、京东 cu/abt/scm 等

**社交**：知乎 utm_id/share_type、微博 sudaref、抖音 previous_page/modal_id 等

## 安装

[Tampermonkey 安装](https://www.tampermonkey.net/script_installation.php#url=https://github.com/SantaChains/scripts/raw/main/link-clear/user.js)

## License

[MIT](../LICENSE)
