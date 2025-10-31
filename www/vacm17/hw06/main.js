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

// a helper function to shift one character inside the
// alphabet based on the shift value and return the result
const shiftChar = (c, shift) => {
    // Vrátí pozici písmena v abecedě
    let shiftInt = parseInt(shift);
    let originalPosition = 0;
    let originalChar;
    let char = c[0]; // Convert to a char

    while (char !== alphabet[originalPosition] && originalPosition < alphabet.length) {
        originalPosition++;
        // console.log(`DBG: Position: ${originalPosition}, Char: ${char}, Alphabet char: ${alphabet[originalPosition]}`)
    }
    if (originalPosition === alphabet.length) {
        // Pokud není char nalezen v abecedě, zanechá jej v původním stavu
        console.log(`ERR: shiftChar: Char ${char} not found! Char ${char} has been returned.`)
        return char;
    } else {
        // Pokud by došlo k záporné pozici, bude od pozice odečtena délka abecedy
        const newPosition = (originalPosition - shiftInt + alphabet.length) % alphabet.length;
        console.log(`DBG: shiftChar: Position adjustment: newPosition: ${newPosition}`);
        console.log(`DBG: shiftChar: Result: ${alphabet[newPosition]}`);
        return alphabet[newPosition];
    }
};

// a helper function to shift one entire string inside the
// alphabet based on the shift value and return the result
const shiftString = (str, shift) => {

};
// your implementation goes here
// good to know:
//    str.indexOf(c) - get the index of the specified character in the string
//    str.charAt(i) - get the character at the specified index in the string
//    String.fromCharCode(x) - get the character based on ASCII value
//    when the shifted character is out of bound, it goes back to the beginning and count on from there
const caesarDecipher = (cipherText, usedKey) => {
    const usedKeyInt = parseInt(usedKey);
    let decipheredText = "";

    for (let i = 0; i < cipherText.length; i++) {
        let char = shiftChar(cipherText[i], usedKey);
        decipheredText += char;
        console.log(`DBG: caesarDecipher: Char ${char} deciphered. Current text: ${decipheredText}`);
    }
    return decipheredText;
};

const button = document.querySelector("#button-submit");

button.addEventListener("click", () => {
    const inputNumber = document.querySelector("#input-number").value;
    const inputString = document.querySelector("#input-string").value;
    const output = document.querySelector("#output");
    output.textContent = caesarDecipher(inputString, inputNumber);
});

// albert einstein
// caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM
// LNKX TUHNM MAX NGBOXKLX.- TEUXKM XBGLMXBG", 19);

// john archibald wheeler
// caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5);

// charles darwin
// caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12);
