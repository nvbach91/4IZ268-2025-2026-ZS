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
const pepeBDay = 2000;
const currentYear = new Date().getFullYear(); 
console.log("Pepa se narodil v roce " + pepeBDay + " a letos mu je, nebo bude " + (currentYear - pepeBDay) + " let.");

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here
const celsius = 20;
console.log(celsius + "°C = " + (celsius * 9 / 5 + 32) + "°F");
const fahrenheiht = 68;
console.log(fahrenheiht + "°F = " + ((fahrenheiht - 32) * 5 / 9) + "°C");

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
const sayHello = () => {
    console.log('Ahoj světe');
};
 
const buttonSayHello = document.createElement('button');
buttonSayHello.innerText = 'Say Hello';
buttonSayHello.setAttribute('id', 'task-0');
buttonSayHello.addEventListener('click', () => {
  sayHello();
});

const tasks = document.querySelector('#tasks');
tasks.appendChild(buttonSayHello);

const pepesAge = (pepeBDay) => {
    const currentYear = new Date().getFullYear(); 
    console.log("Pepa se narodil v roce " + pepeBDay + " a letos mu je, nebo bude " + (currentYear - pepeBDay) + " let.");
};

const buttonPepesAge = document.createElement('button');
buttonPepesAge.innerText = "Pepe's age";
buttonPepesAge.setAttribute('id', 'task-1');
buttonPepesAge.addEventListener('click', () => {
    pepesAge(2010);
});

tasks.appendChild(buttonPepesAge);

const CTF = (celsius) => {
    console.log(celsius + "°C = " + (celsius * 9 / 5 + 32) + "°F");
};

const buttonCTF = document.createElement('button');
buttonCTF.innerText = "Celsius to Fahrenheiht";
buttonCTF.setAttribute('id', 'task-2');
buttonCTF.addEventListener('click', () => {
    CTF(25);
});

tasks.appendChild(buttonCTF);

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
    if (typeof(a) === 'number' && typeof(b) === 'number') {
        let result;
        if (b === 0) {
            result = "NaN";
        } else {
            result = a/b * 100;
            result = result.toFixed(2);
        }
        document.querySelector("#result-4").innerText = result + " %";
    }
};

const buttonPercent = document.createElement('button');
buttonPercent.innerText = "Podíl";
buttonPercent.setAttribute('id', 'task-4');
buttonPercent.addEventListener('click', () => {
    percent(21, 42);
});

tasks.appendChild(buttonPercent);

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
    if (typeof(a) === 'number' && typeof(b) === 'number') {
        let result;
        if (a > b) {
            result = a + ">" + b;
        }
        if (a < b) {
            result = a + "<" + b;
        }
        if (a == b) {
            result = a + "=" + b;
        }
        document.querySelector("#result-5").innerText = result;
    }
 };

const buttonCompare = document.createElement('button');
buttonCompare.innerText = "1 = 1";
buttonCompare.setAttribute('id', 'task-5');
buttonCompare.addEventListener('click', () => {
    compare(1,1);
});

tasks.appendChild(buttonCompare);

const buttonCompare1 = document.createElement('button');
buttonCompare1.innerText = "1 < 2";
buttonCompare1.setAttribute('id', 'task-5');
buttonCompare1.addEventListener('click', () => {
    compare(1,2);
});

tasks.appendChild(buttonCompare1);

const buttonCompare2 = document.createElement('button');
buttonCompare2.innerText = "4 > 2";
buttonCompare2.setAttribute('id', 'task-5');
buttonCompare2.addEventListener('click', () => {
    compare(4,2);
});

tasks.appendChild(buttonCompare2);

const buttonCompare3 = document.createElement('button');
buttonCompare3.innerText = "-4 < 2.1";
buttonCompare3.setAttribute('id', 'task-5');
buttonCompare3.addEventListener('click', () => {
    compare(-4,2.1);
});

tasks.appendChild(buttonCompare3);

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const pattern = () => {
    let multiple = 13;
    const result = document.querySelector("#result-6");
    while (multiple <= 730) {
        result.innerText += multiple + ", ";
        multiple += 13;
    }
};

const buttonPattern = document.createElement('button');
buttonPattern.innerText = "Pattern";
buttonPattern.setAttribute('id', 'task-6');
buttonPattern.addEventListener('click', () => {
    pattern();
});

tasks.appendChild(buttonPattern);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const surface = (r) => {
    document.querySelector("#result-7").innerText = (Math.PI*r*r);
}

const buttonSurface = document.createElement('button');
buttonSurface.innerText = "Obsah";
buttonSurface.setAttribute('id', 'task-7');
buttonSurface.addEventListener('click', () => {
    surface(10);
});

tasks.appendChild(buttonSurface);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const volume = (h, r) => {
    document.querySelector("#result-8").innerText = (Math.PI*r*r*h/3);
}

const buttonVolume = document.createElement('button');
buttonVolume.innerText = "Objem";
buttonVolume.setAttribute('id', 'task-8');
buttonVolume.addEventListener('click', () => {
    volume(20,10);
});

tasks.appendChild(buttonVolume);

/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const triangle = (a, b, c) => {
    return ((a + b > c) && (b + c > a) && (a + c > b));
}

const buttonTriangle = document.createElement('button');
buttonTriangle.innerText = "Trojúhelník";
buttonTriangle.setAttribute('id', 'task-9');
buttonTriangle.addEventListener('click', () => {
    document.querySelector("#result-9").innerText = triangle(2,3,4)
});

tasks.appendChild(buttonTriangle);

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

const heron = (a, b, c) => {
    const result = document.querySelector("#result-10");
    if (triangle(a,b,c)) {
        const s = (a + b + c)/2;
        const S = Math.sqrt(s*(s-a)*(s-b)*(s-c));
        result.innerText = S;
    } else {
        result.innerText = "Vstup není trojúhelník";
    }
}

const buttonHeron = document.createElement('button');
buttonHeron.innerText = "Heronův vzorec";
buttonHeron.setAttribute('id', 'task-10');
buttonHeron.addEventListener('click', () => {
    heron(2,3,4);
});

tasks.appendChild(buttonHeron);