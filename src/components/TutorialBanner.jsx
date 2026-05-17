import { TUTORIAL_SCENARIO } from '../data/tutorialScenario'

export default function TutorialBanner({ currentScreen, onExit }) {
  const steps = TUTORIAL_SCENARIO.tutorialSteps
  const currentStep = steps.find(s => s.screen === currentScreen) || steps[0]
  const stepIndex = currentStep ? currentStep.step - 1 : 0

  return (
    <div className="tutorial-banner">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium step-title">Guided Tour</span>
          <span className="step-counter">|</span>
          <span className="step-counter">
            Step {currentStep?.step || 1} of {steps.length}
            <span className="ml-2" style={{ color: 'var(--glass-primary)', fontWeight: 500 }}>&mdash; {currentStep?.title || ''}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {steps.map((s, i) => (
              <div
                key={s.step}
                className={`step-dot ${i <= stepIndex ? 'active' : ''}`}
              />
            ))}
          </div>
          <button onClick={onExit} className="exit-link text-xs underline hover:no-underline transition-colors">
            Exit Tour
          </button>
        </div>
      </div>
    </div>
  )
}
