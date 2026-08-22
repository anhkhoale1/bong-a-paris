<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ConfirmDialog from "../components/common/ConfirmDialog.vue";
import LoadingState from "../components/common/LoadingState.vue";
import StatusBadge from "../components/orders/StatusBadge.vue";
import StatusProgress from "../components/orders/StatusProgress.vue";
import { useNotification } from "../composables/useNotification";
import { orderService } from "../services/orderService";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";
import { ORDER_STATUSES, statusLabel } from "../utils/orderStatus";

const route = useRoute();
const router = useRouter();
const order = ref(null);
const loading = ref(true);
const error = ref("");
const selectedStatus = ref("");
const updatingStatus = ref(false);
const confirmDelete = ref(false);
const deleting = ref(false);
const { notify } = useNotification();

async function loadOrder() {
  try {
    order.value = await orderService.get(route.params.id);
    selectedStatus.value = order.value.status;
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
}

async function updateStatus() {
  updatingStatus.value = true;
  try {
    order.value = await orderService.updateStatus(
      order.value.id,
      selectedStatus.value,
    );
    notify("Đã cập nhật trạng thái đơn hàng.");
  } catch (requestError) {
    notify(requestError.message, "error");
    selectedStatus.value = order.value.status;
  } finally {
    updatingStatus.value = false;
  }
}

async function removeOrder() {
  deleting.value = true;
  try {
    await orderService.remove(order.value.id);
    notify("Đã xóa đơn hàng thành công.");
    router.push("/orders");
  } catch (requestError) {
    notify(requestError.message, "error");
    deleting.value = false;
  }
}

onMounted(loadOrder);
</script>

<template>
  <LoadingState v-if="loading" />
  <div
    v-else-if="error"
    class="mb-[18px] rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
  >
    {{ error }}
  </div>
  <template v-else>
    <div
      class="mb-[38px] flex items-start justify-between gap-6 max-[600px]:flex-col max-[600px]:items-stretch"
    >
      <div>
        <p
          class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
        >
          Chi tiết đơn hàng
        </p>
        <h1
          class="mb-2.5 text-[clamp(2rem,4vw,3.25rem)] font-[850] leading-[1.02] tracking-[-.065em] text-gray-900"
        >
          {{ order.id }}
        </h1>
        <div class="flex items-center gap-3 text-slate-500">
          <StatusBadge :status="order.status" /><span
            >Tạo {{ formatDate(order.createdAt) }}</span
          >
        </div>
      </div>
      <div class="flex flex-wrap gap-[7px]">
        <RouterLink
          class="inline-flex min-h-[42px] cursor-pointer items-center rounded-[10px] border border-[#c7c0ff] bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff]"
          :to="`/orders/${order.id}/edit`"
          >Sửa đơn</RouterLink
        ><button
          class="inline-flex min-h-[42px] cursor-pointer items-center rounded-[10px] bg-red-100 px-4 py-2.5 font-bold text-red-700 transition hover:-translate-y-px hover:bg-red-200"
          @click="confirmDelete = true"
        >
          Xóa đơn
        </button>
      </div>
    </div>

    <section
      class="mb-5 overflow-hidden rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)] max-[600px]:rounded-[15px] max-[600px]:p-[17px]"
    >
      <div
        class="flex items-start justify-between gap-5 max-[600px]:flex-col max-[600px]:items-stretch"
      >
        <div>
          <p
            class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
          >
            Tiến trình
          </p>
          <h2 class="mb-0 text-[1.2rem] text-gray-900">Trạng thái đơn hàng</h2>
        </div>
        <div
          class="flex gap-2.5 max-[600px]:grid max-[600px]:grid-cols-[1fr_auto]"
        >
          <select
            class="min-h-[43px] w-full min-w-[215px] rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff] max-[600px]:min-w-0"
            v-model="selectedStatus"
          >
            <option
              v-for="status in ORDER_STATUSES"
              :key="status"
              :value="status"
            >
              {{ statusLabel(status) }}
            </option></select
          ><button
            class="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-[10px] bg-[#756bea] px-4 py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-[#5b50d6] disabled:cursor-not-allowed disabled:opacity-[.55]"
            :disabled="updatingStatus || selectedStatus === order.status"
            @click="updateStatus"
          >
            {{ updatingStatus ? "Đang lưu..." : "Cập nhật" }}
          </button>
        </div>
      </div>
      <StatusProgress :status="order.status" />
    </section>

    <div class="grid grid-cols-[1.35fr_1fr] gap-5 max-[1180px]:grid-cols-1">
      <section
        class="mb-5 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <p
          class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
        >
          Khách hàng
        </p>
        <h2 class="text-[1.2rem] text-gray-900">{{ order.customerName }}</h2>
        <dl class="m-0 grid gap-[13px]">
          <div class="grid gap-2.5 [grid-template-columns:145px_1fr]">
            <dt class="text-slate-500">Số điện thoại</dt>
            <dd class="m-0 font-[650]">{{ order.customerPhone || "—" }}</dd>
          </div>
          <div class="grid gap-2.5 [grid-template-columns:145px_1fr]">
            <dt class="text-slate-500">Địa chỉ</dt>
            <dd class="m-0 font-[650]">{{ order.customerAddress }}</dd>
          </div>
          <div class="grid gap-2.5 [grid-template-columns:145px_1fr]">
            <dt class="text-slate-500">Ghi chú</dt>
            <dd class="m-0 font-[650]">
              {{ order.note || "Không có ghi chú" }}
            </dd>
          </div>
        </dl>
      </section>
      <section
        class="mb-5 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)]"
      >
        <p
          class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
        >
          Thời gian
        </p>
        <h2 class="text-[1.2rem] text-gray-900">Lịch sử đơn</h2>
        <dl class="m-0 grid gap-[13px]">
          <div class="grid gap-2.5 [grid-template-columns:145px_1fr]">
            <dt class="text-slate-500">Ngày tạo</dt>
            <dd class="m-0 font-[650]">{{ formatDate(order.createdAt) }}</dd>
          </div>
          <div class="grid gap-2.5 [grid-template-columns:145px_1fr]">
            <dt class="text-slate-500">Cập nhật gần nhất</dt>
            <dd class="m-0 font-[650]">{{ formatDate(order.updatedAt) }}</dd>
          </div>
          <div class="grid gap-2.5 [grid-template-columns:145px_1fr]">
            <dt class="text-slate-500">Hoàn thành</dt>
            <dd class="m-0 font-[650]">{{ formatDate(order.completedAt) }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <section
      class="mb-5 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)] max-[600px]:rounded-[15px] max-[600px]:p-[17px]"
    >
      <div>
        <p
          class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
        >
          Sản phẩm
        </p>
        <h2 class="text-[1.2rem] text-gray-900">
          {{ order.items.length }} loại sản phẩm
        </h2>
      </div>
      <div class="w-full overflow-x-auto max-[820px]:hidden">
        <table
          class="w-full border-collapse [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-[#edf0f5] [&_td]:px-3.5 [&_td]:py-3 [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-[#edf0f5] [&_th]:px-3.5 [&_th]:py-3 [&_th]:text-left [&_th]:text-[.72rem] [&_th]:uppercase [&_th]:tracking-[.05em] [&_th]:text-slate-500"
        >
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SL</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Nơi nhập</th>
              <th>Tổng vốn</th>
              <th>Doanh thu</th>
              <th>Lợi nhuận</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="item.id">
              <td>
                <strong>{{ item.productName }}</strong>
              </td>
              <td>{{ item.quantity }}</td>
              <td>{{ formatCurrency(item.purchasePrice) }}</td>
              <td>{{ formatCurrency(item.salePrice) }}</td>
              <td>{{ item.purchaseLocation || "—" }}</td>
              <td>{{ formatCurrency(item.lineCost) }}</td>
              <td>{{ formatCurrency(item.lineRevenue) }}</td>
              <td>
                <strong class="text-emerald-600">{{
                  formatCurrency(item.lineProfit)
                }}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="hidden max-[820px]:block">
        <article
          v-for="item in order.items"
          :key="item.id"
          class="border-b border-[#e8ebf1] p-4 last:border-0"
        >
          <div class="flex gap-3">
            <div>
              <h3 class="mb-1.5">{{ item.productName }}</h3>
              <p>{{ item.quantity }} × {{ formatCurrency(item.salePrice) }}</p>
            </div>
          </div>
          <p>{{ item.purchaseLocation || "—" }}</p>
          <dl class="my-3 grid grid-cols-3">
            <div>
              <dt class="text-[.75rem] text-slate-500">Vốn</dt>
              <dd class="mt-1 text-[.84rem] font-[750]">
                {{ formatCurrency(item.lineCost) }}
              </dd>
            </div>
            <div>
              <dt class="text-[.75rem] text-slate-500">Doanh thu</dt>
              <dd class="mt-1 text-[.84rem] font-[750]">
                {{ formatCurrency(item.lineRevenue) }}
              </dd>
            </div>
            <div>
              <dt class="text-[.75rem] text-slate-500">Lợi nhuận</dt>
              <dd class="mt-1 text-[.84rem] font-[750] text-emerald-600">
                {{ formatCurrency(item.lineProfit) }}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </section>

    <section
      class="mb-5 ml-auto grid max-w-[800px] grid-cols-3 gap-3.5 max-[600px]:grid-cols-1"
    >
      <div class="rounded-[15px] border border-slate-200 bg-white p-5">
        <span class="block text-slate-500">Tổng vốn sản phẩm</span
        ><strong class="mt-2 block text-[1.3rem]">{{
          formatCurrency(order.totalCost - (order.deliveryFee || 0))
        }}</strong>
      </div>
      <div class="rounded-[15px] border border-slate-200 bg-white p-5">
        <span class="block text-slate-500">Phí ship</span
        ><strong class="mt-2 block text-[1.3rem]">{{
          formatCurrency(order.deliveryFee || 0)
        }}</strong>
      </div>
      <div class="rounded-[15px] border border-slate-200 bg-white p-5">
        <span class="block text-slate-500">Tổng vốn</span
        ><strong class="mt-2 block text-[1.3rem]">{{
          formatCurrency(order.totalCost)
        }}</strong>
      </div>
      <div class="rounded-[15px] border border-slate-200 bg-white p-5">
        <span class="block text-slate-500">Tổng doanh thu</span
        ><strong class="mt-2 block text-[1.3rem]">{{
          formatCurrency(order.totalRevenue)
        }}</strong>
      </div>
      <div class="rounded-[15px] border border-emerald-200 bg-emerald-50 p-5">
        <span class="block text-slate-500">Tổng lợi nhuận</span
        ><strong class="mt-2 block text-[1.3rem] text-emerald-700">{{
          formatCurrency(order.totalProfit)
        }}</strong>
      </div>
    </section>
    <ConfirmDialog
      :open="confirmDelete"
      title="Xóa đơn hàng"
      :message="`Bạn có chắc muốn xóa đơn ${order.id}?`"
      :busy="deleting"
      @cancel="confirmDelete = false"
      @confirm="removeOrder"
    />
  </template>
</template>
