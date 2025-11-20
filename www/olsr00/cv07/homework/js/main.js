/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */
const cityList = ['Prague', 'London', 'Paris', 'Prešov', 'California', 'Vancouver', 'Sydney', 'Tokyo', 'Barcelona', 'Madrid'];
let cities = cityList.concat(cityList);
cities.sort(() => 0.5 - Math.random());

const gameField = document.getElementById('game-field');
const pointsEl = document.getElementById('points');

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let score = 0;
let matchedCount = 0;
const totalCards = cities.length;

function createCard(name, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.city = name;
    card.dataset.index = index;
    const label = document.createElement('div');
    label.className = 'label';
    label.innerText = name;
    card.appendChild(label);
    card.addEventListener('click', onCardClick);
    return card;
}

function onCardClick(e) {
    const card = e.currentTarget;
    if (lockBoard) return;
    if (card === firstCard) return;
    if (card.classList.contains('revealed')) return;
    card.classList.add('revealed');
    if (!firstCard) {
        firstCard = card;
        return;
    }
    secondCard = card;
    lockBoard = true;
    if (firstCard.dataset.city === secondCard.dataset.city) {
        matchedCount += 2;
        score += 1;
        pointsEl.innerText = score;
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        resetTurn();
        if (matchedCount === totalCards) {
            setTimeout(() => {
                alert('Your Final score: ' + score);
            }, 200);
        }
    } else {
        score = Math.max(0, score - 1);
        pointsEl.innerText = score;
        setTimeout(() => {
            firstCard.classList.remove('revealed');
            secondCard.classList.remove('revealed');
            resetTurn();
        }, 2000);
    }
}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}


function init() {
    const fragment = document.createDocumentFragment();
    cities.forEach((name, idx) => {
        const card = createCard(name, idx);
        fragment.appendChild(card);
    });
    gameField.appendChild(fragment);
}

init();