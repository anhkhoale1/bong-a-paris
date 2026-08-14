const orderColumns = `
  id, customer_name, customer_phone, customer_address, note, status,
  total_revenue, total_cost, total_profit, created_at, updated_at, completed_at
`

function mapItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    productImageUrl: row.product_image_url,
    quantity: row.quantity,
    purchasePrice: row.purchase_price,
    salePrice: row.sale_price,
    purchaseLocation: row.purchase_location,
    lineCost: row.line_cost,
    lineRevenue: row.line_revenue,
    lineProfit: row.line_profit
  }
}

function mapOrder(row, items = []) {
  if (!row) return null
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    note: row.note,
    status: row.status,
    items,
    totalRevenue: row.total_revenue,
    totalCost: row.total_cost,
    totalProfit: row.total_profit,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    completedAt: row.completed_at?.toISOString() || null
  }
}

async function findItems(client, orderIds) {
  if (!orderIds.length) return new Map()
  const result = await client.query(`
    SELECT * FROM order_items
    WHERE order_id = ANY($1::text[])
    ORDER BY id
  `, [orderIds])
  return result.rows.reduce((itemsByOrder, row) => {
    const items = itemsByOrder.get(row.order_id) || []
    items.push(mapItem(row))
    itemsByOrder.set(row.order_id, items)
    return itemsByOrder
  }, new Map())
}

async function insertOrder(client, order) {
  await client.query(`
    INSERT INTO orders (
      id, customer_name, customer_phone, customer_address, note, status,
      total_revenue, total_cost, total_profit, created_at, updated_at, completed_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, [
    order.id, order.customerName, order.customerPhone, order.customerAddress,
    order.note, order.status, order.totalRevenue, order.totalCost, order.totalProfit,
    order.createdAt, order.updatedAt, order.completedAt
  ])
}

async function insertItems(client, order) {
  for (const item of order.items) {
    await client.query(`
      INSERT INTO order_items (
        id, order_id, product_id, product_name, product_image_url, quantity,
        purchase_price, sale_price, purchase_location, line_cost, line_revenue, line_profit
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      item.id, order.id, item.productId, item.productName, item.productImageUrl,
      item.quantity, item.purchasePrice, item.salePrice, item.purchaseLocation,
      item.lineCost, item.lineRevenue, item.lineProfit
    ])
  }
}

export class PostgresOrderRepository {
  constructor(pool) {
    this.pool = pool
  }

  async findAll() {
    const result = await this.pool.query(`SELECT ${orderColumns} FROM orders`)
    const itemsByOrder = await findItems(this.pool, result.rows.map(row => row.id))
    return result.rows.map(row => mapOrder(row, itemsByOrder.get(row.id) || []))
  }

  async findById(id) {
    const result = await this.pool.query(`SELECT ${orderColumns} FROM orders WHERE id = $1`, [id])
    if (!result.rows[0]) return null
    const itemsByOrder = await findItems(this.pool, [id])
    return mapOrder(result.rows[0], itemsByOrder.get(id) || [])
  }

  async create(order) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      await insertOrder(client, order)
      await insertItems(client, order)
      await client.query('COMMIT')
      return order
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async update(id, order) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await client.query(`
        UPDATE orders SET
          customer_name = $2,
          customer_phone = $3,
          customer_address = $4,
          note = $5,
          status = $6,
          total_revenue = $7,
          total_cost = $8,
          total_profit = $9,
          updated_at = $10,
          completed_at = $11
        WHERE id = $1
      `, [
        id, order.customerName, order.customerPhone, order.customerAddress,
        order.note, order.status, order.totalRevenue, order.totalCost,
        order.totalProfit, order.updatedAt, order.completedAt
      ])
      if (!result.rowCount) {
        await client.query('ROLLBACK')
        return null
      }
      await client.query('DELETE FROM order_items WHERE order_id = $1', [id])
      await insertItems(client, order)
      await client.query('COMMIT')
      return order
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async delete(id) {
    const result = await this.pool.query('DELETE FROM orders WHERE id = $1', [id])
    return result.rowCount > 0
  }
}

