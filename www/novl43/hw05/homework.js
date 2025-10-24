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
const pepeBirthYear = 2005;
const currentYear = new Date().getFullYear();
const pepeAge = currentYear - pepeBirthYear;
console.log(`Pepe is ${pepeAge} years old.`);






/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

const celsiusTemp = 20;
const fahrenheitTemp = (celsiusTemp * 9) / 5 + 32;
console.log(`${celsiusTemp}°C = ${fahrenheitTemp}°F`);

const fahrenheitTemp2 = 68;
const celsiusTemp2 = ((fahrenheitTemp2 - 32) * 5) / 9;
console.log(`${fahrenheitTemp2}°F = ${celsiusTemp2}°C`);




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

// Function for Pepe's age
const calculatePepesAge = (birthYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  console.log(`Pepe is ${age} years old.`);
};

// Create button for Pepe's age
const buttonPepesAge = document.createElement('button');
buttonPepesAge.innerText = "Calculate Pepe's Age";
buttonPepesAge.setAttribute('id', 'task-1');
buttonPepesAge.addEventListener('click', () => {
  calculatePepesAge(2005);
});

// Append button to tasks div
const tasksDiv = document.querySelector('#tasks');
tasksDiv.appendChild(buttonPepesAge);

// Function for temperature conversion
const convertTemperature = (temp, scale) => {
  if (scale === 'CtoF') {
    const fahrenheit = (temp * 9) / 5 + 32;
    console.log(`${temp}°C = ${fahrenheit}°F`);
  } else if (scale === 'FtoC') {
    const celsius = ((temp - 32) * 5) / 9;
    console.log(`${temp}°F = ${celsius}°C`);
  } else {
    console.log('Invalid scale provided. Use "CtoF" or "FtoC".');
  }
};

// Create button for temperature conversion
const buttonTempConversion = document.createElement('button');
buttonTempConversion.innerText = 'Convert Temperature';
buttonTempConversion.setAttribute('id', 'task-2');
buttonTempConversion.addEventListener('click', () => {
  convertTemperature(20, 'CtoF');
  convertTemperature(68, 'FtoC');
});

// Append button to tasks div
tasksDiv.appendChild(buttonTempConversion); 




/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here
// Function to calculate percentage
const calculatePercentage = (part, whole) => {
  const resultDiv = document.querySelector('#results');
  if (whole === 0) {
    resultDiv.innerText = 'Error: Division by zero is not allowed.';
    return;
  }
  const percentage = (part / whole) * 100;
  resultDiv.innerText = `${part} is ${percentage.toFixed(2)}% of ${whole}.`;
};

// Create button for percentage calculation
const buttonPercentage = document.createElement('button');
buttonPercentage.innerText = 'Calculate Percentage';
buttonPercentage.setAttribute('id', 'task-4');
buttonPercentage.addEventListener('click', () => {
  calculatePercentage(21, 42);
});

// Append button to tasks div
tasksDiv.appendChild(buttonPercentage);






/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here

// Function to compare two numbers
const compareNumbers = (num1, num2) => {
  const resultDiv = document.querySelector('#results');
  if (num1 > num2) {
    resultDiv.innerText = `${num1} is greater than ${num2}.`;
  } else if (num1 < num2) {
    resultDiv.innerText = `${num2} is greater than ${num1}.`;
  } else {
    resultDiv.innerText = 'Both numbers are equal.';
  }
};

// Create button for comparing numbers
const buttonCompare = document.createElement('button');
buttonCompare.innerText = 'Compare Numbers';
buttonCompare.setAttribute('id', 'task-5');
buttonCompare.addEventListener('click', () => {
  compareNumbers(10, 20); // You can change the numbers to test different cases
});

// Append button to tasks div
tasksDiv.appendChild(buttonCompare);    




/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const printMultiplesOf13 = () => {
    const resultDiv = document.querySelector('#results');
    let multiples = '';
    for (let i = 0; i <= 730; i += 13) {
        multiples += i + ' ';
    }
    resultDiv.innerText = multiples.trim();
};

// Create button for printing multiples of 13
const buttonMultiplesOf13 = document.createElement('button');
buttonMultiplesOf13.innerText = 'Print Multiples of 13';
buttonMultiplesOf13.setAttribute('id', 'task-6');
buttonMultiplesOf13.addEventListener('click', () => {
    printMultiplesOf13();
});

// Append button to tasks div
tasksDiv.appendChild(buttonMultiplesOf13);  




/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const calculateCircleArea = (radius) => {
    const resultDiv = document.querySelector('#results');
    const area = Math.PI * radius ** 2;
    resultDiv.innerText = `The area of a circle with radius ${radius} is ${area.toFixed(2)}.`;
};

// Create button for calculating circle area
const buttonCircleArea = document.createElement('button');
buttonCircleArea.innerText = 'Calculate Circle Area';
buttonCircleArea.setAttribute('id', 'task-7');
buttonCircleArea.addEventListener('click', () => {
    calculateCircleArea(5); // You can change the radius to test different cases
});

// Append button to tasks div
tasksDiv.appendChild(buttonCircleArea); 




/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here


const calculateConeVolume = (height, radius) => {
    const resultDiv = document.querySelector('#results');
    const volume = (1/3) * Math.PI * radius ** 2 * height;
    resultDiv.innerText = `The volume of a cone with height ${height} and radius ${radius} is ${volume.toFixed(2)}.`;
};

// Create button for calculating cone volume
const buttonConeVolume = document.createElement('button');
buttonConeVolume.innerText = 'Calculate Cone Volume';
buttonConeVolume.setAttribute('id', 'task-8');
buttonConeVolume.addEventListener('click', () => {
    calculateConeVolume(10, 3); // You can change the height and radius to test different cases
});

// Append button to tasks div
tasksDiv.appendChild(buttonConeVolume); 



/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const checkTriangleValidity = (a, b, c) => {
    const resultDiv = document.querySelector('#results');
    const isValid = (a + b > c) && (a + c > b) && (b + c > a);
    resultDiv.innerText = `Sides: a=${a}, b=${b}, c=${c} - Can form triangle: ${isValid ? 'Yes' : 'No'}`;
    return isValid;
};

// Create button for checking triangle validity
const buttonTriangleValidity = document.createElement('button');
buttonTriangleValidity.innerText = 'Check Triangle Validity';
buttonTriangleValidity.setAttribute('id', 'task-9');
buttonTriangleValidity.addEventListener('click', () => {
    checkTriangleValidity(3, 4, 5); // You can change the side lengths to test different cases
});

// Append button to tasks div
tasksDiv.appendChild(buttonTriangleValidity);   




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
const calculateTriangleArea = (a, b, c) => {
    const resultDiv = document.querySelector('#results');
    if (!checkTriangleValidity(a, b, c)) {
        resultDiv.innerText = 'Error: The provided side lengths cannot form a triangle.';
        return;
    }
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    resultDiv.innerText = `The area of the triangle with sides a=${a}, b=${b}, c=${c} is ${area.toFixed(2)}.`;
};

//vytvoření tlačítka
const buttonTriangleArea = document.createElement('button');
buttonTriangleArea.innerText = 'Calculate Triangle Area';
buttonTriangleArea.setAttribute('id', 'task-10');
buttonTriangleArea.addEventListener('click', () => {
    calculateTriangleArea(3, 4, 5); // You can change the side lengths to test different cases
});

// Append button to tasks div
tasksDiv.appendChild(buttonTriangleArea);   




