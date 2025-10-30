/**
 * Long live Sparta! Vytvořte funkci, která vyřeší Caesarovu širfu. Funkce dostane
 * na vstup zašifrovaný text a také hodnotu, která byla použita při šifrování, a pak
 * vrátí dešifrovaný text. Předpokládejte pouze anglickou abecedu s velkými
 * písmeny, ostatní znaky ignorujte. Poté v konzoli dešifrujte/dešiftujte následující texty.
 *
 * key used - encrypted text
 *       19 - MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG
 *        5 - YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW
 *       12 - M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ
 *
 * Následně vytvořte uživatelské rozhraní, ve kterém bude možné zadat zmíněné dvě
 * vstupní hodnoty (zašifrovaný text a použitý klíč) a po kliknutí na tlačítko
 * "Decipher!" se na určeném místě zobrazí dešifrovaný text. Rozhraní také vhodně
 * nastylujte.
 */

//deklarace divu pro umisteni elementu
const decipherUi = document.getElementById('decipher');

//deklarace divu pro vysledek
const result = document.getElementById('result');

//vytvoreni textoveho pole pro vstup textu sifry
const inputField = document.createElement('textarea');
inputField.type = 'text';
inputField.setAttribute('class', 'cipher-input');
inputField.setAttribute('id', 'cipher-input');
decipherUi.appendChild(inputField);

//vytvoreni pole pro vstup klice
const keyField = document.createElement('input');
keyField.type = 'number';
keyField.setAttribute('class', 'key-input');
keyField.setAttribute('id', 'key-input');
decipherUi.appendChild(keyField);


//vytvoreni tlacitka na desifrovani
const button = document.createElement('button');
button.setAttribute('id', "solveButton");
button.setAttribute('class', "decipher-button");
button.textContent = 'Decipher';
button.addEventListener("click", () => {
    result.innerText = caesarDecipher(inputField.value, keyField.value);
});
decipherUi.appendChild(button);


//         index: 0123456789...
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Metoda slouzi k zasifrovani znaku pomoci posunu o dany pocet cisel
 * @param c znak k shiftnuti
 * @param shift pocet mist o ktere ma byt znak shiftnut v abecede
 * @returns {*|string} znak posunuty o dany pocet mist
 */
const shiftChar = (c, shift) => {
    const index = alphabet.indexOf(c);
    if (index === -1) {
        return c; //pokud neni znak pismeno, vrati nezmeneny znak
    }
    let newIndex = (index - shift) % 26;
    if (newIndex < 0) {
        newIndex += 26; //osetreni zapornych indexu
    }
    return alphabet.charAt(newIndex);
};
/**
 * Metoda slouzi k desifrovani stringu pomoci posouvani znaku o dane mnozstvi v abecede, udane parametrem shift
 * @param str vstupni retezec
 * @param shift pocet mist o kolik je kazdy znak posunuty
 * @returns {string} desifrovany retezec
 */
const shiftString = (str, shift) => {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += shiftChar(str.charAt(i), shift);
    }
    return result;
};

const caesarDecipher = (cipherText, usedKey) => {
    cipherText = cipherText.toUpperCase();
    const result = shiftString(cipherText, usedKey);
    console.log(result);
    return result;
};

// albert einstein
caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19);

// john archibald wheeler
caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5);

// charles darwin
caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12);
