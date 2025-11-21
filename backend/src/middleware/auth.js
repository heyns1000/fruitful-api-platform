import jwt from 'jsonwebtoken'
import config from '../config/index.js'
import { query } from '../config/database.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
    
    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const apiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key']
    
    if (!apiKey) {
      return res.status(401).json({ message: 'No API key provided' })
    }
    
    // Validate API key against database
    const result = await query(
      'SELECT * FROM api_keys WHERE key = $1 AND status = $2',
      [apiKey, 'active']
    )
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid or inactive API key' })
    }
    
    const apiKeyData = result.rows[0]
    
    // Update last_used timestamp
    await query(
      'UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = $1',
      [apiKeyData.id]
    )
    
    // Attach API key data to request
    req.apiKey = apiKeyData
    req.user = { id: apiKeyData.user_id }
    next()
  } catch (error) {
    console.error('API key validation error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
