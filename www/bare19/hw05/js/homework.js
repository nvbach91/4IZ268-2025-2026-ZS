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
const currentYear = new Date().getFullYear();
const pepeBirthYear = 2000;
const pepeAge = currentYear - pepeBirthYear;
const text = `Pepe is ${pepeAge} years old (born in ${pepeBirthYear}).`;
console.log(text);



/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here

const celsius = 20;
const fahrenheit = (celsius * 9) / 5 + 32;
const backToCelsius = ((fahrenheit - 32) * 5) / 9;

const text2 = `${celsius}°C = ${fahrenheit}°F\n${fahrenheit}°F = ${backToCelsius.toFixed(1)}°C`;
console.log(text2);




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
const calculateAge = (birthYear) => {
  const currentYear = new Date().getFullYear();
  console.log(currentYear - birthYear)
  return currentYear - birthYear;
};

const convertTemp = (cels , fahr) =>{
const celsius = cels;
const fahrenheit = fahr;
const toFahrenheit = (celsius * 9) / 5 + 32;
const toCelsius = ((fahrenheit - 32) * 5) / 9;

const text2 = `${celsius}°C = ${toFahrenheit}°F\n${fahrenheit}°F = ${toCelsius.toFixed(1)}°C`;
console.log(text2);

};


const tempButton = document.createElement('button');  
tempButton.innerText = 'temp';  
tempButton.setAttribute('id', 'task-0');  
tempButton.addEventListener('click', () => {
    convertTemp(20,68);
});


const tasks = document.querySelector('#tasks');
tasks.appendChild(tempButton);

const ageButton = document.createElement('button');  
ageButton.innerText = 'age';  
ageButton.setAttribute('id', 'task-0');  
ageButton.addEventListener('click', () => {
    calculateAge(2004);
});

tasks.appendChild(ageButton);

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
  if (whole === 0) {
    results.innerText = 'Error: division by zero!';
    return;
  }
  const percent = ((part / whole) * 100).toFixed(2);
  const text = `${part} je ${percent}% z ${whole}`;
  console.log(text);
  results.innerText = text;
};

const divisionButton = document.createElement('button');  
divisionButton.innerText = 'procenta';  
divisionButton.setAttribute('id', 'task-0');  
divisionButton.addEventListener('click', () => {
    percentage(20,4);
});

tasks.appendChild(divisionButton);

/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here

const compareNumbers = (a, b) => {
  let text = '';
  if (a > b) text = `${a} je větší než ${b}`;
  else if (a < b) text = `${b} je větší než ${a}`;
  else text = `${a} a ${b} se rovnají`;
  console.log(text);
  results.innerText = text;
};

const compare = document.createElement('button');  
compare.innerText = 'a>b';  
compare.setAttribute('id', 'task-0');  
compare.addEventListener('click', () => {
    compareNumbers(20,5);
});

tasks.appendChild(compare);

const compare2 = document.createElement('button');  
compare2.innerText = 'a<b';  
compare2.setAttribute('id', 'task-0');  
compare2.addEventListener('click', () => {
    compareNumbers(5,6);
});

tasks.appendChild(compare2);

const compare3 = document.createElement('button');  
compare3.innerText = 'a=b';  
compare3.setAttribute('id', 'task-0');  
compare3.addEventListener('click', () => {
    compareNumbers(5,5);
});

tasks.appendChild(compare3);




/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here
const multiplesOf13 = () => {
  
  let text = '';
  for (let i = 0; i <= 730; i += 13) {
    text += i + ' ';
  }
  console.log(text);
  results.innerText = text;
};

const multiples = document.createElement('button');  
multiples.innerText = 'multiples';  
multiples.setAttribute('id', 'task-0');  
multiples.addEventListener('click', () => {
    multiplesOf13();
});

tasks.appendChild(multiples);



/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const circleArea = (radius) => {
  const area = Math.PI * radius * radius;
  const text = `Obsah kružnice s poloměrem ${radius} je ${area.toFixed(2)}`;
  console.log(text);
  results.innerText = text;
};

const circle = document.createElement('button');  
circle.innerText = 'circleArea';  
circle.setAttribute('id', 'task-0');  
circle.addEventListener('click', () => {
    circleArea(2);
});

tasks.appendChild(circle);



/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const coneVolume = (radius, height) => {
  const volume = (1 / 3) * Math.PI * radius * radius * height;
  const text = `Objem kuželu s poloměrem ${radius} a výškou ${height} je ${volume.toFixed(2)}`;
  console.log(text);
  results.innerText = text;
};

const cone = document.createElement('button');  
cone.innerText = 'coneVolume';  
cone.setAttribute('id', 'task-0');  
cone.addEventListener('click', () => {
    coneVolume(2,5);
});

tasks.appendChild(cone);

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
  const valid = a + b > c && a + c > b && b + c > a;
  const text = `Strany: a=${a}, b=${b}, c=${c} → ${valid ? 'ANO' : 'NE'}`;
  console.log(text);
  results.innerText = text;
  return valid;
};

const triangle = document.createElement('button');  
triangle.innerText = 'isTriangle';  
triangle.setAttribute('id', 'task-0');  
triangle.addEventListener('click', () => {
    isTriangle(2,3,4);
});

tasks.appendChild(triangle);



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


const heronArea = (a, b, c) => {
  results.innerText = '';
  if (!isTriangle(a, b, c)) {
    results.innerText = `Z těchto délek (${a}, ${b}, ${c}) nelze vytvořit trojúhelník.`;
    return;
  }
  const s = (a + b + c) / 2; 
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  const text = `Trojúhelník se stranami ${a}, ${b}, ${c} má obsah: ${area.toFixed(2)}.`;
  console.log(text);
  results.innerText = text;
};

const heron = document.createElement('button');
heron.innerText = 'heron';
heron.setAttribute('id', 'task-10');
heron.addEventListener('click', () => {
  heronArea(3, 4, 5);
});

tasks.appendChild(heron);
