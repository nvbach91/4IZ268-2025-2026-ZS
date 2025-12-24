document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('.nav-button');
    const header = document.getElementById('header');

    if (toggleButton && header) {
        toggleButton.addEventListener('click', function () {

            header.classList.toggle('open'); 
            const isExpanded = header.classList.contains('open');
            toggleButton.setAttribute('aria-expanded', isExpanded);

            const icon = toggleButton.querySelector('.fa');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-close');
            } else {
                icon.classList.remove('fa-close');
                icon.classList.add('fa-bars');
            }
        });
    }
});