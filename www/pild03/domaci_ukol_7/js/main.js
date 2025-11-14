(() => {
  const pointsEl = document.getElementById('points');
  const field = document.getElementById('game-field');

  const cities = [
    'Prague', 'London', 'Paris', 'Moscow', 'Rome',
    'Madrid', 'Berlin', 'Vienna', 'Sydney', 'Vancouver'
  ];

  // duplicate and shuffle
  let cards = cities.concat(cities);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  let firstCard = null;
  let secondCard = null;
  let lock = false;
  let points = 0;
  let matched = 0;
  const total = cards.length;

  function updatePoints(delta) {
    points = Math.max(0, points + delta);
    pointsEl.textContent = points;
  }

  function createCard(city) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.city = city;

    // BACK (visible when hidden)
    const back = document.createElement('div');
    back.className = 'card-face card-back';

    // FRONT (city name, visible when revealed)
    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.textContent = city;

    card.append(back, front);

    card.addEventListener('click', () => {
      if (lock || card.classList.contains('revealed')) return;
      card.classList.add('revealed');

      if (!firstCard) {
        firstCard = card;
        return;
      }

      secondCard = card;
      lock = true;

      const a = firstCard.dataset.city;
      const b = secondCard.dataset.city;

      if (a === b) {
        // match found
        setTimeout(() => {
          firstCard.classList.add('matched');
          secondCard.classList.add('matched');
          updatePoints(1);
          matched += 2;
          resetTurn();
          if (matched === total) showEndOverlay();
        }, 400);
      } else {
        // no match
        setTimeout(() => {
          firstCard.classList.remove('revealed');
          secondCard.classList.remove('revealed');
          updatePoints(-1);
          resetTurn();
        }, 1000);
      }
    });

    return card;
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lock = false;
  }

  // build game field
  const fragment = document.createDocumentFragment();
  cards.forEach(city => fragment.appendChild(createCard(city)));
  field.appendChild(fragment);

  // overlay for end of game
  function showEndOverlay() {
    let overlay = document.getElementById('end-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'end-overlay';
      overlay.innerHTML = `
        <div class="panel">
          <h3>🎉 Congratulations!</h3>
          <p id="final-score"></p>
          <button id="restart">Play again</button>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('#restart').addEventListener('click', () => location.reload());
    }
    overlay.querySelector('#final-score').textContent = `Your total points: ${points}`;
    overlay.style.display = 'flex';
  }
})();
