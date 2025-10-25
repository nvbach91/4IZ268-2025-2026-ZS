const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function shiftChar(c, shift) {
    let idx = alphabet.indexOf(c);
    if (idx === -1) return c; // 
    let newIdx = (idx - shift + 26) % 26; 
    return alphabet.charAt(newIdx);
}

function shiftString(str, shift) {
    return str.split('').map(c => shiftChar(c.toUpperCase(), shift)).join('');
}

function caesarDecipher(cipherText, usedKey) {
    return shiftString(cipherText, usedKey);
}

function decipherText() {
    const cipherText = document.getElementById('cipherText').value;
    const key = parseInt(document.getElementById('key').value);
    if (isNaN(key)) {
        alert("Zadejte platný číselný klíč!");
        return;
    }
    const result = caesarDecipher(cipherText, key);
    document.getElementById('output').textContent = result;
}


console.log(caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19));
console.log(caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5));
console.log(caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12));
