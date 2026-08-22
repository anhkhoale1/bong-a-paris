<script setup>
import { useNotification } from "../../composables/useNotification";

const { notification, dismiss } = useNotification();
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    leave-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-[15px] opacity-0"
    leave-to-class="translate-y-[15px] opacity-0"
  >
    <button
      v-if="notification"
      class="fixed bottom-[22px] right-[22px] z-[150] flex max-w-[min(420px,calc(100vw-32px))] items-center gap-2.5 rounded-[13px] border-0 px-[18px] py-3.5 font-bold text-white shadow-[0_14px_50px_rgba(15,23,42,.25)] transition-colors"
      :class="notification.type === 'error' ? 'bg-red-700' : 'bg-emerald-700'"
      @click="dismiss"
    >
      <span
        class="grid size-[22px] place-items-center rounded-full bg-white/20"
        >{{ notification.type === "success" ? "✓" : "!" }}</span
      >
      {{ notification.message }}
    </button>
  </Transition>
</template>
