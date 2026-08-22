<script setup>
import { onMounted, reactive, ref } from "vue";
import ConfirmDialog from "../components/common/ConfirmDialog.vue";
import EmptyState from "../components/common/EmptyState.vue";
import LoadingState from "../components/common/LoadingState.vue";
import StatusBadge from "../components/orders/StatusBadge.vue";
import { useNotification } from "../composables/useNotification";
import { orderService } from "../services/orderService";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";
import { ORDER_STATUSES, statusLabel } from "../utils/orderStatus";

const orders = ref([]);
const loading = ref(true);
const error = ref("");
const deleting = ref(false);
const selectedOrder = ref(null);
const filters = reactive({ search: "", status: "", fromDate: "", toDate: "" });
const { notify } = useNotification();

async function loadOrders() {
  loading.value = true;
  error.value = "";
  try {
    orders.value = await orderService.list(filters);
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
}

function clearFilters() {
  Object.assign(filters, { search: "", status: "", fromDate: "", toDate: "" });
  loadOrders();
}

async function removeOrder() {
  deleting.value = true;
  try {
    await orderService.remove(selectedOrder.value.id);
    notify("Đã xóa đơn hàng thành công.");
    selectedOrder.value = null;
    await loadOrders();
  } catch (requestError) {
    notify(requestError.message, "error");
  } finally {
    deleting.value = false;
  }
}

const totalQuantity = (order) =>
  order.items.reduce((sum, item) => sum + item.quantity, 0);
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
        Theo dõi
      </p>
      <h1
        class="mb-2.5 text-[clamp(2rem,4vw,3.25rem)] font-[850] leading-[1.02] tracking-[-.065em] text-gray-900"
      >
        Đơn hàng
      </h1>
      <p class="mb-0 max-w-[680px] text-slate-500">
        Tra cứu tiến độ, chi phí và lợi nhuận của từng đơn.
      </p>
    </div>
    <RouterLink
      class="inline-flex min-h-[42px] items-center justify-center gap-[7px] rounded-[10px] border border-transparent bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition hover:bg-[#ddd8ff] max-[600px]:w-full"
      to="/orders/create"
      >+ Tạo đơn hàng</RouterLink
    >
  </div>

  <form
    class="mb-5 grid items-end gap-3 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)] [grid-template-columns:minmax(210px,1.4fr)_minmax(170px,1fr)_minmax(145px,.8fr)_minmax(145px,.8fr)_auto_auto] max-[1180px]:grid-cols-3 max-[820px]:grid-cols-2 max-[600px]:grid-cols-1"
    @submit.prevent="loadOrders"
  >
    <label
      class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      ><span>Mã đơn hoặc khách hàng</span
      ><input
        class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
        v-model.trim="filters.search"
        placeholder="DH-... hoặc Nguyễn Văn A"
    /></label>
    <label
      class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      ><span>Trạng thái</span
      ><select
        class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
        v-model="filters.status"
      >
        <option value="">Tất cả</option>
        <option v-for="status in ORDER_STATUSES" :key="status" :value="status">
          {{ statusLabel(status) }}
        </option>
      </select></label
    >
    <label
      class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      ><span>Từ ngày</span
      ><input
        class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
        v-model="filters.fromDate"
        type="date"
    /></label>
    <label
      class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      ><span>Đến ngày</span
      ><input
        class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
        v-model="filters.toDate"
        type="date"
    /></label>
    <button
      class="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-[10px] bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff]"
    >
      Lọc dữ liệu</button
    ><button
      type="button"
      class="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-[10px] border border-[#d8d4ce] bg-white px-4 py-2.5 font-bold text-[#333] transition hover:-translate-y-px hover:bg-[#f4f1ed]"
      @click="clearFilters"
    >
      Xóa bộ lọc
    </button>
  </form>

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
    title="Không có đơn hàng"
    description="Chưa có đơn phù hợp với bộ lọc hiện tại."
  >
    <RouterLink
      class="inline-flex min-h-[42px] cursor-pointer items-center rounded-[10px] bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff]"
      to="/orders/create"
      >Tạo đơn đầu tiên</RouterLink
    >
  </EmptyState>
  <section
    v-else
    class="mb-5 rounded-2xl border border-[#e7e4df] bg-white px-[18px] pb-3 pt-1 shadow-[0_6px_20px_rgba(23,23,23,.035)] max-[600px]:p-0"
  >
    <div class="w-full overflow-x-auto max-[820px]:hidden">
      <table
        class="w-full min-w-[1280px] border-collapse [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-[#edf0f5] [&_td]:px-3.5 [&_td]:py-3 [&_td]:text-left [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-[#edf0f5] [&_th]:px-3.5 [&_th]:py-3 [&_th]:text-left [&_th]:text-[.72rem] [&_th]:uppercase [&_th]:tracking-[.05em] [&_th]:text-slate-500 [&_tbody_tr:hover]:bg-[#fcfaff]"
      >
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Ngày tạo</th>
            <th>Loại SP</th>
            <th>Số SP</th>
            <th>Tổng vốn</th>
            <th>Doanh thu</th>
            <th>Lợi nhuận</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>
              <RouterLink
                class="cursor-pointer border-0 bg-transparent p-0 font-[750] text-[#5148c8] hover:underline"
                :to="`/orders/${order.id}`"
                >{{ order.id }}</RouterLink
              >
            </td>
            <td>
              <strong>{{ order.customerName }}</strong
              ><small
                class="mt-1 block whitespace-normal font-normal text-[#7b8798]"
                >{{ order.customerPhone || "Không có SĐT" }}</small
              >
            </td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>{{ order.items.length }}</td>
            <td>{{ totalQuantity(order) }}</td>
            <td>{{ formatCurrency(order.totalCost) }}</td>
            <td>{{ formatCurrency(order.totalRevenue) }}</td>
            <td>
              <strong class="text-emerald-600">{{
                formatCurrency(order.totalProfit)
              }}</strong>
            </td>
            <td><StatusBadge :status="order.status" /></td>
            <td>
              <div class="flex flex-wrap gap-[7px]">
                <RouterLink
                  class="inline-flex min-h-[34px] cursor-pointer items-center rounded-[10px] border border-sky-200 bg-sky-100 px-2.5 py-1.5 text-[.82rem] font-bold text-sky-700 transition hover:-translate-y-px hover:bg-sky-200"
                  :to="`/orders/${order.id}`"
                  >Xem</RouterLink
                ><RouterLink
                  class="inline-flex min-h-[34px] cursor-pointer items-center rounded-[10px] border border-[#c7c0ff] bg-[#e9e5ff] px-2.5 py-1.5 text-[.82rem] font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff]"
                  :to="`/orders/${order.id}/edit`"
                  >Sửa</RouterLink
                ><button
                  class="inline-flex min-h-[34px] cursor-pointer items-center rounded-[10px] bg-red-100 px-2.5 py-1.5 text-[.82rem] font-bold text-red-700 transition hover:-translate-y-px hover:bg-red-200"
                  @click="selectedOrder = order"
                >
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="hidden max-[820px]:block max-[820px]:p-3">
      <article
        v-for="order in orders"
        :key="order.id"
        class="border-b border-[#e8ebf1] p-4 last:border-0"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <RouterLink
              class="font-[750] text-[#5148c8] hover:underline"
              :to="`/orders/${order.id}`"
              >{{ order.id }}</RouterLink
            >
            <h3 class="mb-1.5">{{ order.customerName }}</h3>
          </div>
          <StatusBadge :status="order.status" />
        </div>
        <p class="mt-1 block text-[#7b8798]">
          {{ formatDate(order.createdAt) }} · {{ totalQuantity(order) }} sản
          phẩm
        </p>
        <dl class="my-3 grid grid-cols-3">
          <div class="pr-2">
            <dt class="text-[.75rem] text-slate-500">Vốn</dt>
            <dd class="mt-1 text-[.84rem] font-[750]">
              {{ formatCurrency(order.totalCost) }}
            </dd>
          </div>
          <div class="pr-2">
            <dt class="text-[.75rem] text-slate-500">Doanh thu</dt>
            <dd class="mt-1 text-[.84rem] font-[750]">
              {{ formatCurrency(order.totalRevenue) }}
            </dd>
          </div>
          <div class="pr-2">
            <dt class="text-[.75rem] text-slate-500">Lợi nhuận</dt>
            <dd class="mt-1 text-[.84rem] font-[750] text-emerald-600">
              {{ formatCurrency(order.totalProfit) }}
            </dd>
          </div>
        </dl>
        <div class="flex flex-wrap gap-[7px]">
          <RouterLink
            class="inline-flex min-h-[42px] cursor-pointer items-center rounded-[10px] border border-sky-200 bg-sky-100 px-4 py-2.5 font-bold text-sky-700 transition hover:-translate-y-px hover:bg-sky-200"
            :to="`/orders/${order.id}`"
            >Chi tiết</RouterLink
          ><RouterLink
            class="inline-flex min-h-[42px] cursor-pointer items-center rounded-[10px] border border-[#c7c0ff] bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff]"
            :to="`/orders/${order.id}/edit`"
            >Sửa</RouterLink
          ><button
            class="inline-flex min-h-[42px] cursor-pointer items-center rounded-[10px] bg-red-100 px-4 py-2.5 font-bold text-red-700 transition hover:-translate-y-px hover:bg-red-200"
            @click="selectedOrder = order"
          >
            Xóa
          </button>
        </div>
      </article>
    </div>
  </section>

  <ConfirmDialog
    :open="Boolean(selectedOrder)"
    title="Xóa đơn hàng"
    :message="`Bạn có chắc muốn xóa đơn ${selectedOrder?.id}?`"
    :busy="deleting"
    @cancel="selectedOrder = null"
    @confirm="removeOrder"
  />
</template>
