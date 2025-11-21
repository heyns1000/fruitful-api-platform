/**
 * PulseIndicator Component
 * 9-second countdown timer with visual pulse animation
 * Displays Gorilla Vol burn rate
 */

import { useState, useEffect } from 'react'
import { Card, Progress, Statistic, Badge } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'

const PulseIndicator = ({ pulseId, burnRate = 0 }) => {
  const [countdown, setCountdown] = useState(9)
  const [pulseActive, setPulseActive] = useState(false)

  useEffect(() => {
    // 9-second countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setPulseActive(true)
          setTimeout(() => setPulseActive(false), 300)
          return 9
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Get status color and icon
  const getStatusColor = () => {
    if (burnRate > 40) return '#52c41a' // Green - OPTIMAL
    if (burnRate > 4) return '#1890ff' // Blue - ACTIVE
    return '#faad14' // Orange - BUILDING
  }

  const getStatusEmoji = () => {
    if (burnRate > 40) return '🦍'
    if (burnRate > 4) return '⚡'
    return '🔄'
  }

  const getStatusText = () => {
    if (burnRate > 40) return 'OPTIMAL'
    if (burnRate > 4) return 'ACTIVE'
    return 'BUILDING'
  }

  const progressPercent = ((9 - countdown) / 9) * 100

  return (
    <Card
      className={`pulse-indicator ${pulseActive ? 'pulse-animation' : ''}`}
      style={{
        borderRadius: '12px',
        boxShadow: pulseActive ? '0 0 20px rgba(24, 144, 255, 0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {getStatusEmoji()}
        </div>

        <Statistic
          title="Next Pulse In"
          value={countdown}
          suffix="s"
          valueStyle={{
            fontSize: '36px',
            color: getStatusColor(),
            fontWeight: 'bold',
          }}
        />

        <Progress
          percent={progressPercent}
          strokeColor={getStatusColor()}
          showInfo={false}
          style={{ marginTop: '16px' }}
        />

        <div style={{ marginTop: '24px' }}>
          <Badge
            status={burnRate > 4 ? 'processing' : 'default'}
            text={
              <span style={{ fontSize: '16px', fontWeight: '500' }}>
                <ThunderboltOutlined /> Gorilla Vol: {burnRate.toFixed(2)}%
              </span>
            }
          />
        </div>

        <div style={{ marginTop: '12px' }}>
          <Badge color={getStatusColor()} text={getStatusText()} />
        </div>

        {pulseId && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#8c8c8c' }}>
            Pulse ID: {pulseId}
          </div>
        )}
      </div>

      <style>{`
        .pulse-animation {
          animation: pulse 0.3s ease-in-out;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </Card>
  )
}

export default PulseIndicator
