// Odkazy na DOM prvky
(() => {
	window.App = window.App || {};
	window.App.elements = {
		loginBtn: $('#loginBtn'),
		searchBtn: $('#searchBtn'),
		artistInput: $('#artistInput'),
		genreSelect: $('#genreSelect'),
		genreInput: $('#genreInput'),
		releaseFromInput: $('#releaseFromInput'),
		releaseToInput: $('#releaseToInput'),
		searchTypeSelect: $('#searchTypeSelect'),
		searchTypeSwitch: $('#searchTypeSwitch'),
		filtersForm: $('#filtersForm'),
		result: $('#result'),
		searchResult: $('#searchResult'),
		artistSuggestions: $('#artistSuggestions'),
		loadMoreBtn: $('#loadMoreBtn'),
		loadingOverlay: $('#loadingOverlay'),
		loadingMessage: $('#loadingMessage')
	};
})();

