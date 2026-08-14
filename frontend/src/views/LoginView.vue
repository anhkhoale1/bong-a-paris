<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../services/authService.js'

const router = useRouter()
const route = useRoute()
const form = reactive({ email: '', password: '' })
const error = ref('')
const submitting = ref(false)

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await login(form)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/'
    await router.replace(redirect)
  } catch (loginError) {
    error.value = loginError.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <div class="login-brand"><span>BP</span></div>
      <p class="eyebrow">Không gian quản trị</p>
      <h1>Đăng nhập</h1>
      <p class="login-intro">Theo dõi sản phẩm, đơn hàng và kết quả kinh doanh của Bông à Paris.</p>

      <form class="login-form" @submit.prevent="submit">
        <div v-if="error" class="error-panel" role="alert">{{ error }}</div>
        <label class="field">
          Email
          <input v-model.trim="form.email" type="email" autocomplete="username" required autofocus>
        </label>
        <label class="field">
          Mật khẩu
          <input v-model="form.password" type="password" autocomplete="current-password" required>
        </label>
        <button class="button login-button" type="submit" :disabled="submitting">
          {{ submitting ? 'Đang đăng nhập…' : 'Đăng nhập' }}
        </button>
      </form>
    </section>
  </main>
</template>

