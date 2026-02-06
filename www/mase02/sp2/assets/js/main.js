const SPOTIFY_CONFIG = {
    CLIENT_ID: '6c005113c81049858804d46cc4d92bc8',
    CLIENT_SECRET: '3cd2a5b71bf04551995371250af75915',
    TOKEN_URL: 'https://accounts.spotify.com/api/token',
    API_BASE: 'https://api.spotify.com/v1'
};


let accessToken = null;
let currentArtist = null;
let allRelatedArtists = [];
let currentPage = 1;
const artistsPerPage = 6;


const discoverBtn = $('#discoverBtn');
const discoveryPrompt = $('#discoveryPrompt');
const artistDisplay = $('#artistDisplay');
const loadingState = $('#loadingState');
const findingsToggle = $('#findingsToggle');
const findingsPanel = $('#findingsPanel');
const closeFindings = $('#closeFindings');
const findingsList = $('#findingsList');
const findingsCount = $('#findingsCount');
const saveBtn = $('#saveBtn');
const discoverAnotherBtn = $('#discoverAnotherBtn');
const confirmModal = $('#confirmModal');
const modalCancel = $('#modalCancel');
const modalConfirm = $('#modalConfirm');
const paginationControls = $('#paginationControls');
const prevPageBtn = $('#prevPage');
const nextPageBtn = $('#nextPage');
const paginationInfo = $('#paginationInfo');

let artistToRemove = null;


$(document).ready(() => {
    initializeApp();
});

async function initializeApp() {

    updateFindingsCount();
    await getAccessToken();

    discoverBtn.on('click', discoverNewArtist);
    discoverAnotherBtn.on('click', discoverNewArtist);
    findingsToggle.on('click', toggleFindingsPanel);
    closeFindings.on('click', toggleFindingsPanel);
    saveBtn.on('click', saveCurrentArtist);
    modalCancel.on('click', closeModal);
    modalConfirm.on('click', confirmRemove);
    prevPageBtn.on('click', goToPrevPage);
    nextPageBtn.on('click', goToNextPage);

    displayFindings();
}

// getting spotify access token 

async function getAccessToken() {
    const response = await axios.post(
        SPOTIFY_CONFIG.TOKEN_URL,
        'grant_type=client_credentials',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(
                    SPOTIFY_CONFIG.CLIENT_ID + ':' + SPOTIFY_CONFIG.CLIENT_SECRET
                )
            }
        }
    ).catch(() => {
        showError('Failed to connect to Spotify API.');
        return null;
    });

    if (response) {
        accessToken = response.data.access_token;
    }
}

// getting random artist
async function getRandomArtist() {
    try {
        // generating random 3-letter combination
        // 3-letter because with 1 and 2 letters there are too many results, but spotify limit is 1000
        // which means if there are too many results we cannot cover them all
        let searchTerm = '';
        for (let i = 0; i < 3; i++) {
            searchTerm += String.fromCharCode(97 + Math.floor(Math.random() * 26));
        }

        // number of results
        const initialResponse = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/search`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                q: searchTerm,
                type: 'artist',
                limit: 1,
                offset: 0
            }
        });

        const totalResults = initialResponse.data.artists.total;

        // trying again if no results
        if (totalResults === 0) {
            return await getRandomArtist();
        }


        const maxOffset = Math.min(totalResults - 50, 1000);


        const offset = Math.max(0, Math.floor(Math.random() * maxOffset));


        // getting artists
        const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/search`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                q: searchTerm,
                type: 'artist',
                limit: 50,
                offset: offset
            }
        });

        const artists = response.data.artists.items;

        // removing ones without pictures and with little followers
        const validArtists = artists.filter(artist =>
            artist.images && artist.images.length > 0 && artist.followers.total > 1000
        );

        // trying again if no valid artists

        if (validArtists.length === 0) {
            return await getRandomArtist();
        }

        // picking random artist from results
        const randomArtist = validArtists[Math.floor(Math.random() * validArtists.length)];
        return randomArtist.id;

    } catch (error) {
        return await getRandomArtist();
    }
}


// discovering artist
async function discoverNewArtist() {
    if (!accessToken) {
        await getAccessToken();
    }

    // loading 
    discoveryPrompt.addClass('hidden');
    artistDisplay.addClass('hidden');
    loadingState.removeClass('hidden');

    try {

        const artistId = await getRandomArtist();

        const [artistData, topTracks] = await Promise.all([
            getArtistData(artistId),
            getTopTracks(artistId)
        ]);

        const similarArtists = await getArtistsInSameGenres(artistData.genres);

        currentArtist = {
            id: artistData.id,
            name: artistData.name,
            image: artistData.images[0].url,
            genres: artistData.genres,
            popularity: artistData.popularity,
            topTracks: topTracks,
            relatedArtists: similarArtists
        };

        displayArtist(currentArtist);

    } catch (error) {
        showError('Failed to discover artist.');

    }
}

