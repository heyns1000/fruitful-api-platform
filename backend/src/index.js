import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import config from './config/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import apiKeysRoutes from './routes/apiKeys.js'
import analyticsRoutes from './routes/analytics.js'
import webhooksRoutes from './routes/webhooks.js'
import billingRoutes from './routes/billing.js'
import playgroundRoutes from './routes/playground.js'
import aiRoutes from './routes/ai.js'
import keysRoutes from './routes/keys.js'
import pulseRoutes from './routes/pulse.js'
import gorillaRoutes from './routes/gorilla.js'

const app = express()

// Security middleware - VaultLevel 7
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}))

// CORS
app.use(cors({
  origin: config.nodeEnv === 'development' ? 'http://localhost:3000' : true,
  credentials: true,
}))

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    vaultLevel: config.vault.level,
    faaX13Compliant: config.faaX13.complianceMode === 'strict',
    timestamp: new Date().toISOString(),
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/api-keys', apiKeysRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/webhooks', webhooksRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/playground', playgroundRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/keys', keysRoutes)
app.use('/api/pulse', pulseRoutes)
app.use('/api/gorilla', gorillaRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
const PORT = config.port

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                 FRUITFUL API CONSOLE                       ║
║                Enterprise Developer Platform                ║
╠════════════════════════════════════════════════════════════╣
║  Server:          http://localhost:${PORT}                    ║
║  Environment:     ${config.nodeEnv.padEnd(41)}║
║  VaultLevel:      ${config.vault.level}                                          ║
║  FAA-X13:         ${config.faaX13.complianceMode === 'strict' ? 'Compliant' : 'Standard'.padEnd(41)}║
║  HSOMNI9000:      Active                                   ║
╚════════════════════════════════════════════════════════════╝
  `)
})

export default app
