<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import LoadingState from '../components/common/LoadingState.vue'
import ProductImage from '../components/common/ProductImage.vue'
import StatusBadge from '../components/orders/StatusBadge.vue'
import StatusProgress from '../components/orders/StatusProgress.vue'
import { useNotification } from '../composables/useNotification'
import { orderService } from '../services/orderService'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(true)
const error = ref('')
const selectedStatus = ref('')
const updatingStatus = ref(false)
const confirmDelete = ref(false)
const deleting = ref(false)
const { notify } = useNotification()

async function loadOrder() {
  try {
    order.value = await orderService.get(route.params.id)
    selectedStatus.value = order.value.status
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

async function updateStatus() {
  updatingStatus.value = true
  try {
    order.value = await orderService.updateStatus(order.value.id, selectedStatus.value)
    notify('Đã cập nhật trạng thái đơn hàng.')
  } catch (requestError) {
    notify(requestError.message, 'error')
    selectedStatus.value = order.value.status
  } finally {
    updatingStatus.value = false
  }
}

async function removeOrder() {
  deleting.value = true
  try {
    await orderService.remove(order.value.id)
    notify('Đã xóa đơn hàng thành công.')
    router.push('/orders')
  } catch (requestError) {
    notify(requestError.message, 'error')
    deleting.value = false
  }
}

onMounted(loadOrder)
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-else-if="error" class="error-panel">{{ error }}</div>
  <template v-else>
    <div class="page-heading">
      <div><p class="eyebrow">Chi tiết đơn hàng</p><h1>{{ order.id }}</h1><div class="heading-meta"><StatusBadge :status="order.status" /><span>Tạo {{ formatDate(order.createdAt) }}</span></div></div>
      <div class="row-actions"><RouterLink class="button button--ghost" :to="`/orders/${order.id}/edit`">Sửa đơn</RouterLink><button class="button button--danger" @click="confirmDelete = true">Xóa đơn</button></div>
    </div>

    <section class="panel status-section">
      <div class="section-heading"><div><p class="eyebrow">Tiến trình</p><h2>Trạng thái đơn hàng</h2></div><div class="status-update"><select v-model="selectedStatus"><option v-for="status in ORDER_STATUSES" :key="status" :value="status">{{ statusLabel(status) }}</option></select><button class="button" :disabled="updatingStatus || selectedStatus === order.status" @click="updateStatus">{{ updatingStatus ? 'Đang lưu...' : 'Cập nhật' }}</button></div></div>
      <StatusProgress :status="order.status" />
    </section>

    <div class="detail-grid">
      <section class="panel"><p class="eyebrow">Khách hàng</p><h2>{{ order.customerName }}</h2><dl class="detail-list"><div><dt>Số điện thoại</dt><dd>{{ order.customerPhone || '—' }}</dd></div><div><dt>Địa chỉ</dt><dd>{{ order.customerAddress }}</dd></div><div><dt>Ghi chú</dt><dd>{{ order.note || 'Không có ghi chú' }}</dd></div></dl></section>
      <section class="panel"><p class="eyebrow">Thời gian</p><h2>Lịch sử đơn</h2><dl class="detail-list"><div><dt>Ngày tạo</dt><dd>{{ formatDate(order.createdAt) }}</dd></div><div><dt>Cập nhật gần nhất</dt><dd>{{ formatDate(order.updatedAt) }}</dd></div><div><dt>Hoàn thành</dt><dd>{{ formatDate(order.completedAt) }}</dd></div></dl></section>
    </div>

    <section class="panel">
      <div class="section-heading"><div><p class="eyebrow">Sản phẩm</p><h2>{{ order.items.length }} loại sản phẩm</h2></div></div>
      <div class="table-wrap desktop-only"><table><thead><tr><th>Ảnh</th><th>Sản phẩm</th><th>SL</th><th>Giá nhập</th><th>Giá bán</th><th>Nơi nhập</th><th>Tổng vốn</th><th>Doanh thu</th><th>Lợi nhuận</th></tr></thead><tbody><tr v-for="item in order.items" :key="item.id"><td><ProductImage :src="item.productImageUrl" :alt="item.productName" /></td><td><strong>{{ item.productName }}</strong></td><td>{{ item.quantity }}</td><td>{{ formatCurrency(item.purchasePrice) }}</td><td>{{ formatCurrency(item.salePrice) }}</td><td>{{ item.purchaseLocation }}</td><td>{{ formatCurrency(item.lineCost) }}</td><td>{{ formatCurrency(item.lineRevenue) }}</td><td><strong class="profit-text">{{ formatCurrency(item.lineProfit) }}</strong></td></tr></tbody></table></div>
      <div class="mobile-cards mobile-only"><article v-for="item in order.items" :key="item.id" class="mobile-card order-product-card"><div class="order-product-card__heading"><ProductImage :src="item.productImageUrl" :alt="item.productName" /><div><h3>{{ item.productName }}</h3><p>{{ item.quantity }} × {{ formatCurrency(item.salePrice) }}</p></div></div><p>{{ item.purchaseLocation }}</p><dl><div><dt>Vốn</dt><dd>{{ formatCurrency(item.lineCost) }}</dd></div><div><dt>Doanh thu</dt><dd>{{ formatCurrency(item.lineRevenue) }}</dd></div><div><dt>Lợi nhuận</dt><dd class="profit-text">{{ formatCurrency(item.lineProfit) }}</dd></div></dl></article></div>
    </section>

    <section class="order-totals order-totals--detail"><div><span>Tổng vốn</span><strong>{{ formatCurrency(order.totalCost) }}</strong></div><div><span>Tổng doanh thu</span><strong>{{ formatCurrency(order.totalRevenue) }}</strong></div><div class="profit"><span>Tổng lợi nhuận</span><strong>{{ formatCurrency(order.totalProfit) }}</strong></div></section>
    <ConfirmDialog :open="confirmDelete" title="Xóa đơn hàng" :message="`Bạn có chắc muốn xóa đơn ${order.id}?`" :busy="deleting" @cancel="confirmDelete = false" @confirm="removeOrder" />
  </template>
</template>
