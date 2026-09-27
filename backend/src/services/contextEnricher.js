// Maps known workspaces and brands to structured context metadata
const WORKSPACE_REGISTRY = {
  codenest: {
    description: 'Central docs, legal structures, financial artifacts, and distribution hub',
    brands: ['fruitful', 'banimal', 'faa.zone'],
    priority: 'document-intelligence',
  },
  'faa.zone': {
    description: 'FAA.ZONE admin surfaces: repo-aware implementation and deployment research',
    brands: ['fruitful'],
    priority: 'repo-and-env',
  },
  banimal: {
    description: 'Banimal commerce operations: suppliers, payments, catalog, and product intelligence',
    brands: ['banimal'],
    priority: 'commerce',
  },
}

const BRAND_REGISTRY = {
  banimal: {
    sector: 'commerce',
    flows: ['checkout', 'payments', 'catalog', 'supplier'],
    markets: ['ZA', 'global'],
  },
  fruitful: {
    sector: 'platform',
    flows: ['api', 'gateway', 'identity', 'billing'],
    markets: ['global'],
  },
}

export function enrichContext(requestBody) {
  const { workspace, role, context } = requestBody

  const wsData = WORKSPACE_REGISTRY[workspace] || {}
  const brandData = context?.brand ? BRAND_REGISTRY[context.brand] || {} : {}

  return {
    workspace: workspace || 'codenest',
    role: role || 'operator',
    brand: context?.brand || null,
    repo: context?.repo || null,
    market: context?.market || brandData.markets?.[0] || 'global',
    priority: wsData.priority || 'general',
    function: context?.priority || 'general',
    workspaceDescription: wsData.description || null,
    sector: brandData.sector || null,
  }
}

export function buildInternalContextBundle(sources, internalRefs) {
  if (!internalRefs || internalRefs.length === 0) return []

  // In production this would fetch content from the internal knowledge index.
  // Returning placeholder stubs so the service is wired end-to-end.
  return internalRefs.map((ref) => `[internal:${ref}] — content pending internal knowledge connector`)
}
