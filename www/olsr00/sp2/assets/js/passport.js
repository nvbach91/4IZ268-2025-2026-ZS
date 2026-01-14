class PassportGenerator {
    static getSubregionEmoji(subregion) {
        if (!subregion) return "❓";
        
        let emoji = "";
        const lowerSub = subregion.toLowerCase();

        if (lowerSub.includes("south")) emoji += "⬇️ (southern) ";
        else if (lowerSub.includes("north")) emoji += "⬆️ (northern) ";
        else if (lowerSub.includes("east")) emoji += "➡️ (eastern) ";
        else if (lowerSub.includes("west")) emoji += "⬅️ (western) ";
        else if (lowerSub.includes("cent")) emoji += "⏺️ (central) ";

        if (lowerSub.includes("europe")) emoji += "europe";
        else if (lowerSub.includes("asia")) emoji += "🌏 asia";
        else if (lowerSub.includes("africa")) emoji += "🌍 africa";
        else if (lowerSub.includes("america")) emoji += "🌎 america";
        else if (lowerSub.includes("oceania") || lowerSub.includes("australia")) emoji += "🌏 oceania";
        else if (lowerSub.includes("caribbean")) emoji += "🏝️ caribbean";
        
        return emoji.trim() || subregion;
    }

    static getHemisphereEmoji(latlng) {
        if (!latlng || latlng.length === 0) return "❓";
        const lat = latlng[0];
        return lat >= 0 ? "Northern Hemisphere ❄️" : "Southern Hemisphere 🐧";
    }

    static getAreaEmoji(area) {
        if (area < 50000) return "Small 🪨 - (less than 50 000km²)";
        if (area < 500000) return "Medium ⛰️ - (50 000km - 500 000km²)";
        return "Large 🏞️ - (more than 500 000km²)";
    }

    static getPopulationEmoji(population) {
        if (population < 1000000) return "<1 000 000 👤";
        if (population < 10000000) return "<10 000 000 👥";
        if (population < 50000000) return "<50 000 000 👥👤";
        else return "> 50 000 000 👥👥";
    }

    static getLandlockedEmoji(landlocked) {
        return landlocked ? "✅" : "❌";
    }

    //list of flag URLs
    static getBorderingCountriesSVGs(borders, countriesData) {
        // If no borders exist, return empty array which is handled in game.js
        if (!borders || borders.length === 0) {
            return [];
        }

        const flags = [];
        
        // converts dictionary into list of country objects
        const countriesList = Object.values(countriesData);
        
        // goes through every country code of the countries borders
        for (const code of borders) {
            let Found = false;
            for (const country of countriesList) {
                if (country.cca3 === code) {
                    if (country.flags && country.flags.svg) {
                        flags.push(country.flags.svg);
                    }
                    Found = true;
                    break;
                }
            }
        }
        
        return flags;
    }

    static generatePassportInfo(country, countriesData) {
        return {
            name: country.name.common,
            subregion: this.getSubregionEmoji(country.subregion),
            hemisphere: this.getHemisphereEmoji(country.latlng),
            area: this.getAreaEmoji(country.area),
            population: this.getPopulationEmoji(country.population),
            landlocked: this.getLandlockedEmoji(country.landlocked),
            borders: this.getBorderingCountriesSVGs(country.borders, countriesData),
            flag: country.flags.svg
        };
    }
}
