const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Pomocná funkce, která posune jeden znak.
 * @param {string} c - Znak k posunutí
 * @param {number} shift - Hodnota klíče (posunu)
 * @returns {string} Posunutý znak
 */
const shiftChar = (c, shift) => {
    const index = alphabet.indexOf(c);

    if (index === -1) {
        return c;
    }

    const newIndex = ((index - shift) % 26 + 26) % 26;

    return alphabet.charAt(newIndex);
};

/**
 * Pomocná funkce, která posune celý řetězec.
 * @param {string} str - Řetězec k posunutí
 * @param {number} shift - Hodnota klíče (posunu)
 * @returns {string} Posunutý řetězec
 */
const shiftString = (str, shift) => {
    let result = '';

    for (let i = 0; i < str.length; i++) {
        result += shiftChar(str.charAt(i), shift);
    }
    return result;
};

/**
 * Hlavní funkce pro dešifrování Caesarovy šifry.
 * @param {string} cipherText - Zašifrovaný text
 * @param {number} usedKey - Použitý klíč
 * @returns {string} Dešifrovaný text
 */
const caesarDecipher = (cipherText, usedKey) => {
    return shiftString(cipherText, usedKey);
};

console.log("--- Dešifrované texty ---");
// Albert Einstein
const msg1 = caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19);
console.log(msg1);
// Očekávaný výstup: TWO THINGS ARE INFINITE: THE UNIVERSE AND HUMAN STUPIDITY; AND I'M NOT SURE ABOUT THE UNIVERSE. - ALBERT EINSTEIN

// John Archibald Wheeler
const msg2 = caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5);
console.log(msg2);
// Očekávaný výstup: THERE IS NO LAW EXCEPT THE LAW THAT THERE IS NO LAW. - JOHN ARCHIBALD WHEELER

// Charles Darwin
const msg3 = caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12);
console.log(msg3);
// Očekávaný výstup: A MAN WHO DARES TO WASTE ONE HOUR OF TIME HAS NOT DISCOVERED THE VALUE OF LIFE. ― CHARLES DARWIN

document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('cipher-text');
    const keyInput = document.getElementById('shift-key');
    const decipherButton = document.getElementById('decipher-btn');
    const resultOutput = document.getElementById('result-text');

    const handleDecipher = () => {
        const text = textInput.value;
        const key = parseInt(keyInput.value, 10);

        if (!text) {
            resultOutput.textContent = 'Prosím, zadejte text k dešifrování.';
            return;
        }
        if (isNaN(key) || key < 0) {
            resultOutput.textContent = 'Prosím, zadejte platný klíč (kladné číslo).';
            return;
        }

        const decryptedText = caesarDecipher(text.toUpperCase(), key);

        resultOutput.textContent = decryptedText;
    };

    decipherButton.addEventListener('click', handleDecipher);

    handleDecipher();
});