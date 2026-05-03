// ==UserScript==
// @name         Link Clear
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  去除链接追踪参数、解析搜索引擎跳转、净化短链接
// @author       SantaChains
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @noframes
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/SantaChains/scripts/main/link-clear/meta.js
// @downloadURL  https://raw.githubusercontent.com/SantaChains/scripts/main/link-clear/user.js
// @supportURL   https://github.com/SantaChains/scripts/issues
// ==/UserScript==

(function () {
  'use strict';

  var C = {
    grad: 'linear-gradient(135deg, #1a1b26 0%, #24283b 50%, #1a1b26 100%)',
    gradHover: 'linear-gradient(135deg, #24283b 0%, #2f3347 50%, #24283b 100%)',
    primary: '#9ece6a',
    primaryHover: '#73daca',
    cta: '#bb9af7',
    ctaHover: '#c0caf5',
    danger: '#f7768e',
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

  var RULES = [
    { name: 'www.bilibili.com/video',
      testReg: /^https?:\/\/www\.bilibili\.com\/video\/(av\d+|BV[a-zA-Z0-9]+).*$/i,
      replace: 'https://www.bilibili.com/video/$1',
      query: ['p'], hash: true },
    { name: 'bilibili.com',
      testReg: /^https?:\/\/(?:www\.)?bilibili\.com\/.*$/i,
      query: ['spm_id_from', 'from_source', 'from_spmid', 'seid', 'bvid', 'p'] },
    { name: 'www.youtube.com',
      testReg: /^https?:\/\/www\.youtube\.com\/watch\?.*$/i,
      replace: 'https://www.youtube.com/watch',
      query: ['v', 'list'], hash: true },
    { name: 'youtube.com/shorts',
      testReg: /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+).*$/i,
      replace: 'https://www.youtube.com/shorts/$1',
      query: [] },
    { name: 'itunes.apple.com',
      testReg: /^https?:\/\/itunes\.apple\.com\/(?:\w{2}\/)?([^\/]+)\/(?:[^\/]+\/)?((?:id)\d+).*$/i,
      replace: 'https://itunes.apple.com/cn/$1/$2' },
    { name: 'apps.apple.com',
      testReg: /^https?:\/\/apps\.apple\.com\/(?:\w{2}\/)?([^\/]+)\/(?:[^\/]+\/)?((?:id)\d+).*$/i,
      replace: 'https://apps.apple.com/cn/$1/$2' },
    { name: 'microsoft.com/win10-store',
      testReg: /^https?:\/\/www\.microsoft\.com\/[a-zA-Z-]{2,5}\/p\/[^/]+\/([a-zA-Z0-9]{12,})(?:[^a-zA-Z0-9].*|$)/i,
      replace: 'https://www.microsoft.com/store/apps/$1' },
    { name: 'chrome.google.com/webstore',
      testReg: /^https?:\/\/chrome\.google\.com\/webstore\/detail\/[^\/]+\/([a-z]{32}).*/i,
      replace: 'https://chrome.google.com/webstore/detail/$1' },
    { name: 's.taobao.com',
      testReg: /^https?:\/\/s\.taobao\.com\/search.*$/i,
      replace: 'https://s.taobao.com/search',
      query: ['q'] },
    { name: 'list.tmall.com',
      testReg: /^https?:\/\/list\.tmall\.com\/search_product\.htm.*$/i,
      replace: 'https://list.tmall.com/search_product.htm',
      query: ['q'] },
    { name: 'item.taobao.com',
      testReg: /^https?:\/\/item\.taobao\.com\/item\.htm.*$/i,
      replace: 'https://item.taobao.com/item.htm',
      query: ['id'] },
    { name: 'detail.tmall.com',
      testReg: /^https?:\/\/detail\.tmall\.com\/item\.htm.*$/i,
      replace: 'https://detail.tmall.com/item.htm',
      query: ['id'] },
    { name: 'taobao/tmall.com/shop',
      testReg: /^https?:\/\/(\w+)\.(taobao|tmall)\.com\/shop\/view_shop\.htm.*$/i,
      replace: 'https://$1.$2.com/' },
    { name: 'tmall.com',
      testReg: /^https?:\/\/(?:www\.)?tmall\.com\/.*$/i,
      query: ['spm', 'abbucket', 'skuId', 'scene'] },
    { name: 'taobao.com',
      testReg: /^https?:\/\/(?:www\.)?taobao\.com\/.*$/i,
      query: ['spm', 'abbucket', 'skuId', 'scene', 'source'] },
    { name: 'item.m.jd.com',
      testReg: /^https?:\/\/item\.m\.jd\.com\/product\/(\d+)\.html(\?.*)?$/i,
      replace: 'https://item.jd.com/$1.html' },
    { name: 'item.m.jd.com/ware/',
      testReg: /^https?:\/\/item\.m\.jd\.com\/ware\/view\.action\?.*wareId=(\d+).*$/i,
      replace: 'https://item.jd.com/$1.html' },
    { name: 'search.jd.com',
      testReg: /^https?:\/\/search\.jd\.com\/Search\?.*$/i,
      query: ['keyword', 'enc'] },
    { name: 're.jd.com',
      testReg: /^https?:\/\/re\.jd\.com\/cps\/item\/(\d+)\.html.*$/i,
      replace: 'https://item.jd.com/$1.html' },
    { name: 'jd.com',
      testReg: /^https?:\/\/(?:www\.)?jd\.com\/.*$/i,
      query: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'ad_od', 'share_source', 'source', 'sid', 'cu'] },
    { name: 'yangkeduo.com',
      testReg: /^https?:\/\/mobile\.yangkeduo\.com\/goods.html\?.*$/i,
      query: ['goods_id'] },
    { name: 'pdd.com|pinduoduo.com',
      testReg: /^https?:\/\/(?:www\.)?(pdd\.com|pinduoduo\.com)\/.*$/i,
      query: ['goods_id', 'page_from', 'share_uin', 'share_uid', 'refer_share_id', 'refer_share_uid'] },
    { name: 'detail.1688.com/offer',
      testReg: /^https?:\/\/detail\.1688\.com\/offer\/(\d+)\.html\?.*$/i,
      replace: 'https://detail.1688.com/offer/$1.html' },
    { name: '1688.com',
      testReg: /^https?:\/\/(?:www\.)?1688\.com\/.*$/i,
      query: ['spm', 'tracelog', 'resourceId', 'shopId'] },
    { name: 'tmall.hk',
      testReg: /^https?:\/\/(?:www\.)?tmall\.hk\/.*$/i,
      query: ['spm', 'abbucket', 'skuId', 'scene'] },
    { name: 'alibaba.com',
      testReg: /^https?:\/\/(?:www\.)?alibaba\.com\/.*$/i,
      query: ['spm', 'tracelog', 'sourceType', 'offerId'] },
    { name: 'aliexpress.com',
      testReg: /^https?:\/\/(?:www\.)?aliexpress\.com\/.*$/i,
      query: ['spm', 'aff_platform', 'aff_trace_key', 'sourceType', 'itemId'] },
    { name: 'weibo.com/u',
      testReg: /^https?:\/\/(?:www\.)?weibo\.com\/u\/(\d+)(\?.*)?$/i,
      replace: 'https://m.weibo.cn/$1' },
    { name: 'weibo.com',
      testReg: /^https?:\/\/(?:www\.)?weibo\.com\/(?:\d+)\/(\w+)(\?.*)?$/i,
      replace: 'https://m.weibo.cn/status/$1' },
    { name: 'xhs.link|xiaohongshu.com',
      testReg: /^https?:\/\/(?:www\.)?(xhs\.link|xiaohongshu\.com)\/.*$/i,
      query: ['xsec_token', 'xsec_source', 'source', 'type', 'share_from_user_hidden', 'xhsshare', 'appuid', 'apptime', 'wechatWid', 'wechatOrigin', 'wegdtoken'] },
    { name: 'douyin.com',
      testReg: /^https?:\/\/((?:www|v)\.douyin\.com|dou\.yin)\/.*$/i,
      query: ['video_id', 'item_id', 'share_sign', 'share_token', 'share_mode', 'share_from', 'share_id', 'source', 'unique_id', 'sec_uid'] },
    { name: 'kuaishou.com',
      testReg: /^https?:\/\/(?:www\.)?kuaishou\.com\/.*$/i,
      query: ['fid', 'shareToken', 'shareChannel', 'shareId', 'shareResource', 'source'] },
    { name: 'weixin.qq.com',
      testReg: /^https?:\/\/mp\.weixin\.qq\.com\/s\/.*$/i,
      query: ['__biz', 'mid', 'idx', 'sn', 'chksm'] },
    { name: 'zhihu.com',
      testReg: /^https?:\/\/(?:www\.)?zhihu\.com\/.*$/i,
      query: ['utm_source', 'utm_medium', 'utm_content', 'utm_campaign'] },
    { name: 'instagram.com',
      testReg: /^https?:\/\/(?:www\.)?instagram\.com\/.*$/i,
      query: ['igshid', 'utm_source', 'utm_medium'] },
    { name: 'twitter.com|x.com',
      testReg: /^https?:\/\/(?:www\.)?(twitter\.com|x\.com)\/.*$/i,
      query: ['s', 't', 'utm_source', 'utm_medium', 'utm_campaign'] },
    { name: 'reddit.com',
      testReg: /^https?:\/\/(?:www\.)?reddit\.com\/.*$/i,
      query: ['utm_source', 'utm_medium', 'utm_campaign', 'context'] },
    { name: 'tiktok.com',
      testReg: /^https?:\/\/(?:www\.)?tiktok\.com\/.*$/i,
      query: ['_t', '_r', 'utm_source', 'utm_medium', 'utm_campaign'] },
    { name: 'facebook.com',
      testReg: /^https?:\/\/(?:www\.)?facebook\.com\/.*$/i,
      query: ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign'] },
    { name: 'linkedin.com',
      testReg: /^https?:\/\/(?:www\.)?linkedin\.com\/.*$/i,
      query: ['utm_source', 'utm_medium', 'utm_campaign', 'originalSubdomain'] },
    { name: 'greasyfork.org/script/tabs',
      testReg: /^https?:\/\/(?:www\.)?greasyfork\.org\/(?:[\w-]*\/)?scripts\/(\d+)-[^\/]*\/(code|versions|stats|derivatives|admin).*$/i,
      replace: 'https://greasyfork.org/scripts/$1/$2',
      hash: true },
    { name: 'greasyfork.org',
      testReg: /^https?:\/\/(?:www\.)?greasyfork\.org\/(?:[\w-]*\/)?(scripts|users)\/(\d+)-[^\/]*$/i,
      replace: 'https://greasyfork.org/$1/$2' },
    { name: 'greasyfork.org/scripts/list',
      testReg: /^https?:\/\/(?:www\.)?greasyfork\.org\/(?:[\w-]*\/)?scripts\?.*$/i,
      query: ['set', 'page'] },
    { name: 'greasyfork.org/script/discussions',
      testReg: /^https?:\/\/(?:www\.)?greasyfork\.org\/(?:[\w-]*\/)?scripts\/(\d+)-[^\/]*\/discussions\/(\d+).*$/i,
      replace: 'https://greasyfork.org/scripts/$1/discussions/$2',
      hash: true },
    { name: 'greasyfork.org/discussions',
      testReg: /^https?:\/\/(?:www\.)?greasyfork\.org\/(?:[\w-]*\/)?discussions\/(greasyfork|development|requests)\/(\d+)(?:[^\d].*)?$/i,
      replace: 'https://greasyfork.org/discussions/$1/$2',
      hash: true },
    { name: 'csdn.net',
      testReg: /^https?:\/\/blog\.csdn\.net\/.*$/i,
      query: ['spm', 'utm_source', 'utm_medium', 'utm_campaign'] },
    { name: 'juejin.cn',
      testReg: /^https?:\/\/(?:www\.)?juejin\.cn\/.*$/i,
      query: ['utm_source', 'utm_medium', 'utm_campaign'] },
    { name: 'sspai.com',
      testReg: /^https?:\/\/(?:www\.)?sspai\.com\/.*$/i,
      query: ['utm_source', 'utm_medium'] },
    { name: 'store.steampowered.com|steamcommunity.com',
      testReg: /^https?:\/\/(store\.steampowered|steamcommunity)\.com\/app\/(\d+).*$/i,
      replace: 'https://$1.com/app/$2' },
    { name: 'trello.com',
      testReg: /^https?:\/\/(?:www\.)?trello\.com\/(\w)\/(\w+)(\/.*$|$)/i,
      replace: 'https://trello.com/$1/$2',
      hash: true },
    { name: 'meta.appinn.com',
      testReg: /^https?:\/\/meta\.appinn\.net\/t(?:\/[^/]*)*?\/(\d+)(\/.*$|$)/i,
      replace: 'https://meta.appinn.net/t/$1' },
    { name: 'amazon.co.jp',
      testReg: /^https?:\/\/(?:www\.)?amazon\.co\.jp\/([^\/]+)\/dp\/(\w+)\/.*$/i,
      replace: 'https://www.amazon.co.jp/$1/dp/$2' },
    { name: 'amazon.com',
      testReg: /^https?:\/\/(?:www\.)?amazon\.com\/([^\/]+)\/dp\/(\w+)\/.*$/i,
      replace: 'https://www.amazon.com/$1/dp/$2' },
    { name: 'c.pc.qq.com',
      testReg: /^https?:\/\/c\.pc\.qq\.com\/middle.html\?.*pfurl=([^&]*)(?:&.*$|$)/i,
      replace: '$1',
      query: [],
      methods: ['decodeUrl'] },
    { name: 'other',
      testReg: /^(https?:\/\/[^?#]*)[?#].*$/i,
      query: ['id', 'tid', 'uid', 'q', 'wd', 'query', 'keyword', 'keywords'] }
  ];

  var TRACKING_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id',
    'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid',
    'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_ref', 'fb_source',
    'msclkid', 'twclid',
    '_ga', '_gl',
  ];

  var REDIRECT_PATTERNS = [
    { host: 'baidu.com', param: 'url', path: '/link' },
    { host: 'sogou.com', param: 'url', path: '/link' },
    { host: 'so.com', param: 'url', path: '/link' },
    { host: 'google.com', param: 'url', path: '/url' },
    { host: 'bing.com', param: 'url', path: '/cr' },
  ];

  var CACHE_MAX = 500;
  var cleanCache = {};
  var cacheKeys = [];
  var dirtyCount = 0;
  var floatBtn = null;

  function matchesDomain(hostname, domain) {
    return hostname === domain || hostname.endsWith('.' + domain);
  }

  function cacheSet(key, value) {
    if (cleanCache[key] === undefined) {
      cacheKeys.push(key);
      if (cacheKeys.length > CACHE_MAX) {
        delete cleanCache[cacheKeys.shift()];
      }
    }
    cleanCache[key] = value;
  }

  function getQueryString(url, key) {
    try {
      var idx = url.indexOf('?');
      if (idx === -1) return '';
      var search = url.substring(idx);
      var hashIdx = search.indexOf('#');
      if (hashIdx !== -1) search = search.substring(0, hashIdx);
      var params = new URLSearchParams(search);
      var val = params.get(key);
      return val !== null ? key + '=' + val : '';
    } catch (e) {
      return '';
    }
  }

  function cleanUrl(rawUrl) {
    if (cleanCache[rawUrl] !== undefined) return cleanCache[rawUrl];

    try {
      var urlObj = new URL(rawUrl);
      var hostname = urlObj.hostname;

      for (var i = 0; i < REDIRECT_PATTERNS.length; i++) {
        var rp = REDIRECT_PATTERNS[i];
        if (matchesDomain(hostname, rp.host) && urlObj.pathname.indexOf(rp.path) === 0) {
          var real = urlObj.searchParams.get(rp.param);
          if (real && /^https?:\/\//.test(real)) {
            var cleanedReal = cleanUrl(real);
            cacheSet(rawUrl, cleanedReal);
            return cleanedReal;
          }
        }
      }

      for (var ri = 0; ri < RULES.length; ri++) {
        var rule = RULES[ri];
        if (!rule.testReg.test(rawUrl)) continue;

        var hash = rawUrl.replace(/^[^#]*(#.*)?$/, '$1');
        var base = rawUrl.replace(/(\?|#).*$/, '');
        var newQuery = '';

        if (rule.query && rule.query.length > 0) {
          for (var j = 0; j < rule.query.length; j++) {
            var param = getQueryString(rawUrl, rule.query[j]);
            if (param) {
              newQuery += (newQuery ? '&' : '?') + param;
            }
          }
        }

        if (rule.hash !== false && hash) {
          newQuery += hash;
        }

        var pureUrl = rule.replace ? rawUrl.replace(rule.testReg, rule.replace) : base;
        pureUrl += newQuery;

        if (rule.methods && rule.methods.length > 0) {
          for (var m = 0; m < rule.methods.length; m++) {
            if (rule.methods[m] === 'decodeUrl') {
              try { pureUrl = decodeURIComponent(pureUrl); } catch (e) { }
            }
          }
        }

        cacheSet(rawUrl, pureUrl);
        return pureUrl;
      }

      for (var k = 0; k < TRACKING_PARAMS.length; k++) {
        urlObj.searchParams.delete(TRACKING_PARAMS[k]);
      }

      var clean = urlObj.origin + urlObj.pathname;
      var search = urlObj.searchParams.toString();
      if (search) clean += '?' + search;
      if (urlObj.hash && urlObj.hash !== '#') clean += urlObj.hash;

      cacheSet(rawUrl, clean);
      return clean;

    } catch (e) {
      cacheSet(rawUrl, rawUrl);
      return rawUrl;
    }
  }

  function scanLinks(root) {
    var links = root ? root.querySelectorAll('a[href]') : document.querySelectorAll('a[href]');
    var count = 0;
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.href;
      if (!href || href.indexOf('http') !== 0) continue;

      if (a.dataset.lcMarked && a.dataset.uncleanHref === href) continue;

      if (a.dataset.lcMarked && a.dataset.uncleanHref !== href) {
        delete a.dataset.lcMarked;
        delete a.dataset.uncleanHref;
        delete a.dataset.cleanHref;
      }

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

  function scanAddedNodes(addedNodes) {
    var count = 0;
    for (var i = 0; i < addedNodes.length; i++) {
      var node = addedNodes[i];
      if (node.nodeType !== 1) continue;
      if (node.tagName === 'A') {
        var href = node.href;
        if (!href || href.indexOf('http') !== 0) continue;
        if (node.dataset.lcMarked && node.dataset.uncleanHref === href) continue;
        if (node.dataset.lcMarked && node.dataset.uncleanHref !== href) {
          delete node.dataset.lcMarked;
          delete node.dataset.uncleanHref;
          delete node.dataset.cleanHref;
        }
        var cleaned = cleanUrl(href);
        if (cleaned !== href) {
          node.dataset.uncleanHref = href;
          node.dataset.cleanHref = cleaned;
          node.dataset.lcMarked = '1';
          count++;
        }
      }
      if (node.querySelector) {
        count += scanLinks(node);
      }
    }
    return count;
  }

  function showToast(msg, type) {
    var color = type === 'error' ? C.danger : C.primary;
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-12px);' +
      'padding:10px 24px;background:' + C.surface + ';color:' + color + ';border:1px solid ' + C.glassBorder + ';' +
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

  function copyText(text) {
    if (typeof GM_setClipboard === 'function') {
      GM_setClipboard(text, 'text');
      return true;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () { });
      return true;
    }
    return false;
  }

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

  function showLinkPanel(anchor, event) {
    var existing = document.getElementById('lc-panel');
    if (existing) existing.remove();
    removePanelListeners();

    var clean = anchor.dataset.cleanHref;
    var dirty = anchor.dataset.uncleanHref || anchor.href;

    var removed = [];
    try {
      var dirtyUrl = new URL(dirty);
      var cleanUrlObj = new URL(clean);
      dirtyUrl.searchParams.forEach(function (v, k) {
        if (!cleanUrlObj.searchParams.has(k)) removed.push(k);
      });
    } catch (e) { }

    var panel = document.createElement('div');
    panel.id = 'lc-panel';
    panel.style.cssText = 'position:fixed;z-index:10000020;' +
      'background:' + C.glass + ';border:1px solid ' + C.glassBorder + ';' +
      'border-radius:' + C.radius + ';padding:16px;min-width:320px;max-width:480px;' +
      'font-family:' + C.font + ';font-size:12px;color:' + C.text + ';' +
      'box-shadow:0 16px 48px rgba(0,0,0,.5);' +
      'animation:lcSlideIn .18s ease;';

    var title = document.createElement('div');
    title.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid ' + C.glassBorder + ';';
    title.innerHTML = '<span style="color:' + C.primary + ';font-weight:700;">Link Clear</span>' +
      '<span style="color:' + C.textMuted + ';font-size:11px;">' + removed.length + ' params removed</span>';
    panel.appendChild(title);

    var urlLabel = document.createElement('div');
    urlLabel.style.cssText = 'color:' + C.textMuted + ';font-size:10px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;';
    urlLabel.textContent = 'Clean URL';
    panel.appendChild(urlLabel);

    var urlDisplay = document.createElement('div');
    urlDisplay.style.cssText = 'padding:8px 10px;background:' + C.surface + ';border:1px solid ' + C.glassBorder + ';' +
      'border-radius:' + C.radiusSm + ';margin-bottom:12px;word-break:break-all;max-height:80px;overflow-y:auto;' +
      'color:' + C.primary + ';line-height:1.5;font-size:11px;';
    urlDisplay.textContent = clean;
    panel.appendChild(urlDisplay);

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

    var openBtn = makeBtn('Open Clean', C.cta, C.ctaHover);
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

    var px = event ? Math.max(0, event.clientX) : window.innerWidth / 2;
    var py = event ? Math.max(0, event.clientY) : window.innerHeight / 2;
    panel.style.left = Math.max(0, Math.min(px, window.innerWidth - 500)) + 'px';
    panel.style.top = Math.max(0, Math.min(py, window.innerHeight - 250)) + 'px';

    function closePanel() {
      panel.remove();
      removePanelListeners();
    }

    setTimeout(function () {
      panelClickHandler = function (e) {
        if (!panel.contains(e.target)) closePanel();
      };
      document.addEventListener('click', panelClickHandler);
    }, 0);

    panelKeyHandler = function (e) {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', panelKeyHandler);

    document.body.appendChild(panel);
  }

  function injectCSS() {
    if (document.getElementById('lc-css')) return;
    var s = document.createElement('style');
    s.id = 'lc-css';
    s.textContent = '@keyframes lcSlideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }

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

  function createFloatBtn() {
    if (dirtyCount <= 0) return;

    floatBtn = document.createElement('div');
    floatBtn.style.cssText = 'position:fixed;bottom:20px;left:20px;width:36px;height:36px;' +
      'background:' + C.surface + ';border:1px solid ' + C.glassBorder + ';' +
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

  function onContextMenu(e) {
    var target = e.target;
    var a = target.closest ? target.closest('a[data-lc-marked]') : null;
    if (!a) {
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

  function copyCurrentClean() {
    var clean = cleanUrl(window.location.href);
    copyText(clean);
    showToast('Clean URL copied');
  }

  function copyCurrentWithTitle() {
    var clean = cleanUrl(window.location.href);
    copyText(document.title + '\n' + clean);
    showToast('Clean URL + title copied');
  }

  function openCurrentClean() {
    var clean = cleanUrl(window.location.href);
    if (clean !== window.location.href) {
      window.location.href = clean;
    } else {
      showToast('URL already clean');
    }
  }

  function init() {
    injectCSS();

    dirtyCount = scanLinks();
    createFloatBtn();

    document.addEventListener('contextmenu', onContextMenu, true);

    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('Copy clean URL', copyCurrentClean);
      GM_registerMenuCommand('Copy clean URL + title', copyCurrentWithTitle);
      GM_registerMenuCommand('Open clean URL', openCurrentClean);
    }

    if (window.MutationObserver) {
      var debounceTimer = null;
      var pendingNodes = [];
      var observer = new MutationObserver(function (mutations) {
        for (var mi = 0; mi < mutations.length; mi++) {
          var added = mutations[mi].addedNodes;
          for (var ni = 0; ni < added.length; ni++) {
            if (added[ni].nodeType !== 1) continue;
            pendingNodes.push(added[ni]);
          }
        }
        if (pendingNodes.length === 0) return;

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          var newCount = scanAddedNodes(pendingNodes);
          pendingNodes = [];
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
