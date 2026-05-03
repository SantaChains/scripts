// ==UserScript==
// @name         Data Markdown
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  将 HTML 中 data-markdown 元素的 Markdown 内容渲染为 HTML
// @author       Paul Irish & SantaChains
// @match        *://*/*
// @grant        GM_getValue
// @noframes
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/SantaChains/scripts/main/data-markdown/meta.js
// @downloadURL  https://raw.githubusercontent.com/SantaChains/scripts/main/data-markdown/user.js
// @supportURL   https://github.com/SantaChains/scripts/issues
// ==/UserScript==

(function () {
  'use strict';

  var SHOWDOWN_CDN = 'https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js';

  // ─── 加载 Showdown ───
  function loadShowdown() {
    return new Promise(function (resolve, reject) {
      if (window.showdown && window.showdown.Converter) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = SHOWDOWN_CDN;
      s.onload = function () {
        if (window.showdown && window.showdown.Converter) {
          resolve();
        } else {
          reject(new Error('Showdown loaded but API not available'));
        }
      };
      s.onerror = function () {
        reject(new Error('Failed to load Showdown from ' + SHOWDOWN_CDN));
      };
      document.head.appendChild(s);
    });
  }

  // ─── 去除公共缩进 ───
  function dedent(text) {
    var lines = text.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
    var minIndent = Infinity;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      var match = lines[i].match(/^(\s*)/);
      if (match[1].length < minIndent) minIndent = match[1].length;
    }
    if (minIndent === Infinity) minIndent = 0;
    var re = new RegExp('^\\s{' + minIndent + '}');
    for (var j = 0; j < lines.length; j++) {
      lines[j] = lines[j].replace(re, '');
    }
    return lines.join('\n');
  }

  // ─── 基础 HTML 净化（防 XSS）───
  function sanitize(html) {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }

  // ─── 渲染单个元素 ───
  function renderElement(elem, converter) {
    if (elem.dataset.mdRendered) return;
    var raw = elem.textContent || elem.innerText;
    if (!raw.trim()) return;
    var md = dedent(raw);
    var html = converter.makeHtml(md);
    elem.innerHTML = sanitize(html);
    elem.dataset.mdRendered = '1';
  }

  // ─── 主逻辑 ───
  function renderAll() {
    var converter = new showdown.Converter({
      tables: true,
      strikethrough: true,
      tasklists: true,
      ghCodeBlocks: true,
      simpleLineBreaks: true,
      openLinksInNewWindow: true,
    });

    var elems = document.querySelectorAll('[data-markdown]');
    for (var i = 0; i < elems.length; i++) {
      renderElement(elems[i], converter);
    }
  }

  // ─── 监听动态插入的元素 ───
  function observe() {
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function (mutations) {
      var hasNew = false;
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].nodeType !== 1) continue;
          if (added[j].matches && added[j].matches('[data-markdown]')) { hasNew = true; break; }
          if (added[j].querySelector && added[j].querySelector('[data-markdown]')) { hasNew = true; break; }
        }
        if (hasNew) break;
      }
      if (hasNew) renderAll();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ─── 启动 ───
  loadShowdown()
    .then(function () {
      renderAll();
      observe();
    })
    .catch(function (err) {
      console.error('[data-markdown]', err.message);
    });

})();
