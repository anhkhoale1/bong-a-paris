<script setup>
import { useNotification } from '../../composables/useNotification'

const { notification, dismiss } = useNotification()
</script>

<template>
  <Transition name="toast">
    <button v-if="notification" class="toast" :class="`toast--${notification.type}`" @click="dismiss">
      <span>{{ notification.type === 'success' ? '✓' : '!' }}</span>
      {{ notification.message }}
    </button>
  </Transition>
</template>
