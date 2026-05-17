import { useState, useEffect } from 'react'

const STEPS = [
  { label: 'Drafting synthetic legal document...', key: 'drafting' },
  { label: 'Identifying error placement locations...', key: 'identifying' },
  { label: 'Constructing ground truth annotation set...', key: 'constructing' },
  { label: 'Validating JSON schema...', key: 'validating' },
  { label: 'Preparing case briefing...', key: 'preparing' },
]

export default function ScenarioLoadingScreen({ onRetry }) {
  const [visibleSteps, setVisibleSteps] = useState(0)

  useEffect(() => {
    if (visibleSteps < STEPS.length) {
      const timer = setTimeout(() => setVisibleSteps(v => v + 1), 2000)
      return () => clearTimeout(timer)
    }
  }, [visibleSteps])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
      <div className="max-w-md w-full px-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--glass-accent)', color: '#0a0f1e' }}>HA</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--glass-accent)' }}>Hallucination Autopsy</span>
        </div>
        <h2 className="text-base font-medium mb-5" style={{ color: 'var(--glass-primary)' }}>Generating Training Scenario</h2>
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const isVisible = i < visibleSteps
            const isActive = i === visibleSteps - 1 && visibleSteps <= STEPS.length
            const isCompleted = i < visibleSteps - 1 || (i === STEPS.length - 1 && visibleSteps === STEPS.length)

            if (!isVisible) return null

            return (
              <div key={step.key} className="status-step flex items-center gap-3">
                <span className={`status-step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} />
                <span className="text-sm" style={{ color: isActive ? 'var(--glass-primary)' : isCompleted ? 'var(--glass-secondary)' : 'var(--glass-muted)', fontWeight: isActive ? 500 : undefined }}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
        <p className="mt-8 text-xs italic" style={{ color: 'var(--glass-muted)' }}>
          Complex documents may take up to 20 seconds to generate.
        </p>
      </div>
    </div>
  )
}

export function ScenarioErrorScreen({ message, onRetry, onBack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
      <div className="max-w-md w-full px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--glass-accent)', color: '#0a0f1e' }}>HA</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--glass-accent)' }}>Hallucination Autopsy</span>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(248,113,113,0.15)' }}>
          <span className="text-red-500 text-xl">&times;</span>
        </div>
        <h2 className="text-base font-medium mb-2" style={{ color: 'var(--glass-primary)' }}>Document generation failed</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--glass-secondary)' }}>
          {message || 'The AI was unable to generate a valid scenario. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onRetry} className="btn-primary text-sm !px-4 !py-2">Try Again</button>
          <button onClick={onBack} className="btn-secondary text-sm !px-4 !py-2">Back</button>
        </div>
      </div>
    </div>
  )
}
