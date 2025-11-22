/**
 * Key Registry API Routes
 * FAA-TREATY-OMNI-4321-A13XN Compliant
 * VaultLevel 7 Security
 */

import express from 'express'
import { apiKeyMiddleware } from '../middleware/auth.js'
import { strictLimiter } from '../middleware/rateLimiter.js'
import { vaultLevel7Auth } from '../middleware/keyRegistryAuth.js'
import * as KeyRegistryService from '../services/KeyRegistry.js'

const router = express.Router()

/**
 * POST /api/keys/register
 * Register a new API key in VaultMesh registry
 */
router.post('/register', apiKeyMiddleware, strictLimiter, vaultLevel7Auth, async (req, res, next) => {
  try {
    const {
      key_name,
      provider,
      environment,
      service,
      version,
      expires_at,
      claimroot_anchor,
      metadata,
    } = req.body

    // Validate required fields
    if (!key_name || !provider || !environment || !service || !version) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['key_name', 'provider', 'environment', 'service', 'version'],
      })
    }

    const result = await KeyRegistryService.registerKey({
      key_name,
      provider,
      environment,
      service,
      version,
      expires_at,
      claimroot_anchor,
      metadata,
    })

    res.status(201).json(result)
  } catch (error) {
    console.error('Key registration error:', error)
    res.status(400).json({
      message: error.message,
    })
  }
})

/**
 * GET /api/keys/verify
 * Verify a key exists and is valid
 */
router.get('/verify', apiKeyMiddleware, strictLimiter, vaultLevel7Auth, async (req, res, next) => {
  try {
    const { key_name } = req.query

    if (!key_name) {
      return res.status(400).json({
        message: 'key_name query parameter is required',
      })
    }

    const result = await KeyRegistryService.verifyKey(key_name)
    
    res.json(result)
  } catch (error) {
    console.error('Key verification error:', error)
    res.status(400).json({
      message: error.message,
    })
  }
})

/**
 * GET /api/keys/list
 * List all keys in registry (with optional filters)
 */
router.get('/list', apiKeyMiddleware, strictLimiter, vaultLevel7Auth, async (req, res, next) => {
  try {
    const { provider, environment, service, status } = req.query
    
    const filters = {}
    if (provider) filters.provider = provider
    if (environment) filters.environment = environment
    if (service) filters.service = service
    if (status) filters.status = status

    const keys = await KeyRegistryService.listKeys(filters)
    
    res.json({
      count: keys.length,
      keys,
      filters: filters,
    })
  } catch (error) {
    console.error('Key listing error:', error)
    res.status(400).json({
      message: error.message,
    })
  }
})

/**
 * DELETE /api/keys/revoke/:keyName
 * Revoke a key
 */
router.delete('/revoke/:keyName', apiKeyMiddleware, strictLimiter, vaultLevel7Auth, async (req, res, next) => {
  try {
    const { keyName } = req.params

    if (!keyName) {
      return res.status(400).json({
        message: 'keyName parameter is required',
      })
    }

    const result = await KeyRegistryService.revokeKey(keyName)
    
    res.json(result)
  } catch (error) {
    console.error('Key revocation error:', error)
    res.status(400).json({
      message: error.message,
    })
  }
})

export default router
