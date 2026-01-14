export const elements = {
    // References to all important DOM elements
    grid: document.getElementById('countries-grid'),
    detail: document.getElementById('country-detail'),
    controls: document.getElementById('controls'),
    pagination: document.getElementById('pagination'),
    searchInput: document.getElementById('search-input'),
    regionFilter: document.getElementById('region-filter'),
    loader: document.getElementById('loader'),
    errorMsg: document.getElementById('error-msg'),
    errorText: document.getElementById('error-text'),
    themeToggle: document.getElementById('theme-toggle'),
    logoLink: document.getElementById('logo-link'),
    backButton: document.getElementById('back-button'),
    showFavBtn: document.getElementById('show-fav-btn'),
    favBtnContainer: document.getElementById('fav-btn-container')
};
//Card grids
export function renderGrid(countries, favorites, isShowingFavorites) {
    // Clear previous content
    elements.grid.innerHTML = '';
    elements.errorMsg.classList.add('hidden');
    // No results found
    if (countries.length === 0) {
        const msg = document.createElement('p');
        msg.className = 'no-results';
        msg.textContent = isShowingFavorites
            // Show different message based on the current view mode
            ? 'Nemáte žádné oblíbené státy.'
            : 'Žádné výsledky nenalezeny.';
        elements.grid.appendChild(msg);
        return;
    }
    // Use a DocumentFragment to minimize browser reflows(optimization)
    const fragment = document.createDocumentFragment();

    countries.forEach(country => {
        const card = document.createElement('article');
        card.className = 'country-card';
        // Store the country code in a data attribute for event delegation
        card.dataset.code = country.cca3;

        // Add heart icon if the country is in favorites
        let favIconHTML = '';
        if (favorites.includes(country.cca3)) {
            favIconHTML = '<div class="card-fav-icon"><i class="fas fa-heart"></i></div>';
        }
        // Create the card HTML structure
        card.innerHTML = `
            ${favIconHTML}
            <img src="${country.flags.svg}" alt="Vlajka ${country.name.common}" class="card-img" loading="lazy">
            <div class="card-body">
                <h3 class="card-title">${country.name.common}</h3>
                <p class="card-info"><strong>Populace:</strong> ${country.population.toLocaleString()}</p>
                <p class="card-info"><strong>Region:</strong> ${country.region}</p>
                <p class="card-info"><strong>Hl. město:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            </div>
        `;
        fragment.appendChild(card);
    });
    // Append the entire fragment to the DOM at once
    elements.grid.appendChild(fragment);
}
//Renders pagination controls (Previous, Next, and Page Numbers).
export function renderPagination(currentPage, totalPages, onPageChange) {
    elements.pagination.innerHTML = '';
    // Hide pagination if there is only 1 page or no pages
    if (totalPages <= 1) {
        elements.pagination.classList.add('hidden');
        return;
    }

    elements.pagination.classList.remove('hidden');

    // Previous btn
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
    elements.pagination.appendChild(prevBtn);
    // We want to show a window of pages around the current page
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    // Adjust startPage if we are near the end
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    // Always show the first page if not in range
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'page-btn';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => onPageChange(1));
        elements.pagination.appendChild(firstBtn);

        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.alignSelf = 'center';
            elements.pagination.appendChild(dots);
        }
    }
    // Loop to generate page buttons in the calculated range
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => onPageChange(i));
        elements.pagination.appendChild(btn);
    }
    // Always show the last page if not in range
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.alignSelf = 'center';
            elements.pagination.appendChild(dots);
        }
        const lastBtn = document.createElement('button');
        lastBtn.className = 'page-btn';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => onPageChange(totalPages));
        elements.pagination.appendChild(lastBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
    elements.pagination.appendChild(nextBtn);
}

//Renders the Country Detail view.
//allCountries - List of all countries (needed for border names)
export function renderDetail(country, favorites, onToggleFavorite, allCountries) {
    // Helper function to get the native name safely
    const getNativeName = (n) => n ? Object.values(n)[0].common : country.name.common;
    // Helper function to format currencies safely
    const getCurrencies = (c) => c ? Object.values(c).map(curr => `${curr.name} (${curr.symbol})`).join(', ') : 'N/A';
    // Fill in the DOM elements with country data
    document.getElementById('detail-flag-img').src = country.flags.svg;
    document.getElementById('detail-flag-img').alt = `Vlajka ${country.name.common}`;
    document.getElementById('detail-name').textContent = country.name.common;
    document.getElementById('detail-native').textContent = country.name.nativeName ? getNativeName(country.name.nativeName) : country.name.common;
    document.getElementById('detail-population').textContent = country.population.toLocaleString();
    document.getElementById('detail-region').textContent = `${country.region} / ${country.subregion || ''}`;
    document.getElementById('detail-capital').textContent = country.capital ? country.capital.join(', ') : 'N/A';
    document.getElementById('detail-tld').textContent = country.tld ? country.tld.join(', ') : 'N/A';
    document.getElementById('detail-currency').textContent = getCurrencies(country.currencies);

    document.getElementById('detail-maps').href = country.maps.googleMaps;

    // Favorite btn Logic
    const favContainer = elements.favBtnContainer;
    favContainer.innerHTML = '';
    const favBtn = document.createElement('button');
    const isFav = favorites.includes(country.cca3);

    favBtn.className = isFav ? 'btn-fav liked' : 'btn-fav';
    favBtn.innerHTML = isFav
        ? '<i class="fas fa-heart"></i> Odebrat z oblíbených'
        : '<i class="far fa-heart"></i> Přidat do oblíbených';

    favBtn.addEventListener('click', () => onToggleFavorite(country.cca3));
    favContainer.appendChild(favBtn);

    //Border Countries
    const bordersContainer = document.getElementById('detail-borders');
    bordersContainer.innerHTML = '';

    if (country.borders && country.borders.length > 0) {
        const fragment = document.createDocumentFragment();

        country.borders.forEach(borderCode => {
            const btn = document.createElement('button');
            btn.className = 'border-btn';

            // Look up the full name of the border country using its code
            const borderCountry = allCountries.find(c => c.cca3 === borderCode);
            btn.textContent = borderCountry ? borderCountry.name.common : borderCode;
            // Navigate to Neighbour
            btn.addEventListener('click', () => {
                window.location.hash = `country/${borderCode}`;
            });

            fragment.appendChild(btn);
        });
        bordersContainer.appendChild(fragment);
    } else {
        bordersContainer.textContent = 'Tento stát nemá žádné sousedy.';
    }
}
// Shows or hides the loading spinner.
export function toggleLoader(show) {
    if (show) elements.loader.classList.remove('hidden');
    else elements.loader.classList.add('hidden');
}
//Displays an error message
export function showError(msg) {
    elements.errorText.textContent = msg;
    elements.errorMsg.classList.remove('hidden');
}

export function hideError() {
    elements.errorMsg.classList.add('hidden');
}