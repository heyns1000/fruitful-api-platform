import { useState } from 'react'
import { Shield, Bell, Globe, User } from 'lucide-react'

function SettingsPage() {
  const [settings, setSettings] = useState({
    email: 'admin@fruitful.com',
    name: 'Admin User',
    company: 'Fruitful Global',
    timezone: 'UTC',
    emailNotifications: true,
    webhookNotifications: true,
    securityAlerts: true,
  })

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="card">
        <div className="card-header flex items-center space-x-2">
          <User className="w-5 h-5 text-vault-500" />
          <h3 className="text-lg font-semibold">Profile</h3>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Company</label>
            <input
              type="text"
              value={settings.company}
              onChange={(e) => setSettings({ ...settings, company: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="card-header flex items-center space-x-2">
          <Bell className="w-5 h-5 text-vault-500" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="card-body space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-slate-400">Receive updates via email</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                setSettings({ ...settings, emailNotifications: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Webhook Notifications</div>
              <div className="text-sm text-slate-400">Get notified about webhook events</div>
            </div>
            <input
              type="checkbox"
              checked={settings.webhookNotifications}
              onChange={(e) =>
                setSettings({ ...settings, webhookNotifications: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Security Alerts</div>
              <div className="text-sm text-slate-400">Important security notifications</div>
            </div>
            <input
              type="checkbox"
              checked={settings.securityAlerts}
              onChange={(e) =>
                setSettings({ ...settings, securityAlerts: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
          </label>
        </div>
      </div>

      {/* Localization */}
      <div className="card">
        <div className="card-header flex items-center space-x-2">
          <Globe className="w-5 h-5 text-vault-500" />
          <h3 className="text-lg font-semibold">Localization</h3>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="input"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card vault-secure">
        <div className="card-header flex items-center space-x-2">
          <Shield className="w-5 h-5 text-vault-500" />
          <h3 className="text-lg font-semibold">Security</h3>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Two-Factor Authentication</div>
              <div className="text-sm text-slate-400">Add an extra layer of security</div>
            </div>
            <span className="badge badge-success">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">VaultLevel 7 Encryption</div>
              <div className="text-sm text-slate-400">Maximum security protocol</div>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">FAA-X13 Compliance</div>
              <div className="text-sm text-slate-400">Treaty compliance status</div>
            </div>
            <span className="badge badge-success">Compliant</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
