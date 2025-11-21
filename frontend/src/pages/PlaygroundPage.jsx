import { useState } from 'react'
import { Play, Copy } from 'lucide-react'
import { playgroundService } from '../services/api'

function PlaygroundPage() {
  const [selectedApi, setSelectedApi] = useState('claim-root')
  const [requestBody, setRequestBody] = useState('{\n  "example": "data"\n}')
  const [response, setResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const apis = [
    {
      id: 'claim-root',
      name: 'ClaimRoot API',
      description: 'Manage land claims and ownership records',
      endpoint: '/api/claim-root',
      method: 'POST',
    },
    {
      id: 'vault-mesh',
      name: 'VaultMesh API',
      description: 'Secure data storage and retrieval',
      endpoint: '/api/vault-mesh',
      method: 'POST',
    },
    {
      id: 'seed-scrolls',
      name: 'SeedScrolls API',
      description: 'Document versioning and history tracking',
      endpoint: '/api/seed-scrolls',
      method: 'POST',
    },
    {
      id: 'pulse-trade',
      name: 'PulseTrade API',
      description: 'Real-time trading and market data',
      endpoint: '/api/pulse-trade',
      method: 'POST',
    },
  ]

  const selectedApiData = apis.find((api) => api.id === selectedApi)

  const handleExecute = async () => {
    setIsLoading(true)
    setResponse(null)
    try {
      let data
      try {
        data = JSON.parse(requestBody)
      } catch (e) {
        throw new Error('Invalid JSON in request body')
      }

      let result
      switch (selectedApi) {
        case 'claim-root':
          result = await playgroundService.claimRoot(data)
          break
        case 'vault-mesh':
          result = await playgroundService.vaultMesh(data)
          break
        case 'seed-scrolls':
          result = await playgroundService.seedScrolls(data)
          break
        case 'pulse-trade':
          result = await playgroundService.pulseTrade(data)
          break
      }
      setResponse({
        status: result.status,
        data: result.data,
        headers: result.headers,
      })
    } catch (error) {
      setResponse({
        status: error.response?.status || 500,
        error: error.response?.data || { message: error.message },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data || response.error, null, 2))
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">API Playground</h1>
        <p className="text-slate-400">Test API endpoints in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Selection */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Select API</h3>
            </div>
            <div className="card-body space-y-2">
              {apis.map((api) => (
                <button
                  key={api.id}
                  onClick={() => setSelectedApi(api.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedApi === api.id
                      ? 'bg-vault-900 border border-vault-700'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <div className="font-semibold mb-1">{api.name}</div>
                  <div className="text-xs text-slate-400">{api.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Endpoint Details</h3>
            </div>
            <div className="card-body space-y-3">
              <div>
                <label className="text-xs text-slate-400">Method</label>
                <div className="badge badge-success mt-1">{selectedApiData?.method}</div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Endpoint</label>
                <code className="block text-sm bg-slate-800 px-3 py-2 rounded mt-1 font-mono">
                  {selectedApiData?.endpoint}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Request & Response */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-semibold">Request Body</h3>
              <button
                onClick={handleExecute}
                disabled={isLoading}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>{isLoading ? 'Executing...' : 'Execute'}</span>
              </button>
            </div>
            <div className="card-body">
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-64 bg-slate-800 border border-slate-700 rounded-md p-3 font-mono text-sm"
                placeholder="Enter JSON request body..."
              />
            </div>
          </div>

          {/* Response */}
          {response && (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold">Response</h3>
                  <span
                    className={`badge ${
                      response.status >= 200 && response.status < 300 ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    {response.status}
                  </span>
                </div>
                <button onClick={copyResponse} className="btn btn-secondary flex items-center space-x-2">
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="card-body">
                <pre className="bg-slate-800 p-4 rounded-md overflow-auto text-sm">
                  {JSON.stringify(response.data || response.error, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaygroundPage
