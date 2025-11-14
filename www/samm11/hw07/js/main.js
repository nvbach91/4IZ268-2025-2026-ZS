const board = document.querySelector('#game-field');
const points = document.querySelector('#points');
const info = document.querySelector('#info');
let counter = 0;
let guessCounter = 0;
points.textContent = String(counter);

let cards = [
    "Plzen",
    "Budvar",
    "Kozel",
    "Staropramen",
    "Gambrinus",
    "Bernard",
    "Svijany",
    "Radegast",
    "Kohout",
    "Branik"
];
cards = cards.concat(cards);
cards.sort(() => Math.random() - 0.5);

cards.forEach((card) => {
    const cardElement = document.createElement('div');
    cardElement.textContent = card;
    cardElement.className = 'card'
    cardElement.dataset.card = card;

    cardElement.addEventListener('animationend', () => {
        cardElement.classList.remove('shake');
    })
    cardElement.addEventListener('click', () => {
        const pickedCards = document.querySelectorAll('.card.picked');
        if (pickedCards.length >= 2 || cardElement.classList.contains('guessed') || cardElement === pickedCards[0]) {
            cardElement.classList.add('shake');
            return;
        }
        cardElement.classList.toggle('picked');
        if (pickedCards[0]) {
            if (cardElement.dataset.card === pickedCards[0].dataset.card) {
                pickedCards[0].classList.add('guessed');
                pickedCards[0].classList.remove('picked');
                cardElement.classList.add('guessed');
                cardElement.classList.remove('picked');

                counter += 1;
                guessCounter += 1;
                points.textContent = String(counter);
                if (guessCounter >= 10) {
                    info.innerHTML = "You've won, score: " + String(counter);
                }
            } else {
                setTimeout(() => {
                    pickedCards[0].classList.add('shake');
                    cardElement.classList.add('shake');
                }, 750);
                setTimeout(() => {
                    pickedCards[0].classList.toggle('picked');
                    cardElement.classList.toggle('picked');
                }, 1500);
                counter = Math.max(counter - 1, 0);
                points.textContent = String(counter);
            }
        }
    })

    board.appendChild(cardElement);
})
