# project reviews

daoq00
- [ ] zvyraznit aktivni polozku menu
- [ ] slozky by mely byt klikatelne v celem radku mimo cerveneho krizku
- [ ] pridavani polozek do slozky by melo fungovat jako rozbalovaci menu select, nikoliv jako free text input, posledni vybrany seznam by take mel byt zachovan jako default vybrana moznost
- [ ] po uspesnem nebo neuspesnem pridani polozky do seznamu by se melo zobrazit potvrzeni
- [ ] add-review-box by, add-folder-group mely byt formulare + submit event
- [ ] tlacitko "nacist dalsi" by take melo zobrazit spinner
- [ ] oznacit/rozlisit filmy ktere uz byly pridane do seznamu
- [ ] ukladat cas do review pomoci formatu ISO, a zobrazit datum/cas pomoci citelneho formatu
- [ ] pridat proklik z filmu, ve kterych hral herec, na detaily filmu
- [ ] pridat strankovani do seznamu
- [ ] detaily filmu zobrazit take pri kliknuti na obrazek a nazev filmu
- [ ] generovat validni HTML
- [ ] opravit youtube iframe
- [ ] sjednotit syntaxe pro stringy
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane

vajd00
- [ ] novejsi transakce v tabulce zobrazovat nahore
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- [ ] nemodifikovat DOM v cyklu
- [ ] stahovat exchange data pouze takova, ktera jsou pro danou chvili potreba, tj. ne pro obe cizi meny najednou
- [ ] seznam cizich men musi byt dynamicky a kod musi jit snadno prizpusobit (na jednom miste) pro pripad prace s vice menami
- [ ] neprekreslovat cely seznam transakci pri odstraneni jedne transakce
- [ ] nepouzivat funkce alert, confirm, prompt, misto nich pouzit plugin nebo knihovnu, ktere jsou k tomu urcene
- [ ] aplikace neni implementovana pro ucely dlouhodobeho pouzivani, ale je vhodna spise pro ucely analyticke, proto by bylo dobre kdyby se dalo data naimportovat a vyexportovat, napr. ve formatu CSV

semk
- [ ] neumoznit pridavat knihy duplicitne
- [ ] pridat moznost vyhledavani knih na api podle klicovych slov nazvu, vyber a pridavani vybranych vysledku vyhledavani do katalogu
- [ ] pridat pocet knich v jednotlivych kategoriich do tlacitek filter-btn
- [ ] pro zmenu statusu pouzit rozbalovaci menu select+option
- [ ] nepouzivat funkce alert, confirm, prompt, misto nich pouzit plugin nebo knihovnu, ktere jsou k tomu urcene
- [ ] neumoznit editaci vlastnosti knih, ktere pochazi z api
- [ ] zobrazit vice informaci o knize v detailu knihy formou modaloveho okna
- [ ] neprekreslovat cely seznam knih pri odstraneni jedne knihy
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- [ ] pridat debounce to filteru knih
- [ ] nepouzivat inline CSS

svov17
- [ ] obsah stranky nesmi pretekat viewport
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- [ ] pridat moznost zobrazeni historie vysledku hrani, aniz by se muselo hrat
- [ ] ukladat timestamp do vysledku a zobrazit i cas hrani
- [ ] pridat moznost konfigurace hry, pocet otazek, pocet moznosti odpovedi, pocet obrazku v kazde otazce
- [ ] pridat strankovani vysledku, moznost vymazat vysledky
- [ ] formatovat kod
- [ ] string interpolation

vacm17
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- [ ] neumoznit pridani stejne konfigurace dvakrat do porovnani
- [ ] prepipani motivu by melo fungovat na prvni kliknuti
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni
- [ ] umoznit editace jiz pridanych konfiguraci
- [ ] pridat debounce do autocomplete a search
- [ ] zachovat posledni stav aplikace tak aby se po znovunacteni aplikace tam zustalo i porovnani
- [ ] zobrazit vice autocomplete polozek



