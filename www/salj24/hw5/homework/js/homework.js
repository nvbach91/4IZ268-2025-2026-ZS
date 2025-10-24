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

console.log('Ahoj světe');

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here


const pepeBirthYear = 1995;
const currentYear = new Date().getFullYear();
const pepeAge = currentYear - pepeBirthYear;

console.log("Pepe is " + pepeAge + " years old.");


/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

// převod z °C na °F
const celsius = 20;
const fahrenheitFromCelsius = (celsius * 9) / 5 + 32;
console.log(`${celsius}°C = ${fahrenheitFromCelsius}°F`);

// převod z °F na °C
const fahrenheit = 68;
const celsiusFromFahrenheit = ((fahrenheit - 32) * 5) / 9;
console.log(`${fahrenheit}°F = ${celsiusFromFahrenheit}°C`);


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

// 1.

const calculateAge = (birthYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  console.log(`Pepe is ${age} years old.`);
};

calculateAge(1995); 
calculateAge(2000);

// 2.

// C → F
const celsiusToFahrenheit = (celsius) => {
  const fahrenheit = (celsius * 9) / 5 + 32;
  console.log(`${celsius}°C = ${fahrenheit}°F`);
};

// F → C
const fahrenheitToCelsius = (fahrenheit) => {
  const celsius = ((fahrenheit - 32) * 5) / 9;
  console.log(`${fahrenheit}°F = ${celsius}°C`);
};

celsiusToFahrenheit(30); 
fahrenheitToCelsius(86); 




const tasks = document.querySelector('#tasks');


// tlačítko 1 - Úloha 1 
const task1Container = document.createElement('div');
task1Container.style.marginBottom = '20px';

const buttonAge = document.createElement('button');
buttonAge.innerText = "Úloha 1 (Pepe's age)";
buttonAge.setAttribute('id', 'task-1');
buttonAge.style.display = 'block';
buttonAge.style.marginBottom = '5px';

const resultAge = document.createElement('div');
resultAge.style.fontStyle = 'italic';

buttonAge.addEventListener('click', () => {
  const output = `Pepe is ${new Date().getFullYear() - 1995} years old.`;
  console.log(output); // pro kontrolu v konzoli
  resultAge.innerText = output;
});

task1Container.appendChild(buttonAge);
task1Container.appendChild(resultAge);
tasks.appendChild(task1Container);

// tlačítko 2 - C → F
const task2aContainer = document.createElement('div');
task2aContainer.style.marginBottom = '20px';

const buttonCtoF = document.createElement('button');
buttonCtoF.innerText = "Úloha 2 (C → F)";
buttonCtoF.setAttribute('id', 'task-2');
buttonCtoF.style.display = 'block';
buttonCtoF.style.marginBottom = '5px';

const resultCtoF = document.createElement('div');
resultCtoF.style.fontStyle = 'italic';

buttonCtoF.addEventListener('click', () => {
  const celsius = 20;
  const fahrenheit = (celsius * 9) / 5 + 32;
  const output = `${celsius}°C = ${fahrenheit}°F`;
  console.log(output);
  resultCtoF.innerText = output;
});

task2aContainer.appendChild(buttonCtoF);
task2aContainer.appendChild(resultCtoF);
tasks.appendChild(task2aContainer);

// tlačítko 2 - F → C
const task2bContainer = document.createElement('div');
task2bContainer.style.marginBottom = '20px';

const buttonFtoC = document.createElement('button');
buttonFtoC.innerText = "Úloha 2 (F → C)";
buttonFtoC.setAttribute('id', 'task-3');
buttonFtoC.style.display = 'block';
buttonFtoC.style.marginBottom = '5px';

const resultFtoC = document.createElement('div');
resultFtoC.style.fontStyle = 'italic';

buttonFtoC.addEventListener('click', () => {
  const fahrenheit = 68;
  const celsius = ((fahrenheit - 32) * 5) / 9;
  const output = `${fahrenheit}°F = ${celsius.toFixed(2)}°C`;
  console.log(output);
  resultFtoC.innerText = output;
});

task2bContainer.appendChild(buttonFtoC);
task2bContainer.appendChild(resultFtoC);
tasks.appendChild(task2bContainer);



/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

// Úloha 4 – %CENSORED%

const getPercentage = (a, b) => {
  if (b === 0) {
    return "Nelze dělit nulou";
  }
  return `${a} je ${(a / b * 100).toFixed(2)}% z ${b}`;
};


