export function normalizeCitations(rawCitations) {
  if (!rawCitations || !Array.isArray(rawCitations)) return []

  return rawCitations.map((c, idx) => {
    if (typeof c === 'string') {
      return { index: idx + 1, url: c, title: extractTitleFromUrl(c), type: 'web' }
    }
    return {
      index: idx + 1,
      title: c.title || c.name || extractTitleFromUrl(c.url || ''),
      url: c.url || c.link || null,
      type: c.type || 'web',
    }
  })
}

export function extractAnswerText(perplexityResponse) {
  const choice = perplexityResponse?.choices?.[0]
  return choice?.message?.content || ''
}

export function extractUsage(perplexityResponse) {
  return perplexityResponse?.usage || null
}

function extractTitleFromUrl(url) {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function buildNextActions(mode, answerText) {
  // Heuristic extraction — in production plug into a structured output parser.
  const lines = answerText.split('\n').filter((l) => l.trim().startsWith('-') || l.trim().match(/^\d+\./))
  if (lines.length > 0) return lines.slice(0, 5).map((l) => l.replace(/^[-\d.]+\s*/, '').trim())

  const defaults = {
    research: ['Review cited sources', 'Validate against internal context', 'Share brief with team'],
    brief: ['Assign owner', 'Define timeline', 'Identify blockers', 'Set review checkpoint'],
    compare: ['Validate top option against compliance requirements', 'Request pricing from shortlist', 'Document decision'],
    summarize: ['Review key points with stakeholders', 'Flag open risks', 'Archive to CodeNest'],
    search: ['Open top result', 'Cross-reference with internal knowledge'],
  }

  return defaults[mode] || defaults.research
}
