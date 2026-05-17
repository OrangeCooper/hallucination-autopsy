import { useState, useEffect } from 'react'
import { ERROR_CATEGORIES, ERROR_CATEGORY_MAP } from '../data/errorCategories'
import SkillRadarChart from './RadarChart'
import { generateSkillDevelopmentAdvice } from '../utils/api'
import { resetAllData } from '../utils/storage'
import TutorialCallout from './TutorialCallout'

export default function SkillProfile({ profile, sessions, onBack, isTutorial, onCompleteTour }) {
  const [advice, setAdvice] = useState(null)
  const [adviceLoading, setAdviceLoading] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    if (profile.sessionsCompleted === 0) {
      setAdviceLoading(false)
      return
    }

    let cancelled = false
    setAdviceLoading(true)
    generateSkillDevelopmentAdvice(profile)
      .then(text => { if (!cancelled) setAdvice(text) })
      .catch(() => { if (!cancelled) setAdvice(null) })
      .finally(() => { if (!cancelled) setAdviceLoading(false) })
    return () => { cancelled = true }
  }, [profile])

  const handleReset = () => {
    resetAllData()
    setShowResetConfirm(false)
    window.location.reload()
  }

  const getTrend = (categoryId) => {
    const relevant = sessions.filter(s => {
      return true
    }).slice(0, 3)

    if (relevant.length < 2) return 'stable'
    return 'stable'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-navy-500">Skill Profile</h1>
        {isTutorial ? (
          <button onClick={onCompleteTour} className="btn-primary text-xs !px-3 !py-1.5">
            Complete Tour
          </button>
        ) : (
          <button onClick={onBack} className="btn-secondary text-xs !px-3 !py-1.5">
            Back to Dashboard
          </button>
        )}
      </div>

      {isTutorial && (
        <div className="mb-6">
          <TutorialCallout instruction="In live mode, your detection rates across categories are tracked here after each session. This screen reflects your cumulative performance over time. Click Complete Tour to finish the walkthrough." />
        </div>
      )}

      {profile.sessionsCompleted === 0 && !isTutorial ? (
        <div className="glass-panel p-8 text-center">
          <p className="text-sm text-gray-400">
            No sessions completed yet. Complete a review session to see your skill profile.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Sessions Completed', value: profile.sessionsCompleted },
              { label: 'Errors Encountered', value: profile.totalEncountered },
              { label: 'Overall Detection Rate', value: profile.totalEncountered > 0 ? `${Math.round((profile.totalIdentified / profile.totalEncountered) * 100)}%` : 'N/A' },
            ].map(s => (
              <div key={s.label} className="glass-panel p-4 text-center">
                <div className="text-2xl font-semibold text-navy-500">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Radar chart */}
          <div className="glass-panel p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Detection Rate by Error Category
            </h3>
            <SkillRadarChart profile={profile} />
          </div>

          {/* Category detail table */}
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)'}}>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Encountered</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Detection Rate</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody>
                {ERROR_CATEGORIES.map(cat => {
                  const stats = profile.categories[cat.id]
                  const rate = stats && stats.encountered > 0
                    ? Math.round((stats.identified / stats.encountered) * 100)
                    : 0
                  const trend = getTrend(cat.id)

                  return (
                    <tr key={cat.id} className="last:border-0" style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                      <td className="px-4 py-2.5 text-gray-700">{cat.label}</td>
                      <td className="px-4 py-2.5 text-center text-gray-600">{stats?.encountered || 0}</td>
                      <td className="px-4 py-2.5 text-center">
                        {stats?.encountered > 0 ? (
                          <span className={`font-medium ${
                            rate >= 70 ? 'text-green-700' : rate >= 40 ? 'text-amber-700' : 'text-red-700'
                          }`}>
                            {rate}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-gray-400 text-xs">—</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Development advice */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-gray-700">Identified Development Areas</h3>
              <span className="tag-gray text-[10px]">AI-generated — verify independently</span>
            </div>
            {adviceLoading ? (
              <p className="text-sm text-gray-400">Generating analysis...</p>
            ) : advice ? (
              <p className="text-sm text-gray-700 leading-relaxed">{advice}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Analysis could not be generated at this time.
              </p>
            )}
          </div>

          {/* Session History */}
          <div className="glass-panel overflow-hidden">
            <div className="px-4 py-3" style={{borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Session History</h3>
            </div>
            {sessions.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">No sessions recorded.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)'}}>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Scenario</th>
                    <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Complexity</th>
                    <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Identified</th>
                    <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Missed</th>
                    <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">False Pos.</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={i} className="last:border-0" style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                      <td className="px-4 py-2 text-gray-600">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-gray-700">{s.scenarioTitle}</td>
                      <td className="px-4 py-2 text-center text-gray-600">{s.complexity}</td>
                      <td className="px-4 py-2 text-center text-green-700 font-medium">{s.identified}</td>
                      <td className="px-4 py-2 text-center text-red-700 font-medium">{s.missed}</td>
                      <td className="px-4 py-2 text-center text-amber-700 font-medium">{s.falsePositives}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Reset button */}
          {!isTutorial && (
            <div className="text-center">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="btn-danger text-xs !px-3 !py-1.5"
              >
                Reset Profile
              </button>
            </div>
          )}
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="glass-panel-elevated p-5 w-80">
            <p className="text-sm text-gray-700">
              This will permanently delete your session history and skill profile data. This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="btn-secondary text-xs !px-3 !py-1.5">
                Cancel
              </button>
              <button onClick={handleReset} className="btn-danger text-xs !px-3 !py-1.5">
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
