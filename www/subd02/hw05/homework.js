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
console.log('Ahoj světe!');

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození,
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných
 * používejte smysluplnou angličtinu.
 */
// Solution here
const birthYear = 2004;
const currentYear = new Date().getFullYear();
const age = currentYear - birthYear;
console.log("Pepe's age is " + age);

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak.
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32.
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9.
 */
// Solution here
const celsius = 8;
const convertCeliusToFahrenheiht = ((celsius * 9) / 5) + 32;
console.log(celsius + "°C = " + convertCeliusToFahrenheiht + "°F");

const fahrenheiht = 100;
const convertFahrenheihtToCelsius = ((fahrenheiht - 32) * 5) / 9;
console.log(fahrenheiht + "°F = " + convertFahrenheihtToCelsius + "°C");

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
const getCeliusToFahrenheiht = (celsius) => {
    const convertCeliusToFahrenheiht = ((celsius * 9) / 5) + 32;
    console.log(celsius + "°C = " + convertCeliusToFahrenheiht + "°F");
}

const getFahrenheihtToCelsius = (fahrenheiht) => {
    const convertFahrenheihtToCelsius = ((fahrenheiht - 32) * 5) / 9;
    console.log(fahrenheiht + "°F = " + convertFahrenheihtToCelsius + "°C");
}

const getPepesAge = (yearOfBirth) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearOfBirth;
    console.log("Pepe's age is " + age);
}

const tasks = document.querySelector('#tasks');

const buttonGetPepesAge = document.createElement('button');
buttonGetPepesAge.innerText = "Get Pepe's age";
buttonGetPepesAge.setAttribute('id', 'task-1');
buttonGetPepesAge.addEventListener('click', () => {
    getPepesAge(2000);
});
tasks.appendChild(buttonGetPepesAge);

const buttonGetCeliusToFahrenheiht = document.createElement('button');
buttonGetCeliusToFahrenheiht.innerText = "Convert celsius to fahrenheiht";
buttonGetCeliusToFahrenheiht.setAttribute('id', 'task-2-1');
buttonGetCeliusToFahrenheiht.addEventListener('click', () => {
    getCeliusToFahrenheiht(30);
});
tasks.appendChild(buttonGetCeliusToFahrenheiht);

const buttonGetFahrenheihtToCelsius = document.createElement('button');
buttonGetFahrenheihtToCelsius.innerText = 'Convert fahrenheiht to celsius';
buttonGetFahrenheihtToCelsius.setAttribute('id', 'task-2-2');
buttonGetFahrenheihtToCelsius.addEventListener('click', () => {
    getFahrenheihtToCelsius(120);
});
tasks.appendChild(buttonGetFahrenheihtToCelsius);

/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla.
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2);
 * Pozor na dělení nulou!
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here
const results = document.querySelector('#results');
const resultGetPercentageOfNumbers = document.createElement('p');
resultGetPercentageOfNumbers.innerText = "Task 4: ";
results.appendChild(resultGetPercentageOfNumbers);

const getPercentageOfNumbers = (a, b) => {
    var result;
    if (typeof a !== "number" || typeof b !== "number") {
        result = "Both arguments must be numbers";
    }
    else if (b === 0) {
        result = "Division by zero is not allowed";
    }
    else {
        const percent = (a / b) * 100;
        const fixedPercent = percent.toFixed(2);
        result = a + " is " + fixedPercent + " % of " + b;
    }
    resultGetPercentageOfNumbers.append(result);
}

const buttonGetPercentageOfNumbers = document.createElement('button');
buttonGetPercentageOfNumbers.innerText = "Get percentage of two numbers";
buttonGetPercentageOfNumbers.setAttribute('id', 'task-4');
buttonGetPercentageOfNumbers.addEventListener('click', () => {
    getPercentageOfNumbers(10, 20);
});
tasks.appendChild(buttonGetPercentageOfNumbers);

/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají.
 *
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here
const resultGetComparedNumbers = document.createElement('p');
resultGetComparedNumbers.innerText = "Task 5: ";
results.appendChild(resultGetComparedNumbers);

const compareNumbers = (a, b) => {
    var result;
    if (typeof a !== "number" || typeof b !== "number") {
        result = "Both arguments must be numbers";
    }
    else if (a > b) {
        result = a + ">" + b + " ";
    }
    else if (a < b) {
        result = a + "<" + b + " ";
    }
    else if (a === b) {
        result = a + "=" + b + " ";
    }
    resultGetComparedNumbers.append(result);
}

const buttonCompareWholeNumbers = document.createElement('button');
buttonCompareWholeNumbers.innerText = "Compare whole numbers";
buttonCompareWholeNumbers.setAttribute('id', 'task-5-1');
buttonCompareWholeNumbers.addEventListener('click', () => {
    compareNumbers(10, 15);
});
tasks.appendChild(buttonCompareWholeNumbers);

const buttonCompareDecimalNumbers = document.createElement('button');
buttonCompareDecimalNumbers.innerText = "Compare decimal numbers";
buttonCompareDecimalNumbers.setAttribute('id', 'task-5-2');
buttonCompareDecimalNumbers.addEventListener('click', () => {
    compareNumbers(0.3, 0.1);
});
tasks.appendChild(buttonCompareDecimalNumbers);

const buttonCompareFractionNumbers = document.createElement('button');
buttonCompareFractionNumbers.innerText = "Compare fraction numbers";
buttonCompareFractionNumbers.setAttribute('id', 'task-5-3');
buttonCompareFractionNumbers.addEventListener('click', () => {
    compareNumbers(1 / 2, 3 / 20);
});
tasks.appendChild(buttonCompareFractionNumbers);

