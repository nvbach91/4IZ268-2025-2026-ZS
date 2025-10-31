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



const sayHello = () => {
    console.log("Ahoj světe");
};


/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here

/*
const pepesBirth = 2004;
const year = 2025;
function getPepesAge() {
    return "Pepe is " + (year - pepesBirth) + " years old.";
}
console.log(getPepesAge());
*/

const getPepesAge = (pepesBirth, year) => {
    const age = year - pepesBirth;
    console.log(age);
};


/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

/*
const celsius = 20;
const fahrenheiht = 68;
function celsiusToFahrenheiht() {
    return "Temperature in Fahrenheiht: " + ((celsius * 9)/5 + 32)
}

function fahrenheihtToCelsius() {
    return "Temperature in Celsius: " + (((fahrenheiht - 32)*5)/9)
}

console.log(celsiusToFahrenheiht())
console.log(fahrenheihtToCelsius())
*/

const celsiusToFahrenheiht = (celsius) => {
  const fahrenheit = (celsius * 9) / 5 + 32;
  console.log(`${celsius}°C = ${fahrenheit}°F`);
};

const fahrenheihtToCelsius = (fahrenheit) => {
  const celsius = ((fahrenheit - 32) * 5) / 9;
  console.log(`${fahrenheit}°F = ${celsius}°C`);
};


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

const buttonSayHello = document.createElement('button');
buttonSayHello.innerText = 'Say Hello';
buttonSayHello.setAttribute('id', 'task-0');
buttonSayHello.addEventListener('click', () => {
  sayHello();
});

const tasks = document.querySelector('#tasks');
tasks.appendChild(buttonSayHello);



/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const buttonPercentage = document.createElement('button');
buttonPercentage.innerText = "Calculate percentage";
buttonPercentage.setAttribute("id", "task-4");
buttonPercentage.addEventListener("click", () => {
    calculatePercentage(21, 42);
});

tasks.appendChild(buttonPercentage);

const calculatePercentage = (dividend, divisor) => {
    const resultDiv = document.querySelector('#result');
    
    if (divisor == 0) {
        resultDiv.textContent = "Error: Division by zero is not allowed.";
        console.log("Error: Division by zero is not allowed.");
    } else {
        const result = ((dividend / divisor) * 100).toFixed(2);
        resultDiv.textContent = `${dividend} is ${result}% of ${divisor}`;
        console.log(`${dividend} is ${result}% of ${divisor}`);
    }
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


const buttonCompare = document.createElement('button');
buttonCompare.innerText = "Compare two numbers";
buttonCompare.setAttribute("id", "task-5");
buttonCompare.addEventListener("click", () => {
    compareNumbers(21, 42);
});

tasks.appendChild(buttonCompare);

const compareNumbers = (a, b) => {
    const resultDiv = document.querySelector('#result');

    if (a > b) {
        resultDiv.textContent = `${a} is greater than ${b}`;
        console.log(`${a} is greater than ${b}`);
    } else if (a < b) {
        resultDiv.textContent = `${a} is less than ${b}`;
        console.log(`${a} is less than ${b}`);
    } else {
        resultDiv.textContent = `${a} is equal to ${b}`;
        console.log(`${a} is equal to ${b}`);
    }
};


/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here


const buttonMultiply = document.createElement('button');
buttonMultiply.innerText = "Multiples of 13";
buttonMultiply.setAttribute("id", "task-6");
buttonMultiply.addEventListener("click", () => {
    multiplyNumbers();
});

tasks.appendChild(buttonMultiply);

const multiplyNumbers = () => {
    const resultDiv = document.querySelector('#result');
    resultDiv.textContent = ''; // Smazání obsahu result divu
    let n=0;
    for (n=0; n<=730; n+=13) {
        resultDiv.textContent += `${n} `;
        console.log(`${n} `);
    }

}


/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const buttonVolume = document.createElement("button");
buttonVolume.innerText = "Volume of a circle";
buttonVolume.setAttribute("id", "task-7")
buttonVolume.addEventListener("click", () => {
    countVolume(6);
});

tasks.appendChild(buttonVolume);

const countVolume = (r) => {
    const resultDiv = document.querySelector("#result");
    resultDiv.textContent = Math.PI * r**2;
    console.log(Math.PI * r**2);
    
}



/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const buttonConeVolume = document.createElement("button");
buttonConeVolume.innerText = "Volume of a cone";
buttonConeVolume.setAttribute("id", "task-8")
buttonConeVolume.addEventListener("click", () => {
    calculateConeVolume(10, 5);
});

tasks.appendChild(buttonConeVolume);

const calculateConeVolume = (height, radius) => {
    const resultDiv = document.querySelector("#result");
    const volume = (1/3) * Math.PI * radius**2 * height;
    resultDiv.textContent = volume.toFixed(2);
    console.log(volume);
};


/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const buttonTriangleCheck = document.createElement("button");
buttonTriangleCheck.innerText = "Triangle check";
buttonTriangleCheck.setAttribute("id", "task-9")
buttonTriangleCheck.addEventListener("click", () => {
    isTrianglePossible(30, 4, 5);
});

tasks.appendChild(buttonTriangleCheck);

function isTrianglePossible(a, b, c) {
    const resultDiv = document.querySelector("#result");
    if (a + b > c && a + c > b && b + c > a) {
        resultDiv.textContent = `Sides ${a}, ${b}, and ${c} can form a triangle: true`;
        console.log(`Sides ${a}, ${b}, and ${c} can form a triangle: true`);
        return true;
    } else {
        resultDiv.textContent = `Sides ${a}, ${b}, and ${c} cannot form a triangle: false`;
        console.log(`Sides ${a}, ${b}, and ${c} cannot form a triangle: false`);
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


const buttonTriangleVolume = document.createElement("button");
buttonTriangleVolume.innerText = "Volume of a triangle";
buttonTriangleVolume.setAttribute("id", "task-10")
buttonTriangleVolume.addEventListener("click", () => {
    countTriangleVolume(3, 4, 5);
});

tasks.appendChild(buttonTriangleVolume);

function countTriangleVolume(a, b, c) {
    const resultDiv = document.querySelector("#result");
    if (a + b > c && a + c > b && b + c > a) {
        const s = (a+b+c)/2;
        const volume = Math.sqrt(s*(s-a)*(s-b)*(s-c));
        resultDiv.textContent = `Volume of the triangle is ${volume}`;
        console.log(`Volume of the triangle is ${volume}`);
    } else {
        resultDiv.textContent = `Sides ${a}, ${b}, and ${c} cannot form a triangle: false`;
        console.log(`Sides ${a}, ${b}, and ${c} cannot form a triangle: false`);
    }

}