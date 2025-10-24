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

// Globální selektory pro kontejnery
const tasksContainer = document.querySelector('#tasks');
const resultsContainer = document.querySelector('#results');


/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here
const yearOfBirth = 1995;
const currentYear = new Date().getFullYear();
const pepesAge = currentYear - yearOfBirth;
console.log(`Pepovi je ${pepesAge} let, narodil se v roce ${yearOfBirth}.`);


/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here
const temperatureCelsius = 20;
const temperatureFahrenheitFromC = (temperatureCelsius * 9 / 5) + 32;
console.log(`${temperatureCelsius}°C = ${temperatureFahrenheitFromC}°F`);

const temperatureFahrenheit = 68;
const temperatureCelsiusFromF = (temperatureFahrenheit - 32) * 5 / 9;
console.log(`${temperatureFahrenheit}°F = ${temperatureCelsiusFromF}°C`);


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


// --- Funkce pro Úlohu 1 ---
const logPepesAge = (birthYear) => {
    const age = new Date().getFullYear() - birthYear;
    console.log(`(Funkce) Pepovi je ${age} let, narodil se v roce ${birthYear}.`);
};

// Zavolání v konzoli
logPepesAge(1990);
logPepesAge(2003);

// Tlačítko pro Úlohu 1
const buttonTask1 = document.createElement('button');
buttonTask1.innerText = 'Úloha 1 (Pepe\'s age)';
buttonTask1.setAttribute('id', 'task-1');
buttonTask1.addEventListener('click', () => {
    logPepesAge(1985);
});
tasksContainer.appendChild(buttonTask1);


// --- Funkce pro Úlohu 2 ---
const convertCelsiusToF = (celsius) => {
    const fahrenheit = (celsius * 9 / 5) + 32;
    console.log(`(Funkce) ${celsius}°C = ${fahrenheit}°F`);
};

const convertFahrenheitToC = (fahrenheit) => {
    const celsius = (fahrenheit - 32) * 5 / 9;
    console.log(`(Funkce) ${fahrenheit}°F = ${celsius.toFixed(2)}°C`);
};

// Zavolání v konzoli
convertCelsiusToF(100);
convertFahrenheitToC(100);

// Tlačítko pro Úlohu 2
const buttonTask2 = document.createElement('button');
buttonTask2.innerText = 'Úloha 2 (WTF)';
buttonTask2.setAttribute('id', 'task-2');
buttonTask2.addEventListener('click', () => {
    console.log('--- Kliknutí na Úlohu 2 ---');
    convertCelsiusToF(25);
    convertFahrenheitToC(77);
});
tasksContainer.appendChild(buttonTask2);


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
    if (whole === 0) {
        resultsContainer.innerText = 'Chyba: Nelze dělit nulou!';
        return;
    }
    const percentage = (part / whole) * 100;
    resultsContainer.innerText = `${part} je ${percentage.toFixed(2)}% z ${whole}.`;
};

// Tlačítko pro Úlohu 4
const buttonTask4 = document.createElement('button');
buttonTask4.innerText = 'Úloha 4 (%CENSORED%)';
buttonTask4.setAttribute('id', 'task-4');
buttonTask4.addEventListener('click', () => {
    calculatePercentage(21, 42);
});
tasksContainer.appendChild(buttonTask4);

// Tlačítko pro Úlohu 4 (dělení nulou)
const buttonTask4b = document.createElement('button');
buttonTask4b.innerText = 'Úloha 4 (Dělení 0)';
buttonTask4b.setAttribute('id', 'task-4b');
buttonTask4b.addEventListener('click', () => {
    calculatePercentage(10, 0);
});
tasksContainer.appendChild(buttonTask4b);


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
    let message = '';
    if (a > b) {
        message = `${a} je větší než ${b}.`;
    } else if (b > a) {
        message = `${b} je větší než ${a}.`;
    } else {
        message = `${a} a ${b} se rovnají.`;
    }
    resultsContainer.innerText = message;
};

// Tlačítka pro Úlohu 5
const buttonTask5a = document.createElement('button');
buttonTask5a.innerText = 'Úloha 5 (10 vs 5)';
buttonTask5a.setAttribute('id', 'task-5a');
buttonTask5a.addEventListener('click', () => compareNumbers(10, 5));
tasksContainer.appendChild(buttonTask5a);

const buttonTask5b = document.createElement('button');
buttonTask5b.innerText = 'Úloha 5 (0.2 vs 0.7)';
buttonTask5b.setAttribute('id', 'task-5b');
buttonTask5b.addEventListener('click', () => compareNumbers(0.2, 0.7));
tasksContainer.appendChild(buttonTask5b);

const buttonTask5c = document.createElement('button');
buttonTask5c.innerText = 'Úloha 5 (1/2 vs 0.5)';
buttonTask5c.setAttribute('id', 'task-5c');
buttonTask5c.addEventListener('click', () => compareNumbers(1 / 2, 0.5));
tasksContainer.appendChild(buttonTask5c);


/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here
const showMultiplesOf13 = () => {
    let multiples = [];
    for (let i = 0; i <= 730; i += 13) {
        multiples.push(i);
    }
    resultsContainer.innerText = `Násobky 13 (<= 730): ${multiples.join(', ')}`;
};

