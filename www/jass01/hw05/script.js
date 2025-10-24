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

const pepeBirthYear = 2005;
if(pepeBirthYear && typeof pepeBirthYear === 'number') {
  const age = new Date().getFullYear() - pepeBirthYear;
  console.log(`Pepe is ${age} years old.`);
}



/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

const celsiusTemp = 20;
const celsiusToFahrenheit = (celsiusTemp * 9) / 5 + 32;
console.log(`${celsiusTemp}°C = ${celsiusToFahrenheit}°F`);

const fahrenheitTemp = 68;
const fahrenheitToCelsius = ((fahrenheitTemp - 32) * 5) / 9;
console.log(`${fahrenheitTemp}°F = ${fahrenheitToCelsius}°C`);



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

function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function toCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

function pepeAge(birthYear) {
  if(birthYear && typeof birthYear === 'number') {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  }
}

const buttonToFahrenheit = document.createElement('button');
buttonToFahrenheit.innerText = "Convert celsius to fahrenheit";
buttonToFahrenheit.setAttribute('id', 'task-2a');
buttonToFahrenheit.addEventListener('click', () => {
  const celsius = 25;
  console.log(`${celsius}°C = ${toFahrenheit(celsius)}°F`);
});

const buttonToCelsius = document.createElement('button');
buttonToCelsius.innerText = "Convert fahrenheit to celsius";
buttonToCelsius.setAttribute('id', 'task-2b');
buttonToCelsius.addEventListener('click', () => {
  const fahrenheit = 77;
  console.log(`${fahrenheit}°F = ${toCelsius(fahrenheit)}°C`);
});

const buttonPepeAge = document.createElement('button');
buttonPepeAge.innerText = "Calculate pepe's age";
buttonPepeAge.setAttribute('id', 'task-1');
buttonPepeAge.addEventListener('click', () => {
  const birthYear = 2005;
  console.log(`Pepe is ${pepeAge(birthYear)} years old.`);
});

const tasks = document.querySelector('#tasks');
tasks.appendChild(buttonToFahrenheit);
tasks.appendChild(buttonToCelsius);
tasks.appendChild(buttonPepeAge);



/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

function calculatePercentage(part, total) {
  const resultsContainer = document.querySelector('#results');
  if (total === 0) {
    resultsContainer.innerText = "Nelze delit nulou!";
    return;
  }
  const percentage = (part / total) * 100;
  resultsContainer.innerText = `${part} je ${percentage.toFixed(2)}% z ${total}.`;
}

const buttonCalculatePercentage = document.createElement('button');
buttonCalculatePercentage.innerText = "Calculate percentage";
buttonCalculatePercentage.setAttribute('id', 'task-4');
buttonCalculatePercentage.addEventListener('click', () => {
  const part = 32; 
  const total = 3423; 
  calculatePercentage(part, total);
});

tasks.appendChild(buttonCalculatePercentage);




/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here


function compareNumbers(num1, num2) {
  const resultsContainer = document.querySelector('#results');
  if (num1 > num2) {
    resultsContainer.innerText = `${num1} je větší než ${num2}.`;
  } else if (num1 < num2) {
    resultsContainer.innerText = `${num2} je větší než ${num1}.`;
  } else {
    resultsContainer.innerText = `${num1} se rovná ${num2}.`;
  }
}

const buttonCompareNumbers1 = document.createElement('button');
buttonCompareNumbers1.innerText = "Compare 10 and 20";
buttonCompareNumbers1.setAttribute('id', 'task-5a');
buttonCompareNumbers1.addEventListener('click', () => {
  compareNumbers(10, 20);
});

const buttonCompareNumbers2 = document.createElement('button');
buttonCompareNumbers2.innerText = "Compare 15.5 and 15.5";
buttonCompareNumbers2.setAttribute('id', 'task-5b');
buttonCompareNumbers2.addEventListener('click', () => {
  compareNumbers(15.5, 15.5);
});

