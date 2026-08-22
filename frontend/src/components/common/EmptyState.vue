<script setup>
defineProps({
  title: { type: String, default: "Chưa có dữ liệu" },
  description: {
    type: String,
    default: "Dữ liệu sẽ xuất hiện tại đây khi được tạo.",
  },
});
</script>

<template>
  <div
    class="rounded-[18px] border border-dashed border-slate-300 bg-white px-5 py-[54px] text-center"
  >
    <span class="block text-[2.5rem] text-slate-400">◇</span>
    <h3 class="mb-1.5">{{ title }}</h3>
    <p class="text-slate-500">{{ description }}</p>
    <slot />
  </div>
</template>