const task4Container = document.createElement("div");
task4Container.style.marginBottom = "20px";

const buttonPercent = document.createElement("button");
buttonPercent.innerText = "Úloha 4";
buttonPercent.setAttribute("id", "task-4");
buttonPercent.style.display = "block";
buttonPercent.style.marginBottom = "5px";

const resultPercent = document.createElement("div");
resultPercent.style.fontStyle = "italic";

buttonPercent.addEventListener("click", () => {
  const output = getPercentage(21, 42);
  console.log(output); 
  resultPercent.innerText = output; 
});

task4Container.appendChild(buttonPercent);
task4Container.appendChild(resultPercent);
tasks.appendChild(task4Container);


/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here

// Úloha 5 – Kdo s koho

const compareNumbers = (a, b) => {
  if (a > b) {
    return `${a} je větší než ${b}`;
  } else if (a < b) {
    return `${b} je větší než ${a}`;
  } else {
    return `${a} a ${b} jsou si rovna`;
  }
};


const task5Container = document.createElement("div");
task5Container.style.marginBottom = "20px";


// Celá čísla
const wholeContainer = document.createElement("div");
const buttonWhole = document.createElement("button");
buttonWhole.innerText = "Porovnej 42 a 21";
buttonWhole.style.display = "block";
buttonWhole.style.marginBottom = "5px";
const resultWhole = document.createElement("div");
resultWhole.style.fontStyle = "italic";
buttonWhole.addEventListener("click", () => {
  const output = compareNumbers(42, 21);
  console.log(output);
  resultWhole.innerText = output;
});
wholeContainer.appendChild(buttonWhole);
wholeContainer.appendChild(resultWhole);
task5Container.appendChild(wholeContainer);

// Desetinná čísla
const decimalContainer = document.createElement("div");
const buttonDecimal = document.createElement("button");
buttonDecimal.innerText = "Porovnej 3.14 a 2.72";
buttonDecimal.style.display = "block";
buttonDecimal.style.marginBottom = "5px";
const resultDecimal = document.createElement("div");
resultDecimal.style.fontStyle = "italic";
buttonDecimal.addEventListener("click", () => {
  const output = compareNumbers(3.14, 2.72);
  console.log(output);
  resultDecimal.innerText = output;
});
decimalContainer.appendChild(buttonDecimal);
decimalContainer.appendChild(resultDecimal);
task5Container.appendChild(decimalContainer);

// Zlomky
const fractionContainer = document.createElement("div");
const buttonFraction = document.createElement("button");
buttonFraction.innerText = "Porovnej 1/2 a 3/4";
buttonFraction.style.display = "block";
buttonFraction.style.marginBottom = "5px";
const resultFraction = document.createElement("div");
resultFraction.style.fontStyle = "italic";
buttonFraction.addEventListener("click", () => {
  const output = compareNumbers(1 / 2, 3 / 4);
  console.log(output);
  resultFraction.innerText = output;
});
fractionContainer.appendChild(buttonFraction);
fractionContainer.appendChild(resultFraction);
task5Container.appendChild(fractionContainer);

// Rovnost
const equalContainer = document.createElement("div");
const buttonEqual = document.createElement("button");
buttonEqual.innerText = "Porovnej 10 a 10";
buttonEqual.style.display = "block";
buttonEqual.style.marginBottom = "5px";
const resultEqual = document.createElement("div");
resultEqual.style.fontStyle = "italic";
buttonEqual.addEventListener("click", () => {
  const output = compareNumbers(10, 10);
  console.log(output);
  resultEqual.innerText = output;
});
equalContainer.appendChild(buttonEqual);
equalContainer.appendChild(resultEqual);
task5Container.appendChild(equalContainer);


tasks.appendChild(task5Container);


/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const showMultiplesOf13 = () => {
  let result = "";
  for (let i = 0; i <= 730; i += 13) {
    result += i + " ";
  }
  console.log(result.trim());
  return result.trim();
};

const task6Container = document.createElement("div");
task6Container.style.marginBottom = "20px";

const buttonMultiples = document.createElement("button");
buttonMultiples.innerText = "Úloha 6 (Násobky 13)";
buttonMultiples.style.display = "block";
buttonMultiples.style.marginBottom = "5px";

const resultMultiples = document.createElement("div");
resultMultiples.style.fontStyle = "italic";

buttonMultiples.addEventListener("click", () => {
  resultMultiples.innerText = showMultiplesOf13();
});

