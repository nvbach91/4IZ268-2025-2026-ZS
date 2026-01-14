const App = {
    currentRound: 0, //int
    score: 0, //int
    countriesData: null, //dictionary/object Afghanistan: {flags: {…}, name: {…}, cca3: "AFG", region: "Asia", subregion: "Southern Asia", …}
    allowedCountries: [], // list ["Slovakia", "Czechia"] (lengrth calculated based on rounds)
    allowedCountriesAmount: 4, //int
    gameRounds: 6, //int
    gameCountries: [], //list ["Slovakia", "Czechia"] (equal to rounds)
    currentCountry: null, //string "Slovakia"
    lives: 0, //int
    dom: {},

    async swapView(oldViewId, newViewId) {
        //swaps between views using anime.js
        const oldView = document.getElementById(oldViewId);
        const newView = document.getElementById(newViewId);
        const body = document.body;

        // Rotate gradient bg on viewswap
        anime.animate("body", {
            "--bg-angle": ["90deg", "-90deg"],
            duration: 500,
            easing: "easeInOutQuad",
            complete: () => {
                document.body.style.setProperty("--bg-angle", "90deg");
            },
        });

        // history
        history.pushState({ view: newViewId }, "", `#${newViewId}`);

        //animation itself
        body.classList.add("animation-ui-lock");

        await anime.animate(`#${oldViewId}`, {
            opacity: [1, 0],
            duration: 500,
            easing: "easeInOutQuad",
        });

        oldView.classList.add("hidden-view");
        oldView.classList.remove("active-view");


        newView.classList.remove("hidden-view");
        newView.classList.add("active-view");
        body.classList.remove("animation-ui-lock");

        await anime.animate(`#${newViewId}`, {
            opacity: [0, 1],
            duration: 500,
            filter: ["blur(2px)", "blur(0px)"],
            easing: "easeInOutQuad",
        });
    },

    // returns current active view
    getCurrentView() {
        const active = document.querySelector(".active-view");
        return active.id
    },

    swipeAnimation(elementId, direction, amount) {
        // swipe animation for passport card
        const directions = {
            left: {
                x: [-amount, 0],
                y: [20, 0],
                rotate: [-15, 0],
                opacity: [0, 1],
            },
            right: {
                x: [amount, 0],
                y: [20, 0],
                rotate: [15, 0],
                opacity: [0, 1],
            },
            up: {
                x: [0, 0],
                y: [amount, 0],
                rotate: [0, 0],
                opacity: [0, 1],
            },
            down: {
                x: [0, 0],
                y: [-amount, 0],
                rotate: [0, 0],
                opacity: [0, 1],
            },
        };
        const animation = directions[direction];

        anime.animate(`#${elementId}`, {
            translateX: animation.x,
            translateY: animation.y,
            rotate: animation.rotate,
            opacity: animation.opacity,
            duration: 450,
            filter: ["blur(5px)", "blur(0px)"],
            easing: "easeOutExpo"
        });
    },

    async fetchAllCountries() {
        // main api request/data loading from localStorage
        // before API request check for cached data in localStorage
        const cachedData = localStorage.getItem("countriesData");
        if (cachedData) {
            console.log("Using countriesData from localStorage:", JSON.parse(cachedData));
            return JSON.parse(cachedData);
        }

        // which fields to request from the API based on the API docs
        const requiredFields =
            "name,area,region,subregion,population,borders,cca3,flags,latlng,landlocked";

        // create the request API URL
        const API_URL = `https://restcountries.com/v3.1/all?fields=${requiredFields}`;

        try {
            console.log(`Trying API request: ${API_URL}`);
            const response = await axios.get(API_URL);

            if (response.status === 200) {
                console.log(
                    "API request OK:", response
                );
                const countries = response.data;
                const countriesDict = {};
                // dictionary where key = name
                countries.forEach((country) => {
                    const name = country.name.common;
                    countriesDict[name] = country;
                });
                console.log("Countries dictionary created:", countriesDict);

                // Save to localStorage
                localStorage.setItem("countriesData", JSON.stringify(countriesDict));

                return countriesDict;
                // later used as countriesData in initializeGame()
            } else {
                console.error(
                    `API request error: ${response.status}`
                );
                return null;
            }
        } catch (error) {
            // API error catch
            console.error(
                "API request error:",
                error.message
            );
            return null;
        }
    },

    generateAllowedCountries(countriesData, allowedCountriesAmount) {
        // randomly select x countries from all countries
        const countryNames = Object.keys(countriesData);
        // set to avoid duplicates
        const allowedCountries = new Set();

        while (allowedCountries.size < allowedCountriesAmount) {
            // RNG with max value being total country amount
            const randomIndex = Math.floor(Math.random() * countryNames.length);
            allowedCountries.add(countryNames[randomIndex]);
        }

        return Array.from(allowedCountries);
    },

    generateGameCountries(countriesData, gameRounds, allowedCountries) {
        // Alloed countries cannot be more than half of game rounds(all countries)
        const minAllowed = Math.floor(gameRounds / 2);

        // randomize allowed countries and select first minAllowed
        const shuffledAllowed = [...allowedCountries].sort(
            () => 0.5 - Math.random()
        );
        const selectedAllowed = shuffledAllowed.slice(0, minAllowed);

        // Prepare remaining countries (excluding already chosen)
        const allNames = Object.keys(countriesData);

        // creates new array without the selected allowed countries
        const remainingCountries = [];
        for (const name of allNames) {
            if (!selectedAllowed.includes(name)) {
                remainingCountries.push(name);
            }
        }

        // randomly select remaining countries to fill game rounds
        const neededCountriesAmount = gameRounds - selectedAllowed.length;
        const shuffledRest = remainingCountries.sort(() => 0.5 - Math.random());
        const selectedRest = shuffledRest.slice(0, neededCountriesAmount);

        // combine allowed with the rest, shuffled them and return the array
        const allCountries = [...selectedAllowed, ...selectedRest].sort(
            () => 0.5 - Math.random()
        );

        console.log("Generated game countries:", allCountries);
        console.log("Allowed countries:", selectedAllowed);
        return allCountries;
    },

    async initializeGame() {
        this.countriesData = await this.fetchAllCountries();

        if (this.countriesData) {
            console.log(
                `Loaded ${Object.keys(this.countriesData).length
                } countries.`
            );

            // generates a list of countries for the game
            this.allowedCountries = this.generateAllowedCountries(
                this.countriesData,
                this.allowedCountriesAmount
            );
            this.gameCountries = this.generateGameCountries(
                this.countriesData,
                this.gameRounds,
                this.allowedCountries
            );

            const allowedListElement = document.getElementById("allowed-countries");
            // remove the placeholder content
            allowedListElement.innerHTML = "";
            // generates the allowed countries
            this.allowedCountries.forEach((country) => {
                const countryElement = document.createElement("div");
                countryElement.classList.add(
                    "d-flex",
                    "flex-row",
                    "align-items-center",
                    "mx-2",
                    "border",
                    "p-2",
                    "rounded",
                    "justify-content-between",
                    "bg-white"
                );
                const img = document.createElement("img");
                const countryItem = document.createElement("p");

                // countiry name
                countryItem.classList.add("m-0", "me-2");
                countryItem.innerHTML = this.countriesData[country].name.common;

                //countiry flag
                img.src = this.countriesData[country].flags.svg;
                img.style.width = "30%";
                img.style.height = "auto";
                img.style.objectFit = "cover";

                //add the elements to DOM
                countryElement.appendChild(countryItem);
                countryElement.appendChild(img);
                allowedListElement.appendChild(countryElement);
            });

        } else {
            console.error("countriesData is missing.");
        }
    },

    flashBackground(action) {
        // adds responsivness to user actiopns
        const flashClass = `flash-${action}`;
        document.body.classList.add(flashClass);

        setTimeout(() => {
            document.body.classList.remove(flashClass);
        }, 500);
    },

    async allowDenyPassport(action) {
        // main game logic
        if (action) {
            // user allowed and country is in allowed list
            if (this.allowedCountries.includes(this.currentCountry)) {
                this.flashBackground("success");

                this.score += 1;
                this.dom.score.innerText = `SCORE: ${this.score}`;
                this.currentRound += 1;
                await this.startNewRound(this.gameCountries, this.allowedCountries);
            } else {
                // user allowed but country is not in allowed list
                this.flashBackground("damage");

                this.lives -= 1;
                this.dom.lives.innerText = `LIVES: ${this.lives}`;
                this.currentRound += 1;
                await this.startNewRound(this.gameCountries, this.allowedCountries);
            }
        } else if (!action) {
            // user denied and country is not in allowed list
            if (this.allowedCountries.includes(this.currentCountry)) {
                this.flashBackground("damage");

                this.lives -= 1;
                this.dom.lives.innerText = `LIVES: ${this.lives}`;
                this.currentRound += 1;
                await this.startNewRound(this.gameCountries, this.allowedCountries);
            } else {
                // user denied but country is in allowed list
                this.flashBackground("success");

                this.score += 1;
                this.dom.score.innerText = `SCORE: ${this.score}`;
                this.currentRound += 1;
                await this.startNewRound(this.gameCountries, this.allowedCountries);
            }
        }
    },

    async startNewRound() {
        if (this.currentRound > 0) {
            this.swipeAnimation("passport-content", "left", 750);
        };
        
        // check for game over conditions (lives = 0 or rounds limit)
        if (
            (this.currentRound != 0 && this.currentRound >= this.gameRounds) ||
            this.lives == 0
        ) {
            //update highscore if current score > previous higschore
            if (this.score > parseInt(localStorage.getItem("highscore") || "0")) {
                this.dom.highscore.innerText = `HIGHSCORE: ${this.score}`;
                localStorage.setItem("highscore", this.score.toString());
            }
            this.dom.finalScore.innerText = `FINAL SCORE: ${this.score} / ${this.gameRounds}`;
            await this.swapView("game-window", "finish-window");
            this.dom.finalScore.innerText = `FINAL SCORE: ${this.score} / ${this.gameRounds}`;
        }

        if (this.currentRound < this.gameRounds) {
            // continue to next round
            this.dom.round.innerText = `ROUND: ${this.currentRound + 1} / ${this.gameRounds
                }`;
            this.currentCountry = this.gameCountries[this.currentRound];
            console.log(
                `Round ${this.currentRound + 1}: Current country is ${this.currentCountry
                }`
            );
            // loading animation when waiting for API reponse
            this.dom.passportButtons.classList.add("d-none");
            this.dom.content.classList.add("d-none");
            this.dom.loading.classList.remove("d-none");
            this.generatePassport(this.countriesData, this.allowedCountries);
            this.dom.passportButtons.classList.remove("d-none");
            this.dom.content.classList.remove("d-none");
            this.dom.loading.classList.add("d-none");
        }
    },

    generatePassport() {
        const countryData = this.countriesData[this.currentCountry];
        if (!countryData) {
            console.error("countryData not found for:", this.currentCountry);
            return;
        }

        //generate the passport information
        //all countries (conutriesData) is needed for neighbor flag generation
        const passportInfo = PassportGenerator.generatePassportInfo(
            countryData,
            this.countriesData
        );

        this.dom.area.value = passportInfo.area;
        this.dom.region.value = passportInfo.subregion;
        this.dom.population.value = passportInfo.population;
        this.dom.hemisphere.value = passportInfo.hemisphere;
        this.dom.landlocked.value = passportInfo.landlocked;

        this.dom.borders.innerHTML = "";

        if (passportInfo.borders.length === 0) {
            this.dom.borders.innerText = "No bordering countries";
        } else {
            passportInfo.borders.forEach((flagUrl) => {
                const img = document.createElement("img");
                img.classList.add();
                img.src = flagUrl;
                img.style.width = "10%";
                img.style.height = "auto";
                img.style.objectFit = "cover";
                img.style.border = "1px solid #ccc";
                img.title = "Neighbor";
                this.dom.borders.appendChild(img);
            });
        }
    },

    async startGame() {
        // fetch values from start screen settings
        this.gameRounds = parseInt(document.getElementById("rounds").value);
        this.lives = parseInt(document.getElementById("lives").value);
        this.allowedCountriesAmount = parseInt(
            document.getElementById("allowed-countries-amount").value
        );

        // Reset round variables
        this.currentRound = 0;
        this.score = 0;

        this.dom.score.innerText = `SCORE: ${this.score}`;
        this.dom.lives.innerText = `LIVES: ${this.lives}`;
        await this.initializeGame();

        const finishWindow = document.getElementById("finish-window");
        // different swapView for new game vs restart
        if (finishWindow.classList.contains("active-view")) {
            this.swapView("finish-window", "game-window");
        } else {
            this.swapView("start-window", "game-window");
        }

        if (this.currentRound === 0) {
            this.startNewRound(this.gameCountries, this.allowedCountries);
        }
    },

    init() {
        this.dom = {
            passportButtons: document.getElementById("passport-buttons"),
            loading: document.getElementById("passport-loading"),
            content: document.getElementById("passport-content"),
            //UI
            score: document.getElementById("current-score"),
            lives: document.getElementById("current-lives"),
            round: document.getElementById("current-round"),
            highscore: document.getElementById("highscore"),
            finalScore: document.getElementById("final-score"),
            //passport
            area: document.getElementById("area-field"),
            region: document.getElementById("region-field"),
            population: document.getElementById("pop-field"),
            hemisphere: document.getElementById("hemisphere-field"),
            landlocked: document.getElementById("landlocked-field"),
            borders: document.getElementById("borders-container"),
        };

        const gameWindow = document.getElementById("game-window");
        const startWindow = document.getElementById("start-window");
        const finishWindow = document.getElementById("finish-window");
        
        this.dom.highscore.innerText = `HIGHSCORE: ${localStorage.getItem("highscore") || "0" }`;

        // show start window
        startWindow.classList.add("active-view");
        gameWindow.classList.add("hidden-view");
        finishWindow.classList.add("hidden-view");

        // set history
        history.replaceState({ view: "start-window" }, "", "#start-window");

        // browser back/forward buttons
        window.addEventListener("popstate", (event) => {
            if (event.state && event.state.view) {
                const currentView = this.getCurrentView();
                if (currentView !== event.state.view) {
                    this.swapView(currentView, event.state.view, false);
                }
            }
        });

        const startGameButton = document.getElementById("start-game-btn");
        const startNewGameButton = document.getElementById("start-new-game-btn");

        startGameButton.addEventListener("click", () => this.startGame());
        startNewGameButton.addEventListener("click", () => this.startGame());

        const MainMenuButton = document.getElementById("main-menu-btn");

        MainMenuButton.addEventListener("click", async () => {
            await this.swapView("game-window", "start-window");
        });

        const allowButton = document.getElementById("allow-btn");
        const denyButton = document.getElementById("deny-btn");

        allowButton.addEventListener("click", async () => {
            await this.allowDenyPassport(true);
        });
        denyButton.addEventListener("click", async () => {
            await this.allowDenyPassport(false);
        });
    },
};

document.addEventListener("DOMContentLoaded", () => {
    //https://github.com/twitter/twemoji
    twemoji.parse(document.body);
    App.init();
});
