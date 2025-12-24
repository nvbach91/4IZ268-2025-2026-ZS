const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".navigation-bar-menu");

if (menu) {
    menu.addEventListener("click", () => {
        menu.classList.toggle("is-active");
        menuLinks.classList.toggle("active");
    });
}

const categoryMenu = document.querySelector(".category-container");
const dropDownMenu = document.querySelector(".dropdown-menu");

if (categoryMenu) {
    categoryMenu.addEventListener("click", () => {
        dropDownMenu.classList.toggle("active");
    });
}


if (topButton) {
    topButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}