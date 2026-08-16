import { randomUUID } from 'node:crypto'
import { ORDER_STATUSES, isValidOrderStatus } from '../models/orderStatus.js'
import { AppError, validationError } from '../utils/AppError.js'

const makeId = prefix => `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`

function basicOrderErrors(input) {
  const payload = input && typeof input === 'object' ? input : {}
  const errors = []
  if (!String(payload.customerName || '').trim()) {
    errors.push({ field: 'customerName', message: 'Tên khách hàng không được để trống' })
  }
  if (!String(payload.customerAddress || '').trim()) {
    errors.push({ field: 'customerAddress', message: 'Địa chỉ giao hàng không được để trống' })
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push({ field: 'items', message: 'Đơn hàng phải có ít nhất một sản phẩm' })
  }
  if (payload.status !== undefined && !isValidOrderStatus(payload.status)) {
    errors.push({ field: 'status', message: 'Trạng thái đơn hàng không hợp lệ' })
  }
  if (payload.deliveryFee !== undefined) {
    const deliveryFee = Number(payload.deliveryFee)
    if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
      errors.push({ field: 'deliveryFee', message: 'Phí giao hàng phải là số lớn hơn hoặc bằng 0' })
    }
  }
  return errors
}

function itemErrors(input, index) {
  const item = input && typeof input === 'object' ? input : {}
  const errors = []
  const prefix = `items.${index}`
  const quantity = Number(item.quantity)
  if (!Number.isInteger(quantity) || quantity < 1) {
    errors.push({ field: `${prefix}.quantity`, message: 'Số lượng phải là số nguyên lớn hơn 0' })
  }
  for (const field of ['purchasePrice', 'salePrice']) {
    const value = Number(item[field])
    if (!Number.isFinite(value) || value < 0) {
      errors.push({ field: `${prefix}.${field}`, message: 'Giá phải là số lớn hơn hoặc bằng 0' })
    }
  }
  return errors
}

export class OrderService {
  constructor(orderRepository, productRepository) {
    this.orderRepository = orderRepository
    this.productRepository = productRepository
  }

  async list({ search = '', status = '', fromDate = '', toDate = '' } = {}) {
    if (status && !isValidOrderStatus(status)) {
      throw validationError([{ field: 'status', message: 'Trạng thái đơn hàng không hợp lệ' }])
    }

    const normalizedSearch = String(search).trim().toLocaleLowerCase('vi')
    const from = fromDate ? new Date(`${fromDate}T00:00:00.000`) : null
    const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null
    const orders = await this.orderRepository.findAll()

    return orders
      .filter(order => !normalizedSearch || `${order.id} ${order.customerName}`.toLocaleLowerCase('vi').includes(normalizedSearch))
      .filter(order => !status || order.status === status)
      .filter(order => !from || new Date(order.createdAt) >= from)
      .filter(order => !to || new Date(order.createdAt) <= to)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  async getById(id) {
    const order = await this.orderRepository.findById(id)
    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404)
    return order
  }

