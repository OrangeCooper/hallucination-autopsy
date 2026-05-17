import { TUTORIAL_SCENARIO } from '../data/tutorialScenario'

export default function TutorialBanner({ currentScreen, onExit }) {
  const steps = TUTORIAL_SCENARIO.tutorialSteps
  const currentStep = steps.find(s => s.screen === currentScreen) || steps[0]
  const stepIndex = currentStep ? currentStep.step - 1 : 0

  return (
    <div className="bg-navy-500 text-white text-xs">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium">Guided Tour</span>
          <span className="text-navy-200">|</span>
          <span>
            Step {currentStep?.step || 1} of {steps.length}
            <span className="text-navy-200 ml-2">&mdash; {currentStep?.title || ''}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {steps.map((s, i) => (
              <div
                key={s.step}
                className={`w-1.5 h-1.5 rounded-full ${
                  i <= stepIndex ? 'bg-white' : 'bg-navy-300'
                }`}
              />
            ))}
          </div>
          <button onClick={onExit} className="text-navy-200 hover:text-white underline transition-colors">
            Exit Tour
          </button>
        </div>
      </div>
    </div>
  )
}
