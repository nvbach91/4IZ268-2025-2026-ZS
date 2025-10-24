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

console.log("Ahoj světe")

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here

 function age() {
    let taskAnswer = document.getElementById("task-1-answer");
    const taskInput = document.getElementById("task-1-input").value;

    if (taskInput.length > 0) {
        taskAnswer.textContent = `Pepe's age is ${taskInput}!`
        console.log(`DBG: Pepe's age is ${taskInput}!`)
    } else {
        taskAnswer.textContent = "Input an age above!"
        console.log("ERR: Age was not inputted")
    }
}

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

function convert() {
    const selectedMeasurement = document.getElementById("task-cf-combobox").value;
    const temperature = document.getElementById("task-2-input").value;
    let answer = document.getElementById("task-2-answer");

    if (selectedMeasurement === "C") {
        let temperatureInt = parseInt(temperature, 10)
        let result = (temperatureInt * 9) / 5 + 32
        answer.textContent =`${temperatureInt} °C is equal to ${result} °F`;
        console.log(`DBG: Conversion result from C to F is: ${result}`)
    }
    else if (selectedMeasurement === "F") {
        let temperatureInt = parseInt(temperature, 10)
        let result = (temperatureInt - 32) * 5 / 9
        answer.textContent =`${temperatureInt} °F is equal to ${result} °C`;
        console.log(`DBG: Conversion result from F to C is: ${result}`)
    }
    else  {
        console.log(`ERR: UNEXPECTED ERROR`)
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

const buttonTask1 = document.createElement("button");
buttonTask1.id = "task-1-submit";
buttonTask1.className = "task-button";
buttonTask1.textContent = "➤";

buttonTask1.addEventListener("click", age);

document.querySelector("#task-1-box").appendChild(buttonTask1);
console.log(document.querySelector("#task-1-box"))

const buttonTask2 = document.createElement("button");
buttonTask2.id = "task-2-submit";
buttonTask2.className = "task-button";
buttonTask2.textContent = "➤";

buttonTask2.addEventListener("click", convert);

document.querySelector("#task-2-box").appendChild(buttonTask2);
console.log(document.querySelector("#task-2-box"))


/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const task3SubmitButton = document.querySelector("#task-3-submit");

task3SubmitButton.addEventListener("click", divide)

function divide() {
    const task3numberOne = document.querySelector("#task-3-1-input").value;
    const task3numberTwo = document.querySelector("#task-3-2-input").value;
    const task3answer = document.querySelector("#task-3-answer");
    const task3symbol = document.querySelector("#task-3-symbol");

    if (task3numberOne.length > 0 && task3numberTwo.length > 0) {

        let numberOneInt = parseInt(task3numberOne);
        let numberTwoInt = parseInt(task3numberTwo);

        let result = (numberOneInt / numberTwoInt) * 100

        task3answer.textContent = `Number ${numberOneInt} is ${result} % of number ${numberTwoInt}.`;
        console.log(`DBG: Division result is ${result}`)

        if (result < 100) {
            task3symbol.textContent = "<"
        }
        if (result > 100) {
            task3symbol.textContent = ">"
        }
        if (result === 100) {
            task3symbol.textContent = "="
        }
    }
    else {
        task3answer.textContent = "At least one number was not entered!"
        console.log("ERR: Number not entered")
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

const task4SubmitButton = document.querySelector("#task-4-submit");

task4SubmitButton.addEventListener("click", compare);

function compare() {
    const numberOne = document.querySelector("#task-4-1-input").value;
    const numberTwo = document.querySelector("#task-4-2-input").value;
    const answer = document.querySelector("#task-4-answer");
    const symbol = document.querySelector("#task-4-symbol");

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

const task5SubmitButton = document.querySelector("#task-5-submit");

task5SubmitButton.addEventListener("click", pattern);

function pattern() {
    const numberOne = parseInt(document.querySelector("#task-5-1-input").value);
    const numberTwo = parseInt(document.querySelector("#task-5-2-input").value);
    let answer = document.querySelector("#task-5-answer");

    if (!isNaN(numberOne) && !isNaN(numberTwo)) {
        for (let i = 0; i < numberTwo; i += numberOne) {
            answer.append(`${i}, `)
            console.log(`DBG: ${i}`)
        }
    } else {
        answer.textContent = "At least one number was not entered!"
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

const task6SubmitButton = document.querySelector("#task-6-submit");

task6SubmitButton.addEventListener("click", circleArea);

function circleArea() {
    const radius = parseInt(document.querySelector("#task-6-input").value);
    let answer = document.querySelector("#task-6-answer");
    const pi = 3.14159;

    if (!isNaN(radius)) {
        let result = pi * (radius ** 2);

        answer.textContent = `Area of this circle is ${result.toFixed(2)} cm`
        console.log(`DBG: Result is ${result}`)
    } else {
        answer.textContent = `Enter a radius first!`
        console.log(`ERR: Number not entered`)
    }
}

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const task7SubmitButton = document.querySelector("#task-7-submit");

task7SubmitButton.addEventListener("click", coneContent);

function coneContent() {
    const height = parseInt(document.querySelector("#task-7-1-input").value);
    const radius = parseInt(document.querySelector("#task-7-2-input").value);
    let answer = document.querySelector("#task-7-answer");
    const pi = 3.14159;

    if (!isNaN(height) && !isNaN(radius)) {
        let result = (1/3) * pi * (radius ** 2) * height;
        answer.textContent = `Content of this cone is ${result.toFixed(2)} cm2`
        console.log(`DBG: Result is ${result}`)
    } else {
        answer.textContent = `At least one number was not entered!`
        console.log(`ERR: Number not entered`)
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

const task8SubmitButton = document.querySelector("#task-8-submit");

task8SubmitButton.addEventListener("click", () => {
    /* Pass the arguments before invoking the function - fresh values every time */
    const a = document.querySelector("#task-8-1-input").value;
    const b = document.querySelector("#task-8-2-input").value;
    const c = document.querySelector("#task-8-3-input").value;
    let answer = document.querySelector("#task-8-answer");

    /* Invoking the function */
    if (isTriangle(a, b, c)) {
        answer.textContent = "This is a triangle!";
        console.log("DBG: isTriangle: True")
    } else {
        answer.textContent = "This is NOT a triangle!";
        console.log("DBG: isTriangle: False")
    }
});

function isTriangle(sideA, sideB, sideC) {
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(sideC);

    if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
        return (a + b > c) && (a + c > b) && (b + c > a);
    } else {
        console.log(`ERR: isTriangle: Number not entered`)
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
function heronArea() {
//   - krok 1.1 - pomocí selektoru vyberte container pro výpis výsledků a uložte ho do proměnné
    const a = parseInt(document.querySelector("#task-9-1-input").value);
    const b = parseInt(document.querySelector("#task-9-2-input").value);
    const c = parseInt(document.querySelector("#task-9-3-input").value);
    let answer = document.querySelector("#task-9-answer");
//   - krok 1.2 - zvalidujte vstupní argumenty pomocí funkce z úlohy č. 9
//     - v případě nevalidních hodnot vypište chybovou hlášku na místo pro výpis výsledků a funkci ukončete
    if (!isTriangle(a, b, c)) {
        answer.textContent = "This is NOT a triangle!";
        console.log("DBG: isTriangle: False");
    } else {
//      - v případě validních hodnot pokračujte s výpočtem
        const s = (a + b + c) / 2;
//      - krok 1.3 - spočítejte obsah trojúhelníku podle Heronovy vzorce a výsledek uložte do proměnné
        let area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
//      - krok 1.4 - vypište výsledek na místo pro výpis výsledků
        answer.textContent = `Area of this triangle is ${area.toFixed(2)} cm`;
        console.log(`DBG: isTriangle: True; Calculation is: ${area}`);
    }
}
// - krok 2 - vytvořte tlačítko
const button = document.createElement("button");
button.id = "task-9-submit";
button.className = "task-button";
button.textContent = "➤";
// - krok 3 - nabindujte na toto tlačítko callback, ve kterém zavoláte implementovanou funkci pro výpočet a výpis výsledků
button.addEventListener("click", heronArea);
// - krok 4 - tlačítko umístěte na stránku
document.querySelector("#task-9-box").appendChild(button);
console.log(document.querySelector("#task-9-box"))
// - krok 5 - otestujte řešení klikáním na tlačítko




