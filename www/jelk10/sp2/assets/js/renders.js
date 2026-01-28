import {
    closeModalButton,
    appContainer,
    searchButton,
    searchText,
    spinner,
    platformContainer,
    genreContainer,
    movieContainer,
    backButton,
    nextButton,
    favoriteButton,
    removeAllFavoritesButton,
    favoritePage,
    generatePage
} from "./selectors.js"
import {
    createMovieDetailModal,
    createMovieDetailModalBody,
    createButtongroupContainer,
    createButtongroupHeading,
    createButtongroupButton,
    createErrorFetchingAlert,
    createSpinner,
    createFavoriteMovieCard,
    createNoFavoritesAlert,
    createFavoritesContainer,
    createNoResultsAlert,
    createGenerateButton,
    createTinderButtons,
    createTinderCard,
    createRemoveAllFavoritesButton,
    createContainer,
    createSearchResultMovieCard,
    createNoSearchResultsAlert
} from "./elements.js"
import {
    getMovieDetail,
    searchByGenresAndPlatforms,
    getGenres,
    getPlatforms,
    searchByText
} from "./api.js"
import {
    addToFavorites,
    clearFavorites,
    getFavorites,
    removeFromFavorites,
    selectedGenres,
    selectedPlatforms,
    getRegion,
    getSeenMovies,
    addSeenMovie
} from "./storage.js"

export const showMovieDetailModal = async (movie_id) => {
    const modalElement = createMovieDetailModal(movie_id)
    const movie = await getMovieDetail(movie_id)
    const modalBody = createMovieDetailModalBody(movie)
    modalElement.find('.modal-body').append(modalBody)
    appContainer().append(modalElement)
    closeModalButton().on('click', () => hideMovieDetailModal(movie_id))
    const modalElementSelector = document.getElementById(`movieDetailModal-${movie_id}`)
    const modal = new bootstrap.Modal(modalElementSelector)
    modal.show()
}

export const hideMovieDetailModal = (movie_id) => {
    const modalElementSelector = document.getElementById(`movieDetailModal-${movie_id}`)
    const modal = new bootstrap.Modal(modalElementSelector)
    modal.hide()
    document.body.classList.remove('modal-open')
    const modalBackdrop = document.getElementsByClassName('modal-backdrop')[0]
    if (modalBackdrop) {
        modalBackdrop.remove()
    }
    modalElementSelector.remove()
}

export const renderGenres = async (genres) => {
    const genreContainer = createButtongroupContainer('genre')
    const headingElement = createButtongroupHeading('genre')
    appContainer().append(headingElement)
    if (!genres?.genres?.length) {
        const errorElement = createErrorFetchingAlert('genres')
        genreContainer.append(errorElement)
        return
    }
    genres.genres.forEach(genre => {
        const buttonElement = createButtongroupButton(genre.id, genre.name, 'genre')
        buttonElement.on('click', () => {
            buttonElement.blur()
            const extractedId = buttonElement.attr('id').replace('-genre', '')
            const index = selectedGenres.indexOf(extractedId)
            if (index == -1) {
                selectedGenres.push(extractedId)
                buttonElement.removeClass('btn-secondary')
                buttonElement.addClass('btn-primary')
            } else {
                selectedGenres.splice(index, 1)
                buttonElement.removeClass('btn-primary')
                buttonElement.addClass('btn-secondary')
            }
        })
        genreContainer.append(buttonElement)
    });
    appContainer().append(genreContainer)
}

export const renderGenerateButton = () => {
    const generateButtonContainer = createGenerateButton()
    generateButtonContainer.find('#generate-button').on('click', async () => {
        appContainer().empty()
        renderSpinner()
        platformContainer().remove()
        genreContainer().remove()
        generateButtonContainer.remove()

        let pageNumber = 1
        let movie = null

        while (!movie) {
            const result = await searchByGenresAndPlatforms(pageNumber)
            if (!result.results.length) {
                break
            }
            const seenMovies = getSeenMovies()
            movie = result.results.find(
                m => !seenMovies.includes(Number(m.id))
            )
            pageNumber++
        }

        if (!movie) {
            appContainer().empty().append(createNoResultsAlert())
            return
        }

        addSeenMovie(movie.id)
        await renderSwipingMechanism(movie)
    })
    appContainer().append(generateButtonContainer)
}

export const renderSpinner = () => {
    const spinner = createSpinner()
    appContainer().append(spinner)
}

export const nextMovie = async () => {
    movieContainer().empty()
    renderSpinner()
    let seenMovies = getSeenMovies()
    let pageNumber = 1
    let movie = null

    while (!movie) {
        const results = (await searchByGenresAndPlatforms(pageNumber)).results
        if (!results.length) break
        movie = results.find(m => !seenMovies.includes(Number(m.id)))
        pageNumber++
    }

    if (!movie) {
        movieContainer().empty()
        movieContainer().append(createNoResultsAlert())
        return
    }

    addSeenMovie(Number(movie.id))
    await renderSwipingMechanism(movie)
}

