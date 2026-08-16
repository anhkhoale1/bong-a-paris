import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import xlsx from 'xlsx'
import { createDatabasePool } from '../database/client.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultWorkbookPath = path.resolve(__dirname, '../../data/bong-a-paris-data.xlsx')
const requiredHeaders = [
  'Phân loại mặt hàng',
  'Tên sản phẩm',
  'Chi phí Ship',
  'Giá bán',
  'Lãi'
]

const purchasePriceHeaders = ['Giá nhập', 'Giá nhập VNĐ']

function parseArgs(argv) {
  const flags = new Set(argv)
  const fileArg = argv.find(arg => arg.startsWith('--file='))
  return {
    write: flags.has('--write'),
    filePath: fileArg ? path.resolve(process.cwd(), fileArg.slice('--file='.length)) : defaultWorkbookPath
  }
}

function trimHeader(value) {
  return String(value || '').trim()
}

function normalizeMoney(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) return null
  return Math.round(amount)
}

function buildRowObject(headers, row) {
  return headers.reduce((record, header, index) => {
    if (header) record[header] = row[index]
    return record
  }, {})
}

function calculateExpectedProfit(row) {
  const purchasePrice = normalizeMoney(readValue(row, purchasePriceHeaders))
  const shippingCost = normalizeMoney(row['Chi phí Ship'])
  const salePrice = normalizeMoney(row['Giá bán'])
  if (purchasePrice === null || shippingCost === null || salePrice === null) return null
  return salePrice - purchasePrice - shippingCost
}

function readValue(row, headers) {
  for (const header of headers) {
    if (row[header] !== undefined) return row[header]
  }
  return undefined
}

function parseWorkbook(filePath) {
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null })
  const headers = (rows[0] || []).map(trimHeader)
  const dataRows = rows
    .slice(1)
    .map((row, index) => ({ rowNumber: index + 2, row }))
    .filter(({ row }) => row.some(value => value !== null && String(value).trim() !== ''))

  return { sheetName, headers, dataRows }
}

function validateHeaders(headers) {
  const missing = requiredHeaders.filter(header => !headers.includes(header))
  if (!purchasePriceHeaders.some(header => headers.includes(header))) {
    missing.push(purchasePriceHeaders[0])
  }
  return missing.map(header => ({ rowNumber: 1, field: header, message: 'Thiếu cột bắt buộc trong file Excel' }))
}

function mapProducts(headers, dataRows) {
  const errors = []
  const warnings = []
  const products = []
  const categoryNames = new Set()
  const seenNames = new Map()

  for (const { rowNumber, row } of dataRows) {
    const record = buildRowObject(headers, row)
    const categoryName = String(record['Phân loại mặt hàng'] || '').trim()
    const name = String(record['Tên sản phẩm'] || '').trim()
    const defaultPurchasePrice = normalizeMoney(readValue(record, purchasePriceHeaders))
    const shippingCost = normalizeMoney(record['Chi phí Ship'])
    const defaultSalePrice = normalizeMoney(record['Giá bán'])
    const reportedProfit = record['Lãi'] == null || String(record['Lãi']).trim() === ''
      ? null
      : normalizeMoney(record['Lãi'])
    const purchaseLocation = String(record['Note'] || '').trim()

    if (!categoryName) errors.push({ rowNumber, field: 'Phân loại mặt hàng', message: 'Không được để trống' })
    if (!name) errors.push({ rowNumber, field: 'Tên sản phẩm', message: 'Không được để trống' })
    if (defaultPurchasePrice === null) errors.push({ rowNumber, field: 'Giá nhập', message: 'Phải là số >= 0' })
    if (shippingCost === null) errors.push({ rowNumber, field: 'Chi phí Ship', message: 'Phải là số >= 0' })
    if (defaultSalePrice === null) errors.push({ rowNumber, field: 'Giá bán', message: 'Phải là số >= 0' })

    if (name) {
      const normalizedName = name.toLocaleLowerCase('vi')
      const previousRow = seenNames.get(normalizedName)
      if (previousRow) {
        warnings.push({ rowNumber, field: 'Tên sản phẩm', message: `Trùng với dòng ${previousRow}` })
      } else {
        seenNames.set(normalizedName, rowNumber)
      }
    }

    const expectedProfit = calculateExpectedProfit(record)
    if (reportedProfit !== null && expectedProfit !== null && reportedProfit !== expectedProfit) {
      warnings.push({
        rowNumber,
        field: 'Lãi',
        message: `Lãi trong file là ${reportedProfit} nhưng tính lại được ${expectedProfit}`
      })
    }

    if (categoryName && name && defaultPurchasePrice !== null && shippingCost !== null && defaultSalePrice !== null) {
      categoryNames.add(categoryName)
      products.push({
        rowNumber,
        categoryName,
        name,
        description: '',
        defaultPurchasePrice,
        defaultSalePrice,
        purchaseLocation,
        imageUrl: ''
      })
    }
  }

  return { errors, warnings, products, categoryNames: [...categoryNames].sort((a, b) => a.localeCompare(b, 'vi')) }
}

