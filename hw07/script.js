(() => {
  const UNIQUE_VALUES = ['Prague', 'London', 'Paris', 'Helsinki', 'Hamburg', 'Madrid', 'Turin', 'Sydney', 'Vancouver', 'Seoul'];
  const ROWS = 4;
  const COLS = 5;
  const css = `
  :root{
    --bg:#0d1117; --card:#e06666; --card-hover:#d05a5a; --face:#5f9ea0;
    --ok:#2ea043; --text:#e6edf3; --muted:#9ba3af; --shadow:0 8px 30px rgba(0,0,0,.25)
  }
  *{box-sizing:border-box}
  html,body{height:100%}
  body{
    margin:0; background:var(--bg); color:var(--text); font:16px/1.4 system-ui,Segoe UI,Roboto,Arial;
    -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
    user-select:none
  }
  .wrap{
    max-width:1000px; margin:40px auto; padding:24px; background:#0f1522; border-radius:18px;
    box-shadow:var(--shadow)
  }
  h1{margin:0 0 8px; text-align:center; font-size:28px}
  .sub{color:var(--muted); text-align:center; margin-bottom:24px; font-size:14px}
  .hud{display:flex; justify-content:center; gap:18px; margin-bottom:14px}
  .badge{background:#101826; border:1px solid #1d2640; padding:8px 12px; border-radius:12px}
  .grid{
    display:grid; grid-template-columns: repeat(${COLS}, 1fr); gap:18px;
    width:min(880px, 90vw); margin:16px auto 8px;
  }
  .card{
    position:relative; border-radius:16px; cursor:pointer; height:0; padding-top:100%;
    background:var(--card); box-shadow:var(--shadow); transition:transform .12s ease, background .2s ease;
    outline:none; border:0;
  }
  .card:hover{ background:var(--card-hover); transform:translateY(-2px) }
  .card.is-flipped,.card.is-matched{background:var(--face); transform:none}
  .card.is-matched{ outline:2px solid var(--ok) }
  .card[aria-disabled="true"]{ pointer-events:none; filter:saturate(.85) }
  .card::before{
    content:'?'; position:absolute; inset:0; display:grid; place-items:center; font-size:28px; opacity:.9
  }
  .card.is-flipped::before, .card.is-matched::before{
    content:attr(data-value); font-size:14px; letter-spacing:.2px; opacity:1; color:#eaf6f7
  }
  .footer{display:flex; justify-content:center; gap:10px; margin-top:12px; color:var(--muted); font-size:12px}
  .modal{position:fixed; inset:0; display:none; place-items:center; background:rgba(0,0,0,.6); z-index:50}
  .modal.show{ display:grid }
  .modal-card{
    background:#0f1522; padding:24px; border-radius:16px; width:min(480px, 92vw); box-shadow:var(--shadow);
    text-align:center
  }
  .modal h2{margin:0 0 6px}
  .modal p{margin:4px 0 14px; color:var(--muted)}
  .btn{
    background:#1f6feb; color:white; border:0; padding:10px 14px; border-radius:12px; cursor:pointer; font-weight:600
  }
  .btn:hover{ filter:brightness(1.1) }
  ::selection{ background:transparent }
  img,svg{ pointer-events:none }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.innerHTML = `
    <h1>The Ultimate Pexeso</h1>
    <div class="sub">Otoč dvě karty. Shoda +1 bod, omyl −1 bod (min 0). Odhal všechny páry!</div>
    <div class="hud">
      <div class="badge">Your points: <strong id="score">0</strong></div>
      <div class="badge">Pairs found: <strong id="found">0</strong> / ${UNIQUE_VALUES.length}</div>
    </div>
    <div id="board" class="grid" aria-label="Pexeso board" role="grid"></div>
    <div class="footer">Made with Vanilla JS • No libraries</div>
    <div id="modal" class="modal" aria-hidden="true">
      <div class="modal-card">
        <h2>Hotovo!</h2>
        <p id="finalText">Skóre: 0</p>
        <button id="again" class="btn">Hrát znovu</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  document.addEventListener('contextmenu', (e) => e.preventDefault(), { capture:true });
  const boardEl = wrap.querySelector('#board');
  const scoreEl = wrap.querySelector('#score');
  const foundEl = wrap.querySelector('#found');
  const modalEl = wrap.querySelector('#modal');
  const finalTextEl = wrap.querySelector('#finalText');
  const againBtn = wrap.querySelector('#again');
  let first = null, second = null, lock = false, score = 0, matchedPairs = 0, deck = [];
  const updateHUD = () => {scoreEl.textContent = String(score);foundEl.textContent = String(matchedPairs);};
  const clampScoreMinusOne = () => {score = Math.max(0, score - 1);};
  const shuffle = (arr) => arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(p=>p[1]);
  const buildDeck = () => {deck = shuffle([...UNIQUE_VALUES, ...UNIQUE_VALUES]);};
  const createCard = (value, idx) => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.type = 'button';
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute('aria-label', 'Hidden card');
    btn.dataset.value = value;
    btn.addEventListener('click', () => onFlip(btn), { passive: true });
    return btn;
  };
  const renderBoard = () => {
    boardEl.innerHTML = '';
    const frag = document.createDocumentFragment();
    deck.forEach((val, i) => frag.appendChild(createCard(val, i)));
    boardEl.appendChild(frag);
  };
  const endGame = () => {
    finalTextEl.textContent = `Skóre: ${score} • Počet tahů (chyb) lze posoudit podle bodů. Dobrá práce!`;
    modalEl.classList.add('show');
    modalEl.setAttribute('aria-hidden', 'false');
  };
  const resetTurn = () => {first = null;second = null;lock = false;};
  const onFlip = (card) => {
    if (lock) return;
    if (card === first) return;
    if (card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;
    card.classList.add('is-flipped');
    if (!first) {first = card; return;}
    second = card; lock = true;
    const match = first.dataset.value === second.dataset.value;
    if (match) {
      score += 1; matchedPairs += 1;
      first.classList.add('is-matched');
      second.classList.add('is-matched');
      first.setAttribute('aria-disabled', 'true');
      second.setAttribute('aria-disabled', 'true');
      updateHUD(); resetTurn();
      if (matchedPairs === UNIQUE_VALUES.length) setTimeout(endGame, 300);
    } else {
      clampScoreMinusOne(); updateHUD();
      setTimeout(() => {
        first.classList.remove('is-flipped');
        second.classList.remove('is-flipped');
        resetTurn();
      }, 800);
    }
  };
  const restart = () => {
    score = 0; matchedPairs = 0; first = second = null; lock = false;
    updateHUD(); buildDeck(); renderBoard();
    modalEl.classList.remove('show'); modalEl.setAttribute('aria-hidden', 'true');
  };
  againBtn.addEventListener('click', restart);
  restart();
})();
