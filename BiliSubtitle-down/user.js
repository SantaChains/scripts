// ==UserScript==
// @name         B站字幕下载器 Pro
// @namespace    https://github.com/...
// @version      2.0.0
// @description  下载B站视频字幕（JSON/SRT），支持多P和语言选择，可通过菜单重新显示面板
// @author       You
// @match        https://www.bilibili.com/video/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/SantaChains/scripts/main/BiliSubtitle-down/meta.js
// @downloadURL  https://raw.githubusercontent.com/SantaChains/scripts/main/BiliSubtitle-down/user.js
// @supportURL   https://github.com/SantaChains/scripts/issues
// ==/UserScript==

(function() {
    'use strict';

    let panel = null;              // 面板DOM元素
    let currentVideoTitle = '';
    let currentSubtitleGroups = [];
    let isPanelVisible = true;

    // ---------- 辅助函数 ----------
    function waitForInitialState() {
        return new Promise((resolve) => {
            if (window.__INITIAL_STATE__) return resolve(window.__INITIAL_STATE__);
            const observer = new MutationObserver(() => {
                if (window.__INITIAL_STATE__) {
                    observer.disconnect();
                    resolve(window.__INITIAL_STATE__);
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, 5000);
        });
    }

    function jsonToSrt(jsonData) {
        let srt = '';
        let idx = 1;
        for (const item of jsonData.body) {
            const from = item.from;
            const to = item.to;
            const formatTime = (sec) => {
                const h = Math.floor(sec / 3600);
                const m = Math.floor((sec % 3600) / 60);
                const s = Math.floor(sec % 60);
                const ms = Math.floor((sec % 1) * 1000);
                return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')},${ms.toString().padStart(3,'0')}`;
            };
            srt += `${idx}\n${formatTime(from)} --> ${formatTime(to)}\n${item.content}\n\n`;
            idx++;
        }
        return srt;
    }

    function downloadViaBlob(content, filename, mime = 'text/plain') {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function fetchSubtitle(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: (resp) => {
                    if (resp.status === 200) {
                        try {
                            resolve(JSON.parse(resp.responseText));
                        } catch(e) { reject(e); }
                    } else {
                        reject(new Error(`HTTP ${resp.status}`));
                    }
                },
                onerror: reject
            });
        });
    }

    async function loadSubtitleData() {
        const state = await waitForInitialState();
        if (!state?.videoData) return null;
        const video = state.videoData;
        const bvid = video.bvid;
        const title = video.title || 'B站视频';
        const pages = video.pages || [video];
        const groups = [];
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const partName = page.part || `P${i+1}`;
            const subtitles = page.subtitle?.subtitles || [];
            if (subtitles.length) {
                groups.push({
                    index: i,
                    partName,
                    subtitles: subtitles.map(sub => ({
                        lan: sub.lan,
                        url: 'https:' + sub.subtitle_url
                    }))
                });
            }
        }
        return { title, groups };
    }

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

    // ---------- 创建/更新面板 ----------
    function buildPanel() {
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'bili-sub-downloader';
            panel.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                background: ${C.glass};
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border-radius: ${C.radius};
                padding: 16px;
                box-shadow: ${C.shadow3};
                font-family: ${C.font};
                font-size: 13px;
                color: ${C.text};
                min-width: 280px;
                border: 1px solid ${C.glassBorder};
                transition: all 0.2s;
            `;
            document.body.appendChild(panel);
        }
        // 清空并重新填充内容
        panel.innerHTML = '';

        const header = document.createElement('div');
        header.style.cssText = `display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid ${C.glassBorder}; font-weight: 600; color: ${C.primary};`;
        header.innerHTML = `<span style="display:flex;align-items:center;gap:6px;"><span style="font-size:16px;">📥</span> 字幕下载器</span><span style="cursor:pointer;color:${C.textMuted};transition:color 0.15s;" id="close-panel-btn" onmouseover="this.style.color='${C.primary}'" onmouseout="this.style.color='${C.textMuted}'">✖</span>`;
        const closeBtn = header.querySelector('#close-panel-btn');
        closeBtn.onclick = () => {
            panel.style.display = 'none';
            isPanelVisible = false;
        };
        panel.appendChild(header);

        if (currentSubtitleGroups.length === 0) {
            const noSub = document.createElement('div');
            noSub.textContent = '⚠️ 当前视频无外部字幕';
            noSub.style.cssText = `color: ${C.cta}; text-align: center; padding: 16px 8px; background: ${C.surface}; border-radius: ${C.radiusSm};`;
            panel.appendChild(noSub);
        } else {
            const list = document.createElement('div');
            list.style.cssText = 'max-height: 320px; overflow-y: auto;';
            for (const g of currentSubtitleGroups) {
                const partDiv = document.createElement('div');
                partDiv.style.marginBottom = '14px';
                partDiv.style.borderBottom = `1px solid ${C.glassBorder}`;
                partDiv.style.paddingBottom = '10px';
                const partName = document.createElement('div');
                partName.textContent = `🎬 ${g.partName}`;
                partName.style.cssText = `font-weight: 600; margin-bottom: 8px; font-size: 13px; color: ${C.cta};`;
                partDiv.appendChild(partName);
                for (const sub of g.subtitles) {
                    const row = document.createElement('div');
                    row.style.cssText = 'margin: 8px 0; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;';
                    const langSpan = document.createElement('span');
                    langSpan.textContent = `🌐 ${sub.lan || '未知'}`;
                    langSpan.style.cssText = `background: ${C.surface}; padding: 4px 8px; border-radius: ${C.radiusSm}; font-size: 12px; color: ${C.text}; border: 1px solid ${C.glassBorder};`;
                    const btnJson = document.createElement('button');
                    btnJson.textContent = 'JSON';
                    btnJson.style.cssText = `background: ${C.grad}; border: 1px solid ${C.glassBorder}; color: ${C.text}; padding: 5px 12px; border-radius: ${C.radiusSm}; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.18s ease; font-family: ${C.font};`;
                    btnJson.onmouseenter = () => { btnJson.style.background = C.primary; btnJson.style.color = '#1a1b26'; };
                    btnJson.onmouseleave = () => { btnJson.style.background = C.grad; btnJson.style.color = C.text; };
                    const btnSrt = document.createElement('button');
                    btnSrt.textContent = 'SRT';
                    btnSrt.style.cssText = `background: ${C.grad}; border: 1px solid ${C.glassBorder}; color: ${C.text}; padding: 5px 12px; border-radius: ${C.radiusSm}; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.18s ease; font-family: ${C.font};`;
                    btnSrt.onmouseenter = () => { btnSrt.style.background = C.primaryHover; btnSrt.style.color = '#1a1b26'; };
                    btnSrt.onmouseleave = () => { btnSrt.style.background = C.grad; btnSrt.style.color = C.text; };
                    const downloadHandler = (type) => async () => {
                        const btn = (type === 'json') ? btnJson : btnSrt;
                        btn.disabled = true;
                        btn.textContent = '...';
                        try {
                            const json = await fetchSubtitle(sub.url);
                            if (type === 'json') {
                                downloadViaBlob(JSON.stringify(json, null, 2), `${currentVideoTitle}_${g.partName}_${sub.lan}.json`, 'application/json');
                            } else {
                                const srt = jsonToSrt(json);
                                downloadViaBlob(srt, `${currentVideoTitle}_${g.partName}_${sub.lan}.srt`, 'text/plain');
                            }
                        } catch (err) {
                            if (typeof GM_notification !== 'undefined') {
                                GM_notification({ text: `下载失败: ${err.message}`, timeout: 3000 });
                            } else {
                                alert('下载失败: ' + err.message);
                            }
                        } finally {
                            btn.disabled = false;
                            btn.textContent = (type === 'json') ? 'JSON' : 'SRT';
                        }
                    };
                    btnJson.onclick = downloadHandler('json');
                    btnSrt.onclick = downloadHandler('srt');
                    row.appendChild(langSpan);
                    row.appendChild(btnJson);
                    row.appendChild(btnSrt);
                    partDiv.appendChild(row);
                }
                list.appendChild(partDiv);
            }
            panel.appendChild(list);
        }
        // 添加重新显示按钮（如果当前关闭了，用户可通过菜单重新显示，但面板内部也保留一个脚注按钮？简单起见不加了）
        const footer = document.createElement('div');
        footer.style.cssText = `margin-top: 12px; font-size: 11px; color: ${C.textMuted}; text-align: center; border-top: 1px solid ${C.glassBorder}; padding-top: 10px;`;
        footer.innerHTML = '💡 若关闭面板，可从 <strong style="color:' + C.primary + ';">篡改猴菜单</strong> 重新打开';
        panel.appendChild(footer);
    }

    function showPanel() {
        if (!panel) return;
        panel.style.display = '';
        isPanelVisible = true;
    }

    async function refreshDataAndShow() {
        const data = await loadSubtitleData();
        if (data) {
            currentVideoTitle = data.title;
            currentSubtitleGroups = data.groups;
            buildPanel();
            if (!isPanelVisible) showPanel();
        } else {
            if (panel) panel.remove();
            panel = null;
            if (typeof GM_notification !== 'undefined') {
                GM_notification({ text: '未能获取字幕数据，请刷新重试', timeout: 3000 });
            }
        }
    }

    // ---------- 菜单命令 ----------
    GM_registerMenuCommand('📋 显示字幕下载面板', () => {
        if (!panel || !panel.isConnected) {
            refreshDataAndShow();
        } else if (!isPanelVisible) {
            showPanel();
        }
    });

    GM_registerMenuCommand('🔄 刷新字幕数据', () => {
        refreshDataAndShow();
    });

    // ---------- 启动 ----------
    async function init() {
        const data = await loadSubtitleData();
        if (data) {
            currentVideoTitle = data.title;
            currentSubtitleGroups = data.groups;
            buildPanel();
        } else {
            // 可能不是视频页或加载失败，不显示面板，但用户可通过菜单手动触发
            console.log('[B站字幕下载器] 未检测到视频字幕数据');
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
