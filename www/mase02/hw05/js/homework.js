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

const pepesBirth = 2010;
const currentYear = new Date().getFullYear();
const pepesAge = currentYear - pepesBirth;
console.log(`Pepe's age is ${pepesAge}`);


/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

const celsius = 20;
const fahrenheiht = 68;

const celsiusToFahrenheiht = celsius * 9 / 5 + 32;
const fahrenheihtToCelsius = (fahrenheiht - 32) * 5 / 9;

console.log(`${celsius}°C = ${celsiusToFahrenheiht}°F`);
console.log(`${fahrenheiht}°F = ${fahrenheihtToCelsius}°C`);


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

const getPepesAge = (pepesBirth) => {
    const pepesAge = new Date().getFullYear() - pepesBirth;
    console.log(`Pepe's age is ${pepesAge}`);
};


const convertCelsiusToFahrenheiht = (celsius) => {
    const celsiusToFahrenheiht = celsius * 9 / 5 + 32;
    console.log(`${celsius}°C = ${celsiusToFahrenheiht}°F`);
};



const convertFahrenheihtToCelsius = (fahrenheiht) => {
    const fahrenheihtToCelsius = (fahrenheiht - 32) * 5 / 9;
    console.log(`${fahrenheiht}°F = ${fahrenheihtToCelsius}°C`);
};


const buttonTaskOne = document.createElement('button');
buttonTaskOne.innerText = "Uloha 1 (Pepe's age)";
buttonTaskOne.setAttribute('id', 'task-1');
buttonTaskOne.addEventListener('click',
                                () => {
                                    getPepesAge(2010)
                                }
                            );


const tasks = document.querySelector('#tasks');

tasks.appendChild(buttonTaskOne);
tasks.appendChild(document.createElement('br'));
tasks.appendChild(document.createElement('br'));




const buttonTaskTwo = document.createElement('button');
buttonTaskTwo.innerText = "Uloha 2 (WTF)";
buttonTaskTwo.setAttribute('id', 'task-2');
buttonTaskTwo.addEventListener('click',
                                () => {
                                    convertCelsiusToFahrenheiht(20);
                                    convertFahrenheihtToCelsius(68);
                                }
                            );

tasks.appendChild(buttonTaskTwo);
tasks.appendChild(document.createElement('br'));
tasks.appendChild(document.createElement('br'));


/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here


const ratio = (a, b) => {
    if (b === 0) {
        return "You can't divide by zero!";
    }
    const result = (a / b * 100).toFixed(2);
    return `The ratio of ${a} to ${b} equals ${result}%`
}

const results = document.querySelector('#results');

const buttonTaskFour = document.createElement('button');
buttonTaskFour.innerText = "Uloha 4 (%CENSORED%)";
buttonTaskFour.setAttribute('id', 'task-4');
buttonTaskFour.addEventListener('click',
                                () => {
                                    const a = Number(prompt("Enter first number"));
                                    const b = Number(prompt("Enter second number"));
                                    results.innerText = ratio(a, b);
                                }
                            );

tasks.appendChild(buttonTaskFour);
tasks.appendChild(document.createElement('br'));
tasks.appendChild(document.createElement('br'));



/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here

const whatIsBigger = (a, b)=> {
    if (a === b) {
        return `Numbers are equal!`
    }
    if (a > b) {
        return `${a} is bigger than ${b}!`
    } else {
        return `${b} is bigger than ${a}!`
    }
}

const buttonTaskFive = document.createElement('button');
buttonTaskFive.innerText = "Uloha 5 (Kdo s koho)";
buttonTaskFive.setAttribute('id', 'task-5');
buttonTaskFive.addEventListener('click',
                                () => {
                                    results.innerHTML = '';
                                    results.innerHTML += whatIsBigger(2, 3) + '<br>';
                                    results.innerHTML += whatIsBigger(3.2, 2.2) + '<br>';
                                    results.innerHTML += whatIsBigger(2/10, 1/5) + '<br>';
                                }
                            );

