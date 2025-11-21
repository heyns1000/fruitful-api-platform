/**
 * VaultMesh Key Registry Service
 * FAA-TREATY-OMNI-4321-A13XN Compliant
 * VaultLevel 7 Security
 */

import crypto from 'crypto'
import { KeyRegistryEntry, KeyRegistryStorage } from '../models/KeyRegistry.js'

/**
 * Register a new API key in the VaultMesh registry
 */
export const registerKey = async (keyData) => {
  try {
    // Create new registry entry
    const entry = new KeyRegistryEntry(keyData)
    
    // Validate the entry
    entry.validate()
    
    // Check if key already exists
    if (KeyRegistryStorage.has(entry.key_name)) {
      throw new Error('Key name already exists in registry')
    }
    
    // Generate claimroot anchor if not provided
    if (!entry.claimroot_anchor) {
      entry.claimroot_anchor = createClaimRootAnchor(keyData)
    }
    
    // Store in registry
    KeyRegistryStorage.set(entry.key_name, entry)
    
    return {
      success: true,
      key: entry.toJSON(),
      message: 'Key registered successfully in VaultMesh',
    }
  } catch (error) {
    throw new Error(`Key registration failed: ${error.message}`)
  }
}

/**
 * Verify a key exists and is valid
 */
export const verifyKey = async (keyName) => {
  try {
    if (!KeyRegistryStorage.has(keyName)) {
      return {
        valid: false,
        message: 'Key not found in registry',
      }
    }
    
    const entry = KeyRegistryStorage.get(keyName)
    
    // Check if revoked
    if (entry.status === 'revoked') {
      return {
        valid: false,
        message: 'Key has been revoked',
        key: entry.toJSON(),
      }
    }
    
    // Check if expired
    if (entry.isExpired()) {
      // Update status to expired
      entry.status = 'expired'
      entry.updated_at = new Date().toISOString()
      KeyRegistryStorage.set(keyName, entry)
      
      return {
        valid: false,
        message: 'Key has expired',
        key: entry.toJSON(),
      }
    }
    
    return {
      valid: true,
      message: 'Key is valid and active',
      key: entry.toJSON(),
    }
  } catch (error) {
    throw new Error(`Key verification failed: ${error.message}`)
  }
}

/**
 * Revoke a key
 */
export const revokeKey = async (keyName) => {
  try {
    if (!KeyRegistryStorage.has(keyName)) {
      throw new Error('Key not found in registry')
    }
    
    const entry = KeyRegistryStorage.get(keyName)
    entry.status = 'revoked'
    entry.updated_at = new Date().toISOString()
    
    KeyRegistryStorage.set(keyName, entry)
    
    return {
      success: true,
      message: 'Key revoked successfully',
      key: entry.toJSON(),
    }
  } catch (error) {
    throw new Error(`Key revocation failed: ${error.message}`)
  }
}

/**
 * Check if a key is expired
 */
export const isExpired = async (keyName) => {
  try {
    if (!KeyRegistryStorage.has(keyName)) {
      throw new Error('Key not found in registry')
    }
    
    const entry = KeyRegistryStorage.get(keyName)
    return entry.isExpired()
  } catch (error) {
    throw new Error(`Key expiration check failed: ${error.message}`)
  }
}

/**
 * Create a ClaimRoot Anchor for VaultMesh compliance
 * Uses SHA-256 hash of key metadata for traceability
 */
export const createClaimRootAnchor = (keyData) => {
  const anchorData = {
    provider: keyData.provider,
    environment: keyData.environment,
    service: keyData.service,
    version: keyData.version,
    timestamp: new Date().toISOString(),
    treaty: 'FAA-TREATY-OMNI-4321-A13XN',
  }
  
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(anchorData))
    .digest('hex')
  
  return `CLAIM_ROOT_${hash.substring(0, 16).toUpperCase()}`
}

/**
 * List all keys in registry (with optional filters)
 */
export const listKeys = async (filters = {}) => {
  try {
    let keys = KeyRegistryStorage.getAll()
    
    // Apply filters
    if (filters.provider) {
      keys = keys.filter(k => k.provider === filters.provider)
    }
    if (filters.environment) {
      keys = keys.filter(k => k.environment === filters.environment)
    }
    if (filters.service) {
      keys = keys.filter(k => k.service === filters.service)
    }
    if (filters.status) {
      keys = keys.filter(k => k.status === filters.status)
    }
    
    return keys.map(k => k.toJSON())
  } catch (error) {
    throw new Error(`Key listing failed: ${error.message}`)
  }
}

export default {
  registerKey,
  verifyKey,
  revokeKey,
  isExpired,
  createClaimRootAnchor,
  listKeys,
}
