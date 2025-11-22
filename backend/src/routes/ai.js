import express from 'express'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import config from '../config/index.js'
import { apiKeyMiddleware } from '../middleware/auth.js'
import { strictLimiter } from '../middleware/rateLimiter.js'
import * as KeyRegistryService from '../services/KeyRegistry.js'

const router = express.Router()

// POST /api/ai/chat - Chat with AI providers
router.post('/chat', apiKeyMiddleware, strictLimiter, async (req, res, next) => {
  try {
    const { prompt, provider, registryKey } = req.body

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' })
    }

    if (!provider) {
      return res.status(400).json({ message: 'Provider is required' })
    }

    // Validate against Key Registry if registryKey provided
    if (registryKey) {
      try {
        const verification = await KeyRegistryService.verifyKey(registryKey)
        if (!verification.valid) {
          return res.status(401).json({
            message: 'Invalid or inactive registry key',
            error: verification.message,
          })
        }
        
        // Check if provider matches the registry key provider
        const key = verification.key
        if (key.provider !== provider) {
          return res.status(403).json({
            message: 'Provider mismatch',
            error: `Registry key is for ${key.provider}, but request is for ${provider}`,
          })
        }
      } catch (error) {
        console.warn('Registry key validation skipped:', error.message)
        // Continue if registry validation fails (backward compatibility)
      }
    }

    let response

    if (provider === 'openai') {
      if (!config.ai.openaiApiKey) {
        return res.status(500).json({ message: 'OpenAI API key not configured' })
      }

      const openai = new OpenAI({
        apiKey: config.ai.openaiApiKey,
      })

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      })

      if (!completion.choices || completion.choices.length === 0) {
        return res.status(500).json({ message: 'No response from OpenAI' })
      }

      response = {
        provider: 'openai',
        model: 'gpt-4',
        content: completion.choices[0].message.content,
        usage: completion.usage,
      }
    } else if (provider === 'anthropic') {
      if (!config.ai.anthropicApiKey) {
        return res.status(500).json({ message: 'Anthropic API key not configured' })
      }

      const anthropic = new Anthropic({
        apiKey: config.ai.anthropicApiKey,
      })

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      })

      if (!message.content || message.content.length === 0) {
        return res.status(500).json({ message: 'No response from Anthropic' })
      }

      response = {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        content: message.content[0].text,
        usage: message.usage,
      }
    } else {
      return res.status(400).json({ 
        message: 'Invalid provider. Supported providers: openai, anthropic' 
      })
    }

    res.json(response)
  } catch (error) {
    console.error('AI chat error:', error)
    next(error)
  }
})

export default router
