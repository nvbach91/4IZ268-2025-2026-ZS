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
    // shift a single uppercase character within A-Z by shift (can be negative)
    const index = alphabet.indexOf(c);
    if (index === -1) return c;
    const normalized = ((index + shift) % 26 + 26) % 26;
    return alphabet.charAt(normalized);
};
const shiftString = (str, shift) => {
    // shift an entire string; only uppercase letters are shifted, others preserved
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const ch = str.charAt(i);
        result += shiftChar(ch, shift);
    }
    return result;
};
const caesarDecipher = (cipherText, usedKey) => {
    // decrypt by shifting backwards by usedKey; assume cipherText uses uppercase A-Z
    const shift = -Number(usedKey || 0);
    const plain = shiftString(cipherText, shift);
    console.log(plain);
    return plain;
};

// albert einstein
caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19);

// john archibald wheeler
caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5);

// charles darwin
caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12);

// UI wiring
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('decipher-form');
    if (!form) return;
    const inputText = document.getElementById('cipher-input');
    const inputKey = document.getElementById('key-input');
    const output = document.getElementById('output');
    const btn = document.getElementById('decipher-btn');

    const runDecipher = () => {
        const text = (inputText && inputText.value) || '';
        const key = parseInt((inputKey && inputKey.value) || '0', 10) || 0;
        const result = caesarDecipher(text, key);
        if (output) output.textContent = result;
    };

    if (btn) btn.addEventListener('click', (e) => {
        e.preventDefault();
        runDecipher();
    });
});