tasks.appendChild(buttonTaskFive);
tasks.appendChild(document.createElement('br'));
tasks.appendChild(document.createElement('br'));



/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const multiplesOf13 = () => {
    for (let i = 0; i <= 730; i += 13) {
        console.log(i);
    }      
};

const buttonTaskSix = document.createElement('button');
buttonTaskSix.innerText = "Uloha 6 (I can clearly see the pattern)";
buttonTaskSix.setAttribute('id', 'task-6');
buttonTaskSix.addEventListener('click',
                                () => {
                                    multiplesOf13();
                                }
                            );

tasks.appendChild(buttonTaskSix);
tasks.appendChild(document.createElement('br'));
tasks.appendChild(document.createElement('br'));


/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const circleArea = (r) => {
    const area = Math.PI * r ** 2;
    console.log(area)
}
 
const buttonTaskSeven = document.createElement('button');
buttonTaskSeven.innerText = "Uloha 7 (Around and about)";
buttonTaskSeven.setAttribute('id', 'task-7');
buttonTaskSeven.addEventListener('click',
                                () => {
                                    circleArea(2);
                                }
                            );

tasks.appendChild(buttonTaskSeven);
tasks.appendChild(document.createElement('br'));
tasks.appendChild(document.createElement('br'));



/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const coneVolume = (r, h) => {
    const volume = 1/3 * Math.PI * r ** 2 * h;
    console.log(volume)
}

const buttonTaskEight = document.createElement('button');
buttonTaskEight.innerText = "Uloha 8 (Another dimension)";
buttonTaskEight.setAttribute('id', 'task-8');
buttonTaskEight.addEventListener('click',
                                () => {
                                    coneVolume(3, 5);
                                }
                            );

tasks.appendChild(buttonTaskEight);
tasks.appendChild(document.createElement('br'));
tasks.appendChild(document.createElement('br'));

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
    const result = (a + b > c && a + c > b && b + c > a);
    if (result === true) {
        console.log(`Triangle with sides ${a}, ${b}, ${c} exists!`)
    } else {
        console.log(`It's impossible to build triangle with sides ${a}, ${b}, ${c}!`)
    }
    return result;
}

const buttonTaskNine = document.createElement('button');
buttonTaskNine.innerText = "Uloha 9 (Not sure if triangle, or just some random values)";
buttonTaskNine.setAttribute('id', 'task-9');
buttonTaskNine.addEventListener('click',
                                () => {
                                    isTriangle(3, 4, 5);
                                }
                            );

tasks.appendChild(buttonTaskNine);
tasks.appendChild(document.createElement('br'));
tasks.appendChild(document.createElement('br'));


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

const triangleArea = (a, b, c) => {
    const results = document.querySelector('#results');
    if (isTriangle(a, b, c) === false) {
        return `Error! It's impossible to build a triangle with sides ${a}, ${b}, ${c}!`;
    } else {
        const s = (a + b + c) / 2;
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        return `Area of a triangle is ${area}.`
    }

}
// - krok 2 - vytvořte tlačítko
const buttonTaskTen = document.createElement('button');
buttonTaskTen.innerText = "Uloha 10 (Heroic performance)";

// - krok 3 - nabindujte na toto tlačítko callback, ve kterém zavoláte implementovanou funkci pro výpočet a výpis výsledků
buttonTaskTen.setAttribute('id', 'task-10');
buttonTaskTen.addEventListener('click',
                                () => {
                                    results.innerHTML = '';
                                    results.innerHTML += triangleArea(3, 4, 5) + '<br>';
                                    results.innerHTML += triangleArea(3, 4, 10) + '<br>';
                                }
                            );
    
                            
// - krok 4 - tlačítko umístěte na stránku
tasks.appendChild(buttonTaskTen);


// - krok 5 - otestujte řešení klikáním na tlačítko








