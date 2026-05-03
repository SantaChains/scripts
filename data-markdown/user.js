// ==UserScript==
// @name         Data Markdown
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  将 HTML 中 data-markdown 元素的 Markdown 内容渲染为 HTML
// @author       Paul Irish & SantaChains
// @match        *://*/*
// @noframes
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/SantaChains/scripts/main/data-markdown/meta.js
// @downloadURL  https://raw.githubusercontent.com/SantaChains/scripts/main/data-markdown/user.js
// @supportURL   https://github.com/SantaChains/scripts/issues
// ==/UserScript==

(function () {
  'use strict';

  var SHOWDOWN_CDN = 'https://cdn.jsdelivr.net/npm/showdown@2.1.0/dist/showdown.min.js';

  var ALLOWED_TAGS = [
    'h1','h2','h3','h4','h5','h6','p','br','hr','div','span',
    'blockquote','pre','code','em','strong','b','i','u','s','del','ins',
    'a','img','ul','ol','li','dl','dt','dd',
    'table','thead','tbody','tfoot','tr','th','td','caption',
    'input','label','sup','sub','details','summary','abbr','mark'
  ];

  var ALLOWED_ATTRS = [
    'href','src','alt','title','class','id','target','rel',
    'colspan','rowspan','align','valign','width','height',
    'type','checked','disabled','for','name','value',
    'start','reversed','datetime'
  ];

  var converter = null;

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

  function sanitize(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var walk = function (node) {
      var children = [];
      for (var i = 0; i < node.childNodes.length; i++) {
        children.push(node.childNodes[i]);
      }
      for (var j = 0; j < children.length; j++) {
        var child = children[j];
        if (child.nodeType === 1) {
          var tag = child.tagName.toLowerCase();
          if (ALLOWED_TAGS.indexOf(tag) === -1) {
            while (child.firstChild) node.insertBefore(child.firstChild, child);
            node.removeChild(child);
          } else {
            var attrs = Array.prototype.slice.call(child.attributes);
            for (var k = attrs.length - 1; k >= 0; k--) {
              var attrName = attrs[k].name.toLowerCase();
              if (ALLOWED_ATTRS.indexOf(attrName) === -1) {
                child.removeAttribute(attrs[k].name);
              } else if (attrName === 'href' || attrName === 'src') {
                var val = attrs[k].value.trim().toLowerCase();
                if (val.indexOf('javascript:') === 0 || val.indexOf('data:') === 0 || val.indexOf('vbscript:') === 0) {
                  child.removeAttribute(attrs[k].name);
                }
              }
            }
            walk(child);
          }
        }
      }
    };
    walk(doc.body);
    return doc.body.innerHTML;
  }

  function renderElement(elem) {
    if (elem.dataset.mdRendered) return;
    var raw = elem.textContent || elem.innerText;
    if (!raw.trim()) return;
    var md = dedent(raw);
    var html = converter.makeHtml(md);
    elem.innerHTML = sanitize(html);
    elem.dataset.mdRendered = '1';
  }

  function renderAll() {
    var elems = document.querySelectorAll('[data-markdown]');
    for (var i = 0; i < elems.length; i++) {
      renderElement(elems[i]);
    }
  }

  function renderNewElements(addedNodes) {
    for (var i = 0; i < addedNodes.length; i++) {
      var node = addedNodes[i];
      if (node.nodeType !== 1) continue;
      if (node.matches && node.matches('[data-markdown]') && !node.dataset.mdRendered) {
        renderElement(node);
      }
      if (node.querySelector) {
        var inner = node.querySelectorAll('[data-markdown]');
        for (var j = 0; j < inner.length; j++) {
          if (!inner[j].dataset.mdRendered) renderElement(inner[j]);
        }
      }
    }
  }

  function observe() {
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        if (added.length > 0) {
          renderNewElements(added);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (!document.querySelector('[data-markdown]')) return;

  loadShowdown()
    .then(function () {
      converter = new showdown.Converter({
        tables: true,
        strikethrough: true,
        tasklists: true,
        ghCodeBlocks: true,
        simpleLineBreaks: true,
        openLinksInNewWindow: true,
      });
      renderAll();
      observe();
    })
    .catch(function (err) {
      console.error('[data-markdown]', err.message);
    });

})();
