import { defineStore } from "pinia";
import { ref } from "vue";

export const useHomeStore = defineStore("home", () => {
  const cryptoName = ref("");
  const coinData = ref(null);
  const error = ref("");
  const lastFetchedIds = ref("");
  const searchHistory = ref([]);

  /**
   * Load search history from localStorage
   */
  function loadSearchHistory() {
    try {
      const stored = localStorage.getItem("cryptoSearchHistory");
      if (stored) {
        searchHistory.value = JSON.parse(stored);
      }
    } catch (err) {
      console.error("Error loading search history:", err);
      searchHistory.value = [];
    }
  }

  /**
   * Add a cryptocurrency to search history
   * Moves it to front if already exists
   * @param {string} fetchName - The name used for fetching (actual ID)
   * @param {string} displayName - The display name
   * @param {string} image - The image URL
   */
  function addToSearchHistory(fetchName, displayName, image) {
    // Remove if already exists
    const index = searchHistory.value.findIndex(
      (item) => item.fetchName === fetchName
    );
    if (index > -1) {
      searchHistory.value.splice(index, 1);
    }

    // Add to front
    searchHistory.value.unshift({
      fetchName,
      displayName,
      image,
    });

    // Keep only last 10 items
    if (searchHistory.value.length > 10) {
      searchHistory.value.pop();
    }

    // Persist to localStorage
    try {
      localStorage.setItem("cryptoSearchHistory", JSON.stringify(searchHistory.value));
    } catch (err) {
      console.error("Error saving search history:", err);
    }
  }

  /**
   * Clear all search history
   */
  function clearSearchHistory() {
    searchHistory.value = [];
    try {
      localStorage.removeItem("cryptoSearchHistory");
    } catch (err) {
      console.error("Error clearing search history:", err);
    }
  }

  return {
    cryptoName,
    coinData,
    error,
    lastFetchedIds,
    searchHistory,
    loadSearchHistory,
    addToSearchHistory,
    clearSearchHistory,
  };
});