// Tlačítko pro Úlohu 6
const buttonTask6 = document.createElement('button');
buttonTask6.innerText = 'Úloha 6 (Násobky 13)';
buttonTask6.setAttribute('id', 'task-6');
buttonTask6.addEventListener('click', showMultiplesOf13);
tasksContainer.appendChild(buttonTask6);


/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here
const calculateCircleArea = (radius) => {
    if (radius < 0) {
        resultsContainer.innerText = 'Chyba: Poloměr nemůže být záporný.';
        return;
    }
    const area = Math.PI * Math.pow(radius, 2);
    resultsContainer.innerText = `Obsah kružnice s poloměrem ${radius} je ${area.toFixed(3)}.`;
};

// Tlačítko pro Úlohu 7
const buttonTask7 = document.createElement('button');
buttonTask7.innerText = 'Úloha 7 (Obsah kružnice)';
buttonTask7.setAttribute('id', 'task-7');
buttonTask7.addEventListener('click', () => calculateCircleArea(10));
tasksContainer.appendChild(buttonTask7);


/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here
const calculateConeVolume = (height, radius) => {
    if (height < 0 || radius < 0) {
        resultsContainer.innerText = 'Chyba: Výška ani poloměr nemohou být záporné.';
        return;
    }
    const volume = (1 / 3) * Math.PI * Math.pow(radius, 2) * height;
    resultsContainer.innerText = `Objem kuželu (výška ${height}, poloměr ${radius}) je ${volume.toFixed(3)}.`;
};

// Tlačítko pro Úlohu 8
const buttonTask8 = document.createElement('button');
buttonTask8.innerText = 'Úloha 8 (Objem kuželu)';
buttonTask8.setAttribute('id', 'task-8');
buttonTask8.addEventListener('click', () => calculateConeVolume(12, 5));
tasksContainer.appendChild(buttonTask8);


/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

// Pomocná funkce, která jen vrací boolean (pro Úlohu 10)
const isValidTriangle = (a, b, c) => {
    // Kontrola, zda jsou všechny strany kladné
    if (a <= 0 || b <= 0 || c <= 0) {
        return false;
    }
    // Trojúhelníková nerovnost
    return (a + b > c) && (a + c > b) && (b + c > a);
};

// Hlavní funkce pro Úlohu 9, která vypisuje výsledek
const checkTriangle = (a, b, c) => {
    const isValid = isValidTriangle(a, b, c);
    let message = `Ze stran ${a}, ${b}, ${c} `;
    
    if (isValid) {
        message += 'LZE sestrojit trojúhelník. (Odpověď: ANO)';
    } else {
        message += 'NELZE sestrojit trojúhelník. (Odpověď: NE)';
    }
    
    resultsContainer.innerText = message;
    return isValid;
};

// Tlačítka pro Úlohu 9
const buttonTask9a = document.createElement('button');
buttonTask9a.innerText = 'Úloha 9 (Trojúhelník ANO)';
buttonTask9a.setAttribute('id', 'task-9a');
buttonTask9a.addEventListener('click', () => checkTriangle(3, 4, 5));
tasksContainer.appendChild(buttonTask9a);

const buttonTask9b = document.createElement('button');
buttonTask9b.innerText = 'Úloha 9 (Trojúhelník NE)';
buttonTask9b.setAttribute('id', 'task-9b');
buttonTask9b.addEventListener('click', () => checkTriangle(1, 2, 5));
tasksContainer.appendChild(buttonTask9b);


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
const calculateHeronsFormula = (a, b, c) => {
//   - krok 1.1 - pomocí selektoru vyberte container pro výpis výsledků a uložte ho do proměnné
 
//   - krok 1.2 - zvalidujte vstupní argumenty pomocí funkce z úlohy č. 9
    if (!isValidTriangle(a, b, c)) {
//     - v případě nevalidních hodnot vypište chybovou hlášku na místo pro výpis výsledků a funkci ukončete
        resultsContainer.innerText = `Zadané strany (${a}, ${b}, ${c}) netvoří platný trojúhelník. Obsah nelze vypočítat.`;
        return;
    }
    
//     - v případě validních hodnot pokračujte s výpočtem
//   - krok 1.3 - spočítejte obsah trojúhelníku podle Heronovy vzorce a výsledek uložte do proměnné
    const s = (a + b + c) / 2; // semi-perimeter (poloobvod)
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    
//   - krok 1.4 - vypište výsledek na místo pro výpis výsledků
    resultsContainer.innerText = `Obsah trojúhelníka se stranami ${a}, ${b}, ${c} je ${area.toFixed(3)}.`;
};


// - krok 2 - vytvořte tlačítko
const buttonTask10 = document.createElement('button');
buttonTask10.innerText = 'Úloha 10 (Heronův vzorec)';
buttonTask10.setAttribute('id', 'task-10');

// - krok 3 - nabindujte na toto tlačítko callback
buttonTask10.addEventListener('click', () => {
    calculateHeronsFormula(5, 6, 7); // Statické argumenty
});

// - krok 4 - tlačítko umístěte na stránku
tasksContainer.appendChild(buttonTask10);

// - krok 5 - otestujte řešení klikáním na tlačítko (hotovo)