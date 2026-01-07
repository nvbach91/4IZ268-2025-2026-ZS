# 4IZ268-2024-2025-ZS
A repository for laboratories of subject 4IZ268, Fall Semester 2024-2025
# Quiz – učení testových otázek (Vue 3)

Jednoduchá kvízová webová aplikace vytvořená ve **Vue 3** s využitím **Pinia** pro správu stavu.  
Aplikace slouží k procvičování testových otázek z různých tematických okruhů (Linux, SQL, Docker, …) a ukládá uživatelův postup do `localStorage`.

Projekt vznikl jako **semestrální práce**.

---

## ✨ Funkce aplikace

- výběr tematického okruhu (sady otázek)
- načítání otázek z externího API (quizapi.io)
- cache otázek (stejné otázky se zobrazují, dokud uživatel nenačte nové)
- režimy:
  - **Všechny otázky**
  - **Pouze chybně zodpovězené otázky**
- přehledná mapa otázek (navigace mezi otázkami)
- vyhodnocení odpovědi (správně / špatně)
- **statistiky úspěšnosti** (počet správných odpovědí, procenta)
- ukládání postupu do `localStorage`
- možnost:
  - vymazat **pouze statistiky a správnost**
  - vymazat **všechna data aplikace**
- loading stav + chybové hlášky
- responzivní design

---

## 🛠 Použité technologie

- **Vue 3** (Composition API)
- **Pinia** – správa globálního stavu
- **Vite** – build a dev server
- **QuizAPI.io** – zdroj testových otázek
- **localStorage** – ukládání postupu uživatele
- čisté **HTML / CSS / JavaScript**

---

## ▶️ Spuštění projektu lokálně

### 1️⃣ Instalace závislostí
```bash
npm install
