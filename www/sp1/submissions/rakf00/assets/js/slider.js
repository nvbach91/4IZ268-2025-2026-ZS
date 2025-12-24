document.addEventListener("DOMContentLoaded", function () {

    const slider = document.querySelector(".slider");
    const leftButton = document.querySelector(".nature-slider .left");
    const rightButton = document.querySelector(".nature-slider .right");
    //existence všeho
    if (slider && leftButton && rightButton) {

        // o kolik se posunout
        const getScrollAmount = () => {
            const firstImage = slider.querySelector(".image-container");
            if (!firstImage) {
                return 300;
            }
            // pro výpočet mezery mezi obrázky
            const sliderImageGap = parseFloat(window.getComputedStyle(slider).gap) || 0;
            // šířka jednoho obrázku
            const itemWidth = firstImage.offsetWidth;

            // posuneme o šířku obrázku + mezeru
            return itemWidth + sliderImageGap;
        };

        rightButton.addEventListener("click", () => {
            slider.scrollLeft += getScrollAmount();
        });

        leftButton.addEventListener("click", () => {
            slider.scrollLeft -= getScrollAmount();
        });
    }

});