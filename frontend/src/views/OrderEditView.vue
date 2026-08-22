<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoadingState from "../components/common/LoadingState.vue";
import OrderForm from "../components/orders/OrderForm.vue";
import { useNotification } from "../composables/useNotification";
import { orderService } from "../services/orderService";

const route = useRoute();
const router = useRouter();
const order = ref(null);
const loading = ref(true);
const submitting = ref(false);
const error = ref("");
const { notify } = useNotification();

async function loadOrder() {
  try {
    order.value = await orderService.get(route.params.id);
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
}

async function updateOrder(payload) {
  submitting.value = true;
  error.value = "";
  try {
    const updated = await orderService.update(route.params.id, payload);
    notify("Đã cập nhật đơn hàng thành công.");
    router.push(`/orders/${updated.id}`);
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    submitting.value = false;
  }
}

onMounted(loadOrder);
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
        Sửa {{ route.params.id }}
      </h1>
      <p class="mb-0 max-w-[680px] text-slate-500">
        Cập nhật khách hàng, sản phẩm và xem giá mặc định.
      </p>
    </div>
  </div>
  <LoadingState v-if="loading" />
  <div
    v-else-if="error && !order"
    class="mb-[18px] rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
  >
    {{ error }}
  </div>
  <template v-else>
    <div
      v-if="error"
      class="mb-[18px] rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
    >
      {{ error }}
    </div>
    <OrderForm
      :order="order"
      :submitting="submitting"
      submit-label="Lưu thay đổi"
      @submit="updateOrder"
      @cancel="router.push(`/orders/${route.params.id}`)"
    />
  </template>
</template>
