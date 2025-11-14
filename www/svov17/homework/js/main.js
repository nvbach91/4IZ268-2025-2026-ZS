const pokemon = ['Pikachu','Bulbasaur','Charmander','Squirtle','Eevee',
'Snorlax','Mewtwo','Jigglypuff','Psyduck','Gengar']

let cards = pokemon.concat(pokemon)
cards.sort(() => 0.5 - Math.random())

const board = document.getElementById('game-board')
const scoreEl = document.getElementById('score')
let firstCard = null
let secondCard = null
let score = 0
let locked = false
let matchedPairs = 0

function makeCard(name) {
  const card = document.createElement('div')
  card.classList.add('card')
  card.dataset.name = name
  card.innerText = name
  card.addEventListener('click', () => flipCard(card))
  board.appendChild(card)
}

cards.forEach(name => makeCard(name))

function flipCard(card) {
  if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return
  card.classList.add('flipped')

  if (!firstCard) {
    firstCard = card
    return
  }

  secondCard = card
  locked = true

  if (firstCard.dataset.name === secondCard.dataset.name) {
    firstCard.classList.add('matched')
    secondCard.classList.add('matched')
    score++
    matchedPairs += 2
    resetTurn()
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped')
      secondCard.classList.remove('flipped')
      if (score > 0) score--
      resetTurn()
    }, 1000)
  }

  scoreEl.innerText = `Score: ${score}`

  if (matchedPairs === cards.length) {
    setTimeout(() => alert(`You win! Final score: ${score}`), 500)
  }
}

function resetTurn() {
  firstCard = null
  secondCard = null
  locked = false
}
document.getElementById('reset').addEventListener('click', resetGame)

function resetGame() {
  board.innerHTML = ''
  score = 0
  matchedPairs = 0
  scoreEl.innerText = `Score: ${score}`
  firstCard = null
  secondCard = null
  locked = false
  cards.sort(() => 0.5 - Math.random())
  cards.forEach(name => makeCard(name))
}