haro03
- [ ] nepouzivat funkce alert, confirm, prompt, misto nich pouzit plugin nebo knihovnu, ktere jsou k tomu urcene
- [ ] pokud uzivatel ze hry odejte neukoncit probihajici hru a pridat moznost pokracovani v probihajici hre
- [ ] zapamatovat si posledni konfiguraci hry
- [ ] ukladat i datum/cas u recent attempts, ukladat nove attempty na konec pole, zobrazit novejsi attempts nahore
- [ ] nepouzivat inline CSS
- [ ] nemodifikovat DOM v cyklu
- [ ] osetrit nespravne hodnoty parametru pro API (nevolat zbytecne)


bobv02
- [ ] sekce home, search, favourites, details, teamby nemaji byt samostatne HTML stranky, ale dynamicky vykresovany pomoci javascriptu v ramci jedne stranky, tj. single page aplikace
- [ ] nepouzivat funkce alert, confirm, prompt, misto nich pouzit plugin nebo knihovnu, ktere jsou k tomu urcene
- [ ] pridat strankovani nebo donacteni dalsich vysledku
- [ ] zobrazit pocet pridanych filmu
- [ ] proc nektere filmu nejdou pridat do Fav, napr. "Harry Potter and the Philosopher's Stone"
- [ ] oznacit/rozlisit filmy ktere uz byly pridane do seznamu
- [ ] filtry pouzit jako URL param
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni
- [ ] v detailu zobrazit navic info o kolekci, produkcnich firmach
- [ ] pridat filtr podle zanru v sekci favourites
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- [ ] nemodifikovat DOM v cyklu
- [ ] nepouzivat inline CSS
- [ ] nepouzivat inline JS


kohj08
- [ ] misto timestamp v ISO stringu zobrazit lokalni cas
- [ ] pridat moznost zobrazeni teplot v jinych metrickych systemech
- [ ] pridat popis weather condition
- [ ] omezit pocet vracenych polozek podle aktualne zobrazene mapy
- [ ] debounce na route types nebo confirm/submit
- [ ] nepsat javascript do HTML `<script>`
- [ ] nemodifikovat DOM v cyklu
- [ ] nevystavovat funkce a promenne do globalniho scope


hroj19
- [ ] ve favourites ukladat vcetne URL obrazku a nazvu aby se nemuselo volat na API, ale az pri zobrazeni jejich detailu
- [ ] v detailu drinku zobrazit navic i tagy
- [ ] v detailu drinku pridat tlacitko "add to favourites"
- [ ] vhodne pouzit /small /medium /large pro zobrazovani obrazku
- [ ] odstraneni favourite drinku by melo pozadovat uzivatelske potvrzeni, nebo drink nemazat hned a tim umoznit jeho opetovne pridani (do stejneho poradi ve kterem byl)
- [ ] pridat moznost serazeni drinku podle nazvu
- [ ] pridat moznost filtrovani favorite drinku pouze v ramci prohlizece (bez API)
- [ ] pridat moznost strankovani drinku v sekci favourites
- [ ] zobrazit pocet nalezenych vysledku vyhledavani
- [ ] zobrazit pocet drinku ve favourites
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- [ ] sjednotit syntaxe pro string
- [ ] nepouzivat inline CSS


zumt02
- [ ] postupne zobrazovani informaci, tj. nejprve prehled nalezenych vysledku v radcich s malymi obrazky + nejake potrebne ovladaci prvky, pote veci jako popis a velky obrazek, rating, episodes zobrazit az v detailu (modalove okno), ta to logika bude platit i pro sekce to watch a seen
- [ ] zobrazit pocet anime na tlacitkach jednotlivych sekci
- [ ] do localstorage ukladat navic informace pro zobrazeni v prehledu to watch a seen, aby se nemuselo volat na API, tohle udelat az pri zobrazeni detailu filmu


petj30
- [ ] default city zjistit pomoci geolokace API, pokud geolokace se nepovede zjistit, nezobrazovat nic dokud uzivatel nespecifikuje jeho lokaci
- [ ] uzivatelem specifikovane mesto pro zobrazovani pocasi by melo byt zapamatovano
- [ ] formatovat datum podle lokalniho zvyku
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni
- [ ] doimplementovat tlacitko edit
- [ ] termin ukolu by mel byt povinny
- [ ] pokud ukol ma termin, zobrazit take strucne pocasi
- [ ] pridat strankovani ukolu
- [ ] dodelat filtrovani podle kategorie a casoveho intervalu od-do podle terminu
- [ ] pridat moznost spravy kategorii
- [ ] zobrazit pocet ukolu v jednotlivych kategoriich
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- [ ] nemodifikovat DOM v cyklu






