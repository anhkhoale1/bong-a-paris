<script setup>
import { onMounted, reactive, ref } from 'vue'
import { productService } from '../services/productService'
import { formatCurrency } from '../utils/currency'
import { useNotification } from '../composables/useNotification'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'
import EmptyState from '../components/common/EmptyState.vue'
import LoadingState from '../components/common/LoadingState.vue'
import ProductImage from '../components/common/ProductImage.vue'

const products = ref([])
const loading = ref(true)
const error = ref('')
const deleting = ref(false)
const selectedProduct = ref(null)
const filters = reactive({ search: '', purchaseLocation: '' })
const { notify } = useNotification()

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    products.value = await productService.list(filters)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

async function removeProduct() {
  deleting.value = true
  try {
    await productService.remove(selectedProduct.value.id)
    notify('Đã xóa sản phẩm thành công.')
    selectedProduct.value = null
    await loadProducts()
  } catch (requestError) {
    notify(requestError.message, 'error')
  } finally {
    deleting.value = false
  }
}

function clearFilters() {
  Object.assign(filters, { search: '', purchaseLocation: '' })
  loadProducts()
}

onMounted(loadProducts)
</script>

<template>
  <div class="page-heading">
    <div><p class="eyebrow">Danh mục</p><h1>Sản phẩm</h1><p>Quản lý thông tin và mức lợi nhuận dự kiến của sản phẩm.</p></div>
    <RouterLink class="button" to="/products/create">+ Thêm sản phẩm</RouterLink>
  </div>

  <form class="panel filters" @submit.prevent="loadProducts">
    <label class="field"><span>Tìm theo tên</span><input v-model.trim="filters.search" placeholder="Nhập tên sản phẩm" /></label>
    <label class="field"><span>Nơi mua</span><input v-model.trim="filters.purchaseLocation" placeholder="Taobao, 1688..." /></label>
    <button class="button">Lọc dữ liệu</button>
    <button type="button" class="button button--ghost" @click="clearFilters">Xóa bộ lọc</button>
  </form>

  <LoadingState v-if="loading" />
  <div v-else-if="error" class="error-panel">{{ error }} <button class="link-button" @click="loadProducts">Thử lại</button></div>
  <EmptyState v-else-if="!products.length" title="Không tìm thấy sản phẩm" description="Hãy thay đổi bộ lọc hoặc thêm sản phẩm mới.">
    <RouterLink class="button" to="/products/create">Thêm sản phẩm</RouterLink>
  </EmptyState>
  <section v-else class="panel table-panel">
    <div class="table-wrap desktop-only">
      <table>
        <thead><tr><th>Ảnh</th><th>Sản phẩm</th><th>Giá nhập</th><th>Giá bán</th><th>Lợi nhuận dự kiến</th><th>Nơi mua</th><th>Hành động</th></tr></thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td><ProductImage :src="product.imageUrl" :alt="product.name" /></td>
            <td><strong>{{ product.name }}</strong><small class="muted">{{ product.description || 'Không có mô tả' }}</small></td>
            <td>{{ formatCurrency(product.defaultPurchasePrice) }}</td>
            <td>{{ formatCurrency(product.defaultSalePrice) }}</td>
            <td><strong class="profit-text">{{ formatCurrency(product.defaultSalePrice - product.defaultPurchasePrice) }}</strong></td>
            <td>{{ product.purchaseLocation || '—' }}</td>
            <td><div class="row-actions"><RouterLink class="button button--small button--ghost" :to="`/products/${product.id}/edit`">Sửa</RouterLink><button class="button button--small button--danger" @click="selectedProduct = product">Xóa</button></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-cards mobile-only">
      <article v-for="product in products" :key="product.id" class="mobile-card product-card">
        <ProductImage :src="product.imageUrl" :alt="product.name" />
        <div><h3>{{ product.name }}</h3><p>{{ product.purchaseLocation || 'Chưa có nơi mua' }}</p></div>
        <dl><div><dt>Giá nhập</dt><dd>{{ formatCurrency(product.defaultPurchasePrice) }}</dd></div><div><dt>Giá bán</dt><dd>{{ formatCurrency(product.defaultSalePrice) }}</dd></div><div><dt>Lợi nhuận</dt><dd class="profit-text">{{ formatCurrency(product.defaultSalePrice - product.defaultPurchasePrice) }}</dd></div></dl>
        <div class="row-actions"><RouterLink class="button button--ghost" :to="`/products/${product.id}/edit`">Sửa</RouterLink><button class="button button--danger" @click="selectedProduct = product">Xóa</button></div>
      </article>
    </div>
  </section>

  <ConfirmDialog :open="Boolean(selectedProduct)" title="Xóa sản phẩm" :message="`Bạn có chắc muốn xóa “${selectedProduct?.name}”?`" :busy="deleting" @cancel="selectedProduct = null" @confirm="removeProduct" />
</template>
