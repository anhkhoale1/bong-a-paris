import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const migrationsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../migrations')

export async function migrateDatabase(pool) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(76321904)')
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    const appliedResult = await client.query('SELECT name FROM schema_migrations')
    const applied = new Set(appliedResult.rows.map(row => row.name))
    const files = (await readdir(migrationsDirectory)).filter(file => file.endsWith('.sql')).sort()

    for (const file of files) {
      if (applied.has(file)) continue
      const sql = await readFile(path.join(migrationsDirectory, file), 'utf8')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}
