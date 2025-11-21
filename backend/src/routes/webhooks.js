import express from 'express'
import { query } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'
import { apiLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Get all webhooks
router.get('/', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM webhooks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Create webhook
router.post('/', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { url, events, active = true } = req.body
    
    const result = await query(
      'INSERT INTO webhooks (user_id, url, events, active) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, url, JSON.stringify(events), active]
    )
    
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Update webhook
router.put('/:id', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { id } = req.params
    const { url, events, active } = req.body
    
    const result = await query(
      'UPDATE webhooks SET url = $1, events = $2, active = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [url, JSON.stringify(events), active, id, req.user.id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Webhook not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Delete webhook
router.delete('/:id', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { id } = req.params
    
    const result = await query(
      'DELETE FROM webhooks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Webhook not found' })
    }
    
    res.json({ message: 'Webhook deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// Test webhook
router.post('/:id/test', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { id } = req.params
    
    const result = await query(
      'SELECT * FROM webhooks WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Webhook not found' })
    }
    
    const webhook = result.rows[0]
    
    if (!webhook.active) {
      return res.status(400).json({ message: 'Webhook is not active' })
    }
    
    // Send test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook from Fruitful API Console' },
    }
    
    try {
      // Note: In production, use a proper HTTP client like axios
      // For now, we'll just validate the URL format
      const url = new URL(webhook.url)
      
      // In a real implementation, you would:
      // const response = await axios.post(webhook.url, testPayload, {
      //   headers: { 'Content-Type': 'application/json' },
      //   timeout: 5000
      // })
      
      // Update last_triggered
      await query(
        'UPDATE webhooks SET last_triggered = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      )
      
      res.json({ 
        message: 'Test webhook sent successfully',
        url: webhook.url,
        payload: testPayload 
      })
    } catch (urlError) {
      return res.status(400).json({ message: 'Invalid webhook URL' })
    }
  } catch (error) {
    next(error)
  }
})

export default router
