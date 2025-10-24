console.log('Hello world');
const tasks = document.querySelector('#tasks');
const results = document.querySelector('#results');

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození,
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných
 * používejte smysluplnou angličtinu.
 */
// Solution here

function getPepeAge(pepeBirthYear = 1999) {
    const pepeAge = new Date().getFullYear() - pepeBirthYear;
    console.log(`Pepe's pushing ${Math.ceil(pepeAge / 10) * 10}s, being ${pepeAge} old.`);
    return pepeAge;
}

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak.
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32.
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9.
 */
// Solution here

function getCelsiusToFahrenheit(celsius = 0) {
    const fahrenheit = (celsius * 9) / 5 + 32;
    console.log(`${celsius}°C = ${fahrenheit}°F`);
    return fahrenheit;
}
function getFahrenheitToCelsius(fahrenheit = 0) {
    const celsius = ((fahrenheit - 32) * 5) / 9;
    console.log(`${fahrenheit}°F = ${celsius}°C`);
    return celsius;
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

const buttonTask1 = document.createElement('button');
buttonTask1.innerText = "Get Pepe's age";
buttonTask1.setAttribute('id', 'task-1');

buttonTask1.addEventListener('click', () => {
    const pepeAge = getPepeAge(1999);

    const result =  document.createElement('p');
    result.innerText = `Pepe's pushing ${Math.ceil(pepeAge / 10) * 10}s, being ${pepeAge} old.`;
    results.prepend(result);

});
tasks.appendChild(buttonTask1);

const buttonTask2a = document.createElement('button');
buttonTask2a.innerText = 'Celsius to Fahrenheit';
buttonTask2a.setAttribute('id', 'task-2a');

const inputTask2a = document.createElement('input');
inputTask2a.setAttribute('type', 'number');
inputTask2a.setAttribute('placeholder', 'Celsius');

buttonTask2a.addEventListener('click', () => {
    const celsius = Number(inputTask2a.value).toFixed(2);
    const fahrenheit = getCelsiusToFahrenheit(celsius).toFixed(2);

    const result =  document.createElement('p');
    result.innerText = `${celsius}°C = ${fahrenheit}°F`;
    results.prepend(result);
});
tasks.appendChild(inputTask2a);
tasks.appendChild(buttonTask2a);

const buttonTask2b = document.createElement('button');
buttonTask2b.innerText = 'Fahrenheit to Celsius';
buttonTask2b.setAttribute('id', 'task-2b');
const inputTask2b = document.createElement('input');
inputTask2b.setAttribute('type', 'number');
inputTask2b.setAttribute('placeholder', 'Fahrenheit');
buttonTask2b.addEventListener('click', () => {
    const fahrenheit = Number(inputTask2b.value).toFixed(2);
    const celsius = getFahrenheitToCelsius(fahrenheit).toFixed(2);

    const result =  document.createElement('p');
    result.innerText = `${fahrenheit}°F = ${celsius}°C`;
    results.prepend(result);
});
tasks.appendChild(inputTask2b);
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

function getPercentage(num1, num2) {
    if (num2 === 0) {
        return null;
    }
    const percent = ((num1 / num2) * 100).toFixed(2);
    return percent;
}

const buttonTask4 = document.createElement('button');
buttonTask4.innerText = 'Spocitaj percenta (6 z 7)';
buttonTask4.setAttribute('id', 'task-4');
buttonTask4.addEventListener('click', () => {
    const result =  document.createElement('p');

    const percent = getPercentage(6, 7);
    if (percent === null) {
        result.innerText = 'Error: Nedel nulou, to sa nerobi :(';;
    } else {
        result.innerText = `6 je ${percent}% z 7.`;
    }
    results.prepend(result);
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

function compareNumbers(a, b) {
    if (a > b) {
        return`${a} je vacsie ako ${b}`;
    } else if (a < b) {
        return `${a} je mensie ako ${b}`;
    } else {
        return `${a} a ${b} sa rovnaju`;
    }
}

const buttonTask5a = document.createElement('button');
buttonTask5a.innerText = 'Porovnaj 5 a 3';
buttonTask5a.setAttribute('id', 'task-5a');
buttonTask5a.addEventListener('click', () => {
    const result =  document.createElement('p');
    result.innerText = compareNumbers(5, 3);
    results.prepend(result);

});
tasks.appendChild(buttonTask5a);

const buttonTask5b = document.createElement('button');
buttonTask5b.innerText = 'Porovnaj 2.5 a 2.5';
buttonTask5b.setAttribute('id', 'task-5b');
buttonTask5b.addEventListener('click', () => {
    const result =  document.createElement('p');
    result.innerText = compareNumbers(2.5, 2.5);
    results.prepend(result);
});
tasks.appendChild(buttonTask5b);

const buttonTask5c = document.createElement('button');
buttonTask5c.innerText = 'Porovnaj 1/2 a 0.7';
buttonTask5c.setAttribute('id', 'task-5c');
buttonTask5c.addEventListener('click', () => {
    const result =  document.createElement('p');
    result.innerText = compareNumbers(1/2, 0.7);
    results.prepend(result);
});
tasks.appendChild(buttonTask5c);

/**
 * 6) I can clearly see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší
 * nebo rovno 730, včetě nuly. Používejte for cyklus.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

function printMultiplesOf13() {
    let arr = [];
    for (let i = 0; i <= 730; i += 13) {
        arr.push(i);
    }
    return arr.join(', ');
}

const buttonTask6 = document.createElement('button');
buttonTask6.innerText = 'Vypis nasobky 13 do 730';
buttonTask6.setAttribute('id', 'task-6');
buttonTask6.addEventListener('click', () => {
    const result = document.createElement('p');
    result.innerText = printMultiplesOf13()
    results.prepend(result);
});
tasks.appendChild(buttonTask6);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here

function getCircleArea(radius) {
    if (radius < 0) {
        return null;
    }
    return Math.PI * radius * radius;
}

const buttonTask7 = document.createElement('button');
buttonTask7.innerText = 'Spocitaj obsah kruhu (r=5)';
buttonTask7.setAttribute('id', 'task-7');
buttonTask7.addEventListener('click', () => {
    const radius = 5
    const area = getCircleArea(5);

    const result = document.createElement('p');
    result.innerText = `Obsah kruhu s polomerom ${radius} je ${area.toFixed(2)}`;
    results.prepend(result);
});
tasks.appendChild(buttonTask7);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here

function getConeVolume(height, radius) {
    if (height < 0 || radius < 0) {
        return null;
    }
    return (1/3) * Math.PI * radius * radius * height;
}

const buttonTask8 = document.createElement('button');
buttonTask8.innerText = 'Spocitaj objem kuzela (r=3, h=7)';
buttonTask8.setAttribute('id', 'task-8');
buttonTask8.addEventListener('click', () => {
    const radius = 7;
    const height = 3;
    const volume = getConeVolume(height, radius);

    const result = document.createElement('p');
    result.innerText = `Objem kuzela s polomerom ${radius} a vyskou ${height} je ${volume.toFixed(2)}`;
    results.prepend(result);
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

function isValidTriangle(a, b, c) {
    return a + b > c && a + c > b && b + c > a && a > 0 && b > 0 && c > 0;
}

const buttonTask9 = document.createElement('button');
buttonTask9.innerText = 'Je to trojuholnik? (3, 4, 5)';
buttonTask9.setAttribute('id', 'task-9');
buttonTask9.addEventListener('click', () => {
    const a = 3;
    const b = 4;
    const c = 5;;

    const result = document.createElement('p');
    result.innerText =`Strany: a=${a}, b=${b}, c=${c} => ${isValidTriangle(3, 4, 5) ? 'sedi vec' : 'asi ne'}`;
    results.prepend(result);
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

function calculateTriangleArea(a, b, c) {
    if (!isValidTriangle(a, b, c)) {
        return null;
    }
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    return area;
}

const buttonTask10 = document.createElement('button');
buttonTask10.innerText = 'Spocitaj obsah trojuholniku (3, 4, 5)';
buttonTask10.setAttribute('id', 'task-10');
buttonTask10.addEventListener('click', () => {
    const a = 3;
    const b = 4;
    const c = 5;
    const area = calculateTriangleArea(3, 4, 5);
    const result = document.createElement('p');
    if (area === null) {
        result.innerText = `Nieje to trojuholnik: obsah nedostanes :I.`
    } else {
        result.innerText = `Obsah trojuholniku: ${area.toFixed(2)}`;
    }
    results.prepend(result);
});
tasks.appendChild(buttonTask10);
