/**
 * Gorilla Dashboard
 * Real-time pulse status monitoring with Gorilla Vol burn tracking
 */

import { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Statistic, Table, Progress, Badge, Button, message } from 'antd'
import { ThunderboltOutlined, FireOutlined, RocketOutlined, SyncOutlined } from '@ant-design/icons'
import PulseIndicator from '../components/PulseIndicator'
import axios from 'axios'

const GorillaDashboard = () => {
  const [gorillaStatus, setGorillaStatus] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [activePulses] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch data every 5 seconds
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch gorilla status
      const statusRes = await axios.get('/api/gorilla/gorilla-status', {
        headers: {
          'x-api-key': localStorage.getItem('apiKey'),
          'x-pulse-key': localStorage.getItem('pulseKey'),
          'x-vault-level': '7',
          'x-faa-treaty': 'FAA-TREATY-OMNI-4321-A13XN',
        },
      })
      setGorillaStatus(statusRes.data)

      // Fetch metrics
      const metricsRes = await axios.get('/api/pulse/metrics', {
        headers: {
          'x-api-key': localStorage.getItem('apiKey'),
          'x-pulse-key': localStorage.getItem('pulseKey'),
          'x-vault-level': '7',
          'x-faa-treaty': 'FAA-TREATY-OMNI-4321-A13XN',
        },
      })
      setMetrics(metricsRes.data)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      message.error('Failed to fetch dashboard data')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const getStatusColor = (burnRate) => {
    if (burnRate > 40) return 'success'
    if (burnRate > 4) return 'processing'
    return 'warning'
  }

  // Active pulses table columns
  const columns = [
    {
      title: 'Pulse ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'active' ? 'processing' : 'default'}
          text={status.toUpperCase()}
        />
      ),
    },
    {
      title: 'Burn Rate',
      dataIndex: 'burnRate',
      key: 'burnRate',
      render: (rate) => (
        <span style={{ color: rate > 40 ? '#52c41a' : rate > 4 ? '#1890ff' : '#faad14' }}>
          {rate}%
        </span>
      ),
    },
    {
      title: 'Cycles',
      dataIndex: 'cycles',
      key: 'cycles',
    },
    {
      title: 'Avg Yield',
      dataIndex: 'avgYield',
      key: 'avgYield',
      render: (yield_val) => `${yield_val}%`,
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>
        <FireOutlined /> Gorilla Dashboard
      </h1>

      {/* Top Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Gorilla Vol Burn"
              value={gorillaStatus?.burnRate || 0}
              suffix="%"
              valueStyle={{
                color: gorillaStatus?.burnRate > 40 ? '#52c41a' : gorillaStatus?.burnRate > 4 ? '#1890ff' : '#faad14',
              }}
              prefix={gorillaStatus?.emoji || '🔄'}
            />
            <div style={{ marginTop: '8px' }}>
              <Badge status={getStatusColor(gorillaStatus?.burnRate || 0)} text={gorillaStatus?.status || 'BUILDING'} />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Pulses"
              value={metrics?.activePulses || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Optimal Pulses"
              value={metrics?.optimalPulses || 0}
              prefix="🦍"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Pulses"
              value={metrics?.totalPulses || 0}
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Pulse Indicator and Status */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={8}>
          <PulseIndicator
            pulseId="MAIN-001"
            burnRate={parseFloat(gorillaStatus?.burnRate || 0)}
            status={gorillaStatus?.status || 'building'}
          />
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Burn Rate Progress" extra={<SyncOutlined spin={loading} />}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '32px' }}>🔄</div>
                  <div style={{ marginTop: '8px' }}>BUILDING</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>&lt;4%</div>
                  <Progress
                    percent={((gorillaStatus?.breakdown?.building?.count || 0) / (metrics?.activePulses || 1)) * 100}
                    strokeColor="#faad14"
                    style={{ marginTop: '12px' }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '32px' }}>⚡</div>
                  <div style={{ marginTop: '8px' }}>ACTIVE</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>&gt;4%</div>
                  <Progress
                    percent={((gorillaStatus?.breakdown?.active?.count || 0) / (metrics?.activePulses || 1)) * 100}
                    strokeColor="#1890ff"
                    style={{ marginTop: '12px' }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '32px' }}>🦍</div>
                  <div style={{ marginTop: '8px' }}>OPTIMAL</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>&gt;40%</div>
                  <Progress
                    percent={((gorillaStatus?.breakdown?.optimal?.count || 0) / (metrics?.activePulses || 1)) * 100}
                    strokeColor="#52c41a"
                    style={{ marginTop: '12px' }}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Active Pulses Table */}
      <Card title="Active Pulses" style={{ marginBottom: '24px' }}>
        <Table
          columns={columns}
          dataSource={activePulses}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'No active pulses' }}
        />
      </Card>

      {/* Refresh Button */}
      <div style={{ textAlign: 'center' }}>
        <Button
          type="primary"
          icon={<SyncOutlined />}
          loading={loading}
          onClick={fetchDashboardData}
        >
          Refresh Data
        </Button>
      </div>
    </div>
  )
}

export default GorillaDashboard
