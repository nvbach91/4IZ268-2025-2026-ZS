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

console.log('Ahoj světe')

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here

const ageTeller = (age) => {
    const sentence = `Pepe is ${age} years old.`
    console.log(sentence)
    return sentence
}

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

const conversion = (temp, resultUnit) => {
    if (resultUnit === 'f') {
        const result = ((temp * 9) / 5) + 32;
        console.log(`${temp}°C = ${result}°F`)
        return `${temp}°C = ${result}°F`
    } else if (resultUnit === 'c') {
        const result = (((temp - 32) * 5) / 9);
        console.log(`${temp}°F = ${result}°C`)
        return `${temp}°F = ${result}°C`
    }
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



// this solution is at the very end.





/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const percent = (a, b) => {
    if (b === 0) {
        console.error('Cannot divide by zero')
    }
    const result = (a / b) * 100
    console.log(`${a} je ${result.toFixed(2)} % z ${b}`)
    return `${a} je ${result.toFixed(2)} % z ${b}`
}

/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here

const returnLarger = (a, b) => {
    if (a === b) {
        console.log('The numbers are equal')
        return 'The numbers are equal';
    }
    const numbers = [a, b];
    let number = 0;
    for (i in numbers) {
        if (numbers[i] > number) {
            number = numbers[i];
        }
    }
    console.log(number)
    return number
}

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const multiplication = () => {
    let result = 0;
    for (let i = 1; result <= 730; i++) {
        result = 13 * i;
        if (result >= 730) {
            return
        }
        console.log(`${i} * 13 = ${result}`);
    }
}

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const areaCircle = (radius) => {
    const pi = 3.1415926535898
    const result = pi * (radius * radius)
    console.log(result.toFixed(2))
    return result.toFixed(2)
}

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const volumeCone = (height, radius) => {
    const pi = 3.1415926535898
    const result = 1/3 * pi * radius * radius * height
    console.log(result.toFixed(2))
    return result.toFixed(2)
}

/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here


const triangleConstuction = (a, b, c) => {
    const numbers = [a, b, c];
    const sorted = numbers.sort();
    if ((sorted[0] + sorted[1]) > sorted[2]) {
        console.log(`a = ${a}, b = ${b}, c = ${c} -> true`)
        return true;
    } else {
        console.log(`a = ${a}, b = ${b}, c = ${c} -> false `)
        return false;
    }
}

/**
 * 10) Heroic performance. Vytvořte funkci, která vypočte a vypíše obsah trojúhelníka podle Heronova vzorce, 
 * tj. funkce dostane délky všech 3 stran. Použijte přitom předchozí validaci v úloze č. 9, tj. počítejte pouze, 
 * když to má smysl. Hint: funkce pro odmocninu je Math.sqrt().
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const heron = (a, b, c) => {
    if (triangleConstuction(a, b, c)) {
        const s = (a + b + c) / 2
        const area = Math.sqrt(s * (s-a) * (s-b) * (s-c))
        console.log(`Area of the triangle is: ${area}`)
        return area;
    } else {
        console.error('Area cannot be calculated, due to not being able to construct triangle.')
    }
}

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

const dummyFunc = () => {
    console.log('This does nothing')
    return 'This does nothing'
} 

const names = [
    'Uloha 1 (Pepes age)',
    'Uloha 2 (WTF (wow, thats fun))',
    'Uloha 3 (Funkce function fonction funktio)',
    'Uloha 4 (%CENSORED%)',
    'Uloha 5 (Kdo s koho)',
    'Uloha 6 (I can cleary see the pattern)',
    'Uloha 7 (Around and about)',
    'Uloha 8 (Another dimension)',
    'Uloha 9 (Not sure if triangle, or just some random values)',
    'Uloha 10 (Heroic performance)'
]

const functions = [
    () => ageTeller(22),
    () => conversion(33, 'f'),
    () => dummyFunc(),
    () => percent(5, 20),
    () => returnLarger(15, 12),
    () => multiplication(),
    () => areaCircle(30),
    () => volumeCone(20, 3),
    () => triangleConstuction(2, 3, 4),
    () => heron(2, 3, 4)
]

const createFunctions = (names, funct) => {
    for (let i = 1; i <= 10; i = i + 1) {
    const button = document.createElement('button');
    const result = document.createElement('div');
    button.innerText = names[i-1];
    button.setAttribute('id', `task-${i}`);
    button.addEventListener('click', () => {
        const im = funct[i-1]();
        result.innerHTML = `<p>${im}</p>`
    });
    const tasks = document.querySelector('#tasks');
    const results = document.querySelector('#results')
    results.appendChild(result)
    tasks.appendChild(button);
    }
}

createFunctions(names, functions)