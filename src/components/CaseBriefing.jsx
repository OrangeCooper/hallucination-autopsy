import { useState } from 'react'
import { ERROR_CATEGORIES } from '../data/errorCategories'
import TutorialCallout from './TutorialCallout'

export default function CaseBriefing({ scenario, onBegin, isTutorial }) {
  const [showTaxonomy, setShowTaxonomy] = useState(false)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card p-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-navy-500">{scenario.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Case Briefing</p>
        </div>

        <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Document Type', scenario.documentType],
                ['Jurisdiction', scenario.jurisdiction],
                ['Practice Area', scenario.practiceArea],
                ['Complexity', scenario.complexity],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-gray-200 last:border-0">
                  <td className="px-4 py-2 text-gray-500 font-medium w-1/3">{label}</td>
                  <td className="px-4 py-2 text-gray-900">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">AI Task Description</h3>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
            {scenario.aiTaskDescription}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Your Role</h3>
          <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded border border-amber-200">
            {scenario.assumedRole}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Professional Stakes</h3>
          <p className="text-sm text-gray-600 bg-red-50 p-3 rounded border border-red-200">
            {scenario.professionalStakes}
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowTaxonomy(!showTaxonomy)}
            className="text-sm text-navy-500 underline hover:text-navy-600 transition-colors"
          >
            {showTaxonomy ? 'Hide' : 'View'} Error Category Reference
          </button>
          {showTaxonomy && (
            <div className="mt-2 space-y-2">
              {ERROR_CATEGORIES.map(cat => (
                <div key={cat.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="text-xs font-medium text-gray-700">{cat.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{cat.definition}</div>
                </div>
              ))}
            </div>
          )}
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
