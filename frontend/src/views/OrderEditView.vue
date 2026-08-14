<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingState from '../components/common/LoadingState.vue'
import OrderForm from '../components/orders/OrderForm.vue'
import { useNotification } from '../composables/useNotification'
import { orderService } from '../services/orderService'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const { notify } = useNotification()

async function loadOrder() {
  try {
    order.value = await orderService.get(route.params.id)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

async function updateOrder(payload) {
  submitting.value = true
  error.value = ''
  try {
    const updated = await orderService.update(route.params.id, payload)
    notify('Đã cập nhật đơn hàng thành công.')
    router.push(`/orders/${updated.id}`)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    submitting.value = false
  }
}

onMounted(loadOrder)
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">Đơn hàng</p><h1>Sửa {{ route.params.id }}</h1><p>Cập nhật khách hàng, sản phẩm và giá thực tế.</p></div></div>
  <LoadingState v-if="loading" />
  <div v-else-if="error && !order" class="error-panel">{{ error }}</div>
  <template v-else>
    <div v-if="error" class="error-panel">{{ error }}</div>
    <OrderForm :order="order" :submitting="submitting" submit-label="Lưu thay đổi" @submit="updateOrder" @cancel="router.push(`/orders/${route.params.id}`)" />
  </template>
</template>
