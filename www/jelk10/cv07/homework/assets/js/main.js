const createBoard = (citiese) => {
    let cities = citiese.concat(citiese);
    cities.sort(() => 0.5 - Math.random());

    if (cities.length < 10) {
        return new Error('Cannot create board due to small number of cities provided, provide at least 10 cities.');
    }

    let itemsInRow = 0;
    const rows = [];
    let row = document.createElement('div');
    row.classList.add('flex-row');
    let cardId = 0

    for (const cit of cities) {

        if (itemsInRow === 5) {
            rows.push(row);
            row = document.createElement('div');
            row.classList.add('flex-row');
            itemsInRow = 0;
        }

        const card = document.createElement('div');
        card.classList.add('card-hidden', 'card');
        card.innerHTML = `<p>${cit}</p>`;
        card.id = 'card' + cardId
        cardId++;
        card.addEventListener('click', () => {
            onCardClick(card.id);
        })
        row.appendChild(card);

        itemsInRow++;
    }

    if (itemsInRow > 0) {
        rows.push(row);
    }

    return rows;
};

const pointsDiv = document.createElement('div')
pointsDiv.id = 'points'
pointsDiv.innerHTML = `<p>Points gained: 0</p>`
const boardDiv = document.createElement('div')
boardDiv.id = 'board'
boardDiv.append(...createBoard([
    'Prague',
    'Mardid',
    'Barcelona',
    'Paris',
    'Krakow',
    'Berlin',
    'Zurich',
    'London',
    'Dublin',
    'Bergen'
]))
document.querySelector('body').append(pointsDiv, boardDiv)


let firstCard = {
    cardId: null,
    text: null
};
let secondCard = {
    cardId: null,
    text: null
};
let points = 0;

let alreadyGuessed = []

const onCardClick = (cardId) => {
    const card = document.querySelector(`#${cardId}`)
    card.classList.remove('card-hidden')
    if (firstCard.cardId == null) {
        firstCard.cardId = cardId;
        firstCard.text = card.textContent;
        card.classList.remove('card-hidden')

    } else if (secondCard.cardId == null && firstCard.cardId !== cardId) {
        secondCard.cardId = cardId;
        secondCard.text = card.textContent;
        card.classList.remove('card-hidden')
    }
    if (firstCard.cardId && secondCard.cardId) {
        const first = document.querySelector(`#${firstCard.cardId}`)
        const second = document.querySelector(`#${secondCard.cardId}`)
        console.log(firstCard.text, secondCard.text)
        if (firstCard.text == secondCard.text) {
            if (!isAlreadyGuessed(firstCard.text) || alreadyGuessed.length == 0) {
                points++;
            }
            alreadyGuessed.push(firstCard.text)
            const pointsField = document.querySelector('#points')
            pointsField.innerHTML = `<p>Points gained: ${points}</p>`
            first.classList.add('guessed')
            second.classList.add('guessed')
            firstCard.cardId = null
            firstCard.text = null
            secondCard.cardId = null
            secondCard.text = null
        } else {
            document.body.style.pointerEvents = 'none';
            setTimeout(() => {
                if (points > 0) {
                    points--;
                    const pointsField = document.querySelector('#points')
                    pointsField.innerHTML = `<p>Points gained: ${points}</p>`
                }

                first.classList.add('card-hidden');
                second.classList.add('card-hidden');
                firstCard.cardId = null;
                firstCard.text = null;
                secondCard.cardId = null;
                secondCard.text = null;
                document.body.style.pointerEvents = 'auto';
            }, 2000);
        }
    }
}

const isAlreadyGuessed = (city) => {
    for (i of alreadyGuessed) {
        if (i === city) {
            return true
        }
    }
    return false
}