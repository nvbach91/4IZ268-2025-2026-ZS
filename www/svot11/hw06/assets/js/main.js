
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
    const originalIndex = alphabet.indexOf(c);
    let newIndex = originalIndex + shift;

    

    if (newIndex >= alphabet.length)
    {
        newIndex = newIndex - alphabet.length;
       
        return alphabet[newIndex];
    }

    
    return alphabet[newIndex];



};

shiftChar('Z',1);

const shiftString = (str, shift) => {
    // a helper function to shift one entire string inside the 
    // alphabet based on the shift value and return the result

    let result = ''
    
    for(const char of str)
    {   
        if (char === ' ') {
            result += ' ';
            continue;
        }

        if (!alphabet.includes(char)) {
            result += char;
            continue;
        }

        const newChar = shiftChar(char, shift);
        result += newChar;
    }

    return result;
};

const result = shiftString('XYZ', 2);
console.log(result);

const caesarDecipher = (cipherText, usedKey) => {
    // your implementation goes here
    // good to know: 
    //    str.indexOf(c) - get the index of the specified character in the string
    //    str.charAt(i) - get the character at the specified index in the string
    //    String.fromCharCode(x) - get the character based on ASCII value
    //    when the shifted character is out of bound, it goes back to the beginning and count on from there


    const shift = alphabet.length - usedKey;
    const decipheredText = shiftString(cipherText, shift);
    console.log(decipheredText);
    return decipheredText;
};

// albert einstein
caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19);

// john archibald wheeler
caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5);

// charles darwin
caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12);


const formHTML = `
<form class="cipher-form">
            <div class="form-row">
                <label>Ciphertext</label>
                <textarea name="ciphertext" placeholder="Enter ciphertext" rows="4"></textarea>
            </div>
            <div class="form-row">
                <label>Key</label>
                <input type="number" name="key" placeholder="Enter key">
            </div>

            <button id="decipherButton">Decipher!</button>
            <h2>Your deciphered text will appear below</h2>
            <i class="fa-solid fa-angle-down""></i>


</form>
`;

const appcontainer = document.querySelector('#app');
appcontainer.innerHTML = formHTML;


const decipherButton = document.querySelector('#decipherButton');
decipherButton.addEventListener('click', function (event) {
    event.preventDefault();
    const formData = new FormData(document.querySelector('.cipher-form'));
    const ciphertext = formData.get('ciphertext');
    const key = parseInt(formData.get('key'), 10);
    const decryptedText = caesarDecipher(ciphertext, key);

    const arrayOfAuthorsCiphers = ["MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", "YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", "M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ"];
   
   if (ciphertext === arrayOfAuthorsCiphers[0] && key === 19) {
         document.body.style.backgroundImage = 
         "linear-gradient(rgba(255, 255, 255, 0.5))," +
         "url('https://123sonography.com/sites/default/files/styles/article_image/public/article/images/01%20Einstein%20shutterstock_1834432471.jpg?itok=hr52wK97')";
    } else if (ciphertext === arrayOfAuthorsCiphers[1] && key === 5) {
        document.body.style.backgroundImage = 
        "linear-gradient(rgba(255, 255, 255, 0.5))," +
        "url('https://upload.wikimedia.org/wikipedia/commons/8/82/John_Archibald_Wheeler_lecturing.jpg')";
    } else if (ciphertext === arrayOfAuthorsCiphers[2] && key === 12) {
        document.body.style.backgroundImage = 
        "linear-gradient(rgba(255, 255, 255, 0.5))," +
        "url('https://cdn.thecollector.com/wp-content/uploads/2023/08/charles-darwin-life-works-facts.jpg')";
    }

    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    
    const resultcontainer = document.createElement('div');
    resultcontainer.innerHTML = `${decryptedText}`;
    resultcontainer.setAttribute('class', 'result-container');
    appcontainer.append(resultcontainer);
});





    