  async normalize(payload, current = {}) {
    payload = payload && typeof payload === 'object' ? payload : {}
    const errors = basicOrderErrors(payload)
    const sourceItems = Array.isArray(payload.items) ? payload.items : []
    const normalizedItems = []

    for (const [index, input] of sourceItems.entries()) {
      const item = input && typeof input === 'object' ? input : {}
      errors.push(...itemErrors(item, index))
      const product = await this.productRepository.findById(String(item.productId || ''))
      if (!product) {
        errors.push({ field: `items.${index}.productId`, message: 'Sản phẩm không tồn tại' })
        continue
      }

      const quantity = Number(item.quantity)
      const purchasePrice = Number(item.purchasePrice)
      const salePrice = Number(item.salePrice)
      if (!Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(purchasePrice) || purchasePrice < 0 || !Number.isFinite(salePrice) || salePrice < 0) continue

      const lineCost = quantity * purchasePrice
      const lineRevenue = quantity * salePrice
      normalizedItems.push({
        id: item.id || makeId('ITEM'),
        productId: product.id,
        productName: product.name,
        quantity,
        purchasePrice,
        salePrice,
        purchaseLocation: String(item.purchaseLocation || '').trim(),
        lineCost,
        lineRevenue,
        lineProfit: lineRevenue - lineCost
      })
    }

    if (errors.length) throw validationError(errors)

    const now = new Date().toISOString()
    const status = payload.status || current.status || 'PENDING_PURCHASE'
    const deliveryFee = payload.deliveryFee === undefined
      ? Number(current.deliveryFee || 0)
      : Number(payload.deliveryFee)
    const productCost = normalizedItems.reduce((sum, item) => sum + item.lineCost, 0)
    const totalCost = productCost + deliveryFee
    const totalRevenue = normalizedItems.reduce((sum, item) => sum + item.lineRevenue, 0)
    const completedAt = status === 'COMPLETED'
      ? current.status === 'COMPLETED' && current.completedAt ? current.completedAt : now
      : null

    return {
      id: current.id || makeId('DH'),
      customerName: String(payload.customerName).trim(),
      customerPhone: String(payload.customerPhone || '').trim(),
      customerAddress: String(payload.customerAddress).trim(),
      note: String(payload.note || '').trim(),
      deliveryFee,
      status,
      items: normalizedItems,
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      createdAt: current.createdAt || now,
      updatedAt: now,
      completedAt
    }
  }

  async create(payload) {
    payload = payload && typeof payload === 'object' ? payload : {}
    const order = await this.normalize({ ...payload, status: payload.status || 'PENDING_PURCHASE' })
    return this.orderRepository.create(order)
  }

  async update(id, payload) {
    const current = await this.getById(id)
    const order = await this.normalize(payload, current)
    return this.orderRepository.update(id, order)
  }

  async updateStatus(id, status) {
    if (!isValidOrderStatus(status)) {
      throw validationError([{ field: 'status', message: 'Trạng thái đơn hàng không hợp lệ' }])
    }
    const current = await this.getById(id)
    const now = new Date().toISOString()
    const order = {
      ...current,
      status,
      updatedAt: now,
      completedAt: status === 'COMPLETED'
        ? current.completedAt || now
        : null
    }
    return this.orderRepository.update(id, order)
  }

  async delete(id) {
    await this.getById(id)
    await this.orderRepository.delete(id)
  }

  async dashboardSummary(totalProducts) {
    const orders = await this.list()
    const totals = orders.reduce((summary, order) => ({
      revenue: summary.revenue + order.totalRevenue,
      cost: summary.cost + order.totalCost,
      profit: summary.profit + order.totalProfit
    }), { revenue: 0, cost: 0, profit: 0 })

    const ordersByStatus = ORDER_STATUSES.map(status => ({
      status,
      count: orders.filter(order => order.status === status).length
    }))
    const months = new Map()
    const products = new Map()

    for (const order of orders) {
      const month = order.createdAt.slice(0, 7)
      const monthly = months.get(month) || { month, totalRevenue: 0, totalProfit: 0 }
      monthly.totalRevenue += order.totalRevenue
      monthly.totalProfit += order.totalProfit
      months.set(month, monthly)

      for (const item of order.items) {
        const product = products.get(item.productId) || { productId: item.productId, productName: item.productName, totalRevenue: 0, quantity: 0 }
        product.totalRevenue += item.lineRevenue
        product.quantity += item.quantity
        products.set(item.productId, product)
      }
    }

    const monthly = [...months.values()].sort((a, b) => a.month.localeCompare(b.month))
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => order.status !== 'COMPLETED').length,
      completedOrders: orders.filter(order => order.status === 'COMPLETED').length,
      totalRevenue: totals.revenue,
      totalCost: totals.cost,
      totalProfit: totals.profit,
      totalProducts,
      ordersByStatus,
      monthlyRevenue: monthly.map(({ month, totalRevenue }) => ({ month, totalRevenue })),
      monthlyProfit: monthly.map(({ month, totalProfit }) => ({ month, totalProfit })),
      recentOrders: orders.slice(0, 5),
      topProducts: [...products.values()].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5)
    }
  }
}
