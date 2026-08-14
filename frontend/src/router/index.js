import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import OrderCreateView from '../views/OrderCreateView.vue'
import OrderDetailView from '../views/OrderDetailView.vue'
import OrderEditView from '../views/OrderEditView.vue'
import OrderListView from '../views/OrderListView.vue'
import ProductCreateView from '../views/ProductCreateView.vue'
import ProductEditView from '../views/ProductEditView.vue'
import ProductListView from '../views/ProductListView.vue'
import LoginView from '../views/LoginView.vue'
import { isLoggedIn } from '../services/authService.js'

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { title: 'Đăng nhập', public: true } },
  { path: '/', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard' } },
  { path: '/products', name: 'products', component: ProductListView, meta: { title: 'Sản phẩm' } },
  { path: '/products/create', name: 'product-create', component: ProductCreateView, meta: { title: 'Thêm sản phẩm' } },
  { path: '/products/:id/edit', name: 'product-edit', component: ProductEditView, meta: { title: 'Sửa sản phẩm' } },
  { path: '/orders', name: 'orders', component: OrderListView, meta: { title: 'Đơn hàng' } },
  { path: '/orders/create', name: 'order-create', component: OrderCreateView, meta: { title: 'Tạo đơn hàng' } },
  { path: '/orders/:id', name: 'order-detail', component: OrderDetailView, meta: { title: 'Chi tiết đơn hàng' } },
  { path: '/orders/:id/edit', name: 'order-edit', component: OrderEditView, meta: { title: 'Sửa đơn hàng' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) })
router.beforeEach(to => {
  if (!to.meta.public && !isLoggedIn()) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && isLoggedIn()) return { name: 'dashboard' }
})
router.afterEach(to => { document.title = `${to.meta.title} · Bán hàng Paris` })

export default router
