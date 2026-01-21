console.log("Budget Tracker loaded");

const STORAGE_KEY = "budget_transactions";
const RATE_KEY = "budget_rate_cache";

let state = {
    currency: "CZK",
    rates: { EUR: null, USD: null },
    rateUpdatedAt: null,

    categories: {
        income: ["Salary", "Bonus", "Gift", "Refund", "Other income"],
        expense: ["Food", "Rent", "Transport", "Bills", "Fun", "Health", "Other expense"]
    },

    filter: { type: "all", category: "all", month: "all" },
    chart: null
};

function $(id) { return document.getElementById(id); }

/* ------ LocalStorage ------ */
function loadTransactions() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
}

function saveTransactions(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* ------- Currency -------- */
function formatMoney(amount) {
    return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(amount) + " " + state.currency;
}

function convertFromCZK(amountCZK) {
    if (state.currency === "CZK") return amountCZK;

    const rate = state.rates[state.currency];
    if (typeof rate !== "number") return null;

    return amountCZK * rate;
}

function safeDisplayAmount(amountCZK) {
    const converted = convertFromCZK(amountCZK);
    if (converted == null) return "—";
    return formatMoney(Math.round(converted));
}

function normalizeAmountToCZK(inputAmount) {
    // stored in CZK
    const x = Number(inputAmount);
    if (!Number.isFinite(x) || x <= 0) return null;

    if (state.currency === "CZK") return Math.round(x);

    const rate = state.rates[state.currency];
    if (typeof rate !== "number" || rate <= 0) return null;

    return Math.round(x / rate);
}

/* ------- Summary -------- */
function computeSummary(list) {
    let incomeCZK = 0;
    let expenseCZK = 0;

    for (const t of list) {
        if (t.type === "income") incomeCZK += t.amountCZK;
        else if (t.type === "expense") expenseCZK += t.amountCZK;
    }

    const balanceCZK = incomeCZK - expenseCZK;

    return {
        income: safeDisplayAmount(incomeCZK),
        expense: safeDisplayAmount(expenseCZK),
        balance: safeDisplayAmount(balanceCZK)
    };
}

function renderSummary(list) {
    const s = computeSummary(list);
    $("sumIncome").textContent = s.income;
    $("sumExpense").textContent = s.expense;
    $("sumBalance").textContent = s.balance;
}

/* ----- Filtering ------ */
function applyFilter(list) {
    const { type, category, month } = state.filter;

    return list.filter(t => {
        const okType = (type === "all") || (t.type === type);
        const okCat = (category === "all") || (t.category === category);

        const okMonth =
            (month === "all") ||
            (typeof t.date === "string" && t.date.startsWith(month));

        return okType && okCat && okMonth;
    });
}

function getFilterFromUI() {
    const type = $("filterType").value;
    const category = $("filterCategory").value;
    const m = $("filterMonth").value;
    const month = m ? m : "all";
    return { type, category, month };
}

function applyFilterFromUI() {
    state.filter = getFilterFromUI();
    renderAll(loadTransactions());
}

function clearFilterUI() {
    state.filter = { type: "all", category: "all", month: "all" };
    $("filterType").value = "all";
    $("filterCategory").value = "all";
    $("filterMonth").value = "";
    renderAll(loadTransactions());
}

/* ------- Frankfurter API ------ */
function loadRateCache() {
    const raw = localStorage.getItem(RATE_KEY);
    if (!raw) return;

    try {
        const parsed = JSON.parse(raw);
        if (parsed?.rates && typeof parsed.rates === "object") {
            if (typeof parsed.rates.EUR === "number") state.rates.EUR = parsed.rates.EUR;
            if (typeof parsed.rates.USD === "number") state.rates.USD = parsed.rates.USD;
        }
        if (typeof parsed.rateUpdatedAt === "string") state.rateUpdatedAt = parsed.rateUpdatedAt;
    } catch { }
}

function saveRateCache() {
    localStorage.setItem(RATE_KEY, JSON.stringify({
        rates: state.rates,
        rateUpdatedAt: state.rateUpdatedAt
    }));
}

function renderRateInfo() {
    if (state.currency === "CZK") {
        $("rateInfo").textContent = "(no rate needed)";
        return;
    }

    const rate = state.rates[state.currency];
    if (typeof rate !== "number") {
        $("rateInfo").textContent = "(rate not loaded)";
        return;
    }

    const when = state.rateUpdatedAt ? dayjs(state.rateUpdatedAt).format("D.M.YYYY HH:mm") : "unknown";
    $("rateInfo").textContent = `CZK→${state.currency}: ${rate.toFixed(4)} (updated ${when})`;
}

async function fetchFrankfurterRates() {
    const urls = [
        "https://api.frankfurter.app/latest?base=CZK&symbols=EUR,USD",
        "https://api.frankfurter.dev/v1/latest?base=CZK&symbols=EUR,USD"
    ];

    let lastErr = null;

    for (const url of urls) {
        try {
            const resp = await axios.get(url, { timeout: 20000 });
            const eur = resp?.data?.rates?.EUR;
            const usd = resp?.data?.rates?.USD;

            if (typeof eur !== "number" || typeof usd !== "number") {
                throw new Error("Rates not found in response");
            }

            state.rates.EUR = eur;
            state.rates.USD = usd;
            state.rateUpdatedAt = new Date().toISOString();
            saveRateCache();
            renderRateInfo();
            return;
        } catch (err) {
            lastErr = err;
        }
    }

    throw lastErr;
}

/* ------- Categories -------- */
function populateFilterCategorySelect() {
    const filterSelect = $("filterCategory");
    filterSelect.innerHTML = `<option value="all">All</option>`;

    const all = [...state.categories.income, ...state.categories.expense];
    for (const cat of all) {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        filterSelect.appendChild(opt);
    }
}

function populateFormCategorySelectForType(type) {
    const formSelect = $("category");
    const list = (type === "income") ? state.categories.income : state.categories.expense;

    formSelect.innerHTML = `<option value="" disabled selected>Choose</option>`;
    for (const cat of list) {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        formSelect.appendChild(opt);
    }
}

/* ------ Table ----- */
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderTable(filteredList) {
    const tbody = $("recordsBody");
    tbody.innerHTML = "";

    $("recordsInfo").textContent = `${filteredList.length} records`;

    for (const tx of filteredList) {
        const tr = document.createElement("tr");

        const typeLabel = tx.type === "income" ? "Income" : "Expense";
        const dateLabel = dayjs(tx.date).isValid() ? dayjs(tx.date).format("DD.MM.YYYY") : tx.date;

        tr.innerHTML = `
      <td>${dateLabel}</td>
      <td>${escapeHtml(tx.category)}</td>
      <td>${typeLabel}</td>
      <td class="right">${safeDisplayAmount(tx.amountCZK)}</td>
      <td>${escapeHtml(tx.note || "")}</td>
      <td class="center">
        <button class="deleteBtn" data-id="${tx.id}" type="button" title="Delete">🗑</button>
      </td>
    `;

        tbody.appendChild(tr);
    }

    tbody.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.currentTarget.getAttribute("data-id");
            const current = loadTransactions();
            const next = current.filter(t => t.id !== id);
            saveTransactions(next);
            renderAll(next);
        });
    });
}

