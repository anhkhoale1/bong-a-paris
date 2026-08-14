<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ src: String, alt: { type: String, default: 'Ảnh sản phẩm' } })
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>

<template>
  <div class="product-image">
    <img v-if="src && !failed" :src="src" :alt="alt" loading="lazy" @error="failed = true" />
    <div v-else class="product-image__placeholder" aria-label="Chưa có ảnh">Ảnh</div>
  </div>
</template>
