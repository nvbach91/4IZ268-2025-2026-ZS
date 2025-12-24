const phoneNav = document.querySelector(".mobile-nav-toggle");
const burgerLinks = document.querySelector(".mobile-nav-links");

phoneNav.addEventListener("click", () => {
  console.log("click");
  burgerLinks.classList.toggle("open");
});
