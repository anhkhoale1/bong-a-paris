<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/currency'
import LoadingState from '../common/LoadingState.vue'

const props = defineProps({
  order: { type: Object, default: null },
  submitting: Boolean,
  submitLabel: { type: String, default: 'Lưu đơn hàng' }
})
const emit = defineEmits(['submit', 'cancel'])

const products = ref([])
const loadingProducts = ref(true)
const loadError = ref('')
const formErrors = ref([])
const form = reactive({
  customerName: props.order?.customerName || '',
  customerPhone: props.order?.customerPhone || '',
  customerAddress: props.order?.customerAddress || '',
  note: props.order?.note || '',
  status: props.order?.status || 'PENDING_PURCHASE',
  items: (props.order?.items || []).map(item => ({ ...item }))
})

const totalCost = computed(() => form.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0), 0))
const totalRevenue = computed(() => form.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.salePrice) || 0), 0))
const totalProfit = computed(() => totalRevenue.value - totalCost.value)

function blankItem() {
  return { productId: '', quantity: 1, purchasePrice: 0, salePrice: 0, purchaseLocation: '', productName: '' }
}

function addItem() {
  form.items.push(blankItem())
}

function removeItem(index) {
  form.items.splice(index, 1)
}

function selectProduct(item) {
  const product = products.value.find(entry => entry.id === item.productId)
  if (!product) return
  Object.assign(item, {
    productName: product.name,
    purchasePrice: product.defaultPurchasePrice,
    salePrice: product.defaultSalePrice,
    purchaseLocation: product.purchaseLocation
  })
}

function validate() {
  const errors = []
  if (!form.customerName.trim()) errors.push('Tên khách hàng không được để trống.')
  if (!form.customerAddress.trim()) errors.push('Địa chỉ giao hàng không được để trống.')
  if (!form.items.length) errors.push('Đơn hàng phải có ít nhất một sản phẩm.')
  form.items.forEach((item, index) => {
    const label = `Sản phẩm ${index + 1}`
    if (!item.productId) errors.push(`${label}: hãy chọn sản phẩm.`)
    if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) errors.push(`${label}: số lượng phải là số nguyên lớn hơn 0.`)
    if (!Number.isFinite(Number(item.purchasePrice)) || Number(item.purchasePrice) < 0) errors.push(`${label}: giá nhập không hợp lệ.`)
    if (!Number.isFinite(Number(item.salePrice)) || Number(item.salePrice) < 0) errors.push(`${label}: giá bán không hợp lệ.`)
  })
  formErrors.value = errors
  return !errors.length
}

function submit() {
  if (!validate()) return
  emit('submit', {
    customerName: form.customerName.trim(),
    customerPhone: form.customerPhone.trim(),
    customerAddress: form.customerAddress.trim(),
    note: form.note.trim(),
    status: form.status,
    items: form.items.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: Number(item.quantity),
      purchasePrice: Number(item.purchasePrice),
      salePrice: Number(item.salePrice),
      purchaseLocation: String(item.purchaseLocation).trim()
    }))
  })
}

onMounted(async () => {
  try {
    products.value = await productService.list()
    if (!form.items.length) addItem()
  } catch (error) {
    loadError.value = error.message
  } finally {
    loadingProducts.value = false
  }
})
</script>

