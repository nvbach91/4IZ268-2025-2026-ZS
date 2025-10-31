// main.js - jednoduché pexeso (20 karet, 5x4)
(() => {
  const cities = [
    'Prague','London','Paris','Moscow','Tokyo',
    'Sydney','Vancouver','LosAngeles','Barcelona','Rome'
  ]; // 10 unikátních -> 20 karet

  const pointsEl = document.getElementById('points');
  const field = document.getElementById('game-field');

  let deck = cities.concat(cities); // duplikace
  deck.sort(() => 0.5 - Math.random()); // zamíchání

  const totalCards = deck.length;
  let firstCard = null;
  let secondCard = null;
  let lock = false; // zamyká herní tah, když jsou 2 karty otočeny
  let score = 0;
  let matchedCount = 0;

  function updateScore(delta) {
    score = Math.max(0, score + delta);
    pointsEl.textContent = score;
  }

  function createCard(name, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.city = name;
    card.dataset.index = index;

    // vnořená struktura: .front (skryté), .back (viditelné při odhalení)
    const back = document.createElement('div');
    back.className = 'back';
    back.textContent = ''; // designově prázdný - může být ikona

    const front = document.createElement('div');
    front.className = 'front';
    front.textContent = name; // název města je v přední části karty

    card.appendChild(back);
    card.appendChild(front);

    card.addEventListener('click', () => onCardClick(card));
    return card;
  }

  function onCardClick(card) {
    if (lock) return;
    if (card.classList.contains('matched')) return;
    if (card === firstCard) return; // zabránit dvojkliku na stejnou kartu

    revealCard(card);

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lock = true;

    // porovnání
    const a = firstCard.dataset.city;
    const b = secondCard.dataset.city;
    if (a === b) {
      // shoda
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');

      // necháme karty odhalené
      matchedCount += 2;
      updateScore(1);

      // uvolnit okamžitě
      resetTurn();

      // konec hry?
      if (matchedCount === totalCards) {
        setTimeout(() => {
          alert(`Gratuluju — hra skončila! Celkové body: ${score}`);
        }, 200);
      }
    } else {
      // neshoda -> -1 bod (ale ne pod 0), po krátké době otočíme zpět
      updateScore(-1);
      setTimeout(() => {
        hideCard(firstCard);
        hideCard(secondCard);
        resetTurn();
      }, 1000);
    }
  }

  function revealCard(card) {
    card.classList.add('revealed');
  }

  function hideCard(card) {
    card.classList.remove('revealed');
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lock = false;
  }

  // vytvořit všech 20 karet a vložit do DOM jedním passem (fragment)
  function buildBoard() {
    const frag = document.createDocumentFragment();
    deck.forEach((city, i) => {
      frag.appendChild(createCard(city, i));
    });
    field.innerHTML = ''; // vyčistit případné staré
    field.appendChild(frag);
  }

  // inicializace
  function init() {
    updateScore(0);
    buildBoard();
  }

  // start
  init();
})();