const buttonCompareNumbers3 = document.createElement('button');
buttonCompareNumbers3.innerText = "Compare 7/3 and 2.33";
buttonCompareNumbers3.setAttribute('id', 'task-5c');
buttonCompareNumbers3.addEventListener('click', () => {
  compareNumbers(7/3, 2.33);
});

tasks.appendChild(buttonCompareNumbers1);
tasks.appendChild(buttonCompareNumbers2);
tasks.appendChild(buttonCompareNumbers3);


/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

function printMultiplesOf13() {
  const resultsContainer = document.querySelector('#results');
  let multiples = '';
  for (let i = 0; i <= 730; i += 13) {
    multiples += i + ' ';
  }
  resultsContainer.innerText = multiples.trim();
}

const buttonPrintMultiplesOf13 = document.createElement('button');
buttonPrintMultiplesOf13.innerText = "Print multiples of 13";
buttonPrintMultiplesOf13.setAttribute('id', 'task-6');
buttonPrintMultiplesOf13.addEventListener('click', () => {
  printMultiplesOf13();
});

tasks.appendChild(buttonPrintMultiplesOf13);




/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

function calculateCircleArea(radius) {
  const resultsContainer = document.querySelector('#results');
  const area = Math.PI * Math.pow(radius, 2);
  resultsContainer.innerText = `Obsah kružnice s poloměrem ${radius} je ${area.toFixed(2)}.`;
}

const buttonCalculateCircleArea = document.createElement('button');
buttonCalculateCircleArea.innerText = "Calculate circle area";
buttonCalculateCircleArea.setAttribute('id', 'task-7');
buttonCalculateCircleArea.addEventListener('click', () => {
  const radius = 5; // example value
  calculateCircleArea(radius);
});

tasks.appendChild(buttonCalculateCircleArea); 





/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

function calculateConeVolume(height, radius) {
  const resultsContainer = document.querySelector('#results');
  const volume = (1/3) * Math.PI * Math.pow(radius, 2) * height;
  resultsContainer.innerText = `Objem kuželu s výškou ${height} a poloměrem ${radius} je ${volume.toFixed(2)}.`;
}

const buttonCalculateConeVolume = document.createElement('button');
buttonCalculateConeVolume.innerText = "Calculate Cone Volume";
buttonCalculateConeVolume.setAttribute('id', 'task-8');
buttonCalculateConeVolume.addEventListener('click', () => {
  const height = 10;
  const radius = 3;
  calculateConeVolume(height, radius);
});

tasks.appendChild(buttonCalculateConeVolume);



/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

function canFormTriangle(a, b, c) {
  const resultsContainer = document.querySelector('#results');
  const canForm = (a + b > c) && (a + c > b) && (b + c > a);
  resultsContainer.innerText = `Strany ${a}, ${b}, ${c} ${canForm ? 'mohou' : ' nemohou'} tvořit trojúhelník.`;
  return canForm;
}

const buttonCanFormTriangle = document.createElement('button');
buttonCanFormTriangle.innerText = "Can Form Triangle";
buttonCanFormTriangle.setAttribute('id', 'task-9');
buttonCanFormTriangle.addEventListener('click', () => {
  const a = 8; 
  const b = 4; 
  const c = 5; 
  canFormTriangle(a, b, c);
});

tasks.appendChild(buttonCanFormTriangle);



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

function calculateTriangleArea(a, b, c) {
  const resultsContainer = document.querySelector('#results');
  if (!canFormTriangle(a, b, c)) {
    resultsContainer.innerText = "Error: Zadané délky stran nemohou tvořit trojúhelník.";
    return;
  }
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  resultsContainer.innerText = `Obsah trojúhelníka se stranami ${a}, ${b}, ${c} je ${area.toFixed(2)}.`;
}

const buttonCalculateTriangleArea = document.createElement('button');
buttonCalculateTriangleArea.innerText = "Calculate Triangle Area";
buttonCalculateTriangleArea.setAttribute('id', 'task-10');
buttonCalculateTriangleArea.addEventListener('click', () => {
  const a = 3; 
  const b = 4;
  const c = 5; 
  calculateTriangleArea(a, b, c);
});

tasks.appendChild(buttonCalculateTriangleArea); 