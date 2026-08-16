import { apiClient, queryString } from './apiClient'

export const productService = {
  listCategories: () => apiClient('/products/categories'),
  list: params => apiClient(`/products${queryString(params)}`),
  get: id => apiClient(`/products/${id}`),
  create: payload => apiClient('/products', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiClient(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: id => apiClient(`/products/${id}`, { method: 'DELETE' })
}
