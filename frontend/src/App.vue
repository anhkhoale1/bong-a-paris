<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppToast from './components/common/AppToast.vue'
import { logout } from './services/authService.js'

const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const links = [
  { to: '/', label: 'Dashboard', icon: 'D' },
  { to: '/products', label: 'Sản phẩm', icon: 'P' },
  { to: '/orders', label: 'Đơn hàng', icon: 'O' }
]

const isActive = to => to === '/' ? route.path === '/' : route.path.startsWith(to)

function signOut() {
  logout()
  menuOpen.value = false
  router.replace('/login')
}
</script>

<template>
  <RouterView v-if="route.meta.public" />
  <div v-else class="app-shell">
    <aside class="sidebar" :class="{ open: menuOpen }">
      <div class="brand"><span>BP</span><div><strong>Bông à Paris</strong><small>Sales Manager</small></div></div>
      <nav>
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" :class="{ active: isActive(link.to) }" @click="menuOpen = false"><span>{{ link.icon }}</span>{{ link.label }}</RouterLink>
      </nav>
      <div class="sidebar__footer">
        <small>Quản lý bán hàng</small><strong>Việt Nam · Pháp</strong>
        <button class="sidebar__logout" type="button" @click="signOut">Đăng xuất</button>
      </div>
    </aside>
    <button v-if="menuOpen" class="menu-backdrop" aria-label="Đóng menu" @click="menuOpen = false"></button>

    <div class="app-main">
      <header class="mobile-header"><button class="menu-button" aria-label="Mở menu" @click="menuOpen = true">☰</button><strong>Bông à Paris</strong><RouterLink class="mobile-add" to="/orders/create">+</RouterLink></header>
      <main class="page-container"><RouterView /></main>
    </div>
    <AppToast />
  </div>
</template>