30.01.2026

kybo00
- [ ] nepouzivat funkce alert, confirm, prompt, misto nich pouzit plugin nebo knihovnu, ktere jsou k tomu urcene
- [ ] v rámci aplikace nikdy nerefreshovat stránku, napr pro novou hru nepouzivat `window.location.reload` ...
- [ ] rozlozeni prvku by melo byt tak, aby se nemuselo scrollovat
- [ ] ukladat herni pokusy do localStorage + strankovat
- [ ] nestahovat celou databazi slov pro kontrolu ze nove slovo tam uz existuje
- [ ] v pripade obdrzeni slova, ktere jiz byla zahrana, client nyni zopakuje dotaz na /random endpoint a deduplikuje, dokud nedostane slovo, ktere jeste nebylo - toto neni spravny pristup, jelikoz by to plytvalo requestem, a to zejmena v okamziku kdyz skoro vsechna slova byla zahrana to muze skoncit v nekonecnem cyklu. Pokud server neuklada client session, nabizi se reseni opravit serverovou logiku pro predavani slov na zaklade deterministickeho RNG podle pozadavku od klienta, tj. klient bude posilat zpusob randomizace a server vypocita nahodnou pozici slov, ktere pak posle klientovi.
- [ ] game-board HTML vygenerujte pomoci JS, nikoliv manualne v HTML
- [ ] sjednotit syntaxe pro psani stringu
- [ ] kazde keyboard tlacitko by melo mit atribut data-key, podle ktereho se pak rozhoduje, jake pismeno se ma zadat nebo akce se ma provest


ryga02
- [ ] zobrazit pocet favorites - dat primo do tlacitka Favorites
- [ ] zobrazit pocet nalezenych vysledku vyhledavani
- [ ] zobrazit jazykova tlacitka a zobrazit instruction ve vybranem jazyce
- [ ] nevolat na lookup pri zobrazovani seznamu oblibenych, ale az pri zobrazeni detailu, tj. ukladat nazev a kategory do localstorage k tomu ID
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- nepouzivat inline CSS


poda07
- [ ] ukoly by mely mit deadline a byt serazene podle deadline
- [ ] zobrazit pocty ukolu dle jednotlivych stavu a kategorii
- [ ] pridat strankovani ukolu, napr. max 10 ukolu na jedne strance
- [ ] formular pro editaci/vytvareni ukolu zobrazujte v modalovem okne
- [ ] pridat moznost editace stavajiciho ukolu
- [ ] pridat moznost spravy kategorii
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni
- [ ] jedine volani na API na zacatku programu je nedostacujici, pouzivejte vice moznosti ktere jsou poskytovane API


nebm02
- [ ] zobrazit nazvy her v seznamu her
- [ ] zobrazit pocet her v library
- [ ] nemichat dva jazyky v UI
- [ ] spocitat pocet stranek pro strankovani a umoznit prechod mezi strankami kliknutim na cislo stranky
- [ ] pridat filtr podle status, seradit podle rating, completion date, pro sekci library
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- [ ] nemichat document.querySelector a jQuery

subd02
- [ ] zobrazit navic i stat vedle mesta
- [ ] zobrazit navic i timezone
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni
- [ ] oddelit datasety temperature a precipitation do dvou grafu (do dvou zalozek)
- [ ] zbysit pocet vysledku autocomplete na 50
- [ ] deaktivovat seznam oblibenych mest behem asynchroniho nacitani dat a omezit aby nebylo mozne volat 2 paralelni pozadaky na server
- [ ] pridat moznost seradit seznam oblibenych mest podle nazvu
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- [ ] nemodifikovat DOM v cyklu

chem12
- [ ] zachovat seznam nalezenych vysledku po kliknuti na tlacitko zpet
- [ ] pokud hra nema web, nezobrazovat zadny odkaz
- [ ] zobrazit vice informaci o hre
- [ ] pridat moznost filtrace podle zanru, platformy, tagy - ziskat seznam dostupnych filtracnich hodnot a vyhledat podle vybranych nepovinnych kriterii
- [ ] stejny filtr
- [ ] zvysit pocet vysledku
- [ ] pridat moznost pridani hry do backlogu primo z seznamu vysledku vyhledavani
- [ ] pridat uzivatelska data k jiz pridanym polozkam v backlogu - hodnoceni, poznamky pomoci formulare v kazde hre
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane

