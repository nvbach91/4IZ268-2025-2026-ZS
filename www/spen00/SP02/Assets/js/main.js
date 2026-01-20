
const App = (() => {
  const CLIENT_ID = '740364404062-ovtbp9n06nejt682hlnb1g5hjs3qn129.apps.googleusercontent.com';

  const API_KEY = 'AIzaSyCLDYoPxOHIB0znePWvmo6kJS2OgZhGdrg';

  const SPREADSHEET_ID = '1b_WPjCTVGHW_q-4qBsVdBwUbVu7HxzzGUqNL2ZyCIPA';

  const SHEET_NAME = 'Results';

  const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

  let tokenClient;
  let gapiInited = false;
  let gisInited = false;
  let isSignedIn = false;


  let allResults = [];
  let currentRower = null;
  let chartInstance = null;

  function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
  }

  function saveFiltersToLocalStorage() {
  const filters = {
    category: document.getElementById('filter-category').value,
    testType: document.getElementById('filter-testType').value,
    season: document.getElementById('filter-season').value,
    name: document.getElementById('filter-name').value
  };
  localStorage.setItem('rowingFilters', JSON.stringify(filters));
  }

  function loadFiltersFromLocalStorage() {
  const raw = localStorage.getItem('rowingFilters');
  if (!raw) return;
  try {
    const filters = JSON.parse(raw);
    document.getElementById('filter-category').value = filters.category || '';
    document.getElementById('filter-testType').value = filters.testType || '';
    document.getElementById('filter-season').value = filters.season || '';
    document.getElementById('filter-name').value = filters.name || '';
  } catch (e) {
    console.warn('Nepodařilo se načíst filtry z localStorage', e);
  }
  }

  function parseTimeToSeconds(timeStr) {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().replace(',', '.');
  const parts = cleaned.split(':').map(p => parseFloat(p));
  if (parts.some(isNaN)) return null;

  let seconds = 0;
  if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    seconds = parts[0];
  }
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

  function sortByNameAsc(a, b) {
  return a.name.localeCompare(b.name, 'cs');
  }

  function getUniqueRowers(results) {
  const map = new Map();
  results.forEach(r => {
    if (!r.name) return;
    if (!map.has(r.name)) {
      map.set(r.name, {
        name: r.name,
        club: r.club,
        category: r.category
      });
    }
  });
  return Array.from(map.values()).sort(sortByNameAsc);
  }

  function getFilteredResults() {
  const category = document.getElementById('filter-category').value;
  const testType = document.getElementById('filter-testType').value;
  const season = document.getElementById('filter-season').value;
  const name = document.getElementById('filter-name').value.toLowerCase();

  return allResults.filter(r => {
    if (category && r.category !== category) return false;
    if (testType && r.testType !== testType) return false;
    if (season) {
      if (!r.date || !r.date.startsWith(season)) return false;
    }
    if (name && !r.name.toLowerCase().includes(name)) return false;
    return true;
  });
  }


  function renderRowersTable() {
  const tbody = document.getElementById('rowers-tbody');
  tbody.innerHTML = '';

  const filtered = getFilteredResults();
  const rowers = getUniqueRowers(filtered);

  if (rowers.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'Nebyli nalezeni žádní veslaři pro dané filtry.';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  rowers.forEach(rower => {
    const testsForRower = filtered.filter(r => r.name === rower.name);

    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = rower.name;

    const tdClub = document.createElement('td');
    tdClub.textContent = rower.club || '–';

    const tdCat = document.createElement('td');
    tdCat.textContent = rower.category || '–';

    const tdCount = document.createElement('td');
    tdCount.textContent = testsForRower.length.toString();

    const tdAction = document.createElement('td');
    const btnDetail = document.createElement('button');
    btnDetail.textContent = 'Detail';
    btnDetail.addEventListener('click', () => {
      selectRower(rower.name);
    });
    tdAction.appendChild(btnDetail);

    tr.appendChild(tdName);
    tr.appendChild(tdClub);
    tr.appendChild(tdCat);
    tr.appendChild(tdCount);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });
  }


  function renderRowerDetail(rowerName) {
  const detailName = document.getElementById('detail-name');
  const detailClub = document.getElementById('detail-club');
  const detailCategory = document.getElementById('detail-category');
  const detailBest2k = document.getElementById('detail-best-2k');
  const detailBest6k = document.getElementById('detail-best-6k');
  const detailLastTest = document.getElementById('detail-last-test');

  const historyTbody = document.getElementById('history-tbody');
  historyTbody.innerHTML = '';

  if (!rowerName) {
    detailName.textContent = '–';
    detailClub.textContent = '–';
    detailCategory.textContent = '–';
    detailBest2k.textContent = '–';
    detailBest6k.textContent = '–';
    detailLastTest.textContent = '–';
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  const tests = allResults
    .filter(r => r.name === rowerName)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  if (tests.length === 0) {
    detailName.textContent = rowerName;
    detailClub.textContent = '–';
    detailCategory.textContent = '–';
    detailBest2k.textContent = '–';
    detailBest6k.textContent = '–';
    detailLastTest.textContent = 'Žádné testy.';
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  const first = tests[0];
  detailName.textContent = first.name;
  detailClub.textContent = first.club || '–';
  detailCategory.textContent = first.category || '–';

  const tests2k = tests.filter(t => t.testType === '2k');
  if (tests2k.length) {
    const best2k = tests2k.reduce((best, curr) => {
      const currSec = curr.timeSeconds ?? parseTimeToSeconds(curr.time);
      const bestSec = best.timeSeconds ?? parseTimeToSeconds(best.time);
      if (currSec == null) return best;
      if (bestSec == null || currSec < bestSec) return curr;
      return best;
    }, tests2k[0]);
    const sec = best2k.timeSeconds ?? parseTimeToSeconds(best2k.time);
    detailBest2k.textContent = sec != null ? formatSeconds(sec) : (best2k.time || '–');
  } else {
    detailBest2k.textContent = '–';
  }

  const tests6k = tests.filter(t => t.testType === '6k');
  if (tests6k.length) {
    const best6k = tests6k.reduce((best, curr) => {
      const currSec = curr.timeSeconds ?? parseTimeToSeconds(curr.time);
      const bestSec = best.timeSeconds ?? parseTimeToSeconds(best.time);
      if (currSec == null) return best;
      if (bestSec == null || currSec < bestSec) return curr;
      return best;
    }, tests6k[0]);
    const sec = best6k.timeSeconds ?? parseTimeToSeconds(best6k.time);
    detailBest6k.textContent = sec != null ? formatSeconds(sec) : (best6k.time || '–');
  } else {
    detailBest6k.textContent = '–';
  }

  const last = tests[tests.length - 1];
  const lastTime = last.time || formatSeconds(last.timeSeconds);
  detailLastTest.textContent = last.date
    ? `${last.date} – ${last.testType} – ${lastTime}`
    : `${last.testType} – ${lastTime}`;

  tests.forEach(t => {
    const tr = document.createElement('tr');

    const tdDate = document.createElement('td');
    tdDate.textContent = t.date || '–';

    const tdType = document.createElement('td');
    tdType.textContent = t.testType || '–';

    const tdTime = document.createElement('td');
    tdTime.textContent = t.time || formatSeconds(t.timeSeconds) || '–';

    const tdNote = document.createElement('td');
    tdNote.textContent = t.note || '';

    tr.appendChild(tdDate);
    tr.appendChild(tdType);
    tr.appendChild(tdTime);
    tr.appendChild(tdNote);

    historyTbody.appendChild(tr);
  });

  renderChartForRower(tests);
  }

  function populateFormRowers() {
  const select = document.getElementById('form-rower');
  select.innerHTML = '';

  const rowers = getUniqueRowers(allResults);
  rowers.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.name;
    opt.textContent = r.name;
    select.appendChild(opt);
  });

  if (currentRower) {
    select.value = currentRower;
  }
  }


  function renderChartForRower(tests) {
  const ctx = document.getElementById('performance-chart');
  if (!ctx) return;

  const show2k = document.getElementById('chart-2k').checked;
  const show6k = document.getElementById('chart-6k').checked;
  const currentSeasonOnly = document.getElementById('chart-current-season').checked;

  const currentYear = new Date().getFullYear().toString();

  const dataset2k = [];
  const dataset6k = [];

  tests.forEach(t => {
    if (currentSeasonOnly && (!t.date || !t.date.startsWith(currentYear))) {
      return;
    }
    const sec = t.timeSeconds ?? parseTimeToSeconds(t.time);
    if (sec == null) return;
    const label = t.date || '';
    if (t.testType === '2k') {
      dataset2k.push({ x: label, y: sec });
    } else if (t.testType === '6k') {
      dataset6k.push({ x: label, y: sec });
    }
  });

  const dataSets = [];
  if (show2k && dataset2k.length) {
    dataSets.push({
      label: '2 km',
      data: dataset2k,
      tension: 0.2
    });
  }
  if (show6k && dataset6k.length) {
    dataSets.push({
      label: '6 km',
      data: dataset6k,
      tension: 0.2
    });
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  if (dataSets.length === 0) {
    chartInstance = null;
    if (ctx.getContext) {
      const c = ctx.getContext('2d');
      c.clearRect(0, 0, ctx.width, ctx.height);
    }
    return;
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: dataSets
    },
    options: {
      parsing: false,
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Datum'
          }
        },
        y: {
          reverse: true, 
          title: {
            display: true,
            text: 'Čas (s)'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#e6eef7'
          }
        }
      }
    }
  });
  }


  async function gapiLoaded() {
  await gapi.load('client', initializeGapiClient);
  }

  async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  });
  gapiInited = true;
  maybeEnableAuth();
  }

  function gsiLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', 
  });
  gisInited = true;
  maybeEnableAuth();
  }

  function maybeEnableAuth() {
  if (gapiInited && gisInited) {
    document.getElementById('btn-auth').disabled = false;
  }
  }

  async function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error) {
      console.error(resp);
      return;
    }
    isSignedIn = true;
    updateAuthUi();
    await fetchResults();
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.requestAccessToken({ prompt: '' });
  }
  }

  function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
  }
  isSignedIn = false;
  updateAuthUi();
  allResults = [];
  renderRowersTable();
  renderRowerDetail(null);
  }

  function updateAuthUi() {
  const btnAuth = document.getElementById('btn-auth');
  const btnSignout = document.getElementById('btn-signout');

  if (isSignedIn) {
    btnAuth.textContent = 'Obnovit přístup';
    btnSignout.classList.remove('hidden');
  } else {
    btnAuth.textContent = 'Přihlásit k Google';
    btnSignout.classList.add('hidden');
  }
  }


  async function fetchResults() {
  const loader = document.getElementById('rowers-loader');
  const errorEl = document.getElementById('rowers-error');
  loader.classList.remove('hidden');
  errorEl.classList.add('hidden');
  errorEl.textContent = '';

  try {
    if (!isSignedIn) {
      throw new Error('Nejprve se přihlas k Google účtu.');
    }

    const range = `${SHEET_NAME}!A1:H`;
    const resp = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const values = resp.result.values || [];
    if (values.length < 2) {
      allResults = [];
    } else {
      const headers = values[0];
      const rows = values.slice(1);
      allResults = rows
        .filter(r => r.join('').trim() !== '')
        .map(row => {
          const obj = {};
          headers.forEach((h, i) => obj[h] = row[i] || '');
          const sec = parseTimeToSeconds(obj.time);
          return {
            ...obj,
            timeSeconds: sec,
          };
        });
    }

    allResults.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'cs'));

    renderRowersTable();
    populateFormRowers();

    const urlRower = getQueryParam('rower');
    if (urlRower) {
      selectRower(urlRower);
    } else if (!currentRower && allResults.length) {
      selectRower(allResults[0].name);
    } else if (currentRower) {
      renderRowerDetail(currentRower);
    }

  } catch (err) {
    console.error(err);
    errorEl.textContent = err.message || 'Nepodařilo se načíst data ze Sheets API.';
    errorEl.classList.remove('hidden');
  } finally {
    loader.classList.add('hidden');
  }
  }

  async function createResult(newResult) {
  const formMessage = document.getElementById('form-message');
  formMessage.textContent = '';

  try {
    if (!isSignedIn) {
      throw new Error('Nejprve se přihlas k Google účtu.');
    }

    const id = `web_${Date.now()}`;

    const row = [
      id,
      newResult.name || '',
      newResult.club || '',
      newResult.category || '',
      newResult.testType || '',
      newResult.date || '',
      newResult.time || '',
      newResult.note || '',
    ];

    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:H1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [row],
      },
    });

    allResults.push({
      id: row[0],
      name: row[1],
      club: row[2],
      category: row[3],
      testType: row[4],
      date: row[5],
      time: row[6],
      note: row[7],
      timeSeconds: parseTimeToSeconds(row[6]),
    });

    renderRowersTable();
    populateFormRowers();
    selectRower(newResult.name);

    formMessage.style.color = '#4caf50';
    formMessage.textContent = 'Test byl úspěšně uložen do Google Sheets.';

  } catch (err) {
    console.error(err);
    formMessage.style.color = '#ff6b6b';
    formMessage.textContent = err.message || 'Nepodařilo se uložit test do Google Sheets.';
  }
  }


  function applyFilters() {
  saveFiltersToLocalStorage();
  renderRowersTable();
  }

  function resetFilters() {
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-testType').value = '';
  document.getElementById('filter-season').value = '';
  document.getElementById('filter-name').value = '';
  saveFiltersToLocalStorage();
  renderRowersTable();
  }

  function selectRower(name) {
  currentRower = name;
  const url = new URL(window.location.href);
  url.searchParams.set('rower', name);
  window.history.pushState({ rower: name }, '', url.toString());

  renderRowerDetail(name);

  const select = document.getElementById('form-rower');
  if (select.options.length) {
    select.value = name;
  }
  }

  function handleFormSubmit(event) {
  event.preventDefault();

  const formMessage = document.getElementById('form-message');
  formMessage.textContent = '';

  const addNewRower = document.getElementById('form-add-new-rower').checked;
  const selectRowerEl = document.getElementById('form-rower');
  const newRowerInput = document.getElementById('form-new-rower');
  const testType = document.getElementById('form-testType').value;
  const date = document.getElementById('form-date').value;
  const timeStr = document.getElementById('form-time').value;
  const note = document.getElementById('form-note').value;

  let name;
  if (addNewRower) {
    name = newRowerInput.value.trim();
    if (!name) {
      formMessage.style.color = '#ff6b6b';
      formMessage.textContent = 'Zadej jméno nového veslaře.';
      return;
    }
  } else {
    name = selectRowerEl.value;
  }

  if (!date) {
    formMessage.style.color = '#ff6b6b';
    formMessage.textContent = 'Zadej datum testu.';
    return;
  }

  const sec = parseTimeToSeconds(timeStr);
  if (sec == null) {
    formMessage.style.color = '#ff6b6b';
    formMessage.textContent =
      'Zadej čas ve formátu HH:MM:SS nebo MM:SS (lze i s desetinou).';
    return;
  }

  const known = allResults.find(r => r.name === name);
  const category = known ? known.category : '';
  const club = known ? known.club : '';

  const newResult = {
    name,
    club,
    category,
    testType,
    date,
    time: timeStr,
    note
  };

  createResult(newResult);
  }

  function handleAddNewRowerToggle() {
  const checkbox = document.getElementById('form-add-new-rower');
  const row = document.getElementById('form-new-rower-row');
  const select = document.getElementById('form-rower');

  if (checkbox.checked) {
    row.classList.remove('hidden');
    select.disabled = true;
  } else {
    row.classList.add('hidden');
    select.disabled = false;
  }
  }


  document.addEventListener('DOMContentLoaded', () => {
  loadFiltersFromLocalStorage();

  document.getElementById('btn-apply-filters').addEventListener('click', applyFilters);
  document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);
  document.getElementById('btn-refresh').addEventListener('click', fetchResults);

  document.getElementById('chart-2k').addEventListener('change', () => {
    if (currentRower) renderRowerDetail(currentRower);
  });
  document.getElementById('chart-6k').addEventListener('change', () => {
    if (currentRower) renderRowerDetail(currentRower);
  });
  document.getElementById('chart-current-season').addEventListener('change', () => {
    if (currentRower) renderRowerDetail(currentRower);
  });

  document.getElementById('new-test-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('form-add-new-rower').addEventListener('change', handleAddNewRowerToggle);

  document.getElementById('btn-auth').addEventListener('click', handleAuthClick);
  document.getElementById('btn-signout').addEventListener('click', handleSignoutClick);

  });

  return {
    gapiLoaded,
    gsiLoaded,
  };
})();

window.gapiLoaded = App.gapiLoaded;
window.gsiLoaded = App.gsiLoaded;
