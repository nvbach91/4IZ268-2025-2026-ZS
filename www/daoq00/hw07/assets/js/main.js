/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

let cities = ['Barcelona', 'Prague', 'Madrid', 'Paris', 'Berlin', 'Tokyo', 'Stockholm', 'Austria', 'New York', 'Rome'];
cities = cities.concat(cities);
cities.sort(() => 0.5 - Math.random());

let points = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
const totalPairs = cities.length / 2;

const gameField = document.getElementById('game-field');
const pointsDisplay = document.getElementById('points');

const updatePoints = () => {
    pointsDisplay.textContent = points;
};

const unflipCards = () => {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('revealed');
        secondCard.classList.remove('revealed');
        resetBoard();
    }, 600);
};

const disableCards = () => {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchedPairs++;
    points++;
    updatePoints();
    checkGameOver();
    resetBoard();
};

const checkGameOver = () => {
    if (matchedPairs === totalPairs) {
        alert(`Tvoje celkové skóre je: ${points}`);
    }
};

const resetBoard = () => {
    [firstCard, secondCard, lockBoard] = [null, null, false];
};

function flipCard(event) {
    if (lockBoard) return;
    const clickedCard = event.currentTarget;
    if (clickedCard === firstCard || clickedCard.classList.contains('revealed')) return;
    clickedCard.classList.add('revealed');
    if (!firstCard) {
        firstCard = clickedCard;
        return;
    }

    secondCard = clickedCard;
    lockBoard = true;
    if (firstCard.textContent === secondCard.textContent) {
        disableCards();
    } else {
        unflipCards();
    }
};

const createCard = (cityName) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerText = cityName;
    card.addEventListener('click', flipCard);
    return card;
};

const initializeGame = () => {
    cities.forEach(cityName => {
        const cardElement = createCard(cityName);
        gameField.appendChild(cardElement);
    });
    updatePoints();
};

initializeGame();