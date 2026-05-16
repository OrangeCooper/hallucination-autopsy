import { useState, useMemo, useEffect } from 'react'
import { ERROR_CATEGORIES, ERROR_CATEGORY_MAP } from '../data/errorCategories'
import { useAnnotations } from '../hooks/useAnnotations'
import { splitIntoParagraphs } from '../utils/annotations'

export default function DocumentReview({ scenario, onSubmit }) {
  const { annotations, addAnnotation, removeAnnotation, updateAnnotation, clearAll } = useAnnotations()
  const [elapsed, setElapsed] = useState(0)
  const [activePanel, setActivePanel] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const formatTime = sec => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0')
    const s = String(sec % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const paragraphs = useMemo(() => splitIntoParagraphs(scenario.document), [scenario.document])

  const annotationByParagraph = useMemo(() => {
    const map = {}
    annotations.forEach(a => { map[a.paragraphIndex] = a })
    return map
  }, [annotations])

  const flagNumberByParagraph = useMemo(() => {
    const map = {}
    const sorted = [...annotations].sort((a, b) => a.paragraphIndex - b.paragraphIndex)
    sorted.forEach((a, i) => { map[a.paragraphIndex] = i + 1 })
    return map
  }, [annotations])

  const handleParagraphClick = (index) => {
    const existing = annotationByParagraph[index]
    if (existing) {
      setActivePanel({
        index,
        isEdit: true,
        annotationId: existing.id,
        category: existing.category,
        explanation: existing.explanation,
      })
    } else {
      setActivePanel({
        index,
        isEdit: false,
        annotationId: null,
        category: '',
        explanation: '',
      })
    }
  }

  const handleFlag = () => {
    if (!activePanel) return
    if (!activePanel.category || activePanel.explanation.trim().length < 30) return

    if (activePanel.isEdit) {
      updateAnnotation(activePanel.annotationId, {
        category: activePanel.category,
        explanation: activePanel.explanation,
      })
    } else {
      addAnnotation(
        activePanel.index,
        activePanel.index + 1,
        activePanel.category,
        activePanel.explanation,
      )
    }
    setActivePanel(null)
  }

  const handleRemoveStart = (id) => setRemovingId(id)
  const handleRemoveConfirm = () => {
    if (!removingId) return
    removeAnnotation(removingId)
    if (activePanel?.annotationId === removingId) setActivePanel(null)
    setRemovingId(null)
  }
  const handleRemoveCancel = () => setRemovingId(null)

  const handleCancel = () => setActivePanel(null)

  const confirmSubmit = () => {
    setShowConfirm(false)
    onSubmit(annotations)
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 no-print">
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">{scenario.documentType}</span>
          <span className="mx-2">&middot;</span><span>{scenario.practiceArea}</span>
          <span className="mx-2">&middot;</span><span className="tag-gray">{scenario.jurisdiction}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 tabular-nums">{formatTime(elapsed)}</span>
          {annotations.length > 0 && (
            <button onClick={() => setShowClearConfirm(true)} className="text-xs text-gray-400 underline hover:text-gray-600">Clear all</button>
          )}
          <button onClick={() => setShowConfirm(true)} className="btn-primary text-xs !px-3 !py-1.5">Submit Review for Analysis</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white shadow-sm border border-gray-200 p-8 max-w-3xl mx-auto rounded-sm">
            <h2 className="text-base font-bold text-center mb-4 text-navy-600">{scenario.title}</h2>
            <div className="document-text text-gray-900 leading-relaxed">
              {paragraphs.map((para, idx) => {
                const ann = annotationByParagraph[idx]
                const isFlagged = !!ann
                const isActive = activePanel?.index === idx
                const flagNum = flagNumberByParagraph[idx]

                return (
                  <div key={idx} className="mb-1">
                    <div className="flex">
                      <div className="w-8 flex-shrink-0 pt-[1px] text-right pr-2 select-none">
                        <span className="text-[10px] text-gray-300 font-mono">{idx + 1}</span>
                        {isFlagged && (
                          <span className="ml-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 text-[8px] font-bold text-white align-middle">
                            F{flagNum}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          onClick={() => handleParagraphClick(idx)}
                          className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                            isFlagged || isActive
                              ? 'border-l-2 border-amber-400 bg-amber-50/50'
                              : 'border-l-2 border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <span className="whitespace-pre-wrap">{para}</span>
                        </div>

                        {isActive && (
                          <div className="ml-1 mt-1 mb-2 p-3 bg-white border border-gray-200 rounded shadow-sm">
                            <p className="text-xs text-gray-400 mb-2">
                              Flagging paragraph <strong className="text-gray-600">{activePanel.index + 1}</strong>
                              {activePanel.isEdit && ' (edit mode)'}
                            </p>

                            <div className="space-y-2 mb-3">
                              <label className="text-xs font-medium text-gray-600 block">Error category</label>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                {ERROR_CATEGORIES.map(cat => (
                                  <label key={cat.id} className="flex items-start gap-1.5 text-xs cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`flag-cat-${idx}`}
                                      checked={activePanel.category === cat.id}
                                      onChange={() => setActivePanel(p => ({ ...p, category: cat.id }))}
                                      className="mt-0.5"
                                    />
                                    <span className="text-gray-700 leading-tight">{cat.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="text-xs font-medium text-gray-600 block mb-1">
                                Briefly identify what appears incorrect in this paragraph.
                              </label>
                              <textarea
                                value={activePanel.explanation}
                                onChange={e => {
                                  if (e.target.value.length <= 300) {
                                    setActivePanel(p => ({ ...p, explanation: e.target.value }))
                                  }
                                }}
                                placeholder="e.g. The cited statute section does not govern this type of dispute."
                                className="w-full text-xs border border-gray-200 rounded p-2 resize-none h-16"
                              />
                              <div className="flex justify-between mt-1">
                                {activePanel.explanation.trim().length < 30 ? (
                                  <span className="text-[10px] text-gray-400">
                                    {30 - activePanel.explanation.trim().length} more characters needed
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-green-600">Minimum met</span>
                                )}
                                <span className="text-[10px] text-gray-400">{300 - activePanel.explanation.length} characters remaining</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleFlag}
                                disabled={!activePanel.category || activePanel.explanation.trim().length < 30}
                                className="btn-primary text-xs !px-3 !py-1.5"
                              >
                                {activePanel.isEdit ? 'Update Flag' : 'Flag This Paragraph'}
                              </button>
                              {activePanel.isEdit && (
                                <button onClick={() => { setRemovingId(activePanel.annotationId); setActivePanel(null) }} className="text-xs text-red-500 underline hover:text-red-700">
                                  Remove flag
                                </button>
                              )}
                              <button onClick={handleCancel} className="text-xs text-gray-400 underline hover:text-gray-600 ml-auto">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Annotations ({annotations.length})
            </h3>
            {annotations.length === 0 ? (
              <p className="text-sm text-gray-400 leading-relaxed">
                Click a paragraph in the document to begin.
              </p>
            ) : (
              <div className="space-y-2">
                {[...annotations]
                  .sort((a, b) => a.paragraphIndex - b.paragraphIndex)
                  .map((ann, i) => (
                    <div key={ann.id} className="p-2.5 bg-gray-50 rounded border border-gray-200 text-xs">
                      <div className="flex items-start justify-between">
                        <span className="font-medium text-gray-700">
                          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 text-[8px] font-bold text-white mr-1">
                            F{i + 1}
                          </span>
                          Para {ann.paragraphNumber} &middot; {ERROR_CATEGORY_MAP[ann.category]?.label || ann.category}
                        </span>
                      </div>
                      <p className="text-gray-500 mt-1 leading-relaxed">
                        {ann.explanation.length > 80 ? ann.explanation.slice(0, 80) + '...' : ann.explanation}
                      </p>
                      <div className="flex gap-2 mt-1.5">
                        <button
                          onClick={() => {
                            setActivePanel({
                              index: ann.paragraphIndex,
                              isEdit: true,
                              annotationId: ann.id,
                              category: ann.category,
                              explanation: ann.explanation,
                            })
                          }}
                          className="text-gray-400 hover:text-navy-500 underline"
                        >
                          Edit
                        </button>
                        {removingId === ann.id ? (
                          <span className="text-gray-500">
                            Remove?{' '}
                            <button onClick={handleRemoveConfirm} className="text-red-500 underline hover:text-red-700">Remove</button>
                            {' / '}
                            <button onClick={handleRemoveCancel} className="text-gray-400 underline hover:text-gray-600">Keep</button>
                          </span>
                        ) : (
                          <button onClick={() => handleRemoveStart(ann.id)} className="text-gray-400 hover:text-red-500 underline">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
            <div className="mt-4 text-xs text-gray-400">
              Submitted with {annotations.length} flagged paragraph{annotations.length !== 1 ? 's' : ''}.
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-5 w-80">
            <p className="text-sm text-gray-700">
              You have flagged <strong>{annotations.length}</strong> paragraph{annotations.length !== 1 ? 's' : ''}.
              Once submitted, annotations cannot be changed.
            </p>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary text-xs !px-3 !py-1.5">Cancel</button>
              <button onClick={confirmSubmit} className="btn-primary text-xs !px-3 !py-1.5">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-5 w-80">
            <p className="text-sm text-gray-700">
              Clear all {annotations.length} flag{annotations.length !== 1 ? 's' : ''}? Cannot be undone.
            </p>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowClearConfirm(false)} className="btn-secondary text-xs !px-3 !py-1.5">Cancel</button>
              <button onClick={() => { clearAll(); setShowClearConfirm(false) }} className="btn-danger text-xs !px-3 !py-1.5">Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