souo09
- [ ] automaticky ziskat pocasi, kdyz se otevre detail cesty
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni
- [ ] pole Destination by melo naseptavat oficialni misto pro vyhledavani pocasi, aby se zamezilo pripady neexistujicich mist, pouzijte napr API https://geocoding-api.open-meteo.com
- [ ] pridat moznost zobrazeni cest historickych/nadchazejicich/vsech

pelk00
- [ ] nepouzivat timestamp jako id zanamu
- [ ] pridat moznost zobrazit existujici udalosti z jinych datumu nez jenom dnesni datum
- [ ] zobrazit datum tasku v todo listu
- [ ] predpsat promise kod do async/await

jelk10
- [ ] nevolat na lookup API pri zobrazovani seznamu oblibenych, ale az pri zobrazeni detailu, tj. ukladat potrebna data do localstorage
- [ ] neprekreslovat cely seznam filmu pri odstraneni jednoho ve favorites
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni
- [ ] chybi loading spinner
- [ ] nevolat znova na API pro discover dokud nedojedete vsechny vysledky z prvniho volani, dalsi volani by melo obsahovat strankovani i+1
- [ ] neopakovat kod pro axios config objekt, kde to ma byt stejny
- [ ] nepouzivat string concatenation
- [ ] nepouzivat `<b>`

pild03
- [ ] nepouzivat funkce alert, confirm, prompt, misto nich pouzit plugin nebo knihovnu, ktere jsou k tomu urcene
- [ ] zobrazit vice informaci v detailu pokrmu
- [ ] pokrmy neukladat do cache, stahujte data znovu pomoci jejich id
- [ ] nemodifikovat DOM v cyklu
- [ ] elementy, ktere od zacatku existuji na strance, se nesmi vybirat opakovane
- [ ] nepouzivat inline CSS


pank10
- [ ] nepouzivat funkce alert, confirm, prompt, misto nich pouzit plugin nebo knihovnu, ktere jsou k tomu urcene
- [ ] chybí indikátor asynchroního načítání dat
- [ ] přidejte možnost odstranění elementů
- [ ] přidejte resizing canvas elementů
- [ ] povolte tzv. canvas panning (hýbání se celým canvasem), popř. zoom in/out
- [ ] funkce clear page by měla odstranit i data
- [ ] přidejte možnost vytváření, ukládání a správy více stránek
- [ ] nemichat document.querySelector/document.getElementById a jQuery select
- [ ] elementy se nesmi vybirat opakovane, ale jen jednou
- [ ] používat string interpolation
- [ ] nemodifikovat DOM v cyklu
- [ ] pro ajax používejte async/await, nikoliv callback style ani promise
- [ ] pro vyhledávání používejte formulář `<form>` a submit event

puzo00
- [ ] pro vyhledávání používejte formulář `<form>` a submit event
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni, obzvlast kdyz jejich obnoveni by vyzadovalo uzivatelske usili nebo cas
- [ ] umoznit pridavani stejne destinace do vice seznamu
- [ ] v sekci moje vylety pridat moznost filtrace destinaci podle seznamu, vcetne bez seznamu (multiselect)
- [ ] odstraneni destinaci v sekci moje seznamy by nemelo seznam zavrit
- [ ] pridat moznost zobrazovani znacek na mape podle vybraneho seznamu
- [ ] pridat moznost nastaveni barev pro seznamy a vybarvit znacky na mape podle barvy jejich seznamu
- [ ] pri zadavani znacek primo na mape se musi zobrazit indikator nacitani dat
- [ ] vyhledavani by melo fungovat jako zive naseptavani pomoci tzv. debounce bez klikani na tlacitko hledat
- [ ] presunout formular "pridat vylet" do sekce "mapa"
- [ ] zobrazit pocet destinaci, pocet seznamu
- [ ] sjednotit datovy typ pro lat a lng
- [ ] nepouzivat timestamp jako id, ale funkci pro vytvareni id
- [ ] HTML elementy, ktere nejsou videt, by nemely byt vykreslovane v DOM (sections)
- [ ] používat string interpolation
- [ ] nepouzivat inline CSS
- [ ] elementy se nesmi vybirat opakovane, ale jen jednou
- [ ] nemodifikovat DOM v cyklu


