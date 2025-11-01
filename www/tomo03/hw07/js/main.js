/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

let pokemons = ['Bulbasaur', 'Charmander', 'Squirtle', 'Caterpie', 'Weedle', 'Pidgey', 'Rattata', 'Spearow', 'Ekans', 'Pikachu'];
let firstCard = null
let blockClick = false

pokemons = pokemons.concat(pokemons);
pokemons.sort(() => {
  return 0.5 - Math.random();
});

let points = 0

/* DOM Elements */
const pointsEl = document.getElementById('points')
const gameFieldEl = document.getElementById('game-field')


/* Helper functions */
const revealCard = (card) => {
    card.textContent = card.dataset.value
    card.classList.add('revealed')
}

const closeCard = (card) => {
    card.textContent = ''
    card.classList.remove('revealed')
}

const handleClick = (card) => {
    if (card.classList.contains('revealed') || blockClick) return
    revealCard(card)
    if (firstCard) {
        /* defining copy of firstCard to handle delayed closing of
        the firstCard while setting it to null */
        const firstCardCopy = firstCard
    
        if (firstCard.dataset.value === card.dataset.value) {
            points++
        } else {
            if (points > 0) {points--}
            blockClick = true
            setTimeout(() => {
                closeCard(firstCardCopy)
                closeCard(card)
                blockClick= false
            }, 1500)
        }
        firstCard = null
        renderPoints()
        
    } else {
        firstCard = card
    }
}

const renderPoints = () => {
    pointsEl.textContent = points
}

/* Card rendering */
const renderCards = (cardList) => {
    gameFieldEl.innerHTML = cardList.map((cardValue, index) => `
        <div id="card-${index}" data-value="${cardValue}" class="card"></div>
    `).join('')
    const cardElements = document.querySelectorAll('.card')
    cardElements.forEach(card => {
        card.addEventListener('click', () => handleClick(card))
    })
}

renderCards(pokemons)


