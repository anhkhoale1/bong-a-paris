<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoadingState from "../components/common/LoadingState.vue";
import ProductForm from "../components/products/ProductForm.vue";
import { useNotification } from "../composables/useNotification";
import { productService } from "../services/productService";

const route = useRoute();
const router = useRouter();
const product = ref(null);
const loading = ref(true);
const submitting = ref(false);
const error = ref("");
const { notify } = useNotification();

async function loadProduct() {
  try {
    product.value = await productService.get(route.params.id);
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    loading.value = false;
  }
}

async function updateProduct(payload) {
  submitting.value = true;
  error.value = "";
  try {
    await productService.update(route.params.id, payload);
    notify("Đã cập nhật sản phẩm thành công.");
    router.push("/products");
  } catch (requestError) {
    error.value = requestError.message;
  } finally {
    submitting.value = false;
  }
}

onMounted(loadProduct);
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
        Sửa sản phẩm
      </h1>
      <p class="mb-0 max-w-[680px] text-slate-500">
        Cập nhật thông tin mặc định của sản phẩm.
      </p>
    </div>
  </div>
  <LoadingState v-if="loading" />
  <div
    v-else-if="error && !product"
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
    <ProductForm
      :product="product"
      :submitting="submitting"
      submit-label="Lưu thay đổi"
      @submit="updateProduct"
      @cancel="router.push('/products')"
    />
  </template>
</template>
