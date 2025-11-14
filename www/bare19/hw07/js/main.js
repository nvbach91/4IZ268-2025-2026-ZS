/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

let pokemons = ['Pikachu','Squirtle','Bulbasaur','Eevee','Ninetales','Lapras','Vaporeon','Raichu','Butterfree','Charizard'];

pokemons = pokemons.concat(pokemons);      
pokemons.sort(() => 0.5 - Math.random());

const gameField = document.getElementById('game-field');


let pointsElement = document.getElementById('points');
if (!pointsElement) {
    pointsElement = document.createElement('div');
    pointsElement.id = 'points';
    pointsElement.style.marginTop = '10px';
    document.body.insertBefore(pointsElement, gameField);
}

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let points = 0;
let matchedPairs = 0;
const totalPairs = pokemons.length / 2;

function updatePoints() {
    pointsElement.textContent = 'Body: ' + points;
}
updatePoints();

function createCard(pokemonName) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.pokemon = pokemonName;
    card.textContent = pokemonName;
    card.addEventListener('click', () => {
        handleCardClick(card);
    });

    return card;
}

function handleCardClick(card) {
    if (lockBoard) return;
    if (card.classList.contains('revealed')) return;
    if (firstCard === card) return;

    card.classList.add('revealed');

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lockBoard = true;
    checkForMatch();
}

function checkForMatch() {
    const pokemon1 = firstCard.dataset.pokemon;
    const pokemon2 = secondCard.dataset.pokemon;

    if (pokemon1 === pokemon2) {
        points += 1;
        matchedPairs += 1;
        updatePoints();
        resetTurn();

        if (matchedPairs === totalPairs) {
            setTimeout(() => {
                alert('Konec hry! Získal jsi ' + points + ' bodů.');
            }, 200);
        }
    } else {
        if (points > 0) points -= 1;
        updatePoints();

        setTimeout(() => {
            firstCard.classList.remove('revealed');
            secondCard.classList.remove('revealed');
            resetTurn();
        }, 800);
    }
}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

const fragment = document.createDocumentFragment();
pokemons.forEach(pokemon => {
    const cardElement = createCard(pokemon);
    fragment.appendChild(cardElement);
});
gameField.appendChild(fragment);
