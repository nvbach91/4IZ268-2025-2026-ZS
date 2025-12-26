import cloud from "../assets/images/icons/cloud.png";
import sun from "../assets/images/icons/sun.png";
import rain from "../assets/images/icons/rain.png";
import snow from "../assets/images/icons/snow.png";
import storm from "../assets/images/icons/storm.png";

// https://open-meteo.com/en/docs#weather_variable_documentation

export function weatherMapper(code) {
    let category = "";

    if (0 === code) category = "sunny";
    if ([1, 2, 3, 45, 48].includes(code)) category = "cloudy";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) category = "rainy";
    if ([71, 73, 75, 77, 85, 86].includes(code)) category = "snowy";
    if ([95, 96, 99].includes(code)) category = "stormy";

    return categories[category] || {
        label: "unknown",
        img: null,
        alt: "Weather Icon"
    };
}

const categories = {
    sunny: {
        label: 'Sunny',
        img: sun,
        alt: 'Sun icon',
    },
    "cloudy": {
        label: 'Cloudy',
        img: cloud,
        alt: 'Cloud icon',
    },
    rainy: {
        label: 'Rainy',
        img: rain,
        alt: 'Rain icon',
    },
    stormy: {
        label: 'Stormy',
        img: storm,
        alt: 'Storm icon',
    },
    snowy: {
        label: 'Snowy',
        img: snow,
        alt: 'Snow icon',
    }
}