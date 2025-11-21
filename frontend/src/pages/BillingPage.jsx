import { useState, useEffect } from 'react'
import { CreditCard, Download, CheckCircle } from 'lucide-react'
import { billingService } from '../services/api'

function BillingPage() {
  const [subscription, setSubscription] = useState(null)
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      const [subRes, invRes] = await Promise.all([
        billingService.getSubscription(),
        billingService.getInvoices(),
      ])
      setSubscription(subRes.data)
      setInvoices(invRes.data)
    } catch (error) {
      console.error('Failed to load billing data:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing</h1>
        <p className="text-slate-400">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Current Plan</h3>
        </div>
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-2xl font-bold">Enterprise Plan</h3>
                <span className="badge badge-success">Active</span>
              </div>
              <p className="text-slate-400 mb-4">Full access to all APIs and features</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-seed-500" />
                  <span className="text-sm">Unlimited API requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-seed-500" />
                  <span className="text-sm">Priority support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-seed-500" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-seed-500" />
                  <span className="text-sm">Custom rate limits</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">$499</div>
              <div className="text-sm text-slate-400">per month</div>
              <button className="btn btn-secondary mt-4">Change Plan</button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold">Payment Method</h3>
          <button className="btn btn-secondary">Update</button>
        </div>
        <div className="card-body">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-slate-800 rounded-lg">
              <CreditCard className="w-8 h-8 text-vault-500" />
            </div>
            <div>
              <p className="font-semibold">•••• •••• •••• 4242</p>
              <p className="text-sm text-slate-400">Expires 12/2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage This Month */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Usage This Month</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-400 mb-2">API Requests</p>
              <p className="text-2xl font-bold">1,234,567</p>
              <p className="text-xs text-slate-400 mt-1">Unlimited included</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">Data Transfer</p>
              <p className="text-2xl font-bold">45.2 GB</p>
              <p className="text-xs text-slate-400 mt-1">100 GB included</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">Webhook Deliveries</p>
              <p className="text-2xl font-bold">8,932</p>
              <p className="text-xs text-slate-400 mt-1">Unlimited included</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Invoice History</h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, date: '2024-01-01', description: 'Enterprise Plan - January 2024', amount: 499, status: 'Paid' },
                  { id: 2, date: '2023-12-01', description: 'Enterprise Plan - December 2023', amount: 499, status: 'Paid' },
                  { id: 3, date: '2023-11-01', description: 'Enterprise Plan - November 2023', amount: 499, status: 'Paid' },
                ].map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-800">
                    <td className="py-3 px-4">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{invoice.description}</td>
                    <td className="py-3 px-4">${invoice.amount}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-success">{invoice.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="btn btn-secondary flex items-center space-x-2 ml-auto">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingPage
