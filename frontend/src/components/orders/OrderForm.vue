<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { productService } from "../../services/productService";
import { formatCurrency } from "../../utils/currency";
import LoadingState from "../common/LoadingState.vue";

const props = defineProps({
  order: { type: Object, default: null },
  submitting: Boolean,
  submitLabel: { type: String, default: "Lưu đơn hàng" },
});
const emit = defineEmits(["submit", "cancel"]);

const products = ref([]);
const loadingProducts = ref(true);
const loadError = ref("");
const formErrors = ref([]);
const activeProductPicker = ref(null);
const productPickerSearch = reactive({});
const productPickerCategory = reactive({});
const form = reactive({
  customerName: props.order?.customerName || "",
  customerPhone: props.order?.customerPhone || "",
  customerAddress: props.order?.customerAddress || "",
  note: props.order?.note || "",
  deliveryFee: props.order?.deliveryFee || 0,
  status: props.order?.status || "PENDING_PURCHASE",
  items: (props.order?.items || []).map((item) => ({ ...item })),
});

const productCategories = computed(() =>
  [
    ...new Set(
      products.value
        .map((product) => String(product.productCategoryName || "").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "vi", { sensitivity: "base" })),
);
const sortedProducts = computed(() =>
  [...products.value].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "vi", {
      sensitivity: "base",
    }),
  ),
);

const totalProductCost = computed(() =>
  form.items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0),
    0,
  ),
);
const deliveryFee = computed(() => Number(form.deliveryFee) || 0);
const totalCost = computed(() => totalProductCost.value + deliveryFee.value);
const totalRevenue = computed(() =>
  form.items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.salePrice) || 0),
    0,
  ),
);
const totalProfit = computed(() => totalRevenue.value - totalCost.value);

function blankItem() {
  return {
    productId: "",
    quantity: 1,
    purchasePrice: 0,
    salePrice: 0,
    purchaseLocation: "",
    productName: "",
  };
}

function addItem() {
  form.items.push(blankItem());
  const index = form.items.length - 1;
  productPickerSearch[index] = "";
  productPickerCategory[index] = "__all__";
}

function removeItem(index) {
  const nextSearch = form.items
    .filter((_item, currentIndex) => currentIndex !== index)
    .map(
      (_item, newIndex) =>
        productPickerSearch[newIndex + (newIndex >= index ? 1 : 0)] || "",
    );
  const nextCategory = form.items
    .filter((_item, currentIndex) => currentIndex !== index)
    .map(
      (_item, newIndex) =>
        productPickerCategory[newIndex + (newIndex >= index ? 1 : 0)] ||
        "__all__",
    );
  form.items.splice(index, 1);
  Object.keys(productPickerSearch).forEach(
    (key) => delete productPickerSearch[key],
  );
  Object.keys(productPickerCategory).forEach(
    (key) => delete productPickerCategory[key],
  );
  nextSearch.forEach((value, newIndex) => {
    productPickerSearch[newIndex] = value;
  });
  nextCategory.forEach((value, newIndex) => {
    productPickerCategory[newIndex] = value;
  });
  if (activeProductPicker.value === index) activeProductPicker.value = null;
  else if (activeProductPicker.value > index) activeProductPicker.value -= 1;
}

function closeProductPickerSoon() {
  window.setTimeout(() => {
    activeProductPicker.value = null;
  }, 120);
}

function filteredProducts(index) {
  const search = String(productPickerSearch[index] || "")
    .trim()
    .toLocaleLowerCase("vi");
  const category =
    productPickerCategory[index] === "__all__"
      ? ""
      : productPickerCategory[index] || "";
  return sortedProducts.value.filter((product) => {
    const searchable =
      `${product.name || ""} ${product.productCategoryName || ""} ${product.id || ""}`.toLocaleLowerCase(
        "vi",
      );
    return (
      (!search || searchable.includes(search)) &&
      (!category || product.productCategoryName === category)
    );
  });
}

function selectProduct(item, product) {
  if (!product) return;
  item.productId = product.id;
  productPickerSearch[form.items.indexOf(item)] = product.name || product.id;
  productPickerCategory[form.items.indexOf(item)] =
    product.productCategoryName || "";
  Object.assign(item, {
    productName: product.name,
    purchasePrice: product.defaultPurchasePrice,
    salePrice: product.defaultSalePrice,
    purchaseLocation: product.purchaseLocation,
  });
  activeProductPicker.value = null;
}