bare19
- [ ] nepouzivat funkce alert, confirm, prompt, misto nich pouzit plugin nebo knihovnu, ktere jsou k tomu urcene
- [ ] pridat tlacitko obnovit pocasi
- [ ] data o pocasi by se mela nacist podle polohy uzivatele
- [ ] aplikovane filtry pro ukoly by mely spoustet API pozadavky a nactou se data ze serveru, a nikoliv filtrovat lokalne v prohlizeci
- [ ] editace a mazani ukolu by melo take posilat pozadavky na API
- [ ] pridejte strankovani ukolu
- [ ] naimplementujte opozdene spusteni vyhledavaciho inputu - debounce
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni, obzvlast kdyz jejich obnoveni by vyzadovalo uzivatelske usili nebo cas
- [ ] HTML elementy, ktere nejsou videt, by nemely byt vykreslovane v DOM (sekce)
- [ ] pro skladani URL pouzivejte metodu .join() od array, nebo konstruktor URL params, nebo fetch params
- [ ] elementy se nesmi vybirat opakovane, ale jen jednou


braa13
- [ ] filtrace typu media by mela probehnout na serverove strane, nikoliv clienta
- [ ] pridejte moznost strankovani vysledku vyhledavani + zobrazit pocet nalezenych vysledku 
- [ ] interaktivita neboli zachyceni uzivatelskych udalosti dynamicky vygenerovanych elementu se ma resit uz ve chvili vytvareni elementu, nikoliv az po vlozeni na stranku
- [ ] nektere ulozene filmy se nedaji nacist z duvodu chybnych dat na serveru (hawaiian eye), z toho duvodu je vhodne umistit tlacitko odstraneni primo v seznamu favorites
- [ ] tlacitko add/remove favorite rozdelte do dvou tlacitek, ktera se zobrazuji podle stavu filmu
- [ ] do seznamu favories ukladejte i URL k obrazku pro jejich zobrazeni v seznamu favorites
- [ ] pridejte nekolik vhodnych filtru pro vyhledavani filmu
- [ ] zobrazujte vice uzitecnych informaci o filmu v detailu
- [ ] pridejte moznost pridavani vlastnich poznamek k ulozenym filmum
- [ ] elementy se nesmi vybirat opakovane, ale jen jednou
- [ ] nepouzivat inline javascript


malj23
- [ ] sekce home, seznam prani nemaji byt samostatne HTML stranky, ale dynamicky vykresovany pomoci javascriptu v ramci jedne stranky, tj. jako single page aplikace
- [ ] nefunguje access token, proto nelze testovat funkcnost aplikace

<img width="1203" height="720" alt="Image" src="https://github.com/user-attachments/assets/12f31ef1-a3ae-4fb8-b5cd-a9ef5ade0c38" />

- [ ] elementy se nesmi vybirat opakovane, ale jen jednou
- [ ] pro html atributy pouzivejte uvozovky - "
- [ ] pro skladani URL pouzivejte metodu .join() od array, nebo konstruktor URL params, nebo fetch params



bukv02
- [ ] sekce home a results nemaji byt samostatne HTML stranky, ale dynamicky vykresovany pomoci javascriptu v ramci jedne stranky, tj. jako single page aplikace vysledky vyhledavani zobrazujte pod vyhledavanim. - [ ] nepresmerovat uzivatele na jinou stranku, mel by zustat celou dobu na jedne strance
- [ ] nepouzivat funkce alert, confirm, prompt, misto nich pouzit plugin nebo knihovnu, ktere jsou k tomu urcene
- [ ] receipty zobrazujte v mrizce, 3 recepty vedle sebe,
- [ ] detaily receptu zobrazujte v iframe v ramci stranky aplikace
- [ ] zobrazit pocet polozek v shopping list a pocet polozek v favorites primo na danych tlacitkach
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni, obzvlast kdyz jejich obnoveni by vyzadovalo uzivatelske usili nebo cas
- [ ] zobrazit obrazky ingredienci a mnozstvi ingredienci
- [ ] v shopping list zobrazit mnozstvi ingredienci
- [ ] NEPOUZIVAT INLINE JAVASCRIPT
- [ ] pro vyhledavani pouzivejte formular `<form>` a udalost submit
- [ ] nemelo by se znecistit globalni namespace window
- [ ] elementy se nesmi vybirat opakovane, ale jen jednou
- [ ] nemodifikovat DOM v cyklu
- [ ] pro tisk nepouzivejte pop-up window, ale CSS media print

