import { useState } from 'react'
import { ERROR_CATEGORIES } from '../data/errorCategories'

const RESEARCH_CITATIONS = [
  {
    text: 'Dahl, Magesh, Suzgun & Ho, Large Legal Fictions: Profiling Legal Hallucinations in Large Language Models, 16 J. Legal Analysis 64 (2024). doi:10.1093/jla/laae003',
    key: 'dahl2024',
  },
  {
    text: 'Magesh, Surani, Dahl, Suzgun, Manning & Ho, Hallucination-Free? Assessing the Reliability of Leading AI Legal Research Tools, 22 J. Empirical Legal Stud. 216 (2025). doi:10.1111/jels.12413',
    key: 'magesh2025',
  },
  {
    text: 'Blair-Stanek et al., AI Gets Its First Law School A+s (2025). ssrn.com/abstract=5274547',
    key: 'blair2025',
  },
]

const LIMITATIONS = [
  'The planted errors in each scenario were designed by a human but may themselves contain inaccuracies. The Report mechanism exists to surface these.',
  'The ground truth explanations are AI-assisted and have not been reviewed by a licensed attorney in every jurisdiction covered.',
  'Proficiency on this platform does not certify competence in AI output review. It is a training tool, not an assessment instrument.',
  'The scenario library reflects six error categories and a limited set of jurisdictions. Other error types exist that are not represented here.',
  'Performance on the platform may not generalise to all AI tools, which have different hallucination profiles and failure modes.',
  'The platform cannot verify whether the user\'s flagged passages are legally correct — only whether they match the pre-defined planted error set.',
]

export default function AboutPanel({ onClose }) {
  const [tab, setTab] = useState('about')

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-12">
      <div className="glass-panel w-full max-w-xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--glass-accent)' }}>About Hallucination Autopsy</h2>
          <button onClick={onClose} style={{ color: 'var(--glass-muted)' }}>&times;</button>
        </div>

        <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'about', label: 'About' },
            { id: 'research', label: 'Research Foundation' },
            { id: 'roadmap', label: 'Where This Is Going' },
            { id: 'limitations', label: 'Known Limitations' },
            { id: 'responsible', label: 'Responsible AI' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 text-xs font-medium py-2.5 border-b-2 transition-colors"
              style={{
                borderBottomColor: tab === t.id ? 'var(--glass-accent)' : 'transparent',
                color: tab === t.id ? 'var(--glass-accent)' : 'var(--glass-secondary)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 text-sm text-gray-600 leading-relaxed">
          {tab === 'about' && (
            <>
              <p>
                <strong>Hallucination Autopsy</strong> is a professional web-based training platform designed
                to build the human supervisory competence that lawyers, law students, and legal professionals
                require when working with AI-generated legal outputs.
              </p>
              <p>
                The platform presents users with realistic synthetic legal documents containing deliberately
                planted errors — drawn from documented AI failure modes — and requires them to identify,
                annotate, and classify those errors through a structured review workflow.
              </p>
              <p>
                The platform does <strong>not</strong> automate the detection of errors. It trains practitioners
                to detect errors themselves. This distinction is deliberate and foundational: professional
                responsibility frameworks require lawyers to exercise independent supervisory judgment over
                AI outputs, not to delegate that supervision to a second AI system.
              </p>
              <p className="text-xs text-gray-400 pt-2">
                Submitted to the WashU Law Vibe Coding Competition. All scenarios are entirely fictional
                and synthetic. Contains no real client data.
              </p>
            </>
          )}

          {tab === 'research' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                The error taxonomy used throughout this platform is grounded in peer-reviewed empirical
                research on legal hallucinations in large language models. Six error categories are
                employed:
              </p>
              <ul className="space-y-2">
                {ERROR_CATEGORIES.map(cat => (
                  <li key={cat.id} className="text-sm text-gray-600">
                    <strong className="text-gray-800">{cat.label}:</strong>{' '}
                    {cat.definition}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-600">
                The taxonomy is drawn from and consistent with the classification frameworks
                established in the following studies:
              </p>
              <ol className="space-y-2 list-decimal pl-4 text-xs" style={{ color: 'var(--glass-secondary)' }}>
                {RESEARCH_CITATIONS.map(c => (
                  <li key={c.key} className="leading-relaxed">{c.text}</li>
                ))}
              </ol>
              <p className="text-sm text-gray-600">
                Jurisdictional drift is specifically identified by Magesh et al. (2025) as
                "uniquely important and prevalent in the legal setting" and underexplored in
                prior literature on AI hallucinations. The hallucination rates documented across
                these studies range from 17% for the best-performing specialised legal AI tools
                to 88% for general-purpose models, establishing the scale of the problem this
                platform trains practitioners to address.
              </p>
            </div>
          )}

          {tab === 'roadmap' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--glass-accent)' }}>Where This Is Going</h3>

              <div>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Current</span>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  Hallucination Autopsy is currently a structured training platform. Every session generates
                  data about how legal professionals interact with AI-generated errors — which error types
                  they identify, which they miss, how they articulate what is wrong, and where their detection
                  behaviour clusters by practice area and document type. This data is anonymised and retained
                  only in the user's own browser. It does not leave the device.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Near Term</span>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  As the platform matures and session volume grows, aggregated and anonymised interaction
                  patterns will be used to develop a supplementary document scanning tool within the same
                  platform. This tool will not verify citations against legal databases. It will highlight
                  passages in user-uploaded documents that share linguistic and structural characteristics
                  with the error types most frequently identified in training sessions — flagging them as
                  warranting closer human scrutiny. It will not tell a lawyer that something is wrong. It
                  will tell a lawyer where to look more carefully. The distinction is deliberate and will
                  be disclosed prominently within the tool itself.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Future</span>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  A premium tier is planned that would integrate with verified legal databases to enable
                  actual citation and authority checking — moving from pattern-based suspicion flagging
                  to ground-truth verification. This would bring the platform closer to the verification
                  capability of dedicated citation-checking tools, but with the supervisory skill context
                  that those tools do not provide. Whether that tier is built depends on the resources
                  available and whether the training data collected in earlier stages demonstrates
                  sufficient signal quality to justify it. No timeline is committed to and no claims are
                  made about its capabilities in advance of it being built and independently evaluated.
                </p>
              </div>
            </div>
          )}

          {tab === 'limitations' && (
            <ul className="space-y-2 list-disc pl-4">
              {LIMITATIONS.map((l, i) => (
                <li key={i} className="text-sm text-gray-600">{l}</li>
              ))}
            </ul>
          )}

          {tab === 'responsible' && (
            <>
              <p>
                The explanations on the Analysis Report screen are generated by or drawn from AI-assisted
                sources. They may contain errors. Users are encouraged to verify all legal information
                against primary sources.
              </p>
              <p>
                The Report mechanism exists precisely because this platform does not consider its own
                outputs to be authoritative.
              </p>
              <p>
                The platform contains no real client data. All legal scenarios are entirely fictional
                and synthetic. Nothing on this platform constitutes legal advice.
              </p>
              <p>
                All AI-generated content is labelled as such. Users should independently verify all
                legal information against primary sources before relying on it.
              </p>
              <p className="text-xs text-gray-400 pt-2">
                API calls are routed through OpenRouter using the gpt-oss-120b model. Prompts do
                not include personally identifying information.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
