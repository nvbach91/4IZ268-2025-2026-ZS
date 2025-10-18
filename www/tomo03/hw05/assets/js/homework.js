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
let currentYear = 2025;

const pepesBirthYear = 1956;

const pepesAge = currentYear - pepesBirthYear;
console.log(`Pepa má narozeniny. Máme rok ${currentYear}, takže mu bylo ${pepesAge} let. Štěstí zdraví!`);


/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here


let tempC = 20;
let tempF = 68;

const celsiusToFahrenheit = tempC * 9 / 5 + 32;
console.log(`${tempC}°C = ${celsiusToFahrenheit}°F`);

const fahrenheitToCelsius = (tempF - 32) * 5 / 9;
console.log(`${tempF}°F = ${fahrenheitToCelsius}°C`);

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

const sayHelloWorld = () => console.log('Ahoj světe');

const celebratePepesBirthday = (pepesBirthYear, currentYear) => {
    const pepesAge = currentYear - pepesBirthYear;
    console.log(`Pepa má narozeniny. Máme rok ${currentYear}, takže mu bylo ${pepesAge} let. Štěstí zdraví!`);
}

const convertTemperature = (temp) => {
    const celsiusToFahrenheit = temp * 9 / 5 + 32;
    const fahrenheitToCelsius = (temp - 32) * 5 / 9;

    console.log(`${temp}°C = ${celsiusToFahrenheit}°F`);
    console.log(`${temp}°F = ${fahrenheitToCelsius}°C`);
}

const tasks = document.querySelector('#tasks');

const renderBtn = (taskId, text, func) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.setAttribute('id', taskId);
    btn.addEventListener('click', func);
    tasks.appendChild(btn);
}

renderBtn('task-0', 'Pozdrav do konzole!', () => sayHelloWorld());
renderBtn('task-1', 'Oslav Pepu do konzole!', () => celebratePepesBirthday(1956, 2025));
renderBtn('task-2', 'Převeď teplotu do konzole!', () => convertTemperature(68));

/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const results = document.getElementById('results')

const renderPercentage = (dividend, devisor) => {
    if (devisor !== 0) {
        results.textContent = `${dividend} je ${(dividend / devisor * 100).toFixed(2)}% z ${devisor}.`;
    } else {
        throw new Error("Devision by zero!");
    }
}

renderBtn('task-3', 'Vypiš procenta (21 z 42)', () => renderPercentage(21, 42));

/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here

const renderHighestNum = (n1, n2) => {
    results.textContent = n1 > n2 ? n1 : n2 > n1 ? n2 : 'Čísla se rovnají.';
}

renderBtn('task-5-b1', 'Je vyšší 22 nebo 21?', () => renderHighestNum(22, 21));
renderBtn('task-5-b2', 'Je vyšší 3 nebo 3.41?', () => renderHighestNum(3, 3.41));
renderBtn('task-5-b3', 'Je vyšší 21.456 nebo 21.514?', () => renderHighestNum(21.456, 21.514));
renderBtn('task-5-b4', 'Je vyšší 1/3 nebo 1/4?', () => renderHighestNum(1/3, 1/4));
renderBtn('task-5-b5', 'Je vyšší 1/8 nebo 1/8?', () => renderHighestNum(1/8, 1/8));
renderBtn('task-5-b6', 'Je vyšší 20 nebo 20.000000000000001?', () => renderHighestNum(20, 20.000000000000001));

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here
const getMultipliesOf13 = () => {
    let text = '';
    for (let i = 0; i * 13 <= 730; i++) {
        text += i*13 + ' ';
    }
    results.textContent = text;
}

renderBtn('task-6', 'Vypiš násobky 13 do 730', getMultipliesOf13);


/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const renderCircleArea = r => {
    results.textContent = `Obsah kružnice s poloměrem ${r} je: ${(r ** 2 * Math.PI).toFixed(3)}.`;
}
renderBtn('task-7', 'Vypočti obsah kružnice', () => renderCircleArea(3));



/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const getConeVolume = (r, h) => {
    results.textContent = `Objem kužele s poloměrem ${r} a výškou ${h} je roven ${(1/3 * Math.PI * (r ** 2) * h).toFixed(3)}.`;
}

renderBtn('task-8', 'Vypočti objem kužele', () => getConeVolume(3, 4));

/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const confirmTriangle = (a, b, c) => {
    const isTriangle = a + b > c && a + c > b && b + c > a;
    results.textContent = `
        Strany trojúhelníku: a = ${a}; b = ${b}; c = ${c}.
        ${isTriangle ? 'Ano - lze sestavit trojúhelník' : 'Ne. Trojúhelník nelze sestavit.'}
    `
    return isTriangle;
}

renderBtn('task-9', 'Potvrď trojúhelník (3, 1, 4)', () => confirmTriangle(3, 1, 4))

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

const renderTriangleArea = (a, b, c) => {
    if (confirmTriangle(a, b, c)) {
        const s = (a + b + c) / 2;
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        results.textContent = `Obsah trojúhelníku je roven ${area.toFixed(3)}.`;
    } else {
       results.textContent = 'Obsah trojúhelníku nelze vypočítat.';
    }
}

renderBtn('task-10', 'Vypiš obsah trojúhelníku (1, 2, 2)', () => renderTriangleArea(1, 2, 2));