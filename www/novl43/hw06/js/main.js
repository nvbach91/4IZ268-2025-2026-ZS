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
const textInput = document.getElementById('input-text');
const numberInput = document.getElementById('input-number');
const processButton = document.getElementById('process-button');
const resultParagraph = document.getElementById('result');

processButton.addEventListener('click', () => {
    const cipherText = textInput.value;
    const usedKey = parseInt(numberInput.value, 10);
    const decipheredText = caesarDecipher(cipherText, usedKey);
    resultParagraph.textContent = decipheredText;
});


const shiftChar = (c, shift) => {
    // a helper function to shift one character inside the 
    // alphabet based on the shift value and return the result
    const index = alphabet.indexOf(c);
    shift = -shift % alphabet.length; // reverse the shift for deciphering
    if (index === -1) {
        return c; // return the character as is if it's not in the alphabet
    }
    const shiftedIndex = (index + shift + alphabet.length) % alphabet.length;



    return alphabet.charAt(shiftedIndex);
    
};
const shiftString = (str, shift) => {
    // a helper function to shift one entire string inside the 
    // alphabet based on the shift value and return the result
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += shiftChar(str.charAt(i), shift);
    }
    return result;
};
const caesarDecipher = (cipherText, usedKey) => {
    // your implementation goes here
    // good to know: 
    //    str.indexOf(c) - get the index of the specified character in the string
    //    str.charAt(i) - get the character at the specified index in the string
    //    String.fromCharCode(x) - get the character based on ASCII value
    //    when the shifted character is out of bound, it goes back to the beginning and count on from there


    // let decipheredText = '';
    // cipherText = cipherText.toUpperCase();
    // console.log(cipherText);



    // cipherText.split("").forEach(char => {
    //     console.log(char);
    //     console.log(alphabet.indexOf(char));
    //     console.log(usedKey); 
    //     console.log(alphabet.length);
    //     console.log(alphabet.indexOf(char) + usedKey % alphabet.length);

    //     char = alphabet[(alphabet.indexOf(char) + usedKey) % alphabet.length];
    //     console.log(char);
    //     decipheredText += char;
    // });




return shiftString(cipherText, usedKey); // return the deciphered text
};

// albert einstein
// console.log(caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19)
// );

// // john archibald wheeler
// console.log(caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5)
// );
// caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5);

// // charles darwin
// console.log(caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12));
// caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12);

function copyResult() {
  // Get the text field
  var copyText = resultParagraph.innerText;


  navigator.clipboard.writeText(copyText);

  // Alert the copied text
  alert("Copied the text: " + copyText);
}