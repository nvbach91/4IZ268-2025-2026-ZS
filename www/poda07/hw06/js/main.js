const shiftChar = (c, shift) => {
  const A = 'A'.charCodeAt(0);
  const Z = 'Z'.charCodeAt(0);
  const code = c.charCodeAt(0);
  if (code >= A && code <= Z) {
    const norm = ((shift % 26) + 26) % 26;
    const idx = code - A;
    const dec = (idx - norm + 26) % 26;
    return String.fromCharCode(A + dec);
  }
  return c;
};

const caesarDecipher = (text, key) => {
  let result = '';
  for (const ch of text) result += shiftChar(ch, key);
  return result;
};

document.addEventListener('DOMContentLoaded', () => {
  const cipherEl = document.getElementById('cipher');
  const keyEl = document.getElementById('key');
  const outEl = document.getElementById('output');
  const decipherBtn = document.getElementById('decipherBtn');

  decipherBtn.addEventListener('click', () => {
    const text = cipherEl.value || '';
    const key = Number(keyEl.value) || 0;
    outEl.textContent = caesarDecipher(text, key);
  });
});