<template>
  <LoadingState v-if="loadingProducts" />
  <div v-else-if="loadError" class="error-panel">{{ loadError }}</div>
  <form v-else class="order-form" @submit.prevent="submit">
    <section class="panel">
      <div class="section-heading">
        <div><p class="eyebrow">Khách hàng</p><h2>Thông tin giao hàng</h2></div>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>Tên khách hàng <b>*</b></span>
          <input v-model.trim="form.customerName" placeholder="Nguyễn Văn A" required />
        </label>
        <label class="field">
          <span>Số điện thoại</span>
          <input v-model.trim="form.customerPhone" inputmode="tel" placeholder="09xxxxxxxx" />
        </label>
        <label class="field field--wide">
          <span>Địa chỉ giao hàng tại Việt Nam <b>*</b></span>
          <input v-model.trim="form.customerAddress" placeholder="Quận/Huyện, Tỉnh/Thành phố" required />
        </label>
        <label class="field field--wide">
          <span>Ghi chú</span>
          <textarea v-model.trim="form.note" rows="3" placeholder="Thời gian giao, yêu cầu đóng gói..."></textarea>
        </label>
      </div>
    </section>

    <section class="panel">
      <div class="section-heading">
        <div><p class="eyebrow">Sản phẩm</p><h2>Chi tiết đơn hàng</h2></div>
        <button type="button" class="button button--secondary" @click="addItem">+ Thêm sản phẩm</button>
      </div>

      <div v-if="!products.length" class="error-panel">Chưa có sản phẩm trong danh mục. Hãy tạo sản phẩm trước khi tạo đơn.</div>
      <div class="order-items-editor">
        <article v-for="(item, index) in form.items" :key="item.id || index" class="order-item-editor">
          <div class="order-item-editor__heading">
            <strong>Sản phẩm {{ index + 1 }}</strong>
            <button type="button" class="icon-button danger-text" title="Xóa khỏi đơn" @click="removeItem(index)">×</button>
          </div>
          <div class="order-item-editor__body">
            <div class="form-grid form-grid--items">
              <label class="field field--wide">
                <span>Chọn sản phẩm <b>*</b></span>
                <select v-model="item.productId" required @change="selectProduct(item)">
                  <option value="" disabled>Chọn từ danh mục</option>
                  <option v-if="item.productId && !products.some(product => product.id === item.productId)" :value="item.productId" disabled>{{ item.productName }} (đã xóa)</option>
                  <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}{{ product.productCategoryName ? ` (${product.productCategoryName})` : '' }}</option>
                </select>
              </label>
              <label class="field">
                <span>Số lượng <b>*</b></span>
                <input v-model.number="item.quantity" type="number" min="1" step="1" required />
              </label>
              <label class="field">
                <span>Giá nhập thực tế <b>*</b></span>
                 <input v-model.number="item.purchasePrice" type="number" min="0" step="1" readonly required />
               </label>
               <label class="field">
                 <span>Giá bán thực tế <b>*</b></span>
                 <input v-model.number="item.salePrice" type="number" min="0" step="1" readonly required />
               </label>
              <label class="field">
                <span>Nơi nhập thực tế</span>
                <input v-model.trim="item.purchaseLocation" />
              </label>
            </div>
          </div>
          <div class="line-summary">
            <span>Vốn <strong>{{ formatCurrency((Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0)) }}</strong></span>
            <span>Doanh thu <strong>{{ formatCurrency((Number(item.quantity) || 0) * (Number(item.salePrice) || 0)) }}</strong></span>
            <span>Lợi nhuận <strong :class="{ 'danger-text': (Number(item.salePrice) || 0) < (Number(item.purchasePrice) || 0) }">{{ formatCurrency((Number(item.quantity) || 0) * ((Number(item.salePrice) || 0) - (Number(item.purchasePrice) || 0))) }}</strong></span>
          </div>
        </article>
      </div>
    </section>

    <section class="order-totals">
      <div><span>Tổng vốn</span><strong>{{ formatCurrency(totalCost) }}</strong></div>
      <div><span>Tổng doanh thu</span><strong>{{ formatCurrency(totalRevenue) }}</strong></div>
      <div class="profit"><span>Lợi nhuận dự kiến</span><strong>{{ formatCurrency(totalProfit) }}</strong></div>
    </section>

    <div v-if="formErrors.length" class="error-panel">
      <strong>Vui lòng kiểm tra lại:</strong>
      <ul><li v-for="error in formErrors" :key="error">{{ error }}</li></ul>
    </div>

    <div class="form-actions">
      <button type="button" class="button button--ghost" :disabled="submitting" @click="$emit('cancel')">Hủy</button>
      <button class="button" :disabled="submitting || !products.length">{{ submitting ? 'Đang lưu...' : submitLabel }}</button>
    </div>
  </form>
</template>
