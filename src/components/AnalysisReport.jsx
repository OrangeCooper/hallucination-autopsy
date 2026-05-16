import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { ERROR_CATEGORIES, ERROR_CATEGORY_MAP } from '../data/errorCategories'
import ReportButton from './ReportButton'
import { scoreParagraphAnnotations, splitIntoParagraphs } from '../utils/annotations'
import { generateReviewSummary, generateFollowUpAnswer } from '../utils/api'

export default function AnalysisReport({ scenario, annotations, onBackToDashboard }) {
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [followUps, setFollowUps] = useState({})
  const [hoveredError, setHoveredError] = useState(null)
  const [overrides, setOverrides] = useState({})
  const overridesRef = useRef(overrides)
  overridesRef.current = overrides

  const paragraphs = useMemo(() => splitIntoParagraphs(scenario.document), [scenario.document])

  const autoMatch = useMemo(
    () => scoreParagraphAnnotations(annotations, scenario.plantedErrors),
    [annotations, scenario.plantedErrors]
  )

  const identifiedErrors = useMemo(() => {
    const base = new Set(autoMatch.identifiedErrors)
    for (const [errorId, action] of Object.entries(overrides)) {
      if (action === 'mark-identified') base.add(errorId)
      if (action === 'mark-missed') base.delete(errorId)
    }
    return base
  }, [autoMatch.identifiedErrors, overrides])

  const falsePositives = useMemo(() => {
    return autoMatch.matchedAnnotations.filter(a => !a.matchedErrorId)
  }, [autoMatch.matchedAnnotations])

  const handleOverride = useCallback((errorId, action) => {
    setOverrides(prev => {
      const next = { ...prev }
      if (action === 'clear') {
        delete next[errorId]
      } else {
        next[errorId] = action
      }
      return next
    })
  }, [])

  const overrideCount = Object.keys(overrides).length
  const overrideMissed = Object.values(overrides).filter(v => v === 'mark-missed').length
  const overrideIdentified = Object.values(overrides).filter(v => v === 'mark-identified').length

  const summaryAnnotations = useMemo(() => {
    return autoMatch.matchedAnnotations.map(a => {
      if (a.matchedErrorId && overrides[a.matchedErrorId] === 'mark-missed') {
        return { ...a, matchedErrorId: null, overruled: true }
      }
      return a
    })
  }, [autoMatch.matchedAnnotations, overrides])

  useEffect(() => {
    let cancelled = false
    setSummaryLoading(true)
    generateReviewSummary(scenario, summaryAnnotations, scenario.plantedErrors)
      .then(text => { if (!cancelled) setSummary(text) })
      .catch(() => { if (!cancelled) setSummary(null) })
      .finally(() => { if (!cancelled) setSummaryLoading(false) })
    return () => { cancelled = true }
  }, [scenario, summaryAnnotations])

  const handleFollowUp = async (errorId, question) => {
    const error = scenario.plantedErrors.find(e => e.errorId === errorId)
    if (!error || !question.trim()) return
    setFollowUps(prev => ({ ...prev, [errorId]: { ...prev[errorId], loading: true } }))
    try {
      const answer = await generateFollowUpAnswer(error.category, error.explanation, scenario.title, question)
      setFollowUps(prev => ({ ...prev, [errorId]: { answer, question, loading: false } }))
    } catch {
      setFollowUps(prev => ({ ...prev, [errorId]: { answer: null, loading: false, error: true } }))
    }
  }

  const renderAnnotatedDoc = () => {
    const matchedByParagraph = {}
    autoMatch.matchedAnnotations.forEach(ann => {
      matchedByParagraph[ann.paragraphNumber] = ann
    })

    const errorByParagraph = {}
    scenario.plantedErrors.forEach(e => {
      if (e.paragraphNumber) errorByParagraph[e.paragraphNumber] = e
    })

    return (
      <div className="space-y-0">
        {paragraphs.map((para, idx) => {
          const paraNum = idx + 1
          const ann = matchedByParagraph[paraNum]
          const error = errorByParagraph[paraNum]
          const isIdentified = ann?.matchedErrorId && identifiedErrors.has(ann.matchedErrorId)
          const wrongCategory = ann?.matchedErrorId && ann.wrongCategory
          const isFalsePositive = ann && !ann.matchedErrorId
          const isMissed = error && !identifiedErrors.has(error.errorId) && !ann

          let borderClass = ''
          if (isIdentified && !wrongCategory) borderClass = 'border-l-green-500 bg-green-50/40'
          else if (wrongCategory) borderClass = 'border-l-amber-500 bg-amber-50/40'
          else if (isFalsePositive) borderClass = 'border-l-yellow-500 bg-yellow-50/40'
          else if (isMissed) borderClass = 'border-l-red-500 bg-red-50/40'

          return (
            <div
              key={idx}
              className={`border-l-2 px-3 py-1.5 ${borderClass || 'border-l-transparent'}`}
              onMouseEnter={error ? () => setHoveredError(error.errorId) : undefined}
              onMouseLeave={() => setHoveredError(null)}
            >
              <span className="text-[10px] text-gray-300 font-mono mr-2 select-none">{paraNum}</span>
              <span className="leading-relaxed text-gray-900">{para}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const categoryBreakdown = ERROR_CATEGORIES.map(cat => {
    const planted = scenario.plantedErrors.filter(e => e.category === cat.id)
    if (planted.length === 0) return { ...cat, status: 'not-present' }
    const identified = planted.filter(e => identifiedErrors.has(e.errorId)).length
    if (identified === planted.length) return { ...cat, status: 'identified' }
    if (identified === 0) return { ...cat, status: 'missed' }
    return { ...cat, status: 'partial', identified, total: planted.length }
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="card p-4 mb-6">
        <h2 className="text-base font-semibold text-navy-500 mb-2">Analysis Report</h2>
        <p className="text-sm text-gray-700">
          Your review identified <strong>{identifiedErrors.size}</strong> of{' '}
          <strong>{scenario.plantedErrors.length}</strong> planted issues.
          {falsePositives.length > 0 && (
            <> {falsePositives.length} passage(s) were flagged that did not correspond to planted errors.</>
          )}
        </p>
        {overrideCount > 0 && (
          <p className="text-xs text-amber-700 mt-1">
            {overrideCount} manual override{overrideCount !== 1 ? 's' : ''} applied
            {overrideMissed > 0 && ` (${overrideMissed} marked missed`}
            {overrideMissed > 0 && overrideIdentified > 0 ? ', ' : ''}
            {overrideIdentified > 0 && `${overrideIdentified} marked identified)`}
            {overrideMissed > 0 && overrideIdentified === 0 ? ')' : ''}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {categoryBreakdown.map(cat => (
            <div key={cat.id} className="flex items-center gap-1 text-xs">
              {cat.status === 'not-present' && <span className="w-2 h-2 rounded-full bg-gray-300" />}
              {cat.status === 'identified' && <span className="w-2 h-2 rounded-full bg-green-500" />}
              {cat.status === 'missed' && <span className="w-2 h-2 rounded-full bg-red-500" />}
              {cat.status === 'partial' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
              <span className="text-gray-600">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 mb-6 no-print">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Annotated Document</h3>
        <div className="document-text text-gray-900 whitespace-pre-wrap bg-gray-50 p-6 rounded border border-gray-200">
          {renderAnnotatedDoc()}
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
          <span><span className="inline-block w-3 h-3 bg-green-200/60 rounded mr-1 align-middle" /> Correctly identified</span>
          <span><span className="inline-block w-3 h-3 bg-red-200/60 rounded mr-1 align-middle" /> Missed</span>
          <span><span className="inline-block w-3 h-3 bg-amber-200/60 rounded mr-1 align-middle" /> Wrong category</span>
          <span><span className="inline-block w-3 h-3 bg-yellow-200/60 rounded mr-1 align-middle" /> Not a planted error</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700">Error Analysis</h3>
        {scenario.plantedErrors.map((error, idx) => (
          <ErrorPanel
            key={error.errorId}
            error={error}
            idx={idx}
            scenario={scenario}
            paragraphs={paragraphs}
            isIdentified={identifiedErrors.has(error.errorId)}
            autoMatch={autoMatch}
            overridesRef={overridesRef}
            onOverride={handleOverride}
            followUps={followUps}
            onFollowUp={handleFollowUp}
          />
        ))}
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium text-gray-700">Written Review Summary</h3>
          <span className="tag-gray text-[10px]">AI-generated — verify independently</span>
        </div>
        {summaryLoading ? (
          <div className="space-y-2.5" role="status" aria-label="Generating written review summary">
            <div className="shimmer-block h-3 w-full" />
            <div className="shimmer-block h-3 w-11/12" />
            <div className="shimmer-block h-3 w-3/4" />
          </div>
        ) : summary ? (
          <p className="text-sm text-gray-700 leading-relaxed animate-fade-in">{summary}</p>
        ) : (
          <p className="text-sm text-gray-500 italic animate-fade-in">Analysis could not be generated at this time. The AI service may be unavailable. Please review the explanation panels above directly.</p>
        )}
      </div>

      <div className="flex justify-center">
        <button onClick={() => onBackToDashboard(annotations, overrides, new Set(identifiedErrors))} className="btn-secondary">Save &amp; Return</button>
      </div>
    </div>
  )
}

function ErrorPanel({ error, idx, scenario, isIdentified, autoMatch, overridesRef, onOverride, followUps, onFollowUp, paragraphs }) {
  const [localOverride, setLocalOverride] = useState(null)
  const userAnn = autoMatch.matchedAnnotations.find(a => a.matchedErrorId === error.errorId)
  const wrongCategory = userAnn && userAnn.category !== error.category
  const fu = followUps[error.errorId]
  const paragraphText = paragraphs?.[error.paragraphNumber - 1] || ''

  const effectiveIdentified = localOverride !== null
    ? localOverride === 'identified'
    : isIdentified

  const toggleOverride = () => {
    if (localOverride === null) {
      const action = isIdentified ? 'missed' : 'identified'
      setLocalOverride(action)
      onOverride(error.errorId, `mark-${action}`)
    } else if (localOverride === 'identified') {
      setLocalOverride('missed')
      onOverride(error.errorId, 'mark-missed')
    } else {
      setLocalOverride(null)
      onOverride(error.errorId, 'clear')
    }
  }

  const isOverruled = localOverride !== null

  return (
    <div className={`card p-5 border-l-4 ${effectiveIdentified ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="tag-green text-xs">Error {idx + 1}</span>
        <span className="text-sm font-medium text-navy-500">
          {ERROR_CATEGORY_MAP[error.category]?.label || error.category}
        </span>
        {effectiveIdentified && <span className="tag-green">Identified</span>}
        {!effectiveIdentified && !wrongCategory && <span className="tag-red">Missed</span>}
        {wrongCategory && !isOverruled && <span className="tag-amber">Wrong category</span>}
        {isOverruled && <span className="tag-amber">Overruled</span>}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3 text-sm text-gray-600 document-text leading-relaxed whitespace-pre-wrap">
        <span className="tag-gray text-[10px] mb-1 inline-block">Paragraph {error.paragraphNumber || '?'}</span>
        {paragraphText ? `"${paragraphText.slice(0, 300)}${paragraphText.length > 300 ? '...' : ''}"` : '(paragraph not found)'}
      </div>

      <div className="text-sm text-gray-700 leading-relaxed mb-3">{error.explanation}</div>

      {error.correctLaw && (
        <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2 mb-2">
          <strong>Correct law:</strong> {error.correctLaw}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <ReportButton scenarioId={scenario.id} errorId={error.errorId} />
        <button
          onClick={toggleOverride}
          className="text-[10px] border rounded px-1.5 py-0.5 hover:bg-gray-50 transition-colors"
          style={{
            color: effectiveIdentified ? '#dc2626' : '#16a34a',
            borderColor: effectiveIdentified ? '#fecaca' : '#bbf7d0',
          }}
        >
          {isOverruled ? (effectiveIdentified ? 'Overruled Identified' : 'Overruled Missed') : (effectiveIdentified ? 'Overrule: Mark Missed' : 'Overrule: Mark Identified')}
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <FollowUpForm errorId={error.errorId} onSubmit={onFollowUp} followUp={fu} />
        {fu?.loading && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400" role="status" aria-label="Generating answer">
            <span>Generating answer</span>
            <div className="dot-pulse">
              <span /><span /><span />
            </div>
          </div>
        )}
        {fu?.answer && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700 animate-fade-in">
            <span className="tag-gray text-[10px] mb-1 inline-block">AI-generated — verify independently</span>
            <div className="mt-1">{fu.answer}</div>
          </div>
        )}
        {fu?.error && <p className="text-xs text-red-500 mt-1 animate-fade-in">Analysis could not be generated at this time. The AI service may be unavailable.</p>}
      </div>
    </div>
  )
}

function FollowUpForm({ errorId, onSubmit, followUp }) {
  const [question, setQuestion] = useState('')
  const handleSubmit = () => { if (!question.trim()) return; onSubmit(errorId, question); setQuestion('') }
  if (followUp?.answer) return null
  return (
    <div className="flex gap-2">
      <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
        placeholder="Ask a follow-up question..." className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-navy-300" disabled={followUp?.loading} />
      <button onClick={handleSubmit} disabled={!question.trim() || followUp?.loading} className="btn-primary text-xs !px-2 !py-1">Ask</button>
    </div>
  )
}
