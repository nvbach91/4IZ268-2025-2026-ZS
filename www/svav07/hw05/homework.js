/* HOMEWORK */

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození,
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných
 * používejte smysluplnou angličtinu.
 */
// Solution here
const birthYear = 1990;
const currentYear = new Date().getFullYear();
const age = currentYear - birthYear;

console.log(`Pepe is ${age} years old.`);

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak.
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32.
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9.
 */
// Solution here
const celsius = 20;
const fahrenheit = 68;

const celsiusToFahrenheit = (celsius * 9) / 5 + 32;
console.log(`${celsius}°C = ${celsiusToFahrenheit}°F`);

const fahrenheitToCelsius = ((fahrenheit - 32) * 5) / 9;
console.log(`${fahrenheit}°F = ${fahrenheitToCelsius}°C`);

/**
 * 3) Funkce function fonction funktio. Vemte předchozí úlohy a udělejte z nich funkce. Tj. vytvoříte funkce,
 * které přijímají argumenty, a na základě argumentů po zavolání vypíše výsledek na konzoli.
 * Párkrát zavolejte tyto funkce s různými argumenty. V konzoli také vyzkoušejte, zda fungují vaše funkce.
 *
 * Pro testování funkce:
 * - Pouze pomocí JavaScriptu (bez knihoven) vytvořte HTML tlačítko s názvem této úlohy, resp. co funkce dělá, a
 * id s číslem úlohy <button id="task-1">Uloha 1 (Pepe's age)</button>, umístěte ho na stránku do předem vytvořeného
 * místa <div id="tasks"></div> a pomocí posluchače události "click" nabindujte implementovanou funkci na toto tlačítko.
 *
 * Výsledkem má být tlačítko, na které když kliknete, tak se provede to, co je implementováno ve funkci.
 *
 * Příklad vytvoření tlačítka s funkcí:
 *
 * // deklarace a implementace funkce
 * const sayHello = () => {
 *   console.log('Hello');
 * };
 *
 * // vytvoření tlačítka
 * const buttonSayHello = document.createElement('button');
 * // nastavení textu tlačítka
 * buttonSayHello.innerText = 'Say Hello';
 * // nastavení atributu id tlačítka
 * buttonSayHello.setAttribute('id', 'task-0');
 * // nabindování funkce na událost click tlačítka
 * buttonSayHello.addEventListener('click', () => {
 *   sayHello();
 * });
 *
 * // výběr existujícího elementu na stránce s id="tasks"
 * const tasks = document.querySelector('#tasks');
 * // vložení vytvořeného tlačítka do vybraného elementu na stránce
 * tasks.appendChild(buttonSayHello);
 */
// Solution here
const calculateAgeFromYear = (birthYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  console.log(`Person born in ${birthYear} is ${age} years old.`);
};

const convertCelsiusToFahrenheit = (celsius) => {
  const fahrenheit = (celsius * 9) / 5 + 32;
  console.log(`${celsius}°C = ${fahrenheit}°F`);
};

const convertFahrenheitToCelsius = (fahrenheit) => {
  const celsius = ((fahrenheit - 32) * 5) / 9;
  console.log(`${fahrenheit}°F = ${celsius}°C`);
};

const birthYears = [1990, 2000, 1985];
const celsiusValues = [20, 0, 100];
const fahrenheitValues = [68, 32, 212];

const task1Buttons = document.querySelector("#task1-buttons");
const task2Buttons = document.querySelector("#task2-buttons");

const buttonTask1 = document.createElement("button");
buttonTask1.innerText = "Calculate Age (Random Year)";
buttonTask1.setAttribute("id", "task-1");
buttonTask1.addEventListener("click", () => {
  const randomYear = birthYears[Math.floor(Math.random() * birthYears.length)];
  calculateAgeFromYear(randomYear);
});
task1Buttons.appendChild(buttonTask1);

const buttonTask2a = document.createElement("button");
buttonTask2a.innerText = "Celsius to Fahrenheit (Random)";
buttonTask2a.setAttribute("id", "task-2a");
buttonTask2a.addEventListener("click", () => {
  const randomCelsius =
    celsiusValues[Math.floor(Math.random() * celsiusValues.length)];
  convertCelsiusToFahrenheit(randomCelsius);
});
task2Buttons.appendChild(buttonTask2a);

