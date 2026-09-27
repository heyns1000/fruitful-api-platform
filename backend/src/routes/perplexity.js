import express from 'express'
import { apiKeyMiddleware } from '../middleware/auth.js'
import { apiLimiter, strictLimiter } from '../middleware/rateLimiter.js'
import { callPerplexity } from '../services/perplexityClient.js'
import { enrichContext, buildInternalContextBundle } from '../services/contextEnricher.js'
import {
  normalizeCitations,
  extractAnswerText,
  extractUsage,
  buildNextActions,
} from '../services/citationNormalizer.js'
import { logQuery, getAuditLog } from '../services/queryAuditLog.js'
import config from '../config/index.js'

const router = express.Router()

function validateQuery(req, res) {
  const { query } = req.body
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    res.status(400).json({ error: 'query is required' })
    return false
  }
  if (!config.perplexity.apiKey) {
    res.status(503).json({ error: 'Perplexity integration not configured' })
    return false
  }
  return true
}

async function runGateway(req, res, mode) {
  if (!validateQuery(req, res)) return

  const { query, workspace, role, context, sources, response_format } = req.body
  const start = Date.now()

  const contextMeta = enrichContext({ workspace, role, context })
  const internalContext = buildInternalContextBundle(sources, sources?.internal_refs)

  let raw, success
  try {
    raw = await callPerplexity({ mode, query, workspace, contextMeta, internalContext })
    success = true
  } catch (err) {
    success = false
    logQuery({
      userId: req.user?.id,
      workspace: contextMeta.workspace,
      role: contextMeta.role,
      mode,
      query,
      sources,
      durationMs: Date.now() - start,
      success: false,
    })
    return res.status(502).json({ error: 'Perplexity request failed', detail: err.message })
  }

  const answerText = extractAnswerText(raw)
  const citations = normalizeCitations(raw.citations || [])
  const usage = extractUsage(raw)
  const nextActions = buildNextActions(mode, answerText)

  logQuery({
    userId: req.user?.id,
    workspace: contextMeta.workspace,
    role: contextMeta.role,
    mode,
    query,
    sources,
    tokensUsed: usage?.total_tokens,
    durationMs: Date.now() - start,
    success: true,
  })

  res.json({
    answer: answerText,
    citations,
    next_actions: nextActions,
    meta: {
      workspace: contextMeta.workspace,
      mode,
      model: raw.model,
      usage,
      durationMs: Date.now() - start,
      cost_bucket: contextMeta.priority,
    },
  })
}

// POST /api/perplexity/research
router.post('/research', apiKeyMiddleware, apiLimiter, (req, res) => runGateway(req, res, 'research'))

// POST /api/perplexity/summarize
router.post('/summarize', apiKeyMiddleware, apiLimiter, (req, res) => runGateway(req, res, 'summarize'))

// POST /api/perplexity/brief
router.post('/brief', apiKeyMiddleware, strictLimiter, (req, res) => runGateway(req, res, 'brief'))

// POST /api/perplexity/compare
router.post('/compare', apiKeyMiddleware, apiLimiter, (req, res) => runGateway(req, res, 'compare'))

// POST /api/perplexity/search
router.post('/search', apiKeyMiddleware, apiLimiter, (req, res) => runGateway(req, res, 'search'))

// GET /api/perplexity/audit/query
router.get('/audit/query', apiKeyMiddleware, (req, res) => {
  const { workspace, mode, limit, offset } = req.query
  const result = getAuditLog({
    workspace,
    mode,
    limit: limit ? parseInt(limit) : 50,
    offset: offset ? parseInt(offset) : 0,
  })
  res.json(result)
})

export default router
