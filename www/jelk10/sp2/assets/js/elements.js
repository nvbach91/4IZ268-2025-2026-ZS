import { getPlatformsForMovie } from "./api.js"
import { getFavorites, getRegion } from "./storage.js"
import { getTranslation } from "./translations.js"

export const createSpinner = () => {
    const spinner = $(
        `<div id="spinner" class="d-flex flex-column align-items-center justify-content-center">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="mt-2 ml-2"><strong>${getTranslation('Loading')}</strong></div>
    </div>`
    )
    return spinner
}

export const createButtongroupContainer = (type) => {
    return $(`<div id="${type}-container" class="btn-group flex-wrap w-75 justify-content-center" role="group" aria-label="${type} selection"></div>`)
}

export const createContainer = (type) => {
    return $(`<div id="${type}-container" class="justify-content-center" role="group" aria-label="${type} selection"></div>`)
}

export const createButtongroupHeading = (text) => {
    return $(`<h2 class="mb-4 mt-4">${getTranslation('Choose')} ${getTranslation(text)}</h2>`)
}

export const createButtongroupButton = (id, name, type) => {
    return $(`<button type="button" id="${id}-${type}" class="btn btn-secondary rounded-pill mr-2 mt-2">${name}</button>`)
}

export const createGenerateButton = () => {
    return $(`
        <div class="d-flex justify-content-center">
        <div class="row mt-5 w-75">
          <button id="generate-button" type="button" class="btn btn-primary">${getTranslation('Generate')}</button>
        </div>
        </div>
      `)
}

export const createErrorFetchingAlert = (message) => {
    return $(`<div class="alert alert-danger" role="alert"><p>${getTranslation('ErrorFetching')} ${getTranslation(message)}</p></div>`)
}

export const createFavoritesContainer = () => {
    return $(`<div class="row g-2" id="favorites-container"></div>`)
}

export const createFavoriteMovieCard = (movie) => {
    const { poster_path, original_title, overview, vote_average, original_language, id, title } = movie
    return $(
        `<div id="favorite-movie-card-${id}" class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex justify-content-center mb-4">
        <div class="card custom-card">
          <img class="card-img-top" src="https://image.tmdb.org/t/p/w500/${poster_path}" alt="${original_title} poster">
          <div class="card-body">
            <h5 class="card-title h3">${original_title}</h5>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">★ ${vote_average.toFixed(1)}/10</li>
            <li class="list-group-item">🖌️${original_language.toUpperCase()}</li>
            <li class="list-group-item">
              <button id="detail-button-${id}" class="btn btn-primary btn-sm">🔍 Detail</button>
              <button id="remove-button-${id}" class="btn btn-danger btn-sm">${getTranslation('Remove')}</button>
            </li>
          </ul>
        </div>
      </div>`)
}

export const createSearchResultMovieCard = (movie) => {
    const { poster_path, original_title, overview, vote_average, original_language, id, title } = movie
    const isInFavorites = getFavorites().includes(id)
    if (isInFavorites) {
        return $(
            `<div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex justify-content-center mb-4">
        <div class="card custom-card">
          <img class="card-img-top" src="https://image.tmdb.org/t/p/w500/${poster_path}" alt="${original_title} poster">
          <div class="card-body">
            <h5 class="card-title h3">${title}</h5>
            <p class="card-text custom-card-text">${overview}</p>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">★ ${vote_average.toFixed(1)}/10</li>
            <li class="list-group-item">🖌️${original_language.toUpperCase()}</li>
            <li class="list-group-item">
              <button id="detail-button-${id}" class="btn btn-primary btn-sm">🔍 Detail</button>
              <button id="remove-button-${id}" class="btn btn-danger btn-sm">${getTranslation('Remove')}</button>
            </li>
          </ul>
        </div>
      </div>`)
    } else {
        return $(
            `<div class="col-12 col-md-6 col-lg-4 col-xl-3 d-flex justify-content-center mb-4">
        <div class="card custom-card">
          <img class="card-img-top" src="https://image.tmdb.org/t/p/w500/${poster_path}" alt="${original_title} poster">
          <div class="card-body">
            <h5 class="card-title h3">${title}</h5>
            <p class="card-text custom-card-text">${overview}</p>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">★ ${vote_average.toFixed(1)}/10</li>
            <li class="list-group-item">🖌️${original_language.toUpperCase()}</li>
            <li class="list-group-item">
              <button id="detail-button-${id}" class="btn btn-primary btn-sm">🔍 Detail</button>
              <button id="like-button-${id}" class="btn btn-success btn-sm">${getTranslation('Like')}</button>
            </li>
          </ul>
        </div>
      </div>`)
    }

}

