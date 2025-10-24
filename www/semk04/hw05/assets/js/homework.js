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

console.log ('Ahoj světe')

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here

// finds the button
const task1SubmitButton = document.getElementById("task01-submit");
// the function
task1SubmitButton.onclick = function () {
    //where we want the result shown
    let taskAnswer = document.getElementById("task01-answer");
    //reads what was written into input box
    const birthYear = document.getElementById("task01-input").value;
    const currentYear = new Date().getFullYear();

    //4 characters entered, number
    if (birthYear.length === 4 && !isNaN(birthYear)) {
        const age = currentYear - birthYear;
        taskAnswer.textContent = `Pepe is ${age} years old.`;
        console.log(`DBG: Pepe is ${age} years old.`);
    } else {
        taskAnswer.textContent = "Please enter a valid birth year (e.g. 1998).";
        console.log("ERR: Invalid birth year entered.");
    }
};

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

const task2SubmitButton = document.getElementById("task02-submit");

task2SubmitButton.onclick = function () {
    const temperatureInput = document.getElementById("task02-input").value;
    const selectedUnit = document.getElementById("select02").value;
    const answerDiv = document.getElementById("task02-return");

    // Validate input
    const temperatureNum = parseFloat(temperatureInput);
    if (isNaN(temperatureNum)) {
        answerDiv.textContent = "Please enter a valid number!";
        console.log("ERR: Invalid temperature input.");
        return;
    }

    // Function to perform conversion and return string
    function convertTemperature(value, unit) {
        if (unit === "C") {
            const result = (value * 9) / 5 + 32;
            return `${value} °C is equal to ${result.toFixed(2)} °F`;
        } else if (unit === "F") {
            const result = (value - 32) * 5 / 9;
            return `${value} °F is equal to ${result.toFixed(2)} °C`;
        } else {
            return "Unexpected unit selected!";
        }
    }

    // Perform conversion and display
    const resultText = convertTemperature(temperatureNum, selectedUnit);
    answerDiv.textContent = resultText;
    console.log(`DBG: ${resultText}`);
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





/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const task4SubmitButton = document.getElementById("task04-submit");

task4SubmitButton.addEventListener("click", divideNumbers);

function divideNumbers() {
    const numberOne = document.getElementById("task04a-input").value;
    const numberTwo = document.getElementById("task04b-input").value;
    const answerDiv = document.getElementById("task04-answer");

    if (numberOne.length > 0 && numberTwo.length > 0) {
        const num1 = parseFloat(numberOne);
        const num2 = parseFloat(numberTwo);

        if (num2 === 0) {
            answerDiv.textContent = "Cannot divide by zero!";
            console.log("ERR: Division by zero.");
            return;
        }

        const result = (num1 / num2) * 100;
        answerDiv.textContent = `Number ${num1} is ${result.toFixed(2)}% of number ${num2}.`;
        console.log(`DBG: Division result is ${result}`);

        // Optional: show comparison symbol
        let symbol = "";
        if (result < 100) symbol = "<";
        else if (result > 100) symbol = ">";
        else symbol = "=";
        console.log(`DBG: Comparison symbol is ${symbol}`);

    } else {
        answerDiv.textContent = "At least one number was not entered!";
        console.log("ERR: Number not entered");
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

const task5SubmitButton = document.querySelector("#task05-submit");

task5SubmitButton.addEventListener("click", compare);

function compare() {
    const numberOne = document.querySelector("#task05a-input").value;
    const numberTwo = document.querySelector("#task05b-input").value;
    const answer = document.querySelector("#task05-answer");
    const symbol = document.querySelector("#task05-symbol");
    
    let numberOneInt = parseInt(numberOne);
    let numberTwoInt = parseInt(numberTwo);

    switch (true) {
        case (numberOneInt > numberTwoInt):
            symbol.textContent = ">";
            answer.textContent = `Number ${numberOneInt} is larger than number ${numberTwoInt}`
            break;
        case (numberOneInt < numberTwoInt):
            symbol.textContent = "<";
            answer.textContent = `Number ${numberOneInt} is smaller than number ${numberTwoInt}`
            break;
        case (numberOneInt === numberTwoInt):
            symbol.textContent = "="
            answer.textContent = `Number ${numberOneInt} is equal to number ${numberTwoInt}`
            break;
        default:
            answer.textContent = "At least one number was not entered!"
            console.log(`DBG: Number 1: ${numberOneInt}`);
            console.log(`DBG: Number 2: ${numberTwoInt}`);
            console.log("ERR: Number not entered")
            break;
    }
}

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const task6SubmitButton = document.querySelector("#task06-submit");

task6SubmitButton.addEventListener("click", pattern);

function pattern() {
    const numberOne = parseInt(document.querySelector("#task06-1-input").value);
    const numberTwo = parseInt(document.querySelector("#task06-2-input").value);
    let answer = document.querySelector("#task06-answer");

    if (!isNaN(numberOne) && !isNaN(numberTwo)) {
        for (let i = 0; i <= numberTwo; i += numberOne) {
            answer.append(`${i} `)
            console.log(`DBG: ${i}`)
        }
    } else {
        answer.textContent = "Please enter valid numbers in both fields.";
        console.log("ERR: Number not entered")
    }
}

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const task7SubmitButton = document.querySelector("#task07-submit");

task7SubmitButton.addEventListener("click", circleArea);

function circleArea() {
    const radius = parseFloat(document.querySelector("#task07-input").value);
    const answer = document.querySelector("#task07-answer");
    const pi = 3.14159;

    // Clear previous output
    answer.textContent = "";

    if (!isNaN(radius)) {
        const result = pi * (radius ** 2);
        answer.textContent = `Area of this circle is ${result.toFixed(2)} cm²`;
        console.log(`DBG: Result is ${result}`);
    } else {
        answer.textContent = "Enter a radius first!";
        console.log("ERR: Number not entered");
    }
}

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const task8SubmitButton = document.querySelector("#task08-submit");

task8SubmitButton.addEventListener("click", coneContent);

function coneContent() {
    const height = parseFloat(document.querySelector("#task08-1-input").value);
    const radius = parseFloat(document.querySelector("#task08-2-input").value);
    const answer = document.querySelector("#task08-answer");
    const pi = 3.14159;

    // Clear previous output
    answer.textContent = "";

    if (!isNaN(height) && !isNaN(radius)) {
        const result = (1 / 3) * pi * (radius ** 2) * height;
        answer.textContent = `Content of this cone is ${result.toFixed(2)} cm³`;
        console.log(`DBG: Result is ${result}`);
    } else {
        answer.textContent = "At least one number was not entered!";
        console.log("ERR: Number not entered");
    }
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

const task9SubmitButton = document.querySelector("#task09-submit");

task9SubmitButton.addEventListener("click", () => {
    // Get values from inputs
    const a = document.querySelector("#task09-1-input").value;
    const b = document.querySelector("#task09-2-input").value;
    const c = document.querySelector("#task09-3-input").value;
    const answer = document.querySelector("#task09-answer");

    // Clear previous output
    answer.textContent = "";

    // Check if it forms a triangle
    if (isTriangle(a, b, c)) {
        answer.textContent = "This is a triangle!";
        console.log("DBG: isTriangle: True");
    } else {
        answer.textContent = "This is NOT a triangle!";
        console.log("DBG: isTriangle: False");
    }
});

function isTriangle(sideA, sideB, sideC) {
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(sideC);

    if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
        return (a + b > c) && (a + c > b) && (b + c > a);
    } else {
        console.log("ERR: isTriangle: Number not entered");
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

const task10SubmitButton = document.querySelector("#task10-submit");

task10SubmitButton.addEventListener("click", heronArea);

function heronArea() {
    const a = parseFloat(document.querySelector("#task10-1-input").value);
    const b = parseFloat(document.querySelector("#task10-2-input").value);
    const c = parseFloat(document.querySelector("#task10-3-input").value);
    const answer = document.querySelector("#task10-answer");

    // Clear previous output
    answer.textContent = "";

    if (!isTriangle(a, b, c)) {
        answer.textContent = "This is NOT a triangle!";
        console.log("DBG: isTriangle: False");
        return;
    }

    // Heron's formula
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    answer.textContent = `Area of this triangle is ${area.toFixed(2)} cm²`;
    console.log(`DBG: isTriangle: True; Area calculation: ${area}`);
}

// Helper function to check if sides form a triangle
function isTriangle(a, b, c) {
    if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
        return a + b > c && a + c > b && b + c > a;
    }
    console.log("ERR: Number not entered");
    return false;
}




