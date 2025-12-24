export function initHeaderShadow() {
  const header = document.querySelector("header");
  if (!header) return;

  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 0);
  };

  update(); // initial state (reload mid-page)
  window.addEventListener("scroll", update, { passive: true });
}