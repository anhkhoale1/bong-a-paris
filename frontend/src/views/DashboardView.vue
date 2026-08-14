<script setup>
import { computed, onMounted, ref } from 'vue'
import EmptyState from '../components/common/EmptyState.vue'
import LoadingState from '../components/common/LoadingState.vue'
import StatusBadge from '../components/orders/StatusBadge.vue'
import { dashboardService } from '../services/dashboardService'
import { formatCurrency } from '../utils/currency'
import { formatDate, formatMonth } from '../utils/date'
import { statusLabel } from '../utils/orderStatus'

const summary = ref(null)
const loading = ref(true)
const error = ref('')
const maxMonthlyRevenue = computed(() => Math.max(...(summary.value?.monthlyRevenue.map(item => item.totalRevenue) || [1]), 1))

async function loadSummary() {
  loading.value = true
  error.value = ''
  try {
    summary.value = await dashboardService.summary()
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

const monthlyProfit = month => summary.value.monthlyProfit.find(item => item.month === month)?.totalProfit || 0
onMounted(loadSummary)
</script>

<template>
  <div class="page-heading"><div><p class="eyebrow">Tổng quan</p><h1>Dashboard</h1><p>Theo dõi hiệu quả bán hàng từ dữ liệu đã được backend tổng hợp.</p></div><button class="button button--ghost" @click="loadSummary">Làm mới</button></div>
  <LoadingState v-if="loading" />
  <div v-else-if="error" class="error-panel">{{ error }} <button class="link-button" @click="loadSummary">Thử lại</button></div>
  <template v-else>
    <section class="stats-grid">
      <article class="stat-card"><span>Tổng đơn hàng</span><strong>{{ summary.totalOrders }}</strong><small>{{ summary.pendingOrders }} đơn đang xử lý</small></article>
      <article class="stat-card"><span>Chưa hoàn thành</span><strong>{{ summary.pendingOrders }}</strong><small>Cần tiếp tục theo dõi</small></article>
      <article class="stat-card"><span>Đã hoàn thành</span><strong>{{ summary.completedOrders }}</strong><small>Đơn đã giao thành công</small></article>
      <article class="stat-card"><span>Sản phẩm</span><strong>{{ summary.totalProducts }}</strong><small>Trong danh mục</small></article>
      <article class="stat-card stat-card--money"><span>Tổng doanh thu</span><strong>{{ formatCurrency(summary.totalRevenue) }}</strong></article>
      <article class="stat-card stat-card--money"><span>Tổng vốn</span><strong>{{ formatCurrency(summary.totalCost) }}</strong></article>
      <article class="stat-card stat-card--money stat-card--profit"><span>Tổng lợi nhuận</span><strong>{{ formatCurrency(summary.totalProfit) }}</strong></article>
    </section>

    <div class="dashboard-grid">
      <section class="panel">
        <div class="section-heading"><div><p class="eyebrow">Gần đây</p><h2>5 đơn mới nhất</h2></div><RouterLink class="text-link" to="/orders">Xem tất cả</RouterLink></div>
        <EmptyState v-if="!summary.recentOrders.length" />
        <div v-else class="recent-orders"><RouterLink v-for="order in summary.recentOrders" :key="order.id" :to="`/orders/${order.id}`" class="recent-order"><div><strong>{{ order.customerName }}</strong><small>{{ order.id }} · {{ formatDate(order.createdAt) }}</small></div><div><strong>{{ formatCurrency(order.totalRevenue) }}</strong><StatusBadge :status="order.status" /></div></RouterLink></div>
      </section>

      <section class="panel">
        <p class="eyebrow">Phân bổ</p><h2>Đơn theo trạng thái</h2>
        <div class="status-summary"><div v-for="item in summary.ordersByStatus" :key="item.status"><span><StatusBadge :status="item.status" /></span><strong>{{ item.count }}</strong></div></div>
      </section>
    </div>

    <div class="dashboard-grid">
      <section class="panel">
        <p class="eyebrow">Tài chính</p><h2>Doanh thu và lợi nhuận theo tháng</h2>
        <EmptyState v-if="!summary.monthlyRevenue.length" />
        <div v-else class="monthly-chart">
          <div v-for="item in summary.monthlyRevenue" :key="item.month" class="monthly-row">
            <span>{{ formatMonth(item.month) }}</span>
            <div class="monthly-bar"><i :style="{ width: `${item.totalRevenue / maxMonthlyRevenue * 100}%` }"></i></div>
            <div><strong>{{ formatCurrency(item.totalRevenue) }}</strong><small>Lãi {{ formatCurrency(monthlyProfit(item.month)) }}</small></div>
          </div>
        </div>
      </section>

      <section class="panel">
        <p class="eyebrow">Hiệu quả</p><h2>Top sản phẩm theo doanh thu</h2>
        <EmptyState v-if="!summary.topProducts.length" />
        <ol v-else class="top-products"><li v-for="(product, index) in summary.topProducts" :key="product.productId"><span>{{ index + 1 }}</span><div><strong>{{ product.productName }}</strong><small>{{ product.quantity }} sản phẩm đã bán</small></div><strong>{{ formatCurrency(product.totalRevenue) }}</strong></li></ol>
      </section>
    </div>
  </template>
</template>