const buttonTask2b = document.createElement("button");
buttonTask2b.innerText = "Fahrenheit to Celsius (Random)";
buttonTask2b.setAttribute("id", "task-2b");
buttonTask2b.style.marginLeft = "10px";
buttonTask2b.addEventListener("click", () => {
  const randomFahrenheit =
    fahrenheitValues[Math.floor(Math.random() * fahrenheitValues.length)];
  convertFahrenheitToCelsius(randomFahrenheit);
});
task2Buttons.appendChild(buttonTask2b);

/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla.
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2);
 * Pozor na dělení nulou!
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here
const calculatePercentage = (part, whole) => {
  const results = document.querySelector("#results");

  if (whole === 0) {
    results.innerHTML +=
      '<p style="color: red;">Error: Cannot divide by zero!</p>';
    return 0;
  }

  const percentage = ((part / whole) * 100).toFixed(2);
  results.innerHTML += `<p>${part} is ${percentage}% of ${whole}</p>`;
  return percentage;
};

const partInput = document.getElementById("partInput");
const wholeInput = document.getElementById("wholeInput");
const calculatePercentageBtn = document.getElementById(
  "calculatePercentageBtn"
);

calculatePercentageBtn.addEventListener("click", () => {
  const part = parseFloat(partInput.value);
  const whole = parseFloat(wholeInput.value);

  if (isNaN(part) || isNaN(whole)) {
    const results = document.querySelector("#results");
    results.innerHTML +=
      '<p style="color: red;">Please enter valid numbers!</p>';
    return;
  }

  calculatePercentage(part, whole);
});

/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají.
 *
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here
const compareNumbers = (a, b) => {
  const results = document.querySelector("#results");

  if (a < b) {
    results.innerHTML += `<p>${b} is greater than ${a}</p>`;
  } else if (a > b) {
    results.innerHTML += `<p>${a} is greater than ${b}</p>`;
  } else {
    results.innerHTML += `<p>Numbers ${a} and ${b} are equal</p>`;
  }
};

const task5Buttons = document.querySelector("#task5-buttons");

const buttonTask5a = document.createElement("button");
buttonTask5a.innerText = "10 vs 5";
buttonTask5a.setAttribute("id", "task-5a");
buttonTask5a.addEventListener("click", () => {
  compareNumbers(10, 5);
});
task5Buttons.appendChild(buttonTask5a);

const buttonTask5b = document.createElement("button");
buttonTask5b.innerText = "3.14 vs 3.15";
buttonTask5b.setAttribute("id", "task-5b");
buttonTask5b.style.marginLeft = "10px";
buttonTask5b.addEventListener("click", () => {
  compareNumbers(3.14, 3.15);
});
task5Buttons.appendChild(buttonTask5b);

const buttonTask5c = document.createElement("button");
buttonTask5c.innerText = "1/2 vs 1/3";
buttonTask5c.setAttribute("id", "task-5c");
buttonTask5c.style.marginLeft = "10px";
buttonTask5c.addEventListener("click", () => {
  compareNumbers(1 / 2, 1 / 3);
});
task5Buttons.appendChild(buttonTask5c);

const buttonTask5d = document.createElement("button");
buttonTask5d.innerText = "7 vs 7";
buttonTask5d.setAttribute("id", "task-5d");
buttonTask5d.style.marginLeft = "10px";
buttonTask5d.addEventListener("click", () => {
  compareNumbers(7, 7);
});
task5Buttons.appendChild(buttonTask5d);

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší
 * nebo rovno 730, včetě nuly. Používejte for cyklus.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here
const printMultiplesOf13 = () => {
  const results = document.querySelector("#results");
  let output = "<p>Multiples of 13 (up to 730): ";

  for (let i = 0; i <= 730; i += 13) {
    output += i + ", ";
  }

  output = output.slice(0, -2) + "</p>";
  results.innerHTML += output;
};

const task6Buttons = document.querySelector("#task6-buttons");

