<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import ListItem from './ListItem.vue';
import { convertToCurrency } from '../../helpers/currency.js';
import { useCoinsStore } from '../../stores/coins.js';
import NotificationModal from './NotificationModal.vue';
const { coinData, id, name, symbol, image, currentPrice, marketCap, marketCapRank, dayHigh, dayLow, nextRefresh } = defineProps({
  coinData: Object,
  refresh: Function,
  nextRefresh: Number,
  id: String,
  name: String,
  symbol: String,
  image: String,
  currentPrice: Number,
  marketCap: Number,
  marketCapRank: Number,
  dayHigh: Number,
  dayLow: Number
});

const coinsStore = useCoinsStore();
const showNotifModal = ref(false);
const showEditNoteDialog = ref(false);
const note = ref(coinsStore.getNote(id) || '');
const hasNote = computed(() => {
  return !!coinsStore.getNote(id);
});


const tvContainer = ref(null);
let tvScript = null;

const tradingSymbol = computed(() => {
  // Use BINANCE pair by default
  const s = (symbol || 'BTC').toUpperCase();
  return `BINANCE:${s}USDT`;
});

function clearTvContainer() {
  if (!tvContainer.value) return;
  // Remove everything inside the container to avoid duplicates from prior widget runs
  tvContainer.value.innerHTML = '';
  // Reset any reference to the script we previously appended
  tvScript = null;
}

function mountWidget(symbolStr) {
  if (!tvContainer.value) return;

  // Clear any previous widget contents first
  clearTvContainer();

  // Create the widget inner wrapper (expected by the TradingView script)
  const widgetDiv = document.createElement('div');
  widgetDiv.className = 'tradingview-widget-container__widget';
  widgetDiv.style.height = '500px';
  widgetDiv.style.width = '100%';
  tvContainer.value.appendChild(widgetDiv);

  // Add the copyright / link (make the url dynamic for the current symbol)
  const urlSymbol = symbolStr.replace(':', '-'); // BINANCE:BTCUSDT -> BINANCE-BTCUSDT
  const copyrightDiv = document.createElement('div');
  copyrightDiv.className = 'tradingview-widget-copyright';
  copyrightDiv.innerHTML = `<a href="https://www.tradingview.com/symbols/${urlSymbol}/" rel="noopener nofollow" target="_blank"><span class="blue-text">${symbolStr} chart</span></a><span class="trademark"> by TradingView</span>`;
  tvContainer.value.appendChild(copyrightDiv);

  // Create and append the script the TradingView widget expects, containing JSON config
  tvScript = document.createElement('script');
  tvScript.type = 'text/javascript';
  tvScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
  tvScript.async = true;

  const widgetConfig = {
    "allow_symbol_change": false, // make sure symbol cannot be changed
    "calendar": false,
    "details": false,
    "hide_side_toolbar": true,
    "hide_top_toolbar": false,
    "hide_legend": false,
    "hide_volume": false,
    "hotlist": false,
    "interval": "D",
    "locale": "en",
    "save_image": true,
    "style": "1",
    "symbol": symbolStr, // dynamic symbol based on prop
    "theme": "dark",
    "timezone": "Etc/UTC",
    "backgroundColor": "#0F0F0F",
    "gridColor": "rgba(242, 242, 242, 0.06)",
    "watchlist": [],
    "withdateranges": false,
    "compareSymbols": [],
    "studies": [],
    "autosize": true
  };

  // The external script expects raw JSON within the script tag content
  tvScript.innerHTML = JSON.stringify(widgetConfig);
  tvContainer.value.appendChild(tvScript);
}

function handleSaveNote() {
  coinsStore.setNote(id, note.value);
  showEditNoteDialog.value = false;
}

onMounted(() => {
  mountWidget(tradingSymbol.value);
});

// Recreate widget when symbol prop changes
watch(tradingSymbol, (newSymbol) => {
  mountWidget(newSymbol);
});

watch(showEditNoteDialog, (visible) => {
  if (visible) {
    // When dialog opens, set the note content to current store value
    note.value = coinsStore.getNote(id) || '';
  }
});

onBeforeUnmount(() => {
  clearTvContainer();
});
</script>

