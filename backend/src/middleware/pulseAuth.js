/**
 * VaultLevel 7 Pulse Authentication Middleware
 * FAA-TREATY-OMNI-4321-A13XN Compliant
 */

import config from '../config/index.js'
import * as KeyRegistryService from '../services/KeyRegistry.js'

/**
 * VaultLevel 7 authentication for Pulse operations
 * Validates against Key Registry for pulse service keys
 */
export const pulseAuth = async (req, res, next) => {
  try {
    const pulseKey = req.headers['x-pulse-key']
    const vaultLevel = req.headers['x-vault-level']
    
    if (!pulseKey) {
      return res.status(401).json({
        message: 'Pulse authentication required',
        error: 'Missing x-pulse-key header',
      })
    }
    
    if (!vaultLevel || parseInt(vaultLevel) < 7) {
      return res.status(403).json({
        message: 'Insufficient vault level',
        error: 'VaultLevel 7 or higher required',
        currentLevel: vaultLevel || 0,
      })
    }
    
    // Verify pulse key against Key Registry
    try {
      const verification = await KeyRegistryService.verifyKey(pulseKey)
      
      if (!verification.valid) {
        return res.status(401).json({
          message: 'Invalid or inactive pulse key',
          error: verification.message,
        })
      }
      
      // Ensure it's a pulse service key
      const key = verification.key
      if (key.service !== 'pulse') {
        return res.status(403).json({
          message: 'Invalid key service type',
          error: 'Key must be registered for pulse service',
          keyService: key.service,
        })
      }
    } catch (error) {
      // Key not in registry, allow if it matches format
      // This allows backward compatibility
      const pulseKeyPattern = /^FAA_KEY_Ω_[a-z]+_(dev|staging|prod)_pulse_\d+\.\d+\.\d+$/
      if (!pulseKeyPattern.test(pulseKey)) {
        return res.status(401).json({
          message: 'Invalid pulse key format',
          error: 'Key must match FAA_KEY_Ω_{PROVIDER}_{ENV}_pulse_{VERSION} format',
        })
      }
    }
    
    // Check FAA-X13 compliance
    const treatyHeader = req.headers['x-faa-treaty']
    if (config.faaX13.complianceMode === 'strict' && treatyHeader !== 'FAA-TREATY-OMNI-4321-A13XN') {
      return res.status(403).json({
        message: 'FAA-X13 treaty compliance required',
        error: 'Missing or invalid x-faa-treaty header',
      })
    }
    
    // Audit log
    if (config.faaX13.auditLog) {
      console.log('PulseAuth VaultLevel 7 access:', {
        path: req.path,
        method: req.method,
        pulseKey: pulseKey.substring(0, 20) + '...',
        vaultLevel: vaultLevel,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      })
    }
    
    // Attach pulse info to request
    req.vaultLevel = parseInt(vaultLevel)
    req.pulseKey = pulseKey
    
    next()
  } catch (error) {
    console.error('Pulse auth error:', error)
    return res.status(500).json({
      message: 'Pulse authentication failed',
      error: error.message,
    })
  }
}

export default pulseAuth
