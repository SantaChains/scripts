// ==UserScript==
// @name         Steam 成就 BBCode 生成器（多样式+单成就复制）
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  一键生成 Steam 成就列表的 BBCode，多种样式可选，支持自定义样式，支持全球成就和个人成就页面，还能复制单个成就的代码！
// @author       chrisevansbian & SantaChains
// @match        https://steamcommunity.com/stats/*/achievements*
// @match        https://steamcommunity.com/id/*/stats/*?tab=achievements*
// @match        https://steamcommunity.com/profiles/*/stats/*?tab=achievements*
// @grant        GM_setClipboard
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/SantaChains/scripts/main/SteamAchieveBBCode/meta.js
// @downloadURL  https://raw.githubusercontent.com/SantaChains/scripts/main/SteamAchieveBBCode/user.js
// @supportURL   https://github.com/SantaChains/scripts/issues
// ==/UserScript==

(function() {
    'use strict';

    // ─── 配色系统（Nerd Dark — Tokyo Night × Dracula）───
    const C = {
        grad: 'linear-gradient(135deg, #1a1b26 0%, #24283b 50%, #1a1b26 100%)',
        gradHover: 'linear-gradient(135deg, #24283b 0%, #2f3347 50%, #24283b 100%)',
        primary: '#9ece6a',
        primaryHover: '#73daca',
        cta: '#bb9af7',
        ctaHover: '#c0caf5',
        glass: 'rgba(26,27,38,0.92)',
        glassBorder: 'rgba(86,95,137,0.25)',
        glassDark: 'rgba(36,40,59,0.88)',
        surface: 'rgba(47,51,71,0.7)',
        bgHover: 'rgba(158,206,106,0.08)',
        bgActive: 'rgba(158,206,106,0.15)',
        text: '#c0caf5',
        textMuted: '#565f89',
        shadow1: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        shadow2: '0 4px 12px rgba(0,0,0,0.35), 0 2px 4px rgba(158,206,106,0.06)',
        shadow3: '0 12px 32px rgba(0,0,0,0.45), 0 4px 8px rgba(158,206,106,0.08)',
        shadow4: '0 24px 64px rgba(0,0,0,0.55), 0 8px 16px rgba(158,206,106,0.1)',
        radius: '12px',
        radiusSm: '8px',
        radiusFull: '9999px',
        font: '"JetBrains Mono","Fira Code","Cascadia Code",Consolas,"Courier New",monospace',
    };

    // 样式模板定义
    const styles = {
        1: {
            name: '样式1 - 深色背景版',
            description: '来自于Hazardosu大佬发的（置顶回复）',
            template: (img, title, desc) => `[table=65%,#111923][tr][td][float=left][img=64,64]${img}[/img][/float][size=3][color=#C6D4DF]${title}[/color][/size]\n[color=#8F98A0]${desc}[/color][/td][/tr][/table]`
        },
        2: {
            name: '样式2 - 无底色简化版',
            description: '上一版的无底色简化版',
            template: (img, title, desc) => `[table=65%][tr][td][float=left][img=64,64]${img}[/img][/float][size=3][b]${title}[/b][/size]\n${desc}[/td][/tr][/table]`
        },
        3: {
            name: '样式3 - 双列常规版',
            description: '其实前面两版用的是单列表格的（图片左浮动），这个是常规的双列版',
            template: (img, title, desc) => `[table=60%,#FFFFF0][tr][td=64][img=64,64]${img}[/img][/td][td][b][size=3][color=#000000]${title}[/color][/size][/b]\n[color=#000000]${desc}[/color][/td][/tr][/table]`
        },
        4: {
            name: '样式4 - 标题描述双格版',
            description: '标题描述双格版',
            template: (img, title, desc) => `[table=60%][tr][td=1,2,64][img=64,64]${img}[/img][/td][td][b][size=3]${title}[/size][/b][/td][/tr]\n[tr][td]${desc}[/td][/tr][/table]`
        },
        5: {
            name: '样式5 - 极简主义',
            description: '极简主义',
            template: (img, title, desc) => `[img=64,64]${img}[/img]\n${title}\n${desc}\n`
        }
    };

    let currentStyle = 1;
    let customStyleTemplate = "{img} {title} - {desc}";
    let joinSeparator = '\n';

    // 创建面板容器
    const panel = document.createElement("div");
    panel.id = "bbcode-panel";
    panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        background: ${C.glass};
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid ${C.glassBorder};
        border-radius: ${C.radius};
        padding: 16px;
        width: 300px;
        box-shadow: ${C.shadow3};
        font-family: ${C.font};
        color: ${C.text};
    `;

    // 面板标题
    const title = document.createElement("div");
    title.textContent = "🏆 BBCode 生成器";
    title.style.cssText = `
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        color: ${C.primary};
        border-bottom: 1px solid ${C.glassBorder};
        padding-bottom: 10px;
    `;
    panel.appendChild(title);

    // 样式选择区域
    const styleLabel = document.createElement("label");
    styleLabel.textContent = "选择样式：";
    styleLabel.style.cssText = `display: block; margin-bottom: 6px; font-size: 12px; color: ${C.textMuted};`;
    panel.appendChild(styleLabel);

    const styleSelect = document.createElement("select");
    styleSelect.style.cssText = `
        width: 100%;
        padding: 8px 12px;
        margin-bottom: 10px;
        background: ${C.surface};
        border: 1px solid ${C.glassBorder};
        border-radius: ${C.radiusSm};
        color: ${C.text};
        font-size: 13px;
        cursor: pointer;
        font-family: ${C.font};
        transition: border-color 0.18s;
    `;
    styleSelect.onfocus = () => { styleSelect.style.borderColor = C.primary; };
    styleSelect.onblur = () => { styleSelect.style.borderColor = C.glassBorder; };

    // 添加样式选项
    Object.keys(styles).forEach(key => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = styles[key].name;
        styleSelect.appendChild(option);
    });

    // 添加自定义选项
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = "自定义样式";
    styleSelect.appendChild(customOption);

    panel.appendChild(styleSelect);

    // 样式描述
    const styleDesc = document.createElement("div");
    styleDesc.id = "style-desc";
    styleDesc.style.cssText = `
        font-size: 11px;
        color: ${C.textMuted};
        margin-bottom: 12px;
        padding: 10px;
        background: ${C.surface};
        border-radius: ${C.radiusSm};
        line-height: 1.4;
        border: 1px solid ${C.glassBorder};
    `;
    styleDesc.textContent = styles[1].description;
    panel.appendChild(styleDesc);

    // 自定义样式输入区域
    const customArea = document.createElement("div");
    customArea.id = "custom-area";
    customArea.style.cssText = "display: none; margin-bottom: 12px;";

    const customLabel = document.createElement("label");
    customLabel.textContent = "自定义模板：";
    customLabel.style.cssText = `display: block; margin-bottom: 6px; font-size: 12px; color: ${C.textMuted};`;
    customArea.appendChild(customLabel);

    const customInput = document.createElement("textarea");
    customInput.value = customStyleTemplate;
    customInput.placeholder = "使用 {img} {title} {desc} 作为占位符";
    customInput.style.cssText = `
        width: 100%;
        height: 80px;
        padding: 10px;
        background: ${C.surface};
        border: 1px solid ${C.glassBorder};
        border-radius: ${C.radiusSm};
        color: ${C.text};
        font-size: 12px;
        font-family: ${C.font};
        resize: vertical;
        box-sizing: border-box;
        transition: border-color 0.18s;
    `;
    customInput.onfocus = () => { customInput.style.borderColor = C.primary; };
    customInput.onblur = () => { customInput.style.borderColor = C.glassBorder; };
    customArea.appendChild(customInput);

    // 占位符提示
    const placeholderTip = document.createElement("div");
    placeholderTip.textContent = "可用占位符: {img} {title} {desc}";
    placeholderTip.style.cssText = `font-size: 10px; color: ${C.textMuted}; margin-top: 6px;`;
    customArea.appendChild(placeholderTip);

    panel.appendChild(customArea);

    // 分隔符选项
    const separatorArea = document.createElement("div");
    separatorArea.style.cssText = "margin-bottom: 12px;";

    const separatorLabel = document.createElement("label");
    separatorLabel.style.cssText = "display: flex; align-items: center; cursor: pointer; font-size: 12px;";

    const separatorCheckbox = document.createElement("input");
    separatorCheckbox.type = "checkbox";
    separatorCheckbox.checked = true;
    separatorCheckbox.style.cssText = `margin-right: 8px; accent-color: ${C.primary}; cursor: pointer;`;

    const separatorText = document.createElement("span");
    separatorText.textContent = "成就之间添加空行";
    separatorText.style.cssText = `color: ${C.textMuted};`;

    separatorLabel.appendChild(separatorCheckbox);
    separatorLabel.appendChild(separatorText);
    separatorArea.appendChild(separatorLabel);
    panel.appendChild(separatorArea);

    // 按钮区域
    const buttonArea = document.createElement("div");
    buttonArea.style.cssText = "display: flex; gap: 8px;";

    // 复制全部按钮
    const copyAllBtn = document.createElement("button");
    copyAllBtn.textContent = "📋 复制全部";
    copyAllBtn.style.cssText = `
        flex: 1;
        padding: 10px;
        background: ${C.grad};
        border: 1px solid ${C.glassBorder};
        border-radius: ${C.radiusSm};
        color: ${C.text};
        font-weight: 600;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.18s ease;
        font-family: ${C.font};
    `;
    copyAllBtn.onmouseenter = () => { copyAllBtn.style.background = C.primary; copyAllBtn.style.color = '#1a1b26'; };
    copyAllBtn.onmouseleave = () => { copyAllBtn.style.background = C.grad; copyAllBtn.style.color = C.text; };
    buttonArea.appendChild(copyAllBtn);

    // 折叠按钮
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "−";
    toggleBtn.title = "折叠/展开面板";
    toggleBtn.style.cssText = `
        width: 36px;
        padding: 10px;
        background: ${C.surface};
        border: 1px solid ${C.glassBorder};
        border-radius: ${C.radiusSm};
        color: ${C.text};
        font-weight: 600;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.18s ease;
        font-family: ${C.font};
    `;
    toggleBtn.onmouseenter = () => { toggleBtn.style.background = C.glassDark; toggleBtn.style.borderColor = C.primary; };
    toggleBtn.onmouseleave = () => { toggleBtn.style.background = C.surface; toggleBtn.style.borderColor = C.glassBorder; };
    buttonArea.appendChild(toggleBtn);

    panel.appendChild(buttonArea);

    // 状态提示
    const statusTip = document.createElement("div");
    statusTip.id = "status-tip";
    statusTip.style.cssText = `
        margin-top: 12px;
        padding: 10px;
        background: ${C.bgActive};
        border-radius: ${C.radiusSm};
        font-size: 11px;
        color: ${C.primary};
        text-align: center;
        display: none;
        border: 1px solid ${C.glassBorder};
    `;
    panel.appendChild(statusTip);

    document.body.appendChild(panel);

    // 折叠功能
    let isCollapsed = false;
    const contentElements = [styleLabel, styleSelect, styleDesc, customArea, separatorArea, buttonArea, statusTip];

    toggleBtn.addEventListener("click", () => {
        isCollapsed = !isCollapsed;
        contentElements.forEach(el => {
            el.style.display = isCollapsed ? "none" : (el.id === "custom-area" && currentStyle !== "custom" ? "none" : "block");
        });
        toggleBtn.textContent = isCollapsed ? "+" : "−";
        panel.style.width = isCollapsed ? "auto" : "280px";
        title.style.display = "block";
    });

    // 样式切换事件
    styleSelect.addEventListener("change", () => {
        const value = styleSelect.value;
        currentStyle = value === "custom" ? "custom" : parseInt(value);

        if (value === "custom") {
            customArea.style.display = "block";
            styleDesc.textContent = "使用自定义模板格式";
        } else {
            customArea.style.display = "none";
            styleDesc.textContent = styles[value].description;
        }
    });

    // 分隔符切换
    separatorCheckbox.addEventListener("change", () => {
        joinSeparator = separatorCheckbox.checked ? '\n' : '';
    });

    // 显示状态提示
    function showStatus(message, duration = 2000) {
        statusTip.textContent = message;
        statusTip.style.display = "block";
        setTimeout(() => {
            statusTip.style.display = "none";
        }, duration);
    }

    // 获取BBCode生成函数
    function getBBCodeGenerator() {
        if (currentStyle === "custom") {
            const template = customInput.value;
            return (img, title, desc) => template.replace(/{img}/g, img).replace(/{title}/g, title).replace(/{desc}/g, desc);
        } else {
            return styles[currentStyle].template;
        }
    }

    // 复制全部成就
    copyAllBtn.addEventListener("click", () => {
        const images = document.querySelectorAll("div.achieveImgHolder img");
        const text = document.querySelectorAll("div.achieveTxt");

        if (images.length === 0) {
            showStatus("⚠️ 未找到成就数据");
            return;
        }

        const generator = getBBCodeGenerator();
        const results = [];

        for (let i = 0; i < images.length; i++) {
            const img = images[i].src;
            const titleText = text[i].children[0]?.innerText || "";
            const descText = text[i].children[1]?.innerText || "";
            results.push(generator(img, titleText, descText));
        }

        GM_setClipboard(results.join(joinSeparator));
        showStatus(`✅ 已复制 ${results.length} 个成就的 BBCode！`);
    });

    // 给每个成就添加复制按钮
    function addIndividualButtons() {
        const achievements = document.querySelectorAll(".achieveRow");

        achievements.forEach((achieve) => {
            // 避免重复添加
            if (achieve.querySelector(".bbcode-copy-btn")) return;

            const copyBtn = document.createElement("button");
            copyBtn.className = "bbcode-copy-btn";
            copyBtn.textContent = "📋 复制";
            copyBtn.title = "复制此成就的 BBCode";
            copyBtn.style.cssText = `
                margin-left: 10px;
                padding: 4px 10px;
                background: ${C.surface};
                border: 1px solid ${C.glassBorder};
                border-radius: ${C.radiusSm};
                color: ${C.primary};
                font-size: 11px;
                cursor: pointer;
                transition: all 0.18s ease;
                font-family: ${C.font};
            `;
            copyBtn.onmouseenter = () => {
                copyBtn.style.background = C.primary;
                copyBtn.style.color = '#1a1b26';
            };
            copyBtn.onmouseleave = () => {
                copyBtn.style.background = C.surface;
                copyBtn.style.color = C.primary;
            };

            const achieveTxt = achieve.querySelector(".achieveTxt");
            if (achieveTxt) {
                achieveTxt.appendChild(copyBtn);
            }

            copyBtn.addEventListener("click", (e) => {
                e.stopPropagation();

                const img = achieve.querySelector(".achieveImgHolder img")?.src || "";
                const titleText = achieve.querySelector(".achieveTxt")?.children[0]?.innerText || "";
                const descText = achieve.querySelector(".achieveTxt")?.children[1]?.innerText || "";

                const generator = getBBCodeGenerator();
                const code = generator(img, titleText, descText);

                GM_setClipboard(code);

                // 临时改变按钮文字
                const originalText = copyBtn.textContent;
                copyBtn.textContent = "✓ 已复制";
                copyBtn.style.background = C.primaryHover;
                copyBtn.style.color = '#1a1b26';

                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = C.surface;
                    copyBtn.style.color = C.primary;
                }, 1500);
            });
        });
    }

    // 初始添加按钮
    addIndividualButtons();

    // 监听页面变化（处理动态加载）
    const observer = new MutationObserver(() => {
        addIndividualButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log("[BBCode生成器] 脚本已加载，找到 " + document.querySelectorAll(".achieveRow").length + " 个成就");
})();
