<template>
  <Dialog
    class="mx-2 w-full max-w-125"
    :visible="props.show"
    :draggable="false"
    modal
    :header="`Set a notification for ${coinData.name} `"
    @update:visible="props.close"
  >
    <div class="flex flex-col gap-4 mt-4">
      <div class="flex flex-col">
        <label for="priceThreshold">Price Threshold: *</label>
        <InputNumber :minFractionDigits="2" :maxFractionDigits="10" id="priceThreshold" v-model="priceTarget" mode="currency" currency="USD" locale="en-US" class="w-full" :placeholder="`$${coinData.current_price}`" />
      </div>

      <div class="flex flex-col">
        <label for="title">Title: *</label>
        <InputText placeholder="Buy Alert" id="title" v-model="title" type="text" class="w-full" />
      </div>

      <div class="flex flex-col">
        <label for="desc">Description:</label>
        <Textarea placeholder="Buy now, reached target price." id="desc" v-model="desc" rows="4" autoResize class="w-full" />
      </div>

      <Button label="Save Notification" icon="pi pi-check" severity="primary" @click="handleSaveNotification" />
    </div>
  </Dialog>
</template>

<script setup>
  import { ref } from 'vue';
  import { useNotificationsStore } from '../../stores/notifications';
  import { useToast } from 'primevue';
  import { convertToCurrency } from '../../helpers/currency';

  const toast = useToast();
  const notificationsStore = useNotificationsStore();

  const props = defineProps({
    show: Boolean,
    close: Function,
    coinData: Object
  });

  const priceTarget = ref(null);
  const title = ref('');
  const desc = ref('');

  function handleSaveNotification() {
    if (!priceTarget.value || !title.value) {
      toast.add({ life: 3000, severity: 'warn', summary: 'Missing Fields', detail: 'Please fill in the required fields: Price Threshold and Title.' });
      return;
    }

    const notif = notificationsStore.addNotification({
      coinId: props.coinData.id,
      coinName: props.coinData.name,
      coinImg: props.coinData.image,
      priceTarget: priceTarget.value,
      currentPrice: props.coinData.current_price,
      title: title.value,
      description: desc.value
    });


    if(notif) {
      toast.add({ life: 3000, severity: 'success', summary: 'Notification Saved', detail: `Notification for ${props.coinData.name} at ${convertToCurrency(priceTarget.value)} saved.` });
    } else {
      toast.add({ life: 3000, severity: 'error', summary: 'Save Failed', detail: 'Failed to save notification. Please try again.' });
    }

    // Reset fields
    priceTarget.value = null;
    title.value = '';
    desc.value = '';

    
    // Close modal
    props.close();
  }

</script>