const buttonCompareNegativeNumbers = document.createElement('button');
buttonCompareNegativeNumbers.innerText = "Compare negative numbers";
buttonCompareNegativeNumbers.setAttribute('id', 'task-5-4');
buttonCompareNegativeNumbers.addEventListener('click', () => {
    compareNumbers(-1, -4);
});
tasks.appendChild(buttonCompareNegativeNumbers);

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší
 * nebo rovno 730, včetě nuly. Používejte for cyklus.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here
const resultPatternGenerator = document.createElement('p');
resultPatternGenerator.innerText = "Task 6: ";
results.appendChild(resultPatternGenerator);

const patternGenerator = () => {
    for (let i = 0; i <= 730; i += 13) {
        resultPatternGenerator.append(i + " ");
    }

}

const buttonGeneratePattern = document.createElement('button');
buttonGeneratePattern.innerText = "Multiples of 13";
buttonGeneratePattern.setAttribute('id', 'task-6');
buttonGeneratePattern.addEventListener('click', () => {
    patternGenerator();
});
tasks.appendChild(buttonGeneratePattern);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const resultAreaOfCircle = document.createElement('p');
resultAreaOfCircle.innerText = "Task 7: ";
results.appendChild(resultAreaOfCircle);

const computeAreaOfCircle = (r) => {
    const area = Math.PI.toFixed(2) * Math.pow(r, 2);
    const result = "r=" + r + ", S=" + area;
    resultAreaOfCircle.append(result)
}

const buttonComputeAreaOfCircle = document.createElement('button');
buttonComputeAreaOfCircle.innerText = "Compute area of circle";
buttonComputeAreaOfCircle.setAttribute('id', 'task-7');
buttonComputeAreaOfCircle.addEventListener('click', () => {
    computeAreaOfCircle(21);
});
tasks.appendChild(buttonComputeAreaOfCircle);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const resultVolumeOfCone = document.createElement('p');
resultVolumeOfCone.innerText = "Task 8: ";
results.appendChild(resultVolumeOfCone);

const computeVolumeOfCone = (r, h) => {
    const volume = (1 / 3 * Math.PI * Math.pow(r, 2) * h).toFixed(2);
    const result = "r=" + r + ", h=" + h + ", V=" + volume;
    resultVolumeOfCone.append(result);
}

const buttonComputeVolumeOfCone = document.createElement('button');
buttonComputeVolumeOfCone.innerText = "Compute volume of cone";
buttonComputeVolumeOfCone.setAttribute('id', 'task-8');
buttonComputeVolumeOfCone.addEventListener('click', () => {
    computeVolumeOfCone(5, 10);
});
tasks.appendChild(buttonComputeVolumeOfCone);

/**
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const resultCheckIfTriangle = document.createElement('p');
resultCheckIfTriangle.innerText = "Task 9: ";
results.appendChild(resultCheckIfTriangle);

const checkIfTriangle = (a, b, c) => {
    if (a + b > c && a + c > b && b + c > a) {
        return true;
    }
    else {
        return false;
    }
}

const buttonCheckIfTriangle = document.createElement('button');
buttonCheckIfTriangle.innerText = "Check if triangle";
buttonCheckIfTriangle.setAttribute('id', 'task-9');
buttonCheckIfTriangle.addEventListener('click', () => {
    const a = 5;
    const b = 6;
    const c = 7;

    resultCheckIfTriangle.append("a=" + a + ", b=" + b + ", c=" + c + ", " + checkIfTriangle(a, b, c));
});
tasks.appendChild(buttonCheckIfTriangle);

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
const computeAreaOfTriangle = (a, b, c) => {
//   - krok 1.1 - pomocí selektoru vyberte container pro výpis výsledků a uložte ho do proměnné
    const resultComputeAreaOfTriangle = document.createElement('p');
    resultComputeAreaOfTriangle.innerText = "Task 10: ";
    results.appendChild(resultComputeAreaOfTriangle);
//   - krok 1.2 - zvalidujte vstupní argumenty pomocí funkce z úlohy č. 9
//     - v případě nevalidních hodnot vypište chybovou hlášku na místo pro výpis výsledků a funkci ukončete
    if (!checkIfTriangle) {
        resultComputeAreaOfTriangle.append("Triangle is not valid");
    }
//     - v případě validních hodnot pokračujte s výpočtem
    else {
//   - krok 1.3 - spočítejte obsah trojúhelníku podle Heronovy vzorce a výsledek uložte do proměnné
        s = (a + b + c) / 2;
        area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
//   - krok 1.4 - vypište výsledek na místo pro výpis výsledků
        resultComputeAreaOfTriangle.append(area);
    }
}
// - krok 2 - vytvořte tlačítko
const buttonComputeAreaOfTriangle = document.createElement('button');
buttonComputeAreaOfTriangle.innerText = "Compute area of triangle";
buttonComputeAreaOfTriangle.setAttribute('id', 'task-10');
// - krok 3 - nabindujte na toto tlačítko callback, ve kterém zavoláte implementovanou funkci pro výpočet a výpis výsledků
buttonComputeAreaOfTriangle.addEventListener('click', () => {
    computeAreaOfTriangle(5, 6, 7);
});
// - krok 4 - tlačítko umístěte na stránku
tasks.appendChild(buttonComputeAreaOfTriangle);
// - krok 5 - otestujte řešení klikáním na tlačítko