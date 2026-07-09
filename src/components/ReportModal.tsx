'use client'

import React from 'react'
import { X, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import { reportUserAction } from '@/app/actions/report'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
}

export default function ReportModal({ isOpen, onClose, reportedUserId, reportedUserName }: ReportModalProps) {
  const [reason, setReason] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Prevent scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setReason('')
      setError(null)
      setSuccess(false)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Please provide a reason for the report.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await reportUserAction(reportedUserId, reason)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 1800)
      }
    } catch {
      setError('Failed to submit the report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-md bg-white border rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        style={{ borderColor: 'var(--border-hairline)', background: 'var(--bg-card)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-hairline)' }}>
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-bold text-slate-900 text-base">Report Organization</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-green-600 animate-bounce" />
            <h4 className="font-bold text-slate-900">Report Submitted</h4>
            <p className="text-xs text-slate-500">Thank you. The administrators will review this report shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-600">
                You are reporting: <strong className="text-slate-900">{reportedUserName}</strong>
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                Reports are forwarded to the system administrators for review. Please provide clear details.
              </p>
            </div>

            {error && (
              <div 
                className="text-xs p-3 rounded-lg border font-medium"
                style={{ background: 'var(--urgent-bg)', color: 'var(--urgent-text)', borderColor: 'var(--urgent-text)' }}
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="reason" className="text-xs font-semibold text-slate-700">
                Reason for report
              </label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe why you are reporting this organization..."
                className="w-full text-xs p-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-450 bg-slate-50/50"
                style={{ borderColor: 'var(--border-hairline)' }}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md disabled:opacity-50"
                style={{ background: 'var(--brand-green)' }}
                onMouseOver={e => !loading && (e.currentTarget.style.background = 'var(--brand-green-hover)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-green)')}
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
