// ==UserScript==
// @name        Steam Wishlist Enhancer
// @namespace   https://greasyfork.org/users/34380
// @version     20240505
// @description Steam愿望单增强工具：史低价格监控、购买建议、多区价格对比
// @match       https://store.steampowered.com/wishlist*
// @match       https://steamcommunity.com/id/*/wishlist*
// @match       https://steamcommunity.com/profiles/*/wishlist*
// @connect     steamdb.keylol.com
// @connect     store.steampowered.com
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// @grant       GM_notification
// @grant       GM_setClipboard
// @updateURL    https://raw.githubusercontent.com/SantaChains/scripts/main/Old-Retrofitting/steam-wishlist/meta.js
// @downloadURL  https://raw.githubusercontent.com/SantaChains/scripts/main/Old-Retrofitting/steam-wishlist/user.js
// @supportURL   https://github.com/SantaChains/scripts/issues
// ==/UserScript==

(function () {
    'use strict';



    // ==================== 样式定义 ====================
    document.querySelector('head').insertAdjacentHTML('beforeend', `<style>
        #wishlist-popup {
            width: 100%;
            position: fixed;
            top: 50px;
            justify-content: center;
            display: none;
            z-index: 10000;
            pointer-events: none;
        }
        .position-left {
            justify-content: flex-start!important;
        }
        #btn-popup-position {
            width: 40px;
            flex-grow: 0!important;
        }
        #wishlist-popup-bg {
            display: flex;
            flex-direction: column;
            background: #1b2838;
            border-radius: 4px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        #wishlist-popup-btn {
            display: flex;
            background-color: #171a21;
            pointer-events: auto;
            padding: 8px;
            border-radius: 4px 4px 0 0;
        }
        #wishlist-popup-btn > button {
            text-align: center;
            flex-grow: 1;
            letter-spacing: 1px;
            margin: 0 4px;
            padding: 8px 16px;
            background: #2a475e;
            border: none;
            color: #c6d4df;
            cursor: pointer;
            border-radius: 2px;
        }
        #wishlist-popup-btn > button:hover {
            background: #66c0f4;
            color: #fff;
        }
        #wishlist-popup-text {
            width: 1000px;
            height: 300px;
            color: #d7d8d9;
            background-color: #0e141b;
            pointer-events: auto;
            border: none;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
        }
        #wishlist-preview {
            max-width: 1200px;
            margin: 20px auto;
            color: #ebebeb;
            background-color: #1b2838;
            padding: 15px;
            border-radius: 4px;
        }
        #wishlist-preview label {
            padding: 4px 8px;
            margin-right: 5px;
            background: #2a475e;
            border-radius: 2px;
            cursor: pointer;
            display: inline-block;
            margin-bottom: 5px;
        }
        #wishlist-preview label:hover {
            background: #66c0f4;
            color: #fff;
        }
        #wishlist-preview input[type="checkbox"] {
            margin-right: 5px;
        }
        #wishlist-table {
            width: 100%;
            margin-top: 10px;
            border: 1px solid #2a475e;
            border-collapse: collapse;
            font-size: 13px;
        }
        #wishlist-table td, #wishlist-table th {
            height: 32px;
            text-indent: 8px;
            border: 1px solid #2a475e;
            padding: 4px;
        }
        #wishlist-table th {
            cursor: pointer;
            background: #2a475e;
            color: #66c0f4;
            font-weight: normal;
        }
        #wishlist-table th:hover {
            background: #3d6a8a;
        }
        #wishlist-table tr:hover {
            background-color: rgba(102,192,244,0.1);
        }
        .deal-excellent {
            background-color: rgba(92,138,0,0.6) !important;
        }
        .deal-good {
            background-color: rgba(204,102,0,0.5) !important;
        }
        .deal-bad {
            background-color: rgba(139,0,0,0.5) !important;
        }
        .hidden1, .hidden2, .hidden3 {
            display: none;
        }
        #wishlist-table td[data-game] {
            position: relative;
        }
        #wishlist-table td[data-game] .game-preview {
            display: none;
            position: absolute;
            left: 100%;
            top: 0;
            z-index: 100;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        #wishlist-table td[data-game]:hover .game-preview {
            display: block;
        }
        .discount-badge {
            color: #a4d007;
            font-weight: bold;
        }
        .price-current {
            color: #fff;
        }
        .price-lowest {
            color: #66c0f4;
        }
        .price-original {
            text-decoration: line-through;
            color: #738895;
        }
        #btn-run-wishlist {
            display: inline-block;
            margin-left: 15px;
            padding: 8px 20px;
            background: linear-gradient(135deg, #2a475e 0%, #1b2838 100%);
            border: 1px solid #66c0f4;
            color: #66c0f4;
            cursor: pointer;
            border-radius: 2px;
            font-size: 14px;
        }
        #btn-run-wishlist:hover {
            background: #66c0f4;
            color: #fff;
        }
        #wishlist-status {
            margin-left: 15px;
            color: #8f98a0;
        }
        .summary-cards {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .summary-card {
            background: #2a475e;
            padding: 15px 20px;
            border-radius: 4px;
            min-width: 150px;
        }
        .summary-card .value {
            font-size: 24px;
            color: #66c0f4;
            font-weight: bold;
        }
        .summary-card .label {
            font-size: 12px;
            color: #8f98a0;
            margin-top: 5px;
        }
    </style>`);

    // ==================== UI 插入 ====================
    document.querySelector('body').insertAdjacentHTML('afterbegin', `
        <div id="wishlist-popup">
            <div id="wishlist-popup-bg">
                <div id="wishlist-popup-btn">
                    <button id="btn-popup-position">«</button>
                    <button id="btn-popup-names">只看游戏名</button>
                    <button id="btn-popup-bbcode">导出表格(BBCode)</button>
                    <button id="btn-popup-markdown">导出表格(Markdown)</button>
                    <button id="btn-popup-preview">显示/隐藏预览</button>
                    <button id="btn-popup-refresh">刷新价格数据</button>
                    <button id="btn-popup-close">关闭</button>
                </div>
                <textarea id="wishlist-popup-text">点击"分析愿望单"开始获取数据...

功能说明：
1. 自动扫描愿望单所有游戏
2. 获取当前价格和史低价格
3. 标记值得买的游戏（绿色=史低，橙色=接近史低）
4. 支持多区价格对比
5. 可导出为 BBCode/Markdown 表格

提示：首次加载需要获取价格数据，请耐心等待。</textarea>
            </div>
        </div>
    `);

    // 在愿望单页面插入按钮
    const insertButton = () => {
        const header = document.querySelector('.wishlist_header') || document.querySelector('#wishlist_controls');
        if (header && !document.querySelector('#btn-run-wishlist')) {
            header.insertAdjacentHTML('afterend', `
                <div style="margin: 15px 0;">
                    <button id="btn-run-wishlist">🔍 分析愿望单</button>
                    <span id="wishlist-status" style="display:none;">
                        <span id="wishlist-total">0</span> 款游戏，
                        已加载 <span id="wishlist-loaded">0</span> 款，
                        史低 <span id="wishlist-deals">0</span> 款
                    </span>
                </div>
            `);

            document.querySelector('#btn-run-wishlist').addEventListener('click', () => {
                main();
                document.querySelector('#wishlist-status').style.display = 'inline';
                document.querySelector('#wishlist-popup').style.display = 'flex';
            });
        }
    };

    // 等待页面加载
    const waitForPage = (callback) => {
        if (document.querySelector('.wishlist_header') || document.querySelector('#wishlist_controls')) {
            callback();
            return;
        }
        const observer = new MutationObserver(() => {
            if (document.querySelector('.wishlist_header') || document.querySelector('#wishlist_controls')) {
                observer.disconnect();
                callback();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { observer.disconnect(); }, 10000);
    };

    waitForPage(insertButton);

    // ==================== 数据表格区域 ====================
    document.querySelector('body').insertAdjacentHTML('beforeend', `
        <div id="wishlist-preview" style="display:none;">
            <div class="summary-cards">
                <div class="summary-card">
                    <div class="value" id="summary-total">0</div>
                    <div class="label">愿望单总数</div>
                </div>
                <div class="summary-card">
                    <div class="value" id="summary-ondiscount">0</div>
                    <div class="label">正在打折</div>
                </div>
                <div class="summary-card">
                    <div class="value" id="summary-lowest">0</div>
                    <div class="label">达到史低</div>
                </div>
                <div class="summary-card">
                    <div class="value" id="summary-closelowest">0</div>
                    <div class="label">接近史低(&lt;10%)</div>
                </div>
                <div class="summary-card">
                    <div class="value" id="summary-totalsave">¥0</div>
                    <div class="label">按史低购买可省</div>
                </div>
            </div>
            <div id="checkbox-cols">
                <label><input id="cb-region-cn" type="checkbox" value="region-cn" checked>国区价格</label>
                <label><input id="cb-region-us" type="checkbox" value="region-us">美区价格</label>
                <label><input id="cb-region-hk" type="checkbox" value="region-hk">港区价格</label>
                <label><input id="cb-region-ru" type="checkbox" value="region-ru">俄区价格</label>
                <label><input id="cb-region-ar" type="checkbox" value="region-ar">阿区价格</label>
                <label><input id="cb-show-lowest" type="checkbox" value="show-lowest" checked>显示史低</label>
                <label><input id="cb-show-bundle" type="checkbox" value="show-bundle" checked>进包次数</label>
                <label><input id="cb-show-rating" type="checkbox" value="show-rating" checked>好评率</label>
            </div>
            <div id="checkbox-rows" style="margin-top: 10px;">
                <label><input id="cb-filter-ondiscount" type="checkbox" value="filter-ondiscount">仅显示打折</label>
                <label><input id="cb-filter-lowest" type="checkbox" value="filter-lowest">仅显示史低</label>
                <label><input id="cb-filter-gooddeal" type="checkbox" value="filter-gooddeal">仅显示好价(折扣>50%)</label>
            </div>
            <table id="wishlist-table">
                <thead>
                    <tr class="tr-header">
                        <th data-col="priority" data-reverse="1">排序</th>
                        <th data-col="name" data-reverse="-1">游戏名称</th>
                        <th data-col="discount" data-reverse="1">折扣</th>
                        <th class="region-cn" data-col="pricecn" data-reverse="-1">当前价(CN)</th>
                        <th class="region-cn" data-col="lowestcn" data-reverse="-1">史低(CN)</th>
                        <th class="region-us hidden2" data-col="priceus" data-reverse="-1">当前价(US)</th>
                        <th class="region-us hidden2" data-col="lowestus" data-reverse="-1">史低(US)</th>
                        <th class="region-hk hidden2" data-col="pricehk" data-reverse="-1">当前价(HK)</th>
                        <th class="region-hk hidden2" data-col="lowesthk" data-reverse="-1">史低(HK)</th>
                        <th class="region-ru hidden2" data-col="priceru" data-reverse="-1">当前价(RU)</th>
                        <th class="region-ru hidden2" data-col="lowestru" data-reverse="-1">史低(RU)</th>
                        <th class="region-ar hidden2" data-col="pricear" data-reverse="-1">当前价(AR)</th>
                        <th class="region-ar hidden2" data-col="lowestar" data-reverse="-1">史低(AR)</th>
                        <th data-col="bundle" data-reverse="-1">进包</th>
                        <th data-col="rating" data-reverse="-1">好评率</th>
                        <th data-col="released" data-reverse="-1">发售日期</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `);

    // ==================== 核心功能 ====================
    const XHR_MAX_RETRIES = 3;

    async function xhr(xhr_data, _retries) {
        const retries = _retries || 0;
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: xhr_data.url,
                responseType: xhr_data.type || 'json',
                timeout: 15000,
                onload: (res) => {
                    if (res.status === 429 && retries < XHR_MAX_RETRIES) {
                        console.log('429 限流，等待 30 秒后重试...', retries + 1);
                        setTimeout(() => resolve(xhr(xhr_data, retries + 1)), 30000);
                    } else if (res.status >= 500 && retries < XHR_MAX_RETRIES) {
                        console.log(res.status, '服务器错误，5秒后重试', retries + 1);
                        setTimeout(() => resolve(xhr(xhr_data, retries + 1)), 5000);
                    } else {
                        resolve(res);
                    }
                },
                onerror: (e) => {
                    console.error('请求错误:', e);
                    reject(e);
                },
                ontimeout: () => {
                    if (retries < XHR_MAX_RETRIES) {
                        console.log('请求超时，重试中...', retries + 1);
                        resolve(xhr(xhr_data, retries + 1));
                    } else {
                        reject(new Error('请求超时，已达最大重试次数'));
                    }
                }
            });
        });
    }

    // 获取愿望单数据
    class Wishlist {
        constructor() {
            this.games = [];
            this.steamId = this.getSteamId();
            if (!this.steamId) {
                throw new Error('无法获取 Steam ID，请确认已登录 Steam');
            }
            this.baseUrl = `https://store.steampowered.com/wishlist/profiles/${this.steamId}/wishlistdata/`;
        }

        getSteamId() {
            // 从页面获取 Steam ID
            const match = window.location.href.match(/profiles\/(\d+)/);
            if (match) return match[1];
            
            // 尝试从全局变量获取
            if (typeof g_steamID !== 'undefined') return g_steamID;
            
            // 从 meta 或脚本标签获取
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const text = script.textContent;
                const idMatch = text.match(/"steamid":"(\d+)"/);
                if (idMatch) return idMatch[1];
            }
            
            return null;
        }

        async fetchAllGames() {
            const games = [];
            let start = 0;
            const pageSize = 100;
            
            while (true) {
                try {
                    const res = await xhr({
                        url: `${this.baseUrl}?p=${Math.floor(start / pageSize)}`,
                        type: 'json'
                    });
                    
                    const data = res.response;
                    if (!data || Object.keys(data).length === 0) break;
                    
                    for (const [appid, game] of Object.entries(data)) {
                        games.push({
                            appid: parseInt(appid),
                            name: game.name,
                            priority: game.priority || 0,
                            added: game.added,
                            released: game.released,
                            subs: game.subs || []
                        });
                    }
                    
                    updateStatus(games.length, 0, 0);
                    
                    if (Object.keys(data).length < pageSize) break;
                    start += pageSize;
                    
                    // 请求间隔，避免限流
                    await new Promise(r => setTimeout(r, 1000));
                } catch (e) {
                    console.error('获取愿望单失败:', e);
                    break;
                }
            }
            
            this.games = games.sort((a, b) => a.priority - b.priority);
            return this.games;
        }
    }

    // 游戏数据类
    class Game {
        constructor(appid, name, priority, released) {
            this.appid = appid;
            this.name = name;
            this.priority = priority;
            this.released = released;
            this.priceData = null;
            this.isLoaded = false;
        }

        // 从缓存检查
        checkCache() {
            const cache = GM_getValue(`game_${this.appid}`, null);
            if (cache && (Date.now() - cache.timestamp < 3600000)) { // 1小时缓存
                this.priceData = cache.data;
                this.isLoaded = true;
                return true;
            }
            return false;
        }

        // 保存到缓存
        saveCache() {
            GM_setValue(`game_${this.appid}`, {
                timestamp: Date.now(),
                data: this.priceData
            });
        }

        // 获取价格数据
        async fetchPriceData() {
            if (this.checkCache()) return this.priceData;
            
            try {
                // 从 Steam API 获取
                const res = await xhr({
                    url: `https://store.steampowered.com/api/appdetails?appids=${this.appid}&cc=cn&l=schinese`,
                    type: 'json'
                });
                
                const data = res.response[this.appid];
                if (!data || !data.success) {
                    throw new Error('无法获取游戏数据');
                }
                
                const gameData = data.data;
                this.priceData = {
                    name: gameData.name,
                    isFree: gameData.is_free,
                    price: {},
                    metacritic: gameData.metacritic?.score || null,
                    releaseDate: gameData.release_date?.date || '',
                    rating: this.parseRating(gameData.recommendations)
                };
                
                // 解析价格
                if (gameData.price_overview) {
                    this.priceData.price.cn = {
                        current: gameData.price_overview.final / 100,
                        original: gameData.price_overview.initial / 100,
                        discount: gameData.price_overview.discount_percent
                    };
                }
                
                // 获取其他区价格
                await this.fetchOtherRegions();
                
                // 获取史低数据
                await this.fetchLowestPrice();
                
                this.isLoaded = true;
                this.saveCache();
                return this.priceData;
            } catch (e) {
                console.error(`获取 ${this.name} 价格失败:`, e);
                return null;
            }
        }

        parseRating(recommendations) {
            if (!recommendations) return null;
            // 从推荐数估算好评率（简化处理）
            return null; // 需要额外 API
        }

        async fetchOtherRegions() {
            const regions = [
                { cc: 'us', code: 'us' },
                { cc: 'hk', code: 'hk' },
                { cc: 'ru', code: 'ru' },
                { cc: 'ar', code: 'ar' }
            ];

            const tasks = regions.map(async (region) => {
                try {
                    const res = await xhr({
                        url: `https://store.steampowered.com/api/appdetails?appids=${this.appid}&cc=${region.cc}`,
                        type: 'json'
                    });

                    const data = res.response[this.appid];
                    if (data?.success && data.data?.price_overview) {
                        this.priceData.price[region.code] = {
                            current: data.data.price_overview.final / 100,
                            original: data.data.price_overview.initial / 100,
                            discount: data.data.price_overview.discount_percent
                        };
                    }
                } catch (e) {
                    console.log(`获取 ${region.cc} 区价格失败`);
                }
            });

            await Promise.all(tasks);
        }

        async fetchLowestPrice() {
            try {
                // 使用 steamdb.keylol.com 获取史低数据
                const res = await xhr({
                    url: `https://steamdb.keylol.com/app/${this.appid}/data.js?v=38`,
                    type: 'text'
                });
                
                const match = res.response.match(/proc\((.*)\)/);
                if (match) {
                    const data = JSON.parse(match[1]);
                    const history = data.price_history || {};
                    const steam = history.steam || {};
                    const bundles = history.bundles || {};
                    
                    this.priceData.lowest = {
                        cn: steam.cn || null,
                        us: steam.us || null,
                        hk: steam.hk || null,
                        ru: steam.ru || null,
                        ar: steam.ar || null,
                        cut: steam.cut || 0
                    };
                    this.priceData.bundleCount = bundles.count || 0;
                    this.priceData.hasCard = data.card ? true : false;
                }
            } catch (e) {
                console.log(`获取 ${this.name} 史低失败`);
                this.priceData.lowest = { cn: null, us: null, hk: null, ru: null, ar: null, cut: 0 };
                this.priceData.bundleCount = 0;
                this.priceData.hasCard = false;
            }
        }

        // 计算购买建议
        getDealRating() {
            if (!this.priceData || this.priceData.isFree) return 'normal';

            const currentPrice = this.priceData.price.cn?.current;
            const lowestPrice = this.priceData.lowest?.cn;

            if (!currentPrice || currentPrice <= 0) return 'normal';
            if (lowestPrice == null || lowestPrice <= 0) return 'normal';

            if (currentPrice <= lowestPrice) return 'excellent';
            if (currentPrice <= lowestPrice * 1.1) return 'good';
            return 'fair';
        }

        getSavings() {
            if (!this.priceData?.price.cn || !this.priceData?.lowest?.cn) return 0;
            const current = this.priceData.price.cn.current;
            const lowest = this.priceData.lowest.cn;
            return Math.max(0, current - lowest);
        }
    }

    // ==================== 状态更新 ====================
    function updateStatus(total, loaded, deals) {
        document.querySelector('#wishlist-total').textContent = total;
        document.querySelector('#wishlist-loaded').textContent = loaded;
        document.querySelector('#wishlist-deals').textContent = deals;
    }

    function updatePopupText(text) {
        document.querySelector('#wishlist-popup-text').value = text;
    }

    // ==================== 表格生成 ====================
    let bbcode = '';
    let markdown = '';
    let html = '';

    function generateTable(games) {
        bbcode = '';
        markdown = '';
        html = '';
        
        let excellentCount = 0;
        let goodCount = 0;
        let onDiscountCount = 0;
        let totalSavings = 0;
        
        const tbody = document.querySelector('#wishlist-table tbody');
        tbody.innerHTML = '';
        
        for (const game of games) {
            if (!game.priceData) continue;
            
            const dealRating = game.getDealRating();
            const priceCN = game.priceData.price.cn;
            const lowestCN = game.priceData.lowest?.cn;
            
            if (priceCN?.discount > 0) onDiscountCount++;
            if (dealRating === 'excellent') excellentCount++;
            if (dealRating === 'good') goodCount++;
            totalSavings += game.getSavings();
            
            const rowClass = dealRating === 'excellent' ? 'deal-excellent' : 
                            dealRating === 'good' ? 'deal-good' : '';
            
            // 生成表格行
            const row = createTableRow(game, rowClass);
            tbody.insertAdjacentHTML('beforeend', row.html);
            
            // 累加导出格式
            bbcode += row.bbcode + '\n';
            markdown += row.markdown + '\n';
        }
        
        // 更新汇总卡片
        document.querySelector('#summary-total').textContent = games.length;
        document.querySelector('#summary-ondiscount').textContent = onDiscountCount;
        document.querySelector('#summary-lowest').textContent = excellentCount;
        document.querySelector('#summary-closelowest').textContent = goodCount;
        document.querySelector('#summary-totalsave').textContent = `¥${totalSavings.toFixed(0)}`;
    }

    function createTableRow(game, rowClass) {
        const p = game.priceData;
        const price = p?.price || {};
        const lowest = p?.lowest || {};
        
        const cnPrice = price.cn || {};
        const usPrice = price.us || {};
        const hkPrice = price.hk || {};
        const ruPrice = price.ru || {};
        const arPrice = price.ar || {};
        
        // HTML 行
        const html = `
            <tr class="${rowClass}" data-discount="${cnPrice.discount || 0}" data-pricecn="${cnPrice.current || 99999}" data-deal-rating="${game.getDealRating()}">
                <td data-priority="${game.priority}">${game.priority}</td>
                <td data-game="${game.name}" data-name="${game.name.toLowerCase()}">
                    <a href="https://store.steampowered.com/app/${game.appid}/" target="_blank">${game.name}</a>
                    <div class="game-preview"><img src="https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg" width="200"></div>
                </td>
                <td data-discount="${cnPrice.discount || 0}">
                    ${cnPrice.discount > 0 ? `<span class="discount-badge">-${cnPrice.discount}%</span>` : '-'}
                </td>
                <td class="region-cn" data-pricecn="${cnPrice.current || 0}">
                    ${cnPrice.current ? `¥${cnPrice.current}` : '-'}
                </td>
                <td class="region-cn" data-lowestcn="${lowest.cn || 99999}">
                    ${lowest.cn ? `<span class="price-lowest">¥${lowest.cn}</span>` : '-'}
                </td>
                <td class="region-us hidden2" data-priceus="${usPrice.current || 0}">$${usPrice.current || '-'}</td>
                <td class="region-us hidden2" data-lowestus="${lowest.us || 0}">$${lowest.us || '-'}</td>
                <td class="region-hk hidden2" data-pricehk="${hkPrice.current || 0}">HK$${hkPrice.current || '-'}</td>
                <td class="region-hk hidden2" data-lowesthk="${lowest.hk || 0}">HK$${lowest.hk || '-'}</td>
                <td class="region-ru hidden2" data-priceru="${ruPrice.current || 0}">₽${ruPrice.current || '-'}</td>
                <td class="region-ru hidden2" data-lowestru="${lowest.ru || 0}">₽${lowest.ru || '-'}</td>
                <td class="region-ar hidden2" data-pricear="${arPrice.current || 0}">ARS${arPrice.current || '-'}</td>
                <td class="region-ar hidden2" data-lowestar="${lowest.ar || 0}">ARS${lowest.ar || '-'}</td>
                <td data-bundle="${p?.bundleCount || 0}">${p?.bundleCount || '-'}</td>
                <td data-rating="${p?.rating || 0}">${p?.rating ? p.rating + '%' : '-'}</td>
                <td data-released="${game.released || 0}">${p?.releaseDate || '-'}</td>
            </tr>
        `;
        
        const bbcodeRow = `[tr][td]${game.priority}[/td][td][url=https://store.steampowered.com/app/${game.appid}/]${game.name}[/url][/td][td]${cnPrice.discount > 0 ? '-' + cnPrice.discount + '%' : '-'}[/td][td]${cnPrice.current ? '¥' + cnPrice.current : '-'}[/td][td]${lowest.cn ? '¥' + lowest.cn : '-'}[/td][td]${p?.bundleCount || '-'}[/td][/tr]`;

        const mdRow = '| ' + game.priority + ' | [' + game.name + '](https://store.steampowered.com/app/' + game.appid + '/) | ' + (cnPrice.discount > 0 ? '-' + cnPrice.discount + '%' : '-') + ' | ' + (cnPrice.current ? '¥' + cnPrice.current : '-') + ' | ' + (lowest.cn ? '¥' + lowest.cn : '-') + ' | ' + (p?.bundleCount || '-') + ' |';
        
        return { html, bbcode: bbcodeRow, markdown: mdRow };
    }

    // ==================== 主流程 ====================
    let wishlist;
    let games = [];
    let isLoading = false;

    async function main() {
        if (isLoading) return;
        isLoading = true;
        
        updatePopupText('正在获取愿望单数据...');
        
        // 获取愿望单
        try {
            wishlist = new Wishlist();
        } catch (e) {
            updatePopupText(e.message || '获取 Steam ID 失败，请确认已登录 Steam。');
            isLoading = false;
            return;
        }
        const wishlistGames = await wishlist.fetchAllGames();
        
        if (wishlistGames.length === 0) {
            updatePopupText('愿望单为空或获取失败，请确认已登录 Steam。');
            isLoading = false;
            return;
        }
        
        updatePopupText(`找到 ${wishlistGames.length} 款游戏，正在获取价格数据...`);
        
        // 创建 Game 对象并获取价格
        games = wishlistGames.map(g => new Game(g.appid, g.name, g.priority, g.released));
        
        let loaded = 0;
        let deals = 0;
        
        for (const game of games) {
            await game.fetchPriceData();
            loaded++;
            
            if (game.getDealRating() === 'excellent') deals++;
            
            updateStatus(games.length, loaded, deals);
            updatePopupText(`正在获取价格数据... (${loaded}/${games.length})\n当前: ${game.name}`);
            
            // 请求间隔
            await new Promise(r => setTimeout(r, 800));
        }
        
        // 生成表格
        generateTable(games);
        
        // 显示预览
        document.querySelector('#wishlist-preview').style.display = 'block';
        
        updatePopupText(`数据加载完成！\n共 ${games.length} 款游戏，${deals} 款达到史低。\n\n点击"导出表格"按钮复制数据。`);
        
        isLoading = false;
    }

    // ==================== 事件绑定 ====================
    const popup = document.querySelector('#wishlist-popup');
    const popupText = document.querySelector('#wishlist-popup-text');

    // 位置切换
    document.querySelector('#btn-popup-position').addEventListener('click', (e) => {
        e.target.textContent = e.target.textContent === '«' ? '»' : '«';
        popup.classList.toggle('position-left');
    });

    // 只看游戏名
    document.querySelector('#btn-popup-names').addEventListener('click', () => {
        const names = games.map(g => g.name).join('\n');
        popupText.value = names;
        GM_setClipboard(names);
        GM_notification({ text: '游戏名称已复制', title: 'Steam Wishlist Enhancer' });
    });

    // 导出 BBCode
    document.querySelector('#btn-popup-bbcode').addEventListener('click', () => {
        const header = '[table]\n[tr][td]排序[/td][td]游戏[/td][td]折扣[/td][td]当前价[/td][td]史低[/td][td]进包[/td][/tr]\n';
        const footer = '[/table]';
        const full = header + bbcode + footer;
        popupText.value = full;
        GM_setClipboard(full);
        GM_notification({ text: 'BBCode 表格已复制', title: 'Steam Wishlist Enhancer' });
    });

    // 导出 Markdown
    document.querySelector('#btn-popup-markdown').addEventListener('click', () => {
        const header = '| 排序 | 游戏 | 折扣 | 当前价 | 史低 | 进包 |\n|------|------|------|--------|------|------|\n';
        const full = header + markdown;
        popupText.value = full;
        GM_setClipboard(full);
        GM_notification({ text: 'Markdown 表格已复制', title: 'Steam Wishlist Enhancer' });
    });

    // 显示/隐藏预览
    document.querySelector('#btn-popup-preview').addEventListener('click', () => {
        const preview = document.querySelector('#wishlist-preview');
        preview.style.display = preview.style.display === 'none' ? 'block' : 'none';
    });

    // 刷新数据
    document.querySelector('#btn-popup-refresh').addEventListener('click', () => {
        // 清除缓存
        const keys = GM_listValues();
        for (const key of keys) {
            if (key.startsWith('game_')) {
                GM_deleteValue(key);
            }
        }
        main();
    });

    // 关闭
    document.querySelector('#btn-popup-close').addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // 列显示控制
    document.querySelector('#checkbox-cols').addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') {
            const value = e.target.value;
            if (value.startsWith('region-')) {
                document.querySelectorAll('.' + value).forEach(el => {
                    el.classList.toggle('hidden2');
                });
            }
        }
    });

    // 行过滤
    document.querySelector('#checkbox-rows').addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') {
            const value = e.target.value;
            const tbody = document.querySelector('#wishlist-table tbody');
            const rows = tbody.querySelectorAll('tr');
            
            rows.forEach(row => {
                const discount = parseInt(row.dataset.discount) || 0;
                
                let shouldHide = false;
                if (value === 'filter-ondiscount' && e.target.checked && discount === 0) {
                    shouldHide = true;
                }
                if (value === 'filter-lowest' && e.target.checked) {
                    const dealRating = row.querySelector('[data-deal-rating]')?.dataset.dealRating;
                    if (dealRating !== 'excellent') shouldHide = true;
                }
                if (value === 'filter-gooddeal' && e.target.checked && discount < 50) {
                    shouldHide = true;
                }
                
                row.style.display = shouldHide ? 'none' : '';
            });
        }
    });

    // 表格排序
    document.querySelector('#wishlist-table thead').addEventListener('click', (e) => {
        if (e.target.tagName === 'TH') {
            const col = e.target.dataset.col;
            const reverse = e.target.dataset.reverse === '1';
            
            const tbody = document.querySelector('#wishlist-table tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            rows.sort((a, b) => {
                const aVal = a.querySelector(`[data-${col}]`)?.dataset[col] || 0;
                const bVal = b.querySelector(`[data-${col}]`)?.dataset[col] || 0;
                return reverse ? bVal - aVal : aVal - bVal;
            });
            
            rows.forEach(row => tbody.appendChild(row));
            
            // 切换排序方向
            e.target.dataset.reverse = reverse ? '0' : '1';
        }
    });

})();
