import { useState, useMemo } from 'react'
import { addReport, getReportCountForExplanation } from '../utils/storage'

const ISSUE_CATEGORIES = [
  { value: 'incorrect-citation', label: 'The cited case or statute reference appears to be incorrect' },
  { value: 'inaccurate-rule', label: 'The legal rule as stated appears to be inaccurate' },
  { value: 'wrong-jurisdiction', label: 'The jurisdiction identified appears to be wrong' },
  { value: 'outdated', label: 'This explanation appears to be outdated' },
]

export default function ReportButton({ scenarioId, errorId }) {
  const [expanded, setExpanded] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [userText, setUserText] = useState('')

  const reportCount = useMemo(() => {
    return getReportCountForExplanation(scenarioId, errorId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, errorId, submitted])

  const handleSubmit = () => {
    if (!selectedCategory) return
    addReport({
      scenarioId,
      errorId,
      category: selectedCategory,
      userText,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mt-3 text-sm text-gray-500 italic">
        Report submitted. Thank you for flagging this.
      </div>
    )
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm underline"
        style={{ color: 'var(--glass-secondary)' }}
      >
        Report an issue with this explanation
      </button>

      {reportCount >= 3 && (
        <div className="mt-2 p-2 rounded text-xs" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: 'var(--glass-warning)' }}>
          Community Flag: This explanation has been flagged by multiple users as potentially containing an error.
          It has not been independently verified. Do not rely on this explanation without conducting your own
          primary source research.
        </div>
      )}

      {expanded && (
        <div className="mt-2 p-3 glass-panel-elevated space-y-2">
          <p className="text-xs font-medium" style={{ color: 'var(--glass-primary)' }}>What issue are you reporting?</p>
          {ISSUE_CATEGORIES.map(cat => (
            <label key={cat.value} className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="radio"
                name={`issue-${errorId}`}
                value={cat.value}
                checked={selectedCategory === cat.value}
                onChange={() => setSelectedCategory(cat.value)}
                className="glass-radio mt-0.5"
              />
              {cat.label}
            </label>
          ))}
          {selectedCategory === 'other' && (
            <textarea
              value={userText}
              onChange={e => setUserText(e.target.value)}
              placeholder="Describe the issue or provide a correction..."
              maxLength={500}
              className="w-full text-xs glass-textarea resize-none h-16"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!selectedCategory}
              className="btn-primary text-xs !px-3 !py-1.5"
            >
              Submit Report
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="btn-secondary text-xs !px-3 !py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
