console.log("Ahoj");
const field = document.getElementById("game-field");
const points = document.getElementById("points");

let firstCard = null;
let secondCard = null;
let boardLocked = false;
let pairs = 0;

let score = 0;
points.innerText = score;

let cities = ["Phoenix", "Sacramento", "Denver", "Atlanta", "Honolulu", "Austin", "Boston", "Nashville", "Madison", "Olympia"];
cities = cities.concat(cities);
cities.sort(() => Math.random() - 0.5);

cities.forEach(city => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerText = city;
    card.addEventListener("click", () => {
        if (boardLocked){
            return;
        }
        if (card.classList.contains("revealed")){
            return;
        }
        card.classList.add("revealed");
        if (firstCard === null){
            firstCard = card;
            console.log(firstCard.innerText);
            return;
        }
        if (secondCard === null && card !== firstCard) {
            secondCard = card;
            console.log(secondCard.innerText);
            if (firstCard.innerText === secondCard.innerText){
                console.log("match");
                firstCard = null;
                secondCard = null;
                score = score + 1;
                points.innerText = score;
                pairs = pairs + 1;
                if (pairs === cities.length/2){
                    alert("Game over! Score: " + score);
                }
            }else{
                console.log("wrong")
                boardLocked = true;
                setTimeout(() => {
                    firstCard.classList.remove("revealed");
                    secondCard.classList.remove("revealed");
                    firstCard = null;
                    secondCard = null;
                    if (score > 0){
                        score = score -1
                        points.innerText = score;
                    } 
                    boardLocked = false;
                }, 1000);
            }
            return;
        }
    });
    field.appendChild(card);
});