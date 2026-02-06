Task Manager – semestrální práce (JavaScript)

Autor: [Erik Bargel]
Předmět: Webové technologie
Rok: [2026]

Popis aplikace
---------------
Aplikace slouží jako jednoduchý task manager pro správu úkolů.
Uživatel může přidávat, upravovat a mazat úkoly, označovat je jako hotové
a filtrovat je podle stavu, kategorie a priority.

Součástí aplikace je také přehled statistik a zobrazení počasí
pro outdoor úkoly.

Použité technologie
-------------------
- HTML5, CSS3
- JavaScript (ES6+)
- jQuery
- Chart.js
- Fetch API (AJAX)

Funkcionalita
-------------
- načtení výchozích úkolů z externího REST API (DummyJSON)
- ukládání uživatelských dat do localStorage
- přidávání, úprava a mazání úkolů
- filtrování úkolů (stav, kategorie, priorita, hledání)
- přepínání dark / light režimu
- zobrazení statistik úkolů pomocí grafu
- načítání aktuálního počasí a denní předpovědi z Open-Meteo API
  (používá se u outdoor úkolů)
- aplikace funguje bez reloadu stránky

Struktura projektu
------------------
/index.html        – hlavní HTML soubor
/css/style.css     – styly aplikace
/js/app.js         – hlavní logika aplikace a práce s DOM
/js/api.js         – komunikace s externími API
/js/storage.js    – práce s localStorage

Spuštění aplikace
-----------------
Aplikace je čistě klientská a nevyžaduje žádný backend.
Stačí otevřít soubor index.html v moderním webovém prohlížeči
(Chrome, Firefox, Edge).