const buttonTask6 = document.createElement("button");
buttonTask6.innerText = "Show Multiples of 13";
buttonTask6.setAttribute("id", "task-6");
buttonTask6.addEventListener("click", () => {
  printMultiplesOf13();
});
task6Buttons.appendChild(buttonTask6);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const getCircleArea = (radius) => {
  const results = document.querySelector("#results");
  const area = (Math.PI * radius ** 2).toFixed(2);
  results.innerHTML += `<p>Circle area with radius ${radius} is ${area}</p>`;
  return area;
};

const task7Buttons = document.querySelector("#task7-buttons");

const buttonTask7 = document.createElement("button");
buttonTask7.innerText = "Calculate (radius = 5)";
buttonTask7.setAttribute("id", "task-7");
buttonTask7.addEventListener("click", () => {
  getCircleArea(5);
});
task7Buttons.appendChild(buttonTask7);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const getConeVolume = (height, radius) => {
  const results = document.querySelector("#results");
  const volume = ((Math.PI * radius ** 2 * height) / 3).toFixed(2);
  results.innerHTML += `<p>Cone volume with height ${height} and radius ${radius} is ${volume}</p>`;
  return volume;
};

const task8Buttons = document.querySelector("#task8-buttons");

const buttonTask8 = document.createElement("button");
buttonTask8.innerText = "Calculate (height = 10, radius = 3)";
buttonTask8.setAttribute("id", "task-8");
buttonTask8.addEventListener("click", () => {
  getConeVolume(10, 3);
});
task8Buttons.appendChild(buttonTask8);

/**
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const isTriangle = (a, b, c) => {
  const results = document.querySelector("#results");
  const valid = a + b > c && a + c > b && b + c > a;

  if (valid) {
    results.innerHTML += `<p>Sides ${a}, ${b}, ${c} can form a triangle: YES</p>`;
  } else {
    results.innerHTML += `<p>Sides ${a}, ${b}, ${c} cannot form a triangle: NO</p>`;
  }

  return valid;
};

const task9Buttons = document.querySelector("#task9-buttons");

const buttonTask9a = document.createElement("button");
buttonTask9a.innerText = "Valid Triangle (3, 4, 5)";
buttonTask9a.setAttribute("id", "task-9a");
buttonTask9a.addEventListener("click", () => {
  isTriangle(3, 4, 5);
});
task9Buttons.appendChild(buttonTask9a);

const buttonTask9b = document.createElement("button");
buttonTask9b.innerText = "Invalid Triangle (1, 2, 10)";
buttonTask9b.setAttribute("id", "task-9b");
buttonTask9b.style.marginLeft = "10px";
buttonTask9b.addEventListener("click", () => {
  isTriangle(1, 2, 10);
});
task9Buttons.appendChild(buttonTask9b);

/**
 * 10) Heroic performance. Vytvořte funkci, která vypočte a vypíše obsah trojúhelníka podle Heronova vzorce,
 * tj. funkce dostane délky všech 3 stran. Použijte přitom předchozí validaci v úloze č. 9, tj. počítejte pouze,
 * když to má smysl. Hint: funkce pro odmocninu je Math.sqrt().
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const getTriangleArea = (a, b, c) => {
  const results = document.querySelector("#results");

  if (!(a + b > c && a + c > b && b + c > a)) {
    results.innerHTML += `<p style="color: red;">Sides ${a}, ${b}, ${c} cannot form a valid triangle!</p>`;
    return;
  }

  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  results.innerHTML += `<p>Triangle area with sides ${a}, ${b}, ${c} is ${area.toFixed(
    2
  )}</p>`;
  return area;
};

const task10Buttons = document.querySelector("#task10-buttons");

const buttonTask10a = document.createElement("button");
buttonTask10a.innerText = "Valid Triangle (3, 4, 5)";
buttonTask10a.setAttribute("id", "task-10a");
buttonTask10a.addEventListener("click", () => {
  getTriangleArea(3, 4, 5);
});
task10Buttons.appendChild(buttonTask10a);

const buttonTask10b = document.createElement("button");
buttonTask10b.innerText = "Invalid Triangle (1, 2, 10)";
buttonTask10b.setAttribute("id", "task-10b");
buttonTask10b.style.marginLeft = "10px";
buttonTask10b.addEventListener("click", () => {
  getTriangleArea(1, 2, 10);
});
task10Buttons.appendChild(buttonTask10b);
