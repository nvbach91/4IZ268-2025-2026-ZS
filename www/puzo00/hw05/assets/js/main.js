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
console.log("Ahoj světe");

/**
 * 1) Pepe's age. Vypište na konzoli smysluplnou oznamovací větu s věkem Pepy, pokud znáte jeho rok narození, 
 * který je uložený v proměnné a pro výpis použijte zřetězení stringů nebo interpolaci. Pro názvy proměnných 
 * používejte smysluplnou angličtinu.
 */
// Solution here
const birth = 2004;
const year = new Date().getFullYear();
const age = year - birth
console.log("This is Pepa. His age is " + age)





/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here
const celsius = 20;
const fahrenheiht = 68;
const celsiusMath = (fahrenheiht - 32) * 5 / 9;
const fahrenheihtMath = (celsius * 9 / 5) + 32;
console.log(celsius + "°C = " + fahrenheihtMath + "°F ");
console.log(fahrenheiht + "°F  = " + celsiusMath + "°C");




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

const getPepesAge = (birth) => {
    const year = new Date().getFullYear();
    const age = year - birth
    return age;
};

const buttonPepa = document.createElement('button');
buttonPepa.innerText = 'Pepa task';
buttonPepa.setAttribute('id', 'task-1');
buttonPepa.addEventListener('click', () => {
    return results.innerText = "Pepovi je: " + getPepesAge(1500);
});

const results = document.querySelector('#result'); 
const tasks = document.querySelector('#tasks');
tasks.appendChild(buttonPepa);


const getFahrenheiht = (celsius) => {
    const fahrenheihtMath = (celsius * 9 / 5) + 32;
    return celsius + "°C = " + fahrenheihtMath.toFixed(2) + "°F ";
};
const getCelsius = (fahrenheiht) => {
    const celsiusMath = (fahrenheiht - 32) * 5 / 9;
    return fahrenheiht + "°F  = " + celsiusMath.toFixed(2) + "°C";
};

const buttonFahrenheit = document.createElement('button');
buttonFahrenheit.innerText = 'get Fahrenheit';
buttonFahrenheit.setAttribute('id', 'task-2a');
buttonFahrenheit.addEventListener('click', () => {
    return results.innerText = (getFahrenheiht(35));
});
tasks.appendChild(buttonFahrenheit);


const buttonCelsius = document.createElement('button');
buttonCelsius.innerText = 'get Celsius';
buttonCelsius.setAttribute('id', 'task-2b');
buttonCelsius.addEventListener('click', () => {
    return results.innerText = getCelsius(150);
});

tasks.appendChild(buttonCelsius);


/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla.
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2);
 * Pozor na dělení nulou!
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here
const devide = (a, b) => {
    if (b === 0) {
        return "Nelze dělit nulou"
    };
    const result = (a / b) * 100;
    return a + " je " + result.toFixed(2) + "% z " + b + ".";
};


const buttonCensored = document.createElement('button');
buttonCensored.innerText = 'Censored task';
buttonCensored.setAttribute('id', 'task-4');
buttonCensored.addEventListener('click', () => {
    results.innerText = devide(7, 8009);
});

tasks.appendChild(buttonCensored);




/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají.
 *
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here
const compare = (a, b) => {
    if(a > b){
        return a + " je větší než " + b ;
    }else if(a < b) {
        return a + " je menší než " + b ;
    } 
    return a + " je stejně velké jak " + b;
};

const buttonCompare = document.createElement('button');
buttonCompare.innerText = 'Compare task >';
buttonCompare.setAttribute('id', 'task-5');
buttonCompare.addEventListener('click', () => {
    results.innerText = (compare(239, 55));
});

tasks.appendChild(buttonCompare);


const buttonCompare1 = document.createElement('button');
buttonCompare1.innerText = 'Compare task <';
buttonCompare1.setAttribute('id', 'task-5');
buttonCompare1.addEventListener('click', () => {
    results.innerText = (compare(0.5, 0.899));
});

tasks.appendChild(buttonCompare1);

const buttonCompare2 = document.createElement('button');
buttonCompare2.innerText = 'Compare task =';
buttonCompare2.setAttribute('id', 'task-5');
buttonCompare2.addEventListener('click', () => {
    results.innerText = (compare(5, 5));
});

tasks.appendChild(buttonCompare2);


/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší
 * nebo rovno 730, včetě nuly. Používejte for cyklus.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here
const pattern = () => {
    let output = "";
    for (let i = 0; i <= 730; i = i + 13) {
        output += i + "\n";
    };
    return output;
};

const buttonPattern = document.createElement('button');
buttonPattern.innerText = 'Pattern task';
buttonPattern.setAttribute('id', 'task-6');
buttonPattern.addEventListener('click', () => {
    results.innerText = pattern();
});

tasks.appendChild(buttonPattern);




/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const getArea = (radius) => {
    const area = Math.PI * radius**2
    return "Obsah kružnice s poloměrem " + radius  + " je: " + area.toFixed(2);
};

const buttonCircle= document.createElement('button');
buttonCircle.innerText = 'Circle area task';
buttonCircle.setAttribute('id', 'task-7');
buttonCircle.addEventListener('click', () => {
    results.innerText = (getArea(3));
});

tasks.appendChild(buttonCircle);




/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr.
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const getConeVolume = (height,radius) => {
    const volume = Math.PI * radius **2 * height/3;
    return "Objem kuželu je: " + volume.toFixed(2) + " při výšce " + height + " a poloměru "+ radius;
}

const buttonCone= document.createElement('button');
buttonCone.innerText = 'Cone volume task';
buttonCone.setAttribute('id', 'task-8');
buttonCone.addEventListener('click', () => {
    results.innerText = (getConeVolume(3,5));
});

tasks.appendChild(buttonCone);


/**
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte
 * staticky.
 */
// Solution here
const isTriangle = (a,b,c) => {
    return (a + b > c && a + c > b && b + c > a);
}

const buttonIsTriangle= document.createElement('button');
buttonIsTriangle.innerText = 'isTriangle task';
buttonIsTriangle.setAttribute('id', 'task-9');
buttonIsTriangle.addEventListener('click', () => {
    results.innerText = ("Je toto trojúhelník? " + isTriangle(2,3,5));
});

tasks.appendChild(buttonIsTriangle);


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
const triangleArea = (a,b,c) =>{
    if(!isTriangle(a,b,c)){
        return "Není trojúhelník" ;
    }
    const s = (a+b+c) / 2;
    const area = Math.sqrt(s * (s-a) * (s-b) * (s-c));
    return area.toFixed(2);
}

const buttonTriangleArea= document.createElement('button');
buttonTriangleArea.innerText = 'Triangle area task';
buttonTriangleArea.setAttribute('id', 'task-10');
buttonTriangleArea.addEventListener('click', () => {
    results.innerText = ("Obsah trojúhelníku je: " + triangleArea(4,5,6));
});

tasks.appendChild(buttonTriangleArea);