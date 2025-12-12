const App = {
    // --- KONFIGURACE A STAV ---
    apiURL: 'https://api.coingecko.com/api/v3',
    state: {
        coins: [],           // Data z API
        portfolio: [],       // Data uživatele [{id, coinId, symbol, amount, buyPrice}]
        currentCoinId: null, // Právě vybraná mince
        chartInstance: null  // Odkaz na graf pro jeho přemazání
    },

    // --- 1. INICIALIZACE ---
    init: async () => {
        console.log('🚀 Aplikace startuje...');

        // Načteme portfolio z disku
        App.loadPortfolio();

        // Stáhneme data z trhu
        await App.fetchMarketData();

        // Nastavíme posluchače událostí
        App.bindEvents();

        // Zkontrolujeme URL (pokud uživatel dal refresh)
        App.handleUrlRouting();

        // Spustíme automatický update cen každých 60 vteřin
        setInterval(App.fetchMarketData, 60000);
    },

    // --- 2. PRÁCE S API ---
    fetchMarketData: async () => {
        try {
            // Stahujeme top 50 mincí v CZK
            const res = await fetch(`${App.apiURL}/coins/markets?vs_currency=czk&order=market_cap_desc&per_page=50&page=1&sparkline=false`);
            if (!res.ok) throw new Error('API Error');

            App.state.coins = await res.json();

            // Překreslíme seznam vlevo
            App.renderCoinList();

            // Pokud jsme v sekci portfolio, aktualizujeme i tabulku (kvůli novým cenám)
            App.renderPortfolio();

        } catch (err) {
            console.error('Chyba stahování:', err);
            document.getElementById('coin-list').innerHTML = '<div class="loading text-red">Chyba připojení k API</div>';
        }
    },

    fetchCoinHistory: async (coinId) => {
        // Stáhneme historii za 14 dní
        const res = await fetch(`${App.apiURL}/coins/${coinId}/market_chart?vs_currency=czk&days=14`);
        const data = await res.json();
        return data.prices; // Vrací pole poli [[timestamp, price], ...]
    },

    // --- 3. RENDEROVÁNÍ (UI) ---
    renderCoinList: () => {
        const list = document.getElementById('coin-list');
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        list.innerHTML = '';

        // Filtrujeme podle hledání
        const filtered = App.state.coins.filter(c =>
            c.name.toLowerCase().includes(searchTerm) ||
            c.symbol.toLowerCase().includes(searchTerm)
        );

        filtered.forEach(coin => {
            const el = document.createElement('div');
            el.className = `coin-item ${App.state.currentCoinId === coin.id ? 'active' : ''}`;
            el.dataset.id = coin.id;

            // Barva změny ceny
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

            // Kliknutí na minci -> Zobraz detail
            el.addEventListener('click', () => App.showCoinDetail(coin.id));
            list.appendChild(el);
        });
    },

    renderPortfolio: () => {
        const tbody = document.getElementById('portfolio-list');
        const totalValEl = document.getElementById('portfolio-total');
        const profitEl = document.getElementById('portfolio-profit');
        const emptyMsg = document.getElementById('empty-portfolio-msg');

        tbody.innerHTML = '';

        if (App.state.portfolio.length === 0) {
            emptyMsg.classList.remove('hidden');
            totalValEl.innerText = App.formatCurrency(0);
            profitEl.innerText = App.formatCurrency(0);
            return;
        }

        emptyMsg.classList.add('hidden');

        let totalValue = 0;
        let totalCost = 0;

        App.state.portfolio.forEach(item => {
            // Najdeme aktuální cenu mince z API dat
            const liveCoin = App.state.coins.find(c => c.id === item.coinId);
            const currentPrice = liveCoin ? liveCoin.current_price : item.buyPrice; // Fallback

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
            tbody.appendChild(tr);
        });

        // Celkové součty
        const totalProfit = totalValue - totalCost;
        totalValEl.innerText = App.formatCurrency(totalValue);
        profitEl.innerText = App.formatCurrency(totalProfit);
        profitEl.className = `card-value ${totalProfit >= 0 ? 'text-green' : 'text-red'}`;

        // Bindování delete tlačítek
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

        // UI Změny
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('coin-detail-content').classList.remove('hidden');
        document.getElementById('view-detail').classList.remove('hidden');
        document.getElementById('view-portfolio-dashboard').classList.add('hidden');

        // Active class v sidebaru
        App.renderCoinList(); // Překreslí seznam, aby se zvýraznila vybraná

        // Naplnění dat
        document.getElementById('detail-title').innerText = `${coin.name} (${coin.symbol.toUpperCase()})`;
        document.getElementById('detail-price').innerText = App.formatCurrency(coin.current_price);

        // Předvyplnění formuláře
        document.getElementById('price-input').value = coin.current_price;
        document.getElementById('amount-input').value = '';

        // URL
        const url = new URL(window.location);
        url.searchParams.set('coin', coinId);
        window.history.pushState({}, '', url);

        // Vykreslení grafu
        const history = await App.fetchCoinHistory(coinId);
        App.renderChart(history, coin.name);
    },

    renderChart: (prices, label) => {
        const ctx = document.getElementById('price-chart').getContext('2d');

        if (App.state.chartInstance) App.state.chartInstance.destroy();

        App.state.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: prices.map(p => dayjs(p[0]).format('DD.MM HH:mm')),
                datasets: [{
                    label: `Cena ${label}`,
                    data: prices.map(p => p[1]),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: { legend: { display: false } }
            }
        });
    },

    addToPortfolio: (amount, price) => {
        const coin = App.state.coins.find(c => c.id === App.state.currentCoinId);
        if (!coin) return;

        const transaction = {
            id: Date.now(), // Unikátní ID
            coinId: coin.id,
            symbol: coin.symbol.toUpperCase(),
            amount: parseFloat(amount),
            buyPrice: parseFloat(price)
        };

        App.state.portfolio.push(transaction);
        App.savePortfolio();
        alert(`Úspěšně nakoupeno: ${coin.name}`);

        // Přepnutí na portfolio? Volitelné. Zatím jen reset formuláře.
        document.getElementById('amount-input').value = '';
    },

    removeFromPortfolio: (id) => {
        if(confirm('Opravdu smazat tuto transakci?')) {
            App.state.portfolio = App.state.portfolio.filter(item => item.id !== id);
            App.savePortfolio();
            App.renderPortfolio();
        }
    },

    // --- 5. POMOCNÉ FUNKCE ---
    formatCurrency: (num) => {
        return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(num);
    },

    savePortfolio: () => {
        localStorage.setItem('coinDashPortfolio', JSON.stringify(App.state.portfolio));
    },

    loadPortfolio: () => {
        const stored = localStorage.getItem('coinDashPortfolio');
        if (stored) App.state.portfolio = JSON.parse(stored);
    },

    handleUrlRouting: () => {
        const params = new URLSearchParams(window.location.search);
        const coinId = params.get('coin');
        if (coinId) {
            // Počkáme chvilku, než se stáhnou data, pokud nejsou
            if (App.state.coins.length > 0) {
                App.showCoinDetail(coinId);
            } else {
                // Pokud data ještě nejsou, interval to zkusí znovu nebo fetchMarketData to zavolá
                setTimeout(() => App.handleUrlRouting(), 500);
            }
        }
    },

    // --- 6. EVENT LISTENERS ---
    bindEvents: () => {
        // Vyhledávání
        document.getElementById('search-input').addEventListener('input', App.renderCoinList);

        // Navigace (Taby)
        document.getElementById('nav-market').addEventListener('click', (e) => {
            document.getElementById('view-detail').classList.remove('hidden');
            document.getElementById('view-portfolio-dashboard').classList.add('hidden');
            e.target.classList.add('active');
            document.getElementById('nav-portfolio').classList.remove('active');
        });

        document.getElementById('nav-portfolio').addEventListener('click', (e) => {
            document.getElementById('view-detail').classList.add('hidden');
            document.getElementById('view-portfolio-dashboard').classList.remove('hidden');
            e.target.classList.add('active');
            document.getElementById('nav-market').classList.remove('active');
            App.renderPortfolio(); // Přepočítat při zobrazení
        });

        // Formulář Nákupu
        document.getElementById('trade-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = document.getElementById('amount-input').value;
            const price = document.getElementById('price-input').value;
            if (amount > 0 && price > 0) {
                App.addToPortfolio(amount, price);
            }
        });
    }
};

// Start
document.addEventListener('DOMContentLoaded', App.init);