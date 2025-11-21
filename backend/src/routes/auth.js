import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { query } from '../config/database.js'
import config from '../config/index.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Register (demo purposes)
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    
    // Check if user exists
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const result = await query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    )
    
    const user = result.rows[0]
    
    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    })
    
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    })
  } catch (error) {
    next(error)
  }
})

// Login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body
    
    // Demo credentials bypass
    if (email === 'admin@fruitful.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: 1, email: 'admin@fruitful.com' },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      )
      
      return res.json({
        user: { id: 1, email: 'admin@fruitful.com', name: 'Admin User' },
        token,
      })
    }
    
    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    const user = result.rows[0]
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    })
    
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    })
  } catch (error) {
    next(error)
  }
})

// Get profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Logout (stateless JWT, so just a placeholder)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

export default router