function printPlan({ filePath, sheetName, headers, errors, warnings, products, categoryNames, write }) {
  console.log(`Import mode: ${write ? 'write' : 'dry-run'}`)
  console.log(`Workbook: ${filePath}`)
  console.log(`Sheet: ${sheetName}`)
  console.log(`Headers: ${headers.filter(Boolean).join(' | ')}`)
  console.log(`Categories found: ${categoryNames.length}`)
  console.log(`Valid product rows: ${products.length}`)
  console.log('')
  console.log('Column mapping:')
  console.log('- Phân loại mặt hàng -> product_categories.name')
  console.log('- Tên sản phẩm -> products.name')
  console.log('- Giá nhập / Giá nhập VNĐ -> products.default_purchase_price')
  console.log('- Giá nhập € -> ignored')
  console.log('- Chi phí Ship -> validation only, not stored')
  console.log('- Giá bán -> products.default_sale_price')
  console.log('- Lãi -> validation warning only, not stored')
  console.log('- Note -> products.purchase_location (optional)')
  console.log('')
  console.log('Validation rules:')
  console.log('- Skip fully empty rows')
  console.log('- Require category and product name')
  console.log('- Require numeric Gia nhap, Chi phi Ship, Gia ban >= 0')
  console.log('- Note is optional')
  console.log('- Round money values to integer VND before insert')
  console.log('- Compare Lai with calculated sale - purchase - shipping and warn on mismatch')
  console.log('- Warn on duplicate product names in the workbook')

  if (errors.length) {
    console.log('')
    console.log('Errors:')
    for (const error of errors) {
      console.log(`- Row ${error.rowNumber} | ${error.field}: ${error.message}`)
    }
  }

  if (warnings.length) {
    console.log('')
    console.log('Warnings:')
    for (const warning of warnings) {
      console.log(`- Row ${warning.rowNumber} | ${warning.field}: ${warning.message}`)
    }
  }
}

async function writeToDatabase(products, categoryNames) {
  const pool = createDatabasePool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const categoryIds = new Map()
    for (const categoryName of categoryNames) {
      const existing = await client.query('SELECT id FROM product_categories WHERE name = $1', [categoryName])

      if (existing.rows[0]) {
        categoryIds.set(categoryName, existing.rows[0].id)
        continue
      }

      const id = `CAT-${randomUUID().slice(0, 8).toUpperCase()}`
      const now = new Date().toISOString()
      await client.query(
        'INSERT INTO product_categories (id, name, created_at, updated_at) VALUES ($1, $2, $3, $4)',
        [id, categoryName, now, now]
      )
      categoryIds.set(categoryName, id)
    }

    for (const product of products) {
      const existing = await client.query('SELECT id FROM products WHERE name = $1 LIMIT 1', [product.name])
      const now = new Date().toISOString()
      const productCategoryId = categoryIds.get(product.categoryName) || null

      if (existing.rows[0]) {
        await client.query(
          `UPDATE products
           SET product_category_id = $2,
               name = $3,
               description = $4,
               default_purchase_price = $5,
               default_sale_price = $6,
               purchase_location = $7,
               image_url = $8,
               updated_at = $9
           WHERE id = $1`,
          [
            existing.rows[0].id,
            productCategoryId,
            product.name,
            product.description,
            product.defaultPurchasePrice,
            product.defaultSalePrice,
            product.purchaseLocation,
            product.imageUrl,
            now
          ]
        )
        continue
      }

      await client.query(
        `INSERT INTO products (
          id, product_category_id, name, description, default_purchase_price,
          default_sale_price, purchase_location, image_url, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          `PRD-${randomUUID().slice(0, 8).toUpperCase()}`,
          productCategoryId,
          product.name,
          product.description,
          product.defaultPurchasePrice,
          product.defaultSalePrice,
          product.purchaseLocation,
          product.imageUrl,
          now,
          now
        ]
      )
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

async function main() {
  const { write, filePath } = parseArgs(process.argv.slice(2))
  const { sheetName, headers, dataRows } = parseWorkbook(filePath)
  const headerErrors = validateHeaders(headers)
  const { errors, warnings, products, categoryNames } = mapProducts(headers, dataRows)
  const allErrors = [...headerErrors, ...errors]

  printPlan({ filePath, sheetName, headers, errors: allErrors, warnings, products, categoryNames, write })

  if (allErrors.length) {
    process.exitCode = 1
    return
  }

  if (!write) {
    console.log('')
    console.log('Dry-run only. Re-run with --write to apply the import after review.')
    return
  }

  await writeToDatabase(products, categoryNames)
  console.log('')
  console.log(`Imported ${products.length} products and ${categoryNames.length} categories.`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
