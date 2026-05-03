// ==UserScript==
// @name         Link Clear
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  去除链接追踪参数、解析搜索引擎跳转、净化短链接
// @author       SantaChains
// @match        *://*/*
// @grant        GM_setClipboard
// @noframes
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/SantaChains/scripts/main/link-clear/meta.js
// @downloadURL  https://raw.githubusercontent.com/SantaChains/scripts/main/link-clear/user.js
// @supportURL   https://github.com/SantaChains/scripts/issues
// ==/UserScript==

(function () {
  'use strict';

  // ─── 配色（Nerd Dark，与 SearchRedireact 统一）───
  var C = {
    bg: '#1a1b26',
    surface: '#24283b',
    border: 'rgba(86,95,137,0.25)',
    text: '#c0caf5',
    textMuted: '#565f89',
    primary: '#9ece6a',
    primaryHover: '#73daca',
    accent: '#bb9af7',
    danger: '#f7768e',
    font: '"JetBrains Mono","Fira Code","Cascadia Code",Consolas,monospace',
    radius: '12px',
    radiusSm: '8px',
  };

  // ─── 通用追踪参数（全平台）───
  var TRACKING_PARAMS = [
    // UTM 系列
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id',
    // Google Ads
    'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid',
    // Facebook
    'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_ref', 'fb_source',
    // Microsoft
    'msclkid',
    // Twitter/X
    'twclid', '_ga', '_gl',
    // WeChat
    'chksm', 'scene', 'subscene', 'key', 'uin', 'devicetype',
    // 通用追踪
    'ref', 'from', 'source', 'share_source', 'share_medium', 'share_id',
    'spm_id_from', 'spm', 'clickid', 'click_id', 'yclid', 'ymclid',
    'mc_cid', 'mc_eid', 'oly_enc_id', 'oly_anon_id',
    // 分析追踪
    'hsa_cam', 'hsa_grp', 'hsa_mt', 'hsa_src', 'hsa_ad', 'hsa_acc',
    'hsa_net', 'hsa_ver', 'hsa_la', 'hsa_ol', 'hsa_kw', 'hsa_tgt',
    '_hsenc', '_hsmi', '__hssc', '__hstc', 'hsCtaTracking',
  ];

  // ─── 特定站点参数 ───
  var SITE_PARAMS = {
    // Bilibili
    'bilibili.com': ['vd_source', 'spm_id_from', 'from_source', 'from', 'seid', 'share_source', 'share_medium', 'share_plat', 'unique_k', 'buvid', 'is_story_h5'],
    // 淘宝/天猫
    'taobao.com': ['spm', 'scm', 'scm_id', 'pvid', 'ut_sk', 'app', 'from', 'source'],
    'tmall.com': ['spm', 'scm', 'scm_id', 'pvid', 'ut_sk', 'from', 'source'],
    // 京东
    'jd.com': ['cu', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'abt', 'scm', 'pvid'],
    // 拼多多
    'yangkeduo.com': ['from_source', 'share_mall', 'share_goods_id'],
    // YouTube
    'youtube.com': ['si', 'feature', 'app', 'pp'],
    // Twitter/X
    'x.com': ['s', 't', 'ref_src', 'ref_url'],
    'twitter.com': ['s', 't', 'ref_src', 'ref_url'],
    // 知乎
    'zhihu.com': ['utm_id', 'utm_source', 'utm_medium', 'utm_content', 'share_type'],
    // 微博
    'weibo.com': ['sudaref', 'source', 'from'],
    // 抖音
    'douyin.com': ['previous_page', 'modal_id', 'enter_from', 'share_from'],
    // 小红书
    'xiaohongshu.com': ['source', 'share_id', 'xsec_source'],
  };

  // ─── 搜索引擎跳转解析 ───
  var REDIRECT_PATTERNS = [
    { host: 'baidu.com', param: 'url', path: '/link' },
    { host: 'baidu.com', param: 'wd', path: '/s', extract: false },
    { host: 'sogou.com', param: 'url', path: '/link' },
    { host: 'so.com', param: 'url', path: '/link' },
    { host: 'google.com', param: 'url', path: '/url' },
    { host: 'bing.com', param: 'url', path: '/cr' },
  ];

  // ─── 工具函数 ───

  function getSiteKey(hostname) {
    for (var key in SITE_PARAMS) {
      if (hostname.indexOf(key) !== -1) return key;
    }
    return null;
  }

  function cleanUrl(rawUrl) {
    try {
      var url = new URL(rawUrl);
      var hostname = url.hostname;

      // 检查搜索引擎跳转
      for (var i = 0; i < REDIRECT_PATTERNS.length; i++) {
        var rp = REDIRECT_PATTERNS[i];
        if (hostname.indexOf(rp.host) !== -1 && url.pathname.indexOf(rp.path) === 0) {
          var real = url.searchParams.get(rp.param);
          if (real && real.indexOf('http') === 0) {
            try {
              url = new URL(real);
              hostname = url.hostname;
            } catch (e) { /* not a valid URL, keep original */ }
          }
        }
      }

      // 移除通用追踪参数
      TRACKING_PARAMS.forEach(function (p) { url.searchParams.delete(p); });

      // 移除站点特定参数
      var siteKey = getSiteKey(hostname);
      if (siteKey && SITE_PARAMS[siteKey]) {
        SITE_PARAMS[siteKey].forEach(function (p) { url.searchParams.delete(p); });
      }

      // 移除空的 hash
      if (url.hash === '#') url.hash = '';

      // 构建干净 URL
      var clean = url.origin + url.pathname;
      var search = url.searchParams.toString();
      if (search) clean += '?' + search;
      if (url.hash && url.hash !== '#') clean += url.hash;

      return clean;
    } catch (e) {
      return rawUrl;
    }
  }

  function isCleanNeeded(rawUrl) {
    return cleanUrl(rawUrl) !== rawUrl;
  }

  // ─── Toast 通知 ───
  function showToast(msg, type) {
    var color = type === 'error' ? C.danger : C.primary;
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-12px);' +
      'padding:10px 24px;background:' + C.surface + ';color:' + color + ';border:1px solid ' + C.border + ';' +
      'border-radius:' + C.radius + ';font-size:13px;z-index:10000010;' +
      'font-family:' + C.font + ';transition:opacity .25s,transform .25s;opacity:0;' +
      'box-shadow:0 8px 24px rgba(0,0,0,.4);';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(-12px)';
      setTimeout(function () { t.remove(); }, 250);
    }, 2000);
  }

  // ─── 复制到剪贴板 ───
  function copyText(text) {
    if (typeof GM_setClipboard === 'function') {
      GM_setClipboard(text, 'text');
      return true;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
      return true;
    }
    return false;
  }

  // ─── 链接净化扫描 ───
  function scanLinks() {
    var links = document.querySelectorAll('a[href]');
    var count = 0;
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.href;
      if (!href || href.indexOf('http') !== 0) continue;
      if (isCleanNeeded(href)) {
        a.dataset.uncleanHref = href;
        a.dataset.cleanHref = cleanUrl(href);
        if (!a.dataset.lcMarked) {
          a.dataset.lcMarked = '1';
          a.addEventListener('contextmenu', onRightClick);
          count++;
        }
      }
    }
    return count;
  }

  // ─── 右键菜单事件 ───
  function onRightClick(e) {
    var a = e.currentTarget;
    var clean = a.dataset.cleanHref;
    if (!clean) return;

    // 显示操作面板
    showLinkPanel(a, e);
  }

  // ─── 链接操作面板 ───
  function showLinkPanel(anchor, event) {
    var existing = document.getElementById('lc-panel');
    if (existing) existing.remove();

    var clean = anchor.dataset.cleanHref;
    var dirty = anchor.dataset.uncleanHref || anchor.href;

    // 计算追踪参数差异
    try {
      var dirtyUrl = new URL(dirty);
      var cleanUrlObj = new URL(clean);
      var removed = [];
      dirtyUrl.searchParams.forEach(function (v, k) {
        if (!cleanUrlObj.searchParams.has(k)) removed.push(k);
      });
    } catch (e) {
      removed = [];
    }

    var panel = document.createElement('div');
    panel.id = 'lc-panel';
    panel.style.cssText = 'position:fixed;z-index:10000020;' +
      'background:' + C.bg + ';border:1px solid ' + C.border + ';' +
      'border-radius:' + C.radius + ';padding:16px;min-width:320px;max-width:480px;' +
      'font-family:' + C.font + ';font-size:12px;color:' + C.text + ';' +
      'box-shadow:0 16px 48px rgba(0,0,0,.5);' +
      'animation:lcSlideIn .18s ease;';

    // 标题
    var title = document.createElement('div');
    title.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid ' + C.border + ';';
    title.innerHTML = '<span style="color:' + C.primary + ';font-weight:700;">Link Clear</span>' +
      '<span style="color:' + C.textMuted + ';font-size:11px;">' + removed.length + ' params removed</span>';
    panel.appendChild(title);

    // 清洁 URL
    var urlLabel = document.createElement('div');
    urlLabel.style.cssText = 'color:' + C.textMuted + ';font-size:10px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;';
    urlLabel.textContent = 'Clean URL';
    panel.appendChild(urlLabel);

    var urlDisplay = document.createElement('div');
    urlDisplay.style.cssText = 'padding:8px 10px;background:' + C.surface + ';border:1px solid ' + C.border + ';' +
      'border-radius:' + C.radiusSm + ';margin-bottom:12px;word-break:break-all;max-height:80px;overflow-y:auto;' +
      'color:' + C.primary + ';line-height:1.5;font-size:11px;';
    urlDisplay.textContent = clean;
    panel.appendChild(urlDisplay);

    // 移除的参数列表
    if (removed.length > 0) {
      var paramLabel = document.createElement('div');
      paramLabel.style.cssText = 'color:' + C.textMuted + ';font-size:10px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;';
      paramLabel.textContent = 'Removed';
      panel.appendChild(paramLabel);

      var paramWrap = document.createElement('div');
      paramWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;';
      removed.forEach(function (p) {
        var tag = document.createElement('span');
        tag.style.cssText = 'padding:2px 6px;background:rgba(247,118,142,.12);color:' + C.danger + ';' +
          'border-radius:4px;font-size:10px;';
        tag.textContent = p;
        paramWrap.appendChild(tag);
      });
      panel.appendChild(paramWrap);
    }

    // 操作按钮
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;';

    function makeBtn(text, bg, hoverBg) {
      var b = document.createElement('button');
      b.style.cssText = 'flex:1;padding:8px 12px;background:' + bg + ';color:#fff;border:none;' +
        'border-radius:' + C.radiusSm + ';cursor:pointer;font-size:12px;font-weight:500;' +
        'font-family:' + C.font + ';transition:background .15s;';
      b.textContent = text;
      b.addEventListener('mouseenter', function () { b.style.background = hoverBg; });
      b.addEventListener('mouseleave', function () { b.style.background = bg; });
      return b;
    }

    var copyBtn = makeBtn('Copy Clean URL', C.primary, C.primaryHover);
    copyBtn.addEventListener('click', function () {
      copyText(clean);
      showToast('Clean URL copied');
      panel.remove();
    });

    var openBtn = makeBtn('Open Clean', C.accent, '#c0caf5');
    openBtn.addEventListener('click', function () {
      window.open(clean, '_blank');
      panel.remove();
    });

    var openDirtyBtn = makeBtn('Open Original', C.surface, 'rgba(86,95,137,.3)');
    openDirtyBtn.style.color = C.textMuted;
    openDirtyBtn.addEventListener('click', function () {
      window.open(dirty, '_blank');
      panel.remove();
    });

    btnRow.appendChild(copyBtn);
    btnRow.appendChild(openBtn);
    btnRow.appendChild(openDirtyBtn);
    panel.appendChild(btnRow);

    // 定位
    var px = event ? event.clientX : window.innerWidth / 2;
    var py = event ? event.clientY : window.innerHeight / 2;
    panel.style.left = Math.min(px, window.innerWidth - 500) + 'px';
    panel.style.top = Math.min(py, window.innerHeight - 250) + 'px';

    // 点击外部关闭
    document.addEventListener('click', function handler(e) {
      if (!panel.contains(e.target)) {
        panel.remove();
        document.removeEventListener('click', handler);
      }
    });

    // ESC 关闭
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') {
        panel.remove();
        document.removeEventListener('keydown', handler);
      }
    });

    document.body.appendChild(panel);
  }

  // ─── 注入 CSS 动画 ───
  function injectCSS() {
    if (document.getElementById('lc-css')) return;
    var s = document.createElement('style');
    s.id = 'lc-css';
    s.textContent = '@keyframes lcSlideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }

  // ─── 浮动按钮（显示净化统计）───
  function createFloatBtn() {
    var links = document.querySelectorAll('a[href]');
    var dirtyCount = 0;
    for (var i = 0; i < links.length; i++) {
      var href = links[i].href;
      if (href && href.indexOf('http') === 0 && isCleanNeeded(href)) dirtyCount++;
    }
    if (dirtyCount === 0) return;

    var btn = document.createElement('div');
    btn.style.cssText = 'position:fixed;bottom:20px;left:20px;width:36px;height:36px;' +
      'background:' + C.surface + ';border:1px solid ' + C.border + ';' +
      'border-radius:50%;display:flex;align-items:center;justify-content:center;' +
      'cursor:pointer;z-index:9999998;font-family:' + C.font + ';' +
      'color:' + C.danger + ';font-size:11px;font-weight:700;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.4);transition:transform .18s,box-shadow .18s;';
    btn.textContent = dirtyCount;
    btn.title = dirtyCount + ' links with tracking params (right-click any marked link to clean)';

    btn.addEventListener('mouseenter', function () {
      btn.style.transform = 'scale(1.12)';
      btn.style.boxShadow = '0 8px 24px rgba(0,0,0,.5)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 16px rgba(0,0,0,.4)';
    });

    document.body.appendChild(btn);
  }

  // ─── 初始化 ───
  function init() {
    injectCSS();
    var count = scanLinks();
    createFloatBtn();

    // 监听动态加载的链接
    if (window.MutationObserver) {
      var observer = new MutationObserver(function () { scanLinks(); });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
