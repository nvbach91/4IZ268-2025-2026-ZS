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

const currentYear = 2025;
const pepeBirthYear = 1995;

console.log(`Pepe is ${currentYear - pepeBirthYear} years old.`);

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */

const celsiusValue = 20;
const fahrenheitValue = 68;

const convertedCelsiusToFahrenheit = celsiusValue * 9 / 5 + 32;
const convertedFahrenheitToCelsius = (fahrenheitValue - 32) * 5 / 9;

console.log(`${celsiusValue}°C = ${convertedCelsiusToFahrenheit}°F`);
console.log(`${fahrenheitValue}°F = ${convertedFahrenheitToCelsius}°C`);

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

// 1) Pepe's age
const pepeAge = (birthYear, currentYear) => {
    const age = currentYear - birthYear;
    console.log(`Pepe is ${age} years old.`);
};

// 2) Celsius & Fahrenheit convrsions
const convertTemperature = (temperature, unit) => {
    if (unit === 'C') {
        const fahrenheit = temperature * 9 / 5 + 32;
        console.log(`${temperature}°C = ${fahrenheit}°F`);
    }
    if (unit === 'F') {
        const celsius = (temperature - 32) * 5 / 9;
        console.log(`${temperature}°F = ${celsius}°C`);
    }
};

// Buttons
const tasksDiv = document.querySelector('#tasks');

const buttonTask1 = document.createElement('button');
buttonTask1.innerText = 'Task 1: Pepe\'s age';
buttonTask1.setAttribute('id', 'task-1');
buttonTask1.addEventListener('click', () => {
    pepeAge(1995, 2025);
    pepeAge(2002, 2025);
});
tasksDiv.appendChild(buttonTask1);

const buttonTask2 = document.createElement('button');
buttonTask2.innerText = 'Task 2: Celsius & Fahrenheit conversions';
buttonTask2.setAttribute('id', 'task-2');
buttonTask2.addEventListener('click', () => {
    convertTemperature(20, 'C');
    convertTemperature(68, 'F');
});
tasksDiv.appendChild(buttonTask2);

/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */

const calculatePercentage = (a, b) => {
    const result = document.querySelector('#results');
    result.innerHTML = '';

    if (b === 0) {
        result.innerText = 'Error: Division by zero';
        console.error('Division by zero');
        return;
    }

    const percentage = (a / b * 100).toFixed(2);

    const message = `${a} is ${percentage}% of ${b}`;
    result.innerText = message;
    console.log(message);
};

const buttonTask4 = document.createElement('button');
buttonTask4.innerText = 'Task 4: Calculate percentage';
buttonTask4.setAttribute('id', 'task-4');
buttonTask4.addEventListener('click', () => {
    calculatePercentage(30, 60);
   // calculatePercentage(100, 0);
});
tasksDiv.appendChild(buttonTask4);

/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */

const compareNumbers = (a, b) => {
    const result = document.querySelector('#results');
    result.innerHTML = '';
    
    let message = '';
    if (a > b) {
        message = `${a} is greater than ${b}`;
    }
    if (a < b) {
        message = `${a} is less than ${b}`;
    }
    if (a === b) {
        message = `${a} is equal to ${b}`;
    }

    result.innerText = message;
    console.log(message);
};

const buttonTask5 = document.createElement('button');
buttonTask5.innerText = 'Task 5: Compare numbers';
buttonTask5.setAttribute('id', 'task-5');
buttonTask5.addEventListener('click', () => {
    compareNumbers(1, 1);
    compareNumbers(1, 2);
    compareNumbers(2, 1);
});
tasksDiv.appendChild(buttonTask5);

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */

const printMultiplesOf13 = () => {
    const result = document.querySelector('#results');
    result.innerHTML = '';

    let message = '';
    for (let i = 0; i <= 730; i += 13) {
        message += i + (i < 730 ? ', ' : '');
        console.log(i);
    }

    result.innerText = 'Multiples of 13 up to 730:\n' + message;
};

const buttonTask6 = document.createElement('button');
buttonTask6.innerText = 'Task 6: Print multiples of 13';
buttonTask6.setAttribute('id', 'task-6');
buttonTask6.addEventListener('click', () => {
    printMultiplesOf13();
});
tasksDiv.appendChild(buttonTask6);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */

