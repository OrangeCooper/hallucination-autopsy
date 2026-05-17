import { useState, useMemo, useCallback } from 'react'
import { ERROR_CATEGORIES } from '../data/errorCategories'
import { generateScenario } from '../utils/api'
import SkillRadarChart from './RadarChart'
import ScenarioLoadingScreen, { ScenarioErrorScreen } from './ScenarioLoadingScreen'
import TutorialCallout from './TutorialCallout'
import { isIntroDismissed, dismissIntro } from '../utils/storage'
import { TUTORIAL_SCENARIO } from '../data/tutorialScenario'

const PRACTICE_AREAS = [
  'Constitutional', 'Corporate', 'Securities', 'Employment',
  'Arbitration', 'Criminal', 'Administrative', 'International',
  'IP', 'Tax', 'Competition', 'Privacy', 'Random',
]

const DOCUMENT_TYPES = [
  'Litigation memo', 'Client advisory', 'Contract clause', 'Compliance checklist',
  'Arbitration brief', 'Motion draft', 'Opinion letter', 'Research memo', 'Random',
]

const DIFFICULTIES = ['Standard', 'Complex', 'Multi-jurisdictional', 'Adversarial']

const JURISDICTIONS = [
  'US Federal', 'New York (US)', 'California (US)', 'Delaware (US)',
  '7th Circuit (US)', 'England & Wales', 'European Union',
  'India (Supreme Court)', 'Singapore', 'Turkey', 'International (ICC)',
  'Multi-jurisdictional', 'Random',
]

