/**
 * VaultLevel 7 Key Registry Authentication Middleware
 * FAA-TREATY-OMNI-4321-A13XN Compliant
 */

import config from '../config/index.js'
import crypto from 'crypto'

/**
 * VaultLevel 7 authentication for Key Registry operations
 * Requires special vault authorization header
 */
export const vaultLevel7Auth = async (req, res, next) => {
  try {
    const vaultAuth = req.headers['x-vault-auth']
    const vaultLevel = req.headers['x-vault-level']
    
    if (!vaultAuth) {
      return res.status(401).json({
        message: 'VaultLevel 7 authentication required',
        error: 'Missing x-vault-auth header',
      })
    }
    
    if (!vaultLevel || parseInt(vaultLevel) < 7) {
      return res.status(403).json({
        message: 'Insufficient vault level',
        error: 'VaultLevel 7 or higher required',
        currentLevel: vaultLevel || 0,
      })
    }
    
    // Verify vault auth signature
    // In production, this would verify against a vault key management system
    // For now, we validate format and basic structure
    const authPattern = /^VAULT_AUTH_[A-Z0-9]{32}$/
    if (!authPattern.test(vaultAuth)) {
      return res.status(401).json({
        message: 'Invalid vault authentication format',
        error: 'Vault auth must match pattern: VAULT_AUTH_{32-char-hex}',
      })
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
      console.log('VaultLevel 7 access:', {
        path: req.path,
        method: req.method,
        vaultLevel: vaultLevel,
        timestamp: new Date().toISOString(),
        ip: req.ip,
      })
    }
    
    // Attach vault info to request
    req.vaultLevel = parseInt(vaultLevel)
    req.vaultAuth = vaultAuth
    
    next()
  } catch (error) {
    console.error('VaultLevel 7 auth error:', error)
    return res.status(500).json({
      message: 'Vault authentication failed',
      error: error.message,
    })
  }
}

export default vaultLevel7Auth