const calculateCircleArea = (radius) => {
    const result = document.querySelector('#results');
    result.innerHTML = '';

    if (radius <= 0) {
        result.innerText = 'Error: Radius must be greater than 0';
        console.error('Radius must be greater than 0');
        return;
    }

    const area = Math.PI * radius ** 2;
    result.innerText = 'Area of the circle with radius ' + radius + ' is ' + area;
    console.log('Area of the circle with radius ' + radius + ' is ' + area);
};

const buttonTask7 = document.createElement('button');
buttonTask7.innerText = 'Task 7: Calculate circle area';
buttonTask7.setAttribute('id', 'task-7');
buttonTask7.addEventListener('click', () => {
    calculateCircleArea(1);
    //calculateCircleArea(0);
});
tasksDiv.appendChild(buttonTask7);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */

const calculateConeVolume = (height, radius) => {
    const result = document.querySelector('#results');
    result.innerHTML = '';

    if (radius <= 0 || height <= 0) {
        result.innerText = 'Error: Radius and height must be greater than 0';
        console.error('Radius and height must be greater than 0');
        return;
    }

    const volume = Math.PI * radius ** 2 * height / 3;
    const message = 'Volume of the cone with height ' + height + ' and radius ' + radius + ' is ' + volume.toFixed(2);
    result.innerText = message;
    console.log(message);
};

const buttonTask8 = document.createElement('button');
buttonTask8.innerText = 'Task 8: Calculate cone volume';
buttonTask8.setAttribute('id', 'task-8');
buttonTask8.addEventListener('click', () => {
    calculateConeVolume(1, 1);
    //calculateConeVolume(0, 1);
});
tasksDiv.appendChild(buttonTask8);

/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */

const isTriangle = (a, b, c) => {
    const result = document.querySelector('#results');
    result.innerHTML = '';
    
    console.log('Checking sides: a = ' + a + ', b = ' + b + ', c = ' + c);

    if (a <= 0 || b <= 0 || c <= 0) {
        result.innerText = 'Error: All sides must be greater than 0';
        console.error('All sides must be greater than 0');
        return false;
    }

    const canFormTriangle = (a + b > c) && (a + c > b) && (b + c > a);

    let message = 'Sides: a = ' + a + ', b = ' + b + ', c = ' + c + '\n';
    if (canFormTriangle) {
        message += 'Yes, it can form a triangle';
    } else {
        message += 'No, it cannot form a triangle';
    }

    result.innerText = message;
    console.log(message);
    return canFormTriangle;
};

const buttonTask9 = document.createElement('button');
buttonTask9.innerText = 'Task 9: Check if triangle can be formed';
buttonTask9.setAttribute('id', 'task-9');
buttonTask9.addEventListener('click', () => {
    isTriangle(1, 1, 1);
    isTriangle(3, 4, 5);
    // isTriangle(1, 2, 3);
});
tasksDiv.appendChild(buttonTask9);

/**
 * 10) Heroic performance. Vytvořte funkci, která vypočte a vypíše obsah trojúhelníka podle Heronova vzorce, 
 * tj. funkce dostane délky všech 3 stran. Použijte přitom předchozí validaci v úloze č. 9, tj. počítejte pouze, 
 * když to má smysl. Hint: funkce pro odmocninu je Math.sqrt().
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */

const calculateTriangleArea = (a, b, c) => {
    const result = document.querySelector('#results');
    result.innerHTML = '';
    
    if (!isTriangle(a, b, c)) {
        result.innerText = 'Error: Invalid triangle sides';
        console.error('Invalid triangle sides');
        return;
    }

    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    const message = 'Area of the triangle with sides ' + a + ', ' + b + ' and ' + c + ' is ' + area.toFixed(2);
    result.innerText = message;
    console.log(message);
};

const buttonTask10 = document.createElement('button');
buttonTask10.innerText = 'Task 10: Calculate triangle area';
buttonTask10.setAttribute('id', 'task-10');
buttonTask10.addEventListener('click', () => {
    calculateTriangleArea(3, 4, 5);
    // calculateTriangleArea(1, 2, 3);
});
tasksDiv.appendChild(buttonTask10);