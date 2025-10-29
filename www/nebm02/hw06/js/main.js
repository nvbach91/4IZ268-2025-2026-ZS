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
    // a helper function to shift one character inside the 
    // alphabet based on the shift value and return the result
    let newChar = '';
    if (alphabet.indexOf(c) === -1) {
        newChar = c;
    } else {
        // console.log("Alphabet lenght:" + alphabet.length);
        currChar = c;
        // console.log("Current char:" + currChar);
        currIndex = alphabet.indexOf(c);
        // console.log("Current index:" + currIndex);
        shiftBack = currIndex - shift;
        // console.log("Shift back:" + shiftBack);
        if (shiftBack < 0) {
            newIndex = alphabet.length - Math.abs(shiftBack);
        } else {
            newIndex = currIndex - shift;
        }
        // console.log("New index:" + newIndex);
        newChar = alphabet.charAt(newIndex);
        // console.log("New char:" + newChar); 
        // console.log("-----"); 
    }
    return newChar;
};

const shiftString = (str, shift) => {
    // a helper function to shift one entire string inside the 
    // alphabet based on the shift value and return the result
    let shifted = "";
    for (let i = 0; i < str.length; i++) {
        shifted += shiftChar(str.charAt(i), shift);
    }
    return shifted;
};

const caesarDecipher = (cipherText, usedKey) => {
    // your implementation goes here
    // good to know: 
    //    str.indexOf(c) - get the index of the specified character in the string
    //    str.charAt(i) - get the character at the specified index in the string
    //    String.fromCharCode(x) - get the character based on ASCII value
    //    when the shifted character is out of bound, it goes back to the beginning and count on from there

    return shiftString(cipherText, usedKey);
};

// albert einstein
console.log(caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19));

// john archibald wheeler
console.log(caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5));

// charles darwin
console.log(caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12));


const decypherForm = document.querySelector('#decipher-form');



decypherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(decypherForm);
    const data = Object.fromEntries(formData);
    console.log(data);
    const result = caesarDecipher(data.cipheredText, parseInt(data.shiftAmount));
    const resultDiv = document.querySelector('#result');
    resultDiv.textContent = result;
});