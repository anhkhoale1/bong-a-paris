<script setup>
import { computed, onMounted, ref } from "vue";
import EmptyState from "../components/common/EmptyState.vue";
import LoadingState from "../components/common/LoadingState.vue";
import StatusBadge from "../components/orders/StatusBadge.vue";
import { dashboardService } from "../services/dashboardService";
import { formatCurrency } from "../utils/currency";
import { formatDate, formatMonth } from "../utils/date";
import { statusLabel } from "../utils/orderStatus";

const summary = ref(null);
const loading = ref(true);
const error = ref("");
const maxMonthlyRevenue = computed(() =>
  Math.max(
    ...(summary.value?.monthlyRevenue.map((item) => item.totalRevenue) || [1]),
    1,
  ),
);

async function loadSummary() {
  loading.value = true;
  error.value = "";
  try {
    summary.value = await dashboardService.summary();
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
}

const monthlyProfit = (month) =>
  summary.value.monthlyProfit.find((item) => item.month === month)
    ?.totalProfit || 0;
onMounted(loadSummary);
</script>

<template>
  <div
    class="mb-[38px] flex items-start justify-between gap-6 max-[600px]:flex-col max-[600px]:items-stretch"
  >
    <div>
      <p
        class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
      >
        Tổng quan
      </p>
      <h1
        class="mb-2.5 text-[clamp(2rem,4vw,3.25rem)] font-[850] leading-[1.02] tracking-[-.065em] text-gray-900"
      >
        Dashboard
      </h1>
      <p class="mb-0 max-w-[680px] text-slate-500">
        Theo dõi hiệu quả bán hàng.
      </p>
    </div>
    <button
      class="inline-flex min-h-[42px] items-center justify-center gap-[7px] rounded-[10px] border border-[#d8d4ce] bg-white px-4 py-2.5 font-bold text-[#333] transition hover:bg-[#f4f1ed]"
      @click="loadSummary"
    >
      Làm mới
    </button>
  </div>
  <LoadingState v-if="loading" />
  <div
    v-else-if="error"
    class="mb-[18px] rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
  >
    {{ error }}
    <button
      class="cursor-pointer border-0 bg-transparent p-0 font-[750] text-[#5148c8] hover:underline"
      @click="loadSummary"
    >
      Thử lại
    </button>
  </div>
  <template v-else>
    <section
      class="mb-5 grid grid-cols-4 gap-3.5 max-[1180px]:grid-cols-2 max-[600px]:grid-cols-1"
    >
      <article
        class="min-h-[132px] rounded-2xl border border-[#cfe0f7] bg-[#eef6ff] p-5 shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <span class="block text-[.85rem] font-[650] text-slate-500"
          >Tổng đơn hàng</span
        ><strong class="my-2.5 mb-1 block text-[1.75rem] text-gray-900">{{
          summary.totalOrders
        }}</strong
        ><small class="text-slate-400"
          >{{ summary.pendingOrders }} đơn đang xử lý</small
        >
      </article>
      <article
        class="min-h-[132px] rounded-2xl border border-[#f3dfbd] bg-[#fff6e8] p-5 shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <span class="block text-[.85rem] font-[650] text-slate-500"
          >Chưa hoàn thành</span
        ><strong class="my-2.5 mb-1 block text-[1.75rem] text-gray-900">{{
          summary.pendingOrders
        }}</strong
        ><small class="text-slate-400">Cần tiếp tục theo dõi</small>
      </article>
      <article
        class="min-h-[132px] rounded-2xl border border-[#c9eadb] bg-[#effaf4] p-5 shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <span class="block text-[.85rem] font-[650] text-slate-500"
          >Đã hoàn thành</span
        ><strong class="my-2.5 mb-1 block text-[1.75rem] text-gray-900">{{
          summary.completedOrders
        }}</strong
        ><small class="text-slate-400">Đơn đã giao thành công</small>
      </article>
      <article
        class="min-h-[132px] rounded-2xl border border-[#ddd8ff] bg-[#f5f2ff] p-5 shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <span class="block text-[.85rem] font-[650] text-slate-500"
          >Sản phẩm</span
        ><strong class="my-2.5 mb-1 block text-[1.75rem] text-gray-900">{{
          summary.totalProducts
        }}</strong
        ><small class="text-slate-400">Trong danh mục</small>
      </article>
      <article
        class="min-h-[132px] rounded-2xl border border-[#e7e4df] bg-[#f5f2ff] p-5 shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <span class="block text-[.85rem] font-[650] text-slate-500"
          >Tổng doanh thu</span
        ><strong class="my-2.5 mb-1 block text-[1.3rem] text-gray-900">{{
          formatCurrency(summary.totalRevenue)
        }}</strong>
      </article>
      <article
        class="min-h-[132px] rounded-2xl border border-[#e7e4df] bg-[#f5f2ff] p-5 shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <span class="block text-[.85rem] font-[650] text-slate-500"
          >Tổng vốn</span
        ><strong class="my-2.5 mb-1 block text-[1.3rem] text-gray-900">{{
          formatCurrency(summary.totalCost)
        }}</strong>
      </article>
      <article
        class="min-h-[132px] rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <span class="block text-[.85rem] font-[650] text-slate-500"
          >Tổng lợi nhuận</span
        ><strong class="my-2.5 mb-1 block text-[1.3rem] text-emerald-700">{{
          formatCurrency(summary.totalProfit)
        }}</strong>
      </article>
    </section>

    <div class="grid grid-cols-[1.35fr_1fr] gap-5 max-[1180px]:grid-cols-1">
      <section
        class="mb-5 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <div class="flex items-start justify-between gap-5">
          <div>
            <p
              class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
            >
              Gần đây
            </p>
            <h2 class="mb-0 text-[1.2rem] text-gray-900">5 đơn mới nhất</h2>
          </div>
          <RouterLink
            class="cursor-pointer border-0 bg-transparent p-0 font-[750] text-[#5148c8] hover:underline"
            to="/orders"
            >Xem tất cả</RouterLink
          >
        </div>
        <EmptyState v-if="!summary.recentOrders.length" />
        <div v-else class="grid">
          <RouterLink
            v-for="order in summary.recentOrders"
            :key="order.id"
            :to="`/orders/${order.id}`"
            class="flex items-center justify-between gap-[15px] border-b border-[#edf0f5] py-3.5 last:border-0 max-[600px]:items-start"
            ><div>
              <strong>{{ order.customerName }}&nbsp;</strong
              ><small class="text-slate-500">{{
                formatDate(order.createdAt)
              }}</small>
            </div>
            <div class="grid justify-items-end gap-1.5">
              <strong>{{ formatCurrency(order.totalRevenue) }}</strong
              ><StatusBadge :status="order.status" /></div
          ></RouterLink>
        </div>
      </section>

      <section
        class="mb-5 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <p
          class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
        >
          Phân bổ
        </p>
        <h2 class="text-[1.2rem] text-gray-900">Đơn theo trạng thái</h2>
        <div class="grid gap-[13px]">
          <div
            v-for="item in summary.ordersByStatus"
            :key="item.status"
            class="flex items-center justify-between"
          >
            <span><StatusBadge :status="item.status" /></span
            ><strong class="text-[1.15rem]">{{ item.count }}</strong>
          </div>
        </div>
      </section>
    </div>

    <div class="grid grid-cols-[1.35fr_1fr] gap-5 max-[1180px]:grid-cols-1">
      <section
        class="mb-5 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <p
          class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
        >
          Tài chính
        </p>
        <h2 class="text-[1.2rem] text-gray-900">
          Doanh thu và lợi nhuận theo tháng
        </h2>
        <EmptyState v-if="!summary.monthlyRevenue.length" />
        <div v-else class="grid gap-[18px]">
          <div
            v-for="item in summary.monthlyRevenue"
            :key="item.month"
            class="grid items-center gap-3.5 text-[.85rem] [grid-template-columns:105px_minmax(90px,1fr)_minmax(135px,auto)] max-[600px]:grid-cols-1 max-[600px]:gap-1.5"
          >
            <span>{{ formatMonth(item.month) }}</span>
            <div class="h-2.5 overflow-hidden rounded-[20px] bg-[#ebe8ff]">
              <i
                class="block h-full rounded-[inherit] bg-[#756bea]"
                :style="{
                  width: `${(item.totalRevenue / maxMonthlyRevenue) * 100}%`,
                }"
              ></i>
            </div>
            <div>
              <strong>{{ formatCurrency(item.totalRevenue) }}</strong
              ><small
                >Lãi {{ formatCurrency(monthlyProfit(item.month)) }}</small
              >
            </div>
          </div>
        </div>
      </section>

      <section
        class="mb-5 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <p
          class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
        >
          Hiệu quả
        </p>
        <h2 class="text-[1.2rem] text-gray-900">Top sản phẩm theo doanh thu</h2>
        <EmptyState v-if="!summary.topProducts.length" />
        <ol v-else class="m-0 grid list-none p-0">
          <li
            v-for="(product, index) in summary.topProducts"
            :key="product.productId"
            class="grid items-center gap-3 border-b border-[#edf0f5] py-[13px] [grid-template-columns:30px_1fr_auto] max-[600px]:grid-cols-[30px_1fr]"
          >
            <span
              class="grid size-7 place-items-center rounded-full bg-[#ebe8ff] font-extrabold text-[#5148c8]"
              >{{ index + 1 }}</span
            >
            <div>
              <strong>{{ product.productName }}</strong
              ><small class="mt-[3px] block text-slate-500"
                >{{ product.quantity }} sản phẩm đã bán</small
              >
            </div>
            <strong class="max-[600px]:col-start-2">{{
              formatCurrency(product.totalRevenue)
            }}</strong>
          </li>
        </ol>
      </section>
    </div>
  </template>
</template>