function validate() {
  const errors = [];
  if (!form.customerName.trim())
    errors.push("Tên khách hàng không được để trống.");
  if (!form.items.length) errors.push("Đơn hàng phải có ít nhất một sản phẩm.");
  form.items.forEach((item, index) => {
    const label = `Sản phẩm ${index + 1}`;
    if (!item.productId) errors.push(`${label}: hãy chọn sản phẩm.`);
    if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)
      errors.push(`${label}: số lượng phải là số nguyên lớn hơn 0.`);
    if (
      !Number.isFinite(Number(item.purchasePrice)) ||
      Number(item.purchasePrice) < 0
    )
      errors.push(`${label}: giá nhập không hợp lệ.`);
    if (!Number.isFinite(Number(item.salePrice)) || Number(item.salePrice) < 0)
      errors.push(`${label}: giá bán không hợp lệ.`);
  });
  formErrors.value = errors;
  return !errors.length;
}

function submit() {
  if (!validate()) return;
  emit("submit", {
    customerName: form.customerName.trim(),
    customerPhone: form.customerPhone.trim(),
    customerAddress: form.customerAddress.trim(),
    note: form.note.trim(),
    deliveryFee: Number(form.deliveryFee) || 0,
    status: form.status,
    items: form.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: Number(item.quantity),
      purchasePrice: Number(item.purchasePrice),
      salePrice: Number(item.salePrice),
      purchaseLocation: String(item.purchaseLocation).trim(),
    })),
  });
}

onMounted(async () => {
  try {
    products.value = await productService.list();
    form.items.forEach((item, index) => {
      const product = products.value.find(
        (entry) => entry.id === item.productId,
      );
      productPickerSearch[index] = item.productName || "";
      productPickerCategory[index] = product?.productCategoryName || "__all__";
    });
    if (!form.items.length) addItem();
  } catch (error) {
    loadError.value = error.message;
  } finally {
    loadingProducts.value = false;
  }
});
</script>

