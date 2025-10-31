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
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const shiftChar = (c, shift) => {
    const i = alphabet.indexOf(c);
    if (i === -1) return c;
    const n = (i + ((shift % 26) + 26)) % 26;
    return alphabet.charAt(n);
};

const shiftString = (str, shift) => {
    let res = '';
    for (let i = 0; i < str.length; i++) {
        res += shiftChar(str.charAt(i), shift);
    }
    return res;
};

const caesarDecipher = (cipherText, usedKey) => {
    const text = String(cipherText).toUpperCase();
    const shift = (-usedKey) % 26;
    const result = shiftString(text, shift);
    console.log(result);
    return result;
};  

// albert einstein
caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19);

// john archibald wheeler
caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5);

// charles darwin
caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12);

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('cipherText');
    const keyInput = document.getElementById('key');
    const btn = document.getElementById('decipherBtn');
    const out = document.getElementById('output');
    if (!input || !keyInput || !btn || !out) return;
    btn.addEventListener('click', () => {
        const text = input.value || '';
        const key = parseInt(keyInput.value, 10) || 0;
        out.textContent = caesarDecipher(text, key);
    });
});
