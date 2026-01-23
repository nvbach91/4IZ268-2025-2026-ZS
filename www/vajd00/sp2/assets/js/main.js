console.log("Budget Tracker loaded");

const STORAGE_KEY = "budget_transactions";
const RATE_KEY = "budget_rate_cache";

const FX = {
    base: "CZK",
    currencies: ["CZK", "EUR", "USD"],
    endpoints: [
        "https://api.frankfurter.app/latest",
        "https://api.frankfurter.dev/v1/latest"
    ],
    ttlHours: 24
};

let state = {
    currency: FX.base,
    rates: {},
    rateUpdatedAt: {},

    categories: {
        income: ["Salary", "Bonus", "Gift", "Refund", "Other income"],
        expense: ["Food", "Rent", "Transport", "Bills", "Fun", "Health", "Other expense"]
    },

    filter: { type: "all", category: "all", month: "all" },
    chart: null
};

const dom = Object.create(null);

function $(id) { return dom[id]; }

function cacheStaticDom() {
    const ids = [
        "sumIncome", "sumExpense", "sumBalance",
        "currencySelect", "btnRefreshRate", "rateInfo",
        "filterType", "filterCategory", "filterMonth",
        "btnApplyFilter", "btnClearFilter",
        "spendChart", "recordsInfo", "recordsBody",
        "txForm", "category", "date",
        "btnClearAll", "formInfo"
    ];

    for (const id of ids) {
        dom[id] = document.getElementById(id);
    }

    dom.typeRadios = document.querySelectorAll('input[name="type"]');
}

const ui = {
    async alert({ title = "Info", text = "", icon = "info" } = {}) {
        await Swal.fire({ title, text, icon });
    },

    async confirm({
        title = "Are you sure?",
        text = "",
        icon = "question",
        confirmText = "OK",
        cancelText = "Cancel"
    } = {}) {
        const res = await Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            reverseButtons: true
        });
        return res.isConfirmed;
    },

    toast(message, icon = "success") {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon,
            title: message,
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true
        });
    }
};

function initRatesState() {
    for (const c of FX.currencies) {
        if (c === FX.base) continue;
        if (!(c in state.rates)) state.rates[c] = null;
        if (!(c in state.rateUpdatedAt)) state.rateUpdatedAt[c] = null;
    }
}

function isRateFresh(code) {
    const ts = state.rateUpdatedAt[code];
    if (!ts) return false;
    const hours = dayjs().diff(dayjs(ts), "hour", true);
    return hours < FX.ttlHours;
}

function populateCurrencySelect() {
    const sel = $("currencySelect");
    const previous = sel.value || FX.base;

    let html = "";
    for (const c of FX.currencies) html += `<option value="${c}">${c}</option>`;
    sel.innerHTML = html;

    sel.value = FX.currencies.includes(previous) ? previous : FX.base;
}

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
function loadRateCache() {
    const raw = localStorage.getItem(RATE_KEY);
    if (!raw) return;

    try {
        const parsed = JSON.parse(raw);

        if (parsed?.base && parsed.base !== FX.base) return;

        if (parsed?.rates && typeof parsed.rates === "object") {
            for (const [k, v] of Object.entries(parsed.rates)) {
                if (typeof v === "number") state.rates[k] = v;
            }
        }

        if (parsed?.rateUpdatedAt && typeof parsed.rateUpdatedAt === "object") {
            for (const [k, v] of Object.entries(parsed.rateUpdatedAt)) {
                if (typeof v === "string") state.rateUpdatedAt[k] = v;
            }
        }

        if (typeof parsed?.rateUpdatedAt === "string") {
            for (const k of Object.keys(state.rates)) state.rateUpdatedAt[k] = parsed.rateUpdatedAt;
        }
    } catch { }
}

function saveRateCache() {
    localStorage.setItem(RATE_KEY, JSON.stringify({
        base: FX.base,
        rates: state.rates,
        rateUpdatedAt: state.rateUpdatedAt
    }));
}

function renderRateInfo() {
    if (state.currency === FX.base) {
        $("rateInfo").textContent = "(no rate needed)";
        return;
    }

    const rate = state.rates[state.currency];
    if (typeof rate !== "number") {
        $("rateInfo").textContent = "(rate not loaded)";
        return;
    }

    const ts = state.rateUpdatedAt[state.currency];
    const when = ts ? dayjs(ts).format("D.M.YYYY HH:mm") : "unknown";
    const stale = isRateFresh(state.currency) ? "" : " — stale, refresh";
    $("rateInfo").textContent = `${FX.base}→${state.currency}: ${rate.toFixed(4)} (updated ${when})${stale}`;
}


