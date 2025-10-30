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
//         index: 0123456789...

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const shiftChar = (c, shift) => {
    const upper = c.toUpperCase();
    const index = alphabet.indexOf(upper);
    if (index === -1) return c;
    const newIndex = (index + shift + alphabet.length) % alphabet.length;
    return alphabet[newIndex];
};


const shiftString = (str, shift) => {
    let result = [];

    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        const shifted = shiftChar(c, shift);
        result.push(shifted);
    }

    return result.join("");
};

const caesarDecipher = (cipherText, usedKey) => {
    const result = shiftString(cipherText, -usedKey);
    return result;
};
const form = document.querySelector("#cipher-form");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const cipher = formData.get("Cipher");
    const key = parseInt(formData.get("index"), 10);
    const decryptedText = caesarDecipher(cipher, key);
    const resultContainer = document.querySelector(".result");
    resultContainer.innerText = decryptedText;
});