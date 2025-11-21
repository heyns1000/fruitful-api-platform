import config from '../config/index.js'

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  // FAA-X13 compliance logging
  if (config.faaX13.auditLog) {
    console.log('Error logged for compliance', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    })
  }
  
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  res.status(statusCode).json({
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
    vaultLevel: config.vault.level,
    faaX13Compliant: true,
  })
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
  })
}
