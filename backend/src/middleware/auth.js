import jwt from 'jsonwebtoken'
import config from '../config/index.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
    
    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const apiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key']
    
    if (!apiKey) {
      return res.status(401).json({ message: 'No API key provided' })
    }
    
    // In a real implementation, validate the API key against the database
    // and check rate limits, scopes, etc.
    req.apiKey = apiKey
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid API key' })
  }
}
