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
let pepeBirthYear = 2005;
let pepeAge = new Date().getFullYear() - pepeBirthYear;

if (pepeBirthYear != null){
    console.log("Pepe is " + pepeAge + " years old.");
} else {
    console.log("I don't know when Pepe was born :(")
}

/**
 * 2) WTF (wow, that's fun). Vypište na konzoli teplotu v Fahrenheiht, pokud znáte teplotu v Celsius, a také naopak. 
 * Formát výpisu je: 20°C =  68°F resp. 68°F = 20°C. Opět používejte proměnné. Výpočet probíhá takto:
 *     z C na F: vynásobit 9, vydělit 5 a přičíst 32. 
 *     z F na C: odečíst 32, vynásobit 5 a vydělit 9. 
 */
// Solution here
let celsius = 20;
let fahrenheit = (celsius * 9) / 5 + 32;
console.log(celsius + "°C = " + fahrenheit + "°F");

let fahrenheit2 = 68;
let celsius2 = ((fahrenheit2 - 32) * 5) / 9;
console.log(fahrenheit2 + "°F = " + celsius2 + "°C");

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

// Funkce ktera vrati vek po zadani roku narozeni
const getPepeAge = (pepeBirthYear) => {
    let pepeAge = new Date().getFullYear() - pepeBirthYear;
    if (pepeBirthYear != null){
    console.log("Pepe is " + pepeAge + " years old.");
    } else {
        console.log("I don't know when Pepe was born :(")
    }
}

// Vytvoreni button pro funkci getPepeAge
const buttonGetPepeAge = document.createElement("button");
buttonGetPepeAge.innerText = "How old is Pepe?";
buttonGetPepeAge.setAttribute("id", "task-1");
buttonGetPepeAge.addEventListener("click", () => {
    getPepeAge(1980);
});

const tasks = document.querySelector("#tasks");
tasks.appendChild(buttonGetPepeAge);


// funkce ktera vraci stupne ve fahrenhaitu po vlozeni stupnu v celcius
const toFahrenheit = (celsius) => {
    let fahrenheit = (celsius * 9) / 5 + 32;
    console.log(celsius + "°C = " + fahrenheit + "°F");
}

// Vytvoreni button pro funkci toFahrenheit
const buttonToFahrenheit = document.createElement("button");
buttonToFahrenheit.innerText = "Celcius to fahrenheit";
buttonToFahrenheit.setAttribute("id", "task-2");
buttonToFahrenheit.addEventListener("click", () => {
    toFahrenheit(13);
});

tasks.appendChild(buttonToFahrenheit);


// funkce ktera vraci stupne v celciu po vlozeni stupnu ve fahrenhaitu
const toCelcius = (fahrenheit) => {
    let celsius = ((fahrenheit - 32) * 5) / 9;
    console.log(fahrenheit + "°F = " + celsius + "°C");
}

// Vytvoreni button pro funkci toCelcius
const buttonToCelcius = document.createElement("button");
buttonToCelcius.innerText = "Fahrenhait to Celcius";
buttonToCelcius.setAttribute("id", "task-3");
buttonToCelcius.addEventListener("click", () => {
    toCelcius(90);
});

tasks.appendChild(buttonToCelcius);

/**
 * 4) %CENSORED%. Vytvořte funkci, která vezme 2 číselné argumenty a vrátí podíl prvního čísla a druhého čísla. 
 * Výsledek vypište v procentech do předem vytvořeného místa na stránce pro výsledky, např. 21 je 50% z 42. Pro 
 * zkrácení / zaokrouhlení desetinných míst použijte funkci .toFixed(n). Např. var pi = 3.1415926535; pi.toFixed(2); 
 * Pozor na dělení nulou! 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3
 */
// Solution here

// Funkce která vypíše podíl v procentech
const podil = (x, y) => {
    if ( y === 0){
        return "Nelze dělit nulou!";
    }

    const percentage = ((x / y) * 100).toFixed(2);
    return x + " je " + percentage + "% z " + y;
}

// Vytvoření button pro funkci podíl
const buttonPodil = document.createElement("button");
buttonPodil.innerText = "Podíl";
buttonPodil.setAttribute("id", "task-4");

// Vypsani výsledku do #results
buttonPodil.addEventListener("click", () => {
    const resultText = podil(3, 10);
    const results = document.querySelector("#results");
    results.innerHTML = resultText;
});


tasks.appendChild(buttonPodil);


/**
 * 5) Kdo s koho. Vytvořte funkci, která vezme 2 číselné argumenty a vypíše, který z nich je větší, do předem vytvořeného 
 * místa na strácne. Pokud se čísla rovnají, vypište, že se rovnají. 
 * 
 * Vyzkoušejte funkčnost pro celá čísla, desetinná čísla, zlomky, atd., tj. vytvoříte tlačítko s událostí pro každou
 * kombinaci argumentů a zkuste ji párkrát zavolat kliknutím na toto tlačítko. Tlačítka vytvářejte podle pokynu v 
 * úloze č. 3. Argumenty pro volání funkce zadávejte staticky.
 */
// Solution here

const porovnani = (x, y) => {
    if (x > y) {
        return x + " je větší než " + y;
    } else if (x < y) {
        return x + " je větší než " + y;
    } else {
        return a + " a " + b + "jsou si rovny";
    }
};

// button pro porovnani
const buttonPorovnani= document.createElement("button");
buttonPorovnani.innerText = "Porovnani";
buttonPorovnani.setAttribute("id", "task-5");

// Vypis výsledeku do #results
buttonPorovnani.addEventListener("click", () => {
    const resultText = porovnani(5, 10); 
    const results = document.querySelector("#results");
    results.innerHTML = resultText;
});

