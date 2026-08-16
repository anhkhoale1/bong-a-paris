<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { productService } from '../../services/productService'

const props = defineProps({
  product: { type: Object, default: null },
  submitting: Boolean,
  submitLabel: { type: String, default: 'Lưu sản phẩm' }
})
const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  productCategoryName: '',
  name: '',
  description: '',
  defaultPurchasePrice: 0,
  defaultSalePrice: 0,
  purchaseLocation: ''
})
const errors = reactive({})
const categories = ref([])

watch(() => props.product, product => {
  Object.assign(form, {
    productCategoryName: product?.productCategoryName || '',
    name: product?.name || '',
    description: product?.description || '',
    defaultPurchasePrice: product?.defaultPurchasePrice ?? 0,
    defaultSalePrice: product?.defaultSalePrice ?? 0,
    purchaseLocation: product?.purchaseLocation || ''
  })
}, { immediate: true })

onMounted(async () => {
  try {
    categories.value = await productService.listCategories()
  } catch {
    categories.value = []
  }
})

function validate() {
  Object.keys(errors).forEach(key => delete errors[key])
  if (!form.productCategoryName.trim()) errors.productCategoryName = 'Phân loại mặt hàng không được để trống.'
  if (!form.name.trim()) errors.name = 'Tên sản phẩm không được để trống.'
  if (!Number.isFinite(Number(form.defaultPurchasePrice)) || Number(form.defaultPurchasePrice) < 0) errors.defaultPurchasePrice = 'Giá nhập phải lớn hơn hoặc bằng 0.'
  if (!Number.isFinite(Number(form.defaultSalePrice)) || Number(form.defaultSalePrice) < 0) errors.defaultSalePrice = 'Giá bán phải lớn hơn hoặc bằng 0.'
  return Object.keys(errors).length === 0
}

function submit() {
  if (!validate()) return
  emit('submit', {
    ...form,
    defaultPurchasePrice: Number(form.defaultPurchasePrice),
    defaultSalePrice: Number(form.defaultSalePrice)
  })
}
</script>

<template>
  <form class="panel form" @submit.prevent="submit">
    <div class="form-grid">
      <label class="field">
        <span>Phân loại mặt hàng <b>*</b></span>
        <input v-model.trim="form.productCategoryName" list="product-categories" :class="{ invalid: errors.productCategoryName }" placeholder="Ví dụ: Kem chống nắng" />
        <datalist id="product-categories"><option v-for="category in categories" :key="category.id" :value="category.name" /></datalist>
        <small v-if="errors.productCategoryName" class="field__error">{{ errors.productCategoryName }}</small>
      </label>

      <label class="field field--wide">
        <span>Tên sản phẩm <b>*</b></span>
        <input v-model.trim="form.name" :class="{ invalid: errors.name }" placeholder="Ví dụ: Túi xách nữ" />
        <small v-if="errors.name" class="field__error">{{ errors.name }}</small>
      </label>

      <label class="field field--wide">
        <span>Mô tả</span>
        <textarea v-model.trim="form.description" rows="4" placeholder="Mô tả ngắn về sản phẩm"></textarea>
      </label>

      <label class="field">
        <span>Giá nhập mặc định <b>*</b></span>
        <input v-model.number="form.defaultPurchasePrice" type="number" min="0" step="1" />
        <small v-if="errors.defaultPurchasePrice" class="field__error">{{ errors.defaultPurchasePrice }}</small>
      </label>

      <label class="field">
        <span>Giá bán mặc định <b>*</b></span>
        <input v-model.number="form.defaultSalePrice" type="number" min="0" step="1" />
        <small v-if="errors.defaultSalePrice" class="field__error">{{ errors.defaultSalePrice }}</small>
      </label>

      <label class="field">
        <span>Nơi mua / nhà cung cấp</span>
        <input v-model.trim="form.purchaseLocation" placeholder="Ví dụ: Taobao" />
      </label>
    </div>

    <div class="form-actions">
      <button type="button" class="button button--ghost" :disabled="submitting" @click="$emit('cancel')">Hủy</button>
      <button class="button" :disabled="submitting">{{ submitting ? 'Đang lưu...' : submitLabel }}</button>
    </div>
  </form>
</template>
