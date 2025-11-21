import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Activity, Key, Zap } from 'lucide-react'
import { analyticsService } from '../services/api'

function DashboardPage() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeKeys: 0,
    successRate: 0,
    avgResponseTime: 0,
  })
  const [usageData, setUsageData] = useState([])

  useEffect(() => {
    loadStats()
    loadUsageData()
  }, [])

  const loadStats = async () => {
    try {
      const response = await analyticsService.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadUsageData = async () => {
    try {
      const response = await analyticsService.getTimeSeries({ days: 7 })
      setUsageData(response.data)
    } catch (error) {
      console.error('Failed to load usage data:', error)
    }
  }

  const statCards = [
    {
      title: 'Total Requests',
      value: stats.totalRequests.toLocaleString(),
      icon: Activity,
      color: 'text-vault-500',
      bgColor: 'bg-vault-900/20',
    },
    {
      title: 'Active API Keys',
      value: stats.activeKeys,
      icon: Key,
      color: 'text-seed-500',
      bgColor: 'bg-seed-900/20',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: 'text-seed-500',
      bgColor: 'bg-seed-900/20',
    },
    {
      title: 'Avg Response',
      value: `${stats.avgResponseTime}ms`,
      icon: Zap,
      color: 'text-pulse-500',
      bgColor: 'bg-pulse-900/20',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400">Monitor your API usage and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Volume */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Request Volume (7 Days)</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="requests" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Response Time Trend</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="avgResponseTime" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn btn-primary text-left p-4">
              <Key className="w-5 h-5 mb-2" />
              <div className="font-semibold">Create API Key</div>
              <div className="text-xs opacity-80">Generate a new API key</div>
            </button>
            <button className="btn btn-secondary text-left p-4">
              <Activity className="w-5 h-5 mb-2" />
              <div className="font-semibold">Test API</div>
              <div className="text-xs opacity-80">Try the API playground</div>
            </button>
            <button className="btn btn-secondary text-left p-4">
              <TrendingUp className="w-5 h-5 mb-2" />
              <div className="font-semibold">View Analytics</div>
              <div className="text-xs opacity-80">Detailed usage reports</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
