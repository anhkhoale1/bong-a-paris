<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import ProductForm from "../components/products/ProductForm.vue";
import { useNotification } from "../composables/useNotification";
import { productService } from "../services/productService";

const router = useRouter();
const submitting = ref(false);
const error = ref("");
const { notify } = useNotification();

async function createProduct(payload) {
  submitting.value = true;
  error.value = "";
  try {
    await productService.create(payload);
    notify("Đã thêm sản phẩm thành công.");
    router.push("/products");
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
        Sản phẩm
      </p>
      <h1
        class="mb-2.5 text-[clamp(2rem,4vw,3.25rem)] font-[850] leading-[1.02] tracking-[-.065em] text-gray-900"
      >
        Thêm sản phẩm
      </h1>
      <p class="mb-0 max-w-[680px] text-slate-500">
        Thiết lập thông tin và giá mặc định để dùng khi tạo đơn.
      </p>
    </div>
  </div>
  <div
    v-if="error"
    class="mb-[18px] rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-800"
  >
    {{ error }}
  </div>
  <ProductForm
    :submitting="submitting"
    submit-label="Thêm sản phẩm"
    @submit="createProduct"
    @cancel="router.push('/products')"
  />
</template>
