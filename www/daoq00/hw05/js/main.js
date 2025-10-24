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
const birthYear = 2004;
const currentYear = new Date().getFullYear();
const pepeAge = currentYear - birthYear;
console.log('Pepe is ' + pepeAge + ' years old.');
/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here
const celsiusTemp = 20;
const celsiusToFahrenheit = (celsiusTemp * 9) / 5 + 32;
console.log(celsiusTemp + '°C = ' + celsiusToFahrenheit + '°F');

const fahrenheitTemp = 68;
const fahrenheitToCelsius = ((fahrenheitTemp - 32) * 5) / 9;
console.log(fahrenheitTemp + '°F = ' + fahrenheitToCelsius + '°C');

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
const getPepesAge = (birthYear) => {
    const currentYear = new Date().getFullYear();
    const pepeAge = currentYear - birthYear;
    return ('Pepe is ' + pepeAge + ' years old.');
};

const convertCelsiusToFahrenheit = (celsius) => {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return (celsius + '°C = ' + fahrenheit + '°F');
};

const convertFahrenheitToCelsius = (fahrenheit) => {
    const celsius = ((fahrenheit - 32) * 5) / 9;
    return ((fahrenheit + '°F = ' + celsius + '°C'));
};

const tasks = document.querySelector('#tasks');

const buttonTask1 = document.createElement('button');
buttonTask1.innerText = "Úloha 1 (Pepe's age)";
buttonTask1.id = 'task-1';
buttonTask1.addEventListener('click', () => {
    console.log(getPepesAge(2004));
});
tasks.appendChild(buttonTask1);

const buttonTask2a = document.createElement('button');
buttonTask2a.innerText = 'Úloha 2a (WTF - teploty)';
buttonTask2a.id = 'task-2a';
buttonTask2a.addEventListener('click', () => {
    console.log(convertCelsiusToFahrenheit(20));
});
tasks.appendChild(buttonTask2a);

const buttonTask2b = document.createElement('button');
buttonTask2b.innerText = 'Úloha 2b (WTF - teploty)';
buttonTask2b.id = 'task-2b';
buttonTask2b.addEventListener('click', () => {
    console.log(convertFahrenheitToCelsius(68));
});
tasks.appendChild(buttonTask2b);

/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla.
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2);
 * Pozor na dělení nulou!
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here
const calculatePercentage = (a, b) => {
    const resultsCalc = document.querySelector('#results');
    if (b === 0) {
        resultsCalc.innerText = "Nelze dělit nulou";
        return;
    }
    const percentage = (a / b) * 100;
    const formatted = percentage.toFixed(2);
    resultsCalc.innerText = a + ' je ' + formatted + '% z ' + b;
};

const buttonTask4 = document.createElement('button');
buttonTask4.innerText = 'Úloha 4 (%CENSORED%)';
buttonTask4.id = 'task-4';
buttonTask4.addEventListener('click', () => {
    calculatePercentage(67, 246);
});
tasks.appendChild(buttonTask4);

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
    const resultsComp = document.querySelector('#results');

    if (a > b) {
        resultsComp.innerText = a + ' je větší než ' + b;
    } else if (a < b) {
        resultsComp.innerText = b + ' je větší než ' + a;
    } else {
        resultsComp.innerText = a + ' se rovná ' + b;
    }
};

const buttonInt = document.createElement('button');
buttonInt.innerText = 'Úloha 5 (Celá čísla)';
buttonInt.id = 'task-5a';
buttonInt.addEventListener('click', () => {
    compareNumbers(10, 5);
});
tasks.appendChild(buttonInt);

const buttonFloat = document.createElement('button');
buttonFloat.innerText = 'Úloha 5 (Desetinná čísla)';
buttonFloat.id = 'task-5b';
buttonFloat.addEventListener('click', () => {
    compareNumbers(3.14, 3.1415);
});
tasks.appendChild(buttonFloat);

const buttonFraction = document.createElement('button');
buttonFraction.innerText = 'Úloha 5 (Zlomky)';
buttonFraction.id = 'task-5c';
buttonFraction.addEventListener('click', () => {
    compareNumbers(1 / 2, 2 / 3);
});
tasks.appendChild(buttonFraction)

