/**
 * PulseTrade v2.0 Trading Engine
 * 9-second pulse cycle with Gorilla Vol burn optimization
 * FAA-TREATY-OMNI-4321-A13XN Compliant
 */

import axios from 'axios'
import config from '../config/index.js'

// In-memory storage for active pulses
const activePulses = new Map()
const pulseHistory = new Map()
const pulseIntervals = new Map()

/**
 * Analyze brand yield using AI
 */
export const analyzeBrandYield = async (brandData, apiKey) => {
  try {
    const prompt = `Analyze this brand data for trading yield potential: ${JSON.stringify(brandData)}. 
    Provide: 1) Yield score (0-100), 2) Risk level (low/medium/high), 3) Recommended action (buy/hold/sell).`

    const response = await axios.post(
      `http://localhost:${config.port}/api/ai/chat`,
      {
        prompt,
        provider: brandData.aiProvider || 'openai',
      },
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    )

    const aiAnalysis = response.data.content

    // Parse AI response to extract metrics
    const yieldScore = extractYieldScore(aiAnalysis)
    const riskLevel = extractRiskLevel(aiAnalysis)
    const action = extractAction(aiAnalysis)

    return {
      yieldScore,
      riskLevel,
      action,
      rawAnalysis: aiAnalysis,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Brand yield analysis error:', error)
    throw new Error(`AI analysis failed: ${error.message}`)
  }
}

// Helper functions to parse AI response
const extractYieldScore = (text) => {
  const match = text.match(/yield score[:\s]+(\d+)/i)
  return match ? parseInt(match[1]) : 50
}

const extractRiskLevel = (text) => {
  if (text.toLowerCase().includes('high risk')) return 'high'
  if (text.toLowerCase().includes('medium risk')) return 'medium'
  return 'low'
}

const extractAction = (text) => {
  if (text.toLowerCase().includes('sell')) return 'sell'
  if (text.toLowerCase().includes('buy')) return 'buy'
  return 'hold'
}

/**
 * Start a 9-second pulse cycle
 */
export const startPulse = async (pulseId, brandDataSource, apiKey, callback) => {
  try {
    if (activePulses.has(pulseId)) {
      throw new Error('Pulse already active')
    }

    const pulseData = {
      id: pulseId,
      status: 'active',
      startTime: Date.now(),
      cycleCount: 0,
      brandDataSource,
      totalBurn: 0,
      avgYield: 0,
      history: [],
    }

    activePulses.set(pulseId, pulseData)

    // Initialize pulse history
    if (!pulseHistory.has(pulseId)) {
      pulseHistory.set(pulseId, [])
    }

    // Start 9-second interval
    const intervalId = setInterval(async () => {
      try {
        const cycleStart = Date.now()
        
        // Fetch brand data
        const brandData = await fetchBrandData(brandDataSource)
        
        // Analyze with AI
        const analysis = await analyzeBrandYield(brandData, apiKey)
        
        // Calculate burn rate for this cycle
        const cycleTime = Date.now() - cycleStart
        const burnRate = (cycleTime / 9000) * 100 // Percentage of 9s target
        
        // Update pulse data
        const pulse = activePulses.get(pulseId)
        pulse.cycleCount++
        pulse.totalBurn += burnRate
        pulse.avgYield = (pulse.avgYield * (pulse.cycleCount - 1) + analysis.yieldScore) / pulse.cycleCount
        
        const cycleData = {
          cycle: pulse.cycleCount,
          timestamp: new Date().toISOString(),
          burnRate,
          yieldScore: analysis.yieldScore,
          riskLevel: analysis.riskLevel,
          action: analysis.action,
          cycleTime,
        }
        
        pulse.history.push(cycleData)
        
        // Store in history
        const history = pulseHistory.get(pulseId)
        history.push(cycleData)
        pulseHistory.set(pulseId, history)
        
        // Callback for real-time updates
        if (callback) {
          callback(cycleData)
        }
      } catch (error) {
        console.error(`Pulse ${pulseId} cycle error:`, error)
      }
    }, 9000) // 9-second pulse interval

    pulseIntervals.set(pulseId, intervalId)

    return {
      success: true,
      pulseId,
      message: 'Pulse started successfully',
      interval: '9s',
    }
  } catch (error) {
    throw new Error(`Failed to start pulse: ${error.message}`)
  }
}

/**
 * Stop a pulse
 */
export const stopPulse = async (pulseId) => {
  try {
    if (!activePulses.has(pulseId)) {
      throw new Error('Pulse not found or not active')
    }

    // Clear interval
    const intervalId = pulseIntervals.get(pulseId)
    if (intervalId) {
      clearInterval(intervalId)
      pulseIntervals.delete(pulseId)
    }

    // Update pulse status
    const pulse = activePulses.get(pulseId)
    pulse.status = 'stopped'
    pulse.endTime = Date.now()
    pulse.duration = pulse.endTime - pulse.startTime

    // Remove from active pulses
    activePulses.delete(pulseId)

    return {
      success: true,
      pulseId,
      message: 'Pulse stopped successfully',
      stats: {
        cycleCount: pulse.cycleCount,
        totalBurn: pulse.totalBurn,
        avgYield: pulse.avgYield,
        duration: pulse.duration,
      },
    }
  } catch (error) {
    throw new Error(`Failed to stop pulse: ${error.message}`)
  }
}

/**
 * Get pulse statistics
 */
export const getPulseStats = async (pulseId) => {
  try {
    const pulse = activePulses.get(pulseId)
    
    if (!pulse) {
      throw new Error('Pulse not found')
    }

    const gorillaBurnRate = pulse.cycleCount > 0 ? pulse.totalBurn / pulse.cycleCount : 0

    return {
      id: pulseId,
      status: pulse.status,
      cycleCount: pulse.cycleCount,
      avgYield: pulse.avgYield,
      gorillaBurnRate,
      gorillaBurnStatus: getGorillaBurnStatus(gorillaBurnRate),
      uptime: Date.now() - pulse.startTime,
      recentHistory: pulse.history.slice(-10), // Last 10 cycles
    }
  } catch (error) {
    throw new Error(`Failed to get pulse stats: ${error.message}`)
  }
}

/**
 * Get performance metrics across all pulses
 */
export const getPerformanceMetrics = async () => {
  try {
    const metrics = {
      activePulses: activePulses.size,
      totalPulses: pulseHistory.size,
      avgBurnRate: 0,
      optimalPulses: 0,
      activePulses: 0,
      buildingPulses: 0,
    }

    let totalBurn = 0
    let count = 0

    for (const [pulseId, pulse] of activePulses) {
      const burnRate = pulse.cycleCount > 0 ? pulse.totalBurn / pulse.cycleCount : 0
      totalBurn += burnRate
      count++

      if (burnRate > 40) metrics.optimalPulses++
      else if (burnRate > 4) metrics.activePulses++
      else metrics.buildingPulses++
    }

    metrics.avgBurnRate = count > 0 ? totalBurn / count : 0

    return metrics
  } catch (error) {
    throw new Error(`Failed to get performance metrics: ${error.message}`)
  }
}

/**
 * Get Gorilla Vol burn status
 */
const getGorillaBurnStatus = (burnRate) => {
  if (burnRate > 40) return '🦍 OPTIMAL'
  if (burnRate > 4) return '⚡ ACTIVE'
  return '🔄 BUILDING'
}

/**
 * Fetch brand data from data source
 */
const fetchBrandData = async (dataSource) => {
  // In a real implementation, this would fetch from various sources
  // For now, return mock data
  return {
    brandName: dataSource.brandName || 'Test Brand',
    marketCap: Math.random() * 1000000,
    sentiment: Math.random() * 100,
    volatility: Math.random() * 50,
    aiProvider: dataSource.aiProvider || 'openai',
  }
}

export default {
  analyzeBrandYield,
  startPulse,
  stopPulse,
  getPulseStats,
  getPerformanceMetrics,
}
