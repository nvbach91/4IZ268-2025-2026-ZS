const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const shiftChar = (c, shift) => {
    const index = alphabet.indexOf(c);

    if (index === -1) {
        return c;
    }

    let newIndex = (index + shift) % 26;
    if (newIndex < 0) {
        newIndex += 26;
    }

    return alphabet.charAt(newIndex);
};

const shiftString = (str, shift) => {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        result += shiftChar(str[i], shift);
    }
    return result;
};

const caesarDecipher = (cipherText, usedKey) => {
    const shift = -usedKey;
    return shiftString(cipherText, shift);
};

console.log('--- Dešifrované texty ---');

const text1 = "MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG";
console.log(`Klíč 19: ${caesarDecipher(text1, 19)}`);

const text2 = "YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW";
console.log(`Klíč 5: ${caesarDecipher(text2, 5)}`);

const text3 = "M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ";
console.log(`Klíč 12: ${caesarDecipher(text3, 12)}`);

console.log('---------------------------');

document.addEventListener('DOMContentLoaded', () => {

    const textInput = document.getElementById('text-input');
    const keyInput = document.getElementById('key-input');
    const decipherBtn = document.getElementById('decipher-btn');
    const resultOutput = document.getElementById('result-output');

    const handleDecipher = () => {
        const text = textInput.value.toUpperCase();
        const key = parseInt(keyInput.value, 10);

        if (!text) {
            resultOutput.textContent = 'Chyba: Zadejte prosím text k dešifrování.';
            return;
        }
        if (isNaN(key)) {
            resultOutput.textContent = 'Chyba: Zadejte prosím platný číselný klíč.';
            return;
        }

        const decryptedText = caesarDecipher(text, key);
        resultOutput.textContent = decryptedText;
    };

    decipherBtn.addEventListener('click', handleDecipher);
});