import { mkdtemp } from 'node:fs/promises'
import { once } from 'node:events'
import { tmpdir } from 'node:os'
import path from 'node:path'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'

const validOrder = overrides => ({
  customerName: 'Nguyễn Văn Test',
  customerPhone: '0900000000',
  customerAddress: 'Quận 1, TP. Hồ Chí Minh',
  note: 'Đơn kiểm thử',
  deliveryFee: 0,
  items: [
    {
      productId: 'PRD-001',
      quantity: 2,
      purchasePrice: 400000,
      salePrice: 650000,
      purchaseLocation: 'Quảng Châu, Trung Quốc'
    }
  ],
  ...overrides
})

describe('Sales Manager API', () => {
  let app
  let server
  let dataDirectory
  let token

  const authenticate = requestBuilder => requestBuilder.set('Authorization', `Bearer ${token}`)

  beforeEach(async () => {
    dataDirectory = await mkdtemp(path.join(tmpdir(), 'sales-manager-test-'))
    app = createApp({
      dataDirectory,
      seedData: {
        products: [{
          id: 'PRD-001',
          productCategoryId: 'CAT-001',
          productCategoryName: 'Skincare',
          name: 'Sản phẩm kiểm thử',
          description: '',
          defaultPurchasePrice: 400000,
          defaultSalePrice: 650000,
          purchaseLocation: 'Quảng Châu, Trung Quốc',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z'
        }],
        orders: []
      },
      authConfig: {
        adminEmail: 'admin@example.com',
        adminPassword: 'test-password',
        jwtSecret: 'test-secret-with-at-least-32-characters'
      }
    })
    server = app.listen(0)
    await once(server, 'listening')
    const login = await request(server)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'test-password' })
      .expect(200)
    token = login.body.data.token
  })

  afterEach(() => new Promise(resolve => server.close(resolve)))

  it('từ chối truy cập API nghiệp vụ khi chưa đăng nhập', async () => {
    const response = await request(server).get('/api/orders').expect(401)
    expect(response.body.message).toContain('đăng nhập')
  })

  it('từ chối thông tin đăng nhập không đúng', async () => {
    await request(server)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'wrong-password' })
      .expect(401)
  })

  it('tạo đơn và tự tính lại tổng vốn, doanh thu, lợi nhuận', async () => {
    const response = await authenticate(request(server)
      .post('/api/orders')
      .send(validOrder({ deliveryFee: 50000, totalCost: 1, totalRevenue: 1, totalProfit: 1 })))
      .expect(201)

    expect(response.body.success).toBe(true)
    expect(response.body.data.status).toBe('PENDING_PURCHASE')
    expect(response.body.data.items[0]).toMatchObject({
      lineCost: 800000,
      lineRevenue: 1300000,
      lineProfit: 500000
    })
    expect(response.body.data).toMatchObject({
      deliveryFee: 50000,
      totalCost: 850000,
      totalRevenue: 1300000,
      totalProfit: 450000
    })
  })

  it('từ chối phí giao hàng âm', async () => {
    const response = await authenticate(request(server)
      .post('/api/orders')
      .send(validOrder({ deliveryFee: -1 })))
      .expect(400)

    expect(response.body.errors).toContainEqual(expect.objectContaining({ field: 'deliveryFee' }))
  })

  it('cho phép tạo đơn khi không có nơi nhập thực tế', async () => {
    const response = await authenticate(request(server)
      .post('/api/orders')
      .send(validOrder({ items: [{ ...validOrder().items[0], purchaseLocation: '' }] })))
      .expect(201)

    expect(response.body.data.items[0].purchaseLocation).toBe('')
  })

  it('từ chối số lượng không phải số nguyên dương', async () => {
    const response = await authenticate(request(server)
      .post('/api/orders')
      .send(validOrder({ items: [{ ...validOrder().items[0], quantity: 0 }] })))
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.errors).toContainEqual(expect.objectContaining({ field: 'items.0.quantity' }))
  })

  it('từ chối trạng thái không thuộc danh sách cho phép', async () => {
    const response = await authenticate(request(server)
      .post('/api/orders')
      .send(validOrder({ status: 'CANCELLED' })))
      .expect(400)

    expect(response.body.errors).toContainEqual(expect.objectContaining({ field: 'status' }))
  })

  it('lưu completedAt khi hoàn thành và xóa khi chuyển về trạng thái khác', async () => {
    const created = await authenticate(request(server).post('/api/orders').send(validOrder())).expect(201)
    const id = created.body.data.id

    const completed = await authenticate(request(server)
      .patch(`/api/orders/${id}/status`)
      .send({ status: 'COMPLETED' }))
      .expect(200)
    expect(completed.body.data.completedAt).toBeTruthy()

    const reopened = await authenticate(request(server)
      .patch(`/api/orders/${id}/status`)
      .send({ status: 'SHIPPED' }))
      .expect(200)
    expect(reopened.body.data.completedAt).toBeNull()
  })

  it('tạo và cập nhật sản phẩm', async () => {
    const payload = {
      productCategoryName: 'Phụ kiện',
      name: 'Kính mát nữ',
      description: 'Kính chống tia UV',
      defaultPurchasePrice: 120000,
      defaultSalePrice: 250000,
      purchaseLocation: 'Chợ đầu mối'
    }
    const created = await authenticate(request(server).post('/api/products').send(payload)).expect(201)
    expect(created.body.data.name).toBe(payload.name)
    expect(created.body.data.productCategoryName).toBe(payload.productCategoryName)

    const updated = await authenticate(request(server)
      .put(`/api/products/${created.body.data.id}`)
      .send({ ...payload, defaultSalePrice: 280000 }))
      .expect(200)
    expect(updated.body.data.defaultSalePrice).toBe(280000)
    expect(new Date(updated.body.data.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(created.body.data.updatedAt).getTime())
  })

  it('liệt kê và lọc sản phẩm theo phân loại', async () => {
    await authenticate(request(server).post('/api/products').send({
      productCategoryName: 'Kem chống nắng',
      name: 'La Roche-Posay Anthelios',
      description: '',
      defaultPurchasePrice: 300000,
      defaultSalePrice: 450000,
      purchaseLocation: 'Paris'
    })).expect(201)

    const categories = await authenticate(request(server).get('/api/products/categories')).expect(200)
    expect(categories.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Skincare' }),
      expect.objectContaining({ name: 'Kem chống nắng' })
    ]))

    const filtered = await authenticate(request(server)
      .get('/api/products?productCategoryName=Kem chống nắng'))
      .expect(200)
    expect(filtered.body.data).toHaveLength(1)
    expect(filtered.body.data[0].productCategoryName).toBe('Kem chống nắng')
  })

  it('tìm sản phẩm không dấu và viết tắt', async () => {
    await authenticate(request(server).post('/api/products').send({
      productCategoryName: 'Kem chống nắng',
      name: 'KCN La Roche-Posay xanh lá',
      description: '',
      defaultPurchasePrice: 320000,
      defaultSalePrice: 390000,
      purchaseLocation: 'Pháp'
    })).expect(201)

    const noAccent = await authenticate(request(server).get('/api/products?search=xanh la')).expect(200)
    expect(noAccent.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'KCN La Roche-Posay xanh lá' })
    ]))

    const abbreviation = await authenticate(request(server).get('/api/products?search=lrp xanh')).expect(200)
    expect(abbreviation.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'KCN La Roche-Posay xanh lá' })
    ]))
  })

  it('đọc lại dữ liệu đã ghi khi khởi tạo ứng dụng mới', async () => {
    const payload = {
      productCategoryName: 'Gia dụng',
      name: 'Sản phẩm lưu bền vững',
      description: '',
      defaultPurchasePrice: 100000,
      defaultSalePrice: 180000,
      purchaseLocation: 'Nhà cung cấp nội địa'
    }
    const created = await authenticate(request(server).post('/api/products').send(payload)).expect(201)

    const restartedServer = createApp({
      dataDirectory,
      authConfig: {
        adminEmail: 'admin@example.com',
        adminPassword: 'test-password',
        jwtSecret: 'test-secret-with-at-least-32-characters'
      }
    }).listen(0)
    await once(restartedServer, 'listening')
    try {
      const response = await authenticate(request(restartedServer).get(`/api/products/${created.body.data.id}`)).expect(200)
      expect(response.body.data.name).toBe(payload.name)
    } finally {
      await new Promise(resolve => restartedServer.close(resolve))
    }
  })
})
