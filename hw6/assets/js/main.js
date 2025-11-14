const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function caesarDecipher(text, key) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (alphabet.includes(c)) {
      let idx = alphabet.indexOf(c);
      let decIdx = (idx - key + 26) % 26;
      result += alphabet[decIdx];
    } else {
      result += c;
    }
  }
  return result;
}

document.getElementById('decipher-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const cipherText = document.getElementById('ciphertext').value.toUpperCase();
  const key = parseInt(document.getElementById('key').value, 10);
  document.getElementById('output').innerText = caesarDecipher(cipherText, key);
});
