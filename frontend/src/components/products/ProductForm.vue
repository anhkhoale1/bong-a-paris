<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { productService } from "../../services/productService";

const props = defineProps({
  product: { type: Object, default: null },
  submitting: Boolean,
  submitLabel: { type: String, default: "Lưu sản phẩm" },
});
const emit = defineEmits(["submit", "cancel"]);

const form = reactive({
  productCategoryName: "",
  name: "",
  description: "",
  defaultPurchasePrice: 0,
  defaultSalePrice: 0,
  purchaseLocation: "",
});
const errors = reactive({});
const categories = ref([]);

watch(
  () => props.product,
  (product) => {
    Object.assign(form, {
      productCategoryName: product?.productCategoryName || "",
      name: product?.name || "",
      description: product?.description || "",
      defaultPurchasePrice: product?.defaultPurchasePrice ?? 0,
      defaultSalePrice: product?.defaultSalePrice ?? 0,
      purchaseLocation: product?.purchaseLocation || "",
    });
  },
  { immediate: true },
);

onMounted(async () => {
  try {
    categories.value = await productService.listCategories();
  } catch {
    categories.value = [];
  }
});

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  if (!form.productCategoryName.trim())
    errors.productCategoryName = "Phân loại mặt hàng không được để trống.";
  if (!form.name.trim()) errors.name = "Tên sản phẩm không được để trống.";
  if (
    !Number.isFinite(Number(form.defaultPurchasePrice)) ||
    Number(form.defaultPurchasePrice) < 0
  )
    errors.defaultPurchasePrice = "Giá nhập phải lớn hơn hoặc bằng 0.";
  if (
    !Number.isFinite(Number(form.defaultSalePrice)) ||
    Number(form.defaultSalePrice) < 0
  )
    errors.defaultSalePrice = "Giá bán phải lớn hơn hoặc bằng 0.";
  return Object.keys(errors).length === 0;
}

function submit() {
  if (!validate()) return;
  emit("submit", {
    ...form,
    defaultPurchasePrice: Number(form.defaultPurchasePrice),
    defaultSalePrice: Number(form.defaultSalePrice),
  });
}
</script>

<template>
  <form
    class="mb-5 w-full max-w-none rounded-2xl border border-[#e7e4df] bg-white p-[22px] shadow-[0_6px_20px_rgba(23,23,23,.035)] [&_input]:min-h-[43px] [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-[#cfd5e1] [&_input]:bg-white [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-[#1f2937] [&_input]:outline-none [&_input]:transition [&_input]:focus:border-[#7c70ee] [&_input]:focus:shadow-[0_0_0_3px_#ebe8ff] [&_textarea]:min-h-[43px] [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-[10px] [&_textarea]:border [&_textarea]:border-[#cfd5e1] [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:focus:border-[#7c70ee] [&_textarea]:focus:shadow-[0_0_0_3px_#ebe8ff] [&_b]:text-red-600"
    @submit.prevent="submit"
  >
    <div class="grid grid-cols-2 gap-[18px] max-[600px]:grid-cols-1">
      <label
        class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      >
        <span>Phân loại mặt hàng <b>*</b></span>
        <input
          class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
          v-model.trim="form.productCategoryName"
          list="product-categories"
          :class="{ 'border-red-500': errors.productCategoryName }"
          placeholder="Ví dụ: Kem chống nắng"
        />
        <datalist id="product-categories">
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.name"
          />
        </datalist>
        <small v-if="errors.productCategoryName" class="text-red-600">{{
          errors.productCategoryName
        }}</small>
      </label>

      <label
        class="col-span-full grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600 max-[600px]:col-auto"
      >
        <span>Tên sản phẩm <b>*</b></span>
        <input
          class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
          v-model.trim="form.name"
          :class="{ 'border-red-500': errors.name }"
          placeholder="Ví dụ: Túi xách nữ"
        />
        <small v-if="errors.name" class="text-red-600">{{ errors.name }}</small>
      </label>

      <label
        class="col-span-full grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600 max-[600px]:col-auto"
      >
        <span>Mô tả</span>
        <textarea
          class="min-h-[43px] w-full resize-y rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
          v-model.trim="form.description"
          rows="4"
          placeholder="Mô tả ngắn về sản phẩm"
        ></textarea>
      </label>

      <label
        class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      >
        <span>Giá nhập mặc định <b>*</b></span>
        <input
          class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
          v-model.number="form.defaultPurchasePrice"
          type="number"
          min="0"
          step="1"
        />
        <small v-if="errors.defaultPurchasePrice" class="text-red-600">{{
          errors.defaultPurchasePrice
        }}</small>
      </label>

      <label
        class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      >
        <span>Giá bán mặc định <b>*</b></span>
        <input
          class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
          v-model.number="form.defaultSalePrice"
          type="number"
          min="0"
          step="1"
        />
        <small v-if="errors.defaultSalePrice" class="text-red-600">{{
          errors.defaultSalePrice
        }}</small>
      </label>

      <label
        class="grid content-start gap-[7px] text-[.88rem] font-[650] text-slate-600"
      >
        <span>Nơi mua / nhà cung cấp</span>
        <input
          class="min-h-[43px] w-full rounded-[10px] border border-[#cfd5e1] bg-white px-3 py-2.5 text-[#1f2937] outline-none transition focus:border-[#7c70ee] focus:shadow-[0_0_0_3px_#ebe8ff]"
          v-model.trim="form.purchaseLocation"
          placeholder="Ví dụ: Taobao"
        />
      </label>
    </div>

    <div class="mt-[22px] flex justify-end gap-2.5">
      <button
        type="button"
        class="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border border-[#d8d4ce] bg-[#f4f1ed] px-4 py-2.5 font-bold text-[#333] transition hover:-translate-y-px hover:bg-[#e7e2dc] disabled:cursor-not-allowed disabled:opacity-[.55]"
        :disabled="submitting"
        @click="$emit('cancel')"
      >
        Hủy
      </button>
      <button
        class="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border border-transparent bg-[#756bea] px-4 py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-[#5b50d6] disabled:cursor-not-allowed disabled:opacity-[.55]"
        :disabled="submitting"
      >
        {{ submitting ? "Đang lưu..." : submitLabel }}
      </button>
    </div>
  </form>
</template>
