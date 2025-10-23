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
var birthYear = 2005;
var currentYear = 2025;
var age = currentYear - birthYear;
console.log("Pepe's age is " + age + " years.");




/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
var celsius = 20;
var fahrenheit = (celsius * 9/5) + 32;
console.log(celsius + "°C = " + fahrenheit + "°F");

var fahrenheit2 = 68;
var celsius2 = (fahrenheit2 - 32) * 5/9;
console.log(fahrenheit2 + "°F = " + celsius2 + "°C");





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

// Úloha 1
const calculateAge = (birthYear, currentYear) => {
    const age = currentYear - birthYear;
    console.log(`Pepe's age is ${age} years. (Birth year: ${birthYear}, Current year: ${currentYear})`);
};

// Úloha 2
const celsiusToFahrenheit = (celsius) => {
    const fahrenheit = (celsius * 9/5) + 32;
    console.log(`${celsius}°C = ${fahrenheit}°F`);
};

const fahrenheitToCelsius = (fahrenheit) => {
    const celsius = (fahrenheit - 32) * 5/9;
    console.log(`${fahrenheit}°F = ${celsius}°C`);
};

calculateAge(2005, 2025);
calculateAge(1990, 2025);
calculateAge(2000, 2025);

celsiusToFahrenheit(20);
celsiusToFahrenheit(0);
celsiusToFahrenheit(69);

fahrenheitToCelsius(69);
fahrenheitToCelsius(420);
fahrenheitToCelsius(0);

document.getElementById('task-1').addEventListener('click', () => {
    calculateAge(2005, 2025);
});

document.getElementById('task-2a').addEventListener('click', () => {
    celsiusToFahrenheit(20);
});

document.getElementById('task-2b').addEventListener('click', () => {
    fahrenheitToCelsius(68);
});

/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */


const calculatePercentage = (part, whole) => {
    if (whole === 0) {
        return 'Error: division by zero';
    }
    const percent = ((part / whole) * 100).toFixed(2);
    return `${part} is ${percent}% of ${whole}`;
};


document.getElementById('task-4').addEventListener('click', () => {
    const results = document.getElementById('results');
    if (results) results.textContent = `Result: ${calculatePercentage(21, 42)}`;
});



/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
const compareNumbers = (a, b) => {
    const results = document.getElementById('results');
    let message;
    if (a > b) {
        message = `${a} is greater than ${b}`;
    } else if (a < b) {
        message = `${b} is greater than ${a}`;
    } else {
        message = `${a} and ${b} are equal`;
    }
    console.log(message);
    if (results) results.textContent = `Result: ${message}`;
    return message;
};

document.getElementById('task-5').addEventListener('click', () => {
    compareNumbers(0.2, 0.02);
});





/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
const printMultiplesOf13 = () => {
    const results = document.getElementById('results');
    let multiples = [];
    for (let i = 0; i <= 730; i += 13) {
        multiples.push(i);
    }
    const output = multiples.join(', ');
    if (results) results.textContent = `Result: ${output}`;
    return output;
}

document.getElementById('task-6').addEventListener('click', () => {
    printMultiplesOf13();
});



/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */

const calculateCircleArea = (radius) => {
    const results = document.getElementById('results');
    const area = Math.PI * Math.pow(radius, 2);
    if (results) results.textContent = `Result: ${area.toFixed(2)}`;
    return area;
};

document.getElementById('task-7').addEventListener('click', () => {
    calculateCircleArea(6.9);
});





/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
const calculateConeVolume = (height, radius) => {
    const results = document.getElementById('results');
    const volume = ((1/3) * Math.PI * Math.pow(radius, 2) * height).toFixed(2);
    if (results) results.textContent = `Result: ${volume}`;
    return volume;
};

document.getElementById('task-8').addEventListener('click', () => {
    calculateConeVolume(10, 6.9);
});




/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
const canFormTriangle = (a, b, c) => {
    const results = document.getElementById('results');
    const canForm = (a + b > c) && (a + c > b) && (b + c > a);
    const message = `Sides: a=${a}, b=${b}, c=${c} => Can form triangle: ${canForm}`;
    if (results) results.textContent = `Result: ${message}`;
    return canForm;
};

document.getElementById('task-9').addEventListener('click', () => {
    canFormTriangle(3, 4, 5);
});





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

const heronArea = (a, b, c) => {
    const results = document.getElementById('results');
    if (!canFormTriangle(a, b, c)) {
        if (results) results.textContent = 'Result: invalid triangle';
        return null;
    }
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    if (results) results.textContent = `Result: ${area.toFixed(2)}`;
    return area;
};

document.getElementById('task-10').addEventListener('click', () => {
    heronArea(3, 4, 5);
});


