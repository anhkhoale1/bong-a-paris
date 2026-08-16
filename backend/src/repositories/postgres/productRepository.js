import crypto from 'node:crypto'

const mapProduct = row => row && ({
  id: row.id,
  productCategoryId: row.product_category_id,
  productCategoryName: row.product_category_name || '',
  name: row.name,
  description: row.description,
  defaultPurchasePrice: row.default_purchase_price,
  defaultSalePrice: row.default_sale_price,
  purchaseLocation: row.purchase_location,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString()
})

const columns = `
  p.id, p.product_category_id, c.name AS product_category_name, p.name, p.description,
  p.default_purchase_price, p.default_sale_price, p.purchase_location, p.created_at, p.updated_at
`

const baseQuery = `
  SELECT ${columns}
  FROM products p
  LEFT JOIN product_categories c ON c.id = p.product_category_id
`

export class PostgresProductRepository {
  constructor(pool) {
    this.pool = pool
  }

  async findAll() {
    const result = await this.pool.query(baseQuery)
    return result.rows.map(mapProduct)
  }

  async findById(id) {
    const result = await this.pool.query(`${baseQuery} WHERE p.id = $1`, [id])
    return mapProduct(result.rows[0]) || null
  }

  async listCategories() {
    const result = await this.pool.query('SELECT id, name FROM product_categories ORDER BY name')
    return result.rows.map(row => ({ id: row.id, name: row.name }))
  }

  async upsertCategoryByName(name) {
    const now = new Date().toISOString()
    const result = await this.pool.query(`
      INSERT INTO product_categories (id, name, created_at, updated_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO UPDATE SET updated_at = EXCLUDED.updated_at
      RETURNING id, name
    `, [`CAT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, name, now, now])
    return result.rows[0]
  }

  async create(product) {
    await this.pool.query(`
      INSERT INTO products (
        id, product_category_id, name, description, default_purchase_price, default_sale_price,
        purchase_location, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      product.id, product.productCategoryId, product.name, product.description,
      product.defaultPurchasePrice, product.defaultSalePrice, product.purchaseLocation,
      product.createdAt, product.updatedAt
    ])
    return this.findById(product.id)
  }

  async update(id, product) {
    const result = await this.pool.query(`
      UPDATE products SET
        product_category_id = $2,
        name = $3,
        description = $4,
        default_purchase_price = $5,
        default_sale_price = $6,
        purchase_location = $7,
        updated_at = $8
      WHERE id = $1
    `, [
      id, product.productCategoryId, product.name, product.description,
      product.defaultPurchasePrice, product.defaultSalePrice, product.purchaseLocation,
      product.updatedAt
    ])
    if (!result.rowCount) return null
    return this.findById(id)
  }

  async delete(id) {
    const result = await this.pool.query('DELETE FROM products WHERE id = $1', [id])
    return result.rowCount > 0
  }
}