task6Container.appendChild(buttonMultiples);
task6Container.appendChild(resultMultiples);
tasks.appendChild(task6Container);




/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const calculateCircleArea = (radius) => {
  const area = Math.PI * radius * radius;
  console.log(`Poloměr: ${radius}, obsah kružnice: ${area.toFixed(2)}`);
  return `Poloměr: ${radius}, obsah kružnice: ${area.toFixed(2)}`;
};

const task7Container = document.createElement("div");
task7Container.style.marginBottom = "20px";

const buttonCircleArea = document.createElement("button");
buttonCircleArea.innerText = "Úloha 7 (Obsah kružnice)";
buttonCircleArea.style.display = "block";
buttonCircleArea.style.marginBottom = "5px";

const resultCircleArea = document.createElement("div");
resultCircleArea.style.fontStyle = "italic";

buttonCircleArea.addEventListener("click", () => {
  resultCircleArea.innerText = calculateCircleArea(10);
});

task7Container.appendChild(buttonCircleArea);
task7Container.appendChild(resultCircleArea);
tasks.appendChild(task7Container);




/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const calculateConeVolume = (radius, height) => {
  const volume = (1 / 3) * Math.PI * radius * radius * height;
  console.log(`Poloměr: ${radius}, výška: ${height}, objem kuželu: ${volume.toFixed(2)}`);
  return `Poloměr: ${radius}, výška: ${height}, objem kuželu: ${volume.toFixed(2)}`;
};

const task8Container = document.createElement("div");
task8Container.style.marginBottom = "20px";

const buttonConeVolume = document.createElement("button");
buttonConeVolume.innerText = "Úloha 8 (Objem kuželu)";
buttonConeVolume.style.display = "block";
buttonConeVolume.style.marginBottom = "5px";

const resultConeVolume = document.createElement("div");
resultConeVolume.style.fontStyle = "italic";

buttonConeVolume.addEventListener("click", () => {
  resultConeVolume.innerText = calculateConeVolume(5, 12);
});

task8Container.appendChild(buttonConeVolume);
task8Container.appendChild(resultConeVolume);
tasks.appendChild(task8Container);




/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const canFormTriangle = (a, b, c) => {
  const possible = a + b > c && a + c > b && b + c > a;
  console.log(`Strany: a=${a}, b=${b}, c=${c} → Trojúhelník: ${possible ? "ANO" : "NE"}`);
  return `Strany: a=${a}, b=${b}, c=${c} → Trojúhelník: ${possible ? "ANO" : "NE"}`;
};

const task9Container = document.createElement("div");
task9Container.style.marginBottom = "20px";

const buttonTriangle = document.createElement("button");
buttonTriangle.innerText = "Úloha 9 (Trojúhelník ano/ne)";
buttonTriangle.style.display = "block";
buttonTriangle.style.marginBottom = "5px";

const resultTriangle = document.createElement("div");
resultTriangle.style.fontStyle = "italic";

buttonTriangle.addEventListener("click", () => {
  resultTriangle.innerText = canFormTriangle(3, 4, 5);
});

task9Container.appendChild(buttonTriangle);
task9Container.appendChild(resultTriangle);
tasks.appendChild(task9Container);




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

const calculateTriangleArea = (a, b, c) => {
  const possible = a + b > c && a + c > b && b + c > a;
  if (!possible) {
    console.log(`Strany: a=${a}, b=${b}, c=${c} → Trojúhelník: NE`);
    return `Strany: a=${a}, b=${b}, c=${c} → Nelze vytvořit trojúhelník.`;
  }

  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  console.log(`Strany: a=${a}, b=${b}, c=${c} → Obsah: ${area.toFixed(2)}`);
  return `Strany: a=${a}, b=${b}, c=${c} → Obsah trojúhelníku: ${area.toFixed(2)}`;
};

const task10Container = document.createElement("div");
task10Container.style.marginBottom = "20px";

const buttonTriangleArea = document.createElement("button");
buttonTriangleArea.innerText = "Úloha 10 (Heronův vzorec)";
buttonTriangleArea.style.display = "block";
buttonTriangleArea.style.marginBottom = "5px";

const resultTriangleArea = document.createElement("div");
resultTriangleArea.style.fontStyle = "italic";

buttonTriangleArea.addEventListener("click", () => {
  resultTriangleArea.innerText = calculateTriangleArea(3, 4, 5);
});

task10Container.appendChild(buttonTriangleArea);
task10Container.appendChild(resultTriangleArea);
tasks.appendChild(task10Container);
