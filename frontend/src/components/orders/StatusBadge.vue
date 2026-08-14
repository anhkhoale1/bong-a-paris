<script setup>
import { statusLabel } from '../../utils/orderStatus'

defineProps({ status: { type: String, required: true } })
</script>

<template>
  <span class="status-badge" :class="`status-${status.toLowerCase()}`">{{ statusLabel(status) }}</span>
</template>
