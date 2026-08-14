<script setup>
import { ORDER_STATUSES, statusIndex, statusLabel } from '../../utils/orderStatus'

defineProps({ status: { type: String, required: true } })
</script>

<template>
  <ol class="status-progress">
    <li v-for="(step, index) in ORDER_STATUSES" :key="step" :class="{ active: index <= statusIndex(status), current: step === status }">
      <span>{{ index + 1 }}</span>
      <small>{{ statusLabel(step) }}</small>
    </li>
  </ol>
</template>