export const createNoFavoritesAlert = () => {
    return $(`<div class="alert alert-info" role="alert"><p>${getTranslation('NoFavorites')}</p></div>`)
}

export const createNoResultsAlert = () => {
    return $(`<div class="alert alert-warning" role="alert"><p>${getTranslation('NoResults')}</p></div>`)
}

export const createNoSearchResultsAlert = () => {
    return $(`<div class="alert alert-warning" role="alert"><p>${getTranslation('NoSearchResults')}</p></div>`)
}

export const createMovieDetailModal = (id) => {
    return $(`
        <div class="modal fade" id="movieDetailModal-${id}" tabindex="-1" aria-labelledby="movieDetailModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="movieDetailModalLabel">${getTranslation('MovieDetails')}</h5>
            <button id="close-button" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
    `)
}

export const createMovieDetailModalBody = async (movie) => {
    const { original_title, overview, release_date, runtime, genres, backdrop_path, title, id } = movie
    return $(`
        <div class="text-center">
          <img src="https://image.tmdb.org/t/p/w780/${backdrop_path}" alt="${original_title} poster" class="img-fluid mb-3"/>
          <h3>${title} ${release_date ? `(${release_date.split('-')[0]})` : ''}</h3>
          <p>${original_title !== title ? `<em>(${original_title})</em>` : ''}</p>
          <p>${runtime ? `<strong>⏱️ Runtime:</strong> ${runtime} minutes` : ''}</p>
          <p>${genres.length ? `<strong>🎭 Genres:</strong> ${genres.map(g => g.name).join(', ')}` : ''}</p>
          <p>${(await appendPlatformsForMovie(id)).length ? `📺 ${(await appendPlatformsForMovie(id)).map(provider => provider).join(', ')}` : ''}</p>
          <p>${overview ? overview : ''}</p>
        </div>
      `)
}

export const createDeleteConfirmationModal = (type) => {
    return $(`<div class="modal fade" id="deleteConfirmationModal-${type}" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">${getTranslation('DeleteConfirmation')}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>${type === 'single' ? getTranslation('DeleteSingleConfirmationMessage') : getTranslation('DeleteConfirmationMessage')}</p>
      </div>
      <div class="modal-footer">
        <button id="delete-button" type="button" class="btn btn-primary btn-danger">${getTranslation('Delete')}</button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">${getTranslation('Close')}</button>
      </div>
    </div>
  </div>
</div>`)
}

export const createTinderButtons = () => {
    return $(
        `<div class=" justify-content-center gap-5 mb-4 mt-2">
      <button id="back-button" class="btn btn-secondary btn-secondary action-btn">←</button>
      <button id="next-button" class="btn btn-danger action-btn ml-4">❌</button>
      <button id="favorite-button" class="btn btn-success action-btn ml-4">❤️</button>
    </div>`
    )
}

export const createTinderCard = async (movie) => {
    const { poster_path, original_title, overview, vote_average, original_language, id, title } = movie
    const providers = await appendPlatformsForMovie(id)
    return $(
        `<div class="d-flex justify-content-center">
          <div class="card custom-card">
            <img class="card-img-top" src="https://image.tmdb.org/t/p/w500/${poster_path}" height="522" alt="${original_title} poster">
            <div class="card-body">
              <h5 class="card-title h3">${title}</h5>
              <p class="card-text custom-card-text">${overview}</p>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">★ ${vote_average.toFixed(1)}/10</li>
              <li class="list-group-item">🖌️${original_language.toUpperCase()}</li>
              ${providers.length ? `<li class="list-group-item">📺 ${providers.join(', ')}</li>` : ''}
            </ul>
          </div>
        </div>`)
}

export const appendPlatformsForMovie = async (movieId) => {
    const moviePlatforms = await getPlatformsForMovie(movieId)
    const region = getRegion()
    if (!moviePlatforms.results[region]) {
        return []
    }
    if (!moviePlatforms.results[region].flatrate) {
        return []
    }
    return moviePlatforms.results[region].flatrate.map(provider => provider.provider_name) || []
}

export const createRemoveAllFavoritesButton = () => {
    return $(`
        <div class="row mb-4 w-100 d-flex justify-content-center">
        <div class="row mb-4 w-75">
          <button id="remove-all-favorites-button" type="button" class="btn btn-danger">${getTranslation('RemoveAllFavorites')}</button>
        </div>
        </div>
      `)
}