<script setup>

import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import CoinView from '../common/CoinView.vue';
import { storeToRefs } from 'pinia';
import { useHomeStore } from '../../stores/home.js';
import { onBeforeMount } from 'vue';

const homeStore = useHomeStore();
const { cryptoName, coinData, error, searchHistory } = storeToRefs(homeStore);
const loading = ref(false);
const lastId = ref('');

const REFRESH_INTERVAL_SECONDS = 60;
const nextRefresh = ref(REFRESH_INTERVAL_SECONDS);
let intervalId = null;

import { onUnmounted, onMounted, onDeactivated } from 'vue';
function startRefreshTimer() {
  if (intervalId) clearInterval(intervalId);
  nextRefresh.value = REFRESH_INTERVAL_SECONDS;
  intervalId = setInterval(() => {
    if (nextRefresh.value > 0) {
      nextRefresh.value--;
    }
    if (nextRefresh.value === 0) {
      if (lastId.value) {
        updateCrypto(lastId.value);
      }
      nextRefresh.value = REFRESH_INTERVAL_SECONDS;
    }
  }, 1000);
}
function stopRefreshTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
onMounted(() => {
  homeStore.loadSearchHistory();
  if(homeStore.searchHistory && homeStore.searchHistory.length > 0) {
    loadFromHistory(homeStore.searchHistory[0]?.fetchName || '');
  }
  if(coinData.value && coinData.value.length > 0) {
    startRefreshTimer();
  }
});
onDeactivated(stopRefreshTimer);
onUnmounted(stopRefreshTimer);

const toast = useToast();

// Regex to match any non-letter characters
const NON_LETTER_REGEX = /[^A-Za-z-]/;

/**
 * Validate and sanitize the cryptoName input.
 * - trims whitespace
 * - removes any non-letter characters
 * - sets `error` and returns null if result empty after sanitization
 * Returns sanitized string or null when invalid.
 */
function validateCryptoName() {
  const raw = cryptoName.value || '';
  const changed = raw.replaceAll(' ', '-'); // allow hyphens as spaces
  const trimmed = changed.trim();

  if (!trimmed) {
    error.value = 'Please enter a cryptocurrency name.';
    toast.add({ life: 3000, severity: 'error', summary: 'Validation Error', detail: error.value });
    return null;
  }

  // If there are non-letter chars, sanitize by removing them
  if (NON_LETTER_REGEX.test(trimmed)) {
    error.value = 'String contains invalid symbols.';
    toast.add({ life: 3000, severity: 'error', summary: 'Validation Error', detail: error.value });
    return null;
  }

  error.value = '';
  return trimmed;
}


async function updateCrypto(symbol) {
  nextRefresh.value = REFRESH_INTERVAL_SECONDS;
  loading.value = true;
  try {
    const query = symbol.toLowerCase();

    const res = await fetch(
      `https://crypto-proxy-ivory.vercel.app/api/coins?ids=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      coinData.value = null;
      return false;
    }
    const data = await res.json();
    coinData.value = data;
    // Add to search history on successful fetch
    if (data && data.length > 0) {
      homeStore.addToSearchHistory(data[0].id, data[0].name, data[0].image);
    }
    return true;
  } catch (err) {
    console.error('Error fetching CoinGecko:', err);
    toast.add({ life: 3000, severity: 'error', summary: 'Fetch Error', detail: 'An error occurred while fetching data. Too many requests. Please wait a little bit' });
    coinData.value = null;

    return false;
  } finally {
    loading.value = false;
    lastId.value = symbol;
  }
}

async function fetchCrypto() {
   // reset countdown on manual fetch
  loading.value = true;
  try {
    // validate/sanitize before making request
    const validated = validateCryptoName();
    if (validated === null) {
      loading.value = false;
      return;
    }

    if(validated === lastId.value && coinData.value && coinData.value.length > 0) {
      toast.add({ life: 3000, severity: 'info', summary: 'No Change', detail: 'Cryptocurrency data is already loaded.' });
      loading.value = false;
      return;
    }

    const valid = await updateCrypto(validated);
    console.log(valid)
    nextRefresh.value = REFRESH_INTERVAL_SECONDS;

    if(!valid) {
      return;
    }
    if((!coinData.value || coinData.value.length === 0)) {
      toast.add({ life: 3000, severity: 'info', summary: 'No Data', detail: 'No cryptocurrency found with that name.' });
      coinData.value = null;
      return;
    } else {
      toast.add({ life: 3000, severity: 'success', summary: 'Success', detail: 'Cryptocurrency data loaded.' });
      // Start the refresh timer after the first successful fetch
      if (!intervalId) {
        startRefreshTimer();
      }
    }
  } catch (err) {
    console.error('Error fetching CoinGecko:', err);
    toast.add({ life: 3000, severity: 'error', summary: 'Fetch Error', detail: 'An error occurred while fetching data.' });
  } finally {
    loading.value = false;
  }
}

/**
 * Load a cryptocurrency from search history
 */
async function loadFromHistory(fetchName) {
  cryptoName.value = fetchName;

  if(fetchName === lastId.value && coinData.value && coinData.value.length > 0) {
    toast.add({ life: 3000, severity: 'info', summary: 'No Change', detail: 'Cryptocurrency data is already loaded.' });
    loading.value = false;
    return;
  }
  const valid = await updateCrypto(fetchName);
  nextRefresh.value = REFRESH_INTERVAL_SECONDS;
  
  if(!valid) {
    return;
  }
  if(!coinData.value || coinData.value.length === 0) {
    toast.add({ life: 3000, severity: 'info', summary: 'No Data', detail: 'No cryptocurrency found with that name.' });
    coinData.value = null;
  } else {
    toast.add({ life: 3000, severity: 'success', summary: 'Success', detail: 'Cryptocurrency data loaded.' });
    if (!intervalId) {
      startRefreshTimer();
    }
  }
}

</script>

<template>

  <div class="flex flex-col gap-8 lg:py-32 py-8">
    <form @submit.prevent="fetchCrypto" class="flex flex-col gap-8">

      <div class="flex flex-col">
        <label for="crypto">Enter the <strong>name</strong> (not symbol) of the cryptocurrency you want to look up.</label>
        <InputText v-model="cryptoName" placeholder="Bitcoin" name="crypto" />
      </div>
      
      <Button :loading="loading" class="w-[50%] mx-auto" type="submit" severity="primary" label="Load cryptocurrency" />

    </form>

    <!-- Search History Section -->
    <div v-if="searchHistory && searchHistory.length > 0" class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Recent Searches</h3>
        <Button
          severity="secondary"
          size="small"
          label="Clear History"
          @click="homeStore.clearSearchHistory"
        />
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="item in searchHistory"
          :key="item.fetchName"
          @click="loadFromHistory(item.fetchName)"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          <img :src="item.image" :alt="item.displayName" class="w-6 h-6" />
          <span class="text-sm font-medium">{{ item.displayName }}</span>
        </button>
      </div>
    </div>

    <CoinView v-if="coinData && coinData.length > 0"
      :nextRefresh="nextRefresh"
      :refresh="updateCrypto"
      :coinData="coinData[0]"
      :id="coinData[0].id"
      :name="coinData[0].name"
      :symbol="coinData[0].symbol"
      :image="coinData[0].image"
      :currentPrice="coinData[0].current_price"
      :marketCap="coinData[0].market_cap"
      :marketCapRank="coinData[0].market_cap_rank"
      :dayHigh="coinData[0].high_24h"
      :dayLow="coinData[0].low_24h"
    />
  </div>
</template>