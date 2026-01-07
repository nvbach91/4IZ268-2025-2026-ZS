const App = {
    apiURL: 'https://api.coingecko.com/api/v3',
    state: {
        coins: [],
        portfolio: [],
        currentCoinId: null,
        chartInstance: null
    },
    ui: {},

    // --- 1. INICIALIZACE ---
    init: async () => {
        console.log('🚀 Aplikace startuje...');
        App.cacheDOM();
        App.loadPortfolio();
        await App.fetchMarketData();
        App.bindEvents();
        App.handleUrlRouting();
        setInterval(App.fetchMarketData, 60000);
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
            toast: document.getElementById('toast')
        };
    },

    // --- 2. PRÁCE S API ---
    fetchMarketData: async () => {
        try {
            if (App.state.coins.length === 0) {
                App.ui.coinList.innerHTML = '<div class="spinner"></div>';
            }

            const res = await fetch(`${App.apiURL}/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=50&page=1&sparkline=false`);
            if (!res.ok) throw new Error('API Error');

            App.state.coins = await res.json();

            App.renderCoinList();
            App.renderPortfolio();

        } catch (err) {
            console.error(err);
            App.ui.coinList.innerHTML = '<div class="loading text-red">Chyba připojení k API</div>';
            App.showToast('Nepodařilo se načíst data', 'error');
        }
    },

    fetchCoinHistory: async (coinId) => {
        try {
            const res = await fetch(`${App.apiURL}/coins/${coinId}/market_chart?vs_currency=czk&days=14`);
            if (!res.ok) throw new Error('History Error');
            const data = await res.json();
            return data.prices;
        } catch (error) {
            App.showToast('Chyba načítání grafu', 'error');
            return [];
        }
    },

    // --- 3. RENDEROVÁNÍ (UI) ---
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

    renderPortfolio: () => {
        App.ui.portfolioList.innerHTML = '';

        if (App.state.portfolio.length === 0) {
            App.ui.emptyMsg.classList.remove('hidden');
            App.ui.portfolioTotal.innerText = App.formatCurrency(0);
            App.ui.portfolioProfit.innerText = App.formatCurrency(0);
            return;
        }

        App.ui.emptyMsg.classList.add('hidden');

        let totalValue = 0;
        let totalCost = 0;
        const fragment = document.createDocumentFragment();

        App.state.portfolio.forEach(item => {
            const liveCoin = App.state.coins.find(c => c.id === item.coinId);
            const currentPrice = liveCoin ? liveCoin.current_price : item.buyPrice;

            const currentValue = item.amount * currentPrice;
            const costBasis = item.amount * item.buyPrice;
            const profit = currentValue - costBasis;
            const profitClass = profit >= 0 ? 'text-green' : 'text-red';

            totalValue += currentValue;
            totalCost += costBasis;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.symbol}</strong></td>
                <td>${item.amount}</td>
                <td>${App.formatCurrency(item.buyPrice)}</td>
                <td>${App.formatCurrency(currentValue)}</td>
                <td class="${profitClass}">${App.formatCurrency(profit)}</td>
                <td><button class="btn-delete" data-id="${item.id}">Smazat</button></td>
            `;
            fragment.appendChild(tr);
        });

        App.ui.portfolioList.appendChild(fragment);

        const totalProfit = totalValue - totalCost;
        App.ui.portfolioTotal.innerText = App.formatCurrency(totalValue);
        App.ui.portfolioProfit.innerText = App.formatCurrency(totalProfit);
        App.ui.portfolioProfit.className = `card-value ${totalProfit >= 0 ? 'text-green' : 'text-red'}`;

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                App.removeFromPortfolio(parseInt(e.target.dataset.id));
            });
        });
    },

    // --- 4. LOGIKA APLIKACE ---
    showCoinDetail: async (coinId) => {
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

        const history = await App.fetchCoinHistory(coinId);
        App.renderChart(history, coin.name);
    },

    renderChart: (prices, label) => {
        const ctx = App.ui.priceChart.getContext('2d');
        if (App.state.chartInstance) App.state.chartInstance.destroy();

        App.state.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: prices.map(p => dayjs(p[0]).format('DD.MM HH:mm')),
                datasets: [{
                    label: label,
                    data: prices.map(p => p[1]),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: { legend: { display: false } },
                scales: { x: { display: false } }
            }
        });
    },

    addToPortfolio: (amount, price) => {
        const coin = App.state.coins.find(c => c.id === App.state.currentCoinId);
        if (!coin) return;

        const transaction = {
            id: Date.now(),
            coinId: coin.id,
            symbol: coin.symbol.toUpperCase(),
            amount: parseFloat(amount),
            buyPrice: parseFloat(price)
        };

        App.state.portfolio.push(transaction);
        App.savePortfolio();
        App.showToast(`${coin.symbol} přidáno do portfolia`);
        App.ui.amountInput.value = '';
    },

    removeFromPortfolio: (id) => {
        const item = App.state.portfolio.find(i => i.id === id);
        App.state.portfolio = App.state.portfolio.filter(i => i.id !== id);
        App.savePortfolio();
        App.renderPortfolio();
        if (item) App.showToast(`${item.symbol} smazáno`, 'error');
    },

    // --- 5. POMOCNÉ FUNKCE ---
    formatCurrency: (num) => new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(num),

    savePortfolio: () => localStorage.setItem('coinDashPortfolio', JSON.stringify(App.state.portfolio)),

    loadPortfolio: () => {
        const stored = localStorage.getItem('coinDashPortfolio');
        if (stored) App.state.portfolio = JSON.parse(stored);
    },

    showToast: (message, type = 'success') => {
        const toast = App.ui.toast;
        toast.innerHTML = message;
        toast.className = `toast visible ${type}`;
        setTimeout(() => toast.classList.remove('visible'), 3000);
    },

    handleUrlRouting: () => {
        const params = new URLSearchParams(window.location.search);
        const coinId = params.get('coin');
        if (coinId) {
            const checkData = setInterval(() => {
                if (App.state.coins.length > 0) {
                    App.showCoinDetail(coinId);
                    clearInterval(checkData);
                }
            }, 100);
        }
    },

    // --- 6. EVENTY ---
    bindEvents: () => {
        App.ui.searchInput.addEventListener('input', App.renderCoinList);

        App.ui.navMarket.addEventListener('click', (e) => {
            App.ui.viewDetail.classList.remove('hidden');
            App.ui.viewPortfolio.classList.add('hidden');
            e.target.classList.add('active');
            App.ui.navPortfolio.classList.remove('active');
        });

        App.ui.navPortfolio.addEventListener('click', (e) => {
            App.ui.viewDetail.classList.add('hidden');
            App.ui.viewPortfolio.classList.remove('hidden');
            e.target.classList.add('active');
            App.ui.navMarket.classList.remove('active');
            App.renderPortfolio();
        });

        App.ui.tradeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = App.ui.amountInput.value;
            const price = App.ui.priceInput.value;
            if (amount > 0 && price > 0) {
                App.addToPortfolio(amount, price);
            } else {
                App.showToast('Zadejte platné množství', 'error');
            }
        });

        window.addEventListener('popstate', App.handleUrlRouting);
    }
};

document.addEventListener('DOMContentLoaded', App.init);