/* ----- Chart ------ */
function buildExpenseByCategory(list) {
    const sumsCZK = new Map();

    for (const t of list) {
        if (t.type !== "expense") continue;
        sumsCZK.set(t.category, (sumsCZK.get(t.category) || 0) + t.amountCZK);
    }

    const labels = [];
    const values = [];

    for (const [cat, amountCZK] of sumsCZK.entries()) {
        labels.push(cat);
        const converted = convertFromCZK(amountCZK);
        values.push(converted == null ? 0 : converted);
    }

    return { labels, values };
}

function renderChart(filteredList) {
    const canvas = $("spendChart");
    if (!canvas) return;

    const data = buildExpenseByCategory(filteredList);

    if (state.chart) {
        state.chart.destroy();
        state.chart = null;
    }

    state.chart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: data.labels,
            datasets: [{
                label: `Expenses by category (${state.currency})`,
                data: data.values.map(v => Math.round(v))
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => new Intl.NumberFormat("cs-CZ").format(value)
                    }
                }
            }
        }
    });
}

/* ------ Today ------ */
function setTodayDefault() {
    const dateInput = $("date");
    if (!dateInput.value) dateInput.value = dayjs().format("YYYY-MM-DD");
}

/* ----- MAIN RENDER ------ */
function renderAll(list) {
    renderRateInfo();
    const filtered = applyFilter(list);
    renderSummary(filtered);
    renderTable(filtered);
    renderChart(filtered);
}

/* ------ Events ------ */
function initEvents() {
    $("currencySelect").addEventListener("change", () => {
        state.currency = $("currencySelect").value;
        renderAll(loadTransactions());
    });

    $("btnRefreshRate").addEventListener("click", async () => {
        try {
            $("rateInfo").textContent = "(loading...)";
            await fetchFrankfurterRates();
            renderAll(loadTransactions());
        } catch (err) {
            $("rateInfo").textContent = "(failed to load rate)";
            alert("Failed to load exchange rates. Please try again.");
            console.error(err);
        }
    });

    // Filter
    $("btnApplyFilter").addEventListener("click", applyFilterFromUI);
    $("btnClearFilter").addEventListener("click", clearFilterUI);

    $("btnClearAll").addEventListener("click", () => {
        const ok = confirm("Really delete ALL transactions?");
        if (!ok) return;
        localStorage.removeItem(STORAGE_KEY);
        renderAll([]);
    });

    // update category
    document.querySelectorAll('input[name="type"]').forEach(r => {
        r.addEventListener("change", (e) => {
            populateFormCategorySelectForType(e.target.value);
        });
    });

    $("txForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const form = $("txForm");
        const fd = new FormData(form);

        const type = fd.get("type");
        const amountInput = fd.get("amount");
        const category = fd.get("category");
        const date = fd.get("date");
        const note = String(fd.get("note") || "").trim();

        if (!type || !category || !date) {
            $("formInfo").textContent = "Please fill required fields.";
            return;
        }

        const amountCZK = normalizeAmountToCZK(amountInput);
        if (amountCZK == null) {
            if (state.currency !== "CZK" && typeof state.rates[state.currency] !== "number") {
                $("formInfo").textContent = "Rate missing. Click 'Refresh rate' first.";
            } else {
                $("formInfo").textContent = "Amount must be a positive number.";
            }
            return;
        }

        const tx = {
            id: crypto.randomUUID(),
            type,
            amountCZK,
            category,
            date,
            note
        };

        const current = loadTransactions();
        const next = [tx, ...current];
        saveTransactions(next);

        // Saved message
        const info = $("formInfo");
        info.textContent = "Saved ✓";
        info.style.opacity = "1";
        setTimeout(() => { info.textContent = ""; }, 2500);

        renderAll(next);

        form.reset();
        setTodayDefault();

        populateFormCategorySelectForType("income");
    });
}

/* ----- Boot ------ */
document.addEventListener("DOMContentLoaded", () => {
    state.currency = $("currencySelect").value;

    setTodayDefault();
    loadRateCache();
    renderRateInfo();

    populateFilterCategorySelect();
    populateFormCategorySelectForType("income");

    initEvents();

    const list = loadTransactions();
    renderAll(list);
});
