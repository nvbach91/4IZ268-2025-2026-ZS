import { defineStore } from "pinia";
import { ref } from "vue";

export const useHomeStore = defineStore("home", () => {
  const cryptoName = ref("");
  const coinData = ref(null);
  const error = ref("");
  const lastFetchedIds = ref("");

  return {
    cryptoName,
    coinData,
    error,
    lastFetchedIds,
  };
});
