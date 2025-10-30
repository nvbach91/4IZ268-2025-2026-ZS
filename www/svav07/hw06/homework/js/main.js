/**
 * Long live Sparta! Caesar Cipher Implementation
 * This application can both encode and decode messages using the Caesar cipher.
 */

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const shiftChar = (c, shift) => {
    const upperChar = c.toUpperCase();
    const index = alphabet.indexOf(upperChar);
    
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
        result += shiftChar(str.charAt(i), shift);
    }
    return result;
};

const caesarDecipher = (cipherText, usedKey) => {
    return shiftString(cipherText, -usedKey);
};

const caesarCipher = (plainText, key) => {
    return shiftString(plainText, key);
};

console.log("=== Testing Caesar Decipher ===");
console.log("Albert Einstein:");
console.log(caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19));

console.log("\nJohn Archibald Wheeler:");
console.log(caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5));

console.log("\nCharles Darwin:");
console.log(caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12));

document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const keyInput = document.getElementById('keyInput');
    const resultOutput = document.getElementById('result');
    const decipherBtn = document.getElementById('decipherBtn');

    decipherBtn.addEventListener('click', () => {
        const text = textInput.value;
        const key = parseInt(keyInput.value) || 1;
        
        if (text.trim() === '') {
            resultOutput.textContent = 'Please enter some text to decipher!';
            return;
        }
        
        const deciphered = caesarDecipher(text, key);
        resultOutput.textContent = deciphered;
    });

    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            decipherBtn.click();
        }
    });

    keyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            decipherBtn.click();
        }
    });

    keyInput.addEventListener('input', () => {
        let value = parseInt(keyInput.value);
        if (value < 1) {
            keyInput.value = 25;
        } else if (value > 25) {
            keyInput.value = 1;
        }
    });

    keyInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' && parseInt(keyInput.value) === 1) {
            e.preventDefault();
            keyInput.value = 25;
        } else if (e.key === 'ArrowUp' && parseInt(keyInput.value) === 25) {
            e.preventDefault();
            keyInput.value = 1;
        }
    });
});