// getting artist data
async function getArtistData(artistId) {
    const response = await axios.get(
        `${SPOTIFY_CONFIG.API_BASE}/artists/${artistId}`,
        { headers: { Authorization: `Bearer ${accessToken}`, 'Accept-Language': 'en' } }
    );

    return response.data;
}

// getting top tracks
async function getTopTracks(artistId) {
    const response = await axios.get(
        `${SPOTIFY_CONFIG.API_BASE}/artists/${artistId}/top-tracks?market=US`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return response.data.tracks.slice(0, 5);
}


// getting similar artists (random artists in the same genre)
async function getArtistsInSameGenres(artistGenres) {
    if (!artistGenres || artistGenres.length === 0) {
        
        const artistPromises = Array.from({ length: 30 }, async () => {
            const artistId = await getRandomArtist();
            return getArtistData(artistId);
        });
        return Promise.all(artistPromises);
    }
    



    // using first genre and random offset
    const genre = artistGenres[0];
    const randomOffset = Math.floor(Math.random() * 200);

    const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/search`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: {
            q: genre,
            type: 'artist',
            limit: 50,
            offset: randomOffset
        }
    });

    // filtering valid artists and taking 30 random
    const validArtists = response.data.artists.items.filter(a =>
        a.images && a.images.length > 0
    );

    const shuffled = validArtists.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 30);
}


// displaying artists
function displayArtist(artist) {
    $('#artistImage').attr('src', artist.image).attr('alt', artist.name);

    $('#artistName').text(artist.name);

    const popularityBar = $('.popularity-bar');
    popularityBar.css('--popularity', artist.popularity + '%');
    $('#popularityBadge .popularity-text').text(artist.popularity + '% Popular');

    const genresContainer = $('#genres');
    genresContainer.empty();
    if (artist.genres.length > 0) {
        const genreTags = artist.genres.map(genre => 
            `<span class="genre-tag">${genre}</span>`
        ).join('');
        genresContainer.html(genreTags);
    } else {
        genresContainer.html('<span class="genre-tag">No genre data</span>');
    }

    const tracksList = $('#tracksList');
    tracksList.empty();
    
    const tracksHTML = artist.topTracks.map((track, index) => {
        // converting duration of tracks from ms to mm:ss
        const minutes = Math.floor(track.duration_ms / 60000);
        const seconds = Math.floor((track.duration_ms % 60000) / 1000);
        const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        return `
            <div class="track-item">
                <span class="track-number">${index + 1}</span>
                <div class="track-info">
                    <div class="track-name">${track.name}</div>
                    <div class="track-album">${track.album.name}</div>
                </div>
                <span class="track-duration">${duration}</span>
                <a href="${track.external_urls.spotify}" target="_blank" class="track-spotify-link" title="Open in Spotify">
                    <img src="assets/images/spotify_logo.webp" alt="Spotify" class="spotify-icon">
                </a>
            </div>
        `;
    }).join('');
    
    tracksList.html(tracksHTML);


    // paginations
    allRelatedArtists = artist.relatedArtists;
    currentPage = 1;

    displayRelatedArtists();


    updateSaveButton();

    loadingState.addClass('hidden');
    artistDisplay.removeClass('hidden');
}



// saving artist

function saveCurrentArtist() {
    if (!currentArtist) return;

    const findings = getFindings();

    // preventing duplicates
    if (findings.some(f => f.id === currentArtist.id)) return;

    // limit data in local storage
    const minimalArtist = {
        id: currentArtist.id,
        name: currentArtist.name,
        image: currentArtist.image,
        genres: currentArtist.genres
    };

    findings.push(minimalArtist);
    localStorage.setItem('artistFindings', JSON.stringify(findings));

    updateSaveButton();
    updateFindingsCount();
    displayFindings();
};


// updating save button
function updateSaveButton() {

    const isSaved = getFindings().some(a => a.id === currentArtist.id);
    saveBtn
        .toggleClass('saved', isSaved)
        .text(isSaved ? 'SAVED!' : 'SAVE TO MY FINDINGS');
}

// findings panel
function toggleFindingsPanel() {
    findingsPanel.toggleClass('active');
}

// getting finding from local storage
function getFindings() {
    const findings = localStorage.getItem('artistFindings');
    return findings ? JSON.parse(findings) : [];
}

// updating number of findings
function updateFindingsCount() {
    const findings = getFindings();
    findingsCount.text(findings.length);
}

// displaying findings
function displayFindings() {
    const findings = getFindings();
    const container = findingsList;

    container.empty();

    if (findings.length === 0) {
        container.html('<div class="empty-findings"><p>No artists saved yet. Start discovering!</p></div>');
        return;
    }

    
    const findingsHTML = findings.map(artist => `
        <div class="finding-item" data-artist-id="${artist.id}">
            <img src="${artist.image}" alt="${artist.name}" class="finding-image">
            <div class="finding-info">
                <div class="finding-name">${artist.name}</div>
                <div class="finding-genres">${artist.genres.slice(0, 2).join(', ') || 'No genre'}</div>
            </div>
            <button class="remove-finding" data-artist-id="${artist.id}">Remove</button>
        </div>
    `).join('');

    
    container.html(findingsHTML);

    
    $('.finding-item').on('click', async function (e) {
    
        if ($(e.target).hasClass('remove-finding')) {
            return;
        }

        const artistId = $(this).data('artist-id');
        
        
        findingsPanel.removeClass('active');
        
        // loading 
        discoveryPrompt.addClass('hidden');
        artistDisplay.addClass('hidden');
        loadingState.removeClass('hidden');

        try {
            const [artistData, topTracks] = await Promise.all([
                getArtistData(artistId),
                getTopTracks(artistId)
            ]);

            const similarArtists = await getArtistsInSameGenres(artistData.genres);

            currentArtist = {
                id: artistData.id,
                name: artistData.name,
                image: artistData.images[0]?.url || '',
                genres: artistData.genres,
                popularity: artistData.popularity,
                topTracks: topTracks,
                relatedArtists: similarArtists
            };

            displayArtist(currentArtist);
        } catch (error) {
            showError('Failed to load artist.');
            loadingState.addClass('hidden');
            discoveryPrompt.removeClass('hidden');
        }
    });

    // removing finding
    $('.remove-finding').on('click', function (e) {
        e.stopPropagation(); 
        const artistId = $(this).data('artist-id');
        showRemoveConfirmation(artistId);
    });
}

// showing remove confirmation
function showRemoveConfirmation(artistId) {
    artistToRemove = artistId;
    confirmModal.removeClass('hidden');
}

// closing modal
function closeModal() {
    artistToRemove = null;
    confirmModal.addClass('hidden');
}

// confirming remove
function confirmRemove() {
    if (artistToRemove) {
        removeFromFindings(artistToRemove);
        closeModal();
    }
}

// removing from findings
function removeFromFindings(artistId) {
    let findings = getFindings();
    findings = findings.filter(f => f.id !== artistId);
    localStorage.setItem('artistFindings', JSON.stringify(findings));

    updateFindingsCount();
    displayFindings();
    updateSaveButton();
}

// displaying similar artists with pagination
function displayRelatedArtists() {
    const relatedArtistsContainer = $('#relatedArtists');
    relatedArtistsContainer.empty();

    if (allRelatedArtists.length === 0) {
        relatedArtistsContainer.html('<p style="color: #b4b4b4; padding: 1rem;">No related artists available for this artist.</p>');
        paginationControls.addClass('hidden');
        return;
    }

  
    const totalPages = Math.ceil(allRelatedArtists.length / artistsPerPage);
    const startIndex = (currentPage - 1) * artistsPerPage;
    const endIndex = startIndex + artistsPerPage;
    const artistsToShow = allRelatedArtists.slice(startIndex, endIndex);

    
    const artistsHTML = artistsToShow.map(relatedArtist => `
        <div class="related-artist" data-artist-id="${relatedArtist.id}">
            <img src="${relatedArtist.images[0].url}" alt="${relatedArtist.name}" class="related-artist-image">
            <div class="related-artist-name">${relatedArtist.name}</div>
        </div>
    `).join('');

    
    relatedArtistsContainer.html(artistsHTML);

    // clicking on similar artists and going to their page
    $('.related-artist').on('click', async function () {
        const artistId = $(this).data('artist-id');
        loadingState.removeClass('hidden');
        artistDisplay.addClass('hidden');

        try {
            const [artistData, topTracks] = await Promise.all([
                getArtistData(artistId),
                getTopTracks(artistId)
            ]);

            const similarArtists = await getArtistsInSameGenres(artistData.genres);

            currentArtist = {
                id: artistData.id,
                name: artistData.name,
                image: artistData.images[0]?.url || '',
                genres: artistData.genres,
                popularity: artistData.popularity,
                topTracks: topTracks,
                relatedArtists: similarArtists
            };

            displayArtist(currentArtist);
        } catch (error) {
            showError('Failed to load artist.');
            loadingState.addClass('hidden');
            artistDisplay.removeClass('hidden');
        }
    });

    // pagination
    if (totalPages > 1) {
        paginationControls.removeClass('hidden');
        paginationInfo.text(`${currentPage} / ${totalPages}`);
        prevPageBtn.prop('disabled', currentPage === 1);
        nextPageBtn.prop('disabled', currentPage === totalPages);
    } else {
        paginationControls.addClass('hidden');
    }
}


function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayRelatedArtists();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(allRelatedArtists.length / artistsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayRelatedArtists();
    }
}