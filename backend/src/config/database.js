import pg from 'pg'
import config from './index.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: config.database.url,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export const query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  
  if (config.faaX13.auditLog) {
    console.log('Query executed', { text, duration, rows: res.rowCount })
  }
  
  return res
}

export const getClient = async () => {
  const client = await pool.connect()
  return client
}

export default pool
