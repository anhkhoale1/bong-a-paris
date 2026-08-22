<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import OrderForm from "../components/orders/OrderForm.vue";
import { useNotification } from "../composables/useNotification";
import { orderService } from "../services/orderService";

const router = useRouter();
const submitting = ref(false);
const error = ref("");
const { notify } = useNotification();

async function createOrder(payload) {
  submitting.value = true;
  error.value = "";
  try {
    const order = await orderService.create(payload);
    notify("Đã tạo đơn hàng thành công.");
    router.push(`/orders/${order.id}`);
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div
    class="mb-[38px] flex items-start justify-between gap-6 max-[600px]:flex-col max-[600px]:items-stretch"
  >
    <div>
      <p
        class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
      >
        Đơn hàng
      </p>
      <h1
        class="mb-2.5 text-[clamp(2rem,4vw,3.25rem)] font-[850] leading-[1.02] tracking-[-.065em] text-gray-900"
      >
        Tạo đơn mới
      </h1>
      <p class="mb-0 max-w-[680px] text-slate-500">
        Thêm nhiều sản phẩm và xem giá mặc định áp dụng cho khách hàng.
      </p>
    </div>
  </div>
  <div
    v-if="error"
    class="mb-[18px] rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
  >
    {{ error }}
  </div>
  <OrderForm
    :submitting="submitting"
    submit-label="Tạo đơn hàng"
    @submit="createOrder"
    @cancel="router.push('/orders')"
  />
</template>
