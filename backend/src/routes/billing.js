import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { apiLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Get subscription
router.get('/subscription', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    res.json({
      plan: 'Enterprise',
      status: 'active',
      price: 499,
      billing_cycle: 'monthly',
      next_billing_date: '2024-02-01',
    })
  } catch (error) {
    next(error)
  }
})

// Get invoices
router.get('/invoices', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    res.json([
      {
        id: 1,
        date: '2024-01-01',
        description: 'Enterprise Plan - January 2024',
        amount: 499,
        status: 'Paid',
      },
      {
        id: 2,
        date: '2023-12-01',
        description: 'Enterprise Plan - December 2023',
        amount: 499,
        status: 'Paid',
      },
      {
        id: 3,
        date: '2023-11-01',
        description: 'Enterprise Plan - November 2023',
        amount: 499,
        status: 'Paid',
      },
    ])
  } catch (error) {
    next(error)
  }
})

// Update payment method
router.post('/payment-method', authMiddleware, apiLimiter, async (req, res, next) => {
  try {
    const { payment_method } = req.body
    
    res.json({
      message: 'Payment method updated successfully',
      payment_method,
    })
  } catch (error) {
    next(error)
  }
})

export default router
