import axios from 'axios'
import config from '../config/index.js'

const PERPLEXITY_BASE_URL = config.perplexity.baseUrl

const SYSTEM_ROLES = {
  research: 'You are a Fruitful operator research copilot. Produce serious, concise, web-grounded answers with cited sources. Avoid speculation and marketing language.',
  summarize: 'You are a Fruitful document summarizer. Extract key points, dependencies, and risks from the provided content. Return structured, neutral operator copy.',
  brief: 'You are a Fruitful implementation brief generator. Convert task context into structured execution briefs with clear next actions, risks, and dependencies.',
  compare: 'You are a Fruitful vendor and option analyst. Compare the provided options across fit, risk, cost, and compatibility. Return a structured comparison with a clear recommendation.',
  search: 'You are a Fruitful search assistant. Return structured, factual search results with citations. No padding or elaboration.',
}

function buildSystemPrompt(mode, workspace, contextMeta) {
  const role = SYSTEM_ROLES[mode] || SYSTEM_ROLES.research
  const ctx = contextMeta
    ? `\nWorkspace: ${contextMeta.workspace || workspace}\nBrand: ${contextMeta.brand || 'fruitful'}\nMarket: ${contextMeta.market || 'global'}\nFunction: ${contextMeta.function || 'general'}`
    : ''
  return `${role}${ctx}\nReturn: answer, evidence bullets, risks where relevant, next actions, citations. Style: firm, neutral operator copy.`
}

function buildMessages(systemPrompt, query, internalContext) {
  const messages = [{ role: 'system', content: systemPrompt }]

  if (internalContext && internalContext.length > 0) {
    messages.push({
      role: 'user',
      content: `Internal context:\n${internalContext.join('\n\n')}\n\nQuery: ${query}`,
    })
  } else {
    messages.push({ role: 'user', content: query })
  }

  return messages
}

export async function callPerplexity({ mode, query, workspace, contextMeta, internalContext }) {
  if (!config.perplexity.apiKey) {
    throw new Error('Perplexity API key not configured')
  }

  const systemPrompt = buildSystemPrompt(mode, workspace, contextMeta)
  const messages = buildMessages(systemPrompt, query, internalContext)

  const payload = {
    model: config.perplexity.defaultModel,
    messages,
    return_citations: true,
    return_related_questions: false,
  }

  if (mode === 'search') {
    payload.search_recency_filter = 'month'
  }

  const response = await axios.post(
    `${PERPLEXITY_BASE_URL}/chat/completions`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${config.perplexity.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  )

  return response.data
}
