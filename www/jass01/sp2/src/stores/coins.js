// stores/coins.js
import { defineStore } from "pinia";

const LS_KEY = "coins_store_v1";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export const useCoinsStore = defineStore("coins", {
  state: () => ({
    coins: loadState(), // { coinId: { inWatchlist, note } }
  }),

  getters: {
    list: (state) =>
      Object.entries(state.coins).map(([id, data]) => ({ id, ...data })),
    isInWatchlist: (state) => (id) => !!state.coins[id]?.inWatchlist,
    getNote: (state) => (coinId) => state.coins[coinId]?.note || null,
  },

  actions: {
    ensureCoin(id) {
      if (!id) throw new Error("coinId is required");

      if (!this.coins[id]) {
        this.coins[id] = {
          inWatchlist: false,
          note: "",
        };
        saveState(this.coins);
      }

      return this.coins[id];
    },

    toggleWatchlist(id) {
      const coin = this.ensureCoin(id);
      coin.inWatchlist = !coin.inWatchlist;
      saveState(this.coins);
      return coin.inWatchlist;
    },

    setNote(id, text) {
      const coin = this.ensureCoin(id);
      coin.note = text;
      saveState(this.coins);
    },

    clearNote(id) {
      const coin = this.ensureCoin(id);
      coin.note = null;
      saveState(this.coins);
    },

    removeCoin(id) {
      if (!this.coins[id]) return false;
      delete this.coins[id];
      saveState(this.coins);
      return true;
    },

    clearAll() {
      this.coins = {};
      saveState(this.coins);
    },
  },
});
