<script setup>
defineProps({
  open: Boolean,
  title: { type: String, default: "Xác nhận thao tác" },
  message: { type: String, default: "Bạn có chắc muốn tiếp tục?" },
  busy: Boolean,
});
defineEmits(["confirm", "cancel"]);
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[100] grid place-items-center bg-slate-900/55 p-5 backdrop-blur-[3px]"
    @click.self="$emit('cancel')"
  >
    <section
      class="w-[min(430px,100%)] rounded-[18px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.3)]"
      role="dialog"
      aria-modal="true"
    >
      <h2>{{ title }}</h2>
      <p class="leading-[1.6] text-slate-500">{{ message }}</p>
      <div class="mt-[22px] flex justify-end gap-2.5">
        <button
          class="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-[10px] border border-[#d8d4ce] bg-white px-4 py-2.5 font-bold text-[#333] transition hover:bg-[#f4f1ed] disabled:cursor-not-allowed disabled:opacity-[.55]"
          :disabled="busy"
          @click="$emit('cancel')"
        >
          Hủy
        </button>
        <button
          class="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-[10px] bg-red-100 px-4 py-2.5 font-bold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-[.55]"
          :disabled="busy"
          @click="$emit('confirm')"
        >
          {{ busy ? "Đang xử lý..." : "Xác nhận xóa" }}
        </button>
      </div>
    </section>
  </div>
</template>
