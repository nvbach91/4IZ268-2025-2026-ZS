<script setup>

import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import CoinView from '../common/CoinView.vue';
import { storeToRefs } from 'pinia';
import { useHomeStore } from '../../stores/home.js';

const homeStore = useHomeStore();
const { cryptoName, coinData, error } = storeToRefs(homeStore);
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
    const key = import.meta.env.VITE_COINGECKO_API_KEY;
    const query = symbol.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(query)}`;
    const headers = key ? { 'x-cg-api-key': key } : {};
    const res = await fetch(url, { headers });
    if (!res.ok) {
      coinData.value = null;
      return;
    }
    const data = await res.json();
    coinData.value = data;
  } catch (err) {
    console.error('Error fetching CoinGecko:', err);
    toast.add({ life: 3000, severity: 'error', summary: 'Fetch Error', detail: 'An error occurred while fetching data. Too many requests.' });
    coinData.value = null;
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

    // Vite exposes env vars prefixed with VITE_ to the client.
    const key = import.meta.env.VITE_COINGECKO_API_KEY;
    if (!key) {
      console.warn('COINGECKO API key not found on client. Add VITE_COINGECKO_API_KEY to .env if needed.');
      toast.add({ life: 3000, severity: 'warn', summary: 'API Key Missing', detail: 'Proceeding without API key.' });
    }

    if(validated === lastId.value && coinData.value && coinData.value.length > 0) {
      toast.add({ life: 3000, severity: 'info', summary: 'No Change', detail: 'Cryptocurrency data is already loaded.' });
      loading.value = false;
      return;
    }

    await updateCrypto(validated);
    nextRefresh.value = REFRESH_INTERVAL_SECONDS;

    if(!coinData.value || coinData.value.length === 0) {
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

</script>

<template>

  <div class="flex flex-col gap-8 py-32">
    <form @submit.prevent="fetchCrypto" class="flex flex-col gap-8">

      <div class="flex flex-col">
        <label for="crypto">Enter the name of the cryptocurrency you want to look up.</label>
        <InputText v-model="cryptoName" placeholder="BTC" name="crypto" />
      </div>
      
      <Button :loading="loading" class="w-[50%] mx-auto" type="submit" severity="primary" label="Load cryptocurrency" />

    </form>
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