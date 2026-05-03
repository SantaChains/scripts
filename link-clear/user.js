// ==UserScript==
// @name         Link Clear
// @namespace    http://tampermonkey.net/
// @version      1.1
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

  // ─── 配色（Nerd Dark）───
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

  // ─── 通用追踪参数（仅限确认的追踪用途）───
  var TRACKING_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id',
    'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid',
    'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_ref', 'fb_source',
    'msclkid', 'twclid',
    '_ga', '_gl',
    'spm_id_from', 'spm', 'clickid', 'click_id', 'yclid', 'ymclid',
    'mc_cid', 'mc_eid', 'oly_enc_id', 'oly_anon_id',
    'hsa_cam', 'hsa_grp', 'hsa_mt', 'hsa_src', 'hsa_ad', 'hsa_acc',
    'hsa_net', 'hsa_ver', 'hsa_la', 'hsa_ol', 'hsa_kw', 'hsa_tgt',
    '_hsenc', '_hsmi', '__hssc', '__hstc', 'hsCtaTracking',
  ];

  // ─── 特定站点参数 ───
  var SITE_PARAMS = {
    'bilibili.com': ['vd_source', 'spm_id_from', 'from_source', 'from', 'seid', 'share_source', 'share_medium', 'share_plat', 'unique_k', 'buvid', 'is_story_h5', 'vd_source'],
    'taobao.com': ['spm', 'scm', 'scm_id', 'pvid', 'ut_sk', 'from', 'source'],
    'tmall.com': ['spm', 'scm', 'scm_id', 'pvid', 'ut_sk', 'from', 'source'],
    'jd.com': ['cu', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'abt', 'scm', 'pvid'],
    'yangkeduo.com': ['from_source', 'share_mall', 'share_goods_id'],
    'youtube.com': ['si', 'feature', 'pp'],
    'x.com': ['s', 't', 'ref_src', 'ref_url'],
    'twitter.com': ['s', 't', 'ref_src', 'ref_url'],
    'zhihu.com': ['utm_id', 'utm_source', 'utm_medium', 'utm_content', 'share_type'],
    'weibo.com': ['sudaref', 'source', 'from'],
    'douyin.com': ['previous_page', 'modal_id', 'enter_from', 'share_from'],
    'xiaohongshu.com': ['source', 'share_id', 'xsec_source'],
  };

  // ─── 搜索引擎跳转解析 ───
  var REDIRECT_PATTERNS = [
    { host: 'baidu.com', param: 'url', path: '/link' },
    { host: 'sogou.com', param: 'url', path: '/link' },
    { host: 'so.com', param: 'url', path: '/link' },
    { host: 'google.com', param: 'url', path: '/url' },
    { host: 'bing.com', param: 'url', path: '/cr' },
  ];

  // ─── 污染链接缓存（避免重复解析）───
  // key: href, value: cleanHref
  var cleanCache = {};
  var dirtyCount = 0;
  var floatBtn = null;

  // ─── 工具函数 ───

  function matchesDomain(hostname, domain) {
    return hostname === domain || hostname.endsWith('.' + domain);
  }

  function getSiteKey(hostname) {
    for (var key in SITE_PARAMS) {
      if (matchesDomain(hostname, key)) return key;
    }
    return null;
  }

  function cleanUrl(rawUrl) {
    if (cleanCache[rawUrl] !== undefined) return cleanCache[rawUrl];
    try {
      var url = new URL(rawUrl);
      var hostname = url.hostname;

      // 检查搜索引擎跳转
      for (var i = 0; i < REDIRECT_PATTERNS.length; i++) {
        var rp = REDIRECT_PATTERNS[i];
        if (matchesDomain(hostname, rp.host) && url.pathname.indexOf(rp.path) === 0) {
          var real = url.searchParams.get(rp.param);
          if (real && /^https?:\/\//.test(real)) {
            try {
              var realUrl = new URL(real);
              // 递归清理提取出的真实 URL
              var cleanedReal = cleanUrl(real);
              cleanCache[rawUrl] = cleanedReal;
              return cleanedReal;
            } catch (e) { /* not a valid URL, keep original */ }
          }
        }
      }

      // 移除通用追踪参数
      for (var j = 0; j < TRACKING_PARAMS.length; j++) {
        url.searchParams.delete(TRACKING_PARAMS[j]);
      }

      // 移除站点特定参数
      var siteKey = getSiteKey(hostname);
      if (siteKey && SITE_PARAMS[siteKey]) {
        var params = SITE_PARAMS[siteKey];
        for (var k = 0; k < params.length; k++) {
          url.searchParams.delete(params[k]);
        }
      }

      // 移除空的 hash
      if (url.hash === '#') url.hash = '';

      // 构建干净 URL
      var clean = url.origin + url.pathname;
      var search = url.searchParams.toString();
      if (search) clean += '?' + search;
      if (url.hash && url.hash !== '#') clean += url.hash;

      cleanCache[rawUrl] = clean;
      return clean;
    } catch (e) {
      cleanCache[rawUrl] = rawUrl;
      return rawUrl;
    }
  }

  // ─── 扫描链接（返回脏链接数量，同时标记）───
  function scanLinks() {
    var links = document.querySelectorAll('a[href]');
    var count = 0;
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.href;
      if (!href || href.indexOf('http') !== 0) continue;
      if (a.dataset.lcMarked) continue; // 已标记，跳过

      var cleaned = cleanUrl(href);
      if (cleaned !== href) {
        a.dataset.uncleanHref = href;
        a.dataset.cleanHref = cleaned;
        a.dataset.lcMarked = '1';
        count++;
      }
    }
    return count;
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

  // ─── 面板事件处理器引用（用于清理）───
  var panelClickHandler = null;
  var panelKeyHandler = null;

  function removePanelListeners() {
    if (panelClickHandler) {
      document.removeEventListener('click', panelClickHandler);
      panelClickHandler = null;
    }
    if (panelKeyHandler) {
      document.removeEventListener('keydown', panelKeyHandler);
      panelKeyHandler = null;
    }
  }

  // ─── 链接操作面板 ───
  function showLinkPanel(anchor, event) {
    var existing = document.getElementById('lc-panel');
    if (existing) existing.remove();
    removePanelListeners();

    var clean = anchor.dataset.cleanHref;
    var dirty = anchor.dataset.uncleanHref || anchor.href;

    // 计算追踪参数差异
    var removed = [];
    try {
      var dirtyUrl = new URL(dirty);
      var cleanUrlObj = new URL(clean);
      dirtyUrl.searchParams.forEach(function (v, k) {
        if (!cleanUrlObj.searchParams.has(k)) removed.push(k);
      });
    } catch (e) { /* removed stays empty */ }

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
      for (var i = 0; i < removed.length; i++) {
        var tag = document.createElement('span');
        tag.style.cssText = 'padding:2px 6px;background:rgba(247,118,142,.12);color:' + C.danger + ';' +
          'border-radius:4px;font-size:10px;';
        tag.textContent = removed[i];
        paramWrap.appendChild(tag);
      }
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
      closePanel();
    });

    var openBtn = makeBtn('Open Clean', C.accent, '#c0caf5');
    openBtn.addEventListener('click', function () {
      window.open(clean, '_blank');
      closePanel();
    });

    var openDirtyBtn = makeBtn('Open Original', C.surface, 'rgba(86,95,137,.3)');
    openDirtyBtn.style.color = C.textMuted;
    openDirtyBtn.addEventListener('click', function () {
      window.open(dirty, '_blank');
      closePanel();
    });

    btnRow.appendChild(copyBtn);
    btnRow.appendChild(openBtn);
    btnRow.appendChild(openDirtyBtn);
    panel.appendChild(btnRow);

    // 定位（不超出视口）
    var px = event ? Math.max(0, event.clientX) : window.innerWidth / 2;
    var py = event ? Math.max(0, event.clientY) : window.innerHeight / 2;
    panel.style.left = Math.min(px, window.innerWidth - 500) + 'px';
    panel.style.top = Math.min(py, window.innerHeight - 250) + 'px';

    function closePanel() {
      panel.remove();
      removePanelListeners();
    }

    // 点击外部关闭（延迟绑定，避免当前右键事件立即触发）
    setTimeout(function () {
      panelClickHandler = function (e) {
        if (!panel.contains(e.target)) closePanel();
      };
      document.addEventListener('click', panelClickHandler);
    }, 0);

    // ESC 关闭
    panelKeyHandler = function (e) {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', panelKeyHandler);

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

  // ─── 更新浮动按钮数字 ───
  function updateFloatBtn() {
    if (!floatBtn) return;
    if (dirtyCount <= 0) {
      floatBtn.remove();
      floatBtn = null;
    } else {
      floatBtn.textContent = dirtyCount;
      floatBtn.title = dirtyCount + ' links with tracking params (right-click to clean)';
    }
  }

  // ─── 创建浮动按钮 ───
  function createFloatBtn() {
    if (dirtyCount <= 0) return;

    floatBtn = document.createElement('div');
    floatBtn.style.cssText = 'position:fixed;bottom:20px;left:20px;width:36px;height:36px;' +
      'background:' + C.surface + ';border:1px solid ' + C.border + ';' +
      'border-radius:50%;display:flex;align-items:center;justify-content:center;' +
      'cursor:pointer;z-index:9999998;font-family:' + C.font + ';' +
      'color:' + C.danger + ';font-size:11px;font-weight:700;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.4);transition:transform .18s,box-shadow .18s;';
    floatBtn.textContent = dirtyCount;
    floatBtn.title = dirtyCount + ' links with tracking params (right-click to clean)';

    floatBtn.addEventListener('mouseenter', function () {
      floatBtn.style.transform = 'scale(1.12)';
      floatBtn.style.boxShadow = '0 8px 24px rgba(0,0,0,.5)';
    });
    floatBtn.addEventListener('mouseleave', function () {
      floatBtn.style.transform = 'scale(1)';
      floatBtn.style.boxShadow = '0 4px 16px rgba(0,0,0,.4)';
    });

    document.body.appendChild(floatBtn);
  }

  // ─── 事件委托：右键菜单 ───
  function onContextMenu(e) {
    var target = e.target;
    // 向上查找最近的 a 标签
    var a = target.closest ? target.closest('a[data-lc-marked]') : null;
    if (!a) {
      // fallback: 兼容无 closest 的环境
      var el = target;
      while (el && el !== document.body) {
        if (el.tagName === 'A' && el.dataset && el.dataset.lcMarked) { a = el; break; }
        el = el.parentElement;
      }
    }
    if (!a || !a.dataset.cleanHref) return;

    e.preventDefault();
    showLinkPanel(a, e);
  }

  // ─── 初始化 ───
  function init() {
    injectCSS();

    dirtyCount = scanLinks();
    createFloatBtn();

    // 事件委托：单个 contextmenu 监听器处理所有脏链接
    document.addEventListener('contextmenu', onContextMenu, true);

    // MutationObserver 防抖监听
    if (window.MutationObserver) {
      var debounceTimer = null;
      var observer = new MutationObserver(function () {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          var newCount = scanLinks();
          if (newCount > 0) {
            dirtyCount += newCount;
            updateFloatBtn();
            if (!floatBtn) createFloatBtn();
          }
          debounceTimer = null;
        }, 300);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
