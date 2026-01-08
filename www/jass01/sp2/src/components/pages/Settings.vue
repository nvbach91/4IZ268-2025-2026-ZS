<template>
  <div class="lg:py-32 py-8">
    <h1 class="text-4xl font-semibold pb-8">Settings</h1>

    <div class="flex flex-col gap-8">
      <Card>
        <template #title>
          <h2 class="font-semibold text-2xl">Account Settings</h2>
        </template>
        <template #content>
          <p>Configure your application settings here.</p>
          <!-- Add more settings options as needed -->
          <Button label="Delete all user data" class="mt-4 w-full" severity="danger" @click="showDeleteModal = true" icon="pi pi-trash" />
        </template>
      </Card>
      <Card>
        <template #title>
          <h2 class="font-semibold text-2xl">Notifications Settings</h2>
        </template>
        <template #content>
          <p>Manage your notification preferences and settings here.</p>
          <h3 class="font-semibold text-xl mb-2 mt-8">Active Notifications:</h3>
          <div class="flex flex-col gap-4">
            <Panel v-if="notificationsStore.active.length > 0" v-for="notif in notificationsStore.active" :key="notif.id" class="w-full" :header="notif.coinName">
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
  
                  <Button class="w-full mt-4" @click="notificationsStore.removeNotification(notif.id)" icon="pi pi-check-circle" label="Dismiss notification" />
            </Panel>
            <p v-else>No Notifications.</p>

          </div>
  
          <h3 class="font-semibold text-xl mb-2 mt-8">Inactive Notifications:</h3>
          <div class="flex flex-col gap-4">
            <Panel v-if="notificationsStore.inactive.length > 0" v-for="notif in notificationsStore.inactive" :key="notif.id" class="w-full" :header="notif.coinName">
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

                  <Button outlined severity="danger" class="w-full mt-4" @click="confirmDeleteNotif($event, notif.id)" label="Delete notification" icon="pi pi-trash" />
            </Panel>
            <p v-else>No Notifications.</p>
          </div>
        </template>
  
      </Card>
    </div>
  </div>

  <Dialog :visible="showDeleteModal" :modal="true" :closable="false" class="w-full max-w-125 mx-2">
    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Confirm Deletion</h2>
      <p>Are you sure you want to delete all user data? This action cannot be undone.</p>
      <div class="flex gap-4 justify-end mt-4">
        <Button label="Cancel" class="w-24" severity="secondary" outlined @click="showDeleteModal = false" />
        <Button label="Delete" class="w-24" severity="danger" @click="handleDeleteUser" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
  import { ref } from 'vue';

  import { useNotificationsStore } from '../../stores/notifications';
  import { useCoinsStore } from '../../stores/coins';
  import { useConfirm } from 'primevue/useconfirm';



  import { useToast } from 'primevue';

  const toast = useToast();

  const notificationsStore = useNotificationsStore();
  const coinsStore = useCoinsStore();

  import { convertToCurrency } from '../../helpers/currency';

  const confirm = useConfirm();
  const showDeleteModal = ref(false);

  function confirmDeleteNotif(event, id) {
    confirm.require({
      target: event.currentTarget,
      message: `Are you sure you want to delete this notification?`,
      icon: 'pi pi-exclamation-triangle',
      acceptProps: {
        severity: 'danger',
        label: 'Delete'
      },
      rejectProps: {
        severity: 'secondary',
        label: 'Cancel',
        class: 'p-button-text'
      },
      accept: () => {
        notificationsStore.removeNotification(id);
      },
      reject: () => {
        // Do nothing on reject
      }
    });
  }

  function handleDeleteUser() {
    // Clear all user data from localStorage
    try {
      notificationsStore.clearAll();
      coinsStore.clearAll();

      toast.add({ life: 3000, severity: 'success', summary: 'Success', detail: 'All user data has been deleted.' });
    } catch (error) {
      console.error('Error deleting user data:', error);
      toast.add({ life: 3000, severity: 'error', summary: 'Deletion Error', detail: 'An error occurred while deleting user data.' });    
    } finally {
      showDeleteModal.value = false;
    }
  }


</script>

<style scoped>
</style>
