/**
 * Long live Sparta! Vytvořte funkci, která vyřeší Caesarovu širfu. Funkce dostane 
 * na vstup zašifrovaný text a také hodnotu, která byla použita při šifrování, a pak 
 * vrátí dešifrovaný text. Předpokládejte pouze anglickou abecedu s velkými 
 * písmeny, ostatní znaky ignorujte. Poté v konzoli dešifrujte/dešiftujte následující texty.
 * 
 * key used - encrypted text
 *       19 - MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG
 *        5 - YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW
 *       12 - M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ
 * 
 * Následně vytvořte uživatelské rozhraní, ve kterém bude možné zadat zmíněné dvě 
 * vstupní hodnoty (zašifrovaný text a použitý klíč) a po kliknutí na tlačítko 
 * "Decipher!" se na určeném místě zobrazí dešifrovaný text. Rozhraní také vhodně
 * nastylujte.
 */
//         index: 0123456789...
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//posun pismene o shift:
const shiftChar = (c, shift) => {
    const i = alphabet.indexOf(c)      
    if (i === -1) return c 
    const newIndex = ((i - shift) % 26 + 26) % 26
    return alphabet.charAt(newIndex)

    // a helper function to shift one character inside the 
    // alphabet based on the shift value and return the result
};
//posun cele message
const shiftString = (str, shift) => {
  const up = String(str).toUpperCase() // 1 prevedeme vse na velka pismena
  let result = ''                      // 2 budeme si sem postupne ukladat vysledek

  // 3 projdeme kazdy znak
  for (let ch of up) {
    result += shiftChar(ch, shift)     // 4 posuneme kazdy znak a pridame do vysledku
  }

  return result                        // 5 vratime hotovy text
}

const caesarDecipher = (cipherText, usedKey) => {
  return shiftString(cipherText, usedKey)
}

document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('cipherText');
  const keyInput = document.getElementById('key');
  const btn = document.getElementById('decipherBtn');
  const out = document.getElementById('output');

  btn.addEventListener('click', () => {
    const k = parseInt(keyInput.value, 10) || 0;
    const result = caesarDecipher(ta.value, k);
    out.textContent = result;
  });
});




// albert einstein
caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19);

// john archibald wheeler
caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5);

// charles darwin
caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12);