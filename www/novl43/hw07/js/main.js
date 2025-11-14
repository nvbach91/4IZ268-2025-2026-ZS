// Pexeso - Vanilla JS implementation
(function () {
	const cities = [
		'Prague','London','Paris','Moscow','California','Vancouver','Sydney','Tokyo','Berlin','Rome',
		'Madrid','Lisbon','Toronto','Dublin','Cairo','Beijing','Bangkok','Seoul','Istanbul','Dubai'
	];

	// Ensure we have even number and at least 20 cards: we'll use exactly 20 (10 pairs)
	const PAIRS = 10;
	const pointsEl = document.getElementById('points');
	const field = document.getElementById('game-field');

	let points = 0;
	let firstCard = null;
	let secondCard = null;
	let busy = false;
	let matches = 0;

	function setPoints(v) {
		points = Math.max(0, v);
		pointsEl.textContent = points;
	}

	function shuffle(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	function createDeck() {
		// pick first PAIRS cities and duplicate
		const selected = cities.slice(0, PAIRS);
		const deck = selected.concat(selected).map((name, idx) => ({ id: idx + '-' + name, name }));
		return shuffle(deck);
	}

		function createCard(item) {
			const wrapper = document.createElement('div');
			wrapper.className = 'card';
			wrapper.dataset.name = item.name;
			wrapper.tabIndex = 0;

			const inner = document.createElement('div');
			inner.className = 'card-inner';

			const front = document.createElement('div');
			front.className = 'card-face card-front';
			front.textContent = '';

			const back = document.createElement('div');
			back.className = 'card-face card-back';
			back.textContent = item.name;

			inner.appendChild(front);
			inner.appendChild(back);
			wrapper.appendChild(inner);

			wrapper.addEventListener('click', () => onCardClick(wrapper));
			wrapper.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(wrapper); }
			});

			return wrapper;
		}

		function reveal(card) {
			card.classList.add('flipped');
			card.classList.add('disabled');
		}

		function hide(card) {
			card.classList.remove('flipped');
			card.classList.remove('disabled');
		}

		function markMatched(card) {
			card.classList.add('matched');
			card.classList.remove('disabled');
			// keep flipped state so back is visible
			card.classList.add('flipped');
		}

	function onCardClick(card) {
		if (busy) return;
		if (card === firstCard) return; // clicking same card
		if (card.classList.contains('revealed') || card.classList.contains('matched')) return;

		reveal(card);

		if (!firstCard) {
			firstCard = card;
			return;
		}

		secondCard = card;
		busy = true;

		// Check match
		if (firstCard.dataset.name === secondCard.dataset.name) {
			// matched
			markMatched(firstCard);
			markMatched(secondCard);
			setPoints(points + 1);
			matches += 1;
			resetTurn();
			// check end
			if (matches === PAIRS) showEnd();
		} else {
			// mismatch: subtract point (not below zero) and hide after short delay
			setPoints(points - 1);
			setTimeout(() => {
				hide(firstCard);
				hide(secondCard);
				resetTurn();
			}, 700);
		}
	}

	function resetTurn() {
		firstCard = null;
		secondCard = null;
		busy = false;
	}

	function showEnd() {
		const overlay = document.createElement('div');
		overlay.className = 'overlay';
		const box = document.createElement('div');
		box.className = 'box';
		box.innerHTML = `<h2>Game finished</h2><p>Your total points: <strong>${points}</strong></p>`;
		const btn = document.createElement('button');
		btn.textContent = 'Play again';
		btn.addEventListener('click', () => {
			document.body.removeChild(overlay);
			startGame();
		});
		box.appendChild(btn);
		overlay.appendChild(box);
		document.body.appendChild(overlay);
	}

	function startGame() {
		// reset state
		field.innerHTML = '';
		setPoints(0);
		firstCard = null; secondCard = null; busy = false; matches = 0;

		const deck = createDeck();
		deck.forEach(item => field.appendChild(createCard(item)));
	}

	// Initialize on DOM ready
	document.addEventListener('DOMContentLoaded', startGame, { once: true });
})();