<template>
<div class="flex gap-4 lg:h-125 h-auto lg:flex-row flex-col items-stretch">
  <!-- Make the Card fit width (on lg) and stretch height -->
  <Card class="w-full lg:w-fit h-full self-stretch">
    <template #title>
      <div class="flex justify-between">
        <div class="flex gap-4 items-center">
          <img :src="image" :alt="name" class="coin-image w-12" />
          <div class="flex flex-col">
            <h2>{{ name }} ({{ symbol.toUpperCase() }})</h2>
            <span class="text-gray-500 text-sm">Next refresh in: {{ nextRefresh }}s</span>
          </div>
        </div>
        <Button icon="pi pi-sync" title="Refresh now" :disabled="nextRefresh > 55" @click="refresh(id)" severity="secondary" class="p-button-text p-button-sm" />
      </div>
    </template>
  
    <template #content>
      <div class="flex flex-col gap-4 h-full justify-between">
        <ul class="coin-stats flex flex-col gap-2">
          <ListItem label="Current Price" :value="convertToCurrency(currentPrice)" />
          <ListItem label="Market Cap Rank" :value="marketCapRank" />
          <ListItem label="Market Cap" :value="convertToCurrency(marketCap)" />
          <ListItem label="24h High" :value="convertToCurrency(dayHigh)" />
          <ListItem label="24h Low" :value="convertToCurrency(dayLow)" />
        </ul>
  
        <Panel class="flex-1" header="Your note:">
          <template #icons>
            <Button icon="pi pi-pencil" severity="secondary" class="p-button-text p-button-sm" @click="showEditNoteDialog = true" />
          </template>
          <div class="flex flex-col gap-2">
            <p class="wrap-break-word lg:max-w-75 max-h-25 overflow-y-auto">{{ coinsStore.getNote(id) ?? "You don't have a note for this currency." }}</p>
            <Button label="Add note" icon="pi pi-plus" v-if="!hasNote" severity="secondary" class="w-full" @click="showEditNoteDialog = true" />
          </div>

        </Panel>
    
        <div class="flex sm:gap-4 items-center mt-auto sm:justify-end sm:flex-row flex-col gap-2">
          <Button icon="pi pi-bell" severity="secondary" class="sm:w-fit w-full" label="Set notification" @click="showNotifModal = true" />
          <Button class="sm:w-fit w-full" v-if="coinsStore.isInWatchlist(id)" severity="danger" @click="coinsStore.toggleWatchlist(id)" label="Remove from watchlist" icon="pi pi-trash" />
          <Button class="sm:w-fit w-full" v-else severity="primary" @click="coinsStore.toggleWatchlist(id)" label="Add to watchlist" icon="pi pi-plus" />
        </div>
      </div>
    </template>
  </Card>

  <div class="flex lg:flex-1 lg:h-auto h-125 self-stretch min-w-0">
      <!-- TradingView Widget BEGIN -->
      <div
        ref="tvContainer"
        class="tradingview-widget-container w-full lg:h-auto h-125"
      >
        
      </div>
      <!-- TradingView Widget END -->
    </div>
  </div>

  <Dialog class="w-full max-w-125 mx-2" :draggable="false" v-model:visible="showEditNoteDialog" modal :header="hasNote ? `Edit Note for ${name}` : `Add Note for ${name}`" :closable="true">
    <div class="flex flex-col gap-4">
      <Textarea id="noteTextarea" v-model="note" rows="5" autoResize class="w-full" />
      <div class="flex sm:flex-row flex-col-reverse justify-between gap-4">
        <Button label="Delete Note" icon="pi pi-trash" severity="danger" outlined @click="coinsStore.clearNote(id); showEditNoteDialog = false;" :disabled="!hasNote" />
        <div class="flex gap-4 sm:justity-start justify-end">
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showEditNoteDialog = false" />
          <Button label="Save" icon="pi pi-check" severity="primary" @click="() => handleSaveNote()" />
        </div>
      </div>
    </div>
  </Dialog>

  <NotificationModal v-if="showNotifModal" :show="showNotifModal" :close="() => showNotifModal = false" :coinData="coinData" />
</template>

<style>
  .p-card-body {
    height: 100% !important;
  }
  .p-card-content {
    flex: 1 !important; 
  }
</style>