<template>
  <LoadingState v-if="loadingProducts" />
  <div
    v-else-if="loadError"
    class="mb-[18px] rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
  >
    {{ loadError }}
  </div>
  <form
    v-else
    class="w-full max-w-none [&_input]:min-h-[43px] [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-[#cfd5e1] [&_input]:bg-white [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-[#1f2937] [&_input]:outline-none [&_input]:transition [&_input]:focus:border-[#7c70ee] [&_input]:focus:shadow-[0_0_0_3px_#ebe8ff] [&_select]:min-h-[43px] [&_select]:w-full [&_select]:rounded-[10px] [&_select]:border [&_select]:border-[#cfd5e1] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-[#1f2937] [&_select]:outline-none [&_select]:focus:border-[#7c70ee] [&_select]:focus:shadow-[0_0_0_3px_#ebe8ff] [&_textarea]:min-h-[43px] [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-[10px] [&_textarea]:border [&_textarea]:border-[#cfd5e1] [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:focus:border-[#7c70ee] [&_textarea]:focus:shadow-[0_0_0_3px_#ebe8ff] [&_b]:text-red-600"
    @submit.prevent="submit"
  >
    <section
      class="mb-5 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)] max-[600px]:rounded-[15px] max-[600px]:p-[17px]"
    >
      <div class="flex items-start justify-between gap-5">
        <div>
          <p
            class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
          >
            Khách hàng
          </p>
          <h2 class="mb-0 text-[1.2rem] text-gray-900">Thông tin giao hàng</h2>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-[18px] max-[600px]:grid-cols-1">
        <label
          class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
        >
          <span>Tên khách hàng <b>*</b></span>
          <input
            v-model.trim="form.customerName"
            placeholder="Nguyễn Văn A"
            required
          />
        </label>
        <label
          class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
        >
          <span>Số điện thoại</span>
          <input
            v-model.trim="form.customerPhone"
            inputmode="tel"
            placeholder="09xxxxxxxx"
          />
        </label>
        <label
          class="col-span-full grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600 max-[600px]:col-auto"
        >
          <span>Địa chỉ giao hàng tại Việt Nam</span>
          <input
            v-model.trim="form.customerAddress"
            placeholder="Quận/Huyện, Tỉnh/Thành phố"
          />
        </label>
        <label
          class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
        >
          <span>Phí ship</span>
          <input
            v-model.number="form.deliveryFee"
            type="number"
            min="0"
            step="1"
            placeholder="0"
          />
        </label>
        <label
          class="col-span-full grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600 max-[600px]:col-auto"
        >
          <span>Ghi chú</span>
          <textarea
            v-model.trim="form.note"
            rows="3"
            placeholder="Thời gian giao, yêu cầu đóng gói..."
          ></textarea>
        </label>
      </div>
    </section>

    <section
      class="mb-5 rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)] max-[600px]:rounded-[15px] max-[600px]:p-[17px]"
    >
      <div
        class="flex items-start justify-between gap-5 max-[600px]:flex-col max-[600px]:items-stretch"
      >
        <div>
          <p
            class="mb-1.5 text-xs font-extrabold uppercase tracking-[.11em] text-slate-500"
          >
            Sản phẩm
          </p>
          <h2 class="mb-0 text-[1.2rem] text-gray-900">Chi tiết đơn hàng</h2>
        </div>
        <button
          type="button"
          class="inline-flex min-h-[42px] items-center justify-center gap-[7px] rounded-[10px] border border-transparent bg-[#e9e5ff] px-4 py-2.5 font-bold text-[#4f46b5] transition duration-150 hover:-translate-y-px hover:bg-[#ddd8ff]"
          @click="addItem"
        >
          + Thêm sản phẩm
        </button>
      </div>

      <div
        v-if="!products.length"
        class="mb-[18px] rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
      >
        Chưa có sản phẩm trong danh mục. Hãy tạo sản phẩm trước khi tạo đơn.
      </div>
      <div class="mt-[22px] grid gap-4">
        <article
          v-for="(item, index) in form.items"
          :key="item.id || index"
          class="overflow-hidden rounded-[15px] border border-slate-200 bg-[#fbfcfe]"
        >
          <div
            class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3.5 py-2.5"
          >
            <strong>Sản phẩm {{ index + 1 }}</strong>
            <button
              type="button"
              class="grid size-[34px] cursor-pointer place-items-center rounded-[9px] border-0 bg-red-100 text-[1.4rem] text-red-700 transition hover:bg-red-200"
              title="Xóa khỏi đơn"
              @click="removeItem(index)"
            >
              ×
            </button>
          </div>
          <div class="flex items-start gap-[18px] p-4 max-[600px]:flex-col">
            <div
              class="grid flex-1 grid-cols-2 gap-[18px] max-[600px]:grid-cols-1"
            >
              <div
                class="col-span-full grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600 max-[600px]:col-auto"
              >
                <span>Chọn sản phẩm <b>*</b></span>
                <div
                  class="grid gap-2 rounded-xl border border-[#cfd5e1] bg-white p-2.5"
                >
                  <div
                    class="grid gap-2 [grid-template-columns:minmax(0,1fr)_190px] max-[600px]:grid-cols-1"
                  >
                    <input
                      v-model.trim="productPickerSearch[index]"
                      placeholder="Tìm tên sản phẩm hoặc mã..."
                      @focus="
                        activeProductPicker = index;
                        $event.target.select();
                      "
                      @blur="closeProductPickerSoon"
                    />
                    <select v-model="productPickerCategory[index]">
                      <option value="__all__">Tất cả phân loại</option>
                      <option
                        v-for="category in productCategories"
                        :key="category"
                        :value="category"
                      >
                        {{ category }}
                      </option>
                    </select>
                  </div>
                  <div
                    v-if="activeProductPicker === index"
                    class="grid max-h-[210px] overflow-y-auto rounded-[9px] border border-slate-200 bg-slate-50"
                  >
                    <button
                      v-for="product in filteredProducts(index)"
                      :key="product.id"
                      type="button"
                      class="grid gap-[3px] border-0 border-b border-slate-200 bg-transparent px-[11px] py-[9px] text-left text-[#1f2937] hover:bg-[#f0eeff]"
                      :class="{ 'bg-[#f0eeff]': item.productId === product.id }"
                      @mousedown.prevent="selectProduct(item, product)"
                    >
                      <strong>{{
                        product.name || "Sản phẩm chưa có tên"
                      }}</strong>
                      <small
                        >{{ product.productCategoryName || "Chưa phân loại" }} ·
                        {{ product.id }}</small
                      >
                    </button>
                    <p
                      v-if="!filteredProducts(index).length"
                      class="m-0 p-3 text-[.78rem] text-slate-500"
                    >
                      Không tìm thấy sản phẩm phù hợp.
                    </p>
                  </div>
                </div>
              </div>
              <label
                class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
              >
                <span>Số lượng <b>*</b></span>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  step="1"
                  required
                />
              </label>
              <label
                class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
              >
                <span>Giá nhập thực tế <b>*</b></span>
                <input
                  v-model.number="item.purchasePrice"
                  type="number"
                  min="0"
                  step="1"
                  readonly
                  required
                />
              </label>
              <label
                class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
              >
                <span>Giá bán thực tế <b>*</b></span>
                <input
                  v-model.number="item.salePrice"
                  type="number"
                  min="0"
                  step="1"
                  readonly
                  required
                />
              </label>
              <label
                class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
              >
                <span>Nơi nhập thực tế</span>
                <input v-model.trim="item.purchaseLocation" />
              </label>
            </div>
          </div>
          <div
            class="flex justify-end gap-7 border-t border-slate-200 px-4 py-3 text-[.82rem] text-slate-500 max-[600px]:grid max-[600px]:grid-cols-3 max-[600px]:gap-2"
          >
            <span
              >Vốn
              <strong>{{
                formatCurrency(
                  (Number(item.quantity) || 0) *
                    (Number(item.purchasePrice) || 0),
                )
              }}</strong></span
            >
            <span
              >Doanh thu
              <strong>{{
                formatCurrency(
                  (Number(item.quantity) || 0) * (Number(item.salePrice) || 0),
                )
              }}</strong></span
            >
            <span
              >Lợi nhuận
              <strong
                :class="{
                  'text-red-600':
                    (Number(item.salePrice) || 0) <
                    (Number(item.purchasePrice) || 0),
                }"
                >{{
                  formatCurrency(
                    (Number(item.quantity) || 0) *
                      ((Number(item.salePrice) || 0) -
                        (Number(item.purchasePrice) || 0)),
                  )
                }}</strong
              ></span
            >
          </div>
        </article>
      </div>
    </section>

    <section class="mb-5 grid grid-cols-3 gap-3.5 max-[600px]:grid-cols-1">
      <div class="rounded-[15px] border border-slate-200 bg-white p-5">
        <span class="block text-slate-500">Tổng vốn sản phẩm</span
        ><strong class="mt-2 block text-[1.3rem]">{{
          formatCurrency(totalProductCost)
        }}</strong>
      </div>
      <div class="rounded-[15px] border border-slate-200 bg-white p-5">
        <span class="block text-slate-500">Phí ship</span
        ><strong class="mt-2 block text-[1.3rem]">{{
          formatCurrency(deliveryFee)
        }}</strong>
      </div>
      <div class="rounded-[15px] border border-slate-200 bg-white p-5">
        <span class="block text-slate-500">Tổng vốn</span
        ><strong class="mt-2 block text-[1.3rem]">{{
          formatCurrency(totalCost)
        }}</strong>
      </div>
      <div class="rounded-[15px] border border-slate-200 bg-white p-5">
        <span class="block text-slate-500">Tổng doanh thu</span
        ><strong class="mt-2 block text-[1.3rem]">{{
          formatCurrency(totalRevenue)
        }}</strong>
      </div>
      <div class="rounded-[15px] border border-emerald-200 bg-emerald-50 p-5">
        <span class="block text-slate-500">Lợi nhuận dự kiến</span
        ><strong class="mt-2 block text-[1.3rem] text-emerald-700">{{
          formatCurrency(totalProfit)
        }}</strong>
      </div>
    </section>

    <div
      v-if="formErrors.length"
      class="mb-[18px] rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
    >
      <strong>Vui lòng kiểm tra lại:</strong>
      <ul>
        <li v-for="error in formErrors" :key="error">{{ error }}</li>
      </ul>
    </div>

    <div class="mt-[22px] flex justify-end gap-2.5">
      <button
        type="button"
        class="inline-flex min-h-[42px] items-center justify-center gap-[7px] rounded-[10px] border border-[#d8d4ce] bg-white px-4 py-2.5 font-bold text-[#333] transition duration-150 hover:-translate-y-px hover:bg-[#f4f1ed] disabled:cursor-not-allowed disabled:opacity-[.55]"
        :disabled="submitting"
        @click="$emit('cancel')"
      >
        Hủy
      </button>
      <button
        class="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border border-transparent bg-[#756bea] px-4 py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-[#5b50d6] disabled:cursor-not-allowed disabled:opacity-[.55]"
        :disabled="submitting || !products.length"
      >
        {{ submitting ? "Đang lưu..." : submitLabel }}
      </button>
    </div>
  </form>
</template>
