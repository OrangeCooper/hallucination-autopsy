import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { ERROR_CATEGORIES, ERROR_CATEGORY_MAP } from '../data/errorCategories'
import ReportButton from './ReportButton'
import { scoreParagraphAnnotations, splitIntoParagraphs } from '../utils/annotations'
import { generateReviewSummary, generateFollowUpAnswer } from '../utils/api'

export default function AnalysisReport({ scenario, annotations, onBackToDashboard, isTutorial, onViewSkillProfile }) {
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
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
    generateReviewSummary(scenario, summaryAnnotations, scenario.plantedErrors, annotations, overrides)
      .then(text => { if (!cancelled) setSummary(text) })
      .catch(() => {
        if (!cancelled && scenario.tutorialStaticSummary) {
          setSummary(scenario.tutorialStaticSummary)
        } else if (!cancelled) {
          setSummary(null)
        }
      })
      .finally(() => { if (!cancelled) setSummaryLoading(false) })
    return () => { cancelled = true }
  }, [scenario, summaryAnnotations, isTutorial])

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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="glass-panel p-4">
        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--glass-accent)' }}>Analysis Report</h2>
        <p className="text-sm" style={{ color: 'var(--glass-primary)' }}>
          Your review identified <strong>{identifiedErrors.size}</strong> of{' '}
          <strong>{scenario.plantedErrors.length}</strong> planted issues.
          {falsePositives.length > 0 && (
            <> {falsePositives.length} passage(s) were flagged that did not correspond to planted errors.</>
          )}
        </p>
        {overrideCount > 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--glass-warning)' }}>
            {overrideCount} manual override{overrideCount !== 1 ? 's' : ''} applied
            {overrideMissed > 0 && ` (${overrideMissed} marked missed`}
            {overrideMissed > 0 && overrideIdentified > 0 ? ', ' : ''}
            {overrideIdentified > 0 && `${overrideIdentified} marked identified)`}
            {overrideMissed > 0 && overrideIdentified === 0 ? ')' : ''}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {categoryBreakdown.map(cat => (
            <div key={cat.id} className="flex items-center gap-1 text-xs" style={{ color: 'var(--glass-secondary)' }}>
              {cat.status === 'not-present' && <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />}
              {cat.status === 'identified' && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--glass-success)' }} />}
              {cat.status === 'missed' && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--glass-error)' }} />}
              {cat.status === 'partial' && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--glass-warning)' }} />}
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 no-print">
        <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--glass-muted)' }}>Annotated Document</h3>
        <div className="document-text whitespace-pre-wrap rounded border p-6 document-viewer" style={{ background: '#fff', border: 'none' }}>
          {renderAnnotatedDoc()}
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs" style={{ color: 'var(--glass-secondary)' }}>
          <span><span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{ background: 'rgba(110,231,183,0.4)' }} /> Correctly identified</span>
          <span><span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{ background: 'rgba(248,113,113,0.4)' }} /> Missed</span>
          <span><span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{ background: 'rgba(251,191,36,0.4)' }} /> Wrong category</span>
          <span><span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{ background: 'rgba(251,191,36,0.4)' }} /> Not a planted error</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium" style={{ color: 'var(--glass-primary)' }}>Error Analysis</h3>
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
          />
        ))}
      </div>

      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium" style={{ color: 'var(--glass-primary)' }}>Written Review Summary</h3>
          <span className="tag-gray text-[10px]">AI-generated — verify independently</span>
        </div>
        {summaryLoading ? (
          <div className="space-y-2.5" role="status" aria-label="Generating written review summary">
            <div className="shimmer-block h-3 w-full" />
            <div className="shimmer-block h-3 w-11/12" />
            <div className="shimmer-block h-3 w-3/4" />
          </div>
        ) : summary ? (
          <p className="text-sm leading-relaxed animate-fade-in" style={{ color: 'var(--glass-primary)' }}>{summary}</p>
        ) : (
          <p className="text-sm italic animate-fade-in" style={{ color: 'var(--glass-secondary)' }}>Analysis could not be generated at this time. The AI service may be unavailable. Please review the explanation panels above directly.</p>
        )}
      </div>

      <div className="flex justify-center gap-3">
        {isTutorial ? (
          <button onClick={onViewSkillProfile} className="btn-primary">Continue to Test Mode</button>
        ) : (
          <button onClick={() => onBackToDashboard(annotations, overrides, new Set(identifiedErrors))} className="btn-secondary">Save &amp; Return</button>
        )}
      </div>
    </div>
  )
}

