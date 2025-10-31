/**
 * Long live Sparta! Vytvořte funkci, která vyřeší Caesarovu širfu. Funkce dostane 
 * na vstup zašifrovaný text a také hodnotu, která byla použita při šifrování, a pak 
 * vrátí dešifrovaný text. Předpokládejte pouze anglickou abecedu s velkými 
 * písmeny, ostatní znaky ignorujte. Poté v konzoli dešifrujte/dešiftujte následující texty.
 * * key used - encrypted text
 * 19 - MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG
 * 5 - YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW
 * 12 - M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ
 * * Následně vytvořte uživatelské rozhraní, ve kterém bude možné zadat zmíněné dvě 
 * vstupní hodnoty (zašifrovaný text a použitý klíč) a po kliknutí na tlačítko 
 * "Decipher!" se na určeném místě zobrazí dešifrovaný text. Rozhraní také vhodně
 * nastylujte.
 */
//            index: 0123456789...
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const shiftChar = (c, shift) => {
  // a helper function to shift one character inside the 
  // alphabet based on the shift value and return the result
  
  // Знаходимо індекс символу в алфавіті
  const index = alphabet.indexOf(c);

  // Якщо символу немає в алфавіті (пробіл, кома, і т.д.),
  // повертаємо його без змін
  if (index === -1) {
    return c;
  }

  // Розраховуємо новий індекс (дешифрування = зсув вліво)
  // Використовуємо % (залишок від ділення) для "закільцьовування" алфавіту
  // (index - shift + alphabet.length) гарантує, що результат завжди буде позитивним
  const newIndex = (index - shift + alphabet.length) % alphabet.length;

  // Повертаємо символ за новим індексом
  return alphabet.charAt(newIndex);
};

const shiftString = (str, shift) => {
  // a helper function to shift one entire string inside the 
  // alphabet based on the shift value and return the result

  // Перетворюємо рядок на масив символів,
  // застосовуємо shiftChar до кожного символу,
  // і з'єднуємо масив назад у рядок
  return str.split('').map(char => shiftChar(char, shift)).join('');
};

const caesarDecipher = (cipherText, usedKey) => {
  // your implementation goes here
  // Просто викликаємо нашу допоміжну функцію
  return shiftString(cipherText, usedKey);
};

// --- Частина 1: Виведення в консоль ---
console.log('--- Caesar Decipher Console Output ---');

// albert einstein
console.log(caesarDecipher("MPH MABGZL TKX BGYBGBMX: MAX NGBOXKLX TGW ANFTG LMNIBWBMR; TGW B'F GHM LNKX TUHNM MAX NGBOXKLX. - TEUXKM XBGLMXBG", 19));

// john archibald wheeler
console.log(caesarDecipher("YMJWJ NX ST QFB JCHJUY YMJ QFB YMFY YMJWJ NX ST QFB. - OTMS FWHMNGFQI BMJJQJW", 5));

// charles darwin
console.log(caesarDecipher("M YMZ ITA PMDQE FA IMEFQ AZQ TAGD AR FUYQ TME ZAF PUEOAHQDQP FTQ HMXGQ AR XURQ. ― OTMDXQE PMDIUZ", 12));

console.log('----------------------------------------');


// --- Частина 2: Логіка для UI ---

// Чекаємо, поки весь HTML-документ завантажиться
document.addEventListener('DOMContentLoaded', () => {

  // Знаходимо елементи на сторінці
  const textInput = document.getElementById('cipher-text');
  const keyInput = document.getElementById('cipher-key');
  const decipherButton = document.getElementById('decipher-btn');
  const resultOutput = document.getElementById('result-text');

  // Додаємо слухача події "click" до кнопки
  decipherButton.addEventListener('click', () => {
    // Отримуємо значення з полів введення
    // .toUpperCase() гарантує, що текст буде у верхньому регістрі
    const cipherText = textInput.value.toUpperCase();
    
    // parseInt перетворює рядок з ключем на число
    const usedKey = parseInt(keyInput.value, 10);

    // Перевірка, чи введено ключ коректно
    if (isNaN(usedKey)) {
      resultOutput.textContent = 'Chyba: Zadejte platný číselný klíč.';
      resultOutput.style.color = 'red';
      return; // Зупиняємо виконання функції
    }

    // Якщо все гаразд, скидаємо стиль помилки
    resultOutput.style.color = '#333';

    // Викликаємо нашу головну функцію
    const decryptedText = caesarDecipher(cipherText, usedKey);

    // Відображаємо результат у призначеному місці
    resultOutput.textContent = decryptedText;
  });

});