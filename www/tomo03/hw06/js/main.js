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

const shiftChar = (c, shift = 0) => {
    if (!alphabet.includes(c)) {
        return c
    } else {
        const index = alphabet.indexOf(c)
        return alphabet[(index + shift + alphabet.length) % alphabet.length]
    }
};


const shiftString = (str, shift) => {
    // a helper function to shift one entire string inside the 
    // alphabet based on the shift value and return the result
    return [...str].map(c => shiftChar(c, shift)).join('')
};

const caesarDecipher = (cipherText, usedKey) => {
    const decipheredText = shiftString(cipherText.toUpperCase(), -usedKey)
    return decipheredText
};

// albert einstein
caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19);

// john archibald wheeler
caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5);

// charles darwin
caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12);


const form = document.getElementById("decipher")
const interactionWindow = document.getElementById('interaction-window')
const inputContent = document.getElementById('input-content')
const btn = document.getElementById('btn')

form.addEventListener('submit', (e) => {
    e.preventDefault()

    if (!inputContent.classList.contains('back')) {
        const data = new FormData(form)
        const cipher = data.get('cipher')
        const key = parseInt(data.get('key'), 10)

        inputContent.classList.add('back')

        const output = document.createElement('p')
        output.id = 'output'
        output.textContent = caesarDecipher(cipher, key)
        interactionWindow.appendChild(output)

        btn.textContent = 'Get back'
    } else {
        const output = document.getElementById('output')
        output && output.remove()
        inputContent.classList.remove('back')
        btn.textContent = 'Decipher me'
        form.reset()
    }
})

