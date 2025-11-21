import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, Activity } from 'lucide-react'
import { analyticsService } from '../services/api'

function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [usageData, setUsageData] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const [usageRes, statsRes] = await Promise.all([
        analyticsService.getTimeSeries({ days }),
        analyticsService.getStats(),
      ])
      setUsageData(usageRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-slate-400">Detailed usage insights and metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input w-auto"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Total Requests</span>
                <Activity className="w-5 h-5 text-vault-500" />
              </div>
              <div className="text-3xl font-bold">{stats.totalRequests?.toLocaleString()}</div>
              <div className="text-sm text-seed-400 mt-1">↑ 12% from last period</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Success Rate</span>
                <TrendingUp className="w-5 h-5 text-seed-500" />
              </div>
              <div className="text-3xl font-bold">{stats.successRate}%</div>
              <div className="text-sm text-seed-400 mt-1">↑ 2% from last period</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Avg Response Time</span>
                <Activity className="w-5 h-5 text-pulse-500" />
              </div>
              <div className="text-3xl font-bold">{stats.avgResponseTime}ms</div>
              <div className="text-sm text-pulse-400 mt-1">↓ 5ms from last period</div>
            </div>
          </div>
        </div>
      )}

      {/* Request Volume Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Request Volume</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="requests" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Response Time Trend</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="avgResponseTime" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* API Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">API Endpoint Usage</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {[
              { name: 'ClaimRoot API', requests: 45231, percentage: 35 },
              { name: 'VaultMesh API', requests: 38124, percentage: 29 },
              { name: 'SeedScrolls API', requests: 28456, percentage: 22 },
              { name: 'PulseTrade API', requests: 18189, percentage: 14 },
            ].map((api) => (
              <div key={api.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{api.name}</span>
                  <span className="text-sm text-slate-400">
                    {api.requests.toLocaleString()} requests ({api.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-vault-500 h-2 rounded-full"
                    style={{ width: `${api.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
