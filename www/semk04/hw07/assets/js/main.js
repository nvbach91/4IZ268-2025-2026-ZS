/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

document.addEventListener('DOMContentLoaded', () => {

  const gameField = document.getElementById('game-field');
  const pointsDisplay = document.getElementById('points');

  let cities = ['Prague', 'London', 'Milan','Barcelona','Budapest','Paris','Los Angeles','New York','Athens','Edinburg']
  cities = cities.concat(cities);
  cities.sort(() => {
    return 0.5 - Math.random();
  });

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let points = 0;
  let revealedCount = 0;

  function updatePointsDisplay() {
    pointsDisplay.textContent = points;
  }

  function createCard(name) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = name;
    card.dataset.name = name;

  card.addEventListener('click', () => {
    if (lockBoard || card.classList.contains('revealed')) return;

    card.classList.add('revealed');

    if (!firstCard) {
      firstCard = card;
    } else {
      secondCard = card;
      lockBoard = true;

      if (firstCard.dataset.name === secondCard.dataset.name) {
        points++;
        revealedCount += 2;
        updatePointsDisplay();
        resetTurn();

        if (revealedCount === cities.length) {
          setTimeout(() => {
            alert(`Win win! Your final score is ${points}`);
          }, 500);
        }
      } else {
        points = Math.max(0, points - 1);
        updatePointsDisplay();

        setTimeout(() => {
          firstCard.classList.remove('revealed');
          secondCard.classList.remove('revealed');
          resetTurn();
        }, 1000);
      }
    }
  });

  return card;
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }

  function initGame() {
    const fragment = document.createDocumentFragment();
    cities.forEach(city => {
      const card = createCard(city);
      fragment.appendChild(card);
    });
    gameField.appendChild(fragment);
  }

  initGame();




})

