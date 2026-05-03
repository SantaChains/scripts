// ==UserScript==
// @name         搜索引擎一键跳转
// @namespace    http://tampermonkey.net/
// @version      6.3
// @description  在搜索结果页面添加其他搜索引擎的快捷跳转按钮，支持自定义搜索引擎
// @author       Punkjet & SantaChains
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @noframes
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/SantaChains/scripts/main/SearchRedireact/meta.js
// @downloadURL  https://raw.githubusercontent.com/SantaChains/scripts/main/SearchRedireact/user.js
// @supportURL   https://github.com/SantaChains/scripts/issues
// ==/UserScript==

(function () {
  'use strict';

  // ─── 配色系统（Nerd Dark — Tokyo Night × Dracula）───
  var C = {
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

  // ─── SVG 图标（Lucide 风格，24x24 viewBox）───
  var ICON = {
    star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    planet: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="3" ry="8" transform="rotate(60 12 12)"/></svg>',
    settings: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  };

  // ─── 预设标记 ───
  var PRESETS = {
    default: 'Google-Github-Steam-Bing-MitaAI-GoogleScholar-Searx-Bilibili-Zhihu-Weibo-Douban-Quark-Sougou-SougouWeixin-360ai-wallpaper',
    international: 'GooglePatents-Bing-Yahoo-Yandex-DuckDuckGo-YouTube-Wikipedia-Instagram-Qwant-Tiktok',
    image: 'SougouImage-Google-YandexImage-wallpaper-Pixabay-Pexels',
    wallpaper: 'wallpaper-Pixabay-Pexels-WallpaperEngine',
    all: 'Baidu-Bing-360-Quark-Toutiao-Weibo-Zhihu-Douban-MitaAI-Sougou-wallpaper-Pixabay-Pexels-WallpaperEngine-SougouWeixin-Steam-Github-Google-GoogleScholar-SougouImage-SougouXiaohongshu-GooglePatents-Yahoo-Yandex-DuckDuckGo-Swisscows-MetaGer-Searx-Qwant-Ecosia-WolframAlpha-Perplexity-Kagi-Claude-Perplexity-Pro-ChatGPT-Sage-Naver-Daum-Goo-Startpage-Fsou-Ask-AOL-QwantLite-Brave-YouTube-Wikipedia-Instagram-Tiktok-360ai-YandexImage',
  };

  // ─── 搜索引擎配置 ───
  var ENGINES = [
    { name: '百度', url: 'https://www.baidu.com/s?wd=', key: 'wd', match: /baidu\.com\/s.*?wd=/, mark: 'Baidu' },
    { name: '必应', url: 'https://www.bing.com/search?q=', key: 'q', match: /bing\.com\/search.*?q=/, mark: 'Bing' },
    { name: '360搜索', url: 'https://www.so.com/s?q=', key: 'q', match: /so\.com\/s.*?q=/, mark: '360' },
    { name: '夸克', url: 'https://quark.sm.cn/s?q=', key: 'q', match: /quark\.sm\.cn\/s.*?q=/, mark: 'Quark' },
    { name: '头条搜索', url: 'https://so.toutiao.com/search?keyword=', key: 'keyword', match: /so\.toutiao\.com\/search.*?keyword=/, mark: 'Toutiao' },
    { name: '微博', url: 'https://s.weibo.com/weibo?q=', key: 'q', match: /s\.weibo\.com\/weibo.*?q=/, mark: 'Weibo' },
    { name: '知乎', url: 'https://www.zhihu.com/search?type=content&q=', key: 'q', match: /zhihu\.com\/search.*?q=/, mark: 'Zhihu' },
    { name: '豆瓣', url: 'https://www.douban.com/search?q=', key: 'q', match: /douban\.com\/search.*?q=/, mark: 'Douban' },
    { name: 'MitaAI', url: 'https://www.mitaai.com/search?q=', key: 'q', match: /mitaai\.com\/search.*?q=/, mark: 'MitaAI' },
    { name: '搜狗', url: 'https://www.sogou.com/web?query=', key: 'query', match: /sogou\.com\/web.*?query=/, mark: 'Sougou' },
    { name: '搜狗微信', url: 'https://weixin.sogou.com/weixin?type=2&query=', key: 'query', match: /weixin\.sogou\.com\/weixin.*?query=/, mark: 'SougouWeixin' },
    { name: '360AI', url: 'https://www.360.com/search?q=', key: 'q', match: /360\.com\/search.*?q=/, mark: '360ai' },
    { name: 'Unsplash', url: 'https://unsplash.com/s/photos/', key: 'q', match: /unsplash\.com\/s\/photos\//, mark: 'wallpaper' },
    { name: 'Pixabay', url: 'https://pixabay.com/zh/images/search/', key: 'q', match: /pixabay\.com\/zh\/images\/search\//, mark: 'Pixabay' },
    { name: 'Wallpaper Engine', url: 'https://steamcommunity.com/workshop/browse/?appid=431960&searchtext=', key: 'searchtext', match: /steamcommunity\.com\/workshop\/browse.*?searchtext=/, mark: 'WallpaperEngine' },
    { name: 'Pexels', url: 'https://www.pexels.com/search/', key: 'query', match: /pexels\.com\/search\//, mark: 'Pexels' },
    { name: 'Steam', url: 'https://store.steampowered.com/search/?term=', key: 'term', match: /store\.steampowered\.com\/search.*?term=/, mark: 'Steam' },
    { name: 'Github', url: 'https://github.com/search?q=', key: 'q', match: /github\.com\/search.*?q=/, mark: 'Github' },
    { name: 'Google', url: 'https://www.google.com/search?q=', key: 'q', match: /google\.com\/search.*?q=/, mark: 'Google' },
    { name: 'Google学术', url: 'https://scholar.google.com/scholar?q=', key: 'q', match: /scholar\.google\.com\/scholar.*?q=/, mark: 'GoogleScholar' },
    { name: '搜狗图片', url: 'https://pic.sogou.com/pics?query=', key: 'query', match: /pic\.sogou\.com\/pics.*?query=/, mark: 'SougouImage' },
    { name: '搜狗小红书', url: 'https://xiaohongshu.sogou.com/search?query=', key: 'query', match: /xiaohongshu\.sogou\.com\/search.*?query=/, mark: 'SougouXiaohongshu' },
    { name: 'Google专利', url: 'https://patents.google.com/?q=', key: 'q', match: /patents\.google\.com\/.*?q=/, mark: 'GooglePatents' },
    { name: 'Yahoo', url: 'https://search.yahoo.com/search?p=', key: 'p', match: /search\.yahoo\.com\/search.*?p=/, mark: 'Yahoo' },
    { name: 'Yandex', url: 'https://yandex.com/search/?text=', key: 'text', match: /yandex\.com\/search.*?text=/, mark: 'Yandex' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', key: 'q', match: /duckduckgo\.com\/.*?q=/, mark: 'DuckDuckGo' },
    { name: 'Swisscows', url: 'https://swisscows.com/web?query=', key: 'query', match: /swisscows\.com\/web.*?query=/, mark: 'Swisscows' },
    { name: 'MetaGer', url: 'https://metager.org/meta/meta.ger3?eingabe=', key: 'eingabe', match: /metager\.org\/meta\/meta\.ger3.*?eingabe=/, mark: 'MetaGer' },
    { name: 'Searx', url: 'https://searx.org/?q=', key: 'q', match: /searx\.org\/.*?q=/, mark: 'Searx' },
    { name: 'Qwant', url: 'https://www.qwant.com/?q=', key: 'q', match: /qwant\.com\/.*?q=/, mark: 'Qwant' },
    { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=', key: 'q', match: /ecosia\.org\/search.*?q=/, mark: 'Ecosia' },
    { name: 'WolframAlpha', url: 'https://www.wolframalpha.com/input/?i=', key: 'i', match: /wolframalpha\.com\/input.*?i=/, mark: 'WolframAlpha' },
    { name: 'Perplexity', url: 'https://www.perplexity.ai/search?q=', key: 'q', match: /perplexity\.ai\/search.*?q=/, mark: 'Perplexity' },
    { name: 'Kagi', url: 'https://kagi.com/search?q=', key: 'q', match: /kagi\.com\/search.*?q=/, mark: 'Kagi' },
    { name: 'Claude', url: 'https://claude.ai/chat?q=', key: 'q', match: /claude\.ai\/chat.*?q=/, mark: 'Claude' },
    { name: 'Perplexity Pro', url: 'https://pro.perplexity.ai/search?q=', key: 'q', match: /pro\.perplexity\.ai\/search.*?q=/, mark: 'Perplexity-Pro' },
    { name: 'ChatGPT', url: 'https://chat.openai.com/?q=', key: 'q', match: /chat\.openai\.com\/.*?q=/, mark: 'ChatGPT' },
    { name: 'Sage', url: 'https://poe.com/Sage?q=', key: 'q', match: /poe\.com\/Sage.*?q=/, mark: 'Sage' },
    { name: 'Naver', url: 'https://search.naver.com/search.naver?query=', key: 'query', match: /search\.naver\.com\/search\.naver.*?query=/, mark: 'Naver' },
    { name: 'Daum', url: 'https://search.daum.net/search?q=', key: 'q', match: /search\.daum\.net\/search.*?q=/, mark: 'Daum' },
    { name: 'Goo', url: 'https://search.goo.ne.jp/web.jsp?MT=', key: 'MT', match: /search\.goo\.ne\.jp\/web\.jsp.*?MT=/, mark: 'Goo' },
    { name: 'Startpage', url: 'https://www.startpage.com/sp/search?query=', key: 'query', match: /startpage\.com\/sp\/search.*?query=/, mark: 'Startpage' },
    { name: 'Fsou', url: 'https://fsou.cc/search?q=', key: 'q', match: /fsou\.cc\/search.*?q=/, mark: 'Fsou' },
    { name: 'Ask', url: 'https://www.ask.com/web?q=', key: 'q', match: /ask\.com\/web.*?q=/, mark: 'Ask' },
    { name: 'AOL', url: 'https://search.aol.com/aol/search?q=', key: 'q', match: /search\.aol\.com\/aol\/search.*?q=/, mark: 'AOL' },
    { name: 'QwantLite', url: 'https://lite.qwant.com/?q=', key: 'q', match: /lite\.qwant\.com\/.*?q=/, mark: 'QwantLite' },
    { name: 'Brave', url: 'https://search.brave.com/search?q=', key: 'q', match: /search\.brave\.com\/search.*?q=/, mark: 'Brave' },
    { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', key: 'search_query', match: /youtube\.com\/results.*?search_query=/, mark: 'YouTube' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Search?search=', key: 'search', match: /en\.wikipedia\.org\/wiki\/Special:Search.*?search=/, mark: 'Wikipedia' },
    { name: 'Instagram', url: 'https://www.instagram.com/explore/tags/', key: '', match: /instagram\.com\/explore\/tags\//, mark: 'Instagram' },
    { name: 'Tiktok', url: 'https://www.tiktok.com/search?q=', key: 'q', match: /tiktok\.com\/search.*?q=/, mark: 'Tiktok' },
    { name: 'Yandex图片', url: 'https://yandex.com/images/search?text=', key: 'text', match: /yandex\.com\/images\/search.*?text=/, mark: 'YandexImage' },
    { name: 'Bilibili', url: 'https://search.bilibili.com/all?keyword=', key: 'keyword', match: /search\.bilibili\.com\/all.*?keyword=/, mark: 'Bilibili' },
  ];

  var QUICK_TABS = [
    { tab: '综合', list: [
      { name: '百度', url: 'https://www.baidu.com/s?wd=' },
      { name: '谷歌', url: 'https://www.google.com/search?q=' },
      { name: '必应', url: 'https://www.bing.com/search?q=' },
      { name: '360搜索', url: 'https://www.so.com/s?q=' },
      { name: '搜狗', url: 'https://www.sogou.com/web?query=' },
      { name: '夸克', url: 'https://quark.sm.cn/s?q=' },
      { name: '头条搜索', url: 'https://so.toutiao.com/search?keyword=' },
    ]},
    { tab: '学术', list: [
      { name: '谷歌学术', url: 'https://scholar.google.com/scholar?q=' },
      { name: '百度学术', url: 'https://xueshu.baidu.com/s?wd=' },
      { name: '知网', url: 'https://kns.cnki.net/kns8/DefaultResult/Index?dbcode=SCDB&kw=' },
      { name: '万方', url: 'https://s.wanfangdata.com.cn/paper?q=' },
      { name: '维普', url: 'http://www.cqvip.com/main/search.aspx?k=' },
      { name: 'arXiv', url: 'https://arxiv.org/search/?query=' },
      { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=' },
    ]},
    { tab: '社交', list: [
      { name: '微博', url: 'https://s.weibo.com/weibo?q=' },
      { name: '知乎', url: 'https://www.zhihu.com/search?type=content&q=' },
      { name: '豆瓣', url: 'https://www.douban.com/search?q=' },
      { name: '小红书', url: 'https://www.xiaohongshu.com/search_result?keyword=' },
      { name: '抖音', url: 'https://www.douyin.com/search/' },
      { name: 'B站', url: 'https://search.bilibili.com/all?keyword=' },
      { name: '贴吧', url: 'https://tieba.baidu.com/f/search/res?ie=utf-8&kw=' },
    ]},
    { tab: '图片', list: [
      { name: '谷歌搜图', url: 'https://www.google.com.hk/search?tbm=isch&q=' },
      { name: '必应搜图', url: 'https://www.bing.com/images/search?q=' },
      { name: 'Flickr', url: 'http://www.flickr.com/search/?q=' },
      { name: 'Pinterest', url: 'https://www.pinterest.com/search/pins/?q=' },
      { name: 'Pixabay', url: 'https://pixabay.com/zh/images/search/' },
      { name: '花瓣', url: 'https://huaban.com/search/?q=' },
      { name: 'Unsplash', url: 'https://unsplash.com/s/photos/' },
      { name: 'Pexels', url: 'https://www.pexels.com/search/' },
    ]},
    { tab: '壁纸', list: [
      { name: 'Unsplash', url: 'https://unsplash.com/s/photos/' },
      { name: 'Pixabay', url: 'https://pixabay.com/zh/images/search/' },
      { name: 'Pexels', url: 'https://www.pexels.com/search/' },
      { name: 'Wallpaper Engine', url: 'https://steamcommunity.com/workshop/browse/?appid=431960&searchtext=' },
      { name: 'WallpaperHub', url: 'https://wallpaperhub.app/search?q=' },
      { name: 'WallpaperAccess', url: 'https://wallpaperaccess.com/search?q=' },
    ]},
    { tab: '视频', list: [
      { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=' },
      { name: 'B站', url: 'https://search.bilibili.com/all?keyword=' },
      { name: '爱奇艺', url: 'https://so.iqiyi.com/so/q_' },
      { name: '腾讯视频', url: 'https://v.qq.com/x/search/?q=' },
      { name: '优酷', url: 'https://so.youku.com/search_video/q_' },
      { name: '抖音', url: 'https://www.douyin.com/search/' },
      { name: '快手', url: 'https://www.kuaishou.com/search/video?searchKey=' },
    ]},
    { tab: '购物', list: [
      { name: '淘宝', url: 'https://s.taobao.com/search?q=' },
      { name: '京东', url: 'https://search.jd.com/Search?keyword=' },
      { name: '天猫', url: 'https://list.tmall.com/search_product.htm?q=' },
      { name: '拼多多', url: 'https://mobile.yangkeduo.com/search_result.html?search_key=' },
      { name: '苏宁', url: 'https://search.suning.com/' },
      { name: '亚马逊', url: 'https://www.amazon.cn/s?k=' },
      { name: '1688', url: 'https://s.1688.com/selloffer/offer_search.htm?keywords=' },
    ]},
    { tab: '开发', list: [
      { name: 'GitHub', url: 'https://github.com/search?q=' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com/search?q=' },
      { name: 'MDN', url: 'https://developer.mozilla.org/zh-CN/search?q=' },
      { name: 'CSDN', url: 'https://so.csdn.net/so/search?q=' },
      { name: '博客园', url: 'https://zzk.cnblogs.com/s?w=' },
      { name: '掘金', url: 'https://juejin.cn/search?query=' },
      { name: 'GitLab', url: 'https://gitlab.com/search?search=' },
    ]},
  ];

  var SEARCH_PARAMS = ['q', 'wd', 'query', 'keyword', 'search', 'term', 'kw', 'text', 'eingabe', 'p', 'MT', 'search_query', 'searchtext', 'i'];

  var ENGINE_MAP = {};
  for (var engineIndex = 0; engineIndex < ENGINES.length; engineIndex++) {
    ENGINE_MAP[ENGINES[engineIndex].mark] = ENGINES[engineIndex];
  }

  var SEARCH_DOMAINS = {};
  for (var domainIndex = 0; domainIndex < ENGINES.length; domainIndex++) {
    var domainPattern = ENGINES[domainIndex].match.source.replace(/\\./g, '.').replace(/\.\*/g, '*').replace(/\^/g, '').replace(/\\//g, '/');
    var hostMatch = domainPattern.match(/(?:https?:\/\/)?([a-z0-9.*-]+)/i);
    if (hostMatch) SEARCH_DOMAINS[hostMatch[1]] = true;
  }

  function getKeyword() {
    var params = new URLSearchParams(window.location.search);
    for (var i = 0; i < SEARCH_PARAMS.length; i++) {
      var v = params.get(SEARCH_PARAMS[i]);
      if (v) return v;
    }
    var tag = window.location.href.match(/instagram\.com\/explore\/tags\/([^/?]+)/);
    return tag ? tag[1] : '';
  }

  function isSearchPage() {
    var href = window.location.href;
    var hostname = window.location.hostname;
    var params = new URLSearchParams(window.location.search);
    var hasParam = false;
    for (var i = 0; i < SEARCH_PARAMS.length; i++) {
      if (params.has(SEARCH_PARAMS[i])) { hasParam = true; break; }
    }
    if (!hasParam && href.indexOf('instagram.com/explore/tags/') === -1) return false;
    var domainMatch = false;
    for (var key in SEARCH_DOMAINS) {
      if (hostname === key || hostname.endsWith('.' + key)) { domainMatch = true; break; }
    }
    if (!domainMatch) return false;
    return ENGINES.some(function (e) { return e.match.test(href); });
  }

  function getEnabledMarks() {
    return GM_getValue('punk_setup_search', PRESETS.default).split('-');
  }

  function el(tag, cls, styles, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (styles) e.style.cssText = styles;
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  function svgEl(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.firstChild;
  }

  // ─── 通用拖拽管理器 ───
  var DragManager = {
    activeHandlers: [],

    create: function (element, options) {
      var config = Object.assign({
        onMove: null,
        onEnd: null,
        threshold: 5,
        savePosition: null,
        getInitialPosition: null
      }, options);

      var isDragging = false;
      var hasDragged = false;
      var startX = 0;
      var startY = 0;
      var elementStartX = 0;
      var elementStartY = 0;
      var rafId = null;
      var clickStartTime = 0;

      function onMouseMove(e) {
        if (!isDragging || rafId) return;
        rafId = requestAnimationFrame(function () {
          var deltaX = e.clientX - startX;
          var deltaY = e.clientY - startY;
          if (Math.abs(deltaX) > config.threshold || Math.abs(deltaY) > config.threshold) {
            hasDragged = true;
          }
          if (config.onMove) {
            config.onMove(e, deltaX, deltaY, elementStartX, elementStartY);
          }
          rafId = null;
        });
      }

      function onMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        element.classList.remove('punk-dragging');
        element.style.cursor = 'move';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        if (config.onEnd) config.onEnd(hasDragged);
        if (config.savePosition && hasDragged) {
          config.savePosition();
        }
      }

      function onMouseDown(e) {
        isDragging = true;
        hasDragged = false;
        clickStartTime = Date.now();
        startX = e.clientX;
        startY = e.clientY;
        var initialPos = config.getInitialPosition ? config.getInitialPosition() : { x: 0, y: 0 };
        elementStartX = initialPos.x;
        elementStartY = initialPos.y;
        element.classList.add('punk-dragging');
        element.style.cursor = 'grabbing';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
      }

      element.addEventListener('mousedown', onMouseDown);

      var handler = {
        hasDragged: function () { return hasDragged; },
        resetDrag: function () { hasDragged = false; },
        getClickDuration: function () { return Date.now() - clickStartTime; },
        cleanup: function () {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }
      };

      DragManager.activeHandlers.push(handler);
      return handler;
    },

    cleanupAll: function () {
      DragManager.activeHandlers.forEach(function (h) { h.cleanup(); });
      DragManager.activeHandlers = [];
    }
  };

  // ─── 单例 CSS 注入（Glassmorphism + 交互 + 无障碍）───
  function injectCSS() {
    if (document.getElementById('punk-css')) return;
    var s = document.createElement('style');
    s.id = 'punk-css';
    s.textContent = [
      '@keyframes punkIn{from{opacity:0;transform:translate(-50%,-50%) scale(.92)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}',
      '@keyframes punkSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}',
      '@keyframes punkToast{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}',

      '@media(prefers-reduced-motion:reduce){',
      '.punk-anim{animation:none!important;transition:none!important}',
      '}',

      '.punk-btn{cursor:pointer;transition:background .18s ease,color .18s ease,border-color .18s ease,transform .15s ease,box-shadow .15s ease}',
      '.punk-btn:focus-visible{outline:2px solid ' + C.primary + ';outline-offset:2px}',

      '.punk-eng{display:inline-block;padding:5px 10px;margin:2px;text-decoration:none;border-radius:' + C.radiusSm + ';font-size:11px;font-weight:500;white-space:nowrap;cursor:pointer;transition:background .18s ease,color .18s ease,box-shadow .18s ease}',
      '.punk-eng:not(.punk-eng-active){background:' + C.surface + ';color:' + C.text + '}',
      '.punk-eng:not(.punk-eng-active):hover{background:' + C.bgActive + ';color:' + C.primary + ';box-shadow:' + C.shadow1 + '}',
      '.punk-eng-active{background:' + C.grad + ';color:#fff;box-shadow:0 2px 8px rgba(124,58,237,.25)}',

      '.punk-pop-btn{padding:6px 12px;background:' + C.glass + ';color:' + C.text + ';border:1px solid ' + C.glassBorder + ';border-radius:' + C.radiusSm + ';font-size:12px;font-weight:500;cursor:pointer;transition:all .18s ease;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
      '.punk-pop-btn:hover{background:' + C.primary + ';color:#fff;border-color:' + C.primary + ';box-shadow:0 4px 12px rgba(124,58,237,.2)}',

      '.punk-tab{padding:10px 18px;border:none;background:transparent;color:' + C.textMuted + ';cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;font-size:13px;font-weight:500;transition:all .18s ease}',
      '.punk-tab:hover{background:' + C.surface + '}',
      '.punk-tab-active{background:' + C.surface + '!important;color:' + C.primary + '!important;border-bottom-color:' + C.primary + '!important;font-weight:600!important}',

      '.punk-grid-btn{padding:8px 12px;border:1px solid ' + C.glassBorder + ';background:' + C.glassDark + ';border-radius:' + C.radiusSm + ';cursor:pointer;font-size:12px;font-weight:500;color:' + C.text + ';transition:all .18s ease;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}',
      '.punk-grid-btn:hover{background:' + C.primary + ';color:#fff;border-color:' + C.primary + ';box-shadow:0 4px 12px rgba(124,58,237,.2);transform:translateY(-1px)}',

      '.punk-preset{flex:1;min-width:70px;padding:6px 10px;background:' + C.cta + ';border:none;color:#fff;border-radius:' + C.radiusSm + ';cursor:pointer;font-size:12px;font-weight:500;transition:all .18s ease}',
      '.punk-preset:hover{background:' + C.ctaHover + ';box-shadow:0 4px 12px rgba(6,182,212,.25)}',

      '.punk-save{margin-top:12px;padding:8px 20px;background:' + C.primary + ';color:#fff;border:none;border-radius:' + C.radiusSm + ';cursor:pointer;font-size:13px;font-weight:500;transition:all .18s ease}',
      '.punk-save:hover{background:' + C.primaryHover + ';box-shadow:0 4px 12px rgba(124,58,237,.25)}',

      '.punk-close{width:24px;height:24px;background:rgba(86,95,137,.2);border:none;border-radius:' + C.radiusFull + ';cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s ease;color:' + C.textMuted + '}',
      '.punk-close:hover{background:rgba(158,206,106,.2);color:' + C.primary + '}',

      '.punk-trigger{transition:transform .18s ease,box-shadow .18s ease}',
      '.punk-trigger:hover:not(.punk-dragging){transform:scale(1.08);box-shadow:0 12px 32px rgba(124,58,237,.35)}',

      '.punk-label{display:flex;align-items:center;padding:5px 6px;cursor:pointer;border-radius:' + C.radiusSm + ';transition:background .18s ease;background:' + C.surface + '}',
      '.punk-label:hover{background:' + C.bgActive + '}',
    ].join('\n');
    document.head.appendChild(s);
  }

  function showToast(msg) {
    var t = el('div', 'punk-anim',
      'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-12px);' +
      'padding:10px 24px;background:' + C.primary + ';color:#fff;border-radius:' + C.radius + ';' +
      'font-size:14px;z-index:10000010;box-shadow:' + C.shadow3 + ';' +
      'font-family:' + C.font + ';transition:opacity .25s,transform .25s;opacity:0;'
    );
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(-12px)';
      setTimeout(function () { t.remove(); }, 250);
    }, 2000);
  }

  // ─── 搜索页：引擎跳转面板 ───
  function initSearchPage() {
    var keyword = getKeyword();
    if (!keyword) return;

    var enabled = getEnabledMarks();
    var href = window.location.href;
    var pos = GM_getValue('punk_search_position', { x: 10, y: 10 });
    var expanded = GM_getValue('punk_search_expanded', false);

    var box = el('div', null,
      'position:fixed;top:' + pos.y + 'px;left:' + pos.x + 'px;z-index:9999999;font-family:' + C.font + ';contain:layout;'
    );

    var btn = el('button', 'punk-anim',
      'padding:8px 10px;background:' + C.grad + ';color:#fff;border:none;' +
      'border-radius:' + C.radiusSm + ';cursor:pointer;font-size:14px;font-weight:600;' +
      'box-shadow:' + C.shadow2 + ';transition:transform .18s ease,box-shadow .18s ease;'
    );
    btn.appendChild(svgEl(ICON.star));

    var panel = el('div', 'punk-anim',
      'position:absolute;top:40px;left:0;' +
      'background:' + C.glass + ';backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' +
      'border:1px solid ' + C.glassBorder + ';border-radius:' + C.radius + ';padding:12px;' +
      'box-shadow:' + C.shadow3 + ';min-width:320px;max-width:90vw;' +
      'display:' + (expanded ? 'block' : 'none') + ';'
    );

    var wrap = el('div', null, 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;');

    enabled.forEach(function (mark) {
      var eng = ENGINE_MAP[mark];
      if (!eng) return;
      var isActive = eng.match.test(href);
      var a = el('a', 'punk-eng' + (isActive ? ' punk-eng-active' : ''));
      a.href = eng.url + encodeURIComponent(keyword);
      a.target = '_blank';
      a.textContent = eng.name;
      wrap.appendChild(a);
    });

    var cfgBtn = el('button', 'punk-btn',
      'padding:5px 8px;margin:2px;background:' + C.cta + ';color:#fff;border:none;' +
      'border-radius:' + C.radiusSm + ';cursor:pointer;font-size:12px;font-weight:500;white-space:nowrap;'
    );
    cfgBtn.appendChild(svgEl(ICON.settings));
    cfgBtn.title = '设置';
    cfgBtn.addEventListener('click', function () {
      openQuickSearch();
      setTimeout(function () {
        var tabs = document.querySelectorAll('#punk-qs .punk-tab');
        tabs.forEach(function (t) { if (t.textContent.indexOf('设置') !== -1) t.click(); });
      }, 80);
    });
    wrap.appendChild(cfgBtn);
    panel.appendChild(wrap);
    box.appendChild(btn);
    box.appendChild(panel);

    var isExpanded = expanded;
    var dragHandler = DragManager.create(btn, {
      onMove: function (e, deltaX, deltaY, elemStartX, elemStartY) {
        box.style.left = Math.max(0, Math.min(window.innerWidth - 100, elemStartX + deltaX)) + 'px';
        box.style.top = Math.max(0, Math.min(window.innerHeight - 50, elemStartY + deltaY)) + 'px';
      },
      savePosition: function () {
        GM_setValue('punk_search_position', { x: parseInt(box.style.left), y: parseInt(box.style.top) });
      },
      getInitialPosition: function () {
        return { x: parseInt(box.style.left) || pos.x, y: parseInt(box.style.top) || pos.y };
      }
    });

    btn.addEventListener('click', function () {
      if (dragHandler.hasDragged()) {
        dragHandler.resetDrag();
        return;
      }
      isExpanded = !isExpanded;
      panel.style.display = isExpanded ? 'block' : 'none';
      GM_setValue('punk_search_expanded', isExpanded);
    });

    document.addEventListener('click', function (e) {
      if (dragHandler.hasDragged()) return;
      if (isExpanded && !box.contains(e.target)) {
        isExpanded = false;
        panel.style.display = 'none';
        GM_setValue('punk_search_expanded', false);
      }
    });

    document.body.appendChild(box);
  }

  // ─── 非搜索页：快捷搜索触发按钮 ───
  function initQuickSearch() {
    var savedPos = GM_getValue('punk_quick_search_position', { left: 20, bottom: 80 });

    var trigger = el('div', 'punk-trigger',
      'position:fixed;bottom:' + savedPos.bottom + 'px;left:' + savedPos.left + 'px;' +
      'width:48px;height:48px;background:' + C.grad + ';color:#fff;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;cursor:move;z-index:9999998;' +
      'box-shadow:' + C.shadow3 + ';'
    );
    trigger.appendChild(svgEl(ICON.planet));
    trigger.id = 'punk-qs-trigger';

    var dragHandler = DragManager.create(trigger, {
      onMove: function (e, deltaX, deltaY, elemStartLeft, elemStartBottom) {
        trigger.style.left = Math.max(0, Math.min(elemStartLeft + deltaX, window.innerWidth - 50)) + 'px';
        trigger.style.bottom = Math.max(0, Math.min(elemStartBottom - deltaY, window.innerHeight - 50)) + 'px';
      },
      savePosition: function () {
        GM_setValue('punk_quick_search_position', {
          left: parseInt(trigger.style.left),
          bottom: parseInt(trigger.style.bottom),
        });
      },
      getInitialPosition: function () {
        return {
          x: parseInt(trigger.style.left) || savedPos.left,
          y: parseInt(trigger.style.bottom) || savedPos.bottom
        };
      }
    });

    trigger.addEventListener('click', function () {
      if (dragHandler.hasDragged()) {
        dragHandler.resetDrag();
        return;
      }
      if (dragHandler.getClickDuration() > 200) return;
      toggleJumpPanel(trigger);
    });

    document.body.appendChild(trigger);
  }

  // ─── 跳转面板 ───
  var activePanelHandler = null;

  function toggleJumpPanel(anchor) {
    var existing = document.getElementById('punk-jump-panel');
    if (existing) {
      existing.remove();
      if (activePanelHandler) {
        document.removeEventListener('click', activePanelHandler);
        activePanelHandler = null;
      }
      return;
    }

    var enabled = getEnabledMarks();
    var panel = el('div', 'punk-anim',
      'position:fixed;bottom:80px;right:20px;' +
      'background:' + C.glass + ';backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' +
      'border:1px solid ' + C.glassBorder + ';border-radius:' + C.radius + ';padding:16px;' +
      'box-shadow:' + C.shadow3 + ';min-width:280px;max-width:320px;z-index:9999997;' +
      'font-family:' + C.font + ';animation:punkSlide .2s ease;'
    );
    panel.id = 'punk-jump-panel';

    var title = el('div', null,
      'display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600;color:' + C.text + ';' +
      'margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid ' + C.glassBorder + ';'
    );
    title.appendChild(svgEl(ICON.star));
    title.appendChild(document.createTextNode('搜索引擎跳转'));
    panel.appendChild(title);

    var wrap = el('div', null, 'display:flex;flex-wrap:wrap;gap:6px;');

    enabled.forEach(function (mark) {
      var eng = ENGINE_MAP[mark];
      if (!eng) return;
      var b = el('button', 'punk-pop-btn');
      b.textContent = eng.name;
      b.addEventListener('click', function () {
        panel.remove();
        if (activePanelHandler) {
          document.removeEventListener('click', activePanelHandler);
          activePanelHandler = null;
        }
        openQuickSearch(eng);
      });
      wrap.appendChild(b);
    });

    panel.appendChild(wrap);

    var close = el('button', 'punk-close',
      'position:absolute;top:8px;right:8px;'
    );
    close.appendChild(svgEl(ICON.close));
    close.addEventListener('click', function () {
      panel.remove();
      if (activePanelHandler) {
        document.removeEventListener('click', activePanelHandler);
        activePanelHandler = null;
      }
    });
    panel.appendChild(close);

    activePanelHandler = function (e) {
      if (!panel.contains(e.target) && e.target !== anchor && !anchor.contains(e.target)) {
        panel.remove();
        document.removeEventListener('click', activePanelHandler);
        activePanelHandler = null;
      }
    };
    document.addEventListener('click', activePanelHandler);

    document.body.appendChild(panel);
  }

  // ─── 星际搜索面板 ───
  function openQuickSearch(presetEngine) {
    injectCSS();
    var existing = document.getElementById('punk-qs');
    if (existing) { existing.remove(); return; }

    var div = el('div', 'punk-anim',
      'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.92);' +
      'width:90%;max-width:600px;max-height:80vh;' +
      'background:' + C.glass + ';backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);' +
      'border:1px solid ' + C.glassBorder + ';border-radius:16px;' +
      'box-shadow:' + C.shadow4 + ';z-index:10000001;overflow:hidden;' +
      'font-family:' + C.font + ';animation:punkIn .22s ease forwards;'
    );
    div.id = 'punk-qs';

    var header = el('div', null,
      'padding:20px 28px;background:' + C.grad + ';color:#fff;text-align:center;position:relative;'
    );

    var closeBtn = el('button', null,
      'position:absolute;top:12px;right:16px;width:32px;height:32px;background:rgba(86,95,137,.2);' +
      'border:none;border-radius:50%;cursor:pointer;color:' + C.text + ';' +
      'transition:background .15s;display:flex;align-items:center;justify-content:center;'
    );
    closeBtn.appendChild(svgEl(ICON.close));
    closeBtn.title = '关闭 (ESC)';
    closeBtn.addEventListener('mouseenter', function () { closeBtn.style.background = 'rgba(158,206,106,.25)'; });
    closeBtn.addEventListener('mouseleave', function () { closeBtn.style.background = 'rgba(86,95,137,.2)'; });
    closeBtn.addEventListener('click', function () { div.remove(); });
    header.appendChild(closeBtn);

    var h2 = el('h2', null, 'display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 12px 0;font-size:22px;font-weight:600;');
    h2.appendChild(svgEl(ICON.planet));
    h2.appendChild(document.createTextNode('星际搜索'));
    header.appendChild(h2);

    var inputWrap = el('div', null, 'position:relative;max-width:380px;margin:0 auto;');
    var input = el('input', null,
      'width:100%;padding:12px 40px 12px 18px;border:1px solid ' + C.glassBorder + ';border-radius:24px;font-size:14px;' +
      'outline:none;background:rgba(36,40,59,0.9);color:' + C.text + ';' +
      'box-shadow:0 4px 12px rgba(0,0,0,.3);box-sizing:border-box;' +
      'transition:box-shadow .2s;'
    );
    input.type = 'text';
    input.placeholder = '探索宇宙中的知识...';
    input.id = 'punk-qs-input';
    input.addEventListener('focus', function () { input.style.boxShadow = '0 0 0 3px rgba(158,206,106,.2), 0 4px 12px rgba(0,0,0,.3)'; });
    input.addEventListener('blur', function () { input.style.boxShadow = '0 4px 12px rgba(0,0,0,.3)'; });

    var clearBtn = el('button', null,
      'position:absolute;right:12px;top:50%;transform:translateY(-50%);width:22px;height:22px;' +
      'background:rgba(86,95,137,.2);border:none;border-radius:50%;cursor:pointer;' +
      'color:' + C.textMuted + ';transition:background .15s;display:flex;align-items:center;justify-content:center;'
    );
    clearBtn.appendChild(svgEl(ICON.close));
    clearBtn.addEventListener('mouseenter', function () { clearBtn.style.background = 'rgba(86,95,137,.35)'; });
    clearBtn.addEventListener('mouseleave', function () { clearBtn.style.background = 'rgba(86,95,137,.2)'; });
    clearBtn.addEventListener('click', function () { input.value = ''; input.focus(); });
    inputWrap.appendChild(input);
    inputWrap.appendChild(clearBtn);
    header.appendChild(inputWrap);
    div.appendChild(header);

    var content = el('div', null,
      'padding:0;max-height:50vh;overflow-y:auto;background:' + C.surface + ';'
    );

    var tabBar = el('div', null,
      'display:flex;background:' + C.glassDark + ';border-bottom:1px solid ' + C.glassBorder + ';' +
      'overflow-x:auto;scrollbar-width:none;'
    );
    var tabBody = el('div', null, 'padding:16px 20px;');

    var allTabs = QUICK_TABS.concat([{ tab: '设置', isSettings: true }]);
    var activeTab = null;
    var selectedEngine = presetEngine || (QUICK_TABS[0] && QUICK_TABS[0].list[0]) || null;

    function activateTab(tabBtn, config) {
      tabBar.querySelectorAll('.punk-tab').forEach(function (b) { b.classList.remove('punk-tab-active'); });
      tabBtn.classList.add('punk-tab-active');
      if (config.isSettings) renderSettings(); else renderTab(config.list);
      activeTab = tabBtn;
    }

    allTabs.forEach(function (config, i) {
      var t = el('button', 'punk-tab' + (i === 0 ? ' punk-tab-active' : ''));
      t.textContent = config.tab;
      if (i === 0) activeTab = t;
      t.addEventListener('click', function () { activateTab(t, config); });
      tabBar.appendChild(t);
    });

    function renderTab(list) {
      tabBody.innerHTML = '';
      var grid = el('div', null, 'display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;');
      list.forEach(function (item) {
        var b = el('button', 'punk-grid-btn');
        b.textContent = item.name;
        b.addEventListener('mouseenter', function () { selectedEngine = item; });
        b.addEventListener('click', function () {
          var kw = input.value.trim();
          if (kw) window.open(item.url + encodeURIComponent(kw), '_blank');
        });
        grid.appendChild(b);
      });
      tabBody.appendChild(grid);
    }

    function renderSettings() {
      tabBody.innerHTML = '';
      var enabled = getEnabledMarks();

      var presetBox = el('div', null,
        'margin-bottom:16px;padding:12px;background:' + C.glassDark + ';border-radius:' + C.radius + ';border:1px solid ' + C.glassBorder + ';'
      );
      var presetTitle = el('h4', null, 'margin:0 0 10px 0;color:' + C.text + ';font-size:13px;font-weight:600;');
      presetTitle.textContent = '快速预设';
      presetBox.appendChild(presetTitle);
      var presetWrap = el('div', null, 'display:flex;flex-wrap:wrap;gap:6px;');

      [
        { name: '国内预设', mark: PRESETS.default },
        { name: '国际预设', mark: PRESETS.international },
        { name: '图片预设', mark: PRESETS.image },
        { name: '壁纸预设', mark: PRESETS.wallpaper },
        { name: '全部预设', mark: PRESETS.all },
      ].forEach(function (p) {
        var b = el('button', 'punk-preset');
        b.textContent = p.name;
        b.addEventListener('click', function () {
          GM_setValue('punk_setup_search', p.mark);
          renderSettings();
        });
        presetWrap.appendChild(b);
      });

      presetBox.appendChild(presetWrap);
      tabBody.appendChild(presetBox);

      var engBox = el('div', null, 'margin-top:12px;');
      var engTitle = el('h4', null, 'margin:0 0 10px 0;color:' + C.text + ';font-size:13px;font-weight:600;');
      engTitle.textContent = '自定义搜索引擎';
      engBox.appendChild(engTitle);

      var grid = el('div', null,
        'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;' +
        'max-height:200px;overflow-y:auto;padding:10px;background:' + C.glassDark + ';' +
        'border:1px solid ' + C.glassBorder + ';border-radius:' + C.radius + ';'
      );

      ENGINES.forEach(function (eng) {
        var label = el('label', 'punk-label');
        var cb = el('input', null, 'margin-right:6px;width:14px;height:14px;accent-color:' + C.primary + ';cursor:pointer;');
        cb.type = 'checkbox';
        cb.dataset.mark = eng.mark;
        cb.checked = enabled.indexOf(eng.mark) !== -1;
        var span = el('span', null, 'font-size:12px;color:' + C.text + ';');
        span.textContent = eng.name;
        label.appendChild(cb);
        label.appendChild(span);
        grid.appendChild(label);
      });

      engBox.appendChild(grid);

      var save = el('button', 'punk-save');
      save.textContent = '保存设置';
      save.addEventListener('click', function () {
        var selected = [];
        grid.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
          if (cb.checked) selected.push(cb.dataset.mark);
        });
        GM_setValue('punk_setup_search', selected.join('-'));
        showToast('设置已保存，页面即将刷新');
        setTimeout(function () { location.reload(); }, 800);
      });
      engBox.appendChild(save);
      tabBody.appendChild(engBox);
    }

    if (QUICK_TABS[0] && QUICK_TABS[0].list) {
      renderTab(QUICK_TABS[0].list);
    }
    content.appendChild(tabBar);
    content.appendChild(tabBody);
    div.appendChild(content);

    if (presetEngine) {
      var kw = input.value.trim();
      if (kw) {
        window.open(presetEngine.url + encodeURIComponent(kw), '_blank');
        div.remove();
        return;
      }
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var k = input.value.trim();
        if (!k) return;
        if (selectedEngine) {
          window.open(selectedEngine.url + encodeURIComponent(k), '_blank');
        } else {
          var firstBtn = div.querySelector('.punk-grid-btn');
          if (firstBtn) firstBtn.click();
        }
      }
    });

    document.body.appendChild(div);
    setTimeout(function () { input.focus(); }, 60);
  }

  // ─── 初始化 ───
  function init() {
    injectCSS();
    if (isSearchPage()) initSearchPage();
    else initQuickSearch();

    if (!window.__punkEsc) {
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var qs = document.getElementById('punk-qs');
        if (qs) { qs.remove(); return; }
        var jp = document.getElementById('punk-jump-panel');
        if (jp) {
          jp.remove();
          if (activePanelHandler) {
            document.removeEventListener('click', activePanelHandler);
            activePanelHandler = null;
          }
        }
      });
      window.__punkEsc = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
