/**
 * PulseTrade API Routes
 * FAA-TREATY-OMNI-4321-A13XN Compliant
 * VaultLevel 7 Security
 */

import express from 'express'
import { apiKeyMiddleware } from '../middleware/auth.js'
import { strictLimiter } from '../middleware/rateLimiter.js'
import { pulseAuth } from '../middleware/pulseAuth.js'
import * as PulseTradeService from '../services/PulseTrade.js'

const router = express.Router()

/**
 * POST /api/pulse/start
 * Start a new pulse trading cycle
 */
router.post('/start', apiKeyMiddleware, strictLimiter, pulseAuth, async (req, res, next) => {
  try {
    const { pulseId, brandDataSource } = req.body

    if (!pulseId) {
      return res.status(400).json({
        message: 'pulseId is required',
      })
    }

    if (!brandDataSource || !brandDataSource.brandName) {
      return res.status(400).json({
        message: 'brandDataSource with brandName is required',
      })
    }

    const apiKey = req.headers['x-api-key']

    const result = await PulseTradeService.startPulse(
      pulseId,
      brandDataSource,
      apiKey,
      null // callback handled via polling
    )

    res.json(result)
  } catch (error) {
    console.error('Pulse start error:', error)
    res.status(400).json({
      message: error.message,
    })
  }
})

/**
 * POST /api/pulse/stop
 * Stop an active pulse
 */
router.post('/stop', apiKeyMiddleware, strictLimiter, pulseAuth, async (req, res, next) => {
  try {
    const { pulseId } = req.body

    if (!pulseId) {
      return res.status(400).json({
        message: 'pulseId is required',
      })
    }

    const result = await PulseTradeService.stopPulse(pulseId)

    res.json(result)
  } catch (error) {
    console.error('Pulse stop error:', error)
    res.status(400).json({
      message: error.message,
    })
  }
})

/**
 * GET /api/pulse/status/:pulseId
 * Get status and stats for a specific pulse
 */
router.get('/status/:pulseId', apiKeyMiddleware, pulseAuth, async (req, res, next) => {
  try {
    const { pulseId } = req.params

    const stats = await PulseTradeService.getPulseStats(pulseId)

    res.json(stats)
  } catch (error) {
    console.error('Pulse status error:', error)
    res.status(400).json({
      message: error.message,
    })
  }
})

/**
 * GET /api/pulse/metrics
 * Get overall performance metrics
 */
router.get('/metrics', apiKeyMiddleware, pulseAuth, async (req, res, next) => {
  try {
    const metrics = await PulseTradeService.getPerformanceMetrics()

    res.json(metrics)
  } catch (error) {
    console.error('Pulse metrics error:', error)
    res.status(400).json({
      message: error.message,
    })
  }
})

export default router
