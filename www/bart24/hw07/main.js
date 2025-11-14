let cities = [
    'Praha', 'Ostrava', 'Olomouc', 'Brno', 'Liberec',
    'Hradec Králové', 'Ústí nad Labem', 'Pardubice', 'Havířov', 'Zlín'
];

cities = cities.concat(cities);
cities.sort(() => {
  return 0.5 - Math.random();
});

const gameField = document.getElementById('game-field');
const pointsDisplay = document.getElementById('points');

let points = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
const totalPairs = cities.length / 2;

function createBoard() {
    const fragment = document.createDocumentFragment();

    cities.forEach(city => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.city = city;
        card.innerText = city;
        card.addEventListener('click', flipCard);
        fragment.appendChild(card);
    });

    gameField.appendChild(fragment);
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('revealed');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;

    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.city === secondCard.dataset.city;

    if (isMatch) {
        handleMatch();
    } else {
        handleMismatch();
    }
}

function handleMatch() {
    points++;
    matchedPairs++;
    
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    updatePoints();
    resetTurn();
    checkGameEnd();
}

function handleMismatch() {
    points--;
    
    if (points < 0) {
        points = 0;
    }
    
    updatePoints();

    setTimeout(() => {
        firstCard.classList.remove('revealed');
        secondCard.classList.remove('revealed');
        
        resetTurn();
    }, 500);
}

function updatePoints() {
    pointsDisplay.innerText = points;
}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function checkGameEnd() {
    if (matchedPairs === totalPairs) {
        setTimeout(() => {
            alert(`Gratulujeme! Hra skončila.\nVaše celkové skóre je: ${points}`);
        }, 500);
    }
}

createBoard();