function ErrorPanel({ error, idx, scenario, isIdentified, autoMatch, overridesRef, onOverride, paragraphs }) {
  const [localOverride, setLocalOverride] = useState(null)
  const [conversation, setConversation] = useState([])
  const [loading, setLoading] = useState(false)
  const [followUpError, setFollowUpError] = useState(null)
  const userAnn = autoMatch.matchedAnnotations.find(a => a.matchedErrorId === error.errorId)
  const wrongCategory = userAnn && userAnn.category !== error.category
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

  const handleAsk = async (question) => {
    if (!question.trim()) return
    setConversation(prev => [...prev, { role: 'user', text: question }])
    setLoading(true)
    setFollowUpError(null)
    try {
      const answer = await generateFollowUpAnswer(error.category, error.explanation, scenario.title, question, conversation)
      setConversation(prev => [...prev, { role: 'assistant', text: answer }])
    } catch {
      setFollowUpError(true)
    } finally {
      setLoading(false)
    }
  }

  const isOverruled = localOverride !== null

  return (
    <div className={`glass-panel p-5 border-l-4 ${effectiveIdentified ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="tag-green text-xs">Error {idx + 1}</span>
        <span className="text-sm font-medium" style={{ color: 'var(--glass-accent)' }}>
          {ERROR_CATEGORY_MAP[error.category]?.label || error.category}
        </span>
        {effectiveIdentified && <span className="tag-green">Identified</span>}
        {!effectiveIdentified && !wrongCategory && <span className="tag-red">Missed</span>}
        {wrongCategory && !isOverruled && <span className="tag-amber">Wrong category</span>}
        {isOverruled && <span className="tag-amber">Overruled</span>}
      </div>

      <div className="document-viewer rounded p-3 mb-3 text-sm document-text leading-relaxed whitespace-pre-wrap" style={{ background: '#fff' }}>
        <span className="tag-gray text-[10px] mb-1 inline-block" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>Paragraph {error.paragraphNumber || '?'}</span>
        <span style={{ color: '#374151' }}>{paragraphText ? `"${paragraphText.slice(0, 300)}${paragraphText.length > 300 ? '...' : ''}"` : '(paragraph not found)'}</span>
      </div>

      <div className="text-sm leading-relaxed mb-3" style={{ color: 'var(--glass-primary)' }}>{error.explanation}</div>

      {error.correctLaw && (
        <div className="text-xs rounded p-2 mb-2" style={{ color: 'var(--glass-accent)', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
          <strong>Correct law:</strong> {error.correctLaw}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <ReportButton scenarioId={scenario.id} errorId={error.errorId} />
        <button
          onClick={toggleOverride}
          className="text-[10px] rounded px-1.5 py-0.5 transition-colors"
          style={{
            color: effectiveIdentified ? 'var(--glass-error)' : 'var(--glass-success)',
            border: `1px solid ${effectiveIdentified ? 'rgba(248,113,113,0.3)' : 'rgba(110,231,183,0.3)'}`,
            background: 'transparent',
          }}
        >
          {isOverruled ? (effectiveIdentified ? 'Overruled Identified' : 'Overruled Missed') : (effectiveIdentified ? 'Overrule: Mark Missed' : 'Overrule: Mark Identified')}
        </button>
      </div>

      <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {conversation.length > 0 && (
          <div className="space-y-2 mb-2 max-h-48 overflow-y-auto">
            {conversation.map((msg, i) => (
              <div key={i} className={`text-xs p-2 rounded`} style={{
                background: msg.role === 'user' ? 'rgba(255,255,255,0.04)' : 'rgba(96,165,250,0.1)',
                color: 'var(--glass-primary)',
              }}>
                {msg.role === 'assistant' && (
                  <span className="tag-gray text-[10px] mb-1 inline-block">AI-generated — verify independently</span>
                )}
                <div className="mt-0.5">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs p-2" role="status" aria-label="Generating answer" style={{ color: 'var(--glass-muted)' }}>
                <span>Generating answer</span>
                <div className="dot-pulse">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>
        )}
        {followUpError && !loading && <p className="text-xs mb-2 animate-fade-in" style={{ color: 'var(--glass-error)' }}>Analysis could not be generated at this time. The AI service may be unavailable.</p>}
        <FollowUpForm onSubmit={handleAsk} loading={loading} />
      </div>
    </div>
  )
}

function FollowUpForm({ onSubmit, loading }) {
  const [question, setQuestion] = useState('')
  const handleSubmit = () => {
    if (!question.trim() || loading) return
    onSubmit(question)
    setQuestion('')
  }
  return (
    <div className="flex gap-2">
      <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
        placeholder="Ask a follow-up question..."
        className="glass-input flex-1"
        disabled={loading} />
      <button onClick={handleSubmit} disabled={!question.trim() || loading} className="btn-primary btn-small">Ask</button>
    </div>
  )
}
