import { useState, useEffect, useMemo, useCallback } from 'react'
import { ERROR_CATEGORIES, ERROR_CATEGORY_MAP } from '../data/errorCategories'
import ReportButton from './ReportButton'
import { getErrorId, scoreParagraphAnnotations, splitIntoParagraphs } from '../utils/annotations'
import { generateReviewSummary, generateFollowUpAnswer } from '../utils/api'

export default function AnalysisReport({ scenario, annotations, onBackToDashboard, isTutorial, onViewSkillProfile }) {
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [overrides, setOverrides] = useState({})
  const [dismissedFP, setDismissedFP] = useState(new Set())

  const paragraphs = useMemo(() => splitIntoParagraphs(scenario.document), [scenario.document])

  const autoMatch = useMemo(
    () => scoreParagraphAnnotations(annotations, scenario.plantedErrors),
    [annotations, scenario.plantedErrors]
  )

  const excludedErrorIds = useMemo(() => {
    return new Set(
      Object.entries(overrides)
        .filter(([, action]) => action === 'exclude-error')
        .map(([id]) => id)
    )
  }, [overrides])

  const promotedFalsePositives = useMemo(() => {
    return autoMatch.matchedAnnotations.filter(a => !a.matchedErrorId && overrides[`fp:${a.id}`] === 'promote-false-positive')
  }, [autoMatch.matchedAnnotations, overrides])

  const identifiedErrors = useMemo(() => {
    const base = new Set(autoMatch.identifiedErrors)
    for (const [errorId, action] of Object.entries(overrides)) {
      if (action === 'mark-identified' || action === 'accept-category') base.add(errorId)
      if (action === 'mark-missed') base.delete(errorId)
      if (action === 'exclude-error') base.delete(errorId)
    }
    for (const errorId of excludedErrorIds) base.delete(errorId)
    return base
  }, [autoMatch.identifiedErrors, excludedErrorIds, overrides])

  const scoreTotals = useMemo(() => {
    const denominator = scenario.plantedErrors.filter(e => !excludedErrorIds.has(getErrorId(e))).length + promotedFalsePositives.length
    return {
      denominator,
      identified: identifiedErrors.size + promotedFalsePositives.length,
    }
  }, [excludedErrorIds, identifiedErrors.size, promotedFalsePositives.length, scenario.plantedErrors])

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

  const handleToggleFP = useCallback((annId) => {
    setDismissedFP(prev => {
      const next = new Set(prev)
      if (next.has(annId)) next.delete(annId)
      else next.add(annId)
      return next
    })
  }, [])

  const activeFPs = useMemo(() => {
    return falsePositives.filter(a => !dismissedFP.has(a.id) && overrides[`fp:${a.id}`] !== 'promote-false-positive')
  }, [falsePositives, dismissedFP, overrides])

  const savedAnnotations = useMemo(() => {
    return annotations.filter(a => !dismissedFP.has(a.id))
  }, [annotations, dismissedFP])

  const overrideCount = Object.keys(overrides).length
  const overrideMissed = Object.values(overrides).filter(v => v === 'mark-missed').length
  const overrideIdentified = Object.values(overrides).filter(v => v === 'mark-identified' || v === 'accept-category' || v === 'promote-false-positive').length
  const overrideExcluded = Object.values(overrides).filter(v => v === 'exclude-error').length
  const overrideDetails = [
    overrideMissed > 0 ? `${overrideMissed} marked missed` : null,
    overrideIdentified > 0 ? `${overrideIdentified} marked identified` : null,
    overrideExcluded > 0 ? `${overrideExcluded} excluded` : null,
  ].filter(Boolean)

  const summaryAnnotations = useMemo(() => {
    return autoMatch.matchedAnnotations
      .filter(a => a.matchedErrorId || !dismissedFP.has(a.id))
      .map(a => {
        const override = a.matchedErrorId ? overrides[a.matchedErrorId] : overrides[`fp:${a.id}`]
        if (!override) return a
        const overrideResult = override === 'mark-missed'
          ? 'missed'
          : override === 'accept-category'
            ? 'accepted-category'
            : override === 'promote-false-positive'
              ? 'promoted-false-positive'
              : override === 'exclude-error'
                ? 'excluded'
                : 'identified'
        return { ...a, overrideResult }
      })
  }, [autoMatch.matchedAnnotations, overrides, dismissedFP])

  const fallbackSummary = useMemo(() => {
    const parts = [
      `The review currently scores ${scoreTotals.identified} of ${scoreTotals.denominator} issue${scoreTotals.denominator !== 1 ? 's' : ''} as identified.`,
    ]
    if (overrideCount > 0) {
      parts.push(`Manual overrides are reflected in this score: ${overrideDetails.join(', ') || `${overrideCount} applied`}.`)
    }
    if (activeFPs.length > 0) {
      parts.push(`${activeFPs.length} flagged passage${activeFPs.length !== 1 ? 's' : ''} remain treated as false positive${activeFPs.length !== 1 ? 's' : ''}.`)
    }
    if (promotedFalsePositives.length > 0) {
      parts.push(`${promotedFalsePositives.length} non-planted passage${promotedFalsePositives.length !== 1 ? 's were' : ' was'} accepted as valid issue${promotedFalsePositives.length !== 1 ? 's' : ''}.`)
    }
    if (excludedErrorIds.size > 0) {
      parts.push(`${excludedErrorIds.size} planted issue${excludedErrorIds.size !== 1 ? 's were' : ' was'} excluded from scoring as not a real error.`)
    }
    return parts.join(' ')
  }, [activeFPs.length, excludedErrorIds.size, overrideCount, overrideDetails, promotedFalsePositives.length, scoreTotals.denominator, scoreTotals.identified])

  useEffect(() => {
    let cancelled = false
    setSummaryLoading(true)
    generateReviewSummary(scenario, summaryAnnotations, scenario.plantedErrors, savedAnnotations, overrides)
      .then(text => { if (!cancelled) setSummary(text) })
      .catch(() => {
        if (!cancelled) setSummary(fallbackSummary)
      })
      .finally(() => { if (!cancelled) setSummaryLoading(false) })
    return () => { cancelled = true }
  }, [scenario, summaryAnnotations, savedAnnotations, overrides, isTutorial, fallbackSummary])

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
          const errorId = getErrorId(error)
          const annOverride = ann?.matchedErrorId ? overrides[ann.matchedErrorId] : null
          const fpOverride = ann && !ann.matchedErrorId ? overrides[`fp:${ann.id}`] : null
          const isIdentified = ann?.matchedErrorId && identifiedErrors.has(ann.matchedErrorId)
          const wrongCategory = ann?.matchedErrorId && ann.wrongCategory && annOverride !== 'accept-category'
          const isFalsePositive = ann && !ann.matchedErrorId
          const isDismissedFP = isFalsePositive && dismissedFP.has(ann.id)
          const isExcluded = errorId && excludedErrorIds.has(errorId)
          const isMissed = errorId && !identifiedErrors.has(errorId) && !isExcluded

          let borderClass = ''
          let clickHandler
          if (isExcluded) borderClass = 'border-l-gray-300 bg-gray-100/40'
          else if (fpOverride === 'promote-false-positive') borderClass = 'border-l-green-500 bg-green-50/40'
          else if (annOverride === 'mark-missed') borderClass = 'border-l-red-500 bg-red-50/40'
          else if (isIdentified && !wrongCategory) borderClass = 'border-l-green-500 bg-green-50/40'
          else if (wrongCategory) borderClass = 'border-l-amber-500 bg-amber-50/40'
          else if (isFalsePositive && !isDismissedFP) {
            borderClass = 'border-l-yellow-500 bg-yellow-50/40'
            clickHandler = () => handleToggleFP(ann.id)
          } else if (isFalsePositive && isDismissedFP) {
            borderClass = 'border-l-gray-300 bg-gray-100/40'
            clickHandler = () => handleToggleFP(ann.id)
          } else if (isMissed) borderClass = 'border-l-red-500 bg-red-50/40'

          return (
            <div
              key={idx}
              className={`border-l-2 px-3 py-1.5 ${borderClass || 'border-l-transparent'} ${clickHandler ? 'cursor-pointer' : ''}`}
              onClick={clickHandler}
            >
              <span className="text-[10px] text-gray-300 font-mono mr-2 select-none">{paraNum}</span>
              <span className="leading-relaxed text-gray-900">{para}</span>
              {isDismissedFP && (
                <span className="ml-2 text-[10px]" style={{ color: 'var(--glass-secondary)' }}>(dismissed — click to reinstate)</span>
              )}
              {isFalsePositive && !isDismissedFP && (
                <span className="ml-2 text-[10px]" style={{ color: fpOverride === 'promote-false-positive' ? 'var(--glass-success)' : 'var(--glass-warning)' }}>
                  {fpOverride === 'promote-false-positive' ? '(accepted as valid issue)' : '(click to dismiss)'}
                </span>
              )}
              {isExcluded && (
                <span className="ml-2 text-[10px]" style={{ color: 'var(--glass-secondary)' }}>(excluded from score)</span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const categoryBreakdown = ERROR_CATEGORIES.map(cat => {
    const planted = scenario.plantedErrors.filter(e => e.category === cat.id)
    if (planted.length === 0) return { ...cat, status: 'not-present' }
    const scored = planted.filter(e => !excludedErrorIds.has(getErrorId(e)))
    if (scored.length === 0) return { ...cat, status: 'not-present' }
    const identified = scored.filter(e => identifiedErrors.has(getErrorId(e))).length
    if (identified === scored.length) return { ...cat, status: 'identified' }
    if (identified === 0) return { ...cat, status: 'missed' }
    return { ...cat, status: 'partial', identified, total: scored.length }
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="glass-panel p-4">
        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--glass-accent)' }}>Analysis Report</h2>
        <p className="text-sm" style={{ color: 'var(--glass-primary)' }}>
          Your review identified <strong>{scoreTotals.identified}</strong> of{' '}
          <strong>{scoreTotals.denominator}</strong> scored issues.
          {activeFPs.length > 0 && (
            <> {activeFPs.length} passage(s) were flagged that did not correspond to planted errors.</>
          )}
          {dismissedFP.size > 0 && (
            <> <span style={{ color: 'var(--glass-secondary)' }}>({dismissedFP.size} dismissed)</span></>
          )}
        </p>
        {overrideCount > 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--glass-warning)' }}>
            {overrideCount} manual override{overrideCount !== 1 ? 's' : ''} applied
            {overrideDetails.length > 0 && ` (${overrideDetails.join(', ')})`}
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
          <span><span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{ background: 'rgba(234,179,8,0.2)' }} /> Not a planted error</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium" style={{ color: 'var(--glass-primary)' }}>Error Analysis</h3>
        {scenario.plantedErrors.map((error, idx) => {
          const errorId = getErrorId(error)
          return (
            <ErrorPanel
              key={errorId}
              error={error}
              errorId={errorId}
              idx={idx}
              scenario={scenario}
              paragraphs={paragraphs}
              overrideAction={overrides[errorId] || null}
              isIdentified={identifiedErrors.has(errorId)}
              autoMatch={autoMatch}
              onOverride={handleOverride}
            />
          )
        })}
      </div>

      {falsePositives.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium" style={{ color: 'var(--glass-primary)' }}>Flagged Non-Planted Passages</h3>
          {falsePositives.map((ann, idx) => (
            <FalsePositivePanel
              key={ann.id}
              annotation={ann}
              idx={idx}
              paragraphText={paragraphs[ann.paragraphNumber - 1] || ''}
              isDismissed={dismissedFP.has(ann.id)}
              overrideAction={overrides[`fp:${ann.id}`] || null}
              onToggleDismiss={handleToggleFP}
              onOverride={handleOverride}
            />
          ))}
        </div>
      )}

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
          <button onClick={() => onBackToDashboard(savedAnnotations, overrides, new Set(identifiedErrors))} className="btn-secondary">Save &amp; Return</button>
        )}
      </div>
    </div>
  )
}

