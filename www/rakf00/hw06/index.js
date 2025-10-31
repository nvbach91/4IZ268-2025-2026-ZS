/**
 * Long live Sparta! Vytvořte funkci, která vyřeší Caesarovu širfu. Funkce dostane
 * na vstup zašifrovaný text a také hodnotu, která byla použita při šifrování, a pak
 * vrátí dešifrovaný text. Předpokládejte pouze anglickou abecedu s velkými
 * písmeny, ostatní znaky ignorujte. Poté v konzoli dešifrujte/dešiftujte následující texty.
 * * key used - encrypted text
 * 19 - MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG
 * 5 - YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW
 * 12 - M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ
 * * Následně vytvořte uživatelské rozhraní, ve kterém bude možné zadat zmíněné dvě
 * vstupní hodnoty (zašifrovaný text a použitý klíč) a po kliknutí na tlačítko
 * "Decipher!" se na určeném místě zobrazí dešifrovaný text. Rozhraní také vhodně
 * nastylujte.
 */
//        index: 0123456789...
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const shiftChar = (c, shift) => {
    let originalIndex = alphabet.indexOf(c);
    if (originalIndex === -1) {
        return c;
    }

    let newIndex = (originalIndex - shift + 26) % 26;

    return alphabet.charAt(newIndex);
};

const caesarDecipher = (cipherText, usedKey) => {
    let result = '';
    for (let i = 0; i < cipherText.length; i++) {
        let char = cipherText[i];
        if (alphabet.includes(char)) {
            result += shiftChar(char, usedKey);
        } else {
            result += char;
        }
    }
    return result;
};

// --- výstup do konzole ---

console.log("--- VÝSLEDKY DEŠIFROVÁNÍ V KONZOLI ---");

let text1 = "MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG";
let key1 = 19;
let decrypted1 = caesarDecipher(text1, key1);
console.log(`Text 1 (Klíč ${key1}): ${decrypted1}`);

let text2 = "YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW";
let key2 = 5;
let decrypted2 = caesarDecipher(text2, key2);
console.log(`Text 2 (Klíč ${key2}): ${decrypted2}`);

let text3 = "M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ";
let key3 = 12;
let decrypted3 = caesarDecipher(text3, key3);
console.log(`Text 3 (Klíč ${key3}): ${decrypted3}`);

console.log("-------------  KONEC  -----------------");


const handleDecipher = () => {
    const cipherText = document.getElementById('encryptedText').value;
    const keyInput = document.getElementById('decipherKey').value;
    const outputElement = document.getElementById('decryptedOutput');

    const key = parseInt(keyInput);

    if (isNaN(key) || key < 0 || key > 25) {
        outputElement.innerHTML = "<strong>CHYBA:</strong> Klíč musí být celé číslo mezi 0 a 25.";
        return;
    }

    const upperCaseText = cipherText.toUpperCase();
    const decryptedText = caesarDecipher(upperCaseText, key);

    outputElement.innerHTML = `<strong>Dešifrovaný text:</strong><br>${decryptedText}`;
};

const decipherButton = document.getElementById('decipherButton');

decipherButton.addEventListener('click', handleDecipher);