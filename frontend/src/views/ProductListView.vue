<script setup>
import { onMounted, reactive, ref } from "vue";
import { productService } from "../services/productService";
import { formatCurrency } from "../utils/currency";
import { useNotification } from "../composables/useNotification";
import ConfirmDialog from "../components/common/ConfirmDialog.vue";
import EmptyState from "../components/common/EmptyState.vue";
import LoadingState from "../components/common/LoadingState.vue";

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref("");
const deleting = ref(false);
const selectedProduct = ref(null);
const filters = reactive({
  search: "",
  purchaseLocation: "",
  productCategoryName: "",
});
const { notify } = useNotification();

async function loadProducts() {
  loading.value = true;
  error.value = "";
  try {
    products.value = await productService.list(filters);
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  categories.value = await productService.listCategories();
}

async function removeProduct() {
  deleting.value = true;
  try {
    await productService.remove(selectedProduct.value.id);
    notify("Đã xóa sản phẩm thành công.");
    selectedProduct.value = null;
    await loadProducts();
  } catch (requestError) {
    notify(requestError.message, "error");
  } finally {
    deleting.value = false;
  }
}

function clearFilters() {
  Object.assign(filters, {
    search: "",
    purchaseLocation: "",
    productCategoryName: "",
  });
  loadProducts();
}

onMounted(async () => {
  await Promise.all([loadProducts(), loadCategories().catch(() => {})]);
});
</script>

<template>
  <div
    class="mb-[38px] flex items-start justify-between gap-6 max-[600px]:flex-col max-[600px]:items-stretch"
  >
    <div>
      <p
        class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
      >
        Danh mục
      </p>
      <h1
        class="mb-2.5 text-[clamp(2rem,4vw,3.25rem)] font-[850] leading-[1.02] tracking-[-.065em] text-gray-900"
      >
        Sản phẩm
      </h1>
      <p class="mb-0 max-w-[680px] text-slate-500">
        Quản lý thông tin và mức lợi nhuận dự kiến của sản phẩm.
      </p>
    </div>
    <RouterLink
      class="inline-flex min-h-[42px] items-center justify-center gap-[7px] rounded-[10px] border border-transparent bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition duration-150 hover:-translate-y-px hover:bg-[#ddd8ff] max-[600px]:w-full"
      to="/products/create"
      >+ Thêm sản phẩm</RouterLink
    >
  </div>

  <form
    class="mb-5 grid items-end gap-3 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)] [grid-template-columns:minmax(220px,1.5fr)_minmax(180px,1fr)_auto_auto] max-[820px]:grid-cols-2 max-[600px]:grid-cols-1"
    @submit.prevent="loadProducts"
  >
    <label
      class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      ><span>Tìm theo tên</span
      ><input
        class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
        v-model.trim="filters.search"
        placeholder="Không dấu, viết tắt đều được"
    /></label>
    <label
      class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      ><span>Phân loại</span
      ><select
        class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
        v-model="filters.productCategoryName"
      >
        <option value="">Tất cả</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.name"
        >
          {{ category.name }}
        </option>
      </select></label
    >
    <label
      class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      ><span>Nơi mua</span
      ><input
        class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
        v-model.trim="filters.purchaseLocation"
        placeholder="Taobao, 1688..."
    /></label>
    <button
      class="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border border-transparent bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff]"
    >
      Lọc dữ liệu
    </button>
    <button
      type="button"
      class="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border border-[#d8d4ce] bg-white px-4 py-2.5 font-bold text-[#333] transition hover:-translate-y-px hover:bg-[#f4f1ed]"
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
      @click="loadProducts"
    >
      Thử lại
    </button>
  </div>
  <EmptyState
    v-else-if="!products.length"
    title="Không tìm thấy sản phẩm"
    description="Hãy thay đổi bộ lọc hoặc thêm sản phẩm mới."
  >
    <RouterLink
      class="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-[10px] bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff]"
      to="/products/create"
      >Thêm sản phẩm</RouterLink
    >
  </EmptyState>
  <section
    v-else
    class="mb-5 rounded-2xl border border-[#e7e4df] bg-white px-[18px] pb-3 pt-1 shadow-[0_6px_20px_rgba(23,23,23,.035)] max-[600px]:p-0"
  >
    <div class="w-full overflow-x-auto max-[820px]:hidden">
      <table
        class="w-full border-collapse [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-[#edf0f5] [&_td]:px-3.5 [&_td]:py-3 [&_td]:text-left [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-[#edf0f5] [&_th]:px-3.5 [&_th]:py-3 [&_th]:text-left [&_th]:text-[.72rem] [&_th]:uppercase [&_th]:tracking-[.05em] [&_th]:text-slate-500"
      >
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Phân loại</th>
            <th>Giá nhập</th>
            <th>Giá bán</th>
            <th>Lợi nhuận dự kiến</th>
            <th>Nơi mua</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <strong>{{ product.name }}</strong
              ><small
                class="mt-1 block whitespace-normal font-normal text-[#7b8798]"
                >{{ product.description || "Không có mô tả" }}</small
              >
            </td>
            <td>{{ product.productCategoryName || "Chưa phân loại" }}</td>
            <td>{{ formatCurrency(product.defaultPurchasePrice) }}</td>
            <td>{{ formatCurrency(product.defaultSalePrice) }}</td>
            <td>
              <strong class="text-emerald-600">{{
                formatCurrency(
                  product.defaultSalePrice - product.defaultPurchasePrice,
                )
              }}</strong>
            </td>
            <td>{{ product.purchaseLocation || "—" }}</td>
            <td>
              <div class="flex flex-wrap gap-[7px]">
                <RouterLink
                  class="inline-flex min-h-[34px] cursor-pointer items-center rounded-[10px] border border-[#c7c0ff] bg-[#e9e5ff] px-2.5 py-1.5 text-[.82rem] font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff]"
                  :to="`/products/${product.id}/edit`"
                  >Sửa</RouterLink
                ><button
                  class="inline-flex min-h-[34px] cursor-pointer items-center rounded-[10px] bg-red-100 px-2.5 py-1.5 text-[.82rem] font-bold text-red-700 transition hover:-translate-y-px hover:bg-red-200"
                  @click="selectedProduct = product"
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
        v-for="product in products"
        :key="product.id"
        class="flex flex-wrap items-start justify-between gap-3 border-b border-[#e8ebf1] p-4 last:border-0"
      >
        <div>
          <h3>{{ product.name }}</h3>
          <p>{{ product.productCategoryName || "Chưa phân loại" }}</p>
          <p>{{ product.purchaseLocation || "Chưa có nơi mua" }}</p>
        </div>
        <dl class="my-3 grid w-full grid-cols-3">
          <div class="pr-2">
            <dt class="text-[.75rem] text-slate-500">Giá nhập</dt>
            <dd class="mt-1 text-[.84rem] font-[750]">
              {{ formatCurrency(product.defaultPurchasePrice) }}
            </dd>
          </div>
          <div class="pr-2">
            <dt class="text-[.75rem] text-slate-500">Giá bán</dt>
            <dd class="mt-1 text-[.84rem] font-[750]">
              {{ formatCurrency(product.defaultSalePrice) }}
            </dd>
          </div>
          <div class="pr-2">
            <dt class="text-[.75rem] text-slate-500">Lợi nhuận</dt>
            <dd class="mt-1 text-[.84rem] font-[750] text-emerald-600">
              {{
                formatCurrency(
                  product.defaultSalePrice - product.defaultPurchasePrice,
                )
              }}
            </dd>
          </div>
        </dl>
        <div class="flex flex-wrap gap-[7px]">
          <RouterLink
            class="inline-flex min-h-[42px] cursor-pointer items-center rounded-[10px] border border-[#c7c0ff] bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition hover:-translate-y-px hover:bg-[#ddd8ff]"
            :to="`/products/${product.id}/edit`"
            >Sửa</RouterLink
          ><button
            class="inline-flex min-h-[42px] cursor-pointer items-center rounded-[10px] bg-red-100 px-4 py-2.5 font-bold text-red-700 transition hover:-translate-y-px hover:bg-red-200"
            @click="selectedProduct = product"
          >
            Xóa
          </button>
        </div>
      </article>
    </div>
  </section>

  <ConfirmDialog
    :open="Boolean(selectedProduct)"
    title="Xóa sản phẩm"
    :message="`Bạn có chắc muốn xóa “${selectedProduct?.name}”?`"
    :busy="deleting"
    @cancel="selectedProduct = null"
    @confirm="removeProduct"
  />
</template>
