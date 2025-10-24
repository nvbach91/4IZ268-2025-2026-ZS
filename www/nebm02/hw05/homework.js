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

characterName = "Pepe";
birthYear = 1999;

const returnPepeAge = () => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    console.log(`Pepe is ${age} years old.`);
}


document.getElementById('pepesAge').addEventListener('click', returnPepeAge);


/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

celsius = 10;
fahrenheit = 58;

const convertTemperatures = () => {
    const celsiusToFahrenheit = (celsius * 9) / 5 + 32;
    const fahrenheitToCelsius = ((fahrenheit - 32) * 5) / 9;
    console.log(`${celsius}°C = ${celsiusToFahrenheit}°F`);
    console.log(`${fahrenheit}°F = ${fahrenheitToCelsius}°C`);
}

document.getElementById('convertTemperatures').addEventListener('click', convertTemperatures);


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



const returnPepeAgeArg = (characterName, birthYear) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    console.log(`Pepe is ${age} years old.`);
}

const convertTemperaturesArg = (celsius, fahrenheit) => {
    const celsiusToFahrenheit = (celsius * 9) / 5 + 32;
    const fahrenheitToCelsius = ((fahrenheit - 32) * 5) / 9;
    console.log(`${celsius}°C = ${celsiusToFahrenheit}°F`);
    console.log(`${fahrenheit}°F = ${fahrenheitToCelsius}°C`);
}

const buttonPepeArg = document.createElement('button');
buttonPepeArg.innerText = "Run pepe\'s Age with arguments";
buttonPepeArg.setAttribute('id', 'task3-pepe-arg');
buttonPepeArg.addEventListener('click', () => {
    returnPepeAgeArg("Pepe", 1990);
});

const buttonConvertorArg = document.createElement('button');
buttonConvertorArg.innerText = "Run convertor for temperatures with arguments";
buttonConvertorArg.setAttribute('id', 'task3-temp-arg');
buttonConvertorArg.addEventListener('click', () => {
    convertTemperaturesArg(5, 48);
});
const tasks = document.querySelector('#task3');
tasks.appendChild(buttonPepeArg);
tasks.appendChild(buttonConvertorArg);

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
    const resultsBox = document.querySelector('#results');
    if (whole === 0) {
        resultsBox.innerText = "!!! Division by zero is not allowed. !!!";
        return;
    }
    const percentage = (part / whole) * 100;
    resultsBox.innerText = `${part} divided by ${whole} is ${percentage.toFixed(2)}%.`;
}

const buttonPercentage = document.createElement('button');
buttonPercentage.innerText = "Run";
buttonPercentage.setAttribute('id', 'task4');
buttonPercentage.addEventListener('click', () => {
    calculatePercentage(10, 8);
});

const tasks4 = document.querySelector('#task4');
tasks4.appendChild(buttonPercentage);

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
    const resultsBox = document.querySelector('#results');
    if (number1 > number2) {
        resultsBox.innerText = `${number1} is greater than ${number2}.`;
    } else if (number1 < number2) {
        resultsBox.innerText = `${number2} is greater than ${number1}.`;
    } else {
        resultsBox.innerText = `${number1} is equal to ${number2}.`;
    }
}

const buttonCompare1 = document.createElement('button');
buttonCompare1.innerText = "Run Compare 1";
buttonCompare1.setAttribute('id', 'task5');
buttonCompare1.addEventListener('click', () => {
    compareNumbers(5, 10);
});

const buttonCompare2 = document.createElement('button');
buttonCompare2.innerText = "Run Compare 2";
buttonCompare2.setAttribute('id', 'task5-2');
buttonCompare2.addEventListener('click', () => {
    compareNumbers(15.5, 10.2);
});

const buttonCompare3 = document.createElement('button');
buttonCompare3.innerText = "Run Compare 3";
buttonCompare3.setAttribute('id', 'task5-3');
buttonCompare3.addEventListener('click', () => {
    compareNumbers(7/3, 1/9);
});

const tasks5 = document.querySelector('#task5');
tasks5.appendChild(buttonCompare1);
tasks5.appendChild(buttonCompare2);
tasks5.appendChild(buttonCompare3);



/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší
 * nebo rovno 730, včetě nuly. Používejte for cyklus.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const patternOfThirteen = () => {
    const resultsBox = document.querySelector('#results');
    let multiples = [];
    for (let i = 0; i <= 730; i += 13) {
        multiples.push(i);
    }
    resultsBox.innerText = `${multiples.join(', ')}.`;
}

const buttonPattern = document.createElement('button');
buttonPattern.innerText = "Run";
buttonPattern.setAttribute('id', 'task6');
buttonPattern.addEventListener('click', () => {
    patternOfThirteen();
});

const tasks6 = document.querySelector('#task6');
tasks6.appendChild(buttonPattern);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here

const calculateCircleArea = (radius) => {
    const resultsBox = document.querySelector('#results');
    const area = Math.PI * Math.pow(radius, 2);
    resultsBox.innerText = `Radius = ${radius}, Area = ${area.toFixed(2)}.`;
}

const buttonCircleArea = document.createElement('button');
buttonCircleArea.innerText = "Run";
buttonCircleArea.setAttribute('id', 'task7');
buttonCircleArea.addEventListener('click', () => {
    calculateCircleArea(5);
});

const tasks7 = document.querySelector('#task7');
tasks7.appendChild(buttonCircleArea);



/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here

const calculateConeVolume = (height, radius) => {
    const resultsBox = document.querySelector('#results');
    const volume = (1 / 3) * Math.PI * Math.pow(radius, 2) * height;
    resultsBox.innerText = `Radius =  ${radius}, Height = ${height}, Volume =  ${volume.toFixed(2)}.`;
}

const buttonConeVolume = document.createElement('button');
buttonConeVolume.innerText = "Run";
buttonConeVolume.setAttribute('id', 'task8');
buttonConeVolume.addEventListener('click', () => {
    calculateConeVolume(10, 3);
});

const tasks8 = document.querySelector('#task8');
tasks8.appendChild(buttonConeVolume);


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
    const resultsBox = document.querySelector('#results');
    if (a + b > c && a + c > b && b + c > a) {
        resultsBox.innerText = `A = ${a}, B = ${b}, C= ${c}: TRUE.`;
        return true;
    } else {
        resultsBox.innerText = `A = ${a}, B = ${b}, C= ${c}: FALSE.`;
        return false;
    }

}

const buttonIsTriangle = document.createElement('button');
buttonIsTriangle.innerText = "Run";
buttonIsTriangle.setAttribute('id', 'task9');
buttonIsTriangle.addEventListener('click', () => {
    isTriangle(3, 4, 5);
});

const tasks9 = document.querySelector('#task9');
tasks9.appendChild(buttonIsTriangle);


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

const calculateTriangleHeron = (a, b, c) => {
    const resultsBox = document.querySelector('#results');
    if (!isTriangle(a, b, c)) {
        resultsBox.innerText = "!!! The provided lengths cannot form a triangle. !!!";
        return;
    }

    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    resultsBox.innerText = `HERON: A = ${a}, B = ${b}, C= ${c} Area = ${area.toFixed(2)}.`;
}

const buttonTriangleHeron = document.createElement('button');
buttonTriangleHeron.innerText = "Run";
buttonTriangleHeron.setAttribute('id', 'task10');
buttonTriangleHeron.addEventListener('click', () => {
    calculateTriangleHeron(3, 4, 5);
});

const tasks10 = document.querySelector('#task10');
tasks10.appendChild(buttonTriangleHeron);

