
const plants = [
    "Rose", "Tulip", "Lily", "Daisy", "Orchid",
    "Iris", "Violet", "Peony", "Fern", "Cactus"
];


const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const newGameBtn = document.getElementById('new-game');

let deck = [];
let firstCard = null;
let secondCard = null;
let lock = false;
let score = 0;
let matchedCount = 0;

function shuffle(array) {
    return array.slice().sort(() => Math.random() - 0.5);
}

function createDeck() {
    const doubled = [...plants, ...plants];
    deck = shuffle(doubled);
}

function renderBoard() {
    board.innerHTML = '';
    deck.forEach((name, idx) => {
        const card = document.createElement('button');
        card.className = 'card hidden';
        card.type = 'button';
        card.dataset.name = name;
        card.dataset.index = idx;
        card.setAttribute('aria-label', 'skrytá karta');
        card.addEventListener('click', onCardClick);
        board.appendChild(card);
    });
}

function updateScore() {
    scoreEl.textContent = 'Score: ' + score;
}

function onCardClick(e) {
    if (lock) return;
    const card = e.currentTarget;
    if (card.classList.contains('revealed') || card.classList.contains('matched')) return;

    revealCard(card);

    if (!firstCard) {
        firstCard = card;
        return;
    }

    if (firstCard === card) return;

    secondCard = card;
    lock = true;

    setTimeout(() => {
        checkMatch();
        lock = false;
    }, 2000);
}

function revealCard(card) {
    card.classList.remove('hidden');
    card.classList.add('revealed');
    card.textContent = card.dataset.name;
    card.setAttribute('aria-label', card.dataset.name);
}

function hideCard(card) {
    card.classList.remove('revealed');
    card.classList.add('hidden');
    card.textContent = '';
    card.setAttribute('aria-label', 'skrytá karta');
}

function matchCard(card) {
    card.classList.remove('revealed');
    card.classList.add('matched');

}

function checkMatch() {
    if (!firstCard || !secondCard) return;

    if (firstCard.dataset.name === secondCard.dataset.name) {

        matchCard(firstCard);
        matchCard(secondCard);
        score += 1;
        matchedCount += 2;
    } else {

        hideCard(firstCard);
        hideCard(secondCard);
        if (score > 0) score -= 1;
    }

    updateScore();
    firstCard = null;
    secondCard = null;

    if (matchedCount === deck.length) {
        setTimeout(() => {
            alert('Konec hry! Vaše skóre: ' + score);
        }, 200);
    }
}

function startGame() {
    createDeck();
    renderBoard();
    score = 0;
    matchedCount = 0;
    firstCard = null;
    secondCard = null;
    lock = false;
    updateScore();
}

newGameBtn.addEventListener('click', startGame);

startGame();
