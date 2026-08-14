<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProductForm from '../components/products/ProductForm.vue'
import { useNotification } from '../composables/useNotification'
import { productService } from '../services/productService'

const router = useRouter()
const submitting = ref(false)
const error = ref('')
const { notify } = useNotification()

async function createProduct(payload) {
  submitting.value = true
  error.value = ''
  try {
    await productService.create(payload)
    notify('Đã thêm sản phẩm thành công.')
    router.push('/products')
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">Sản phẩm</p><h1>Thêm sản phẩm</h1><p>Thiết lập thông tin và giá mặc định để dùng khi tạo đơn.</p></div></div>
  <div v-if="error" class="error-panel">{{ error }}</div>
  <ProductForm :submitting="submitting" submit-label="Thêm sản phẩm" @submit="createProduct" @cancel="router.push('/products')" />
</template>