function ErrorPanel({ error, errorId, idx, scenario, isIdentified, overrideAction, autoMatch, onOverride, paragraphs }) {
  const [conversation, setConversation] = useState([])
  const [loading, setLoading] = useState(false)
  const [followUpError, setFollowUpError] = useState(null)
  const userAnn = autoMatch.matchedAnnotations.find(a => a.matchedErrorId === errorId)
  const wrongCategory = userAnn && userAnn.category !== error.category && overrideAction !== 'accept-category'
  const paragraphText = paragraphs?.[error.paragraphNumber - 1] || ''

  const effectiveIdentified = overrideAction === 'mark-identified'
    || overrideAction === 'accept-category'
    ? true
    : overrideAction === 'mark-missed'
      || overrideAction === 'exclude-error'
      ? false
      : isIdentified

  const toggleOverride = () => {
    if (!overrideAction) {
      const action = isIdentified ? 'missed' : 'identified'
      onOverride(errorId, `mark-${action}`)
    } else if (overrideAction === 'mark-identified') {
      onOverride(errorId, 'mark-missed')
    } else {
      onOverride(errorId, 'clear')
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

  const isOverruled = !!overrideAction
  const isExcluded = overrideAction === 'exclude-error'

  const panelBorder = isOverruled
    ? (isExcluded ? 'border-l-gray-400' : effectiveIdentified ? 'border-l-green-500' : 'border-l-red-500')
    : (effectiveIdentified
        ? (wrongCategory ? 'border-l-amber-500' : 'border-l-green-500')
        : 'border-l-red-500')

  return (
    <div className={`glass-panel p-5 border-l-4 ${panelBorder}`}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="tag-green text-xs">Error {idx + 1}</span>
        <span className="text-sm font-medium" style={{ color: 'var(--glass-accent)' }}>
          {ERROR_CATEGORY_MAP[error.category]?.label || error.category}
        </span>
        {effectiveIdentified && <span className="tag-green">Identified</span>}
        {!effectiveIdentified && !wrongCategory && <span className="tag-red">Missed</span>}
        {wrongCategory && !isOverruled && <span className="tag-amber">Wrong category</span>}
        {overrideAction === 'accept-category' && <span className="tag-green">Category accepted</span>}
        {isExcluded && <span className="tag-gray">Excluded from score</span>}
        {isOverruled && <span className={'tag-amber'}>Overruled</span>}
      </div>

      <div className="document-viewer rounded p-3 mb-3 text-sm document-text leading-relaxed whitespace-pre-wrap" style={{ background: '#fff' }}>
        <span className="tag-gray text-[10px] mb-1 inline-block" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>Paragraph {error.paragraphNumber || '?'}</span>
        <span style={{ color: '#374151' }}>{paragraphText ? `"${paragraphText.slice(0, 300)}${paragraphText.length > 300 ? '...' : ''}"` : '(paragraph not found)'}</span>
      </div>

      <div className="text-sm leading-relaxed mb-3" style={{ color: 'var(--glass-primary)' }}>{error.explanation}</div>

      {overrideAction && (
        <div className="text-xs rounded p-2 mb-2" style={{ color: 'var(--glass-warning)', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <strong>Manual scoring override:</strong>{' '}
          {overrideAction === 'mark-identified' && 'This issue is being scored as identified even though it was not automatically matched.'}
          {overrideAction === 'mark-missed' && 'This issue is being scored as missed even though it was automatically matched.'}
          {overrideAction === 'accept-category' && `The user's selected category (${ERROR_CATEGORY_MAP[userAnn?.category]?.label || userAnn?.category}) is being accepted for scoring and feedback.`}
          {overrideAction === 'exclude-error' && 'This planted issue is being treated as not a real error and is excluded from the score denominator.'}
        </div>
      )}

      {error.correctLaw && (
        <div className="text-xs rounded p-2 mb-2" style={{ color: 'var(--glass-accent)', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
          <strong>Correct law:</strong> {error.correctLaw}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <ReportButton scenarioId={scenario.id} errorId={errorId} />
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
        {userAnn?.wrongCategory && (
          <button
            onClick={() => onOverride(errorId, overrideAction === 'accept-category' ? 'clear' : 'accept-category')}
            className="text-[10px] rounded px-1.5 py-0.5 transition-colors"
            style={{
              color: 'var(--glass-success)',
              border: '1px solid rgba(110,231,183,0.3)',
              background: 'transparent',
            }}
          >
            {overrideAction === 'accept-category' ? 'Category Accepted' : 'Accept My Category'}
          </button>
        )}
        <button
          onClick={() => onOverride(errorId, isExcluded ? 'clear' : 'exclude-error')}
          className="text-[10px] rounded px-1.5 py-0.5 transition-colors"
          style={{
            color: 'var(--glass-secondary)',
            border: '1px solid rgba(148,163,184,0.35)',
            background: 'transparent',
          }}
        >
          {isExcluded ? 'Restore Scored Error' : 'Not a Real Error'}
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

function FalsePositivePanel({ annotation, idx, paragraphText, isDismissed, overrideAction, onToggleDismiss, onOverride }) {
  const overrideKey = `fp:${annotation.id}`
  const isPromoted = overrideAction === 'promote-false-positive'
  const categoryLabel = ERROR_CATEGORY_MAP[annotation.category]?.label || annotation.category

  return (
    <div className={`glass-panel p-4 border-l-4 ${isPromoted ? 'border-l-green-500' : isDismissed ? 'border-l-gray-300' : 'border-l-yellow-500'}`}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={isPromoted ? 'tag-green' : isDismissed ? 'tag-gray' : 'tag-amber'}>Flag {idx + 1}</span>
        <span className="text-sm font-medium" style={{ color: 'var(--glass-accent)' }}>{categoryLabel}</span>
        {isPromoted && <span className="tag-green">Accepted as valid issue</span>}
        {isDismissed && !isPromoted && <span className="tag-gray">Dismissed</span>}
      </div>
      <div className="document-viewer rounded p-3 mb-3 text-sm document-text leading-relaxed whitespace-pre-wrap" style={{ background: '#fff' }}>
        <span className="tag-gray text-[10px] mb-1 inline-block" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>Paragraph {annotation.paragraphNumber}</span>
        <span style={{ color: '#374151' }}>{paragraphText ? `"${paragraphText.slice(0, 300)}${paragraphText.length > 300 ? '...' : ''}"` : '(paragraph not found)'}</span>
      </div>
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--glass-primary)' }}>{annotation.explanation}</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onOverride(overrideKey, isPromoted ? 'clear' : 'promote-false-positive')}
          className="text-[10px] rounded px-1.5 py-0.5 transition-colors"
          style={{
            color: 'var(--glass-success)',
            border: '1px solid rgba(110,231,183,0.3)',
            background: 'transparent',
          }}
        >
          {isPromoted ? 'Accepted as Valid' : 'Count as Valid Issue'}
        </button>
        {!isPromoted && (
          <button
            onClick={() => onToggleDismiss(annotation.id)}
            className="text-[10px] rounded px-1.5 py-0.5 transition-colors"
            style={{
              color: 'var(--glass-secondary)',
              border: '1px solid rgba(148,163,184,0.35)',
              background: 'transparent',
            }}
          >
            {isDismissed ? 'Reinstate False Positive' : 'Dismiss False Positive'}
          </button>
        )}
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
