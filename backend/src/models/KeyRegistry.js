/**
 * VaultMesh Key Registry Model
 * FAA-TREATY-OMNI-4321-A13XN Compliant
 * VaultLevel 7 Security
 */

// In-memory storage for key registry (VaultMesh compatible)
const keyRegistry = new Map()

// Valid values for key registry
const VALID_PROVIDERS = ['openai', 'anthropic', 'claude', 'gemini', 'grok', 'copilot']
const VALID_ENVIRONMENTS = ['dev', 'staging', 'prod']
const VALID_SERVICES = ['pulse', 'vault', 'claim', 'mesh']

/**
 * Key Registry Schema
 * Format: FAA_KEY_Ω_{PROVIDER}_{ENV}_{SERVICE}_{VERSION}
 */
export class KeyRegistryEntry {
  constructor(data) {
    this.key_name = data.key_name // FAA_KEY_Ω_format
    this.provider = data.provider // openai/anthropic/claude/gemini/grok/copilot
    this.environment = data.environment // dev/staging/prod
    this.service = data.service // pulse/vault/claim/mesh
    this.version = data.version // semver format
    this.issued_at = data.issued_at || new Date().toISOString()
    this.expires_at = data.expires_at
    this.claimroot_anchor = data.claimroot_anchor
    this.status = data.status || 'active' // active/revoked/expired
    this.metadata = data.metadata || {}
    this.created_at = data.created_at || new Date().toISOString()
    this.updated_at = data.updated_at || new Date().toISOString()
  }

  validate() {
    // Validate key_name format
    const keyNameRegex = /^FAA_KEY_Ω_([a-z]+)_(dev|staging|prod)_(pulse|vault|claim|mesh)_(\d+\.\d+\.\d+)$/
    if (!keyNameRegex.test(this.key_name)) {
      throw new Error('Invalid key_name format. Must be: FAA_KEY_Ω_{PROVIDER}_{ENV}_{SERVICE}_{VERSION}')
    }

    // Validate provider
    if (!VALID_PROVIDERS.includes(this.provider)) {
      throw new Error(`Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}`)
    }

    // Validate environment
    if (!VALID_ENVIRONMENTS.includes(this.environment)) {
      throw new Error(`Invalid environment. Must be one of: ${VALID_ENVIRONMENTS.join(', ')}`)
    }

    // Validate service
    if (!VALID_SERVICES.includes(this.service)) {
      throw new Error(`Invalid service. Must be one of: ${VALID_SERVICES.join(', ')}`)
    }

    // Validate version format (semver)
    const versionRegex = /^\d+\.\d+\.\d+$/
    if (!versionRegex.test(this.version)) {
      throw new Error('Invalid version format. Must be semver: X.Y.Z')
    }

    // Validate expires_at is in the future
    if (this.expires_at && new Date(this.expires_at) <= new Date()) {
      throw new Error('expires_at must be in the future')
    }

    return true
  }

  isExpired() {
    if (!this.expires_at) {
      return false
    }
    return new Date(this.expires_at) <= new Date()
  }

  toJSON() {
    return {
      key_name: this.key_name,
      provider: this.provider,
      environment: this.environment,
      service: this.service,
      version: this.version,
      issued_at: this.issued_at,
      expires_at: this.expires_at,
      claimroot_anchor: this.claimroot_anchor,
      status: this.status,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at,
    }
  }
}

// Storage operations
export const KeyRegistryStorage = {
  set(keyName, entry) {
    keyRegistry.set(keyName, entry)
  },

  get(keyName) {
    return keyRegistry.get(keyName)
  },

  has(keyName) {
    return keyRegistry.has(keyName)
  },

  delete(keyName) {
    return keyRegistry.delete(keyName)
  },

  getAll() {
    return Array.from(keyRegistry.values())
  },

  clear() {
    keyRegistry.clear()
  },

  size() {
    return keyRegistry.size
  },
}

export default KeyRegistryEntry
