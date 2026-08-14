<script setup>
defineProps({
  open: Boolean,
  title: { type: String, default: 'Xác nhận thao tác' },
  message: { type: String, default: 'Bạn có chắc muốn tiếp tục?' },
  busy: Boolean
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="open" class="dialog-backdrop" @click.self="$emit('cancel')">
    <section class="dialog" role="dialog" aria-modal="true">
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="dialog__actions">
        <button class="button button--ghost" :disabled="busy" @click="$emit('cancel')">Hủy</button>
        <button class="button button--danger" :disabled="busy" @click="$emit('confirm')">
          {{ busy ? 'Đang xử lý...' : 'Xác nhận xóa' }}
        </button>
      </div>
    </section>
  </div>
</template>
