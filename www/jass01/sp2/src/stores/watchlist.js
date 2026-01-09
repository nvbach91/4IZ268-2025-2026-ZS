import { defineStore } from "pinia";
import { ref } from "vue";

export const useWatchlistStore = defineStore("watchlist", () => {
  const lastFetchedIds = ref("");
  const storedWatchlist = ref([]);

  return {
    lastFetchedIds,
    storedWatchlist,
  };
});
