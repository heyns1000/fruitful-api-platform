import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  LayoutDashboard, 
  Key, 
  FlaskConical, 
  BarChart3, 
  Webhook, 
  CreditCard, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react'

function Layout({ children }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'API Keys', path: '/api-keys', icon: Key },
    { name: 'Playground', path: '/playground', icon: FlaskConical },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Webhooks', path: '/webhooks', icon: Webhook },
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 fixed h-full">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-vault-500" />
              <div>
                <h1 className="text-lg font-bold">Fruitful API</h1>
                <p className="text-xs text-slate-400">VaultLevel 7 • FAA-X13</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-vault-900 text-vault-100'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="px-3 py-4 border-t border-slate-800">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-slate-400">Enterprise Plan</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 bg-slate-950">
        <div className="min-h-screen p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
