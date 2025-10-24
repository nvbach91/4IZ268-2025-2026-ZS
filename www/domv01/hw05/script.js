/* HOMEWORK */
/**
 * 0) Pre-preparacion.
 * - Vytvořte HTML stránku s nadpisem h1 "JavaScript is awesome!"
 * - Na stránce vytvořte místo pro umístění jednotlivých spouštěčů úkolů - tlačítek (tj. div, který má id s hodnotou "tasks" - <div id="tasks"></div>).
 * - Na stránce vytvořte místo pro výpis výsledků úkolů (div, který má id s hodnotou "result" - <div id="results"></div>).
 *
 * - Připojte tento homework.js soubor k vytvořené HTML stránce pomocí tagu <script> (viz LAB) a vyzkoušejte
 * console.log('Ahoj světe');
 */

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození,
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných
 * používejte smysluplnou angličtinu.
 */
// Solution here

const pepeBirthYear = 1990;
const currentYear = new Date().getFullYear();
const pepeAge = currentYear - pepeBirthYear;
console.log(`Pepe is ${pepeAge} years old.`);

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak.
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32.
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9.
 */
// Solution here

const celsiusTemp = 20;
const fahrenheitTemp = (celsiusTemp * 9) / 5 + 32;

const fahrenheitTemp2 = 68;
const celsiusTemp2 = ((fahrenheitTemp2 - 32) * 5) / 9;

console.log(`${celsiusTemp}°C = ${fahrenheitTemp}°F`);
console.log(`${fahrenheitTemp2}°F = ${celsiusTemp2}°C`);

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

const calculatePepeAge = (birthYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  return `Pepe is ${age} years old.`;
};

const convertCelsiusToFahrenheit = (celsius, fahrenheit) => {
  const ctf = (celsius * 9) / 5 + 32;
  const ftc = ((fahrenheit - 32) * 5) / 9;
  return `${celsius}°C = ${ctf}°F, ${fahrenheit}°F = ${ftc}°C`;
};

calculatePepeAge(1990);
calculatePepeAge(2003);
convertCelsiusToFahrenheit(20, 68);
convertCelsiusToFahrenheit(0, 32);

const tasksContainer = document.querySelector("#tasks");
const resultsContainer = document.querySelector("#results");

const buttonPepe = document.createElement("button");
buttonPepe.innerText = "Uloha 1 (Pepe's age)";
buttonPepe.setAttribute("id", "task-1");

buttonPepe.addEventListener("click", () => {
  const results = [];
  results.push(calculatePepeAge(1990));
  results.push(calculatePepeAge(2003));
  resultsContainer.innerText = results.join("\n");
});

const buttonCelsius = document.createElement("button");
buttonCelsius.innerText = "Uloha 2 (Celsius to Fahrenheit)";
buttonCelsius.setAttribute("id", "task-2");

buttonCelsius.addEventListener("click", () => {
  const results = [];
  results.push(convertCelsiusToFahrenheit(0, 32));
  results.push(convertCelsiusToFahrenheit(20, 68));
  results.push(convertCelsiusToFahrenheit(37, 98.6));
  results.push(convertCelsiusToFahrenheit(100, 212));
  resultsContainer.innerText = results.join("\n");
});

tasksContainer.appendChild(buttonPepe);
tasksContainer.appendChild(buttonCelsius);

/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla.
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2);
 * Pozor na dělení nulou!
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const censored = (a, b) => {
  if (b === 0) {
    return "Nelze dělit 0";
  }

  return `${a} je ${((a / b) * 100).toFixed(2)}% z ${b}`;
};

const buttonCensored = document.createElement("button");
buttonCensored.innerText = "Uloha 4 (%CENSORED%)";
buttonCensored.setAttribute("id", "task-4");
tasksContainer.appendChild(buttonCensored);

