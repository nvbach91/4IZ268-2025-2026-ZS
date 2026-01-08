// stores/notifications.js
import { defineStore } from "pinia";

const LS_KEY = "coin_notifications_v1";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({
    notifications: loadState(),
    intervalId: null, // store interval handle
  }),

  getters: {
    byCoin: (state) => (coinId) =>
      state.notifications.filter((n) => n.coinId === coinId),

    active: (state) => state.notifications.filter((n) => n.active === true),

    inactive: (state) => state.notifications.filter((n) => !n.active),

    byCoin: (state) => (coinId) =>
      state.notifications.filter((n) => n.coinId === coinId),
  },

  actions: {
    // ------------------------------------------
    // CRUD
    // ------------------------------------------

    addNotification({
      coinId,
      coinName,
      coinImg,
      priceTarget,
      currentPrice,
      title,
      description,
    }) {
      if (!coinId) throw new Error("coinId required");
      if (!title) throw new Error("title required");

      const notif = {
        id: uid(),
        coinId,
        coinName,
        coinImg,
        priceTarget,
        currentPrice,
        title,
        description,
        latestPrice: currentPrice,
        createdAt: new Date().toISOString(),
        active: false, // default inactive
      };

      this.notifications.push(notif);
      saveState(this.notifications);

      return notif;
    },

    updateNotification(id, patch) {
      const notif = this.notifications.find((n) => n.id === id);
      if (!notif) return null;

      Object.assign(notif, patch, { updatedAt: new Date().toISOString() });
      saveState(this.notifications);
      return notif;
    },

    removeNotification(id) {
      const before = this.notifications.length;
      this.notifications = this.notifications.filter((n) => n.id !== id);
      const changed = before !== this.notifications.length;

      if (changed) saveState(this.notifications);
      return changed;
    },

    clearAll() {
      this.notifications = [];
      saveState(this.notifications);
    },

    // ------------------------------------------
    // PRICE CHECKING MECHANICS
    // ------------------------------------------

    async checkPrices() {
      // No notifications -> nothing to do
      if (this.notifications.length === 0) return;

      // Collect unique coin IDs
      const ids = [...new Set(this.notifications.map(n => n.coinId))];
      const idsString = ids.join(',');

      try {
        const res = await fetch(
          `https://crypto-proxy-ivory.vercel.app/api/coins?ids=${encodeURIComponent(idsString)}`
        );

        if (!res.ok) return;

        const data = await res.json(); // array of coin objects

        // Create lookup: coinId -> current_price
        const priceMap = {};
        for (const coin of data) {
          priceMap[coin.id] = coin.current_price;
        }

        // Evaluate each notification
        for (const notif of this.notifications) {
          const current = priceMap[notif.coinId];
          if (current == null) continue;

          const target = notif.priceTarget;
          const original = notif.currentPrice;

          // Target reached (up or down)
          if (
            (target > original && current >= target) ||
            (target < original && current <= target)
          ) {
            notif.active = true;
          }

          notif.latestPrice = current;
        }

        saveState(this.notifications);
      } catch (err) {
        console.error('Price checking failed:', err);
      }
    },

    // ------------------------------------------
    // INTERVAL CONTROL
    // ------------------------------------------

    startPriceChecker() {
      if (this.intervalId) return; // Prevent double intervals

      // Run immediately once
      this.checkPrices();

      // Then run every 1 minute
      this.intervalId = setInterval(() => {
        this.checkPrices();
      }, 60 * 1000);
    },

    stopPriceChecker() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },
  },
});
