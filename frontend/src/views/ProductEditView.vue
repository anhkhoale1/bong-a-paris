<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingState from '../components/common/LoadingState.vue'
import ProductForm from '../components/products/ProductForm.vue'
import { useNotification } from '../composables/useNotification'
import { productService } from '../services/productService'

const route = useRoute()
const router = useRouter()
const product = ref(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const { notify } = useNotification()

async function loadProduct() {
  try {
    product.value = await productService.get(route.params.id)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

async function updateProduct(payload) {
  submitting.value = true
  error.value = ''
  try {
    await productService.update(route.params.id, payload)
    notify('Đã cập nhật sản phẩm thành công.')
    router.push('/products')
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    submitting.value = false
  }
}

onMounted(loadProduct)
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">Sản phẩm</p><h1>Sửa sản phẩm</h1><p>Cập nhật thông tin mặc định của sản phẩm.</p></div></div>
  <LoadingState v-if="loading" />
  <div v-else-if="error && !product" class="error-panel">{{ error }}</div>
  <template v-else>
    <div v-if="error" class="error-panel">{{ error }}</div>
    <ProductForm :product="product" :submitting="submitting" submit-label="Lưu thay đổi" @submit="updateProduct" @cancel="router.push('/products')" />
  </template>
</template>
