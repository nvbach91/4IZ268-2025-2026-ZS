console.log("Ahoj světe!");

const tasksDiv = document.getElementById("tasks");
const resultsDiv = document.getElementById("results");

const pepeButton = document.getElementById("pepeButton");
const celsiusToFahrenheitButton = document.getElementById("cToF");
const fahrenheitToCelsiusButton = document.getElementById("fToC");

pepeButton.addEventListener("click", () => {
  const birthYear = 2005;
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  console.log(`Pepe is ${age} years old.`);
});

celsiusToFahrenheitButton.addEventListener("click", () => {
  const celsius = 20;
  const fahrenheit = (celsius * 9 / 5) + 32;
  console.log(`${celsius}°C is equal to ${fahrenheit.toFixed(2)}°F.`);
});

fahrenheitToCelsiusButton.addEventListener("click", () => {
  const fahrenheit = 68;
  const celsius = (fahrenheit - 32) * 5 / 9;
  console.log(`${fahrenheit}°F is equal to ${celsius.toFixed(2)}°C.`);
});

function getPepesAge(birthYear) {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  resultsDiv.innerHTML += `<p>Pepe is ${age} years old.</p>`;
}

function celsiusToFahrenheit(celsius) {
  const fahrenheit = (celsius * 9) / 5 + 32;
  resultsDiv.innerHTML += `<p>${celsius}°C = ${fahrenheit.toFixed(2)}°F</p>`;
}

function fahrenheitToCelsius(fahrenheit) {
  const celsius = ((fahrenheit - 32) * 5) / 9;
  resultsDiv.innerHTML += `<p>${fahrenheit}°F = ${celsius.toFixed(2)}°C</p>`;
}

function percentage(a, b) {
  if (b === 0) {
    resultsDiv.innerHTML += `<p>Error: Division by zero is not allowed.</p>`;
    return null;
  }
  const result = `${a} is ${((a / b) * 100).toFixed(2)}% of ${b}`;
  resultsDiv.innerHTML += `<p>${result}</p>`;
  return result;
}

function compareNumbers(a, b) {
  if (a > b) {
    resultsDiv.innerHTML += `<p>${a.toFixed(2)} is bigger than ${b.toFixed(2)}</p>`;
  } else if (a < b) {
    resultsDiv.innerHTML += `<p>${a.toFixed(2)} is smaller than ${b.toFixed(2)}</p>`;
  } else {
    resultsDiv.innerHTML += `<p>${a.toFixed(2)} is equal to ${b.toFixed(2)}</p>`;
  }
}

function multiplesOf13() {
  resultsDiv.innerHTML = "";
  let numbers = [];
  for (let i = 0; i <= 730; i += 13) {
    numbers.push(i);
  }
  resultsDiv.innerHTML += `<p>${numbers.join(", ")}</p>`;
}

function circleArea(radius) {
  if (radius < 0) {
    resultsDiv.innerHTML += `<p>Error: Radius cannot be negative.</p>`;
    return;
  }
  const area = Math.PI * radius * radius;
  resultsDiv.innerHTML += `<p>Radius: ${radius}, Circle area: ${area.toFixed(2)}</p>`;
}

function coneVolume(radius, height) {
  if (radius < 0 || height < 0) {
    resultsDiv.innerHTML += `<p>Error: Radius and height must be non-negative.</p>`;
    return;
  }
  const volume = (1 / 3) * Math.PI * radius * radius * height;
  resultsDiv.innerHTML += `<p>Radius: ${radius}, Height: ${height}, Cone volume: ${volume.toFixed(2)}</p>`;
}

function isTriangle(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) {
    resultsDiv.innerHTML += `<p>Sides: a=${a}, b=${b}, c=${c} → Error: sides must be positive</p>`;
    return false;
  }
  if (a + b > c && a + c > b && b + c > a) {
    resultsDiv.innerHTML += `<p>Sides: a=${a}, b=${b}, c=${c} → Yes, a triangle can be formed</p>`;
    return true;
  } else {
    resultsDiv.innerHTML += `<p>Sides: a=${a}, b=${b}, c=${c} → No, a triangle can not be formed</p>`;
    return false;
  }
}

function triangleAreaHeron(a, b, c) {
  function isTriangleLocal(a, b, c) {
    return a > 0 && b > 0 && c > 0 && a + b > c && a + c > b && b + c > a;
  }
  if (!isTriangleLocal(a, b, c)) {
    resultsDiv.innerHTML += `<p>Sides: a=${a}, b=${b}, c=${c} → Invalid triangle, calculation cannot be performed.</p>`;
    return;
  }
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  resultsDiv.innerHTML += `<p>Sides: a=${a}, b=${b}, c=${c} → Triangle area: ${area.toFixed(2)}</p>`;
}


