const App = (() => {
  // ===========================================================
  // CONFIG
  // ===========================================================
  const CLIENT_ID =
    '740364404062-ovtbp9n06nejt682hlnb1g5hjs3qn129.apps.googleusercontent.com';

  const API_KEY = 'AIzaSyCLDYoPxOHIB0znePWvmo6kJS2OgZhGdrg';
  const SPREADSHEET_ID = '1b_WPjCTVGHW_q-4qBsVdBwUbVu7HxzzGUqNL2ZyCIPA';
  const SHEET_NAME = 'Results';
  const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

  let tokenClient;
  let gapiInited = false;
  let gisInited = false;
  let isSignedIn = false;

  // Jména pro dropdown
  let nameRows = [];

  // Hlavička tabulky
  let headers = [];

  // Úvodní detail
  let currentName = null;
  let currentTests = [];
  let chartInstance = null;


  // DOM CACHE

  const DOM = {
    btnRefresh: null,
    btnAuth: null,
    btnSignout: null,

    filterRower: null,
    btnDetail: null,
    namesLoader: null,
    namesError: null,

    detailRow: null,
    detailName: null,
    detailClub: null,
    detailCategory: null,
    detailBest2k: null,
    detailBest6k: null,
    detailLastTest: null,

    performanceChart: null,
    chart2k: null,
    chart6k: null,
    chartCurrentSeason: null,
    historyTbody: null,

    // form
    newTestForm: null,
    formMessage: null,
    formAddNewRower: null,
    formNewRowerRow: null,
    formNewRower: null,
    formNewClubRow: null,
    formNewClub: null,
    formRower: null,
    formTestType: null,
    formDate: null,
    formTime: null,
    formNote: null,
    formReset: null
  };

  function initDomCache() {
    DOM.btnRefresh = document.getElementById('btn-refresh');
    DOM.btnAuth = document.getElementById('btn-auth');
    DOM.btnSignout = document.getElementById('btn-signout');

    DOM.filterRower = document.getElementById('filter-rower');
    DOM.btnDetail = document.getElementById('btn-detail');
    DOM.namesLoader = document.getElementById('names-loader');
    DOM.namesError = document.getElementById('names-error');

    DOM.detailRow = document.getElementById('detail-row');
    DOM.detailName = document.getElementById('detail-name');
    DOM.detailClub = document.getElementById('detail-club');
    DOM.detailCategory = document.getElementById('detail-category');
    DOM.detailBest2k = document.getElementById('detail-best-2k');
    DOM.detailBest6k = document.getElementById('detail-best-6k');
    DOM.detailLastTest = document.getElementById('detail-last-test');

    DOM.performanceChart = document.getElementById('performance-chart');
    DOM.chart2k = document.getElementById('chart-2k');
    DOM.chart6k = document.getElementById('chart-6k');
    DOM.chartCurrentSeason = document.getElementById('chart-current-season');
    DOM.historyTbody = document.getElementById('history-tbody');

    DOM.newTestForm = document.getElementById('new-test-form');
    DOM.formMessage = document.getElementById('form-message');
    DOM.formAddNewRower = document.getElementById('form-add-new-rower');
    DOM.formNewRowerRow = document.getElementById('form-new-rower-row');
    DOM.formNewRower = document.getElementById('form-new-rower');
    DOM.formNewClubRow = document.getElementById('form-new-club-row');
    DOM.formNewClub = document.getElementById('form-new-club');
    DOM.formRower = document.getElementById('form-rower');
    DOM.formTestType = document.getElementById('form-testType');
    DOM.formDate = document.getElementById('form-date');
    DOM.formTime = document.getElementById('form-time');
    DOM.formNote = document.getElementById('form-note');
    DOM.formReset = document.getElementById('form-reset');
  }


  function setLoading(isLoading) {
    DOM.namesLoader?.classList.toggle('hidden', !isLoading);
  }

  function showError(msg) {
    if (!DOM.namesError) return;
    DOM.namesError.textContent = msg || '';
    DOM.namesError.classList.toggle('hidden', !msg);
  }

  function showFormMessage(msg, ok = false) {
    if (!DOM.formMessage) return;
    DOM.formMessage.textContent = msg || '';
    if (!msg) return;
    DOM.formMessage.style.color = ok ? '#4caf50' : '#ff6b6b';
  }

  function clearChart() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    const canvas = DOM.performanceChart;
    if (canvas?.getContext) {
      const c = canvas.getContext('2d');
      c.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function clearDetail() {
    DOM.detailRow && (DOM.detailRow.textContent = '–');
    DOM.detailName && (DOM.detailName.textContent = '–');
    DOM.detailClub && (DOM.detailClub.textContent = '–');
    DOM.detailCategory && (DOM.detailCategory.textContent = '–');
    DOM.detailBest2k && (DOM.detailBest2k.textContent = '–');
    DOM.detailBest6k && (DOM.detailBest6k.textContent = '–');
    DOM.detailLastTest && (DOM.detailLastTest.textContent = '–');
    DOM.historyTbody && (DOM.historyTbody.innerHTML = '');
    clearChart();

    currentName = null;
    currentTests = [];
  }

  function normalizeHeader(h) {
    return String(h || '').trim().toLowerCase();
  }

  function headerIndex(name) {
    const target = normalizeHeader(name);
    return headers.findIndex(h => normalizeHeader(h) === target);
  }

  // Shodnost jména vaslaře
  function exactName(value) {
    return String(value || '').trim();
  }

  function parseTimeToSeconds(timeStr) {
    if (!timeStr) return null;
    const cleaned = timeStr.trim().replace(',', '.');
    const parts = cleaned.split(':').map(p => parseFloat(p));
    if (parts.some(isNaN)) return null;

    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    else seconds = parts[0];

    return seconds;
  }

  function formatSeconds(sec) {
    if (sec == null || isNaN(sec)) return '–';
    const totalSeconds = Math.round(sec * 10) / 10;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;
    const secInt = Math.floor(seconds);
    const decimals = Math.round((seconds - secInt) * 10);
    const secStr = String(secInt).padStart(2, '0');
    return `${minutes}:${secStr}${decimals ? ',' + decimals : ''}`;
  }

  function ensureOption(selectEl, value) {
    if (!selectEl) return;
    const exists = Array.from(selectEl.options).some(o => o.value === value);
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = value;
      selectEl.appendChild(opt);
    }
  }


  //dropdown jmen

  function renderNamesDropdown() {
    const select = DOM.filterRower;
    if (!select) return;

    select.innerHTML = `<option value="">— vyber závodníka —</option>`;
    const frag = document.createDocumentFragment();

    nameRows.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.name;
      opt.textContent = item.name;
      frag.appendChild(opt);
    });

    select.appendChild(frag);
  }

  function renderFormRowersDropdown() {
    const select = DOM.formRower;
    if (!select) return;

    select.innerHTML = '';
    const frag = document.createDocumentFragment();

    nameRows.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.name;
      opt.textContent = item.name;
      frag.appendChild(opt);
    });

    select.appendChild(frag);
  }

 
  // API pouze jména: načti jen jména (B2:B) + unikátní pro dropdown

  async function fetchNamesOnly() {
    setLoading(true);
    showError('');

    try {
      if (!isSignedIn) throw new Error('Nejprve se přihlas k Google účtu.');

      // hlavička A1:H1
      const headerResp = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:H1`
      });
      headers = (headerResp.result.values && headerResp.result.values[0]) || [];

      // jména B2:B
      const namesResp = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!B2:B`
      });

      const values = namesResp.result.values || [];
      const raw = values
        .map((r, i) => ({
          name: exactName(r[0]),
          rowNumber: i + 2
        }))
        .filter(x => x.name);

      // Pouze první výskyt jména 
      const seen = new Set();
      nameRows = [];
      for (const item of raw) {
        if (!seen.has(item.name)) {
          seen.add(item.name);
          nameRows.push(item);
        }
      }

      nameRows.sort((a, b) => a.name.localeCompare(b.name, 'cs'));

      renderNamesDropdown();
      renderFormRowersDropdown();

      DOM.btnDetail.disabled = !DOM.filterRower.value;
    } catch (err) {
      console.error(err);
      const msg = err?.result?.error?.message || err?.message || 'Nepodařilo se načíst jména.';
      showError(msg);

      headers = [];
      nameRows = [];
      renderNamesDropdown();
      renderFormRowersDropdown();
      DOM.btnDetail.disabled = true;
    } finally {
      setLoading(false);
    }
  }


  //Stažení pouze nutných dat pro detail vybraného veslaře
  async function loadDetailForSelected() {
    showError('');
    clearDetail();

    try {
      if (!isSignedIn) throw new Error('Nejprve se přihlas k Google účtu.');
      const selectedName = exactName(DOM.filterRower.value);
      if (!selectedName) throw new Error('Vyber závodníka.');
      if (!headers.length) throw new Error('Chybí hlavička tabulky.');

      const idxNameHeader = headerIndex('name');
      if (idxNameHeader < 0) throw new Error('V hlavičce chybí sloupec "name".');

      // Stáhne pouze jména
      const namesResp = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!B2:B`
      });

      const names = namesResp.result.values || [];
      const matchedRowNumbers = [];
      for (let i = 0; i < names.length; i++) {
        const nm = exactName(names[i]?.[0]);
        if (nm === selectedName) matchedRowNumbers.push(i + 2); 
      }

      if (!matchedRowNumbers.length) {
        throw new Error('Pro vybraného závodníka nebyly nalezeny žádné testy.');
      }

      //batchGet jen potřebných řádků (A{row}:H{row})
      const ranges = matchedRowNumbers.map(rn => `${SHEET_NAME}!A${rn}:H${rn}`);

      const batchResp = await gapi.client.sheets.spreadsheets.values.batchGet({
        spreadsheetId: SPREADSHEET_ID,
        ranges
      });

      const valueRanges = batchResp.result.valueRanges || [];

      // mapování na objekty
      const matched = [];
      for (let i = 0; i < valueRanges.length; i++) {
        const rn = matchedRowNumbers[i];
        const row = valueRanges[i]?.values?.[0] || [];

        const obj = {};
        headers.forEach((h, col) => (obj[normalizeHeader(h)] = row[col] || ''));

        const timeStr = obj.time || '';
        matched.push({
          rowNumber: rn,
          id: obj.id || '',
          name: obj.name || selectedName,
          club: obj.club || '',
          category: obj.category || '',
          testType: obj.testtype || '',
          date: obj.date || '',
          time: timeStr,
          note: obj.note || '',
          timeSeconds: parseTimeToSeconds(timeStr)
        });
      }

      // seřadit podle data (ISO YYYY-MM-DD)
      matched.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

      //uložit do currentTests a vykreslit graf z těchto dat
      currentName = selectedName;
      currentTests = matched;

      const first = matched[0];

      DOM.detailRow.textContent = matched.map(t => t.rowNumber).join(', ');
      DOM.detailName.textContent = first.name || '–';
      DOM.detailClub.textContent = first.club || '–';
      DOM.detailCategory.textContent = first.category || '–';

      const tests2k = matched.filter(t => t.testType === '2k' && t.timeSeconds != null);
      const tests6k = matched.filter(t => t.testType === '6k' && t.timeSeconds != null);

      if (tests2k.length) {
        const best2k = tests2k.reduce(
          (best, cur) => (cur.timeSeconds < best.timeSeconds ? cur : best),
          tests2k[0]
        );
        DOM.detailBest2k.textContent = best2k.time || formatSeconds(best2k.timeSeconds);
      } else {
        DOM.detailBest2k.textContent = '–';
      }

      if (tests6k.length) {
        const best6k = tests6k.reduce(
          (best, cur) => (cur.timeSeconds < best.timeSeconds ? cur : best),
          tests6k[0]
        );
        DOM.detailBest6k.textContent = best6k.time || formatSeconds(best6k.timeSeconds);
      } else {
        DOM.detailBest6k.textContent = '–';
      }

      const last = matched[matched.length - 1];
      const lastTime = last.time || formatSeconds(last.timeSeconds);
      DOM.detailLastTest.textContent = last.date
        ? `${last.date} – ${last.testType || '–'} – ${lastTime}`
        : `${last.testType || '–'} – ${lastTime}`;

      renderHistoryTable(matched);
      renderChartForTests(matched);

      ensureOption(DOM.formRower, first.name);
      if (DOM.formRower) DOM.formRower.value = first.name;

    } catch (err) {
      console.error(err);
      const msg = err?.result?.error?.message || err?.message || 'Nepodařilo se načíst detail.';
      showError(msg);
    }
  }

  function renderHistoryTable(tests) {
    if (!DOM.historyTbody) return;
    DOM.historyTbody.innerHTML = '';

    const frag = document.createDocumentFragment();
    tests.forEach(t => {
      const tr = document.createElement('tr');

      const tdDate = document.createElement('td');
      tdDate.textContent = t.date || '–';

      const tdType = document.createElement('td');
      tdType.textContent = t.testType || '–';

      const tdTime = document.createElement('td');
      tdTime.textContent = t.time || (t.timeSeconds != null ? formatSeconds(t.timeSeconds) : '–');

      const tdNote = document.createElement('td');
      tdNote.textContent = t.note || '';

      tr.appendChild(tdDate);
      tr.appendChild(tdType);
      tr.appendChild(tdTime);
      tr.appendChild(tdNote);

      frag.appendChild(tr);
    });

    DOM.historyTbody.appendChild(frag);
  }


  // GRAF
 
  function renderChartForTests(tests) {
    const canvas = DOM.performanceChart;
    if (!canvas) return;

    const show2k = DOM.chart2k?.checked ?? true;
    const show6k = DOM.chart6k?.checked ?? false;
    const currentSeasonOnly = DOM.chartCurrentSeason?.checked ?? false;
    const currentYear = new Date().getFullYear().toString();

    const dataset2k = [];
    const dataset6k = [];

    tests.forEach(t => {
      if (currentSeasonOnly && (!t.date || !t.date.startsWith(currentYear))) return;
      if (t.timeSeconds == null) return;
      const label = t.date || '';

      if (t.testType === '2k') dataset2k.push({ x: label, y: t.timeSeconds });
      if (t.testType === '6k') dataset6k.push({ x: label, y: t.timeSeconds });
    });

    const dataSets = [];
    if (show2k && dataset2k.length) dataSets.push({ label: '2 km', data: dataset2k, tension: 0.2 });
    if (show6k && dataset6k.length) dataSets.push({ label: '6 km', data: dataset6k, tension: 0.2 });

    if (chartInstance) chartInstance.destroy();

    if (!dataSets.length) {
      chartInstance = null;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    chartInstance = new Chart(canvas, {
      type: 'line',
      data: { datasets: dataSets },
      options: {
        parsing: false,
        scales: {
          x: {
            type: 'category',
            title: { display: true, text: 'Datum' },
            ticks: { color: '#e6eef7' }
          },
          y: {
            reverse: true,
            title: { display: true, text: 'Čas (s)' },
            ticks: { color: '#e6eef7' }
          }
        },
        plugins: {
          legend: { labels: { color: '#e6eef7' } }
        }
      }
    });
  }

  
  // FORM: přidání testu + nový veslař + klub
 
  function handleAddNewRowerToggle() {
    const checked = DOM.formAddNewRower?.checked ?? false;

    if (checked) {
      DOM.formNewRowerRow?.classList.remove('hidden');
      DOM.formNewClubRow?.classList.remove('hidden');
      if (DOM.formRower) DOM.formRower.disabled = true;
    } else {
      DOM.formNewRowerRow?.classList.add('hidden');
      DOM.formNewClubRow?.classList.add('hidden');
      if (DOM.formRower) DOM.formRower.disabled = false;
      if (DOM.formNewRower) DOM.formNewRower.value = '';
      if (DOM.formNewClub) DOM.formNewClub.value = '';
    }
  }

  async function createResult(newResult) {
    showFormMessage('');

    try {
      if (!isSignedIn) throw new Error('Nejprve se přihlas k Google účtu.');

      const id = `web_${Date.now()}`;
      const row = [
        id,
        newResult.name || '',
        newResult.club || '',
        newResult.category || '',
        newResult.testType || '',
        newResult.date || '',
        newResult.time || '',
        newResult.note || ''
      ];

      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:H1`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [row] }
      });

      showFormMessage('Test byl úspěšně uložen do Google Sheets.', true);

      // obnovit jména (dropdowny)
      await fetchNamesOnly();

    } catch (err) {
      console.error(err);
      const msg =
        err?.result?.error?.message ||
        err?.message ||
        'Nepodařilo se uložit test do Google Sheets.';
      showFormMessage(msg, false);
    }
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    showFormMessage('');

    const addNewRower = DOM.formAddNewRower?.checked ?? false;

    const testType = DOM.formTestType?.value || '';
    const date = DOM.formDate?.value || '';
    const timeStr = DOM.formTime?.value || '';
    const note = DOM.formNote?.value || '';

    let name = '';
    let club = '';
    let category = '';

    if (addNewRower) {
      name = exactName(DOM.formNewRower?.value);
      club = exactName(DOM.formNewClub?.value);
      if (!name) return showFormMessage('Zadej jméno nového veslaře.');
      if (!club) return showFormMessage('Zadej klub nového veslaře.');
    } else {
      name = exactName(DOM.formRower?.value);
      if (!name) return showFormMessage('Vyber veslaře.');

      if (currentTests.length && exactName(currentName) === name) {
        club = currentTests[0].club || '';
        category = currentTests[0].category || '';
      }
    }

    if (!date) return showFormMessage('Zadej datum testu.');
    const sec = parseTimeToSeconds(timeStr);
    if (sec == null)
      return showFormMessage('Zadej čas ve formátu HH:MM:SS nebo MM:SS (lze i s desetinou).');

    createResult({
      name,
      club,
      category,
      testType,
      date,
      time: timeStr,
      note
    });
  }


  async function gapiLoaded() {
    await gapi.load('client', initializeGapiClient);
  }

  async function initializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
    });
    gapiInited = true;
    maybeEnableAuth();
  }

  function gsiLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: ''
    });
    gisInited = true;
    maybeEnableAuth();
  }

  function maybeEnableAuth() {
    if (gapiInited && gisInited) DOM.btnAuth.disabled = false;
  }

  async function handleAuthClick() {
    tokenClient.callback = async (resp) => {
      if (resp.error) {
        console.error(resp);
        return;
      }
      isSignedIn = true;
      updateAuthUi();
      await fetchNamesOnly();
    };

    if (gapi.client.getToken() === null) tokenClient.requestAccessToken({ prompt: 'consent' });
    else tokenClient.requestAccessToken({ prompt: '' });
  }

  function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
    }
    isSignedIn = false;
    updateAuthUi();

    headers = [];
    nameRows = [];
    clearDetail();
    DOM.btnDetail.disabled = true;
    showError('');
    showFormMessage('');
    renderNamesDropdown();
    renderFormRowersDropdown();
  }

  function updateAuthUi() {
    if (isSignedIn) {
      DOM.btnAuth.textContent = 'Obnovit přístup';
      DOM.btnSignout.classList.remove('hidden');
    } else {
      DOM.btnAuth.textContent = 'Přihlásit k Google';
      DOM.btnSignout.classList.add('hidden');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDomCache();
    clearDetail();

    DOM.btnAuth?.addEventListener('click', handleAuthClick);
    DOM.btnSignout?.addEventListener('click', handleSignoutClick);
    DOM.btnRefresh?.addEventListener('click', fetchNamesOnly);

    DOM.filterRower?.addEventListener('change', () => {
      DOM.btnDetail.disabled = !DOM.filterRower.value;
    });

    DOM.btnDetail?.addEventListener('click', loadDetailForSelected);

    const rerenderChart = () => {
      if (currentTests.length) renderChartForTests(currentTests);
      else clearChart();
    };
    DOM.chart2k?.addEventListener('change', rerenderChart);
    DOM.chart6k?.addEventListener('change', rerenderChart);
    DOM.chartCurrentSeason?.addEventListener('change', rerenderChart);

    DOM.newTestForm?.addEventListener('submit', handleFormSubmit);
    DOM.formAddNewRower?.addEventListener('change', handleAddNewRowerToggle);

    DOM.formReset?.addEventListener('click', () => showFormMessage(''));

    DOM.btnDetail && (DOM.btnDetail.disabled = true);
    renderNamesDropdown();
    renderFormRowersDropdown();
  });

  return { gapiLoaded, gsiLoaded };
})();

window.gapiLoaded = App.gapiLoaded;
window.gsiLoaded = App.gsiLoaded;
