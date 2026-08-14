<script setup>
defineProps({
  title: { type: String, default: 'Chưa có dữ liệu' },
  description: { type: String, default: 'Dữ liệu sẽ xuất hiện tại đây khi được tạo.' }
})
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon">◇</span>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <slot />
  </div>
</template>