const buttonEqual = document.createElement('button');
buttonEqual.innerText = 'Úloha 5 (Rovnost)';
buttonEqual.id = 'task-5d';
buttonEqual.addEventListener('click', () => {
    compareNumbers(42, 42);
});
tasks.appendChild(buttonEqual);
/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší
 * nebo rovno 730, včetě nuly. Používejte for cyklus.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here
const showMultiplesOf13 = () => {
    const resultsMultiple = document.querySelector('#results');
    let output = '';

    for (let i = 0; i <= 730; i += 13) {
        output = output + i + ' ';
    }

    resultsMultiple.innerText = output;
};
const buttonTask6 = document.createElement('button');
buttonTask6.innerText = 'Úloha 6 (Násobky 13)';
buttonTask6.id = 'task-6';
buttonTask6.addEventListener('click', () => {
    showMultiplesOf13();
});
tasks.appendChild(buttonTask6);
/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const calculateCircleArea = (radius) => {
    const resultsCircle = document.querySelector('#results');
    if (radius <= 0) {
        resultsCircle.innerText = 'Poloměr musí být kladné číslo!';
        return;
    }
    const area = Math.PI * radius * radius;
    const rounded = area.toFixed(2);
    resultsCircle.innerText = 'Obsah kružnice s poloměrem ' + radius + ' je ' + rounded;
};
const buttonTask7 = document.createElement('button');
buttonTask7.innerText = 'Úloha 7 (Obsah kružnice)';
buttonTask7.id = 'task-7';
buttonTask7.addEventListener('click', () => {
    calculateCircleArea(30);
});
tasks.appendChild(buttonTask7);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const calculateConeVolume = (radius, height) => {
    const resultsCone = document.querySelector('#results');

    // kontrola platnosti vstupů
    if (radius <= 0 || height <= 0) {
        resultsCone.innerText = 'Poloměr a výška musí být kladná čísla!';
        return;
    }

    const volume = (1 / 3) * Math.PI * radius * radius * height;
    const rounded = volume.toFixed(2);

    resultsCone.innerText = 'Objem kuželu' + ' je ' + rounded;
};
const buttonTask8 = document.createElement('button');
buttonTask8.innerText = 'Úloha 8 (Objem kuželu)';
buttonTask8.id = 'task-8';
buttonTask8.addEventListener('click', () => {
    const height = 5;
    const radius = 10;
    calculateConeVolume(height, radius);
});
tasks.appendChild(buttonTask8);
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
    const resultsTriangle = document.querySelector('#results');
    let canFormTriangle = false;

    if (a + b > c && a + c > b && b + c > a) {
        canFormTriangle = true;
        resultsTriangle .innerText = 'Ze stran ' + a + ', ' + b + ', ' + c + ' lze postavit trojúhelník';
    } else {
        resultsTriangle .innerText = 'Ze stran ' + a + ', ' + b + ', ' + c + ' nelze postavit trojúhelník';
    }

    return canFormTriangle;
};

const buttonTask9 = document.createElement('button');
buttonTask9.innerText = 'Úloha 9 (Not sure if triangle, or just some random values)';
buttonTask9.id = 'task-9';
buttonTask9.addEventListener('click', () => {
    isTriangle(20, 21, 25);
});

tasks.appendChild(buttonTask9);
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
const isTriangleHeror = (a, b, c) => {
  return (a + b > c && a + c > b && b + c > a);
};
const calculateTriangleArea = (a, b, c) => {
  const resultsTriang = document.querySelector('#results');
  if (!isTriangle(a, b, c)) {
    resultsTriang.innerText = 'Zadané strany ' + a + ', ' + b + ', ' + c + ' netvoří trojúhelník';
    return;
  }
  const s = (a + b + c) / 2; 
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  const rounded = area.toFixed(2);
  resultsTriang.innerText = 'Obsah trojúhelníku se stranami ' + a + ', ' + b + ', ' + c + ' je ' + rounded;
};

const buttonTask10 = document.createElement('button');
buttonTask10.innerText = 'Úloha 10 (Heronův vzorec)';
buttonTask10.id = 'task-10';
buttonTask10.addEventListener('click', () => {
  calculateTriangleArea(5, 6, 8);
});
tasks.appendChild(buttonTask10);

