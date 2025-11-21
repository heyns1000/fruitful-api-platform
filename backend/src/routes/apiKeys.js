import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { query } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'
import { apiLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Get all API keys for user
router.get('/', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, key, scopes, status, created_at, last_used FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Create new API key
router.post('/', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { name, scopes } = req.body
    
    // Generate unique API key with VaultLevel 7 prefix
    const apiKey = `vl7_${uuidv4().replace(/-/g, '')}`
    
    const result = await query(
      'INSERT INTO api_keys (user_id, name, key, scopes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, name, apiKey, JSON.stringify(scopes), 'active']
    )
    
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Update API key
router.put('/:id', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, scopes, status } = req.body
    
    const result = await query(
      'UPDATE api_keys SET name = $1, scopes = $2, status = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, JSON.stringify(scopes), status, id, req.user.id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'API key not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Revoke API key
router.delete('/:id', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { id } = req.params
    
    const result = await query(
      'DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'API key not found' })
    }
    
    res.json({ message: 'API key revoked successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
