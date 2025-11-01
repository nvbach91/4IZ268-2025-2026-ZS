const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// posune jeden znak o zadaný klíč
const shiftChar = (c, shift) => {
  const index = alphabet.indexOf(c);
  if (index === -1) return c; // ignoruje ne-písmena
  let newIndex = (index - shift) % 26;
  if (newIndex < 0) newIndex += 26;
  return alphabet[newIndex];
};

// posune celý řetězec
const shiftString = (str, shift) => {
  let result = '';
  for (let char of str) {
    result += shiftChar(char, shift);
  }
  return result;
};

// hlavní dešifrovací funkce
const caesarDecipher = (cipherText, usedKey) => {
  const text = cipherText.toUpperCase();
  return shiftString(text, usedKey);
};

// konzolový test
console.log(caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19));
console.log(caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5));
console.log(caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12));

// propojení s HTML
document.getElementById('decipherBtn').addEventListener('click', () => {
  const cipher = document.getElementById('cipherText').value;
  const key = parseInt(document.getElementById('keyInput').value);
  const result = caesarDecipher(cipher, key);
  document.getElementById('result').innerText = result;
});
