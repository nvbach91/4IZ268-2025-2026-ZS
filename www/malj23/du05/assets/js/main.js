console.log("Hello, World!");

// result helpers
const _results = document.querySelector('#results');
function writeResult(text) {
    if (!_results) return;
    _results.innerText = text;
}
function appendResult(text) {
    if (!_results) return;
    if (_results.innerText) _results.innerText += '\n' + text;
    else _results.innerText = text;
}


/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here
const pepeBirthYear = 1990;
const currentYear = 2025;
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
console.log(`${celsiusTemp}°C = ${fahrenheitTemp}°F`);

const fahrenheitTemp2 = 68;
const celsiusTemp2 = (fahrenheitTemp2 - 32) * (5 / 9);
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
    writeResult(`Pepe is ${age} years old.`);
}

const calculateFahrenheitTemp = (celsiusTemp) => {
    const fahrenheitTemp = (celsiusTemp * 9) / 5 + 32;
    writeResult(`${celsiusTemp}°C = ${fahrenheitTemp}°F`);
}

const calculateCelsiusTemp = (fahrenheitTemp) => {
    const celsiusTemp = (fahrenheitTemp - 32) * (5 / 9);
    writeResult(`${fahrenheitTemp}°F = ${celsiusTemp}°C`);
}   
// Create button for Pepe's age
const buttonPepeAge = document.createElement('button');
buttonPepeAge.innerText = "Uloha 1 (Pepe's age)";
buttonPepeAge.setAttribute('id', 'task-1');
buttonPepeAge.addEventListener('click', () => {
    calculatePepeAge(1990);
});
const tasks = document.querySelector('#tasks');
tasks.appendChild(buttonPepeAge);

// Create button for Fahrenheit to Celsius
const buttonFahrenheitToCelsius = document.createElement('button');
buttonFahrenheitToCelsius.innerText = "Uloha 2 (Fahrenheit to Celsius)";
buttonFahrenheitToCelsius.setAttribute('id', 'task-2');
buttonFahrenheitToCelsius.addEventListener('click', () => {
    calculateFahrenheitTemp(20);
});
tasks.appendChild(buttonFahrenheitToCelsius);

// Create button for Celsius to Fahrenheit
const buttonCelsiusToFahrenheit = document.createElement('button');
buttonCelsiusToFahrenheit.innerText = "Uloha 3 (Celsius to Fahrenheit)";
buttonCelsiusToFahrenheit.setAttribute('id', 'task-3');
buttonCelsiusToFahrenheit.addEventListener('click', () => {
    calculateCelsiusTemp(68);
});
tasks.appendChild(buttonCelsiusToFahrenheit);



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
        writeResult("Error: Division by zero is not allowed.");
        return;
    }
    const percentage = (part / whole) * 100;
    writeResult(`${part} is ${percentage.toFixed(2)}% of ${whole}.`);
};
// Create button for Percentage calculation
const buttonPercentage = document.createElement('button');
buttonPercentage.innerText = "Uloha 4 (%CENSORED%)";
buttonPercentage.setAttribute('id', 'task-4');
buttonPercentage.addEventListener('click', () => {
    calculatePercentage(21, 42);
});
tasks.appendChild(buttonPercentage);


