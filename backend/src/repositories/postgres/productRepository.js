const mapProduct = row => row && ({
  id: row.id,
  name: row.name,
  description: row.description,
  defaultPurchasePrice: row.default_purchase_price,
  defaultSalePrice: row.default_sale_price,
  purchaseLocation: row.purchase_location,
  imageUrl: row.image_url,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString()
})

const columns = `
  id, name, description, default_purchase_price, default_sale_price,
  purchase_location, image_url, created_at, updated_at
`

export class PostgresProductRepository {
  constructor(pool) {
    this.pool = pool
  }

  async findAll() {
    const result = await this.pool.query(`SELECT ${columns} FROM products`)
    return result.rows.map(mapProduct)
  }

  async findById(id) {
    const result = await this.pool.query(`SELECT ${columns} FROM products WHERE id = $1`, [id])
    return mapProduct(result.rows[0]) || null
  }

  async create(product) {
    const result = await this.pool.query(`
      INSERT INTO products (
        id, name, description, default_purchase_price, default_sale_price,
        purchase_location, image_url, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING ${columns}
    `, [
      product.id, product.name, product.description, product.defaultPurchasePrice,
      product.defaultSalePrice, product.purchaseLocation, product.imageUrl,
      product.createdAt, product.updatedAt
    ])
    return mapProduct(result.rows[0])
  }

  async update(id, product) {
    const result = await this.pool.query(`
      UPDATE products SET
        name = $2,
        description = $3,
        default_purchase_price = $4,
        default_sale_price = $5,
        purchase_location = $6,
        image_url = $7,
        updated_at = $8
      WHERE id = $1
      RETURNING ${columns}
    `, [
      id, product.name, product.description, product.defaultPurchasePrice,
      product.defaultSalePrice, product.purchaseLocation, product.imageUrl, product.updatedAt
    ])
    return mapProduct(result.rows[0]) || null
  }

  async delete(id) {
    const result = await this.pool.query('DELETE FROM products WHERE id = $1', [id])
    return result.rowCount > 0
  }
}

