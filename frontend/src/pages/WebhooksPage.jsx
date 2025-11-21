import { useState, useEffect } from 'react'
import { Plus, Trash2, TestTube, Webhook as WebhookIcon } from 'lucide-react'
import { webhooksService } from '../services/api'

function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [],
    active: true,
  })

  useEffect(() => {
    loadWebhooks()
  }, [])

  const loadWebhooks = async () => {
    try {
      const response = await webhooksService.getAll()
      setWebhooks(response.data)
    } catch (error) {
      console.error('Failed to load webhooks:', error)
    }
  }

  const handleCreateWebhook = async () => {
    try {
      await webhooksService.create(newWebhook)
      setShowCreateModal(false)
      setNewWebhook({ url: '', events: [], active: true })
      loadWebhooks()
    } catch (error) {
      console.error('Failed to create webhook:', error)
    }
  }

  const handleDeleteWebhook = async (id) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return
    try {
      await webhooksService.delete(id)
      loadWebhooks()
    } catch (error) {
      console.error('Failed to delete webhook:', error)
    }
  }

  const handleTestWebhook = async (id) => {
    try {
      await webhooksService.test(id)
      alert('Test webhook sent successfully!')
    } catch (error) {
      console.error('Failed to test webhook:', error)
      alert('Failed to send test webhook')
    }
  }

  const availableEvents = [
    'api_key.created',
    'api_key.revoked',
    'request.rate_limited',
    'usage.threshold_exceeded',
    'payment.succeeded',
    'payment.failed',
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Webhooks</h1>
          <p className="text-slate-400">Configure event notifications</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Webhook</span>
        </button>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <WebhookIcon className="w-5 h-5 text-vault-500" />
                    <h3 className="text-lg font-semibold">{webhook.url}</h3>
                    <span className={`badge ${webhook.active ? 'badge-success' : 'badge-warning'}`}>
                      {webhook.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events?.map((event) => (
                      <span key={event} className="badge badge-info">
                        {event}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-slate-400">
                    Last triggered: {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTestWebhook(webhook.id)}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <TestTube className="w-4 h-4" />
                    <span>Test</span>
                  </button>
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="btn btn-danger flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {webhooks.length === 0 && (
          <div className="card">
            <div className="card-body text-center py-12">
              <WebhookIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No webhooks configured. Add one to receive event notifications.</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-lg">
            <div className="card-header">
              <h3 className="text-xl font-semibold">Add Webhook</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  className="input"
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Events</label>
                <div className="space-y-2">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({
                              ...newWebhook,
                              events: [...newWebhook.events, event],
                            })
                          } else {
                            setNewWebhook({
                              ...newWebhook,
                              events: newWebhook.events.filter((e) => e !== event),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleCreateWebhook} className="btn btn-primary flex-1">
                  Create Webhook
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

export default WebhooksPage
