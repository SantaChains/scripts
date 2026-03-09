// ==UserScript==
// @name         搜索引擎一键跳转
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  在搜索结果页面添加其他搜索引擎的快捷跳转按钮，支持自定义搜索引擎
// @author       Punkjet & SantaChains
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 预设标记
    const punkDeafultMark = "Google-Github-Steam-Bing-MitaAI-GoogleScholar-Searx-Bilibili-Zhihu-Weibo-Douban-Quark-Sougou-SougouWeixin-360ai-wallpaper";
    const punkInternationalMark = "GooglePatents-Bing-Yahoo-Yandex-DuckDuckGo-YouTube-Wikipedia-Instagram-Qwant-Tiktok";
    const punkImageMark = "SougouImage-Google-YandexImage-wallpaper-Pixabay-Pexels";
    const punkWallpaperMark = "wallpaper-Pixabay-Pexels-WallpaperEngine";
    const punkAllSearchMark = "Baidu-Bing-360-Quark-Toutiao-Weibo-Zhihu-Douban-MitaAI-Sougou-wallpaper-Pixabay-Pexels-WallpaperEngine-SougouWeixin-Steam-Github-Google-GoogleScholar-SougouImage-SougouXiaohongshu-GooglePatents-Yahoo-Yandex-DuckDuckGo-Swisscows-MetaGer-Searx-Qwant-Ecosia-WolframAlpha-Perplexity-Kagi-Claude-Perplexity-Pro-ChatGPT-Sage-Naver-Daum-Goo-Startpage-Fsou-Ask-AOL-QwantLite-Brave-YouTube-Wikipedia-Instagram-Tiktok-360ai-YandexImage";

    // 搜索引擎配置
    const searchEngines = [
        // 国内搜索引擎
        {name: "百度", searchUrl: "https://www.baidu.com/s?wd=", searchkeyName: ["wd"], matchUrl:/baidu\.com\/s.*?wd=/g, mark:"Baidu"},
        {name: "必应", searchUrl: "https://www.bing.com/search?q=", searchkeyName: ["q"], matchUrl:/bing\.com\/search.*?q=/g, mark:"Bing"},
        {name: "360搜索", searchUrl: "https://www.so.com/s?q=", searchkeyName: ["q"], matchUrl:/so\.com\/s.*?q=/g, mark:"360"},
        {name: "夸克", searchUrl: "https://quark.sm.cn/s?q=", searchkeyName: ["q"], matchUrl:/quark\.sm\.cn\/s.*?q=/g, mark:"Quark"},
        {name: "头条搜索", searchUrl: "https://so.toutiao.com/search?keyword=", searchkeyName: ["keyword"], matchUrl:/so\.toutiao\.com\/search.*?keyword=/g, mark:"Toutiao"},
        {name: "微博", searchUrl: "https://s.weibo.com/weibo?q=", searchkeyName: ["q"], matchUrl:/s\.weibo\.com\/weibo.*?q=/g, mark:"Weibo"},
        {name: "知乎", searchUrl: "https://www.zhihu.com/search?type=content&q=", searchkeyName: ["q"], matchUrl:/zhihu\.com\/search.*?q=/g, mark:"Zhihu"},
        {name: "豆瓣", searchUrl: "https://www.douban.com/search?q=", searchkeyName: ["q"], matchUrl:/douban\.com\/search.*?q=/g, mark:"Douban"},
        {name: "MitaAI", searchUrl: "https://www.mitaai.com/search?q=", searchkeyName: ["q"], matchUrl:/mitaai\.com\/search.*?q=/g, mark:"MitaAI"},
        {name: "搜狗", searchUrl: "https://www.sogou.com/web?query=", searchkeyName: ["query"], matchUrl:/sogou\.com\/web.*?query=/g, mark:"Sougou"},
        {name: "搜狗微信", searchUrl: "https://weixin.sogou.com/weixin?type=2&query=", searchkeyName: ["query"], matchUrl:/weixin\.sogou\.com\/weixin.*?query=/g, mark:"SougouWeixin"},
        {name: "360AI", searchUrl: "https://www.360.com/search?q=", searchkeyName: ["q"], matchUrl:/360\.com\/search.*?q=/g, mark:"360ai"},

        // 壁纸搜索引擎
        {name: "Unsplash", searchUrl: "https://unsplash.com/s/photos/", searchkeyName: ["q"], matchUrl:/unsplash\.com\/s\/photos\//g, mark:"wallpaper"},
        {name: "Pixabay", searchUrl: "https://pixabay.com/zh/images/search/", searchkeyName: ["q"], matchUrl:/pixabay\.com\/zh\/images\/search\//g, mark:"Pixabay"},
        {name: "Wallpaper Engine", searchUrl: "https://steamcommunity.com/workshop/browse/?appid=431960&searchtext=", searchkeyName: ["searchtext"], matchUrl:/steamcommunity\.com\/workshop\/browse.*?searchtext=/g, mark:"WallpaperEngine"},
        {name: "Pexels", searchUrl: "https://www.pexels.com/search/", searchkeyName: ["query"], matchUrl:/pexels\.com\/search\//g, mark:"Pexels"},

        // 国际搜索引擎
        {name: "Steam", searchUrl: "https://store.steampowered.com/search/?term=", searchkeyName: ["term"], matchUrl:/store\.steampowered\.com\/search.*?term=/g, mark:"Steam"},
        {name: "Github", searchUrl: "https://github.com/search?q=", searchkeyName: ["q"], matchUrl:/github\.com\/search.*?q=/g, mark:"Github"},
        {name: "Google", searchUrl: "https://www.google.com/search?q=", searchkeyName: ["q"], matchUrl:/google\.com\/search.*?q=/g, mark:"Google"},
        {name: "Google学术", searchUrl: "https://scholar.google.com/scholar?q=", searchkeyName: ["q"], matchUrl:/scholar\.google\.com\/scholar.*?q=/g, mark:"GoogleScholar"},
        {name: "搜狗图片", searchUrl: "https://pic.sogou.com/pics?query=", searchkeyName: ["query"], matchUrl:/pic\.sogou\.com\/pics.*?query=/g, mark:"SougouImage"},
        {name: "搜狗小红书", searchUrl: "https://xiaohongshu.sogou.com/search?query=", searchkeyName: ["query"], matchUrl:/xiaohongshu\.sogou\.com\/search.*?query=/g, mark:"SougouXiaohongshu"},
        {name: "Google专利", searchUrl: "https://patents.google.com/?q=", searchkeyName: ["q"], matchUrl:/patents\.google\.com\/.*?q=/g, mark:"GooglePatents"},
        {name: "Yahoo", searchUrl: "https://search.yahoo.com/search?p=", searchkeyName: ["p"], matchUrl:/search\.yahoo\.com\/search.*?p=/g, mark:"Yahoo"},
        {name: "Yandex", searchUrl: "https://yandex.com/search/?text=", searchkeyName: ["text"], matchUrl:/yandex\.com\/search.*?text=/g, mark:"Yandex"},
        {name: "DuckDuckGo", searchUrl: "https://duckduckgo.com/?q=", searchkeyName: ["q"], matchUrl:/duckduckgo\.com\/.*?q=/g, mark:"DuckDuckGo"},
        {name: "Swisscows", searchUrl: "https://swisscows.com/web?query=", searchkeyName: ["query"], matchUrl:/swisscows\.com\/web.*?query=/g, mark:"Swisscows"},
        {name: "MetaGer", searchUrl: "https://metager.org/meta/meta.ger3?eingabe=", searchkeyName: ["eingabe"], matchUrl:/metager\.org\/meta\/meta\.ger3.*?eingabe=/g, mark:"MetaGer"},
        {name: "Searx", searchUrl: "https://searx.org/?q=", searchkeyName: ["q"], matchUrl:/searx\.org\/.*?q=/g, mark:"Searx"},
        {name: "Qwant", searchUrl: "https://www.qwant.com/?q=", searchkeyName: ["q"], matchUrl:/qwant\.com\/.*?q=/g, mark:"Qwant"},
        {name: "Ecosia", searchUrl: "https://www.ecosia.org/search?q=", searchkeyName: ["q"], matchUrl:/ecosia\.org\/search.*?q=/g, mark:"Ecosia"},
        {name: "WolframAlpha", searchUrl: "https://www.wolframalpha.com/input/?i=", searchkeyName: ["i"], matchUrl:/wolframalpha\.com\/input.*?i=/g, mark:"WolframAlpha"},
        {name: "Perplexity", searchUrl: "https://www.perplexity.ai/search?q=", searchkeyName: ["q"], matchUrl:/perplexity\.ai\/search.*?q=/g, mark:"Perplexity"},
        {name: "Kagi", searchUrl: "https://kagi.com/search?q=", searchkeyName: ["q"], matchUrl:/kagi\.com\/search.*?q=/g, mark:"Kagi"},
        {name: "Claude", searchUrl: "https://claude.ai/chat?q=", searchkeyName: ["q"], matchUrl:/claude\.ai\/chat.*?q=/g, mark:"Claude"},
        {name: "Perplexity Pro", searchUrl: "https://pro.perplexity.ai/search?q=", searchkeyName: ["q"], matchUrl:/pro\.perplexity\.ai\/search.*?q=/g, mark:"Perplexity-Pro"},
        {name: "ChatGPT", searchUrl: "https://chat.openai.com/?q=", searchkeyName: ["q"], matchUrl:/chat\.openai\.com\/.*?q=/g, mark:"ChatGPT"},
        {name: "Sage", searchUrl: "https://poe.com/Sage?q=", searchkeyName: ["q"], matchUrl:/poe\.com\/Sage.*?q=/g, mark:"Sage"},
        {name: "Naver", searchUrl: "https://search.naver.com/search.naver?query=", searchkeyName: ["query"], matchUrl:/search\.naver\.com\/search\.naver.*?query=/g, mark:"Naver"},
        {name: "Daum", searchUrl: "https://search.daum.net/search?q=", searchkeyName: ["q"], matchUrl:/search\.daum\.net\/search.*?q=/g, mark:"Daum"},
        {name: "Goo", searchUrl: "https://search.goo.ne.jp/web.jsp?MT=", searchkeyName: ["MT"], matchUrl:/search\.goo\.ne\.jp\/web\.jsp.*?MT=/g, mark:"Goo"},
        {name: "Startpage", searchUrl: "https://www.startpage.com/sp/search?query=", searchkeyName: ["query"], matchUrl:/startpage\.com\/sp\/search.*?query=/g, mark:"Startpage"},
        {name: "Fsou", searchUrl: "https://fsou.cc/search?q=", searchkeyName: ["q"], matchUrl:/fsou\.cc\/search.*?q=/g, mark:"Fsou"},
        {name: "Ask", searchUrl: "https://www.ask.com/web?q=", searchkeyName: ["q"], matchUrl:/ask\.com\/web.*?q=/g, mark:"Ask"},
        {name: "AOL", searchUrl: "https://search.aol.com/aol/search?q=", searchkeyName: ["q"], matchUrl:/search\.aol\.com\/aol\/search.*?q=/g, mark:"AOL"},
        {name: "QwantLite", searchUrl: "https://lite.qwant.com/?q=", searchkeyName: ["q"], matchUrl:/lite\.qwant\.com\/.*?q=/g, mark:"QwantLite"},
        {name: "Brave", searchUrl: "https://search.brave.com/search?q=", searchkeyName: ["q"], matchUrl:/search\.brave\.com\/search.*?q=/g, mark:"Brave"},
        {name: "YouTube", searchUrl: "https://www.youtube.com/results?search_query=", searchkeyName: ["search_query"], matchUrl:/youtube\.com\/results.*?search_query=/g, mark:"YouTube"},
        {name: "Wikipedia", searchUrl: "https://en.wikipedia.org/wiki/Special:Search?search=", searchkeyName: ["search"], matchUrl:/en\.wikipedia\.org\/wiki\/Special:Search.*?search=/g, mark:"Wikipedia"},
        {name: "Instagram", searchUrl: "https://www.instagram.com/explore/tags/", searchkeyName: [], matchUrl:/instagram\.com\/explore\/tags\//g, mark:"Instagram"},
        {name: "Tiktok", searchUrl: "https://www.tiktok.com/search?q=", searchkeyName: ["q"], matchUrl:/tiktok\.com\/search.*?q=/g, mark:"Tiktok"},
        {name: "Yandex图片", searchUrl: "https://yandex.com/images/search?text=", searchkeyName: ["text"], matchUrl:/yandex\.com\/images\/search.*?text=/g, mark:"YandexImage"},
        {name: "Bilibili", searchUrl: "https://search.bilibili.com/all?keyword=", searchkeyName: ["keyword"], matchUrl:/search\.bilibili\.com\/all.*?keyword=/g, mark:"Bilibili"}
    ];

    // 快捷搜索配置
    const quickSearchConfig = [
        {
            tabName:"综合",
            tabList:[
                {name: "百度", searchUrl: "https://www.baidu.com/s?wd="},
                {name: "谷歌", searchUrl: "https://www.google.com/search?q="},
                {name: "必应", searchUrl: "https://www.bing.com/search?q="},
                {name: "360搜索", searchUrl: "https://www.so.com/s?q="},
                {name: "搜狗", searchUrl: "https://www.sogou.com/web?query="},
                {name: "夸克", searchUrl: "https://quark.sm.cn/s?q="},
                {name: "头条搜索", searchUrl: "https://so.toutiao.com/search?keyword="},
            ],
        },
        {
            tabName:"学术",
            tabList:[
                {name: "谷歌学术", searchUrl: "https://scholar.google.com/scholar?q="},
                {name: "百度学术", searchUrl: "https://xueshu.baidu.com/s?wd="},
                {name: "知网", searchUrl: "https://kns.cnki.net/kns8/DefaultResult/Index?dbcode=SCDB&kw="},
                {name: "万方", searchUrl: "https://s.wanfangdata.com.cn/paper?q="},
                {name: "维普", searchUrl: "http://www.cqvip.com/main/search.aspx?k="},
                {name: "arXiv", searchUrl: "https://arxiv.org/search/?query="},
                {name: "PubMed", searchUrl: "https://pubmed.ncbi.nlm.nih.gov/?term="},
            ],
        },
        {
            tabName:"社交",
            tabList:[
                {name: "微博", searchUrl: "https://s.weibo.com/weibo?q="},
                {name: "知乎", searchUrl: "https://www.zhihu.com/search?type=content&q="},
                {name: "豆瓣", searchUrl: "https://www.douban.com/search?q="},
                {name: "小红书", searchUrl: "https://www.xiaohongshu.com/search_result?keyword="},
                {name: "抖音", searchUrl: "https://www.douyin.com/search/"},
                {name: "B站", searchUrl: "https://search.bilibili.com/all?keyword="},
                {name: "贴吧", searchUrl: "https://tieba.baidu.com/f/search/res?ie=utf-8&kw="},
            ],
        },
        {
            tabName:"图片",
            tabList:[
                {name: "谷歌搜图", searchUrl: "https://www.google.com.hk/search?tbm=isch&q="},
                {name: "必应搜图", searchUrl: "https://www.bing.com/images/search?q="},
                {name: "Flickr", searchUrl: "http://www.flickr.com/search/?q="},
                {name: "Pinterest", searchUrl: "https://www.pinterest.com/search/pins/?q="},
                {name: "Pixabay", searchUrl: "https://pixabay.com/zh/images/search/"},
                {name: "花瓣", searchUrl: "https://huaban.com/search/?q="},
                {name: "Unsplash", searchUrl: "https://unsplash.com/s/photos/"},
                {name: "Pexels", searchUrl: "https://www.pexels.com/search/"},
            ],
        },
        {
            tabName:"壁纸",
            tabList:[
                {name: "Unsplash", searchUrl: "https://unsplash.com/s/photos/"},
                {name: "Pixabay", searchUrl: "https://pixabay.com/zh/images/search/"},
                {name: "Pexels", searchUrl: "https://www.pexels.com/search/"},
                {name: "Wallpaper Engine", searchUrl: "https://steamcommunity.com/workshop/browse/?appid=431960&searchtext="},
                {name: "WallpaperHub", searchUrl: "https://wallpaperhub.app/search?q="},
                {name: "WallpaperAccess", searchUrl: "https://wallpaperaccess.com/search?q="},
            ],
        },
        {
            tabName:"视频",
            tabList:[
                {name: "YouTube", searchUrl: "https://www.youtube.com/results?search_query="},
                {name: "B站", searchUrl: "https://search.bilibili.com/all?keyword="},
                {name: "爱奇艺", searchUrl: "https://so.iqiyi.com/so/q_"},
                {name: "腾讯视频", searchUrl: "https://v.qq.com/x/search/?q="},
                {name: "优酷", searchUrl: "https://so.youku.com/search_video/q_"},
                {name: "抖音", searchUrl: "https://www.douyin.com/search/"},
                {name: "快手", searchUrl: "https://www.kuaishou.com/search/video?searchKey="},
            ],
        },
        {
            tabName:"购物",
            tabList:[
                {name: "淘宝", searchUrl: "https://s.taobao.com/search?q="},
                {name: "京东", searchUrl: "https://search.jd.com/Search?keyword="},
                {name: "天猫", searchUrl: "https://list.tmall.com/search_product.htm?q="},
                {name: "拼多多", searchUrl: "https://mobile.yangkeduo.com/search_result.html?search_key="},
                {name: "苏宁", searchUrl: "https://search.suning.com/"},
                {name: "亚马逊", searchUrl: "https://www.amazon.cn/s?k="},
                {name: "1688", searchUrl: "https://s.1688.com/selloffer/offer_search.htm?keywords="},
            ],
        },
        {
            tabName:"开发",
            tabList:[
                {name: "GitHub", searchUrl: "https://github.com/search?q="},
                {name: "Stack Overflow", searchUrl: "https://stackoverflow.com/search?q="},
                {name: "MDN", searchUrl: "https://developer.mozilla.org/zh-CN/search?q="},
                {name: "CSDN", searchUrl: "https://so.csdn.net/so/search?q="},
                {name: "博客园", searchUrl: "https://zzk.cnblogs.com/s?w="},
                {name: "掘金", searchUrl: "https://juejin.cn/search?query="},
                {name: "GitLab", searchUrl: "https://gitlab.com/search?search="},
            ],
        }
    ];

    // 获取当前页面的搜索关键词
    function getSearchKeyword() {
        const url = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);

        // 尝试从URL参数中获取搜索关键词
        const commonParams = ['q', 'wd', 'query', 'keyword', 'search', 'term', 'kw', 'text', 'eingabe', 'p', 'MT', 'search_query', 'searchtext'];

        for (let param of commonParams) {
            if (urlParams.has(param)) {
                return decodeURIComponent(urlParams.get(param));
            }
        }

        // 特殊处理某些网站
        if (url.includes('instagram.com/explore/tags/')) {
            const match = url.match(/\/explore\/tags\/([^\/\?]+)/);
            return match ? decodeURIComponent(match[1]) : '';
        }

        return '';
    }

    // 检查是否为搜索页面
    function isSearchPage() {
        const keyword = getSearchKeyword();
        if (!keyword) return false;

        // 检查是否匹配任何搜索引擎
        for (let engine of searchEngines) {
            if (engine.matchUrl && engine.matchUrl.test(window.location.href)) {
                return true;
            }
        }

        return false;
    }

    // 创建搜索引擎跳转按钮 - 简洁隐藏式设计
    function createSearchButtons() {
        if (!isSearchPage()) return;

        const keyword = getSearchKeyword();
        if (!keyword) return;

        const enabledEngines = GM_getValue("punk_setup_search", punkDeafultMark).split("-");
        const currentUrl = window.location.href;

        // 获取保存的位置和展开状态
        const savedPosition = GM_getValue("punk_search_position", {x: 10, y: 10});
        const isExpanded = GM_getValue("punk_search_expanded", false);

        // 创建主容器
        const container = document.createElement('div');
        container.id = 'punk-search-app-box';
        container.style.cssText = `
            position: fixed;
            top: ${savedPosition.y}px;
            left: ${savedPosition.x}px;
            z-index: 9999999;
            font-family: Arial, sans-serif;
        `;

        // 创建切换按钮 - 紫蓝渐变设计
        const toggleButton = document.createElement('button');
        toggleButton.id = 'punk-search-toggle';
        toggleButton.textContent = '⭐';
        toggleButton.style.cssText = `
            padding: 8px 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
            transition: all 0.2s ease;
        `;

        // 创建搜索引擎面板 - 紫蓝主题设计
        const searchPanel = document.createElement('div');
        searchPanel.id = 'punk-search-panel';
        searchPanel.style.cssText = `
            position: absolute;
            top: 38px;
            left: 0;
            background: white;
            border: 1px solid #E0E7FF;
            border-radius: 10px;
            padding: 12px;
            box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            min-width: 320px;
            max-width: 90vw;
            display: ${isExpanded ? 'block' : 'none'};
        `;

        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-bottom: 8px;
        `;

        // 添加搜索引擎按钮 - 紫蓝主题
        searchEngines.forEach(engine => {
            if (enabledEngines.includes(engine.mark)) {
                const isCurrent = engine.matchUrl && engine.matchUrl.test(currentUrl);

                const button = document.createElement('a');
                button.href = engine.searchUrl + encodeURIComponent(keyword);
                button.target = '_blank';
                button.textContent = engine.name;
                button.style.cssText = `
                    display: inline-block;
                    padding: 5px 10px;
                    margin: 2px;
                    background: ${isCurrent ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#F5F3FF'};
                    color: ${isCurrent ? 'white' : '#5B21B6'};
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 500;
                    white-space: nowrap;
                    transition: all 0.15s ease;
                    cursor: pointer;
                    box-shadow: ${isCurrent ? '0 2px 6px rgba(102, 126, 234, 0.3)' : 'none'};
                `;

                if (!isCurrent) {
                    button.addEventListener('mouseenter', () => {
                        button.style.background = '#EDE9FE';
                        button.style.color = '#7C3AED';
                    });
                    button.addEventListener('mouseleave', () => {
                        button.style.background = '#F5F3FF';
                        button.style.color = '#5B21B6';
                    });
                }

                buttonContainer.appendChild(button);
            }
        });

        // 添加设置按钮到按钮容器中（与搜索引擎按钮同排）- 紫蓝主题
        const settingsButton = document.createElement('button');
        settingsButton.textContent = '⚙️';
        settingsButton.title = '设置';
        settingsButton.style.cssText = `
            padding: 5px 8px;
            margin: 2px;
            background: #8B5CF6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            transition: all 0.15s ease;
        `;
        settingsButton.addEventListener('mouseenter', () => {
            settingsButton.style.background = '#7C3AED';
        });
        settingsButton.addEventListener('mouseleave', () => {
            settingsButton.style.background = '#8B5CF6';
        });
        settingsButton.addEventListener('click', () => {
            showQuickSearch();
            // 切换到设置标签
            setTimeout(() => {
                const tabs = document.querySelectorAll('#punk-quick-search button');
                tabs.forEach(tab => {
                    if (tab.textContent.includes('设置')) {
                        tab.click();
                    }
                });
            }, 100);
        });
        buttonContainer.appendChild(settingsButton);

        searchPanel.appendChild(buttonContainer);
        container.appendChild(toggleButton);
        container.appendChild(searchPanel);

        // 切换显示/隐藏
        let isExpanded_state = isExpanded;
        toggleButton.addEventListener('click', () => {
            isExpanded_state = !isExpanded_state;
            searchPanel.style.display = isExpanded_state ? 'block' : 'none';
            GM_setValue("punk_search_expanded", isExpanded_state);
        });

        // 悬停效果
        toggleButton.addEventListener('mouseenter', () => {
            toggleButton.style.transform = 'scale(1.05)';
            toggleButton.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.45)';
        });

        toggleButton.addEventListener('mouseleave', () => {
            toggleButton.style.transform = 'scale(1)';
            toggleButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.35)';
        });

        // 拖拽功能
        let isDragging = false;
        let dragOffset = {x: 0, y: 0};

        toggleButton.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragOffset.x = e.clientX - container.offsetLeft;
            dragOffset.y = e.clientY - container.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const x = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
            const y = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y));

            container.style.left = x + 'px';
            container.style.top = y + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                // 保存位置
                GM_setValue("punk_search_position", {
                    x: parseInt(container.style.left),
                    y: parseInt(container.style.top)
                });
            }
        });

        // 点击外部收起面板
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && isExpanded_state) {
                isExpanded_state = false;
                searchPanel.style.display = 'none';
                GM_setValue("punk_search_expanded", false);
            }
        });

        document.body.appendChild(container);
    }

    // 创建快捷搜索功能
    function createQuickSearch() {
        // 检查是否已存在或者是搜索页面（搜索页面不显示快捷搜索）
        if (document.getElementById('punk-quick-search') || isSearchPage()) return;

        // 获取保存的位置 - 统一使用left和bottom值
        const savedPos = GM_getValue("punk_quick_search_position", {left: 20, bottom: 80});

        // 创建触发按钮 - 紫蓝渐变设计
        const triggerButton = document.createElement('div');
        triggerButton.id = 'punk-quick-search-trigger';
        triggerButton.textContent = '🪐';
        triggerButton.style.cssText = `
            position: fixed;
            bottom: ${savedPos.bottom}px;
            left: ${savedPos.left}px;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: move;
            z-index: 9999998;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            font-size: 20px;
            transition: all 0.2s ease;
        `;

        // 拖动和点击功能
        let isDragging = false;
        let hasDragged = false;
        let dragStartTime = 0;
        let startX, startY, startLeft, startBottom;

        triggerButton.addEventListener('mousedown', (e) => {
            isDragging = true;
            hasDragged = false;
            dragStartTime = Date.now();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(triggerButton.style.left) || 20;
            startBottom = parseInt(triggerButton.style.bottom) || 80;
            triggerButton.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // 如果移动距离超过5px，认为是拖动
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                hasDragged = true;
            }

            const newLeft = startLeft + deltaX;
            const newBottom = startBottom - deltaY;

            // 边界检查
            const maxLeft = window.innerWidth - 50;
            const maxBottom = window.innerHeight - 50;

            const finalLeft = Math.max(0, Math.min(newLeft, maxLeft));
            const finalBottom = Math.max(0, Math.min(newBottom, maxBottom));

            triggerButton.style.left = finalLeft + 'px';
            triggerButton.style.bottom = finalBottom + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                triggerButton.style.cursor = 'move';

                // 保存位置
                GM_setValue("punk_quick_search_position", {
                    left: parseInt(triggerButton.style.left),
                    bottom: parseInt(triggerButton.style.bottom)
                });

                // 如果拖动了，打开星际搜索界面
                if (hasDragged) {
                    showQuickSearch();
                }
            }
        });

        // 点击按钮展开搜索引擎跳转面板（只有真正的点击，不是拖动）
        triggerButton.addEventListener('click', (e) => {
            // 如果已经拖动了，不触发点击，重置状态
            if (hasDragged) {
                hasDragged = false;
                return;
            }
            // 如果拖动时间超过200ms或移动过，认为是拖动操作
            if (Date.now() - dragStartTime > 200) {
                return;
            }
            toggleSearchPanel();
        });

        triggerButton.addEventListener('mouseenter', () => {
            if (!isDragging) {
                triggerButton.style.transform = 'scale(1.1)';
                triggerButton.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.5)';
            }
        });
        triggerButton.addEventListener('mouseleave', () => {
            if (!isDragging) {
                triggerButton.style.transform = 'scale(1)';
                triggerButton.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
            }
        });

        document.body.appendChild(triggerButton);
    }

    // 切换搜索引擎跳转面板（点击按钮时显示）
    function toggleSearchPanel() {
        // 移除已存在的面板
        const existing = document.getElementById('punk-search-jump-panel');
        if (existing) {
            existing.remove();
            return;
        }

        const enabledEngines = GM_getValue("punk_setup_search", punkDeafultMark).split("-");

        // 创建面板
        const panel = document.createElement('div');
        panel.id = 'punk-search-jump-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: white;
            border: 1px solid #E0E7FF;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            min-width: 280px;
            max-width: 320px;
            z-index: 9999997;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: quickSearchAppear 0.2s ease;
        `;

        // 标题
        const title = document.createElement('div');
        title.textContent = '⭐ 搜索引擎跳转';
        title.style.cssText = `
            font-size: 14px;
            font-weight: 600;
            color: #5B21B6;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #E0E7FF;
        `;
        panel.appendChild(title);

        // 按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        `;

        // 添加搜索引擎按钮
        searchEngines.forEach(engine => {
            if (enabledEngines.includes(engine.mark)) {
                const button = document.createElement('button');
                button.textContent = engine.name;
                button.style.cssText = `
                    padding: 6px 12px;
                    background: #F5F3FF;
                    color: #5B21B6;
                    border: 1px solid #DDD6FE;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                `;

                button.addEventListener('mouseenter', () => {
                    button.style.background = '#8B5CF6';
                    button.style.color = 'white';
                    button.style.borderColor = '#8B5CF6';
                });
                button.addEventListener('mouseleave', () => {
                    button.style.background = '#F5F3FF';
                    button.style.color = '#5B21B6';
                    button.style.borderColor = '#DDD6FE';
                });

                button.addEventListener('click', () => {
                    const keyword = prompt('请输入搜索关键词：');
                    if (keyword && keyword.trim()) {
                        window.open(engine.searchUrl + encodeURIComponent(keyword.trim()), '_blank');
                    }
                });

                buttonContainer.appendChild(button);
            }
        });

        panel.appendChild(buttonContainer);

        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            background: #F3F4F6;
            border: none;
            border-radius: 50%;
            font-size: 16px;
            color: #6B7280;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = '#E5E7EB';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = '#F3F4F6';
        });
        closeBtn.addEventListener('click', () => panel.remove());
        panel.appendChild(closeBtn);

        // 点击外部关闭
        document.addEventListener('click', function closePanel(e) {
            if (!panel.contains(e.target) && !e.target.closest('#punk-quick-search-trigger')) {
                panel.remove();
                document.removeEventListener('click', closePanel);
            }
        });

        document.body.appendChild(panel);
    }

    // 显示快捷搜索界面
    function showQuickSearch() {
        // 移除已存在的界面
        const existing = document.getElementById('punk-quick-search');
        if (existing) {
            existing.remove();
            return;
        }

        const searchDiv = document.createElement('div');
        searchDiv.id = 'punk-quick-search';
        searchDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.95);
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            background: white;
            border: 1px solid #E0E7FF;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(102, 126, 234, 0.25);
            z-index: 10000001;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: quickSearchAppear 0.2s ease forwards;
        `;

        // 添加动画样式 - 检查是否已存在，避免重复创建
        let style = document.getElementById('punk-search-animations');
        if (!style) {
            style = document.createElement('style');
            style.id = 'punk-search-animations';
            style.textContent = `
                @keyframes quickSearchAppear {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                @keyframes float {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        // 头部 - 紫蓝渐变设计
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 20px 28px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            position: relative;
        `;

        header.innerHTML = `
            <button id="quick-search-close" style="position: absolute; top: 12px; right: 16px; width: 32px; height: 32px; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; font-size: 20px; cursor: pointer; color: white; transition: all 0.15s; display: flex; align-items: center; justify-content: center; line-height: 1;" title="关闭 (ESC)">×</button>
            <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 600;">🪐 星际搜索</h2>
            <div style="position: relative; max-width: 380px; margin: 0 auto;">
                <input type="text" id="quick-search-input" placeholder="探索宇宙中的知识..."
                       style="width: 100%; padding: 12px 40px 12px 18px; border: none; border-radius: 24px; font-size: 14px; outline: none; background: rgba(255,255,255,0.95); color: #1F2937; box-shadow: 0 4px 12px rgba(0,0,0,0.15); box-sizing: border-box;">
                <button id="quick-search-clear" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; background: #E5E7EB; border: none; border-radius: 50%; font-size: 14px; cursor: pointer; color: #6B7280; transition: all 0.15s; display: flex; align-items: center; justify-content: center; line-height: 1;">×</button>
            </div>
        `;

        // 内容区域
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 0;
            max-height: 50vh;
            overflow-y: auto;
            background: #F5F3FF;
        `;

        // 标签页 - 紫蓝主题
        const tabContainer = document.createElement('div');
        tabContainer.style.cssText = `
            display: flex;
            background: white;
            border-bottom: 1px solid #E0E7FF;
            overflow-x: auto;
            scrollbar-width: none;
        `;

        const tabContent = document.createElement('div');
        tabContent.style.cssText = 'padding: 16px 20px;';

        // 创建标签页（包括设置标签）
        const allTabs = [...quickSearchConfig, { tabName: '⚙️ 设置', isSettings: true }];
        
        allTabs.forEach((config, index) => {
            const tab = document.createElement('button');
            tab.textContent = config.tabName;
            const isActive = index === 0;
            tab.style.cssText = `
                padding: 10px 18px;
                border: none;
                background: ${isActive ? '#F5F3FF' : 'transparent'};
                color: ${isActive ? '#7C3AED' : '#6B7280'};
                cursor: pointer;
                border-bottom: 2px solid ${isActive ? '#8B5CF6' : 'transparent'};
                white-space: nowrap;
                font-size: 13px;
                font-weight: ${isActive ? '600' : '500'};
                transition: all 0.15s ease;
                margin: 0;
            `;

            tab.addEventListener('click', () => {
                // 更新标签样式
                tabContainer.querySelectorAll('button').forEach(btn => {
                    btn.style.background = 'transparent';
                    btn.style.color = '#6B7280';
                    btn.style.borderBottom = '2px solid transparent';
                    btn.style.fontWeight = '500';
                });
                tab.style.background = '#F5F3FF';
                tab.style.color = '#7C3AED';
                tab.style.borderBottom = '2px solid #8B5CF6';
                tab.style.fontWeight = '600';

                // 更新内容
                if (config.isSettings) {
                    showSettingsContent();
                } else {
                    showTabContent(config.tabList);
                }
            });

            tab.addEventListener('mouseenter', () => {
                if (tab.style.color !== 'rgb(124, 58, 237)') {
                    tab.style.background = '#F5F3FF';
                }
            });

            tab.addEventListener('mouseleave', () => {
                if (tab.style.color !== 'rgb(124, 58, 237)') {
                    tab.style.background = 'transparent';
                }
            });

            tabContainer.appendChild(tab);
        });

        // 显示标签内容 - 紫蓝主题按钮
        function showTabContent(tabList) {
            tabContent.innerHTML = '';

            const grid = document.createElement('div');
            grid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                gap: 8px;
            `;

            tabList.forEach(item => {
                const button = document.createElement('button');
                button.textContent = item.name;
                button.style.cssText = `
                    padding: 8px 12px;
                    border: 1px solid #DDD6FE;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    color: #1E1B4B;
                    transition: all 0.15s ease;
                `;

                button.addEventListener('mouseenter', () => {
                    button.style.background = '#8B5CF6';
                    button.style.color = 'white';
                    button.style.borderColor = '#8B5CF6';
                });
                button.addEventListener('mouseleave', () => {
                    button.style.background = 'white';
                    button.style.color = '#1E1B4B';
                    button.style.borderColor = '#DDD6FE';
                });

                button.addEventListener('click', () => {
                    const keyword = document.getElementById('quick-search-input').value.trim();
                    if (keyword) {
                        window.open(item.searchUrl + encodeURIComponent(keyword), '_blank');
                    }
                });

                grid.appendChild(button);
            });

            tabContent.appendChild(grid);
        }

        // 显示设置内容
        function showSettingsContent() {
            tabContent.innerHTML = '';

            const settingsContainer = document.createElement('div');
            settingsContainer.style.cssText = `
                max-height: 40vh;
                overflow-y: auto;
            `;

            const enabledEngines = GM_getValue("punk_setup_search", punkDeafultMark).split("-");
            const currentEngines = enabledEngines;

            // 预设按钮区域
            const presetContainer = document.createElement('div');
            presetContainer.style.cssText = `
                margin-bottom: 16px;
                padding: 12px;
                background: white;
                border-radius: 8px;
                border: 1px solid #E0E7FF;
            `;

            const presetTitle = document.createElement('h4');
            presetTitle.textContent = '快速预设';
            presetTitle.style.cssText = 'margin: 0 0 10px 0; color: #1E1B4B; font-size: 13px; font-weight: 600;';
            presetContainer.appendChild(presetTitle);

            const presetButtonContainer = document.createElement('div');
            presetButtonContainer.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            `;

            const presets = [
                { name: '国内预设', mark: punkDeafultMark },
                { name: '国际预设', mark: punkInternationalMark },
                { name: '图片预设', mark: punkImageMark },
                { name: '壁纸预设', mark: punkWallpaperMark },
                { name: '全部预设', mark: punkAllSearchMark }
            ];

            presets.forEach(preset => {
                const btn = document.createElement('button');
                btn.textContent = preset.name;
                btn.style.cssText = `
                    flex: 1;
                    min-width: 70px;
                    padding: 6px 10px;
                    background: #8B5CF6;
                    border: none;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: all 0.15s ease;
                `;
                btn.onmouseenter = () => { btn.style.background = '#7C3AED'; };
                btn.onmouseleave = () => { btn.style.background = '#8B5CF6'; };
                btn.onclick = () => {
                    GM_setValue("punk_setup_search", preset.mark);
                    // 重新加载设置内容
                    showSettingsContent();
                };
                presetButtonContainer.appendChild(btn);
            });

            presetContainer.appendChild(presetButtonContainer);
            settingsContainer.appendChild(presetContainer);

            // 搜索引擎选择区域
            const engineContainer = document.createElement('div');
            engineContainer.style.cssText = 'margin-top: 12px;';

            const engineTitle = document.createElement('h4');
            engineTitle.textContent = '自定义搜索引擎';
            engineTitle.style.cssText = 'margin: 0 0 10px 0; color: #1E1B4B; font-size: 13px; font-weight: 600;';
            engineContainer.appendChild(engineTitle);

            const engineGrid = document.createElement('div');
            engineGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 6px;
                max-height: 200px;
                overflow-y: auto;
                padding: 10px;
                background: white;
                border: 1px solid #E0E7FF;
                border-radius: 8px;
            `;

            searchEngines.forEach(engine => {
                const label = document.createElement('label');
                label.style.cssText = `
                    display: flex;
                    align-items: center;
                    padding: 5px 6px;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.15s ease;
                    background: #F5F3FF;
                `;
                label.addEventListener('mouseenter', () => {
                    label.style.background = '#EDE9FE';
                });
                label.addEventListener('mouseleave', () => {
                    label.style.background = '#F5F3FF';
                });

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = currentEngines.includes(engine.mark);
                checkbox.dataset.mark = engine.mark;
                checkbox.style.cssText = `
                    margin-right: 6px;
                    width: 14px;
                    height: 14px;
                    accent-color: #8B5CF6;
                    cursor: pointer;
                `;

                const text = document.createElement('span');
                text.textContent = engine.name;
                text.style.cssText = 'font-size: 12px; color: #1E1B4B;';

                label.appendChild(checkbox);
                label.appendChild(text);
                engineGrid.appendChild(label);
            });

            engineContainer.appendChild(engineGrid);

            // 保存按钮
            const saveButton = document.createElement('button');
            saveButton.textContent = '保存设置';
            saveButton.style.cssText = `
                margin-top: 12px;
                padding: 8px 20px;
                background: #8B5CF6;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.15s ease;
            `;
            saveButton.addEventListener('mouseenter', () => {
                saveButton.style.background = '#7C3AED';
            });
            saveButton.addEventListener('mouseleave', () => {
                saveButton.style.background = '#8B5CF6';
            });
            saveButton.addEventListener('click', () => {
                const checkboxes = engineGrid.querySelectorAll('input[type="checkbox"]');
                const selectedEngines = [];
                checkboxes.forEach((checkbox) => {
                    if (checkbox.checked) {
                        selectedEngines.push(checkbox.dataset.mark);
                    }
                });
                GM_setValue("punk_setup_search", selectedEngines.join("-"));
                alert('设置已保存！页面将刷新应用新设置。');
                setTimeout(() => location.reload(), 500);
            });

            engineContainer.appendChild(saveButton);
            settingsContainer.appendChild(engineContainer);
            tabContent.appendChild(settingsContainer);
        }

        // 默认显示第一个标签的内容
        showTabContent(quickSearchConfig[0].tabList);

        content.appendChild(tabContainer);
        content.appendChild(tabContent);

        searchDiv.appendChild(header);
        searchDiv.appendChild(content);

        // 事件绑定
        const searchInput = searchDiv.querySelector('#quick-search-input');
        const clearButton = searchDiv.querySelector('#quick-search-clear');
        const closeButton = searchDiv.querySelector('#quick-search-close');

        // 关闭按钮点击事件
        closeButton.addEventListener('click', () => {
            closeQuickSearch();
        });

        // 关闭按钮悬停效果
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'rgba(255,255,255,0.35)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'rgba(255,255,255,0.2)';
        });

        // 清除按钮点击事件
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
        });

        // 清除按钮悬停效果
        clearButton.addEventListener('mouseenter', () => {
            clearButton.style.background = '#D1D5DB';
            clearButton.style.color = '#374151';
        });
        clearButton.addEventListener('mouseleave', () => {
            clearButton.style.background = '#E5E7EB';
            clearButton.style.color = '#6B7280';
        });

        // 搜索框回车事件
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                if (keyword) {
                    // 默认使用Google搜索
                    window.open('https://www.google.com/search?q=' + encodeURIComponent(keyword), '_blank');
                }
            }
        });

        document.body.appendChild(searchDiv);

        // 自动聚焦输入框
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }

    // 关闭星际搜索界面的函数
    function closeQuickSearch() {
        const searchDiv = document.getElementById('punk-quick-search');
        if (searchDiv) {
            searchDiv.remove();
        }
    }

    // 初始化
    function init() {
        // 创建搜索引擎跳转按钮
        createSearchButtons();

        // 创建快捷搜索功能
        createQuickSearch();

        // 全局ESC键监听 - 只注册一次
        if (!window.punkSearchEscListenerAdded) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeQuickSearch();
                    // 同时关闭搜索引擎跳转面板
                    const jumpPanel = document.getElementById('punk-search-jump-panel');
                    if (jumpPanel) {
                        jumpPanel.remove();
                    }
                }
            });
            window.punkSearchEscListenerAdded = true;
        }
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
