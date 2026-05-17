import { ERROR_CATEGORIES } from '../data/errorCategories'
import TutorialCallout from './TutorialCallout'

export default function CaseBriefing({ scenario, onBegin, isTutorial }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="glass-panel p-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: '#1a2540' }}>{scenario.title}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#4a5568' }}>Case Briefing</p>
        </div>

        <div className="glass-panel rounded overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Document Type', scenario.documentType],
                ['Jurisdiction', scenario.jurisdiction],
                ['Practice Area', scenario.practiceArea],
                ['Complexity', scenario.complexity],
              ].map(([label, value]) => (
                <tr key={label} className="border-b last:border-0" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                  <td className="px-4 py-2 font-medium w-1/3" style={{ color: '#718096' }}>{label}</td>
                  <td className="px-4 py-2" style={{ color: '#1a202c' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-1" style={{ color: '#1a2540' }}>AI Task Description</h3>
          <p className="text-sm p-3 rounded leading-relaxed" style={{ color: '#1a2540', background: 'rgba(43,92,173,0.05)', border: '1px solid rgba(43,92,173,0.12)' }}>
            {scenario.aiTaskDescription}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-1" style={{ color: '#1a2540' }}>Your Role</h3>
          <p className="text-sm p-3 rounded leading-relaxed" style={{ color: '#1a2540', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)' }}>
            {scenario.assumedRole}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-1" style={{ color: '#1a2540' }}>Professional Stakes</h3>
          <p className="text-sm p-3 rounded leading-relaxed" style={{ color: '#1a2540', background: 'rgba(197,48,48,0.06)', border: '1px solid rgba(197,48,48,0.12)' }}>
            {scenario.professionalStakes}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#1a2540' }}>Error Category Reference</h3>
          <div className="space-y-1.5">
            {ERROR_CATEGORIES.map(cat => (
              <div key={cat.id} className="p-2.5 rounded text-xs leading-relaxed" style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="font-medium" style={{ color: '#2b5cad' }}>{cat.label}:</span>{' '}
                <span style={{ color: '#4a5568' }}>{cat.definition}</span>
              </div>
            ))}
          </div>
        </div>

        {isTutorial && (
          <TutorialCallout instruction="Read the context carefully. This memo was supposedly prepared by an AI legal assistant — your task is to verify its accuracy before it reaches the supervising partner." />
        )}

        <button onClick={onBegin} className="btn-primary w-full">
          Begin Document Review
        </button>
      </div>
    </div>
  )
}