export default function LearnMode({ profile, sessions, onStartScenario, onViewSkillProfile, isTutorial }) {
  const [showIntro, setShowIntro] = useState(!isIntroDismissed())
  const [selectedCategories, setSelectedCategories] = useState([])
  const [practiceArea, setPracticeArea] = useState('Random')
  const [documentType, setDocumentType] = useState('Random')
  const [difficulty, setDifficulty] = useState('Standard')
  const [jurisdiction, setJurisdiction] = useState('Random')
  const [generating, setGenerating] = useState(false)
  const [generatedScenario, setGeneratedScenario] = useState(null)
  const [error, setError] = useState(null)

  const handleDismissIntro = () => { setShowIntro(false); dismissIntro() }

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const recommendation = useMemo(() => {
    if (!profile || profile.sessionsCompleted === 0) return null
    const entries = Object.entries(profile.categories || {})
      .filter(([, v]) => v.encountered > 0)
      .sort((a, b) => (a[1].identified / a[1].encountered) - (b[1].identified / b[1].encountered))
    return entries.slice(0, 2).map(([id]) => ERROR_CATEGORIES.find(c => c.id === id)?.label)
  }, [profile])

  const handleGenerate = useCallback(async () => {
    setGenerating(true); setError(null); setGeneratedScenario(null)
    const areas = PRACTICE_AREAS.filter(a => a !== 'Random')
    const types = DOCUMENT_TYPES.filter(d => d !== 'Random')
    const jurs = JURISDICTIONS.filter(j => j !== 'Random')
    const config = {
      practiceArea: practiceArea === 'Random' ? areas[Math.floor(Math.random() * areas.length)] : practiceArea,
      documentType: documentType === 'Random' ? types[Math.floor(Math.random() * types.length)] : documentType,
      difficulty,
      jurisdiction: jurisdiction === 'Random' ? jurs[Math.floor(Math.random() * jurs.length)] : jurisdiction,
      errorCategories: selectedCategories.length > 0 ? selectedCategories : [],
    }
    try {
      const parsed = await generateScenario(config)
      const scenario = {
        id: `generated-${Date.now()}`,
        title: parsed.title || `${parsed.practiceArea || config.practiceArea} - ${parsed.documentType || config.documentType}`,
        documentType: parsed.documentType || config.documentType,
        practiceArea: parsed.practiceArea || config.practiceArea,
        jurisdiction: parsed.jurisdiction || config.jurisdiction || 'General',
        complexity: difficulty,
        aiTaskDescription: 'Generated training scenario.',
        assumedRole: 'You are reviewing an AI-generated legal document for accuracy.',
        professionalStakes: 'This is a training exercise.',
        document: parsed.document,
        plantedErrors: parsed.errors,
        isGenerated: true,
      }
      setGeneratedScenario(scenario)
    } catch (err) {
      setError(err.message || 'Generation failed. Try different settings.')
    } finally { setGenerating(false) }
  }, [practiceArea, documentType, difficulty, jurisdiction, selectedCategories])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {showIntro && (
        <div className="mb-6 card p-4 border-l-4 border-l-navy-500 bg-gradient-to-r from-navy-50 to-white">
          <p className="text-sm text-gray-600 leading-relaxed">
            Hallucination Autopsy builds your ability to detect errors in AI-generated legal documents.
            Configure a scenario below, generate it via AI, then review and annotate the document.
          </p>
          <button onClick={handleDismissIntro} className="mt-3 btn-primary text-xs !px-3 !py-1.5">Got it</button>
        </div>
      )}

      {isTutorial && (
        <div className="mb-6 card p-5 border-l-4 border-l-navy-500">
          <h3 className="text-sm font-medium text-navy-700 mb-1">Welcome to the Guided Tour</h3>
          <p className="text-xs text-gray-600 mb-3">
            This walkthrough guides you through the full Hallucination Autopsy workflow.
            You will review a pre-built legal memo with 4 planted errors covering different categories.
          </p>
          <button
            onClick={() => onStartScenario(TUTORIAL_SCENARIO, 'tutorial')}
            className="btn-primary text-xs !px-3 !py-1.5"
          >
            Begin Tour
          </button>
        </div>
      )}

      {!isTutorial && (
        <div className="mb-4">
          <button
            onClick={() => onStartScenario(TUTORIAL_SCENARIO, 'tutorial')}
            className="text-xs border border-navy-300 text-navy-600 rounded px-3 py-1.5 hover:bg-navy-50 transition-colors"
          >
            Take a Guided Tour
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Configure Scenario</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Practice Area</label>
                <select value={practiceArea} onChange={e => setPracticeArea(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white">
                  {PRACTICE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Document Type</label>
                <select value={documentType} onChange={e => setDocumentType(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white">
                  {DOCUMENT_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Jurisdiction</label>
                <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white">
                  {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white">
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Error Categories <span className="text-gray-400 normal-case">(blank = random)</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ERROR_CATEGORIES.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 text-xs cursor-pointer p-1.5 rounded hover:bg-gray-50">
                    <input type="checkbox" checked={selectedCategories.includes(cat.id)} onChange={() => toggleCategory(cat.id)} className="rounded" />
                    <span className="text-gray-700">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating} className="btn-primary text-sm w-full">
              Generate Training Scenario
            </button>
          </div>

          {generatedScenario && (
            <div className="card p-5 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Scenario Ready</h3>
              <div className="text-xs text-gray-600 space-y-1 mb-3">
                <p><strong>{generatedScenario.title}</strong></p>
                <p>{generatedScenario.practiceArea} &middot; {generatedScenario.documentType} &middot; {generatedScenario.jurisdiction}</p>
                <p>{generatedScenario.plantedErrors.length} error{generatedScenario.plantedErrors.length !== 1 ? 's' : ''} planted</p>
                <ul className="list-disc pl-4 text-gray-500 space-y-0.5 mt-1">
                  {generatedScenario.plantedErrors.map((e, i) => (
                    <li key={i}>{e.category.replace(/-/g, ' ')}</li>
                  ))}
                </ul>
              </div>
              <button onClick={() => onStartScenario(generatedScenario, 'learn')} className="btn-primary text-xs !px-3 !py-1.5">Begin Review</button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recommended Focus</h3>
            {recommendation ? (
              <div className="text-sm text-gray-700">
                <p className="mb-1">Based on your history:</p>
                <ul className="list-disc pl-4 text-xs text-gray-600 space-y-0.5">
                  {recommendation.map(r => <li key={r}>{r}</li>)}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Complete sessions to get recommendations.</p>
            )}
          </div>
          <div className="card p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Session Stats</h3>
            {profile?.sessionsCompleted > 0 ? (
              <div className="text-xs text-gray-600 space-y-1">
                <p>{profile.sessionsCompleted} sessions</p>
                <p>{profile.totalIdentified}/{profile.totalEncountered} errors identified</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No sessions yet.</p>
            )}
          </div>
          <div className="card p-4">
            <SkillRadarChart profile={profile} compact />
            {profile?.sessionsCompleted > 0 && (
              <button onClick={onViewSkillProfile} className="mt-2 text-xs text-navy-500 underline hover:text-navy-600">
                View Full Skill Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {generating && (
        <ScenarioLoadingScreen onRetry={handleGenerate} />
      )}

      {error && !generating && (
        <ScenarioErrorScreen message={error} onRetry={handleGenerate} onBack={() => setError(null)} />
      )}
    </div>
  )
}
