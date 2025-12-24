export function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");

  if (!items.length) return;

  const getWrap = (item) => item.querySelector(".faq-answer-wrap");

  const closeItem = (item) => {
    const wrap = getWrap(item);
    if (!wrap) return;
    wrap.style.height = `${wrap.scrollHeight}px`;
    requestAnimationFrame(() => {
      wrap.style.height = "0px";
    });
    const onEnd = (event) => {
      if (event.target !== wrap) return;
      wrap.removeEventListener("transitionend", onEnd);
      item.open = false;
    };
    wrap.addEventListener("transitionend", onEnd);
  };

  const openItem = (item) => {
    const wrap = getWrap(item);
    if (!wrap) return;
    item.open = true;
    wrap.style.height = "0px";
    requestAnimationFrame(() => {
      wrap.style.height = `${wrap.scrollHeight}px`;
    });
    const onEnd = (event) => {
      if (event.target !== wrap) return;
      wrap.removeEventListener("transitionend", onEnd);
      wrap.style.height = "auto";
    };
    wrap.addEventListener("transitionend", onEnd);
  };

  items.forEach((item) => {
    const wrap = getWrap(item);
    if (!wrap) return;
    wrap.style.transition = "none";
    wrap.style.height = item.open ? "auto" : "0px";
    requestAnimationFrame(() => {
      wrap.style.transition = "";
    });
  });

  items.forEach((item) => {
    const summary = item.querySelector("summary");
    const clickHandler = (event) => {
      if (event.target.closest("a")) return;
      event.preventDefault();
      if (item.open) {
        closeItem(item);
        return;
      }
      items.forEach((other) => {
        if (other !== item && other.open) closeItem(other);
      });
      openItem(item);
    };
    if (summary) summary.addEventListener("click", clickHandler);
    item.addEventListener("click", (event) => {
      if (event.target.closest("summary") || event.target.closest("a")) return;
      clickHandler(event);
    });
  });

  window.addEventListener("resize", () => {
    items.forEach((item) => {
      if (!item.open) return;
      const wrap = getWrap(item);
      if (!wrap) return;
      wrap.style.height = "auto";
      const height = wrap.scrollHeight;
      wrap.style.height = `${height}px`;
    });
  });

}
