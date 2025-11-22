/**
 * Gorilla Vol Burn Monitoring API Routes
 * FAA-TREATY-OMNI-4321-A13XN Compliant
 */

import express from 'express'
import { apiKeyMiddleware } from '../middleware/auth.js'
import { apiLimiter } from '../middleware/rateLimiter.js'
import { pulseAuth } from '../middleware/pulseAuth.js'
import * as PulseTradeService from '../services/PulseTrade.js'

const router = express.Router()

/**
 * GET /api/gorilla-burn
 * Calculate Gorilla Vol burn rate from pulse history
 */
router.get('/gorilla-burn', apiKeyMiddleware, apiLimiter, pulseAuth, async (req, res, next) => {
  try {
    const metrics = await PulseTradeService.getPerformanceMetrics()
    
    const burnRate = metrics.avgBurnRate
    const status = getGorillaBurnStatus(burnRate)
    
    res.json({
      burnRate: burnRate.toFixed(2),
      status,
      target: {
        minimum: 4.0,
        optimal: 40.0,
      },
      metrics: {
        activePulses: metrics.activePulses,
        totalPulses: metrics.totalPulses,
        optimalCount: metrics.optimalPulses,
        activeCount: metrics.activePulses,
        buildingCount: metrics.buildingPulses,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Gorilla burn error:', error)
    res.status(500).json({
      message: error.message,
    })
  }
})

/**
 * GET /api/gorilla-status
 * Get current Gorilla Vol status with emoji indicators
 */
router.get('/gorilla-status', apiKeyMiddleware, apiLimiter, pulseAuth, async (req, res, next) => {
  try {
    const metrics = await PulseTradeService.getPerformanceMetrics()
    
    const burnRate = metrics.avgBurnRate
    const status = getGorillaBurnStatus(burnRate)
    const emoji = getStatusEmoji(burnRate)
    const description = getStatusDescription(burnRate)
    
    res.json({
      status,
      emoji,
      description,
      burnRate: burnRate.toFixed(2),
      activePulses: metrics.activePulses,
      breakdown: {
        optimal: {
          count: metrics.optimalPulses,
          emoji: '🦍',
          description: 'OPTIMAL (>40%)',
        },
        active: {
          count: metrics.activePulses,
          emoji: '⚡',
          description: 'ACTIVE (>4%)',
        },
        building: {
          count: metrics.buildingPulses,
          emoji: '🔄',
          description: 'BUILDING (<4%)',
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Gorilla status error:', error)
    res.status(500).json({
      message: error.message,
    })
  }
})

/**
 * Helper: Get Gorilla burn status
 */
const getGorillaBurnStatus = (burnRate) => {
  if (burnRate > 40) return '🦍 OPTIMAL'
  if (burnRate > 4) return '⚡ ACTIVE'
  return '🔄 BUILDING'
}

/**
 * Helper: Get status emoji
 */
const getStatusEmoji = (burnRate) => {
  if (burnRate > 40) return '🦍'
  if (burnRate > 4) return '⚡'
  return '🔄'
}

/**
 * Helper: Get status description
 */
const getStatusDescription = (burnRate) => {
  if (burnRate > 40) {
    return 'Gorilla Vol burn rate is OPTIMAL! Trading efficiency exceeds 40%.'
  }
  if (burnRate > 4) {
    return 'Gorilla Vol burn rate is ACTIVE. Trading efficiency above minimum threshold.'
  }
  return 'Gorilla Vol burn rate is BUILDING. Efficiency below 4% threshold.'
}

export default router
