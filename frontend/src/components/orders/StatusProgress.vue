<script setup>
import {
  ORDER_STATUSES,
  statusIndex,
  statusLabel,
} from "../../utils/orderStatus";

defineProps({ status: { type: String, required: true } });
</script>

<template>
  <ol
    class="my-[30px] mb-1.5 grid list-none grid-cols-4 p-0 max-[600px]:flex max-[600px]:w-[650px] max-[600px]:origin-top-left max-[600px]:scale-75 max-[600px]:items-start max-[600px]:mb-[-20px]"
  >
    <li
      v-for="(step, index) in ORDER_STATUSES"
      :key="step"
      class="relative grid justify-items-center gap-2 text-center text-slate-400 before:absolute before:right-1/2 before:top-[15px] before:z-0 before:h-[3px] before:w-full before:bg-slate-200 before:content-[''] first:before:hidden max-[600px]:w-[130px] max-[820px]:[&>small]:text-[.63rem]"
      :class="{
        'text-[#5148c8]': index <= statusIndex(status),
        'before:bg-[#a8a0f2]': index > 0 && index <= statusIndex(status),
        current: step === status,
      }"
    >
      <span
        class="relative z-10 grid size-8 place-items-center rounded-full border-[3px] border-slate-200 bg-white text-xs font-extrabold"
        :class="{
          '!border-[#756bea] !bg-[#756bea] !text-white':
            index <= statusIndex(status),
          'shadow-[0_0_0_5px_#ebe8ff]': step === status,
        }"
      >
        <svg
          v-if="
            index < statusIndex(status) ||
            (step === 'COMPLETED' && step === status)
          "
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          aria-hidden="true"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
        <svg
          v-else-if="index === statusIndex(status)"
          class="size-3.5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
        </svg>
        <template v-else>{{ index + 1 }}</template>
      </span>
      <small>{{ statusLabel(step) }}</small>
    </li>
  </ol>
</template>
