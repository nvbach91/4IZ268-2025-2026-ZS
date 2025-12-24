let scrollY = 0;
const root = document.documentElement; // <html>
const body = document.body;

const lockScroll = () => {
  scrollY = window.scrollY;
  document.body.style.top = `-${scrollY}px`;
  root.classList.add("no-scroll");
  body.classList.add("no-scroll");
};

const unlockScroll = () => {
  root.classList.remove("no-scroll");
  body.classList.remove("no-scroll");
  body.style.top = "";
  window.scrollTo(0, scrollY);
};


export function initHamburgerMenu() {
  const btn = document.getElementById("mobile-hamburger-menu-button");
  const nav = document.getElementById("header-navigation")
  const img = document.querySelector('#mobile-hamburger-menu-button > img')

  if (!btn || !nav || !img) return; // page doesn't have it

  const swapImageSrc = () => {
    const currSrc = img.getAttribute("src").split('/')
    const state = currSrc.pop()
    const stateToUse = state.includes("open") ? "closed" : "open"
    const updatedSrc = currSrc.join('/') + `/${stateToUse}.png`;
    console.log({stateToUse, updatedSrc})
    img.setAttribute("src", updatedSrc)
  }

  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    swapImageSrc()

    btn.setAttribute("aria-expanded", String(!isOpen));
    btn.classList.toggle("open", !isOpen);
    btn.classList.toggle("closed", isOpen);

    nav.classList.toggle("open", !isOpen);

    if(!isOpen) lockScroll();
    else unlockScroll();
  });
}

