const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const shiftChar = (c, shift) => {
  const index = alphabet.indexOf(c);
  if (index === -1) return c; 
  const newIndex = (index - shift + 26) % 26;
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
  const decrypted = shiftString(cipherText.toUpperCase(), usedKey);
  console.log(`Key ${usedKey} → ${decrypted}`);
  return decrypted;
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


document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById("decipherBtn");
  const output = document.getElementById("result");
  const inputText = document.getElementById("cipher");
  const inputKey = document.getElementById("key");

  btn.addEventListener("click", () => {
    const text = inputText.value.trim();
    const key = parseInt(inputKey.value);

    if (!text || isNaN(key)) {
      output.textContent = "Please enter both text and key!";
      return;
    }

    const decrypted = caesarDecipher(text, key);
    output.textContent = decrypted;
  });
});
