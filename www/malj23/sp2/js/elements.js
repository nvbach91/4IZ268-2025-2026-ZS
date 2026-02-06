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
		loadMoreControls: $('#loadMoreControls'),
		loadingOverlay: $('#loadingOverlay'),
		loadingMessage: $('#loadingMessage'),
		navSearch: $('#navSearch'),
		navWishlist: $('#navWishlist'),
		viewSearch: $('#viewSearch'),
		viewWishlist: $('#viewWishlist'),
		contentPanels: $('.content-panel'),
		wishlistTypeSwitch: $('#wishlistTypeSwitch'),
		wishlistResult: $('#wishlistResult')
	};
})();

