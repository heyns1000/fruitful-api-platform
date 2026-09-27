// In-memory ring buffer for audit log. Replace with DB insert (pool.query) when ready.
const MAX_ENTRIES = 2000
const auditLog = []

export function logQuery({ userId, workspace, role, mode, query, sources, tokensUsed, durationMs, success }) {
  const entry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    userId: userId || 'anonymous',
    workspace: workspace || 'unknown',
    role: role || 'unknown',
    mode,
    querySnippet: (query || '').slice(0, 120),
    sources: {
      webEnabled: sources?.allow_web ?? true,
      internalEnabled: sources?.allow_internal ?? false,
      internalRefCount: sources?.internal_refs?.length || 0,
    },
    tokensUsed: tokensUsed || null,
    durationMs: durationMs || null,
    success,
  }

  auditLog.unshift(entry)
  if (auditLog.length > MAX_ENTRIES) auditLog.length = MAX_ENTRIES

  return entry
}

export function getAuditLog({ workspace, mode, limit = 50, offset = 0 } = {}) {
  let results = auditLog

  if (workspace) results = results.filter((e) => e.workspace === workspace)
  if (mode) results = results.filter((e) => e.mode === mode)

  return {
    total: results.length,
    offset,
    limit,
    entries: results.slice(offset, offset + limit),
  }
}
