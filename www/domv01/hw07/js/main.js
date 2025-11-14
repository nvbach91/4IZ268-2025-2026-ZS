const gameFiled = document.querySelector("#game-field");
const points = document.querySelector("#points");

const cities = [
  { name: "Praha", id: 1 },
  { name: "Košice", id: 2 },
  { name: "Bratislava", id: 3 },
  { name: "Plzeň", id: 4 },
  { name: "Karlovy Vary", id: 5 },
  { name: "Havířov", id: 6 },
  { name: "Tábor", id: 7 },
  { name: "Písek", id: 8 },
  { name: "Miličín", id: 9 },
  { name: "Brdy", id: 10 },
];

const shuffledCities = [...cities, ...cities].sort(() => Math.random() - 0.5);

let isLocked = false;
let pointsCount = 0;

const checkMatch = () => {
  const [firstCard, secCard] = document.querySelectorAll(".revealed");
  if (!secCard) return;

  isLocked = true;
  const isMatch = firstCard.dataset.city === secCard.dataset.city;

  setTimeout(() => {
    firstCard.classList.remove("revealed");
    secCard.classList.remove("revealed");

    if (isMatch) {
      firstCard.classList.add("matched");
      secCard.classList.add("matched");
      points.textContent =
        ++pointsCount === cities.length ? "You have won!" : pointsCount;
    } else {
      firstCard.innerHTML = secCard.innerHTML = "";
    }
    isLocked = false;
  }, 1000);
};

shuffledCities.forEach((city) => {
  const card = document.createElement("div");
  card.dataset.city = city.id;
  card.classList.add("card");
  card.addEventListener("click", () => {
    if (
      isLocked ||
      card.classList.contains("revealed") ||
      card.classList.contains("matched")
    )
      return;
    card.classList.add("revealed");
    card.innerHTML = city.name;
    checkMatch();
  });
  gameFiled.append(card);
});
