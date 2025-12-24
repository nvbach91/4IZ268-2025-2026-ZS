// Smooth Scroll for Links
document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const targetId = link.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = window.innerWidth < 940 ? 50 : 135;
                const offsetTop = targetElement === document.getElementById('top')
                    ? 0
                    : targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth"
                });
            }
        });
    });
});

// Scroll Page to Top on Load
window.onload = function () {
    setTimeout(function () {
        window.scrollTo(0, 0);
    }, 0);
};

// Back-to-Top Button
window.addEventListener('scroll', function () {
    const backToTopButton = document.getElementById("back-to-top");

    if (window.scrollY > 300) {
        backToTopButton.style.display = "flex";
        backToTopButton.style.opacity = "1";
    } else {
        backToTopButton.style.opacity = "0";
        setTimeout(() => backToTopButton.style.display = "none", 400);
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Automatické otevření <details> (FAQ) při tisku
window.addEventListener('beforeprint', () => {
    document.querySelectorAll('details').forEach((detail) => {
        // Uložíme si, zda byl otevřený, abychom ho mohli případně zase zavřít (volitelné)
        if (!detail.hasAttribute('open')) {
            detail.setAttribute('data-was-closed', 'true');
            detail.setAttribute('open', 'true');
        }
    });
});

window.addEventListener('afterprint', () => {
    document.querySelectorAll('details').forEach((detail) => {
        if (detail.getAttribute('data-was-closed') === 'true') {
            detail.removeAttribute('open');
            detail.removeAttribute('data-was-closed');
        }
    });
});

// --- SCROLLSPY ---
document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section, div[id]");
    const navLinks = document.querySelectorAll(".header-menu nav ul li a, .mobile-menu nav ul li a");
    const observerOptions = {
        root: null,
        rootMargin: '-150px 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    link.classList.remove("active-link");
                    const href = link.getAttribute("href");
                    if (href.includes(`#${activeId}`)) {
                        link.classList.add("active-link");
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (section.id) {
            const matchingLink = Array.from(navLinks).some(link => link.getAttribute("href").includes(`#${section.id}`));
            if (matchingLink) {
                observer.observe(section);
            }
        }
    });
});
