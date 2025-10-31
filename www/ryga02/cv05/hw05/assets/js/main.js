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

// 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy,
// pokud znáte jeho rok narození, který je uložený v proměnné, 
// a pro výpis použijte zřetězení stringů nebo interpolaci.

const pepesAge = (birthYear) => {
    const currentYear = 2025;
    const age = currentYear - birthYear;
    return `Pepe is ${age} years old.`;
};


/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here


const WTFCelsius = (celsius) => {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${celsius}°C = ${fahrenheit}°F`;
};

const WTFFarenheit = (fahrenheit) =>{
    const celsius = ((fahrenheit - 32) * 5) / 9;
    return `${fahrenheit}°F = ${celsius}°C`;
}



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

// pepes age button
const inputPepe = document.createElement('input');
inputPepe.setAttribute('id', 'pepe-year');
inputPepe.setAttribute('type', 'text');

const buttonPepe = document.createElement('button');
buttonPepe.innerText = "Pepe's Age";

const resultPepe = document.createElement('div');
resultPepe.setAttribute('id', 'result-pepe');

const tasks = document.querySelector('#tasks');
tasks.appendChild(inputPepe);
tasks.appendChild(buttonPepe);

const results = document.querySelector('#results');
results.appendChild(resultPepe);

buttonPepe.addEventListener('click', () => {
    const year = Number(inputPepe.value);
    if (!year) {
        resultPepe.innerText = '';
        return;
    }
    resultPepe.innerText = pepesAge(year);
});

// f to c
const inputF = document.createElement('input');
inputF.setAttribute('id', 'input-fahrenheit');
inputF.setAttribute('type', 'text');

const buttonF = document.createElement('button');
buttonF.innerText = "F to C";

const resultF = document.createElement('div');
resultF.setAttribute('id', 'result-fahrenheit');

tasks.appendChild(inputF);
tasks.appendChild(buttonF);

results.appendChild(resultF);

buttonF.addEventListener('click', () => {
    const f = Number(inputF.value);
    if (!f && f !== 0) {
        resultF.innerText = '';
        return;
    }
    resultF.innerText = WTFFarenheit(f);
});

// c to f
const inputC = document.createElement('input');
inputC.setAttribute('id', 'input-celsius');
inputC.setAttribute('type', 'text');

const buttonC = document.createElement('button');
buttonC.innerText = "C to F";

const resultC = document.createElement('div');
resultC.setAttribute('id', 'result-celsius');

tasks.appendChild(inputC);
tasks.appendChild(buttonC);
results.appendChild(resultC);

buttonC.addEventListener('click', () => {
    const c = Number(inputC.value);
    if (!c && c !== 0) {
        resultC.innerText = '';
        return;
    }
    resultC.innerText = WTFCelsius(c);
});



/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const percentageOf = () => {
    const a = 21;
    const b = 42;
    const percentage = (a / b) * 100;
    return `${a} is ${percentage.toFixed(0)}% of ${b}.`;
};

const buttonPercentage = document.createElement('button');
buttonPercentage.innerText = "%CENSORED%";

const resultPercentage = document.createElement('div');
resultPercentage.setAttribute('id', 'result-percentage');

tasks.appendChild(buttonPercentage);
results.appendChild(resultPercentage);

buttonPercentage.addEventListener('click', () => {
    resultPercentage.innerText = percentageOf();
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

const compareNumbers = () => {
    const a = 7.5;
    const b = 12.3;
    if (a > b) {
        return `${a} is greater than ${b}.`;
    } else if (a < b) {
        return `${b} is greater than ${a}.`;
    } else {
        return `${a} and ${b} are equal.`;
    }
};

const buttonCompare = document.createElement('button');
buttonCompare.innerText = "Kdo s koho";

const resultCompare = document.createElement('div');
resultCompare.setAttribute('id', 'result-compare');

tasks.appendChild(buttonCompare);
results.appendChild(resultCompare);

buttonCompare.addEventListener('click', () => {
    resultCompare.innerText = compareNumbers();
});




/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const multiplesOf13 = () => {
    let result = '';
    for (let n = 0; n <= 730; n += 13) {
        result += n + ' ';
    }
    return result.trim();
};

const buttonMultiples = document.createElement('button');
buttonMultiples.innerText = "I can cleary see the pattern";

const resultMultiples = document.createElement('div');
resultMultiples.setAttribute('id', 'result-multiples');

tasks.appendChild(buttonMultiples);
results.appendChild(resultMultiples);

buttonMultiples.addEventListener('click', () => {
    resultMultiples.innerText = multiplesOf13();
});



/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const circleArea = () => {
    const radius = 5; 
    const area = Math.PI * radius * radius;
    return `The area of a circle with radius ${radius} is ${area.toFixed(2)}.`;
};

const buttonCircle = document.createElement('button');
buttonCircle.innerText = "Around and about";

const resultCircle = document.createElement('div');
resultCircle.setAttribute('id', 'result-circle');

tasks.appendChild(buttonCircle);
results.appendChild(resultCircle);

buttonCircle.addEventListener('click', () => {
    resultCircle.innerText = circleArea();
});




/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here


const coneVolume = () => {
    const radius = 3;  
    const height = 7;   
    const volume = (1/3) * Math.PI * radius * radius * height;
    return `The volume of a cone with radius ${radius} and height ${height} is ${volume.toFixed(2)}.`;
};

const buttonCone = document.createElement('button');
buttonCone.innerText = "Another dimension";

const resultCone = document.createElement('div');
resultCone.setAttribute('id', 'result-cone');

tasks.appendChild(buttonCone);
results.appendChild(resultCone);

buttonCone.addEventListener('click', () => {
    resultCone.innerText = coneVolume();
});



/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const isTriangle = () => {
    const a = 5;
    const b = 7;
    const c = 10;

    const canForm = a + b > c && a + c > b && b + c > a;

    return `Sides: a=${a}, b=${b}, c=${c} → Can form triangle? ${canForm ? 'Yes' : 'No'}`;
};

const buttonTriangle = document.createElement('button');
buttonTriangle.innerText = "Not sure if triangle, or just some random values";

const resultTriangle = document.createElement('div');
resultTriangle.setAttribute('id', 'result-triangle');

tasks.appendChild(buttonTriangle);
results.appendChild(resultTriangle);

buttonTriangle.addEventListener('click', () => {
    resultTriangle.innerText = isTriangle();
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

const heronTriangleArea = () => {
    const a = 5;
    const b = 7;
    const c = 10;

    const canForm = a + b > c && a + c > b && b + c > a;

    const resultHeron = document.querySelector('#result-heron');

    if (!canForm) {
        resultHeron.innerText = `Invalid triangle with sides a=${a}, b=${b}, c=${c}.`;
        return false;
    }

    const s = (a + b + c) / 2; // poloviční obvod
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    resultHeron.innerText = `Triangle sides: a=${a}, b=${b}, c=${c} → Area = ${area.toFixed(2)}`;
    return area;
};

const buttonHeron = document.createElement('button');
buttonHeron.innerText = "Heroic performance";

const resultHeronDiv = document.createElement('div');
resultHeronDiv.setAttribute('id', 'result-heron');

tasks.appendChild(buttonHeron);
results.appendChild(resultHeronDiv);

buttonHeron.addEventListener('click', () => {
    heronTriangleArea();
});
