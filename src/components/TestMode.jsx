import { useState, useMemo, useCallback } from 'react'
import { ERROR_CATEGORIES } from '../data/errorCategories'
import { generateScenario } from '../utils/api'
import ScenarioLoadingScreen, { ScenarioErrorScreen } from './ScenarioLoadingScreen'
import TutorialCallout from './TutorialCallout'

const PRACTICE_AREAS = [
  'Constitutional', 'Corporate', 'Securities', 'Employment',
  'Arbitration', 'Criminal', 'Administrative', 'International',
  'IP', 'Tax', 'Competition', 'Privacy',
]

const DOCUMENT_TYPES = [
  'Litigation memo', 'Client advisory', 'Contract clause', 'Compliance checklist',
  'Arbitration brief', 'Motion draft', 'Opinion letter', 'Research memo',
]

const DIFFICULTIES = ['Standard', 'Complex', 'Multi-jurisdictional', 'Adversarial']

const JURISDICTIONS = [
  'US Federal', 'New York (US)', 'California (US)', 'Delaware (US)',
  '7th Circuit (US)', 'England & Wales', 'European Union',
  'India (Supreme Court)', 'Singapore', 'Turkey', 'International (ICC)',
  'Multi-jurisdictional',
]

export default function TestMode({ profile, onStartScenario, isTutorial, onViewSkillProfile }) {
  const [practiceArea, setPracticeArea] = useState('')
  const [difficulty, setDifficulty] = useState('Standard')
  const [jurisdiction, setJurisdiction] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedScenario, setGeneratedScenario] = useState(null)
  const [error, setError] = useState(null)

  const weaknessCategories = useMemo(() => {
    if (!profile || profile.sessionsCompleted === 0) return []
    const entries = Object.entries(profile.categories || {})
      .filter(([, v]) => v.encountered > 0)
      .sort((a, b) => (a[1].identified / a[1].encountered) - (b[1].identified / b[1].encountered))
    return entries.slice(0, 3).map(([id]) => id)
  }, [profile])

  const handleGenerate = useCallback(async () => {
    setGenerating(true); setError(null); setGeneratedScenario(null)

    const catPool = weaknessCategories.length > 0 ? weaknessCategories : ERROR_CATEGORIES.map(c => c.id)
    const shuffled = [...catPool].sort(() => Math.random() - 0.5)
    const selectedCats = shuffled.slice(0, Math.min(3, 2 + Math.floor(Math.random() * 2)))

    const areas = PRACTICE_AREAS
    const types = DOCUMENT_TYPES
    const config = {
      practiceArea: practiceArea || areas[Math.floor(Math.random() * areas.length)],
      documentType: types[Math.floor(Math.random() * types.length)],
      difficulty,
      jurisdiction: jurisdiction || JURISDICTIONS[Math.floor(Math.random() * JURISDICTIONS.length)],
      errorCategories: selectedCats,
    }

    try {
      const parsed = await generateScenario(config)
      const scenario = {
        id: `test-${Date.now()}`,
        title: parsed.title || `Test: ${parsed.practiceArea || config.practiceArea}`,
        documentType: parsed.documentType || config.documentType,
        practiceArea: parsed.practiceArea || config.practiceArea,
        jurisdiction: parsed.jurisdiction || 'General',
        complexity: difficulty,
        aiTaskDescription: parsed.aiTaskDescription || `The AI was asked to draft a ${config.documentType} addressing ${config.practiceArea} law under ${config.jurisdiction}.`,
        assumedRole: parsed.assumedRole || `You are reviewing an AI-generated ${config.documentType} under test conditions.`,
        professionalStakes: parsed.professionalStakes || 'Test evaluation. Results update your skill profile.',
        document: parsed.document,
        plantedErrors: parsed.errors,
        isGenerated: true,
      }
      setGeneratedScenario(scenario)
    } catch (err) {
      setError(err.message || 'Generation failed. Try again.')
    } finally { setGenerating(false) }
  }, [practiceArea, difficulty, jurisdiction, weaknessCategories])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {isTutorial && (
        <div className="mb-6">
          <TutorialCallout instruction="Test Mode generates scenarios weighted toward your weak categories. It adapts to your skill profile and tracks results across sessions. The form below lets you configure area of law, jurisdiction, and difficulty before generating an adaptive test." />
        </div>
      )}

      <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--glass-primary)' }}>TEST Mode</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--glass-secondary)' }}>
        Simulation-based evaluation. Error types are selected adaptively based on your weak categories.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-panel p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Generate Test</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Area of Law</label>
                <select value={practiceArea} onChange={e => { setPracticeArea(e.target.value); setGeneratedScenario(null) }}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white glass-select">
                  <option value="">Random</option>
                  {PRACTICE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Jurisdiction</label>
                <select value={jurisdiction} onChange={e => { setJurisdiction(e.target.value); setGeneratedScenario(null) }}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white glass-select">
                  <option value="">Random</option>
                  {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Difficulty</label>
                <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setGeneratedScenario(null) }}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white glass-select">
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {weaknessCategories.length > 0 && (
              <div className="mb-3 p-2 rounded text-xs" style={{background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: 'var(--glass-warning)'}}>
                <strong>Adaptive focus:</strong> generating errors weighted toward your weak areas
                <div className="flex flex-wrap gap-1 mt-1">
                  {weaknessCategories.map(c => (
                    <span key={c} className="text-[10px] rounded px-1 py-0.5" style={{background: 'rgba(251,191,36,0.15)', color: 'var(--glass-warning)'}}>{c.replace(/-/g, ' ')}</span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleGenerate} disabled={generating || isTutorial} className="btn-primary text-sm w-full mb-3">
              {isTutorial ? 'Generation disabled in tour mode' : 'Generate Adaptive Test'}
            </button>

            {generatedScenario && (
              <div className="p-3 glass-panel">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">{generatedScenario.title}</div>
                  <span className="tag-gray text-xs">{generatedScenario.complexity}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {generatedScenario.practiceArea} &middot; {generatedScenario.documentType} &middot; {generatedScenario.jurisdiction}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {generatedScenario.plantedErrors.map((e, i) => (
                    <span key={i} className="text-[10px] rounded px-1.5 py-0.5" style={{background: 'rgba(251,191,36,0.1)', color: 'var(--glass-warning)', border: '1px solid rgba(251,191,36,0.2)'}}>
                      {e.category.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
                <button onClick={() => onStartScenario(generatedScenario, 'generated')} className="btn-primary text-xs !px-3 !py-1.5">Begin Test</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="glass-panel p-4 space-y-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Test Environment</h3>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-3">
              <li>Adaptive error selection</li>
              <li>Weighted toward weak categories</li>
              <li>Unpredictable hallucination patterns</li>
              <li>Realistic simulation</li>
              <li>Overrule available on all annotations</li>
            </ul>
            {profile?.sessionsCompleted > 0 && (
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                {profile.sessionsCompleted} sessions &middot; {profile.totalIdentified}/{profile.totalEncountered} identified
              </div>
            )}
          </div>
        </div>
      </div>

      {isTutorial && (
        <div className="text-center mt-6">
          <button onClick={onViewSkillProfile} className="btn-primary">View Skill Profile</button>
        </div>
      )}

      {generating && (
        <ScenarioLoadingScreen onRetry={handleGenerate} />
      )}

      {error && !generating && (
        <ScenarioErrorScreen message={error} onRetry={handleGenerate} onBack={() => setError(null)} />
      )}
    </div>
  )
}
