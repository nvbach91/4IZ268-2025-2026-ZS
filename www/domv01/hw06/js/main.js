const $ = (s) => document.querySelector(s);

const plain = $("#plain-text");
const shiftE = $("#shift-value-encrypt");
const btnE = $("#cipher-button");
const outE = $("#output-area-encrypt");

const cipherIn = $("#cipher-text");
const shiftD = $("#shift-value");
const btnD = $("#decipher-button");
const outD = $("#output-area");

/* 
console.log("A".charCodeAt(0));
console.log("Z".charCodeAt(0));
65-90
*/

const caesar = (text, key, encode = true) => {
  const k = (((parseInt(key, 10) || 0) % 26) + 26) % 26;
  return text
    .split("")
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(
          ((code - 65 + (encode ? k : -k) + 26) % 26) + 65
        );
      }
      return ch;
    })
    .join("");
};

btnE.addEventListener("click", () => {
  outE.value = caesar(plain.value || "", shiftE.value);
});

btnD.addEventListener("click", () => {
  outD.value = caesar(cipherIn.value || "", shiftD.value, false);
});
