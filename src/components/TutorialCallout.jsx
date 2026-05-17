export default function TutorialCallout({ instruction, children }) {
  return (
    <div className="bg-navy-50 border border-navy-200 rounded p-3 text-xs text-navy-700 leading-relaxed">
      <p className="font-medium text-navy-600 mb-0.5">
        <svg className="inline-block w-3 h-3 mr-1 -mt-0.5" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
          <text x="6" y="7" textAnchor="middle" fontSize="7" fill="currentColor" fontWeight="bold">i</text>
        </svg>
        Tutorial Tip
      </p>
      <p>{instruction}</p>
      {children}
    </div>
  )
}