export const renderMovieSearchResults = async (movies) => {
    favoritePage().removeClass('border-bottom border-5 border-black')
    generatePage().removeClass('border-bottom border-5 border-black')
    appContainer().empty()
    renderSpinner()
    const movieContainer = createButtongroupContainer('movie')
    if (movies.results.length === 0) {
        const noResultsElement = createNoSearchResultsAlert()
        movieContainer.append(noResultsElement)
        appContainer().empty()
        appContainer().append(movieContainer)
        return
    }
    for (const movie of movies.results) {
        const card = await createSearchResultMovieCard(movie)
        movieContainer.append(card)
        card.find(`#detail-button-${movie.id}`).on('click', () => {
            showMovieDetailModal(movie.id)
        }
        )
        if (getFavorites().includes(movie.id)) {
            card.find(`#remove-button-${movie.id}`).on('click', () => {
                removeFromFavorites(movie.id)
                renderMovieSearchResults(movies)
            })
        } else {
            card.find(`#like-button-${movie.id}`).on('click', () => {
                addToFavorites(movie.id)
                renderMovieSearchResults(movies)
            })
        }
    }
    appContainer().empty()
    appContainer().append(movieContainer)
    spinner().remove()
}

export const renderSwipingMechanism = async (movie) => {
    appContainer().empty()
    const movieContainer = createContainer('movie')
    const buttons = createTinderButtons()

    const card = await createTinderCard(movie)
    movieContainer.append(card)
    movieContainer.append(buttons)

    appContainer().append(movieContainer)
    addSeenMovie(movie.id)
    backButton().on('click', () => { init() })
    nextButton().on('click', () => { nextMovie() })
    favoriteButton().on('click', async () => {
        addToFavorites(movie.id)
        await nextMovie()
    })
    spinner().remove()
    window.scrollTo({
        top: 100,
        behavior: 'instant'
    })
}

export const renderFavorites = async () => {
    appContainer().empty()
    renderSpinner()
    const favorites = getFavorites()
    const removeButton = createRemoveAllFavoritesButton()
    const movieContainer = createButtongroupContainer('movie')
    const favoritesContainer = createFavoritesContainer()
    if (favorites.length === 0) {
        const noFavoritesElement = createNoFavoritesAlert()
        movieContainer.append(noFavoritesElement)
    } else {
        for (const movieId of favorites) {
            const movie = await getMovieDetail(movieId)
            const card = createFavoriteMovieCard(movie)

            favoritesContainer.append(card)
            card.find(`#detail-button-${movieId}`).on('click', () => showMovieDetailModal(movieId))
            card.find(`#remove-button-${movieId}`).on('click', () => {
                removeFromFavorites(movieId)
                renderFavorites()
            })
        }
        movieContainer.append(favoritesContainer)
    }
    appContainer().empty()
    appContainer().append(removeButton)
    removeAllFavoritesButton().on('click', () => {
        clearFavorites()
        renderFavorites()
    })
    appContainer().append(movieContainer)
}

export const renderPlatforms = async (platforms, numberOfPlatforms) => {
    const platformContainer = createButtongroupContainer('platform')
    const headingElement = createButtongroupHeading('platform')
    appContainer().append(headingElement)
    if (!platforms?.results?.length) {
        const errorElement = createErrorFetchingAlert('streaming platforms')
        platformContainer.append(errorElement)
        return
    }
    platforms.results.forEach(platform => {
        const region = getRegion()
        if (platform.display_priorities[region] < numberOfPlatforms && platform.display_priorities[region] > 0) {
            const buttonElement = createButtongroupButton(platform.provider_id, platform.provider_name, 'platform')
            buttonElement.on('click', () => {
                buttonElement.blur()
                const extractedId = buttonElement.attr('id').replace('-platform', '')
                const index = selectedPlatforms.indexOf(extractedId)
                if (index == -1) {
                    selectedPlatforms.push(extractedId)
                    buttonElement.removeClass('btn-secondary')
                    buttonElement.addClass('btn-primary')
                } else {
                    selectedPlatforms.splice(index, 1)
                    buttonElement.removeClass('btn-primary')
                    buttonElement.addClass('btn-secondary')
                }

            })
            platformContainer.append(buttonElement)
        }
    });
    appContainer().append(platformContainer)
}

export const init = async () => {
    appContainer().empty()
    renderSpinner()
    renderPlatforms(await getPlatforms(), 50)
    renderGenres(await getGenres())
    renderGenerateButton()
    spinner().remove()
    selectedGenres.splice(0)
    selectedPlatforms.splice(0)
}

searchButton().on('click', async (e) => {
    e.preventDefault()
    searchButton().blur()
    const query = searchText().val()
    renderMovieSearchResults(await searchByText(query))
})

export const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}