/**
 * 0) Pre-preparacion.
 *  */
console.log("Hello, JavaScript!");

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here
Pepesbirthyear="2000";
console.log("Pepe is " + (2025-Pepesbirthyear) + " years old.");

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

CelsiusTemperature=24;
console.log(CelsiusTemperature + "°C = " + ((CelsiusTemperature * 9/5) + 32) + "°F");

FahrenheitTemperature=75;
console.log(FahrenheitTemperature + "°F = " + ((FahrenheitTemperature - 32) * 5/9) + "°C");

/**
 * 3) Funkce function fonction funktio. Vemte předchozí úlohy a udělejte z nich funkce. Tj. vytvoříte funkce, 
 * které přijímají argumenty, a na základě argumentů po zavolání vypíše výsledek na konzoli. 
 * Párkrát zavolejte tyto funkce s různými argumenty. V konzoli také vyzkoušejte, zda fungují vaše funkce. 
 */
// Solution here

const pepesAge = (birthYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  console.log(`Pepe is ${age} years old.`);
};
pepesAge(2000);
pepesAge(1995);

const buttonPepe = document.createElement('button');
buttonPepe.innerText = "Pepe's Age";
buttonPepe.setAttribute('id', 'task-1');
buttonPepe.addEventListener('click', () => {
  pepesAge(2000);
});
const tasks = document.querySelector('#tasks');
tasks.appendChild(buttonPepe);

/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

const percentage = (part, whole) => {
  const resultsContainer = document.querySelector('#results');
  if (whole === 0) {
    resultsContainer.innerText = "Error: Division by zero is not allowed.";
    console.log("Error: Division by zero is not allowed.");
    return 
  }
  const result = (part / whole) * 100;
  console.log(result.toFixed(2));
  resultsContainer.innerText = `${part} is ${result.toFixed(2)}% of ${whole}`;
};

const buttonPercentage = document.createElement('button');
buttonPercentage.innerText = "Calculate Percentage";
buttonPercentage.setAttribute('id', 'task-2');
buttonPercentage.addEventListener('click', () => {
  percentage(22, 41);
}
);
const tasks2 = document.querySelector('#tasks');
tasks2.appendChild(buttonPercentage);

/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here
const compareNumbers = (num1, num2) => {
  const resultsContainer = document.querySelector('#results');
  if (num1 > num2) {
    resultsContainer.innerText = `${num1} is greater than ${num2}`;
    console.log(`${num1} is greater than ${num2}`);
    } else if (num1 < num2) {
    resultsContainer.innerText = `${num2} is greater than ${num1}`;
    console.log(`${num2} is greater than ${num1}`);
    } else {
    resultsContainer.innerText = `${num1} is equal to ${num2}`;
    console.log(`${num1} is equal to ${num2}`);
    }
};

const buttonCompare = document.createElement('button');
buttonCompare.innerText = "Compare Numbers";
buttonCompare.setAttribute('id', 'task-3');
buttonCompare.addEventListener('click', () => {
    compareNumbers(3.5, 2.8);
});
const tasks3 = document.querySelector('#tasks');
tasks3.appendChild(buttonCompare);

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const printMultiplesOf13 = () => {
  const resultsContainer = document.querySelector('#results');
  for (let i = 0; i <= 730; i += 13) {
    resultsContainer.innerText += i + "\n";
    console.log(i);
  }
};
const buttonMultiples = document.createElement('button');
buttonMultiples.innerText = "Print Multiples of 13";
buttonMultiples.setAttribute('id', 'task-4');
buttonMultiples.addEventListener('click', () => {
    printMultiplesOf13();
});
const tasks4 = document.querySelector('#tasks');
tasks4.appendChild(buttonMultiples);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here
const calculateCircleArea = (radius) => {
  const resultsContainer = document.querySelector('#results');
  const area = Math.PI * Math.pow(radius, 2);
  resultsContainer.innerText = `The area of a circle with radius ${radius} is ${area.toFixed(2)}`;
  console.log(`The area of a circle with radius ${radius} is ${area.toFixed(2)}`);
};

const buttonCircleArea = document.createElement('button');
buttonCircleArea.innerText = "Calculate Circle Area";
buttonCircleArea.setAttribute('id', 'task-5');
buttonCircleArea.addEventListener('click', () => {
    calculateCircleArea(5);
});
const tasks5 = document.querySelector('#tasks');
tasks5.appendChild(buttonCircleArea);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const calculateConeVolume = (height, radius) => {
  const resultsContainer = document.querySelector('#results');
  const volume = (1/3) * Math.PI * Math.pow(radius, 2) * height;
  resultsContainer.innerText = `The volume of a cone with height ${height} and radius ${radius} is ${volume.toFixed(2)}`;
  console.log(`The volume of a cone with height ${height} and radius ${radius} is ${volume.toFixed(2)}`);
};
const buttonConeVolume = document.createElement('button');
buttonConeVolume.innerText = "Calculate Cone Volume";
buttonConeVolume.setAttribute('id', 'task-6');
buttonConeVolume.addEventListener('click', () => {
    calculateConeVolume(10, 3);
});
const tasks6 = document.querySelector('#tasks');
tasks6.appendChild(buttonConeVolume);

/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const canFormTriangle = (a, b, c) => {
  const resultsContainer = document.querySelector('#results');
    if (a + b > c && a + c > b && b + c > a) {
        resultsContainer.innerText = `Sides ${a}, ${b}, and ${c} can form a triangle: true`;
        console.log(`Sides ${a}, ${b}, and ${c} can form a triangle: true`);
        return true;
    } else {
        resultsContainer.innerText = `Sides ${a}, ${b}, and ${c} can form a triangle: false`;
        console.log(`Sides ${a}, ${b}, and ${c} can form a triangle: false`);
        return false;
    }
};
const buttonTriangle = document.createElement('button');
buttonTriangle.innerText = "Can Form Triangle";
buttonTriangle.setAttribute('id', 'task-7');
buttonTriangle.addEventListener('click', () => {
    canFormTriangle(3, 4, 5);
});
const tasks7 = document.querySelector('#tasks');
tasks7.appendChild(buttonTriangle);

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

const calculateTriangleAreaHeron = (a, b, c) => {
  const resultsContainer = document.querySelector('#results');
    if (!canFormTriangle(a, b, c)) {
        resultsContainer.innerText = "Error: The provided side lengths cannot form a triangle.";
        return;
    }
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    resultsContainer.innerText = `The area of the triangle with sides ${a}, ${b}, and ${c} is ${area.toFixed(2)}`;
};
const buttonHeron = document.createElement('button');
buttonHeron.innerText = "Calculate Triangle Area (Heron)";
buttonHeron.setAttribute('id', 'task-8');
buttonHeron.addEventListener('click', () => {
    calculateTriangleAreaHeron(3, 4, 5);
});
const tasks8 = document.querySelector('#tasks');
tasks8.appendChild(buttonHeron);










