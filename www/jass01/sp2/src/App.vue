<script setup>
import { useRouter } from 'vue-router';
import { useNotificationsStore } from './stores/notifications';
import { onMounted, ref } from 'vue';
import { convertToCurrency } from './helpers/currency.js';
import { event } from '@primeuix/themes/aura/timeline';
const notificationsStore = useNotificationsStore();

onMounted(() => {
  notificationsStore.startPriceChecker();
  document.documentElement.classList.add('dark-theme');
});
const checked = ref(true);
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark-theme');
}

const op = ref();
const toggle = (event) => {
  op.value.toggle(event);
}

</script>

<template>
  <div class="app-container md:px-6 px-2">
    <nav class="w-full sm:flex-row flex-col sm:justify-between gap-4 items-center flex py-4">
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-2">
          <i class="pi pi-sun"></i>
          <ToggleSwitch v-model="checked" @change="toggleDarkMode" />
          <i class="pi pi-moon"></i>
        </div>
        <div class="relative">
          <Button outlined type="button" icon="pi pi-bell" label="Notifications" @click="toggle" />
          <div v-if="notificationsStore.active.length > 0" class="absolute -top-3 -right-3 rounded-full bg-red-500 w-6 h-6 flex items-center justify-center">{{ notificationsStore.active.length }}</div>
        </div>
      </div>
      <Popover ref="op">
        <Card>
          <template #title>
            <div class="flex justify-between items-center gap-4">
              <h2 class="m-0">Active Notifications</h2>
              <Button icon="pi pi-times" severity="secondary" class="p-button-text p-button-sm" @click="toggle" />

            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-4">
              <Panel v-if="notificationsStore.active.length > 0" v-for="notif in notificationsStore.active" :key="notif.id" class="w-80" :header="notif.coinName">
                <template #header>
                  <div class="flex gap-4 items-center">
                    <img :src="notif.coinImg" :alt="notif.coinName" class="w-6 h-6" />
                    <span class="font-semibold text-lg">{{ notif.coinName }}</span>
                  </div>
                </template>
                <div class="flex flex-col gap-2">
                  <p class="text-lg font-semibold">{{ notif.title }}</p>
                  <p>{{ notif.description ?? "No description." }}</p>
                  <p><strong>Original Price:</strong> {{ convertToCurrency(notif.currentPrice) }}</p>
                  <div class="flex justify-between gap-2">
                    <p><strong>Price Target:</strong> {{ convertToCurrency(notif.priceTarget) }}</p>
                    <p><strong>Current Price:</strong> {{ convertToCurrency(notif.latestPrice) }}</p>
                  </div>
                </div>

                <Button class="w-full mt-4" @click="notificationsStore.removeNotification(notif.id)" label="Dismiss" icon="pi pi-check-circle" />
              </Panel>
              <p v-else class="text-center">No active notifications.</p>          
            </div>
          </template>
        </Card>
      </Popover>
      <div class="flex gap-4 px-4 text-lg">
        <RouterLink class="hover:underline" to="/">Home</RouterLink>
        <RouterLink class="hover:underline" to="/watchlist">Watchlist</RouterLink>
        <RouterLink class="hover:underline" to="/settings">Settings</RouterLink>
      </div>
    </nav>
    
    <main class="p-4 max-w-450 mx-auto w-full">
      <RouterView />
    </main>
  </div>

  <Toast />
</template>

<style>

</style>
