<script setup>
  const {label, value} = defineProps({
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    }
  });
</script>

<template>
  <li class="flex justify-between">
    <strong>{{ label }}:</strong> 
    <span>
      {{ value }}
    </span>
  </li>
</template>