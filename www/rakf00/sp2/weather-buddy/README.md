🌤️ WeatherBuddy

Single Page Aplikace, jejíž hlavní funkcí je generování personalizovaných doporučení k oblékání pomocí umělé
inteligence. Rada je generována na základě aktuálních dat o počasí a individuálního profilu uživatele (věk, výška, váha,
otužilost), který je trvale uložen v lokálním úložišti.

💻 Architektura a Technologie

Základ: ReactJS a Tailwind CSS pro moderní UI.

Asynchronní Logika: Využití trojitého asynchronního řetězce API (Open-Meteo pro Geokódování a data o počasí + OpenAI pro
generování rady).

Stav a Validace: Správa stavu probíhá přes Zustand; formulář profilu je validován pomocí React Hook Form (RHF).

Dále jsou použity tyto knihovny: Axios, Zustand, Lucide Icons.

Webové Zvyklosti: Dodržení principu SPA.
