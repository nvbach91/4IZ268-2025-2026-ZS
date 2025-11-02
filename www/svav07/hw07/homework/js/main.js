/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

const pokemon = ['charizard', 'bulbasaur', 'squirtle', 
                 'pikachu', 'jigglypuff', 'meowth', 
                 'psyduck', 'snorlax', 'eevee', 
                 'magikarp', 'gengar', 'dragonite'];
const gameField = document.getElementById('game-field');
const pointsDisplay = document.getElementById('points');

let flippedCards = [];
let matchedPairs = 0;
let points = 0;
let isChecking = false;



function createGame() {
  const cards = pokemon.concat(pokemon);
  cards.sort(() => {
    return 0.5 - Math.random();
  });

  createCards(cards);
}

function createCards(cards) {
    cards.forEach((pokemonName, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-pokemon', pokemonName);
        card.setAttribute('data-index', index);

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        
        const pokemonImg = document.createElement('img');
        pokemonImg.src = `https://img.pokemondb.net/sprites/lets-go-pikachu-eevee/normal/2x/${pokemonName}.png`;
        pokemonImg.alt = pokemonName;

        const name = document.createElement('p');
        name.textContent = pokemonName;

        cardBack.appendChild(pokemonImg);
        cardBack.appendChild(name);

        card.appendChild(cardFront);
        card.appendChild(cardBack);

        card.addEventListener('click', flipCard);

        gameField.appendChild(card);
    });
}

function flipCard() {
    if (isChecking 
        || this.classList.contains('flipped') 
        || this.classList.contains('matched') 
        || flippedCards.length === 2) {
        return;
    }

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    isChecking = true;
    const [card1, card2] = flippedCards;
    const pokemon1 = card1.getAttribute('data-pokemon');
    const pokemon2 = card2.getAttribute('data-pokemon');

    if (pokemon1 === pokemon2) {
        points += 1;
        updateScore();

        card1.classList.add('matched');
        card2.classList.add('matched');

        matchedPairs++;
        flippedCards = [];
        isChecking = false;

        if (matchedPairs === pokemon.length) {
            setTimeout(() => {
                alert(`You WON! Your score: ${points} points`);
                resetGame();
            }, 500);
        }
    } else {
        points = Math.max(0, points - 1);
        updateScore();

        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isChecking = false;
        }, 800);
    }
}

function updateScore() {
    pointsDisplay.textContent = points;
}

createGame();