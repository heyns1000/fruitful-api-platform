import { useState, useEffect } from 'react'
import { Plus, Copy, Trash2, Key, Shield } from 'lucide-react'
import { apiKeysService } from '../services/api'

function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyScopes, setNewKeyScopes] = useState([])

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const response = await apiKeysService.getAll()
      setApiKeys(response.data)
    } catch (error) {
      console.error('Failed to load API keys:', error)
    }
  }

  const handleCreateKey = async () => {
    try {
      await apiKeysService.create({ name: newKeyName, scopes: newKeyScopes })
      setShowCreateModal(false)
      setNewKeyName('')
      setNewKeyScopes([])
      loadApiKeys()
    } catch (error) {
      console.error('Failed to create API key:', error)
    }
  }

  const handleRevokeKey = async (id) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return
    try {
      await apiKeysService.revoke(id)
      loadApiKeys()
    } catch (error) {
      console.error('Failed to revoke API key:', error)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const availableScopes = [
    'claim-root:read',
    'claim-root:write',
    'vault-mesh:read',
    'vault-mesh:write',
    'seed-scrolls:read',
    'seed-scrolls:write',
    'pulse-trade:read',
    'pulse-trade:write',
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-slate-400">Manage your API authentication keys</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create API Key</span>
        </button>
      </div>

      {/* Security Notice */}
      <div className="vault-secure card">
        <div className="card-body flex items-start space-x-3">
          <Shield className="w-5 h-5 text-vault-500 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">VaultLevel 7 Security</h3>
            <p className="text-sm text-slate-400">
              All API keys are encrypted at rest and in transit. Rate limiting and IP restrictions are enforced.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((key) => (
          <div key={key.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Key className="w-5 h-5 text-vault-500" />
                    <h3 className="text-lg font-semibold">{key.name}</h3>
                    <span className={`badge ${key.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {key.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <code className="text-sm bg-slate-800 px-3 py-1 rounded font-mono">
                      {key.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(key.key)}
                      className="p-1 hover:bg-slate-800 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {key.scopes?.map((scope) => (
                      <span key={scope} className="badge badge-info">
                        {scope}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-slate-400">
                    Created: {new Date(key.createdAt).toLocaleDateString()} • Last used:{' '}
                    {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeKey(key.id)}
                  className="btn btn-danger flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Revoke</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {apiKeys.length === 0 && (
          <div className="card">
            <div className="card-body text-center py-12">
              <Key className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No API keys yet. Create one to get started.</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-lg">
            <div className="card-header">
              <h3 className="text-xl font-semibold">Create New API Key</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="input"
                  placeholder="Production API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Scopes</label>
                <div className="space-y-2">
                  {availableScopes.map((scope) => (
                    <label key={scope} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newKeyScopes.includes(scope)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyScopes([...newKeyScopes, scope])
                          } else {
                            setNewKeyScopes(newKeyScopes.filter((s) => s !== scope))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleCreateKey} className="btn btn-primary flex-1">
                  Create Key
                </button>
                <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApiKeysPage
