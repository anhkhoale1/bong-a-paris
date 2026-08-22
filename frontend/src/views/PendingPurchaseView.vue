<script setup>
import { onMounted, ref } from "vue";
import EmptyState from "../components/common/EmptyState.vue";
import LoadingState from "../components/common/LoadingState.vue";
import StatusBadge from "../components/orders/StatusBadge.vue";
import { useNotification } from "../composables/useNotification";
import { orderService } from "../services/orderService";
import { formatDate } from "../utils/date";

const orders = ref([]);
const loading = ref(true);
const error = ref("");
const updatingId = ref("");
const { notify } = useNotification();

async function loadOrders() {
  loading.value = true;
  error.value = "";
  try {
    orders.value = await orderService.list({ status: "PENDING_PURCHASE" });
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
}

async function markAsPurchased(order) {
  updatingId.value = order.id;
  try {
    await orderService.updateStatus(order.id, "PURCHASED");
    orders.value = orders.value.filter((item) => item.id !== order.id);
    notify(`Đơn ${order.id} đã chuyển sang Đã mua.`);
  } catch (requestError) {
    notify(requestError.message, "error");
  } finally {
    updatingId.value = "";
  }
}

onMounted(loadOrders);
</script>

<template>
  <div
    class="mb-[38px] flex items-start justify-between gap-6 max-[600px]:flex-col max-[600px]:items-stretch"
  >
    <div>
      <p
        class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
      >
        Chuẩn bị mua hàng
      </p>
      <h1
        class="mb-2.5 text-[clamp(2rem,4vw,3.25rem)] font-[850] leading-[1.02] tracking-[-.065em] text-gray-900"
      >
        Sản phẩm chưa mua
      </h1>
      <p class="mb-0 max-w-[680px] text-slate-500">
        Các sản phẩm trong những đơn hàng đã tạo nhưng chưa được mua.
      </p>
    </div>
    <RouterLink
      class="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-[10px] border border-[#c7c0ff] bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff] max-[600px]:w-full"
      to="/orders"
      >
      Xem tất cả đơn hàng
    </RouterLink
    >
  </div>

  <LoadingState v-if="loading" />
  <div
    v-else-if="error"
    class="mb-[18px] rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
  >
    {{ error }}
    <button
      class="cursor-pointer border-0 bg-transparent p-0 font-[750] text-[#5148c8] hover:underline"
      @click="loadOrders"
    >
      Thử lại
    </button>
  </div>
  <EmptyState
    v-else-if="!orders.length"
    title="Không còn sản phẩm chưa mua"
    description="Mọi đơn hàng hiện tại đã được đánh dấu là đã mua."
  >
    <RouterLink
      class="inline-flex min-h-[42px] cursor-pointer items-center rounded-[10px] bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff]"
      to="/orders/create"
      >Tạo đơn hàng</RouterLink
    >
  </EmptyState>
  <section v-else class="grid gap-5">
    <article
      v-for="order in orders"
      :key="order.id"
      class="mb-0 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)] max-[600px]:rounded-[15px] max-[600px]:p-[17px]"
    >
      <div
        class="flex items-start justify-between gap-5 max-[600px]:flex-col max-[600px]:items-stretch"
      >
        <div>
          <p
            class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
          >
            {{ order.id }} · {{ formatDate(order.createdAt) }}
          </p>
          <h2 class="mb-4 text-[1.2rem] text-gray-900">
            {{ order.customerName }}
          </h2>
        </div>
        <button
          class="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-[10px] bg-[#def4e9] px-4 py-2.5 font-bold text-[#2f6f55] transition hover:-translate-y-px hover:bg-[#c9eadb] disabled:cursor-not-allowed disabled:opacity-[.55]"
          :disabled="updatingId === order.id"
          @click="markAsPurchased(order)"
        >
          {{ updatingId === order.id ? "Đang cập nhật..." : "Đánh dấu đã mua" }}
        </button>
      </div>

      <div class="mt-[18px] w-full overflow-x-auto max-[820px]:hidden">
        <table
          class="w-full border-collapse [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-[#edf0f5] [&_td]:px-3.5 [&_td]:py-3 [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-[#edf0f5] [&_th]:px-3.5 [&_th]:py-3 [&_th]:text-left [&_th]:text-[.72rem] [&_th]:uppercase [&_th]:tracking-[.05em] [&_th]:text-slate-500"
        >
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Nơi mua</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="item.id">
              <td>
                <strong>{{ item.productName }}</strong>
              </td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.purchaseLocation || "Chưa có nơi mua" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>
