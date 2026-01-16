export const elements = {
   
    grid: document.getElementById('countries-grid'),
    detail: document.getElementById('country-detail'),
    controls: document.getElementById('controls'),
    pagination: document.getElementById('pagination'),
    statsContainer: document.getElementById('stats-container'),
    

    searchInput: document.getElementById('search-input'),
    regionFilter: document.getElementById('region-filter'),
    loader: document.getElementById('loader'),
    errorMsg: document.getElementById('error-msg'),
    errorText: document.getElementById('error-text'),
    themeToggle: document.getElementById('theme-toggle'),
    logoLink: document.getElementById('logo-link'),
    backButton: document.getElementById('back-button'),
    showFavBtn: document.getElementById('show-fav-btn'),
    

    favBtnContainer: document.getElementById('fav-btn-container'),


    detailFlag: document.getElementById('detail-flag-img'),
    detailName: document.getElementById('detail-name'),
    detailNative: document.getElementById('detail-native'),
    detailPopulation: document.getElementById('detail-population'),
    detailRegion: document.getElementById('detail-region'),
    detailCapital: document.getElementById('detail-capital'),
    detailTld: document.getElementById('detail-tld'),
    detailCurrency: document.getElementById('detail-currency'),
    detailMaps: document.getElementById('detail-maps'),
    detailBorders: document.getElementById('detail-borders')
};

export function renderGrid(countries, favorites, isShowingFavorites) {
    elements.grid.innerHTML = '';
    elements.errorMsg.classList.add('hidden');

    if (countries.length === 0) {
        const msg = document.createElement('p');
        msg.className = 'no-results';
        msg.textContent = isShowingFavorites 
            ? 'Nemáte žádné oblíbené státy.' 
            : 'Žádné výsledky nenalezeny.';
        elements.grid.appendChild(msg);
        elements.statsContainer.classList.add('hidden');
        return;
    }

 
    const fragment = document.createDocumentFragment();

    countries.forEach(country => {
        const card = document.createElement('article');
        card.className = 'country-card';
        card.dataset.code = country.cca3;

        let favIconHTML = '';
        if (favorites.includes(country.cca3)) {
            favIconHTML = '<div class="card-fav-icon"><i class="fas fa-heart"></i></div>';
        }

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

    elements.grid.appendChild(fragment);
}

export function renderStats(countries) {
    if (!countries || countries.length === 0) {
        elements.statsContainer.classList.add('hidden');
        return;
    }

    // region count
    const regionCounts = countries.reduce((acc, country) => {
        const region = country.region || 'Ostatní';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
    }, {});

    // Vygen tlacitko
    const statsHtml = Object.entries(regionCounts)
        .sort((a, b) => b[1] - a[1]) 
        .map(([region, count]) => `<button class="stat-tag" data-region="${region}"><strong>${region}:</strong> ${count}</button>`)
        .join('');

    elements.statsContainer.innerHTML = statsHtml;
    elements.statsContainer.classList.remove('hidden');
}

export function renderPagination(currentPage, totalPages, onPageChange) {
    elements.pagination.innerHTML = '';
    
    if (totalPages <= 1) {
        elements.pagination.classList.add('hidden');
        return;
    }
    
    elements.pagination.classList.remove('hidden');

    const createBtn = (text, page, disabled, active) => {
        const btn = document.createElement('button');
        btn.className = `page-btn ${active ? 'active' : ''}`;
        btn.innerHTML = text;
        btn.disabled = disabled;
        btn.addEventListener('click', () => onPageChange(page));
        return btn;
    };

    elements.pagination.appendChild(createBtn('<i class="fas fa-chevron-left"></i>', currentPage - 1, currentPage === 1));

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    if (startPage > 1) {
        elements.pagination.appendChild(createBtn('1', 1));
        if (startPage > 2) {
            const dots = document.createElement('span'); dots.textContent = '...'; dots.style.alignSelf = 'center';
            elements.pagination.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        elements.pagination.appendChild(createBtn(i, i, false, i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span'); dots.textContent = '...'; dots.style.alignSelf = 'center';
            elements.pagination.appendChild(dots);
        }
        elements.pagination.appendChild(createBtn(totalPages, totalPages));
    }

    elements.pagination.appendChild(createBtn('<i class="fas fa-chevron-right"></i>', currentPage + 1, currentPage === totalPages));
}

export function renderDetail(country, favorites, onToggleFavorite, allCountries) {
    const getNativeName = (n) => n ? Object.values(n)[0].common : country.name.common;
    const getCurrencies = (c) => c ? Object.values(c).map(curr => `${curr.name} (${curr.symbol})`).join(', ') : 'N/A';
    
    elements.detailFlag.src = country.flags.svg;
    elements.detailFlag.alt = `Vlajka ${country.name.common}`;

    elements.detailName.textContent = country.name.common;
    elements.detailNative.textContent = country.name.nativeName ? getNativeName(country.name.nativeName) : country.name.common;
    elements.detailPopulation.textContent = country.population.toLocaleString();
    elements.detailRegion.textContent = `${country.region} / ${country.subregion || ''}`;
    elements.detailCapital.textContent = country.capital ? country.capital.join(', ') : 'N/A';
    elements.detailTld.textContent = country.tld ? country.tld.join(', ') : 'N/A';
    elements.detailCurrency.textContent = getCurrencies(country.currencies);
    
    elements.detailMaps.href = country.maps.googleMaps;

    renderFavoriteButtonInDetail(favorites.includes(country.cca3), country.cca3, onToggleFavorite);

    elements.detailBorders.innerHTML = '';
    
    if (country.borders && country.borders.length > 0) {
        const fragment = document.createDocumentFragment();
        
        country.borders.forEach(borderCode => {
            const btn = document.createElement('button');
            btn.className = 'border-btn';
            
            const borderCountry = allCountries.find(c => c.cca3 === borderCode);
            btn.textContent = borderCountry ? borderCountry.name.common : borderCode;
            
            btn.addEventListener('click', () => {
                window.location.hash = `country/${borderCode}`;
            });
            
            fragment.appendChild(btn);
        });
        elements.detailBorders.appendChild(fragment);
    } else {
        elements.detailBorders.textContent = 'Tento stát nemá žádné sousedy.';
    }
}

function renderFavoriteButtonInDetail(isFav, countryCode, onToggle) {
    elements.favBtnContainer.innerHTML = ''; 
    const favBtn = document.createElement('button');
    favBtn.id = 'current-fav-btn'; 
    
    updateFavoriteButtonStyle(favBtn, isFav);
    
    favBtn.addEventListener('click', () => onToggle(countryCode));
    elements.favBtnContainer.appendChild(favBtn);
}

export function updateFavoriteButton(isFav) {
    const btn = document.getElementById('current-fav-btn');
    if (btn) {
        updateFavoriteButtonStyle(btn, isFav);
    }
}

function updateFavoriteButtonStyle(btn, isFav) {
    btn.className = isFav ? 'btn-fav liked' : 'btn-fav';
    btn.innerHTML = isFav 
        ? '<i class="fas fa-heart"></i> Odebrat z oblíbených'
        : '<i class="far fa-heart"></i> Přidat do oblíbených';
}

export function toggleLoader(show) {
    if (show) elements.loader.classList.remove('hidden');
    else elements.loader.classList.add('hidden');
}

export function showError(msg) {
    elements.errorText.textContent = msg;
    elements.errorMsg.classList.remove('hidden');
}

export function hideError() {
    elements.errorMsg.classList.add('hidden');
}