const buttonTask1 = document.createElement("button");
buttonTask1.innerText = "Task 1 (Pepe's Age)";
buttonTask1.id = "task1";
buttonTask1.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  getPepesAge(2005);
  getPepesAge(2010);
  getPepesAge(1995);
});
tasksDiv.appendChild(buttonTask1);

const buttonTask2 = document.createElement("button");
buttonTask2.innerText = "Task 2 (Celsius → Fahrenheit)";
buttonTask2.id = "task2";
buttonTask2.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  celsiusToFahrenheit(20);
  celsiusToFahrenheit(0);
  celsiusToFahrenheit(37);
});
tasksDiv.appendChild(buttonTask2);

const buttonTask3 = document.createElement("button");
buttonTask3.innerText = "Task 3 (Fahrenheit → Celsius)";
buttonTask3.id = "task3";
buttonTask3.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  fahrenheitToCelsius(68);
  fahrenheitToCelsius(32);
  fahrenheitToCelsius(100);
});
tasksDiv.appendChild(buttonTask3);

const buttonTask4 = document.createElement("button");
buttonTask4.innerText = "Task 4 (Percentage Calculation)";
buttonTask4.id = "task4";
buttonTask4.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  percentage(48, 174);
  percentage(23, 0);
  percentage(5, 20);
});
tasksDiv.appendChild(buttonTask4);

const buttonIntegers = document.createElement("button");
buttonIntegers.innerText = "Integer Comparison";
buttonIntegers.id = "taskIntegers";
buttonIntegers.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  compareNumbers(10, 5);
  compareNumbers(7, 7);
  compareNumbers(-3, -7);
});
tasksDiv.appendChild(buttonIntegers);

const buttonDecimals = document.createElement("button");
buttonDecimals.innerText = "Decimal Comparison";
buttonDecimals.id = "taskDecimals";
buttonDecimals.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  compareNumbers(3.14, 2.71);
  compareNumbers(1.5, 1.75);
});
tasksDiv.appendChild(buttonDecimals);

const buttonFractions = document.createElement("button");
buttonFractions.innerText = "Fraction Comparison";
buttonFractions.id = "taskFractions";
buttonFractions.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  compareNumbers(1 / 2, 0.25);
  compareNumbers(3 / 4, 2 / 3);
});
tasksDiv.appendChild(buttonFractions);

const buttonNegatives = document.createElement("button");
buttonNegatives.innerText = "Negative Number Comparison";
buttonNegatives.id = "taskNegatives";
buttonNegatives.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  compareNumbers(-1, -5);
  compareNumbers(-3.5, -3.2);
});
tasksDiv.appendChild(buttonNegatives);

const buttonTask6 = document.createElement("button");
buttonTask6.innerText = "Task 6 (Multiples of 13)";
buttonTask6.id = "task6";
buttonTask6.addEventListener("click", multiplesOf13);
tasksDiv.appendChild(buttonTask6);

const buttonTask7 = document.createElement("button");
buttonTask7.innerText = "Task 7 (Circle Area Calculation)";
buttonTask7.id = "task7";
buttonTask7.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  circleArea(5);
  circleArea(2.5);
  circleArea(0);
  circleArea(-3);
});
tasksDiv.appendChild(buttonTask7);

const buttonTask8 = document.createElement("button");
buttonTask8.innerText = "Task 8 (Cone Volume Calculation)";
buttonTask8.id = "task8";
buttonTask8.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  coneVolume(3, 5);
  coneVolume(2.5, 4.2);
  coneVolume(0, 5);
  coneVolume(-1, 3);
});
tasksDiv.appendChild(buttonTask8);

const buttonTask9 = document.createElement("button");
buttonTask9.innerText = "Task 9 (Triangle Validity Check)";
buttonTask9.id = "task9";
buttonTask9.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  isTriangle(3, 4, 5);
  isTriangle(1, 2, 3);
  isTriangle(5, 5, 5);
  isTriangle(-1, 2, 2);
});
tasksDiv.appendChild(buttonTask9);

const buttonTask10 = document.createElement("button");
buttonTask10.innerText = "Task 10 (Heron's formula)";
buttonTask10.id = "task10";
buttonTask10.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  triangleAreaHeron(3, 4, 5);
  triangleAreaHeron(5, 5, 5);
  triangleAreaHeron(1, 2, 3);
  triangleAreaHeron(6, 8, 10);
});
tasksDiv.appendChild(buttonTask10);