import { useState, useMemo } from 'react'
import { SCENARIOS, COMPLEXITY_LEVELS } from '../data/scenarios'
import SkillRadarChart from './RadarChart'
import { isIntroDismissed, dismissIntro } from '../utils/storage'

export default function Dashboard({ profile, sessions, onStartReview, onOpenAbout, onViewSkillProfile }) {
  const [showIntro, setShowIntro] = useState(!isIntroDismissed())
  const [selectedId, setSelectedId] = useState('')
  const [complexity, setComplexity] = useState('Standard')

  const handleDismissIntro = () => {
    setShowIntro(false)
    dismissIntro()
  }

  const completedIds = useMemo(() => {
    return new Set(sessions.map(s => s.scenarioId))
  }, [sessions])

  const selectedScenario = SCENARIOS.find(s => s.id === selectedId)

  const recentSessions = sessions.slice(0, 5)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {showIntro && (
        <div className="mb-6 card p-4 border-l-4 border-l-navy-500">
          <p className="text-sm text-gray-600 leading-relaxed">
            Hallucination Autopsy is a professional training platform that builds your ability to detect
            errors in AI-generated legal documents. Review realistic synthetic documents, identify planted
            mistakes, and receive structured analytical feedback on your performance.
          </p>
          <button
            onClick={handleDismissIntro}
            className="mt-3 btn-primary text-xs !px-3 !py-1.5"
          >
            Got it
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-navy-500">Hallucination Autopsy</h1>
            <p className="text-sm text-gray-500 mt-0.5">AI Output Forensics Training Platform</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Complexity Level
            </label>
            <div className="flex gap-2">
              {COMPLEXITY_LEVELS.map(cl => (
                <button
                  key={cl.id}
                  onClick={() => setComplexity(cl.id)}
                  className={`px-4 py-2 rounded text-xs font-medium border transition-colors ${
                    complexity === cl.id
                      ? 'bg-navy-500 text-white border-navy-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block">{cl.label}</span>
                  <span className={`block mt-0.5 ${complexity === cl.id ? 'text-navy-200' : 'text-gray-400'}`}>
                    {cl.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Select a Scenario
            </label>
            <div className="space-y-2">
              {SCENARIOS.map(s => {
                const isCompleted = completedIds.has(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-left card p-3 transition-colors ${
                      selectedId === s.id
                        ? 'ring-2 ring-navy-300 border-navy-300'
                        : 'hover:border-gray-300'
                    } ${isCompleted ? 'opacity-80' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {s.title}
                          </span>
                          {isCompleted && (
                            <span className="tag-green">Completed</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="tag-gray">{s.documentType}</span>
                          <span className="tag-gray">{s.practiceArea}</span>
                          <span className="tag-gray">{s.jurisdiction}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => onStartReview(selectedId, complexity)}
            disabled={!selectedId}
            className="btn-primary w-full"
          >
            Begin Document Review
          </button>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="card p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Skill Profile
            </h3>
            <SkillRadarChart profile={profile} compact />
            {profile && profile.sessionsCompleted > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                {profile.sessionsCompleted} session{profile.sessionsCompleted !== 1 ? 's' : ''} completed &middot;{' '}
                {profile.totalIdentified}/{profile.totalEncountered} errors identified
              </div>
            )}
            {profile && profile.sessionsCompleted > 0 && (
              <button
                onClick={onViewSkillProfile}
                className="mt-2 text-xs text-navy-500 underline hover:text-navy-600"
              >
                View Full Skill Profile
              </button>
            )}
          </div>

          <div className="card p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Recent Sessions
            </h3>
            {recentSessions.length === 0 ? (
              <p className="text-sm text-gray-400">No sessions yet. Start a review to build your history.</p>
            ) : (
              <div className="space-y-2">
                {recentSessions.map((s, i) => (
                  <div key={i} className="text-xs text-gray-600 border-b border-gray-100 pb-1.5 last:border-0">
                    <span className="font-medium">{s.scenarioTitle}</span>
                    <span className="text-gray-400">
                      {' '}&middot;{' '}
                      {new Date(s.date).toLocaleDateString()} &middot;{' '}
                      {s.identified}/{s.totalErrors} identified
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={onOpenAbout}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          About &amp; Responsible AI Disclosure
        </button>
      </div>
    </div>
  )
}
