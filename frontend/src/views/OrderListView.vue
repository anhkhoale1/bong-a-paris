<script setup>
import { onMounted, reactive, ref } from 'vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import EmptyState from '../components/common/EmptyState.vue'
import LoadingState from '../components/common/LoadingState.vue'
import StatusBadge from '../components/orders/StatusBadge.vue'
import { useNotification } from '../composables/useNotification'
import { orderService } from '../services/orderService'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/date'
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus'

const orders = ref([])
const loading = ref(true)
const error = ref('')
const deleting = ref(false)
const selectedOrder = ref(null)
const filters = reactive({ search: '', status: '', fromDate: '', toDate: '' })
const { notify } = useNotification()

async function loadOrders() {
  loading.value = true
  error.value = ''
  try {
    orders.value = await orderService.list(filters)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  Object.assign(filters, { search: '', status: '', fromDate: '', toDate: '' })
  loadOrders()
}

async function removeOrder() {
  deleting.value = true
  try {
    await orderService.remove(selectedOrder.value.id)
    notify('Đã xóa đơn hàng thành công.')
    selectedOrder.value = null
    await loadOrders()
  } catch (requestError) {
    notify(requestError.message, 'error')
  } finally {
    deleting.value = false
  }
}

const totalQuantity = order => order.items.reduce((sum, item) => sum + item.quantity, 0)
onMounted(loadOrders)
</script>

<template>
  <div class="page-heading">
    <div><p class="eyebrow">Theo dõi</p><h1>Đơn hàng</h1><p>Tra cứu tiến độ, chi phí và lợi nhuận của từng đơn.</p></div>
    <RouterLink class="button" to="/orders/create">+ Tạo đơn hàng</RouterLink>
  </div>

  <form class="panel filters filters--orders" @submit.prevent="loadOrders">
    <label class="field"><span>Mã đơn hoặc khách hàng</span><input v-model.trim="filters.search" placeholder="DH-... hoặc Nguyễn Văn A" /></label>
    <label class="field"><span>Trạng thái</span><select v-model="filters.status"><option value="">Tất cả</option><option v-for="status in ORDER_STATUSES" :key="status" :value="status">{{ statusLabel(status) }}</option></select></label>
    <label class="field"><span>Từ ngày</span><input v-model="filters.fromDate" type="date" /></label>
    <label class="field"><span>Đến ngày</span><input v-model="filters.toDate" type="date" /></label>
    <button class="button">Lọc dữ liệu</button><button type="button" class="button button--ghost" @click="clearFilters">Xóa bộ lọc</button>
  </form>

  <LoadingState v-if="loading" />
  <div v-else-if="error" class="error-panel">{{ error }} <button class="link-button" @click="loadOrders">Thử lại</button></div>
  <EmptyState v-else-if="!orders.length" title="Không có đơn hàng" description="Chưa có đơn phù hợp với bộ lọc hiện tại.">
    <RouterLink class="button" to="/orders/create">Tạo đơn đầu tiên</RouterLink>
  </EmptyState>
  <section v-else class="panel table-panel">
    <div class="table-wrap desktop-only">
      <table class="orders-table">
        <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày tạo</th><th>Loại SP</th><th>Số SP</th><th>Tổng vốn</th><th>Doanh thu</th><th>Lợi nhuận</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td><RouterLink class="text-link" :to="`/orders/${order.id}`">{{ order.id }}</RouterLink></td>
            <td><strong>{{ order.customerName }}</strong><small class="muted">{{ order.customerPhone || 'Không có SĐT' }}</small></td>
            <td>{{ formatDate(order.createdAt) }}</td><td>{{ order.items.length }}</td><td>{{ totalQuantity(order) }}</td>
            <td>{{ formatCurrency(order.totalCost) }}</td><td>{{ formatCurrency(order.totalRevenue) }}</td><td><strong class="profit-text">{{ formatCurrency(order.totalProfit) }}</strong></td>
            <td><StatusBadge :status="order.status" /></td>
            <td><div class="row-actions"><RouterLink class="button button--small button--ghost" :to="`/orders/${order.id}`">Xem</RouterLink><RouterLink class="button button--small button--ghost" :to="`/orders/${order.id}/edit`">Sửa</RouterLink><button class="button button--small button--danger" @click="selectedOrder = order">Xóa</button></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-cards mobile-only">
      <article v-for="order in orders" :key="order.id" class="mobile-card">
        <div class="mobile-card__heading"><div><RouterLink class="text-link" :to="`/orders/${order.id}`">{{ order.id }}</RouterLink><h3>{{ order.customerName }}</h3></div><StatusBadge :status="order.status" /></div>
        <p class="muted">{{ formatDate(order.createdAt) }} · {{ totalQuantity(order) }} sản phẩm</p>
        <dl><div><dt>Vốn</dt><dd>{{ formatCurrency(order.totalCost) }}</dd></div><div><dt>Doanh thu</dt><dd>{{ formatCurrency(order.totalRevenue) }}</dd></div><div><dt>Lợi nhuận</dt><dd class="profit-text">{{ formatCurrency(order.totalProfit) }}</dd></div></dl>
        <div class="row-actions"><RouterLink class="button button--ghost" :to="`/orders/${order.id}`">Chi tiết</RouterLink><RouterLink class="button button--ghost" :to="`/orders/${order.id}/edit`">Sửa</RouterLink><button class="button button--danger" @click="selectedOrder = order">Xóa</button></div>
      </article>
    </div>
  </section>

  <ConfirmDialog :open="Boolean(selectedOrder)" title="Xóa đơn hàng" :message="`Bạn có chắc muốn xóa đơn ${selectedOrder?.id}?`" :busy="deleting" @cancel="selectedOrder = null" @confirm="removeOrder" />
</template>