tasks.appendChild(buttonPorovnani);

/**
 * 6) I can cleary see the pattern. Vytvořte funkci, která vypíše popořadě všechny násobky 13, které jsou menší 
 * nebo rovno 730, včetě nuly. Používejte for cyklus. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3.
 */
// Solution here

const nasobkyTrinact = () => {
    let result;
    for (let i = 0; i <= 730; i += 13) {
        result += i + " ";
    }
    return result.trim(); // odstraní případnou mezeru na konci
};

// vytvoření tlačítka pro úlohu 6
const buttonNasobkyTrinact = document.createElement("button");
buttonNasobkyTrinact.innerText = "Násobky 13";
buttonNasobkyTrinact.setAttribute("id", "task-6");

// po kliknutí vypiš výsledek do #results
buttonNasobkyTrinact.addEventListener("click", () => {
    const resultText = nasobkyTrinact();
    const results = document.querySelector("#results");
    results.innerHTML = resultText;
});

tasks.appendChild(buttonNasobkyTrinact);

/**
 * 7) Around and about. Vytvořte funkci, která vypočte obsah kružnice podle dodaného poloměru v argumentu. 
 *
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const obsahKruznice = (r) => {
    if (r <= 0 || isNaN(r)) {
        return "Poloměr musí být kladné číslo!";
    }

    const obsah = Math.PI * r * r;
    return "Obsah kružnice s poloměrem " + r + " je " + obsah.toFixed(2);
};


const buttonObsahKruznice = document.createElement("button");
buttonObsahKruznice.innerText = "Obsah kružnice";
buttonObsahKruznice.setAttribute("id", "task-7");


buttonObsahKruznice.addEventListener("click", () => {
    const resultText = obsahKruznice(6); 
    const results = document.querySelector("#results");
    results.innerHTML = resultText;
});

tasks.appendChild(buttonObsahKruznice);

/**
 * 8) Another dimension. Vytvořte funkci, která vypočte objem kuželu, pokud dostanete na argumentech výšku a poloměr. 
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const objemKuzelu = (r, v) => {
    if (r <= 0 || v <= 0 || isNaN(r) || isNaN(v)) {
        return "Poloměr i výška musí být kladná čísla!";
    }

    const objem = (1 / 3) * Math.PI * r * r * v;
    return "Objem kuželu s poloměrem " + r + " a výškou " + v + " je " + objem.toFixed(2);
};


const buttonObjemKuzelu = document.createElement("button");
buttonObjemKuzelu.innerText = "Objem kuželu";
buttonObjemKuzelu.setAttribute("id", "task-8");

buttonObjemKuzelu.addEventListener("click", () => {
    const resultText = objemKuzelu(5, 12);
    const results = document.querySelector("#results");
    results.innerHTML = resultText;
});

tasks.appendChild(buttonObjemKuzelu);

/** 
 * 9) Not sure if triangle, or just some random values. Vytvořte funkci, která rozhodne, zda se z 
 * dodaných 3 délek na argumentu funkce dá postavit trojúhelník, tj. vypíše tyto 3 délky stran a, b, a c
 * a výsledek buď ano/ne, true/yes nebo false/no. Z funkce vraťte hodnotu true/false
 * 
 * Pro testování vytvořte tlačítko s touto funkcí podle pokynu v úloze č. 3. Argumenty pro volání funkce zadávejte 
 * staticky.
 */
// Solution here

const jeTrojuhlenik = (a, b, c) => {
    if (a <= 0 || b <= 0 || c <= 0 || isNaN(a) || isNaN(b) || isNaN(c)) {
        return "Všechny strany musí být kladná čísla!";
    }

    // Podmínka trojúhelníkové nerovnosti
    if (a + b > c && a + c > b && b + c > a) {
        return "lze sestrojit trojuhelnik";
    } else {
        return "nelze sestrojit trojuhlenik";
    }
};

const buttonJeTrojuhlenik = document.createElement("button");
buttonJeTrojuhlenik.innerText = "Je to trojúhelník?";
buttonJeTrojuhlenik.setAttribute("id", "task-9");

buttonJeTrojuhlenik.addEventListener("click", () => {
    const resultText = jeTrojuhlenik(3, 4, 5);
    const results = document.querySelector("#results");
    results.innerHTML = resultText;
});

tasks.appendChild(buttonJeTrojuhlenik);

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


const obsahTrojuhleniku = (a, b, c) => {
    if (a <= 0 || b <= 0 || c <= 0 || isNaN(a) || isNaN(b) || isNaN(c)) {
        return "Všechny strany musí mít kladná čísla";
    }

    if (!lzeSestrojitTrojuhlenik(a, b, c)) {
        return "Nelze vytvořit trojúhelník";
    }

    // Heronův vzorec: s = (a + b + c) / 2, obsah = sqrt[s(s - a)(s - b)(s - c)]
    const s = (a + b + c) / 2;
    const obsah = Math.sqrt(s * (s - a) * (s - b) * (s - c));

    return "Obsaj je " + obsah.toFixed(2);
};

const buttonObsahTrojuhleniku = document.createElement("button");
buttonObsahTrojuhleniku.innerText = "Obsah trojúhelníku";
buttonObsahTrojuhleniku.setAttribute("id", "task-10");

buttonObsahTrojuhleniku.addEventListener("click", () => {
    const resultText = obsahTrojuhleniku(3, 4, 5);
    const results = document.querySelector("#results");
    results.innerHTML = resultText;
});

tasks.appendChild(buttonObsahTrojuhleniku);