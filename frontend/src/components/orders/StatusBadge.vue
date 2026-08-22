<script setup>
import { statusLabel } from "../../utils/orderStatus";

defineProps({ status: { type: String, required: true } });
</script>

<template>
  <span
    class="inline-flex w-max items-center whitespace-nowrap rounded-full px-[9px] py-[5px] text-[.72rem] font-extrabold"
    :class="{
      'bg-[#ebe8ff] text-[#5148c8]': status === 'PENDING_PURCHASE',
      'bg-[#fff0d6] text-[#8b5e34]': status === 'PURCHASED',
      'bg-[#def4e9] text-[#39715f]': [
        'SHIPPED',
        'SHIPPED_TO_VIETNAM',
        'ARRIVED_IN_VIETNAM',
      ].includes(status),
      'bg-[#ffe4e4] text-[#9b4c58]': status === 'OUT_FOR_DELIVERY',
      'bg-emerald-100 text-emerald-700': status === 'COMPLETED',
    }"
    >{{ statusLabel(status) }}</span
  >
</template>
