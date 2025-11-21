import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { apiLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Get usage statistics
router.get('/stats', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    // Mock data for demo
    res.json({
      totalRequests: 1234567,
      activeKeys: 3,
      successRate: 98.5,
      avgResponseTime: 145,
    })
  } catch (error) {
    next(error)
  }
})

// Get time series data
router.get('/timeseries', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { days = 7 } = req.query
    
    // Mock time series data
    const data = []
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        requests: Math.floor(Math.random() * 50000) + 10000,
        avgResponseTime: Math.floor(Math.random() * 100) + 100,
      })
    }
    
    res.json(data)
  } catch (error) {
    next(error)
  }
})

// Get detailed usage
router.get('/usage', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    // Mock usage data
    res.json({
      current_period: {
        requests: 45231,
        bandwidth: '12.5 GB',
        webhooks: 3421,
      },
      by_api: [
        { name: 'ClaimRoot', requests: 15234, percentage: 33.7 },
        { name: 'VaultMesh', requests: 12456, percentage: 27.5 },
        { name: 'SeedScrolls', requests: 10234, percentage: 22.6 },
        { name: 'PulseTrade', requests: 7307, percentage: 16.2 },
      ],
    })
  } catch (error) {
    next(error)
  }
})

export default router
