const App = {
    apiURL: 'https://api.coingecko.com/api/v3',
    state: {
        coins: [],              // Seznam mincí z trhu
        portfolio: [],          // Uživatelská data
        currentCoinId: null,    // Právě vybraná mince
        chartInstance: null,    // Instance Chart.js
        chartDays: '1',         // 1, 7, 30, 365
        lastFetch: 0,           // Timestamp posledního stažení trhu
        chartCache: {},         // Cache pro historická data grafů
        sortCol: null,          // Sloupec pro řazení
        sortAsc: true,          // Směr řazení
        theme: 'light',         // light, dark
        apiCooldownUntil: 0, // kdy nejdřív smíme znovu volat API (rate-limit)
        apiBackoffMs: 0      // poslední backoff (exponential)
        ,apiStatus: { type: null, until: 0, message: '', lastToastAt: 0 }, apiUI: { currentView: 'market', marketIntervalId: null, portfolioIntervalId: null, portfolioPrices: { ts: 0, map: {} }, chartAbort: null }
        ,portfolioRenderSeq: 0,
        lastMarketOkTs: 0,
        expandedCoins: new Set(), // které coin skupiny jsou rozbalené v portfoliu

    },
    ui: {},

    // --- 1. INICIALIZACE ---
    init: async () => {
        console.log('🚀 Aplikace startuje...');
        App.cacheDOM();
        App.setupStatusUI();
        App.loadSettings();
        App.applyTheme();
        App.loadPortfolio();

        const cachedMarket = App.loadMarketCache();
        if (!cachedMarket || !Array.isArray(cachedMarket.data) || cachedMarket.data.length === 0) {
            App.showMarketSkeleton();
        }
        if (cachedMarket && (Date.now() - cachedMarket.ts < App.MARKET_CACHE_TTL)) {
            App.state.coins = cachedMarket.data;
            App.state.lastMarketOkTs = cachedMarket.ts;
            App.setApiStatus('cached', { source: 'cache', ts: cachedMarket.ts, note: 'Načítám aktuální data…' });
            App.state.lastFetch = cachedMarket.ts;
            App.renderCoinList();
            App.renderPortfolio();
        }

        await App.fetchMarketData();

        App.bindEvents();
        App.handleUrlRouting();

        App.startMarketPolling();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) return;
            if (App.state.apiUI.currentView === 'market') App.fetchMarketData(true);
            if (App.state.apiUI.currentView === 'portfolio') App.fetchPortfolioPrices(true).then(() => App.renderPortfolio());
        });
    },

    switchView: (view) => {
        App.state.apiUI.currentView = view;

        if (view === 'portfolio') {
            // UI
            App.ui.viewDetail.classList.add('hidden');
            App.ui.viewPortfolio.classList.remove('hidden');
            App.ui.navPortfolio.classList.add('active');
            App.ui.navMarket.classList.remove('active');

            // Polling
            App.stopMarketPolling();
            App.startPortfolioPolling();

            // Render
            App.renderPortfolio();
        } else {
            // market/detail view
            App.ui.viewDetail.classList.remove('hidden');
            App.ui.viewPortfolio.classList.add('hidden');
            App.ui.navMarket.classList.add('active');
            App.ui.navPortfolio.classList.remove('active');

            App.stopPortfolioPolling();
            App.startMarketPolling();
            App.fetchMarketData(true);
        }
    },

    startMarketPolling: () => {
        if (App.state.apiUI.marketIntervalId) return;
        App.state.apiUI.marketIntervalId = setInterval(() => {
            if (document.hidden) return;
            if (App.state.apiUI.currentView !== 'market') return;
            App.fetchMarketData(true);
        }, 60000);
    },

    stopMarketPolling: () => {
        if (App.state.apiUI.marketIntervalId) {
            clearInterval(App.state.apiUI.marketIntervalId);
            App.state.apiUI.marketIntervalId = null;
        }
    },

    startPortfolioPolling: () => {
        if (App.state.apiUI.portfolioIntervalId) return;

        App.state.apiUI.portfolioIntervalId = setInterval(async () => {
            if (document.hidden) return;
            if (App.state.apiUI.currentView !== 'portfolio') return;
            await App.fetchPortfolioPrices(true);
            App.renderPortfolio();
        }, 120000);
    },

    stopPortfolioPolling: () => {
        if (App.state.apiUI.portfolioIntervalId) {
            clearInterval(App.state.apiUI.portfolioIntervalId);
            App.state.apiUI.portfolioIntervalId = null;
        }
    },

    // --- UI helpers: skeletons ---
    showMarketSkeleton: (count = 10) => {
        const items = Array.from({ length: count }).map(() => `
            <div class="coin-item skeleton-item">
                <div class="skeleton-left">
                    <div class="sk sk-line sk-w-70"></div>
                    <div class="sk sk-line sk-w-40"></div>
                </div>
                <div class="skeleton-right">
                    <div class="sk sk-line sk-w-50"></div>
                    <div class="sk sk-line sk-w-30"></div>
                </div>
            </div>
        `).join('');
        App.ui.coinList.innerHTML = items;
    },

    showChartLoading: () => {
        App.setChartMessage('Načítám graf…', 'Chvilku strpení, stahuji historická data.', { loading: true });
    },

    ensureFieldErrorNodes: () => {
        const ensure = (inputEl, id) => {
            if (!inputEl) return null;
            let node = document.getElementById(id);
            if (!node) {
                node = document.createElement('div');
                node.id = id;
                node.className = 'field-error hidden';
                inputEl.insertAdjacentElement('afterend', node);
            }
            return node;
        };
        App.ui.amountError = ensure(App.ui.amountInput, 'amount-error');
        App.ui.priceError = ensure(App.ui.priceInput, 'price-error');
    },

    setFieldError: (inputEl, errEl, msg) => {
        if (!inputEl || !errEl) return;
        if (!msg) {
            inputEl.classList.remove('input-error');
            errEl.classList.add('hidden');
            errEl.innerText = '';
            return;
        }
        inputEl.classList.add('input-error');
        errEl.classList.remove('hidden');
        errEl.innerText = msg;
    },

    validateTradeForm: () => {
        App.ensureFieldErrorNodes();

        const amountRaw = App.ui.amountInput.value;
        const priceRaw = App.ui.priceInput.value;

        const amount = Number(amountRaw);
        const pricePerUnit = Number(priceRaw);

        let ok = true;

        if (!Number.isFinite(amount) || amount === 0) {
            App.setFieldError(
                App.ui.amountInput,
                App.ui.amountError,
                'Zadej množství (může být i záporné pro prodej), ale nesmí být 0.'
            );
            ok = false;
        } else {
            App.setFieldError(App.ui.amountInput, App.ui.amountError, '');
        }

        if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
            App.setFieldError(
                App.ui.priceInput,
                App.ui.priceError,
                'Zadej cenu za 1 coin v CZK větší než 0.'
            );
            ok = false;
        } else {
            App.setFieldError(App.ui.priceInput, App.ui.priceError, '');
        }

        return { ok, amount, pricePerUnit };
    },

    fetchPortfolioPrices: async (force = false) => {
        const now = Date.now();
        const ttl = 60000;
        if (!force && App.state.apiUI.portfolioPrices.ts && (now - App.state.apiUI.portfolioPrices.ts) < ttl) {
            return App.state.apiUI.portfolioPrices.map;
        }

        const ids = [...new Set(App.state.portfolio.map(p => p.coinId))].filter(Boolean);
        if (ids.length === 0) {
            App.state.apiUI.portfolioPrices = { ts: now, map: {} };
            return {};
        }

        if (now < App.state.apiCooldownUntil) {
            App.setApiStatus('cooldown', { until: App.state.apiCooldownUntil, ts: App.state.lastMarketOkTs });
            return App.state.apiUI.portfolioPrices.map || {};
        }

        try {
            const url = `${App.apiURL}/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=${App.CURRENCY}`;
            const res = await App.apiFetch(url);
            const data = await res.json();
            const map = {};
            ids.forEach(id => {
                const price = data?.[id]?.[App.CURRENCY];
                if (typeof price === 'number') map[id] = price;
            });

            App.state.apiUI.portfolioPrices = { ts: now, map };

            return map;
        } catch (err) {
            if (err?.code === 'RATE_LIMIT' || err?.code === 'COOLDOWN') {
                const until = err.retryAfterMs ? (Date.now() + err.retryAfterMs) : App.state.apiCooldownUntil;
                App.setApiStatus('cooldown', { until, ts: App.state.lastMarketOkTs });
                return App.state.apiUI.portfolioPrices.map || {};
            }
            App.setApiStatus('error', { message: 'Nepodařilo se načíst ceny pro portfolio. Zobrazují se poslední známé hodnoty.' });
            return App.state.apiUI.portfolioPrices.map || {};
        }
    },

    getChartCacheTTL: (days) => {
        const d = String(days);
        if (d === '1') return 10 * 60 * 1000;      // 10 min
        if (d === '7') return 30 * 60 * 1000;      // 30 min
        if (d === '30') return 2 * 60 * 60 * 1000; // 2 h
        if (d === '365') return 12 * 60 * 60 * 1000; // 12 h
        return 30 * 60 * 1000;
    },

    loadChartCacheLS: (coinId, days) => {
        try {
            const key = `coindash_chart_${coinId}_${days}`;
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj || !Array.isArray(obj.data) || !obj.ts) return null;
            return obj;
        } catch {
            return null;
        }
    },

    saveChartCacheLS: (coinId, days, data) => {
        try {
            const key = `coindash_chart_${coinId}_${days}`;
            localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
        } catch { /* ignore */ }
    },

    cacheDOM: () => {
        App.ui = {
            coinList: document.getElementById('coin-list'),
            searchInput: document.getElementById('search-input'),
            welcomeScreen: document.getElementById('welcome-screen'),
            detailContent: document.getElementById('coin-detail-content'),
            viewDetail: document.getElementById('view-detail'),
            viewPortfolio: document.getElementById('view-portfolio-dashboard'),

            navMarket: document.getElementById('nav-market'),
            navPortfolio: document.getElementById('nav-portfolio'),
            themeToggle: document.getElementById('theme-toggle'),

            detailTitle: document.getElementById('detail-title'),
            detailPrice: document.getElementById('detail-price'),
            priceChart: document.getElementById('price-chart'),

            tradeForm: document.getElementById('trade-form'),
            amountInput: document.getElementById('amount-input'),
            priceInput: document.getElementById('price-input'),
            portfolioList: document.getElementById('portfolio-list'),
            portfolioTotal: document.getElementById('portfolio-total'),
            portfolioProfit: document.getElementById('portfolio-profit'),
            emptyMsg: document.getElementById('empty-portfolio-msg'),
            btnExport: document.getElementById('btn-export'),
            btnImport: document.getElementById('btn-import'),
            fileImport: document.getElementById('file-import'),

            toast: document.getElementById('toast'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalBtnConfirm: document.getElementById('modal-btn-confirm'),
            modalBtnCancel: document.getElementById('modal-btn-cancel')
        };
    },

    setupStatusUI: () => {
        if (!document.getElementById('api-status')) {
            const header = document.querySelector('header');
            if (header) header.insertAdjacentHTML('afterend', '<div id="api-status" class="api-status hidden" role="status" aria-live="polite"></div>');
        }
        App.ui.apiStatus = document.getElementById('api-status');

        const chartInner = document.querySelector('.chart-container-inner');
        if (chartInner && !document.getElementById('chart-message')) {
            chartInner.insertAdjacentHTML('afterbegin', '<div id="chart-message" class="chart-message hidden"></div>');
        }
        App.ui.chartMessage = document.getElementById('chart-message');

        if (!document.getElementById('status-ui-style')) {
            const style = document.createElement('style');
            style.id = 'status-ui-style';
            style.textContent = `
                #api-status.api-status{ padding:10px 30px; font-size:13px; border-bottom:1px solid var(--border); background: var(--bg-card); display:flex; gap:10px; align-items:flex-start; }
                #api-status.hidden{ display:none !important; }
                #api-status .api-status__icon{ line-height:1.2; }
                #api-status .api-status__title{ font-weight:600; margin-right:6px; }
                #api-status .api-status__meta{ opacity:.85; }
                #api-status .api-status__hint{ opacity:.85; margin-top:2px; }
                #api-status .api-status__row{ display:flex; flex-wrap:wrap; gap:6px; align-items:baseline; }
                #api-status .api-status__actions{ margin-left:auto; display:flex; gap:8px; align-items:center; }
                #api-status button{ border:1px solid var(--border); background: transparent; padding:6px 10px; border-radius:10px; cursor:pointer; font-size:12px; }
                #api-status button:hover{ opacity:.9; }
                #chart-message.chart-message{ position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:18px; background: rgba(0,0,0,0.04); backdrop-filter: blur(1px); }
                body.dark-mode #chart-message.chart-message{ background: rgba(0,0,0,0.25); }
                #chart-message.hidden{ display:none !important; }
                #chart-message .chart-message__title{ font-weight:700; margin-bottom:6px; }
                #chart-message .chart-message__text{ font-size:13px; opacity:.9; }
            `;
            document.head.appendChild(style);
        }

        if (App.ui.apiStatus && !App.ui.apiStatus.dataset.bound) {
            App.ui.apiStatus.dataset.bound = '1';
            App.ui.apiStatus.addEventListener('click', (e) => {
                const btn = e.target?.closest?.('button[data-action]');
                if (!btn) return;
                const action = btn.getAttribute('data-action');
                if (action === 'retry') {
                    App.fetchMarketData(true);
                }
                if (action === 'hide') {
                    if (App.state.apiStatus.type === 'cached') App.clearApiStatus();
                }
            });
        }

        if (!App._statusTickInterval) {
            App._statusTickInterval = setInterval(App.tickApiStatus, 1000);
        }
    },

    setApiStatus: (type, opts = {}) => {
        App.state.apiStatus.type = type;
        App.state.apiStatus.until = opts.until ?? 0;

        const lastTs = opts.ts ?? App.state.lastMarketOkTs ?? 0;
        const lastText = lastTs ? dayjs(lastTs).format('DD.MM.YYYY HH:mm:ss') : null;

        let icon = 'ℹ️';
        let title = 'Info';
        let text = '';
        let hint = '';
        let actions = '';

        if (type === 'cooldown') {
            icon = '⏳';
            title = 'Limit CoinGecko API';
            text = `Aktualizace je dočasně pozastavená. Zobrazuji poslední uložená data${lastText ? ` (poslední: ${lastText})` : ''}.`;
            hint = 'Nech stránku otevřenou – obnoví se automaticky. Pokud chceš, zkus to později nebo obnov stránku.';
            actions = `<button data-action="retry" title="Zkusit stáhnout znovu">Zkusit aktualizovat</button>`;
        } else if (type === 'cached') {
            icon = '📦';
            title = 'Záložní data';
            text = `Zobrazuji uložená data${lastText ? ` (poslední: ${lastText})` : ''}.`;
            hint = opts.note || 'Až budou dostupná aktuální data, vše se automaticky aktualizuje.';
            actions = `<button data-action="retry" title="Zkusit stáhnout znovu">Aktualizovat</button><button data-action="hide" title="Skrýt tuto informaci">Skrýt</button>`;
        } else if (type === 'error') {
            icon = '⚠️';
            title = 'Problém s připojením';
            text = opts.message || 'Nepodařilo se načíst data z API.';
            hint = 'Zkontroluj internet a zkus to znovu za chvíli.';
            actions = `<button data-action="retry" title="Zkusit stáhnout znovu">Zkusit znovu</button>`;
        } else if (type === 'updating') {
            icon = '🔄';
            title = 'Aktualizuji…';
            text = 'Stahuji nejnovější data z CoinGecko.';
        }

        App.state.apiStatus.message = text;

        if (!App.ui.apiStatus) return;
        const countdown = (type === 'cooldown' && App.state.apiStatus.until)
            ? ` <span class="api-status__meta" data-countdown></span>`
            : '';

        App.ui.apiStatus.innerHTML = `
            <div class="api-status__icon">${icon}</div>
            <div class="api-status__content">
                <div class="api-status__row">
                    <span class="api-status__title">${title}</span>
                    <span class="api-status__text">${text}${countdown}</span>
                </div>
                ${hint ? `<div class="api-status__hint">${hint}</div>` : ''}
            </div>
            <div class="api-status__actions">${actions}</div>
        `;
        App.ui.apiStatus.classList.remove('hidden');
    },

    clearApiStatus: () => {
        App.state.apiStatus.type = null;
        App.state.apiStatus.until = 0;
        App.state.apiStatus.message = '';
        if (App.ui.apiStatus) App.ui.apiStatus.classList.add('hidden');
    },

    tickApiStatus: () => {
        if (!App.ui.apiStatus) return;
        if (App.state.apiStatus.type !== 'cooldown' || !App.state.apiStatus.until) return;

        const ms = App.state.apiStatus.until - Date.now();
        const sec = Math.max(0, Math.ceil(ms / 1000));
        const el = App.ui.apiStatus.querySelector('[data-countdown]');
        if (el) el.textContent = sec > 0 ? `(další pokus za ${sec}s)` : '(zkouším znovu…)';

        if (sec === 0) {
            App.state.apiStatus.until = 0;
        }
    },

    setChartMessage: (title, text, opts = {}) => {
        if (!App.ui.chartMessage) return;

        const isLoading = !!opts.loading;
        App.ui.chartMessage.classList.toggle('loading', isLoading);

        if (isLoading) {
            App.ui.chartMessage.innerHTML = `
                <div class="chart-message__title">${title}</div>
                <div class="chart-message__text">${text || ''}</div>
                <div class="chart-skel">
                    <div class="sk sk-line sk-w-70"></div>
                    <div class="sk sk-line sk-w-90"></div>
                    <div class="sk sk-line sk-w-60"></div>
                </div>
            `;
        } else {
            App.ui.chartMessage.innerHTML = `
                <div class="chart-message__title">${title}</div>
                <div class="chart-message__text">${text}</div>
            `;
        }

        App.ui.chartMessage.classList.remove('hidden');
    },

    clearChartMessage: () => {
        if (!App.ui.chartMessage) return;
        App.ui.chartMessage.classList.add('hidden');
        App.ui.chartMessage.classList.remove('loading');
        App.ui.chartMessage.innerHTML = '';
    },

    // --- 2. NASTAVENÍ (THEME) ---
    loadSettings: () => {
        const storedTheme = localStorage.getItem('coinDashTheme');
        if (storedTheme) App.state.theme = storedTheme;
    },

    applyTheme: () => {
        if (App.state.theme === 'dark') {
            document.body.classList.add('dark-mode');
            App.ui.themeToggle.innerText = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            App.ui.themeToggle.innerText = '🌙';
        }
    },

    toggleTheme: () => {
        App.state.theme = App.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('coinDashTheme', App.state.theme);
        App.applyTheme();
        if (App.state.currentCoinId) App.updateChartRange(App.state.chartDays);
    },

    // --- 3. API KOMUNIKACE ---
    MARKET_CACHE_KEY: 'coinDashMarketCache',
    MARKET_CACHE_TTL: 5 * 60 * 1000, // 5 min
    CURRENCY: 'czk',
    MIN_TX_VALUE_CZK: 1,

    loadMarketCache: () => {
        try {
            const raw = localStorage.getItem(App.MARKET_CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.data)) return null;
            return parsed;
        } catch (_) {
            return null;
        }
    },

    saveMarketCache: (coins) => {
        try {
            localStorage.setItem(App.MARKET_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: coins }));
        } catch (_) {
            // ignore
        }
    },

    apiFetch: async (url, options = {}) => {
        const now = Date.now();

        if (now < App.state.apiCooldownUntil) {
            const err = new Error('COOLDOWN');
            err.code = 'COOLDOWN';
            err.retryAfterMs = App.state.apiCooldownUntil - now;
            throw err;
        }

        const res = await fetch(url, options);

        if (res.status === 429) {
            const retryAfter = res.headers.get('retry-after');
            let waitMs = 0;

            if (retryAfter && !Number.isNaN(parseInt(retryAfter, 10))) {
                waitMs = parseInt(retryAfter, 10) * 1000;
                App.state.apiBackoffMs = waitMs;
            } else {
                App.state.apiBackoffMs = Math.min(App.state.apiBackoffMs ? App.state.apiBackoffMs * 2 : 15000, 5 * 60 * 1000);
                waitMs = App.state.apiBackoffMs;
            }

            App.state.apiCooldownUntil = now + waitMs;

            const err = new Error('RATE_LIMIT');
            err.code = 'RATE_LIMIT';
            err.retryAfterMs = waitMs;
            throw err;
        }

        if (!res.ok) {
            const err = new Error('API_ERROR');
            err.code = 'API_ERROR';
            err.status = res.status;
            throw err;
        }

        App.state.apiBackoffMs = 0;
        return res;
    },
    fetchMarketData: async (force = false) => {
        const now = Date.now();

        if (App.state.coins.length === 0 && !document.hidden) {
            App.showMarketSkeleton();
        }

        if (now < App.state.apiCooldownUntil) {
            App.setApiStatus('cooldown', { until: App.state.apiCooldownUntil, ts: App.state.lastMarketOkTs });

            if (App.state.coins.length === 0) {
                const cachedMarket = App.loadMarketCache();
                if (!cachedMarket || !Array.isArray(cachedMarket.data) || cachedMarket.data.length === 0) {
                    App.showMarketSkeleton();
                }
                if (cachedMarket && Array.isArray(cachedMarket.data) && cachedMarket.data.length) {
                    App.state.coins = cachedMarket.data;
                    App.state.lastMarketOkTs = cachedMarket.ts;
                    App.renderCoinList();
                    App.renderPortfolio();
                }
            }
            return;
        }
        if (!force && App.state.coins.length > 0 && (now - App.state.lastFetch < 60000)) return;

        try {
            if (App.state.coins.length === 0) App.ui.coinList.innerHTML = '<div class="spinner"></div>';

            const res = await App.apiFetch(`${App.apiURL}/coins/markets?vs_currency=${App.CURRENCY}&order=market_cap_desc&per_page=50&page=1&sparkline=false`);

            App.state.coins = await res.json();
            App.state.lastFetch = Date.now();
            App.saveMarketCache(App.state.coins);
            App.state.lastMarketOkTs = App.state.lastFetch;
            if (App.state.apiStatus.type) App.clearApiStatus();

            App.renderCoinList();
            App.renderPortfolio();

        } catch (err) {
            console.error(err);

            if (err.code === 'RATE_LIMIT' || err.code === 'COOLDOWN' || err.message === 'Too Many Requests') {
                const waitMs = err.retryAfterMs ?? Math.max(0, (App.state.apiCooldownUntil - Date.now()));
                const waitSec = Math.max(1, Math.ceil(waitMs / 1000));
                const until = Date.now() + waitMs;

                const cachedMarket = App.loadMarketCache();
                if (!cachedMarket || !Array.isArray(cachedMarket.data) || cachedMarket.data.length === 0) {
                    App.showMarketSkeleton();
                }
                if (cachedMarket && Array.isArray(cachedMarket.data) && cachedMarket.data.length) {
                    App.state.coins = cachedMarket.data;
                    App.state.lastMarketOkTs = cachedMarket.ts;
                    App.renderCoinList();
                    App.renderPortfolio();
                } else if (App.state.coins.length === 0) {
                    App.ui.coinList.innerHTML = '<div class="loading text-red">Limit CoinGecko API (429). Počkej chvíli a zkus to znovu.</div>';
                }

                App.setApiStatus('cooldown', { until: until, ts: App.state.lastMarketOkTs });

                const tNow = Date.now();
                if (tNow - App.state.apiStatus.lastToastAt > 30000) {
                    App.showToast(`CoinGecko API limit (429). Zobrazuji poslední data. Další pokus za ${waitSec}s.`, 'error');
                    App.state.apiStatus.lastToastAt = tNow;
                }
                return;
            }

            if (App.state.coins.length === 0) {
                App.ui.coinList.innerHTML = '<div class="loading text-red">Chyba připojení k API</div>';
            }
            App.setApiStatus('error', { message: 'Nepodařilo se načíst data z CoinGecko (výpadek internetu / API). Zobrazuji poslední dostupná data, pokud jsou k dispozici.' });
            App.showToast('Chyba připojení k API', 'error');
        }
    },

    fetchCoinHistory: async (coinId, days) => {
        const cacheKey = `${coinId}_${days}`;
        const now = Date.now();
        const cacheTTL = App.getChartCacheTTL(days);

        if (App.state.chartCache[cacheKey] && (now - App.state.chartCache[cacheKey].timestamp < cacheTTL)) {
            return App.state.chartCache[cacheKey].data;
        }

        const ls = App.loadChartCacheLS(coinId, days);
        if (ls && (now - ls.ts < cacheTTL) && Array.isArray(ls.data) && ls.data.length) {
            App.state.chartCache[cacheKey] = { timestamp: ls.ts, data: ls.data };
            return ls.data;
        }

        if (Date.now() < App.state.apiCooldownUntil) {
            const mem = App.state.chartCache[cacheKey]?.data;
            if (mem && mem.length) return mem;
            if (ls && ls.data && ls.data.length) return ls.data;
            return [];
        }

        try { App.state.apiUI.chartAbort?.abort(); } catch {}
        const controller = new AbortController();
        App.state.apiUI.chartAbort = controller;

        try {
            const url = `${App.apiURL}/coins/${coinId}/market_chart?vs_currency=${App.CURRENCY}&days=${days}`;
            const res = await App.apiFetch(url, { signal: controller.signal });
            const data = await res.json();
            const prices = data?.prices || [];

            App.state.chartCache[cacheKey] = { timestamp: now, data: prices };
            App.saveChartCacheLS(coinId, days, prices);

            return prices;
        } catch (err) {
            if (err?.name === 'AbortError') return [];

            if (err?.code === 'RATE_LIMIT' || err?.code === 'COOLDOWN') {
                const waitMs = err.retryAfterMs ?? (App.state.apiCooldownUntil - Date.now());
                const waitSec = Math.max(1, Math.ceil((waitMs || 0) / 1000));

                const mem = App.state.chartCache[cacheKey]?.data;
                const fallback = (mem && mem.length) ? mem : (ls?.data || []);

                if (fallback && fallback.length) {
                    App.setApiStatus('cooldown', { until: Date.now() + (waitMs || 0), ts: App.state.lastMarketOkTs });
                    return fallback;
                }

                App.setChartMessage(
                    'Graf teď nejde aktualizovat',
                    `CoinGecko API limit (429). Počkej ${waitSec}s a zkus to znovu, nebo přepni období (24h/7d/30d/1r).`,
                    { loading: false }
                );
                return [];
            }

            App.setChartMessage(
                'Graf se nepodařilo načíst',
                'Zkontroluj připojení k internetu a zkus to znovu. Pokud problém přetrvává, CoinGecko může mít výpadek.',
                { loading: false }
            );
            return [];
        }
    },

    // --- 4. PORTFOLIO LOGIKA (SESKUPOVÁNÍ) ---
    addToPortfolio: (amount, pricePerUnit) => {
        const coin = App.state.coins.find(c => c.id === App.state.currentCoinId);
        if (!coin) return;

        const amt = Number(amount);
        const unit = Number(pricePerUnit);

        const transaction = {
            id: Date.now(),
            coinId: coin.id,
            symbol: coin.symbol.toUpperCase(),
            amount: amt,
            buyPrice: unit,
            date: dayjs().format('YYYY-MM-DD')
        };

        App.state.portfolio.push(transaction);
        App.savePortfolio();

        const actionText = amt < 0 ? 'Prodej' : 'Nákup';
        App.showToast(`${actionText}: ${transaction.symbol} uloženo do portfolia`);

        App.ui.amountInput.value = '';
        App.ui.priceInput.value = coin.current_price;
    },

    // --- 5. EDITACE A MAZÁNÍ (MODALS) ---
    confirmDelete: (id) => {
        const item = App.state.portfolio.find(i => i.id === id);
        if(!item) return;
        App.showModal('Odstranit investici?', `Opravdu chcete odstranit transakci pro <strong>${item.symbol}</strong>?`, () => {
            App.state.portfolio = App.state.portfolio.filter(i => i.id !== id);
            App.savePortfolio();
            App.renderPortfolio();
            App.showToast('Položka smazána', 'error');
        });
    },

    deleteCoinGroup: (coinId) => {
        const coinSymbol = App.state.portfolio.find(i => i.coinId === coinId)?.symbol || 'mince';
        App.showModal(`Smazat vše: ${coinSymbol}?`, `Opravdu odstranit VŠECHNY záznamy pro <strong>${coinSymbol}</strong>?`, () => {
            App.state.portfolio = App.state.portfolio.filter(i => i.coinId !== coinId);
            App.savePortfolio();
            App.renderPortfolio();
            App.showToast('Vše smazáno', 'error');
        });
    },

    openEditModal: (id) => {
        const item = App.state.portfolio.find(i => i.id === id);
        if(!item) return;

        const html = `
            <div class="form-group">
                <label>Nové množství</label>
                <input type="number" id="edit-amount" value="${item.amount}" step="any">
            </div>
        `;

        App.showModal('Upravit množství', html, () => {
            const newVal = parseFloat(document.getElementById('edit-amount').value);

            if (Number.isFinite(newVal) && newVal !== 0) {
                if (newVal === item.amount) return;

                setTimeout(() => {
                    App.showModal('Potvrdit úpravu',
                        `Změna množství u <strong>${item.symbol}</strong>:<br><br>
                         Původně: ${item.amount}<br>
                         Nově: <strong class="text-green">${newVal}</strong>`,
                        () => {
                            item.amount = newVal;
                            App.savePortfolio();
                            App.renderPortfolio();
                            App.showToast('Množství upraveno');
                        }
                    );
                }, 300);
            } else {
                App.showToast('Neplatná hodnota', 'error');
            }
        });
    },

    // --- 6. EXPORT / IMPORT ---
    exportData: () => {
        const dataStr = JSON.stringify(App.state.portfolio, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `coindash_backup_${dayjs().format('YYYY-MM-DD')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        App.showToast('Data úspěšně exportována');
    },

    importData: (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (Array.isArray(json)) {
                    App.state.portfolio = json;
                    App.savePortfolio();
                    App.renderPortfolio();
                    App.showToast('Data úspěšně importována');
                } else {
                    throw new Error('Neplatný formát');
                }
            } catch (err) {
                App.showToast('Chyba při importu', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    },

    // --- 7. RENDEROVÁNÍ GRAFU ---
    renderChart: (prices, label) => {
        const ctx = App.ui.priceChart.getContext('2d');
        if (App.state.chartInstance) {
            App.state.chartInstance.destroy();
            App.state.chartInstance = null;
        }

        if (Array.isArray(prices) && prices.length) App.clearChartMessage();

        let timeFormat = 'DD.MM HH:mm';
        if (App.state.chartDays === '1') timeFormat = 'HH:mm';
        if (App.state.chartDays === '365') timeFormat = 'DD.MM.YYYY';

        const daysLabelMap = { '1': '24h', '7': '7 dní', '30': '30 dní', '365': '1 rok' };
        const rangeText = daysLabelMap[App.state.chartDays] || 'Období';

        const isDark = App.state.theme === 'dark';
        const borderColor = isDark ? '#60A5FA' : '#3B82F6';
        const bgColor = isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)';
        const textColor = isDark ? '#9CA3Af' : '#666666';
        const gridColor = isDark ? '#374151' : '#E5E7EB';

        App.state.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: prices.map(p => dayjs(p[0]).format(timeFormat)),
                datasets: [{
                    label: `${label} (${rangeText})`,
                    data: prices.map(p => p[1]),
                    borderColor: borderColor,
                    backgroundColor: bgColor,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHitRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: true, labels: { color: textColor } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return App.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: {
                        ticks: {
                            color: textColor,
                            callback: function(value) { return value.toLocaleString(); }
                        },
                        grid: { color: gridColor }
                    }
                }
            }
        });
    },

    // --- 8. UTILITY FUNKCE ---
    formatCurrency: (num) => {
        return new Intl.NumberFormat('cs-CZ', {
            style: 'currency',
            currency: 'CZK'
        }).format(num);
    },

    savePortfolio: () => localStorage.setItem('coinDashPortfolio', JSON.stringify(App.state.portfolio)),

    loadPortfolio: () => {
        const stored = localStorage.getItem('coinDashPortfolio');
        if (!stored) return;

        try {
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) return;

            const seen = new Set();
            const cleaned = [];

            for (const item of parsed) {
                if (!item || typeof item !== 'object') continue;
                if (item.id == null) continue;
                if (seen.has(item.id)) continue;
                seen.add(item.id);

                const amount = Number(item.amount);
                const buyPrice = Number(item.buyPrice);

                if (!Number.isFinite(amount) || amount === 0) continue;
                if (!Number.isFinite(buyPrice)) continue;

                cleaned.push({
                    ...item,
                    amount,
                    buyPrice,
                    date: item.date || null
                });
            }

            App.state.portfolio = cleaned;
            if (cleaned.length !== parsed.length) App.savePortfolio();
        } catch {
            App.state.portfolio = [];
        }
    },

    showToast: (message, type = 'success') => {
        const toast = App.ui.toast;
        toast.innerHTML = message;
        toast.className = `toast visible ${type}`;
        setTimeout(() => toast.classList.remove('visible'), 3000);
    },

    showModal: (title, bodyHtml, onConfirm) => {
        App.ui.modalTitle.innerText = title;
        App.ui.modalBody.innerHTML = bodyHtml;
        App.ui.modalOverlay.classList.remove('hidden');

        const newConfirm = App.ui.modalBtnConfirm.cloneNode(true);
        const newCancel = App.ui.modalBtnCancel.cloneNode(true);
        App.ui.modalBtnConfirm.parentNode.replaceChild(newConfirm, App.ui.modalBtnConfirm);
        App.ui.modalBtnCancel.parentNode.replaceChild(newCancel, App.ui.modalBtnCancel);

        App.ui.modalBtnConfirm = newConfirm;
        App.ui.modalBtnCancel = newCancel;

        App.ui.modalBtnCancel.addEventListener('click', () => App.ui.modalOverlay.classList.add('hidden'));
        App.ui.modalBtnConfirm.addEventListener('click', () => {
            onConfirm();
            App.ui.modalOverlay.classList.add('hidden');
        });
    },

    renderPortfolio: async () => {
        if (!(App.state.expandedCoins instanceof Set)) {
            App.state.expandedCoins = new Set();
        }

        App.ui.portfolioList.innerHTML = '';

        if (!Array.isArray(App.state.portfolio) || App.state.portfolio.length === 0) {
            App.ui.emptyMsg.classList.remove('hidden');
            App.ui.portfolioTotal.innerText = App.formatCurrency(0);
            App.ui.portfolioProfit.innerText = App.formatCurrency(0);
            return;
        }
        App.ui.emptyMsg.classList.add('hidden');

        const inPortfolioView = App.state.apiUI?.currentView === 'portfolio';
        const priceMap = inPortfolioView ? await App.fetchPortfolioPrices(false) : {};

        const groups = {};
        App.state.portfolio.forEach((item) => {
            if (!item || !item.coinId) return;

            if (!groups[item.coinId]) {
                groups[item.coinId] = {
                    coinId: item.coinId,
                    symbol: item.symbol,
                    transactions: [],
                    totalAmount: 0,
                    totalCost: 0,
                    currentPrice: 0
                };
            }

            const simplePrice = priceMap?.[item.coinId];
            const liveCoin = App.state.coins.find(c => c.id === item.coinId);
            const currentPrice =
                (typeof simplePrice === 'number') ? simplePrice :
                    (liveCoin ? liveCoin.current_price : 0);

            groups[item.coinId].currentPrice = currentPrice;

            const currentValue = item.amount * currentPrice;
            const profit = currentValue - item.buyPrice;

            groups[item.coinId].transactions.push({
                ...item,
                currentValue,
                profit
            });

            groups[item.coinId].totalAmount += item.amount;
            groups[item.coinId].totalCost += item.buyPrice;
        });

        App.state.portfolioGroupsMap = groups;

        let groupArray = Object.values(groups).map(group => ({
            ...group,
            totalValue: group.totalAmount * group.currentPrice,
            totalProfit: (group.totalAmount * group.currentPrice) - group.totalCost
        }));

        if (App.state.sortCol) {
            groupArray.sort((a, b) => {
                let key = App.state.sortCol;

                if (key === 'buyPrice') key = 'totalCost';
                if (key === 'currentValue') key = 'totalValue';
                if (key === 'profit') key = 'totalProfit';
                if (key === 'amount') key = 'totalAmount';

                let valA = a[key];
                let valB = b[key];

                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();

                if (valA === valB) return 0;

                return App.state.sortAsc
                    ? (valA < valB ? -1 : 1)
                    : (valA > valB ? -1 : 1);
            });
        }

        let globalTotalValue = 0;
        let globalTotalCost = 0;

        const fragment = document.createDocumentFragment();

        groupArray.forEach(group => {
            globalTotalValue += group.totalValue;
            globalTotalCost += group.totalCost;

            const groupProfitClass = group.totalProfit >= 0 ? 'text-green' : 'text-red';
            const expanded = App.state.expandedCoins.has(group.coinId);

            const trHeader = document.createElement('tr');
            trHeader.className = 'group-header-row';
            trHeader.dataset.coin = group.coinId;

            trHeader.innerHTML = `
                <td>
                    <span class="group-caret" aria-hidden="true">${expanded ? '▼' : '▶'}</span>
                    <strong>${group.symbol}</strong> (Celkem)
                </td>
                <td class="text-right"><strong>${parseFloat(group.totalAmount.toFixed(8))}</strong></td>
                <td class="text-right" title="Celkem investováno"><strong>${App.formatCurrency(group.totalCost)}</strong></td>
                <td class="text-right"><strong>${App.formatCurrency(group.totalValue)}</strong></td>
                <td class="text-right ${groupProfitClass}"><strong>${App.formatCurrency(group.totalProfit)}</strong></td>
                <td class="text-right">
                    <button class="btn-delete-all" data-coin="${group.coinId}">Smazat vše</button>
                </td>
            `;

            fragment.appendChild(trHeader);

            if (expanded) {
                group.transactions.forEach(tx => {
                    const txProfitClass = tx.profit >= 0 ? 'text-green' : 'text-red';
                    const formattedDate = tx.date ? dayjs(tx.date).format('DD.MM.YYYY') : '-';

                    const trTx = document.createElement('tr');
                    trTx.className = 'transaction-row';
                    trTx.dataset.parent = group.coinId;

                    trTx.innerHTML = `
                        <td class="transaction-indent">${formattedDate}</td>
                        <td class="text-right">${tx.amount}</td>
                        <td class="text-right">${App.formatCurrency(tx.buyPrice)}</td>
                        <td class="text-right text-muted">${App.formatCurrency(tx.currentValue)}</td>
                        <td class="text-right ${txProfitClass}">${App.formatCurrency(tx.profit)}</td>
                        <td class="text-right">
                            <button class="btn-action btn-edit" data-id="${tx.id}">Upravit</button>
                            <button class="btn-action btn-delete" data-id="${tx.id}">Smazat</button>
                        </td>
                    `;
                    fragment.appendChild(trTx);
                });
            }
        });

        App.ui.portfolioList.appendChild(fragment);

        const globalProfit = globalTotalValue - globalTotalCost;
        App.ui.portfolioTotal.innerText = App.formatCurrency(globalTotalValue);
        App.ui.portfolioProfit.innerText = App.formatCurrency(globalProfit);
        App.ui.portfolioProfit.className = `card-value ${globalProfit >= 0 ? 'text-green' : 'text-red'}`;

        if (!App.ui.portfolioList.dataset.bound) {
            App.ui.portfolioList.dataset.bound = '1';

            App.ui.portfolioList.addEventListener('click', (e) => {
                const btn = e.target.closest('button');

                if (btn) {
                    if (btn.classList.contains('btn-delete')) {
                        const id = parseInt(btn.dataset.id, 10);
                        if (!Number.isNaN(id)) App.confirmDelete(id);
                        return;
                    }
                    if (btn.classList.contains('btn-edit')) {
                        const id = parseInt(btn.dataset.id, 10);
                        if (!Number.isNaN(id)) App.openEditModal(id);
                        return;
                    }
                    if (btn.classList.contains('btn-delete-all')) {
                        const coinId = btn.dataset.coin;
                        if (coinId) App.deleteCoinGroup(coinId);
                        return;
                    }
                }

                const headerRow = e.target.closest('tr.group-header-row');
                if (!headerRow || !headerRow.dataset.coin) return;

                const coinId = headerRow.dataset.coin;
                App.togglePortfolioGroup(coinId, headerRow);
            });
        }
    },

    togglePortfolioGroup: (coinId, headerRowEl) => {
        if (!coinId) return;
        if (!(App.state.expandedCoins instanceof Set)) App.state.expandedCoins = new Set();

        const headerRow = headerRowEl || document.querySelector(`tr.group-header-row[data-coin="${coinId}"]`);
        if (!headerRow) return;

        const isExpanded = App.state.expandedCoins.has(coinId);

        const setCaret = (expanded) => {
            const caret = headerRow.querySelector('.group-caret');
            if (caret) caret.textContent = expanded ? '▼' : '▶';
        };

        if (isExpanded) {
            document.querySelectorAll(`tr.transaction-row[data-parent="${coinId}"]`).forEach(tr => tr.remove());
            App.state.expandedCoins.delete(coinId);
            setCaret(false);
            return;
        }

        const group = App.state.portfolioGroupsMap?.[coinId];
        if (!group || !Array.isArray(group.transactions)) return;

        document.querySelectorAll(`tr.transaction-row[data-parent="${coinId}"]`).forEach(tr => tr.remove());

        let insertAfter = headerRow;

        group.transactions.forEach(tx => {
            const txProfitClass = tx.profit >= 0 ? 'text-green' : 'text-red';
            const formattedDate = tx.date ? dayjs(tx.date).format('DD.MM.YYYY') : '-';

            const trTx = document.createElement('tr');
            trTx.className = 'transaction-row';
            trTx.dataset.parent = coinId;

            trTx.innerHTML = `
                <td class="transaction-indent">${formattedDate}</td>
                <td class="text-right">${tx.amount}</td>
                <td class="text-right">${App.formatCurrency(tx.buyPrice)}</td>
                <td class="text-right text-muted">${App.formatCurrency(tx.currentValue)}</td>
                <td class="text-right ${txProfitClass}">${App.formatCurrency(tx.profit)}</td>
                <td class="text-right">
                    <button class="btn-action btn-edit" data-id="${tx.id}">Upravit</button>
                    <button class="btn-action btn-delete" data-id="${tx.id}">Smazat</button>
                </td>
            `;

            insertAfter.insertAdjacentElement('afterend', trTx);
            insertAfter = trTx;
        });

        App.state.expandedCoins.add(coinId);
        setCaret(true);
    },

    // --- 9. OSTATNÍ LOGIKA UI ---
    renderCoinList: () => {
        const searchTerm = App.ui.searchInput.value.trim().toLowerCase();
        App.ui.coinList.innerHTML = '';

        const filtered = App.state.coins.filter(c =>
            c.name.toLowerCase().includes(searchTerm) ||
            c.symbol.toLowerCase().includes(searchTerm)
        );

        const fragment = document.createDocumentFragment();

        filtered.forEach(coin => {
            const el = document.createElement('div');
            el.className = `coin-item ${App.state.currentCoinId === coin.id ? 'active' : ''}`;
            el.dataset.id = coin.id;

            const colorClass = coin.price_change_percentage_24h >= 0 ? 'text-green' : 'text-red';

            el.innerHTML = `
                <div>
                    <strong>${coin.name}</strong> <small>(${coin.symbol.toUpperCase()})</small>
                </div>
                <div style="text-align:right">
                    <div>${App.formatCurrency(coin.current_price)}</div>
                    <small class="${colorClass}">${coin.price_change_percentage_24h.toFixed(2)}%</small>
                </div>
            `;

            el.addEventListener('click', () => App.showCoinDetail(coin.id));
            fragment.appendChild(el);
        });

        App.ui.coinList.appendChild(fragment);
    },

    showCoinDetail: async (coinId) => {
        if (App.state.currentCoinId === coinId) return;
        App.state.currentCoinId = coinId;
        const coin = App.state.coins.find(c => c.id === coinId);
        if (!coin) return;

        App.ui.welcomeScreen.classList.add('hidden');
        App.ui.detailContent.classList.remove('hidden');
        App.ui.viewDetail.classList.remove('hidden');
        App.ui.viewPortfolio.classList.add('hidden');

        App.renderCoinList();

        App.ui.detailTitle.innerText = `${coin.name} (${coin.symbol.toUpperCase()})`;
        App.ui.detailPrice.innerText = App.formatCurrency(coin.current_price);
        App.ui.priceInput.value = coin.current_price;
        App.ui.amountInput.value = '';

        const url = new URL(window.location);
        url.searchParams.set('coin', coinId);
        window.history.pushState({}, '', url);

        App.showChartLoading();
        const history = await App.fetchCoinHistory(coinId, App.state.chartDays);
        App.renderChart(history, coin.name);
    },

    updateChartRange: async (days) => {
        if (App.state.chartDays === days && App.state.chartInstance) return;
        App.state.chartDays = days;

        if(App.state.currentCoinId) {
            const coin = App.state.coins.find(c => c.id === App.state.currentCoinId);

            if (App.state.chartInstance) {
                App.state.chartInstance.data.datasets[0].data = [];
                App.state.chartInstance.update();
            }
            App.showChartLoading();
            const history = await App.fetchCoinHistory(App.state.currentCoinId, days);
            if (history.length > 0) App.renderChart(history, coin ? coin.name : '');
        }
    },

    sortPortfolio: (column) => {
        if (App.state.sortCol === column) App.state.sortAsc = !App.state.sortAsc;
        else { App.state.sortCol = column; App.state.sortAsc = true; }
        App.renderPortfolio();
    },

    handleUrlRouting: () => {
        const params = new URLSearchParams(window.location.search);
        const coinId = params.get('coin');
        if (coinId) {
            const checkData = setInterval(() => {
                if (App.state.coins.length > 0) {
                    App.switchView('market');
                    App.showCoinDetail(coinId);
                    clearInterval(checkData);
                }
            }, 100);
        }
    },

    // --- 10. EVENT LISTENERS ---
    bindEvents: () => {
        App.ui.searchInput.addEventListener('input', App.renderCoinList);

        App.ui.navMarket.addEventListener('click', (e) => {
            e.preventDefault();
            App.switchView('market');
        });

        App.ui.navPortfolio.addEventListener('click', (e) => {
            e.preventDefault();
            App.switchView('portfolio');
        });

        App.ui.tradeForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const v = App.validateTradeForm();
            if (!v.ok) return;

            const txValueAbs = Math.abs(v.amount * v.pricePerUnit);

            if (Number.isFinite(txValueAbs) && txValueAbs < App.MIN_TX_VALUE_CZK) {
                App.setFieldError(
                    App.ui.amountInput,
                    App.ui.amountError,
                    `Transakce je příliš malá (hodnota ${App.formatCurrency(txValueAbs)}). Minimum je ${App.formatCurrency(App.MIN_TX_VALUE_CZK)}.`
                );
                App.showToast(`Transakce je příliš malá (méně než ${App.formatCurrency(App.MIN_TX_VALUE_CZK)}).`, 'error');
                return;
            }

            const warnings = [];
            if (v.amount < 0 && App.state.currentCoinId) {
                const holding = App.state.portfolio
                    .filter(p => p.coinId === App.state.currentCoinId)
                    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

                if ((holding + v.amount) < 0) {
                    warnings.push(
                        `Prodáváš více, než aktuálně držíš. Aktuálně držíš <strong>${holding}</strong>, po transakci by to bylo <strong>${holding + v.amount}</strong>.`
                    );
                }
            }

            if (warnings.length) {
                const actionText = v.amount < 0 ? 'Prodej' : 'Nákup';
                App.showModal(
                    'Potvrdit transakci',
                    `<div style="display:flex; flex-direction:column; gap:10px;">
                        <div>Upozornění pro tuto transakci (${actionText}):</div>
                        <ul style="margin:0; padding-left:18px;">
                            ${warnings.map(w => `<li>${w}</li>`).join('')}
                        </ul>
                        <div>Chceš transakci i přesto uložit?</div>
                    </div>`,
                    () => App.addToPortfolio(v.amount, v.pricePerUnit)
                );
                return;
            }

            App.addToPortfolio(v.amount, v.pricePerUnit);
        });

        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => App.sortPortfolio(th.dataset.sort));
        });

        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                App.updateChartRange(e.target.dataset.days);
            });
        });

        App.ui.themeToggle.addEventListener('click', App.toggleTheme);
        App.ui.btnExport.addEventListener('click', App.exportData);
        App.ui.btnImport.addEventListener('click', () => App.ui.fileImport.click());
        App.ui.fileImport.addEventListener('change', App.importData);

        window.addEventListener('popstate', App.handleUrlRouting);
    }
};

document.addEventListener('DOMContentLoaded', App.init);