beze03
- [ ] mozna nezobrazovat muj seznam vedle vyhledavani, ale v samostatne sekci
- [ ] zobrazit pocet anime v jednotlivych stavech vse, sleduji, dokonceno, chci videt
- [ ] osetrit numericky input "epizody"
- [ ] opravit youtube video iframe
- [ ] doimplementovat strankovani pro sekci "vysledky vyhledavani"
- [ ] doimplementovat strankovani pro sekci "muj seznam"
- [ ] pridat moznost serazeni anime podle abecedy, score nebo manualne
- [ ] pridat moznost filtrovani anime v seznamu podle zanru
- [ ] nemodifikovat DOM v cyklu
- [ ] nepouzivat inline CSS


bart24
- [ ] pridejte moznost filtrovani zapasu podle nazvu tymu
- [ ] barevne nebo pomoci filtru odlisit jiz vytipovane zapasy od nevytipovanych zapasu
- [ ] historii tipu zobrazit do tabulky + u kazdeho tipu zobrazit cas, kdy uzivatel dal tip
- [ ] pro historii tipu je dobre mit filtr pro ligu
- [ ] proc nejsou videt vsechny zapasy ze stazenych dat (kde jsou zapasy v season 2022)
- [ ] elementy se nesmi vybirat opakovane, ale jen jednou
- [ ] pro rychlejsi vyhledavani podle id je vhodnejsi zapasy ukladat do objektu kde klicem bude id zapasu
- [ ] pridat moznost reset dat a zacit odznova


mats08
- [ ] pridat moznost zobrazeni detailu filmu v modalovem okne
- [ ] po pridani do oblibenych deaktivovat tlacitko pridat, nebo misto nej zobrazit tlacitko odebrat
- [ ] oblibene filmy zobrazit v samostatne sekci, nikoliv pod vysledky vyhledavani
- [ ] pridat moznost specifikace kriterii pro vyhledavani (zanry, rok vydani, 
- [ ] pridat moznost strankovani vysledku
- [ ] pridat moznost strankovani oblibenych filmu
- [ ] zobrazit pocet nalezenych vysledku
- [ ] zobrazit pocet oblibenych filmu
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni, obzvlast kdyz jejich obnoveni by vyzadovalo uzivatelske usili nebo cas
- [ ] po odstraneni filmu neprekreslovat cely seznam oblibenych
- [ ] kod nepsat v cestine, ale v anglictine - nazvy promennych, nazvy funkci, ...
- [ ] nepouzivat funkce alert, confirm, prompt, misto nich pouzit plugin nebo knihovnu, ktere jsou k tomu urcene
- [ ] elementy se nesmi vybirat opakovane, ale jen jednou
- [ ] nepouzivat inline javascript
- [ ] pro rychlejsi praci s localStorage (hledani a mazani filmu) pouzivejte datovou strukturu mapa, resp. objekt, kde klicem bude id filmu
- [ ] nemodifikovat DOM v cyklu


mase02
- [ ] odstraneni polozek by melo pozadovat uzivatelske potvrzeni, obzvlast kdyz jejich obnoveni by vyzadovalo uzivatelske usili nebo cas
- [ ] zobrazti detaily interpretu z my findings
- [ ] zobrazit vice informaci u skladeb - delka, odkaz na spotify
- [ ] zobrazit vsechny similar artists ve strankovani, nebo scrollovat
- [ ] elementy se nesmi vybirat opakovane, ale jen jednou
- [ ] nemodifikovat DOM v cyklu
- [ ] omezit mnozstvi dat v localstorage
- [ ] nevytvaret globalni promenne a funkce