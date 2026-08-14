import { randomUUID } from 'node:crypto'
import { AppError, validationError } from '../utils/AppError.js'

function validateProduct(input) {
  const payload = input && typeof input === 'object' ? input : {}
  const errors = []
  if (!String(payload.name || '').trim()) {
    errors.push({ field: 'name', message: 'Tên sản phẩm không được để trống' })
  }

  for (const field of ['defaultPurchasePrice', 'defaultSalePrice']) {
    const value = Number(payload[field])
    if (!Number.isFinite(value) || value < 0) {
      errors.push({ field, message: 'Giá phải là số lớn hơn hoặc bằng 0' })
    }
  }
  return errors
}

function normalizeProduct(input, current = {}) {
  const payload = input && typeof input === 'object' ? input : {}
  const now = new Date().toISOString()
  return {
    id: current.id || `PRD-${randomUUID().slice(0, 8).toUpperCase()}`,
    name: String(payload.name).trim(),
    description: String(payload.description || '').trim(),
    defaultPurchasePrice: Number(payload.defaultPurchasePrice),
    defaultSalePrice: Number(payload.defaultSalePrice),
    purchaseLocation: String(payload.purchaseLocation || '').trim(),
    imageUrl: String(payload.imageUrl || '').trim(),
    createdAt: current.createdAt || now,
    updatedAt: now
  }
}

export class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async list({ search = '', purchaseLocation = '' } = {}) {
    const normalizedSearch = String(search).trim().toLocaleLowerCase('vi')
    const normalizedLocation = String(purchaseLocation).trim().toLocaleLowerCase('vi')
    const products = await this.productRepository.findAll()

    return products
      .filter(product => !normalizedSearch || product.name.toLocaleLowerCase('vi').includes(normalizedSearch))
      .filter(product => !normalizedLocation || product.purchaseLocation.toLocaleLowerCase('vi').includes(normalizedLocation))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  async getById(id) {
    const product = await this.productRepository.findById(id)
    if (!product) throw new AppError('Không tìm thấy sản phẩm.', 404)
    return product
  }

  async create(payload) {
    const errors = validateProduct(payload)
    if (errors.length) throw validationError(errors)
    return this.productRepository.create(normalizeProduct(payload))
  }

  async update(id, payload) {
    const current = await this.getById(id)
    const errors = validateProduct(payload)
    if (errors.length) throw validationError(errors)
    return this.productRepository.update(id, normalizeProduct(payload, current))
  }

  async delete(id) {
    await this.getById(id)
    await this.productRepository.delete(id)
  }
}
