import { useState, useEffect, useMemo } from 'react'
import { ERROR_CATEGORIES } from '../data/errorCategories'
import SkillRadarChart from './RadarChart'
import { generateRecommendation } from '../utils/api'
import { resetAllData } from '../utils/storage'
import { addReport, getReports } from '../utils/storage'

export default function AccountPage({ profile, sessions, user, onBack }) {
  const [recommendation, setRecommendation] = useState(null)
  const [loadingRec, setLoadingRec] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (profile.sessionsCompleted === 0) { setLoadingRec(false); return }
    let cancelled = false
    setLoadingRec(true)
    generateRecommendation(profile, sessions)
      .then(text => { if (!cancelled) setRecommendation(text) })
      .catch(() => { if (!cancelled) setRecommendation(null) })
      .finally(() => { if (!cancelled) setLoadingRec(false) })
    return () => { cancelled = true }
  }, [profile, sessions])

  const weaknessAnalysis = useMemo(() => {
    return ERROR_CATEGORIES.map(cat => {
      const stats = profile.categories?.[cat.id]
      const rate = stats && stats.encountered > 0 ? stats.identified / stats.encountered : null
      return { ...cat, rate, encountered: stats?.encountered || 0, identified: stats?.identified || 0 }
    }).filter(c => c.encountered > 0)
      .sort((a, b) => (a.rate ?? 1) - (b.rate ?? 1))
  }, [profile])

  const weakest = weaknessAnalysis.slice(0, 2)
  const strongest = weaknessAnalysis.slice(-2).reverse()

  const handleReset = () => {
    resetAllData()
    setShowResetConfirm(false)
    window.location.reload()
  }

  const reports = getReports()
  const savedReports = reports.slice(-10).reverse()

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'weakness', label: 'Weakness Analysis' },
    { id: 'sessions', label: 'Session History' },
    { id: 'reports', label: 'Saved Reports' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-navy-500">Account</h1>
          {user && (
            <p className="text-sm text-gray-500 mt-0.5">
              {user.name || user.email} {user.institution ? `· ${user.institution}` : ''}
            </p>
          )}
        </div>
        <button onClick={onBack} className="btn-secondary text-xs !px-3 !py-1.5">Back to Dashboard</button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-navy-500 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-5">
          {weakest.length > 0 && (
            <div className="card p-4 border-l-4 border-l-amber-500">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Competency Summary</p>
              <p className="text-sm text-gray-700">
                Most consistent: <strong>{strongest.map(c => c.label).join(', ') || 'N/A'}</strong>.
              </p>
              <p className="text-sm text-gray-700">
                Categories requiring additional review consistency: <strong>{weakest.map(c => c.label).join(', ') || 'N/A'}</strong>.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Skill Profile</h3>
              <SkillRadarChart profile={profile} />
              <div className="mt-2 text-xs text-gray-500">
                {profile?.sessionsCompleted || 0} sessions &middot; {profile?.totalIdentified || 0}/{profile?.totalEncountered || 0} identified
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recommended Practice</h3>
              {loadingRec ? (
                <p className="text-sm text-gray-400">Generating recommendation...</p>
              ) : recommendation ? (
                <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
              ) : profile.sessionsCompleted === 0 ? (
                <p className="text-sm text-gray-400">Complete a session to receive recommendations.</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Could not generate recommendation.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'weakness' && (
        <div className="space-y-4">
          {weaknessAnalysis.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-sm text-gray-400">Complete sessions to see your weakness analysis.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Error Category</th>
                    <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Detection Rate</th>
                    <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Encountered</th>
                    <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Identified</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {weaknessAnalysis.map(cat => (
                    <tr key={cat.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2.5 text-gray-700">{cat.label}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`font-medium ${cat.rate >= 0.7 ? 'text-green-700' : cat.rate >= 0.4 ? 'text-amber-700' : 'text-red-700'}`}>
                          {cat.rate !== null ? `${Math.round(cat.rate * 100)}%` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-gray-600">{cat.encountered}</td>
                      <td className="px-4 py-2.5 text-center text-gray-600">{cat.identified}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">stable</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'sessions' && (
        <div className="card overflow-hidden">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No sessions recorded.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Scenario</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Mode</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Complexity</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Correct</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">Missed</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">False Pos.</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2 text-gray-600">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-gray-700">{s.scenarioTitle}</td>
                    <td className="px-4 py-2 text-center text-gray-600">{s.mode || 'Static'}</td>
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
      )}

      {tab === 'reports' && (
        <div className="space-y-3">
          {savedReports.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-sm text-gray-400">No reports saved yet. Flagged issues from the Analysis Report will appear here.</p>
            </div>
          ) : (
            savedReports.map((r, i) => (
              <div key={i} className="card p-3 text-xs text-gray-600">
                <span className="font-medium text-gray-700">{r.category}</span>
                <span className="text-gray-400"> &middot; {new Date(r.timestamp).toLocaleDateString()}</span>
                {r.userText && <p className="mt-0.5 text-gray-500">{r.userText}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">AI Controls</h3>
            <p className="text-xs text-gray-500 mb-2">AI-generated summaries and follow-up Q&A can be disabled.</p>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" defaultChecked className="rounded" />
              Enable AI-generated review summaries
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <input type="checkbox" defaultChecked className="rounded" />
              Enable follow-up Q&A
            </label>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Data Controls</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <button className="btn-secondary text-xs !px-2 !py-1">Export Data</button>
              <button onClick={() => setShowResetConfirm(true)} className="btn-danger text-xs !px-2 !py-1">Clear All Data</button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-5 w-80">
            <p className="text-sm text-gray-700">
              This will permanently delete your session history and skill profile data. This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="btn-secondary text-xs !px-3 !py-1.5">Cancel</button>
              <button onClick={handleReset} className="btn-danger text-xs !px-3 !py-1.5">Delete Everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
