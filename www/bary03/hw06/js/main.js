const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const shiftChar = (c, shift) => {
  const index = alphabet.indexOf(c);
  if (index === -1) return c;
  let newIndex = (index - shift) % 26;
  if (newIndex < 0) newIndex += 26;
  return alphabet.charAt(newIndex);
};

const shiftString = (str, shift) => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const c = str.charAt(i).toUpperCase();
    result += shiftChar(c, shift);
  }
  return result;
};

const caesarDecipher = (cipherText, usedKey) => {
  const result = shiftString(cipherText, usedKey);
  console.log(result);
  return result;
};

caesarDecipher(
  "MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG",
  19
);

caesarDecipher(
  "YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW",
  5
);

caesarDecipher(
  "M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ",
  12
);

const button = document.querySelector('#decipher-btn');
const inputText = document.querySelector('#cipher-input');
const inputKey = document.querySelector('#key-input');
const output = document.querySelector('#output');

button.addEventListener('click', () => {
  const text = inputText.value;
  const key = parseInt(inputKey.value);
  if (!text || isNaN(key)) {
    output.innerText = 'Please enter valid text and key';
    return;
  }
  const result = caesarDecipher(text, key);
  output.innerText = result;
});
