import 'dotenv/config'
import { createDatabasePool } from '../database/client.js'
import { migrateDatabase } from '../database/migrate.js'

const pool = createDatabasePool()

async function main() {
  try {
    await migrateDatabase(pool)
    console.log('Database migrations applied successfully.')
  } finally {
    await pool.end().catch(() => {})
  }
}

main().catch(error => {
  console.error('Failed to apply database migrations:', error)
  process.exitCode = 1
})
