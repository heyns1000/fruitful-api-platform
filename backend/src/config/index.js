import dotenv from 'dotenv'
dotenv.config()

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fruitful_api',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  
  vault: {
    encryptionKey: process.env.VAULT_ENCRYPTION_KEY,
    level: parseInt(process.env.VAULT_LEVEL) || 7,
  },
  
  faaX13: {
    complianceMode: process.env.FAA_X13_COMPLIANCE_MODE || 'strict',
    auditLog: process.env.FAA_X13_AUDIT_LOG === 'enabled',
  },
}
