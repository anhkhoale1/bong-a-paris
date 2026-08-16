<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import OrderForm from '../components/orders/OrderForm.vue'
import { useNotification } from '../composables/useNotification'
import { orderService } from '../services/orderService'

const router = useRouter()
const submitting = ref(false)
const error = ref('')
const { notify } = useNotification()

async function createOrder(payload) {
  submitting.value = true
  error.value = ''
  try {
    const order = await orderService.create(payload)
    notify('Đã tạo đơn hàng thành công.')
    router.push(`/orders/${order.id}`)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">Đơn hàng</p><h1>Tạo đơn mới</h1><p>Thêm nhiều sản phẩm và xem giá mặc định áp dụng cho khách hàng.</p></div></div>
  <div v-if="error" class="error-panel">{{ error }}</div>
  <OrderForm :submitting="submitting" submit-label="Tạo đơn hàng" @submit="createOrder" @cancel="router.push('/orders')" />
</template>
