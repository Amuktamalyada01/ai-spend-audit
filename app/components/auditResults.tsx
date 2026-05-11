'use client'

import { AuditResult, AuditFinding } from '../lib/auditEngine'

// Color coding based on finding status
function statusColor(status: AuditFinding['status']) {
  if (status === 'overspending') return 'border-red-400 bg-red-50'
  if (status === 'switch') return 'border-yellow-400 bg-yellow-50'
  return 'border-green-400 bg-green-50'
}

function statusBadge(status: AuditFinding['status']) {
  if (status === 'overspending') return 'bg-red-100 text-red-700'
  if (status === 'switch') return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

function statusLabel(status: AuditFinding['status']) {
  if (status === 'overspending') return 'Overspending'
  if (status === 'switch') return 'Better Option Exists'
  return 'Optimal'
}

export default function AuditResults({
  result,
  onBack
}: {
  result: AuditResult
  onBack: () => void
}) {
  const hasBigSavings = result.totalMonthlySavings > 500

  return (
    <div className="max-w-2xl mx-auto p-6">

      {/* Back button */}
      <button onClick={onBack} className="text-blue-500 underline mb-6 block">
        ← Run another audit
      </button>

      {/* Hero — the big number */}
      <div className="bg-white rounded-2xl shadow p-8 mb-8 text-center">
        <p className="text-gray-500 mb-2">Your potential savings</p>
        <p className="text-5xl font-bold text-green-600 mb-1">
          ${result.totalMonthlySavings.toLocaleString()}/mo
        </p>
        <p className="text-gray-400 text-lg">
          ${result.totalAnnualSavings.toLocaleString()} per year
        </p>

        {/* Honest message if already optimal */}
        {result.totalMonthlySavings === 0 && (
          <p className="mt-4 text-gray-600 font-medium">
            You're spending well. No obvious overspend detected.
          </p>
        )}

        {/* Credex CTA for high savings */}
        {hasBigSavings && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-semibold text-blue-800 mb-1">
              You could save even more with Credex
            </p>
            <p className="text-blue-600 text-sm mb-3">
              Credex sells discounted AI credits from companies that overforecast.
              Real discounts, same tools.
            </p>
            
              href="https://credex.rocks"
              target="_blank"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
            <a>
              Book a free Credex consultation →
            </a>
          </div>
        )}
      </div>

      {/* Per-tool breakdown */}
      <h2 className="text-xl font-bold mb-4">Breakdown by tool</h2>

      {result.findings.map((finding, index) => (
        <div
          key={index}
          className={`border-l-4 rounded-lg p-5 mb-4 ${statusColor(finding.status)}`}
        >
          {/* Tool name + status badge */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-bold text-gray-800">{finding.tool}</span>
              <span className="text-gray-500 text-sm ml-2">({finding.plan} plan)</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge(finding.status)}`}>
              {statusLabel(finding.status)}
            </span>
          </div>

          {/* Current spend */}
          <p className="text-sm text-gray-600 mb-1">
            Current spend: <span className="font-medium">${finding.currentSpend}/mo</span>
          </p>

          {/* Recommendation */}
          <p className="text-sm font-medium text-gray-800 mb-1">
            → {finding.recommendedAction}
          </p>

          {/* Reason */}
          <p className="text-sm text-gray-500 mb-2">{finding.reason}</p>

          {/* Savings — only show if there are any */}
          {finding.monthlySavings > 0 && (
            <div className="flex gap-4 mt-3">
              <div className="bg-white rounded-lg px-3 py-2 text-center shadow-sm">
                <p className="text-xs text-gray-400">Monthly savings</p>
                <p className="font-bold text-green-600">${finding.monthlySavings}/mo</p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 text-center shadow-sm">
                <p className="text-xs text-gray-400">Annual savings</p>
                <p className="font-bold text-green-600">${finding.annualSavings}/yr</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Low savings — notify me signup */}
      {result.totalMonthlySavings === 0 && (
        <div className="bg-white rounded-xl border p-5 mt-4 text-center">
          <p className="font-medium text-gray-700 mb-1">
            Your stack looks lean already.
          </p>
          <p className="text-sm text-gray-500 mb-3">
            Want us to notify you when new optimizations apply to your stack?
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 border rounded-lg px-3 py-2 text-sm text-gray-800"
            />
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
              Notify me
            </button>
          </div>
        </div>
      )}

    </div>
  )
}