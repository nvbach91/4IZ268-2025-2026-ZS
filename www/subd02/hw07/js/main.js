const gameField = document.getElementById('game-field');
const score = document.getElementById('points');

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let points = 0;
let matchedPairs = 0;

const cityList = ['Prague', 'London', 'Paris', 'New York', 'Tokyo', 'Sydney',
    'Rome', 'Berlin', 'Dubai', 'Beijing'];
let cities = [];

function createCard() {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerText = '';
    card.addEventListener('click', () => handleCardClick(card));
    return card;
}

function handleCardClick(card) {
    if (lockBoard || card.classList.contains('matched') || card.classList.contains('flipped')) return;

    const index = Array.from(gameField.children).indexOf(card);
    const cityName = cities[index];

    card.classList.add('flipped');
    card.innerText = cityName;

    if (firstCard === null) {
        firstCard = index;
        return;
    }

    secondCard = index;
    lockBoard = true;

    if (cities[firstCard] === cities[secondCard]) {
        points++;
        matchedPairs++;
        score.textContent = points;

        gameField.children[firstCard].classList.add('matched');
        gameField.children[secondCard].classList.add('matched');

        resetTurn();
        checkGameEnd();
    } else {
        points = Math.max(0, points - 1);
        score.textContent = points;

        setTimeout(() => {
            gameField.children[firstCard].classList.remove('flipped');
            gameField.children[firstCard].innerText = '';
            gameField.children[secondCard].classList.remove('flipped');
            gameField.children[secondCard].innerText = '';
            resetTurn();
        }, 700);
    }
}

function resetTurn() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function checkGameEnd() {
    if (matchedPairs === cities.length / 2) {
        setTimeout(() => {
            const restart = confirm(`You won!\nScore: ${points}\n\nDo you want to play again?`);
            if (restart) initGame();
        }, 300);
    }
}

function initGame() {
    gameField.innerHTML = '';
    [firstCard, secondCard, lockBoard, points, matchedPairs] = [null, null, false, 0, 0];
    score.textContent = points;

    cities = cityList.concat(cityList);
    cities.sort(() => 0.5 - Math.random());

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < cities.length; i++) {
        fragment.appendChild(createCard());
    }
    gameField.appendChild(fragment);
}

initGame();