const buttonCensoredTask = document.getElementById("task-4");
buttonCensoredTask.addEventListener("click", () => {
  const results = [];
  results.push(censored(21, 42));
  results.push(censored(50, 200));
  results.push(censored(10, 0));
  results.push(censored(1, 529));
  resultsContainer.innerText = results.join("\n");
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

const buttonKdoSKoho = document.createElement("button");
buttonKdoSKoho.innerText = "Uloha 5 (Kdo s koho)";
buttonKdoSKoho.setAttribute("id", "task-5");

const ksk = (a, b) => {
  return a < b
    ? `${b} je větší než ${a}`
    : a > b
    ? `${a} je větší než ${b}`
    : "Čísla se rovnají";
};

buttonKdoSKoho.addEventListener("click", () => {
  const results = [];
  results.push(ksk(10, 5));
  results.push(ksk(3.5, 7.2));
  results.push(ksk(4, 4));
  resultsContainer.innerText = results.join("\n");
});

tasksContainer.appendChild(buttonKdoSKoho);

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší
 * nebo rovno 730, včetě nuly. Používejte for cyklus.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const buttonMultiplesOf13 = document.createElement("button");
buttonMultiplesOf13.innerText = "Uloha 6 (Násobky 13)";
buttonMultiplesOf13.setAttribute("id", "task-6");

const multiplesOf13 = () => {
  let result = "";
  for (let i = 13; i <= 730; i += 13) {
    result += i + ", ";
  }
  return result.trim();
};

buttonMultiplesOf13.addEventListener("click", () => {
  const result = multiplesOf13();
  resultsContainer.innerText = result;
});

tasksContainer.appendChild(buttonMultiplesOf13);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here

const buttonCircleArea = document.createElement("button");
buttonCircleArea.innerText = "Uloha 7 (Obsah kružnice)";
buttonCircleArea.setAttribute("id", "task-7");

const circleArea = (radius) => {
  const area = Math.PI * radius * radius;
  return `Obsah kružnice s poloměrem ${radius} je ${area.toFixed(2)}`;
};

buttonCircleArea.addEventListener("click", () => {
  const results = [];
  results.push(circleArea(5));
  results.push(circleArea(10));

  resultsContainer.innerText = results.join("\n");
});

tasksContainer.appendChild(buttonCircleArea);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here

const buttonConeVolume = document.createElement("button");
buttonConeVolume.innerText = "Uloha 8 (Objem kuželu)";
buttonConeVolume.setAttribute("id", "task-8");

const coneVolume = (height, radius) => {
  const volume = (1 / 3) * Math.PI * radius * radius * height;
  return `Objem kuželu s výškou ${height} a poloměrem ${radius} je ${volume.toFixed(
    2
  )}`;
};

buttonConeVolume.addEventListener("click", () => {
  const results = [];
  results.push(coneVolume(10, 3));
  results.push(coneVolume(5, 7));
  resultsContainer.innerText = results.join("\n");
});

tasksContainer.appendChild(buttonConeVolume);

/**
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here

const buttonIsTriangle = document.createElement("button");
buttonIsTriangle.innerText = "Uloha 9 (Je to trojúhelník?)";
buttonIsTriangle.setAttribute("id", "task-9");

const isTriangle = (a, b, c) => {
  return a + b > c && a + c > b && b + c > a;
};

const triangleTest = (a, b, c) => {
  return `a=${a}, b=${b}, c=${c} ${
    isTriangle(a, b, c)
      ? "-> Trojúhelník lze sestavit."
      : "-> Trojúhelník nelze sestavit."
  }`;
};

buttonIsTriangle.addEventListener("click", () => {
  const results = [];
  results.push(triangleTest(3, 4, 5));
  results.push(triangleTest(1, 0, 3));
  results.push(triangleTest(5, 5, 5));
  resultsContainer.innerText = results.join("\n");
});

tasksContainer.appendChild(buttonIsTriangle);

/**
 * 10) Heroic performance. Vytvořte funkci, která vypočte a vypíše obsah trojúhelníka podle Heronova vzorce,
 * tj. funkce dostane délky všech 3 stran. Použijte přitom předchozí validaci v úloze č. 9, tj. počítejte pouze,
 * když to má smysl. Hint: funkce pro odmocninu je Math.sqrt().
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
// - krok 1 - vytvořte funkci
//   - krok 1.1 - pomocí selektoru vyberte container pro výpis výsledků a uložte ho do proměnné
//   - krok 1.2 - zvalidujte vstupní argumenty pomocí funkce z úlohy č. 9
//     - v případě nevalidních hodnot vypište chybovou hlášku na místo pro výpis výsledků a funkci ukončete
//     - v případě validních hodnot pokračujte s výpočtem
//   - krok 1.3 - spočítejte obsah trojúhelníku podle Heronovy vzorce a výsledek uložte do proměnné
//   - krok 1.4 - vypište výsledek na místo pro výpis výsledků
// - krok 2 - vytvořte tlačítko
// - krok 3 - nabindujte na toto tlačítko callback, ve kterém zavoláte implementovanou funkci pro výpočet a výpis výsledků
// - krok 4 - tlačítko umístěte na stránku
// - krok 5 - otestujte řešení klikáním na tlačítko

const buttonHeroic = document.createElement("button");
buttonHeroic.innerText = "Uloha 10 (Heronův vzorec)";
buttonHeroic.setAttribute("id", "task-10");

const heroicPerformance = (a, b, c) => {
  if (!isTriangle(a, b, c))
    return `Trojúhelník (${a}, ${b}, ${c}) nelze sestavit, výpočet nelze provést.`;

  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  return `Obsah trojúhelníka s délkami stran ${a}, ${b}, ${c} je ${area.toFixed(
    2
  )}`;
};

buttonHeroic.addEventListener("click", () => {
  const results = [];
  results.push(heroicPerformance(3, 4, 5));
  results.push(heroicPerformance(1, 2, 3));
  resultsContainer.innerText = results.join("\n");
});

tasksContainer.appendChild(buttonHeroic);
