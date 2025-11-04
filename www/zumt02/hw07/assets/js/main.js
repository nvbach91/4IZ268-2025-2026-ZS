/**
 * Memorama, Match Match, Match Up, Memory, Pelmanism, Shinkei-suijaku, Pexeso or simply Pairs
 */

let cities = ['Prague', 'London', 'Paris', 'Moscow', 'Los Angeles', 'Tokyo', 'Beijing', 'Sydney', 'New York', 'Berlin'];
cities = cities.concat(cities);
cities.sort(() => {
  return 0.5 - Math.random();
});

const gameField = document.querySelector("#game-field");
const points = document.querySelector("#points");
let nRevealed = 0;

let firstGuess = null;
let secondGuess = null;
for (const city of cities) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerText = city;
  card.addEventListener("click", async () => {
    if (!card.classList.contains("revealed")) {
      card.classList.add("revealed");
      if (firstGuess === null) {
        firstGuess = card;
      } else if (secondGuess === null) {
        secondGuess = card;
        if (secondGuess.innerText === firstGuess.innerText) {
          points.innerText++;
          nRevealed++;
          if (nRevealed * 2 == cities.length) {
            await new Promise(resolve => {
              setTimeout(() => {
                alert(`Congratulations! You have completed the game with ${points.innerText} points.`);
                resolve();
              }, 1000);
            });
          }
        } else {
          if (points.innerText > 0) {
            points.innerText--;
          }
          await new Promise(resolve => {
            setTimeout(() => {
              firstGuess.classList.remove("revealed");
              secondGuess.classList.remove("revealed");
              resolve();
            }, 1000);
          });
        }
        firstGuess = null;
        secondGuess = null;
      }
    }
  });
  gameField.appendChild(card);
}