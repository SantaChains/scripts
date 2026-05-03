// ==UserScript==
// @name         搜索引擎一键跳转
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  在搜索结果页面添加其他搜索引擎的快捷跳转按钮，支持自定义搜索引擎
// @author       Punkjet & SantaChains
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @noframes
// @run-at       document-idle
// @updateURL    https://cdn.jsdelivr.net/gh/SantaChains/scripts@latest/SearchRedireact/meta.js
// @downloadURL  https://cdn.jsdelivr.net/gh/SantaChains/scripts@latest/SearchRedireact/user.js
// @supportURL   https://github.com/SantaChains/scripts/issues
// ==/UserScript==

(function () {
  'use strict';

  // ─── 配色常量 ───
  const THEME = {
    grad: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    purple: '#8B5CF6',
    purpleDark: '#7C3AED',
    purpleText: '#5B21B6',
    bgLight: '#F5F3FF',
    bgHover: '#EDE9FE',
    border: '#E0E7FF',
    borderLight: '#DDD6FE',
    textDark: '#1E1B4B',
    textMuted: '#6B7280',
  };

  // ─── 预设标记 ───
  const PRESETS = {
    default: 'Google-Github-Steam-Bing-MitaAI-GoogleScholar-Searx-Bilibili-Zhihu-Weibo-Douban-Quark-Sougou-SougouWeixin-360ai-wallpaper',
    international: 'GooglePatents-Bing-Yahoo-Yandex-DuckDuckGo-YouTube-Wikipedia-Instagram-Qwant-Tiktok',
    image: 'SougouImage-Google-YandexImage-wallpaper-Pixabay-Pexels',
    wallpaper: 'wallpaper-Pixabay-Pexels-WallpaperEngine',
    all: 'Baidu-Bing-360-Quark-Toutiao-Weibo-Zhihu-Douban-MitaAI-Sougou-wallpaper-Pixabay-Pexels-WallpaperEngine-SougouWeixin-Steam-Github-Google-GoogleScholar-SougouImage-SougouXiaohongshu-GooglePatents-Yahoo-Yandex-DuckDuckGo-Swisscows-MetaGer-Searx-Qwant-Ecosia-WolframAlpha-Perplexity-Kagi-Claude-Perplexity-Pro-ChatGPT-Sage-Naver-Daum-Goo-Startpage-Fsou-Ask-AOL-QwantLite-Brave-YouTube-Wikipedia-Instagram-Tiktok-360ai-YandexImage',
  };

  // ─── 搜索引擎配置 ───
  const ENGINES = [
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

  // ─── 快捷搜索分类 ───
  const QUICK_TABS = [
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

  // ─── 常用搜索参数名（优先级从高到低）───
  const SEARCH_PARAMS = ['q', 'wd', 'query', 'keyword', 'search', 'term', 'kw', 'text', 'eingabe', 'p', 'MT', 'search_query', 'searchtext'];

  // ─── 工具函数 ───

  function getKeyword() {
    const params = new URLSearchParams(window.location.search);
    for (const p of SEARCH_PARAMS) {
      const v = params.get(p);
      if (v) return decodeURIComponent(v);
    }
    const tag = window.location.href.match(/instagram\.com\/explore\/tags\/([^/?]+)/);
    return tag ? decodeURIComponent(tag[1]) : '';
  }

  function isSearchPage() {
    const href = window.location.href;
    const params = new URLSearchParams(window.location.search);
    // 快速检查：至少有一个搜索参数
    let hasParam = false;
    for (const p of SEARCH_PARAMS) {
      if (params.has(p)) { hasParam = true; break; }
    }
    if (!hasParam && !href.includes('instagram.com/explore/tags/')) return false;
    // 匹配引擎
    return ENGINES.some(e => e.match.test(href));
  }

  function getEnabledMarks() {
    return GM_getValue('punk_setup_search', PRESETS.default).split('-');
  }

  function createEl(tag, styles, attrs) {
    const el = document.createElement(tag);
    if (styles) el.style.cssText = styles;
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  // 内联 toast 替代 alert()
  function showToast(msg, duration) {
    duration = duration || 2000;
    const t = createEl('div',
      'position:fixed;top:20px;left:50%;transform:translateX(-50%);' +
      'padding:10px 24px;background:' + THEME.purple + ';color:#fff;' +
      'border-radius:8px;font-size:14px;z-index:10000010;' +
      'box-shadow:0 4px 16px rgba(102,126,234,0.4);' +
      'transition:opacity 0.3s;opacity:0;'
    );
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; });
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  // ─── CSS 动画（单例注入）───
  function ensureAnimations() {
    if (document.getElementById('punk-css')) return;
    const s = createEl('style', null, { id: 'punk-css' });
    s.textContent =
      '@keyframes punkAppear{from{opacity:0;transform:translate(-50%,-50%) scale(.85)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}' +
      '@keyframes punkFadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }

  // ─── 搜索页：引擎跳转面板 ───
  function initSearchPage() {
    const keyword = getKeyword();
    if (!keyword) return;

    const enabled = getEnabledMarks();
    const href = window.location.href;
    const pos = GM_getValue('punk_search_position', { x: 10, y: 10 });
    let expanded = GM_getValue('punk_search_expanded', false);

    // 主容器
    const box = createEl('div',
      'position:fixed;top:' + pos.y + 'px;left:' + pos.x + 'px;z-index:9999999;font-family:Arial,sans-serif;'
    );

    // 切换按钮
    const btn = createEl('button',
      'padding:8px 10px;background:' + THEME.grad + ';color:#fff;border:none;' +
      'border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;' +
      'box-shadow:0 4px 12px rgba(102,126,234,.35);transition:transform .15s,box-shadow .15s;'
    );
    btn.textContent = '⭐';

    // 面板
    const panel = createEl('div',
      'position:absolute;top:38px;left:0;background:#fff;border:1px solid ' + THEME.border + ';' +
      'border-radius:10px;padding:12px;box-shadow:0 10px 25px -5px rgba(102,126,234,.25),' +
      '0 8px 10px -6px rgba(0,0,0,.1);min-width:320px;max-width:90vw;display:' + (expanded ? 'block' : 'none') + ';'
    );

    // 引擎按钮容器
    const wrap = createEl('div', 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;');

    enabled.forEach(function (mark) {
      var eng = ENGINES.find(function (e) { return e.mark === mark; });
      if (!eng) return;
      var isCurrent = eng.match.test(href);
      var a = createEl('a',
        'display:inline-block;padding:5px 10px;margin:2px;text-decoration:none;' +
        'border-radius:6px;font-size:11px;font-weight:500;white-space:nowrap;' +
        'transition:background .12s,color .12s;cursor:pointer;' +
        'background:' + (isCurrent ? THEME.grad : THEME.bgLight) + ';' +
        'color:' + (isCurrent ? '#fff' : THEME.purpleText) + ';' +
        'box-shadow:' + (isCurrent ? '0 2px 6px rgba(102,126,234,.3)' : 'none') + ';'
      );
      a.href = eng.url + encodeURIComponent(keyword);
      a.target = '_blank';
      a.textContent = eng.name;
      if (!isCurrent) {
        a.addEventListener('mouseenter', function () { a.style.background = THEME.bgHover; a.style.color = THEME.purpleDark; });
        a.addEventListener('mouseleave', function () { a.style.background = THEME.bgLight; a.style.color = THEME.purpleText; });
      }
      wrap.appendChild(a);
    });

    // 设置按钮
    var cfgBtn = createEl('button',
      'padding:5px 8px;margin:2px;background:' + THEME.purple + ';color:#fff;border:none;' +
      'border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;white-space:nowrap;' +
      'transition:background .12s;'
    );
    cfgBtn.textContent = '⚙️';
    cfgBtn.title = '设置';
    cfgBtn.addEventListener('mouseenter', function () { cfgBtn.style.background = THEME.purpleDark; });
    cfgBtn.addEventListener('mouseleave', function () { cfgBtn.style.background = THEME.purple; });
    cfgBtn.addEventListener('click', function () {
      openQuickSearch();
      setTimeout(function () {
        var tabs = document.querySelectorAll('#punk-qs button');
        tabs.forEach(function (t) { if (t.textContent.includes('设置')) t.click(); });
      }, 80);
    });
    wrap.appendChild(cfgBtn);
    panel.appendChild(wrap);
    box.appendChild(btn);
    box.appendChild(panel);

    // 展开/收起
    btn.addEventListener('click', function () {
      expanded = !expanded;
      panel.style.display = expanded ? 'block' : 'none';
      GM_setValue('punk_search_expanded', expanded);
    });

    // 悬停（非拖拽时）
    var isDrag = false;
    btn.addEventListener('mouseenter', function () {
      if (!isDrag) { btn.style.transform = 'scale(1.05)'; btn.style.boxShadow = '0 6px 16px rgba(102,126,234,.45)'; }
    });
    btn.addEventListener('mouseleave', function () {
      if (!isDrag) { btn.style.transform = ''; btn.style.boxShadow = '0 4px 12px rgba(102,126,234,.35)'; }
    });

    // 拖拽（节流 + 按需挂载）
    var dx, dy, rafId = null;
    function onMove(e) {
      if (!isDrag) return;
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        var x = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dx));
        var y = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dy));
        box.style.left = x + 'px';
        box.style.top = y + 'px';
        rafId = null;
      });
    }
    function onUp() {
      if (!isDrag) return;
      isDrag = false;
      btn.style.cursor = 'pointer';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      GM_setValue('punk_search_position', { x: parseInt(box.style.left), y: parseInt(box.style.top) });
    }
    btn.addEventListener('mousedown', function (e) {
      isDrag = true;
      dx = e.clientX - box.offsetLeft;
      dy = e.clientY - box.offsetTop;
      btn.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      e.preventDefault();
    });

    // 点击外部收起
    document.addEventListener('click', function (e) {
      if (expanded && !box.contains(e.target)) {
        expanded = false;
        panel.style.display = 'none';
        GM_setValue('punk_search_expanded', false);
      }
    });

    document.body.appendChild(box);
  }

  // ─── 非搜索页：快捷搜索 ───
  function initQuickSearch() {
    var savedPos = GM_getValue('punk_quick_search_position', { left: 20, bottom: 80 });

    var trigger = createEl('div',
      'position:fixed;bottom:' + savedPos.bottom + 'px;left:' + savedPos.left + 'px;' +
      'width:48px;height:48px;background:' + THEME.grad + ';color:#fff;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;cursor:move;z-index:9999998;' +
      'box-shadow:0 8px 20px rgba(102,126,234,.4);font-size:20px;' +
      'transition:transform .15s,box-shadow .15s;'
    );
    trigger.textContent = '🫰';
    trigger.id = 'punk-qs-trigger';

    // 拖拽 vs 点击判定
    var isDrag = false, hasDrag = false, t0 = 0, sx, sy, sl, sb, rafId = null;

    function onMove(e) {
      if (!isDrag) return;
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasDrag = true;
        trigger.style.left = Math.max(0, Math.min(sl + dx, window.innerWidth - 50)) + 'px';
        trigger.style.bottom = Math.max(0, Math.min(sb - dy, window.innerHeight - 50)) + 'px';
        rafId = null;
      });
    }
    function onUp() {
      if (!isDrag) return;
      isDrag = false;
      trigger.style.cursor = 'move';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      GM_setValue('punk_quick_search_position', {
        left: parseInt(trigger.style.left),
        bottom: parseInt(trigger.style.bottom),
      });
      if (hasDrag) openQuickSearch();
    }

    trigger.addEventListener('mousedown', function (e) {
      isDrag = true; hasDrag = false; t0 = Date.now();
      sx = e.clientX; sy = e.clientY;
      sl = parseInt(trigger.style.left) || 20;
      sb = parseInt(trigger.style.bottom) || 80;
      trigger.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      e.preventDefault();
    });

    trigger.addEventListener('click', function () {
      if (hasDrag) { hasDrag = false; return; }
      if (Date.now() - t0 > 200) return;
      toggleJumpPanel(trigger);
    });

    trigger.addEventListener('mouseenter', function () {
      if (!isDrag) { trigger.style.transform = 'scale(1.1)'; trigger.style.boxShadow = '0 12px 28px rgba(102,126,234,.5)'; }
    });
    trigger.addEventListener('mouseleave', function () {
      if (!isDrag) { trigger.style.transform = ''; trigger.style.boxShadow = '0 8px 20px rgba(102,126,234,.4)'; }
    });

    document.body.appendChild(trigger);
  }

  // ─── 跳转面板（点击触发按钮弹出）───
  function toggleJumpPanel(anchor) {
    var existing = document.getElementById('punk-jump-panel');
    if (existing) { existing.remove(); return; }

    var enabled = getEnabledMarks();
    var panel = createEl('div',
      'position:fixed;bottom:80px;right:20px;background:#fff;border:1px solid ' + THEME.border + ';' +
      'border-radius:12px;padding:16px;box-shadow:0 10px 25px -5px rgba(102,126,234,.25),' +
      '0 8px 10px -6px rgba(0,0,0,.1);min-width:280px;max-width:320px;z-index:9999997;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
      'animation:punkFadeIn .2s ease;'
    );
    panel.id = 'punk-jump-panel';

    var title = createEl('div',
      'font-size:14px;font-weight:600;color:' + THEME.purpleText + ';' +
      'margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid ' + THEME.border + ';'
    );
    title.textContent = '⭐ 搜索引擎跳转';
    panel.appendChild(title);

    var wrap = createEl('div', 'display:flex;flex-wrap:wrap;gap:6px;');

    enabled.forEach(function (mark) {
      var eng = ENGINES.find(function (e) { return e.mark === mark; });
      if (!eng) return;
      var b = createEl('button',
        'padding:6px 12px;background:' + THEME.bgLight + ';color:' + THEME.purpleText + ';' +
        'border:1px solid ' + THEME.borderLight + ';border-radius:6px;font-size:12px;' +
        'font-weight:500;cursor:pointer;transition:background .12s,color .12s;'
      );
      b.textContent = eng.name;
      b.addEventListener('mouseenter', function () { b.style.background = THEME.purple; b.style.color = '#fff'; b.style.borderColor = THEME.purple; });
      b.addEventListener('mouseleave', function () { b.style.background = THEME.bgLight; b.style.color = THEME.purpleText; b.style.borderColor = THEME.borderLight; });
      b.addEventListener('click', function () {
        panel.remove();
        openQuickSearch(eng);
      });
      wrap.appendChild(b);
    });

    panel.appendChild(wrap);

    var close = createEl('button',
      'position:absolute;top:8px;right:8px;width:24px;height:24px;background:#F3F4F6;' +
      'border:none;border-radius:50%;font-size:16px;color:' + THEME.textMuted + ';' +
      'cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .12s;'
    );
    close.textContent = '×';
    close.addEventListener('mouseenter', function () { close.style.background = '#E5E7EB'; });
    close.addEventListener('mouseleave', function () { close.style.background = '#F3F4F6'; });
    close.addEventListener('click', function () { panel.remove(); });
    panel.appendChild(close);

    document.addEventListener('click', function handler(e) {
      if (!panel.contains(e.target) && e.target !== anchor && !anchor.contains(e.target)) {
        panel.remove();
        document.removeEventListener('click', handler);
      }
    });

    document.body.appendChild(panel);
  }

  // ─── 星际搜索面板 ───
  function openQuickSearch(presetEngine) {
    ensureAnimations();
    var existing = document.getElementById('punk-qs');
    if (existing) { existing.remove(); return; }

    var div = createEl('div',
      'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.95);' +
      'width:90%;max-width:600px;max-height:80vh;background:#fff;' +
      'border:1px solid ' + THEME.border + ';border-radius:16px;' +
      'box-shadow:0 25px 50px -12px rgba(102,126,234,.25);z-index:10000001;' +
      'overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
      'animation:punkAppear .2s ease forwards;'
    );
    div.id = 'punk-qs';

    // 头部
    var header = createEl('div',
      'padding:20px 28px;background:' + THEME.grad + ';color:#fff;text-align:center;position:relative;'
    );

    var closeBtn = createEl('button',
      'position:absolute;top:12px;right:16px;width:32px;height:32px;background:rgba(255,255,255,.2);' +
      'border:none;border-radius:50%;font-size:20px;cursor:pointer;color:#fff;' +
      'transition:background .12s;display:flex;align-items:center;justify-content:center;line-height:1;'
    );
    closeBtn.textContent = '×';
    closeBtn.title = '关闭 (ESC)';
    closeBtn.addEventListener('mouseenter', function () { closeBtn.style.background = 'rgba(255,255,255,.35)'; });
    closeBtn.addEventListener('mouseleave', function () { closeBtn.style.background = 'rgba(255,255,255,.2)'; });
    closeBtn.addEventListener('click', function () { div.remove(); });
    header.appendChild(closeBtn);

    var h2 = createEl('h2', 'margin:0 0 12px 0;font-size:22px;font-weight:600;');
    h2.textContent = '🫰 星际搜索';
    header.appendChild(h2);

    var inputWrap = createEl('div', 'position:relative;max-width:380px;margin:0 auto;');
    var input = createEl('input', null, {
      type: 'text', placeholder: '探索宇宙中的知识...', id: 'punk-qs-input',
      style: 'width:100%;padding:12px 40px 12px 18px;border:none;border-radius:24px;font-size:14px;' +
             'outline:none;background:rgba(255,255,255,.95);color:#1F2937;' +
             'box-shadow:0 4px 12px rgba(0,0,0,.15);box-sizing:border-box;',
    });
    var clearBtn = createEl('button',
      'position:absolute;right:12px;top:50%;transform:translateY(-50%);width:22px;height:22px;' +
      'background:#E5E7EB;border:none;border-radius:50%;font-size:14px;cursor:pointer;' +
      'color:' + THEME.textMuted + ';transition:background .12s;display:flex;align-items:center;' +
      'justify-content:center;line-height:1;'
    );
    clearBtn.textContent = '×';
    clearBtn.addEventListener('mouseenter', function () { clearBtn.style.background = '#D1D5DB'; });
    clearBtn.addEventListener('mouseleave', function () { clearBtn.style.background = '#E5E7EB'; });
    clearBtn.addEventListener('click', function () { input.value = ''; input.focus(); });
    inputWrap.appendChild(input);
    inputWrap.appendChild(clearBtn);
    header.appendChild(inputWrap);
    div.appendChild(header);

    // 内容区
    var content = createEl('div', 'padding:0;max-height:50vh;overflow-y:auto;background:' + THEME.bgLight + ';');

    // 标签栏
    var tabBar = createEl('div',
      'display:flex;background:#fff;border-bottom:1px solid ' + THEME.border + ';' +
      'overflow-x:auto;scrollbar-width:none;'
    );
    var tabBody = createEl('div', 'padding:16px 20px;');

    var allTabs = QUICK_TABS.concat([{ tab: '⚙️ 设置', isSettings: true }]);
    var activeTab = null;

    function activateTab(tabBtn, config) {
      tabBar.querySelectorAll('button').forEach(function (b) {
        b.style.background = 'transparent'; b.style.color = THEME.textMuted;
        b.style.borderBottom = '2px solid transparent'; b.style.fontWeight = '500';
      });
      tabBtn.style.background = THEME.bgLight; tabBtn.style.color = THEME.purpleDark;
      tabBtn.style.borderBottom = '2px solid ' + THEME.purple; tabBtn.style.fontWeight = '600';
      if (config.isSettings) renderSettings(); else renderTab(config.list);
      activeTab = tabBtn;
    }

    allTabs.forEach(function (config, i) {
      var t = createEl('button',
        'padding:10px 18px;border:none;background:' + (i === 0 ? THEME.bgLight : 'transparent') + ';' +
        'color:' + (i === 0 ? THEME.purpleDark : THEME.textMuted) + ';cursor:pointer;' +
        'border-bottom:2px solid ' + (i === 0 ? THEME.purple : 'transparent') + ';' +
        'white-space:nowrap;font-size:13px;font-weight:' + (i === 0 ? '600' : '500') + ';' +
        'transition:background .12s;color .12s;margin:0;'
      );
      t.textContent = config.tab;
      if (i === 0) activeTab = t;
      t.addEventListener('click', function () { activateTab(t, config); });
      t.addEventListener('mouseenter', function () { if (t !== activeTab) t.style.background = THEME.bgLight; });
      t.addEventListener('mouseleave', function () { if (t !== activeTab) t.style.background = 'transparent'; });
      tabBar.appendChild(t);
    });

    // 渲染标签内容
    function renderTab(list) {
      tabBody.innerHTML = '';
      var grid = createEl('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;');
      list.forEach(function (item) {
        var b = createEl('button',
          'padding:8px 12px;border:1px solid ' + THEME.borderLight + ';background:#fff;' +
          'border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;color:' + THEME.textDark + ';' +
          'transition:background .12s,color .12s;'
        );
        b.textContent = item.name;
        b.addEventListener('mouseenter', function () { b.style.background = THEME.purple; b.style.color = '#fff'; b.style.borderColor = THEME.purple; });
        b.addEventListener('mouseleave', function () { b.style.background = '#fff'; b.style.color = THEME.textDark; b.style.borderColor = THEME.borderLight; });
        b.addEventListener('click', function () {
          var kw = input.value.trim();
          if (kw) window.open(item.url + encodeURIComponent(kw), '_blank');
        });
        grid.appendChild(b);
      });
      tabBody.appendChild(grid);
    }

    // 渲染设置
    function renderSettings() {
      tabBody.innerHTML = '';
      var enabled = getEnabledMarks();

      // 预设区
      var presetBox = createEl('div',
        'margin-bottom:16px;padding:12px;background:#fff;border-radius:8px;border:1px solid ' + THEME.border + ';'
      );
      var presetTitle = createEl('h4', 'margin:0 0 10px 0;color:' + THEME.textDark + ';font-size:13px;font-weight:600;');
      presetTitle.textContent = '快速预设';
      presetBox.appendChild(presetTitle);
      var presetWrap = createEl('div', 'display:flex;flex-wrap:wrap;gap:6px;');

      [
        { name: '国内预设', mark: PRESETS.default },
        { name: '国际预设', mark: PRESETS.international },
        { name: '图片预设', mark: PRESETS.image },
        { name: '壁纸预设', mark: PRESETS.wallpaper },
        { name: '全部预设', mark: PRESETS.all },
      ].forEach(function (p) {
        var b = createEl('button',
          'flex:1;min-width:70px;padding:6px 10px;background:' + THEME.purple + ';border:none;' +
          'color:#fff;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;transition:background .12s;'
        );
        b.textContent = p.name;
        b.addEventListener('mouseenter', function () { b.style.background = THEME.purpleDark; });
        b.addEventListener('mouseleave', function () { b.style.background = THEME.purple; });
        b.addEventListener('click', function () {
          GM_setValue('punk_setup_search', p.mark);
          renderSettings();
        });
        presetWrap.appendChild(b);
      });

      presetBox.appendChild(presetWrap);
      tabBody.appendChild(presetBox);

      // 引擎选择区
      var engBox = createEl('div', 'margin-top:12px;');
      var engTitle = createEl('h4', 'margin:0 0 10px 0;color:' + THEME.textDark + ';font-size:13px;font-weight:600;');
      engTitle.textContent = '自定义搜索引擎';
      engBox.appendChild(engTitle);

      var grid = createEl('div',
        'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;' +
        'max-height:200px;overflow-y:auto;padding:10px;background:#fff;border:1px solid ' + THEME.border + ';border-radius:8px;'
      );

      ENGINES.forEach(function (eng) {
        var label = createEl('label',
          'display:flex;align-items:center;padding:5px 6px;cursor:pointer;border-radius:6px;' +
          'transition:background .12s;background:' + THEME.bgLight + ';'
        );
        label.addEventListener('mouseenter', function () { label.style.background = THEME.bgHover; });
        label.addEventListener('mouseleave', function () { label.style.background = THEME.bgLight; });

        var cb = createEl('input', null, {
          type: 'checkbox', 'data-mark': eng.mark,
          style: 'margin-right:6px;width:14px;height:14px;accent-color:' + THEME.purple + ';cursor:pointer;',
        });
        cb.checked = enabled.includes(eng.mark);

        var span = createEl('span', 'font-size:12px;color:' + THEME.textDark + ';');
        span.textContent = eng.name;
        label.appendChild(cb);
        label.appendChild(span);
        grid.appendChild(label);
      });

      engBox.appendChild(grid);

      // 保存按钮
      var save = createEl('button',
        'margin-top:12px;padding:8px 20px;background:' + THEME.purple + ';color:#fff;border:none;' +
        'border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;transition:background .12s;'
      );
      save.textContent = '保存设置';
      save.addEventListener('mouseenter', function () { save.style.background = THEME.purpleDark; });
      save.addEventListener('mouseleave', function () { save.style.background = THEME.purple; });
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

    // 默认显示第一个标签
    renderTab(QUICK_TABS[0].list);

    content.appendChild(tabBar);
    content.appendChild(tabBody);
    div.appendChild(content);

    // 如果有预设引擎，直接打开
    if (presetEngine) {
      var kw = input.value.trim();
      if (kw) {
        window.open(presetEngine.url + encodeURIComponent(kw), '_blank');
        div.remove();
        return;
      }
    }

    // 搜索框回车
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var kw = input.value.trim();
        if (kw) window.open('https://www.google.com/search?q=' + encodeURIComponent(kw), '_blank');
      }
    });

    document.body.appendChild(div);
    setTimeout(function () { input.focus(); }, 60);
  }

  // ─── 初始化 ───
  function init() {
    var isSearch = isSearchPage();
    if (isSearch) initSearchPage();
    else initQuickSearch();

    // ESC 关闭（全局单例）
    if (!window.__punkEsc) {
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var qs = document.getElementById('punk-qs');
        if (qs) { qs.remove(); return; }
        var jp = document.getElementById('punk-jump-panel');
        if (jp) jp.remove();
      });
      window.__punkEsc = true;
    }
  }

  // @run-at document-idle 时 readyState 已经是 complete
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