/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here
const compareNumbers = (number1, number2) => {
    if (number1 > number2) {
        writeResult(`${number1} is greater than ${number2}.`);
    } else if (number2 > number1) {
        writeResult(`${number2} is greater than ${number1}.`);
    } else {
        writeResult(`${number1} is equal to ${number2}.`);
    }
};
// Create button for Number comparison
const buttonNumberComparison = document.createElement('button');
buttonNumberComparison.innerText = "Uloha 5 (Kdo s koho)";
buttonNumberComparison.setAttribute('id', 'task-5');
buttonNumberComparison.addEventListener('click', () => {
    compareNumbers(42, 21);
});
tasks.appendChild(buttonNumberComparison);
const buttonNumberComparison2 = document.createElement('button');
buttonNumberComparison2.innerText = "Uloha 5 (Kdo s koho) - Decimal";
buttonNumberComparison2.setAttribute('id', 'task-5-decimal');
buttonNumberComparison2.addEventListener('click', () => {
    compareNumbers(3.14, 2.71);
});
tasks.appendChild(buttonNumberComparison2);
const buttonNumberComparison3 = document.createElement('button');
buttonNumberComparison3.innerText = "Uloha 5 (Kdo s koho) - Equal";
buttonNumberComparison3.setAttribute('id', 'task-5-equal');
buttonNumberComparison3.addEventListener('click', () => {
    compareNumbers(42, 42);
});
tasks.appendChild(buttonNumberComparison3);


/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here
const printMultiplesOf13 = () => {
    if (_results) _results.innerText = '';
    for (let i = 0; i <= 730; i += 13) {
        appendResult(i);
    }
};
// Create button for Multiples of 13
const buttonMultiplesOf13 = document.createElement('button');
buttonMultiplesOf13.innerText = "Uloha 6 (I can cleary see the pattern)";
buttonMultiplesOf13.setAttribute('id', 'task-6');
buttonMultiplesOf13.addEventListener('click', () => {
    printMultiplesOf13();
});
tasks.appendChild(buttonMultiplesOf13);


/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here
const calculateCircleArea = (radius) => {
    const area = Math.PI * radius * radius;
    writeResult(`The area of the circle with radius ${radius} is ${area.toFixed(2)}.`);
};
// Create button for Circle area calculation
const buttonCircleArea = document.createElement('button');
buttonCircleArea.innerText = "Uloha 7 (Around and about)";
buttonCircleArea.setAttribute('id', 'task-7');
buttonCircleArea.addEventListener('click', () => {
    calculateCircleArea(5);
});
tasks.appendChild(buttonCircleArea);




/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here
const calculateConeVolume = (radius, height) => {
    const volume = (1/3) * Math.PI * radius * radius * height;
    writeResult(`The volume of the cone with radius ${radius} and height ${height} is ${volume.toFixed(2)}.`);
};
// Create button for Cone volume calculation
const buttonConeVolume = document.createElement('button');
buttonConeVolume.innerText = "Uloha 8 (Another dimension)";
buttonConeVolume.setAttribute('id', 'task-8');
buttonConeVolume.addEventListener('click', () => {
    calculateConeVolume(5, 10);
});
tasks.appendChild(buttonConeVolume);



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
    if (a + b > c && a + c > b && b + c > a) {
        writeResult(`The triangle with sides ${a}, ${b}, and ${c} is a triangle.`);
        return true;
    } else {
        writeResult(`The triangle with sides ${a}, ${b}, and ${c} is not a triangle.`);
        return false;
    }
};
// Create button for Triangle check
const buttonTriangle = document.createElement('button');
buttonTriangle.innerText = "Uloha 9 (Not sure if triangle, or just some random values)";
buttonTriangle.setAttribute('id', 'task-9');
buttonTriangle.addEventListener('click', () => {
    isTriangle(3, 4, 5);
});
tasks.appendChild(buttonTriangle);






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
const calculateTriangleAreaHeron = (a, b, c) => {
    const resultsContainer = document.querySelector('#results');
    if (!isTriangle(a, b, c)) {
        writeResult("The triangle with sides a, b, and c is not a triangle.");
        return;
    }
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    writeResult(`The area of the triangle with sides ${a}, ${b}, and ${c} is ${area.toFixed(2)}.`);
};
// Create button for Triangle area calculation
const buttonTriangleArea = document.createElement('button');
buttonTriangleArea.innerText = "Uloha 10 (Heroic performance)";
buttonTriangleArea.setAttribute('id', 'task-10');
buttonTriangleArea.addEventListener('click', () => {
    calculateTriangleAreaHeron(3, 4, 1);
});
tasks.appendChild(buttonTriangleArea);
