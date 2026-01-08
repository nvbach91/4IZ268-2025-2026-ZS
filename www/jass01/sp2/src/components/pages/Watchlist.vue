<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useCoinsStore } from '../../stores/coins.js';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { convertToCurrency } from '../../helpers/currency.js';
import { useWatchlistStore } from '../../stores/watchlist.js';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useHomeStore } from '../../stores/home.js';
import NotificationModal from '../common/NotificationModal.vue';
import { useConfirm } from 'primevue/useconfirm';

const confirm = useConfirm();
const router = useRouter();
const watchlistStore = useWatchlistStore();
const coinsStore = useCoinsStore();
const toast = useToast();
const homeStore = useHomeStore();

const showNotifModal = ref(false);
const notifCoinData = ref(null);

const { cryptoName, coinData, error } = storeToRefs(homeStore);

const loading = ref(false);
const { lastFetchedIds, storedWatchlist } = storeToRefs(watchlistStore);

// Memoized fetch: only refetch if ids change
async function fetchCoinsData(ids) {
  if (!ids || ids.length === 0) {
    storedWatchlist.value = [];
    lastFetchedIds.value = '';
    return;
  }

  const idsString = ids.join(',');

  // Prevent duplicate fetches
  if (idsString === lastFetchedIds.value) return;
  lastFetchedIds.value = idsString;

  loading.value = true;

  try {
    const res = await fetch(
      `https://crypto-proxy-ivory.vercel.app/api/coins?ids=${encodeURIComponent(idsString)}`
    );

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    storedWatchlist.value = await res.json();
  } catch (err) {
    storedWatchlist.value = [];
    toast.add({
      life: 3000,
      severity: 'error',
      summary: 'Fetch Error',
      detail: 'Failed to fetch watchlist data. Please try again later.'
    });
  } finally {
    loading.value = false;
  }
}


function handleRemove(coinId) {
  coinsStore.toggleWatchlist(coinId);
  toast.add({ life: 3000, severity: 'info', summary: 'Removed', detail: 'Coin removed from watchlist.' });
}

function handleDetails(coinId) {
  cryptoName.value = coinId.replaceAll('-', ' ');
  coinData.value = storedWatchlist.value.filter(c => c.id === coinId);
  error.value = "";

  router.push({ name: 'Home' });
}

const watchlistIds = computed(() => coinsStore.list.filter(c => c.inWatchlist).map(c => c.id));

watch(watchlistIds, (ids) => {
  fetchCoinsData(ids);
}, { immediate: true });


function getNote(coinId) {
  return coinsStore.getNote(coinId) || '';
}

function confirmRemove(event, data) {
  confirm.require({
    target: event.currentTarget,
    message: `Are you sure you want to remove this currency from your watchlist?`,
    icon: 'pi pi-exclamation-triangle',
    acceptProps: {
      severity: 'danger',
      label: 'Remove'
    },
    rejectProps: {
      severity: 'secondary',
      label: 'Cancel',
      class: 'p-button-text'
    },
    accept: () => {
      handleRemove(data.id);

    },
    reject: () => {
      // Do nothing on reject
    }
  });
}

</script>

<template>
  <div class="lg:py-32 py-8">
    <h1 class="text-4xl font-semibold mb-6">Watchlist</h1>
    <DataTable v-if="watchlistIds.length > 0" showGridlines :value="storedWatchlist" :loading="loading" class="w-full" responsiveLayout="scroll">
      <ColumnGroup type="header">
        <Row>
          <Column header="Name" />
          <Column header="Symbol" />
          <Column header="Last Price" />
          <Column header="Market Cap" />
          <Column header="Note" />
          <Column header="Actions"  style="min-width: 180px;" />
        </Row>
      </ColumnGroup>
      <Column field="name" header="Name">
        <template #body="{ data }">
          <div class="flex items-center gap-2 w-max">
            <img :src="data.image" alt="coin image" class="w-6 h-6" />
            <span>
              {{ data.name }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="symbol" header="Symbol">
        <template #body="{ data }">
          {{ data.symbol.toUpperCase() }}
        </template>
      </Column>
      <Column field="current_price" header="Last Price">
        <template #body="{ data }">
          {{ convertToCurrency(data.current_price) }}
        </template>
      </Column>
      <Column field="market_cap" header="Market Cap">
        <template #body="{ data }">
          {{ data.market_cap ? convertToCurrency(data.market_cap) : '-' }}
        </template>
      </Column>
      <Column class="flex-1 w-full" header="Note">
        <template #body="{ data }">
          {{ getNote(data.id) }}
        </template>
      </Column>
      <Column header="Actions" class="flex" style="text-align: right; min-width: 180px;">
        <template #body="{ data }">
          <div class="flex gap-2 justify-end">
            <Button @click="confirmRemove($event, data)" label="Remove" icon="pi pi-trash" severity="danger" size="small" outlined />
            <Button @click="() => {showNotifModal = true; notifCoinData = data}" label="Notify" icon="pi pi-bell" severity="secondary" size="small" outlined />
            <Button @click="() => handleDetails(data.id)" label="Details" icon="pi pi-external-link" severity="primary" size="small" outlined />
          </div>
        </template>
      </Column>
    </DataTable>
    <p v-else>You have no cryptocurrenices in your Watchlist.</p>
  </div>

  <NotificationModal v-if="notifCoinData" :show="showNotifModal" :close="() => showNotifModal = false" :coinData="notifCoinData" />
</template>