async function fetchFrankfurterRateFor(code) {
    if (code === FX.base) return;

    let lastErr = null;

    for (const baseUrl of FX.endpoints) {
        try {
            const url = `${baseUrl}?base=${encodeURIComponent(FX.base)}&symbols=${encodeURIComponent(code)}`;
            const resp = await axios.get(url, { timeout: 20000 });

            const rate = resp?.data?.rates?.[code];
            if (typeof rate !== "number") throw new Error("Rate not found in response");

            state.rates[code] = rate;
            state.rateUpdatedAt[code] = new Date().toISOString();
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
    const all = [...state.categories.income, ...state.categories.expense];

    let html = `<option value="all">All</option>`;
    for (const cat of all) {
        const safe = escapeHtml(cat);
        html += `<option value="${safe}">${safe}</option>`;
    }

    // single DOM update
    filterSelect.innerHTML = html;
}
function populateFormCategorySelectForType(type) {
    const formSelect = $("category");
    const list = (type === "income") ? state.categories.income : state.categories.expense;

    let html = `<option value="" disabled selected>Choose</option>`;
    for (const cat of list) {
        const safe = escapeHtml(cat);
        html += `<option value="${safe}">${safe}</option>`;
    }

    // single DOM update
    formSelect.innerHTML = html;
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

function txTimestamp(tx) {
    const d = dayjs(tx?.date);
    if (d.isValid()) return d.valueOf();
    const parsed = Date.parse(String(tx?.date || ""));
    return Number.isFinite(parsed) ? parsed : 0;
}

function sortTransactionsNewestFirst(list) {
    // podla datumu
    return list
        .map((t, idx) => ({ t, idx }))
        .sort((a, b) => {
            const ta = txTimestamp(a.t);
            const tb = txTimestamp(b.t);
            if (tb !== ta) return tb - ta;
            return a.idx - b.idx;
        })
        .map(x => x.t);
}

function renderTable(filteredList) {
    const tbody = $("recordsBody");

    const sorted = sortTransactionsNewestFirst(filteredList);
    $("recordsInfo").textContent = `${sorted.length} records`;

    const rows = [];
    for (const tx of sorted) {
        const typeLabel = tx.type === "income" ? "Income" : "Expense";
        const dateLabel = dayjs(tx.date).isValid()
            ? dayjs(tx.date).format("DD.MM.YYYY")
            : String(tx.date ?? "");
        const rowClass = tx.type === "income" ? "tx-income" : "tx-expense";
        const signedAmount =
            tx.type === "expense"
                ? `-${safeDisplayAmount(tx.amountCZK)}`
                : safeDisplayAmount(tx.amountCZK);


        rows.push(`
        <tr data-id="${tx.id}" class="${rowClass}">

        <td>${escapeHtml(dateLabel)}</td>
        <td>${escapeHtml(tx.category)}</td>
        <td>${typeLabel}</td>
        <td class="right">${signedAmount}</td>
        <td>${escapeHtml(tx.note || "")}</td>
        <td class="center">
          <button class="deleteBtn" data-id="${tx.id}" type="button" title="Delete">🗑</button>
        </td>
      </tr>
    `);
    }

    // single DOM update
    tbody.innerHTML = rows.join("");

    if (!tbody.dataset.boundDelete) {
        tbody.addEventListener("click", (e) => {
            const btn = e.target.closest?.(".deleteBtn");
            if (!btn) return;

            const id = btn.getAttribute("data-id");
            if (!id) return;

            const row = btn.parentNode.parentNode;

            const current = loadTransactions();
            const next = current.filter(t => t.id !== id);
            saveTransactions(next);

            // Remove one row
            if (row) row.remove();

            const filteredNext = applyFilter(next);
            $("recordsInfo").textContent = `${filteredNext.length} records`;
            renderSummary(filteredNext);
            renderChart(filteredNext);
        });

        tbody.dataset.boundDelete = "1";
    }
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
function applyFilterLive() {
    state.filter = getFilterFromUI();
    renderAll(loadTransactions());
}

function initEvents() {
    $("currencySelect").addEventListener("change", async () => {
        state.currency = $("currencySelect").value;

        try {
            if (state.currency !== FX.base && (!isRateFresh(state.currency) || typeof state.rates[state.currency] !== "number")) {
                $("rateInfo").textContent = "(loading...)";
                await fetchFrankfurterRateFor(state.currency);
            }
        } catch (err) {
            $("rateInfo").textContent = "(failed to load rate)";
            await ui.alert({ title: "Failed to load exchange rates", text: "Please try again.", icon: "error" });
            console.error(err);
        }

        renderAll(loadTransactions());
    });

    $("btnRefreshRate").addEventListener("click", async () => {
        try {
            $("rateInfo").textContent = "(loading...)";
            if (state.currency === FX.base) {
                ui.toast("No rate needed for CZK", "info");
            } else {
                await fetchFrankfurterRateFor(state.currency);
            }

            renderAll(loadTransactions());
        } catch (err) {
            $("rateInfo").textContent = "(failed to load rate)";
            await ui.alert({
                title: "Failed to load exchange rates",
                text: "Please try again.",
                icon: "error"
            });
            console.error(err);
        }
    });

    // Filter
    $("filterType").addEventListener("change", applyFilterLive);
    $("filterCategory").addEventListener("change", applyFilterLive);
    $("filterMonth").addEventListener("input", applyFilterLive);
    $("filterMonth").addEventListener("change", applyFilterLive);

    $("btnClearFilter").addEventListener("click", clearFilterUI);


    $("btnClearAll").addEventListener("click", async () => {
        const ok = await ui.confirm({
            title: "Delete ALL transactions?",
            text: "This cannot be undone.",
            icon: "warning",
            confirmText: "Delete all",
            cancelText: "Cancel"
        });
        if (!ok) return;

        localStorage.removeItem(STORAGE_KEY);
        renderAll([]);
        ui.toast("All transactions deleted", "success");
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
    cacheStaticDom();
    populateCurrencySelect();
    initRatesState();

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