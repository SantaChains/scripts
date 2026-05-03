快速生成【游戏成就列表】论坛代码

## 更新
新增脚本（支持单成就复制+自定义样式）
可见第二页

## 前言
参考了@Phonetic 大佬的帖子
【快速成就列表制作】只要标题足够水就不会被移区
原文提供的是所有成就的列表，我自己DIY了一下，改成了单个成就的

## 用法
在Steam成就页面（全球成就/个人成就 页面 均可）
https://steamcommunity.com/stats/appid/achievements

例如：https://steamcommunity.com/stats/504230/achievements
F12 控制台，粘贴代码回车
即可得到适用于论坛发帖的表格代码

## 代码

### 样式1 - 深色背景版
```javascript
var images = document.querySelectorAll("div.achieveImgHolder img")
var text = document.querySelectorAll("div.achieveTxt")
var table = []
for (var i = 0; i < images.length; i++) {
    table.push('[table=65%,#111923][tr][td][float=left][img=64,64]'+images[i].src+'[/img][/float][size=3][color=#C6D4DF]'+text[i].children[0].innerText+'[/color][/size]\n[color=#8F98A0]'+text[i].children[1].innerText+'[/color][/td][/tr][/table]');
}
console.log(table.join('\n'))
```
来自于Hazardosu大佬发的（置顶回复）

### 样式2 - 无底色简化版
```javascript
var images = document.querySelectorAll("div.achieveImgHolder img")
var text = document.querySelectorAll("div.achieveTxt")
var table = []
for (var i = 0; i < images.length; i++) {
    table.push('[table=65%][tr][td][float=left][img=64,64]'+images[i].src+'[/img][/float][size=3][b]'+text[i].children[0].innerText+'[/b][/size]\n'+text[i].children[1].innerText+'[/td][/tr][/table]');
}
console.log(table.join('\n'))
```
上一版的无底色简化版

### 样式3 - 双列常规版
```javascript
var images = document.querySelectorAll("div.achieveImgHolder img")
var text = document.querySelectorAll("div.achieveTxt")
var table = []
for (var i = 0; i < images.length; i++) {
    table.push('[table=60%,#FFFFF0][tr][td=64][img=64,64]'+images[i].src+'[/img][/td][td][b][size=3][color=#000000]'+text[i].children[0].innerText+'[/color][/size][/b]\n[color=#000000]'+text[i].children[1].innerText+'[/color][/td][/tr][/table]');
}
console.log(table.join('\n'))
```
其实前面两版用的是单列表格的（图片左浮动），这个是常规的双列版

### 样式4 - 标题描述双格版
```javascript
var images = document.querySelectorAll("div.achieveImgHolder img")
var text = document.querySelectorAll("div.achieveTxt")
var table = []
for (var i = 0; i < images.length; i++) {
    table.push('[table=60%][tr][td=1,2,64][img=64,64]'+images[i].src+'[/img][/td][td][b][size=3]'+text[i].children[0].innerText+'[/size][/b][/td][/tr]\n[tr][td]'+text[i].children[1].innerText+'[/td][/tr][/table]');
}
console.log(table.join('\n'))
```
标题描述双格版

### 样式5 - 极简主义
```javascript
var images = document.querySelectorAll("div.achieveImgHolder img")
var text = document.querySelectorAll("div.achieveTxt")
var table = []
for (var i = 0; i < images.length; i++) {
    table.push('[img=64,64]'+images[i].src+'[/img]\n'+text[i].children[0].innerText+'\n'+text[i].children[1].innerText+'\n');
}
console.log(table.join('\n'))
```
极简主义

## Tips
- 建议在编辑代码时，勾选上右上角的"纯文本"
- 关闭纯文本时，是会显示表格样式的（但不完全准确，以实际发帖效果为准）
- 非"纯文本"时，直接粘贴过来时，是代码样式的，点两次"纯文本"可正常显示表格样式
- 自己DIY时，需要颜色相关的代码的话，还可以看Phonetic大佬的颜色贴

不想要两个成就表格之间有空隙的话，就把最后一行的`\n`删掉：
```javascript
console.log(table.join(''))
```
