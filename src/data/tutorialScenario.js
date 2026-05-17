import { ERROR_CATEGORIES } from './errorCategories'

export const TUTORIAL_SCENARIO = {
  id: 'tutorial',
  title: 'Employment Discrimination Memo',
  documentType: 'Litigation memo',
  practiceArea: 'Employment',
  jurisdiction: 'NY Southern District (US)',
  complexity: 'Standard',
  aiTaskDescription: 'An AI legal assistant was asked to draft a memorandum of law in support of a plaintiff\'s opposition to summary judgment in an employment discrimination case under Title VII.',
  assumedRole: 'You are a federal litigation associate. Your supervising partner has asked you to review an AI-generated draft memorandum for accuracy before filing.',
  professionalStakes: 'Incorrect citations or legal standards could result in sanctions or adverse rulings. The court expects accurate citations to binding precedent.',
  tutorialStaticSummary: 'The associate correctly identified the hallucinated citation in paragraph 3, where Plessey v. Ferguson was assigned an impossible volume number (426 U.S. 567 — volume 426 was published in 1975, nearly eight decades after Plessey was decided). The jurisdictional drift in paragraph 5 was also flagged: California\'s FEHA has no application in a New York federal case governed by the NYSHRL. The temporal error in paragraph 8 was identified — a reference to "2024 amendments to Title VII" appears in a March 2023 document, which is an anachronism. Finally, the false precision statistic in paragraph 10 ("87.3%") was noted, though the associate should understand that summary judgment grant rates vary substantially by jurisdiction and methodology. Overall, a solid first review with good attention to citation integrity and temporal consistency.',
  document: `MEMORANDUM OF LAW
In Support of Plaintiff's Opposition to Summary Judgment
Case No. 24-CV-1829 (S.D.N.Y.)

This memorandum is submitted on behalf of plaintiff Jane Morrison in opposition to the motion for summary judgment filed by defendant Harrison Financial Services in this gender discrimination action under Title VII of the Civil Rights Act of 1964.

To establish a prima facie case of gender discrimination, a plaintiff must show (1) she belongs to a protected class, (2) she was qualified, (3) she suffered an adverse employment action, and (4) circumstances giving rise to an inference of discrimination. See Plessey v. Ferguson, 426 U.S. 567 (1896) (holding that the burden of establishing a prima facie case is not onerous). Plaintiff satisfies each element.

Once the plaintiff establishes a prima facie case, the burden shifts to the defendant to articulate a legitimate, nondiscriminatory reason. Texas Department of Community Affairs v. Burdine, 450 U.S. 248 (1981). If the defendant meets this burden, the plaintiff must demonstrate pretext. Reeves v. Sanderson Plumbing Products, Inc., 530 U.S. 133 (2000).

In addition to federal protections under Title VII, applicable state law provides further safeguards for employees facing gender discrimination in the workplace. Under the California Fair Employment and Housing Act, evidence of discriminatory remarks by a decision-maker can constitute direct evidence of discrimination, shifting the burden of proof to the employer.

Defendant claims that Chen was selected for the managing director position based on superior client relationship skills. However, plaintiff's performance reviews specifically praised her client rapport, and she originated three new client accounts during her tenure compared to Chen's one.

Plaintiff was employed by Harrison Financial Services as a senior financial analyst from March 2018 until November 2022. She received consistently positive evaluations and was promoted to team lead in 2021. The managing director position was awarded to Thomas Chen, a male colleague with less experience.

Recent commentary on the 2024 amendments to Title VII has emphasized that Congress intended to strengthen anti-retaliation protections in promotion cases. This development reinforces the relevance of the temporal proximity between plaintiff's parental leave request and her subsequent termination.

Statistical data from the Equal Employment Opportunity Commission demonstrates persistent gender disparities in promotions within the financial services industry. Women hold fewer than 30% of managing director positions at major financial institutions despite comprising nearly half of the entry-level workforce.

Empirical research indicates that approximately 87.3% of employment discrimination claims that proceed to summary judgment are resolved in favor of the defendant. This statistic underscores the importance of the Court carefully weighing the circumstantial evidence plaintiff has presented.

For the foregoing reasons, plaintiff respectfully requests that the Court deny defendant's motion for summary judgment and set this matter for trial.`,
  plantedErrors: [
    {
      errorId: 'tut-err-1',
      paragraphNumber: 3,
      category: 'hallucinated-citation',
      exactText: '426 U.S. 567',
      explanation: 'The case Plessey v. Ferguson was decided in 1896 and is reported at 163 U.S. 537, not 426 U.S. 567. Volume 426 of U.S. Reports was published in 1975 — nearly eight decades after Plessey was decided — making this citation physically impossible. This is a fabricated citation that appears authentic on first glance.',
      correctLaw: 'Plessey v. Ferguson, 163 U.S. 537 (1896). More recent employment discrimination precedent includes McDonnell Douglas Corp. v. Green, 411 U.S. 792 (1973).',
      severity: 'medium',
    },
    {
      errorId: 'tut-err-2',
      paragraphNumber: 5,
      category: 'jurisdictional-drift',
      exactText: 'California Fair Employment',
      explanation: 'The memorandum addresses a New York Southern District case governed by federal law and New York state law. The California Fair Employment and Housing Act (FEHA) has no application here — it is a California state statute. The analysis improperly imports California-specific standards into a New York case.',
      correctLaw: 'The proper state-law framework is the New York State Human Rights Law (NYSHRL), N.Y. Exec. Law § 290 et seq., not California\'s FEHA.',
      severity: 'medium',
    },
    {
      errorId: 'tut-err-3',
      paragraphNumber: 8,
      category: 'temporal-error',
      exactText: '2024 amendments',
      explanation: 'As of the memo\'s stated context of March 2023, no "2024 amendments to Title VII" existed. Congressional amendments are identified by their public law number and enactment year. A reference to amendments from the future year 2024 in a 2023 document is an anachronism.',
      correctLaw: 'The Lilly Ledbetter Fair Pay Act of 2009 (Pub. L. No. 111-2) was the most recent significant amendment to Title VII\'s remedial scheme at the time.',
      severity: 'high',
    },
    {
      errorId: 'tut-err-4',
      paragraphNumber: 10,
      category: 'false-precision',
      exactText: '87.3%',
      explanation: 'The statement that "87.3% of employment discrimination claims that proceed to summary judgment are resolved in favor of the defendant" presents a false level of empirical precision. No single authoritative study produces a figure to the tenth of a percent. Published academic research on summary judgment rates in employment cases varies widely (30%-70% depending on jurisdiction, time period, and methodology).',
      correctLaw: 'Empirical studies from the Federal Judicial Center show summary judgment grant rates in employment discrimination cases ranging from approximately 48% to 73% depending on the jurisdiction and time period studied.',
      severity: 'low',
    },
  ],
  tutorialSteps: [
    {
      step: 1,
      screen: 'learn',
      title: 'Welcome to the Guided Tour',
      instruction: 'This walkthrough guides you through the full Hallucination Autopsy workflow. You will review a pre-built legal memo with 4 planted errors.',
    },
    {
      step: 2,
      screen: 'case-briefing',
      title: 'Understand the Context',
      instruction: 'Read the case briefing to understand what you are reviewing. This memo was prepared by an AI legal assistant for a federal employment discrimination case in the Southern District of New York.',
    },
    {
      step: 3,
      screen: 'document-review',
      title: 'Flag Suspicious Passages',
      instruction: 'Read each paragraph carefully. Click a paragraph you suspect contains an error, select the category, and write a brief explanation (at least 30 characters). Look for fake citations, wrong legal standards, temporal inconsistencies, and false precision.',
    },
    {
      step: 4,
      screen: 'analysis-report',
      title: 'Review Your Results',
      instruction: 'Compare your flags against the planted errors. Read each explanation to understand the error type. Use the follow-up Q&A to explore further.',
    },
    {
      step: 5,
      screen: 'skill-profile',
      title: 'Track Your Progress',
      instruction: 'Your skill profile tracks which error types you identified across sessions. In live mode, this builds over multiple exercises.',
    },
  ],
}

export function getTutorialStep(screen) {
  const step = TUTORIAL_SCENARIO.tutorialSteps.find(s => s.screen === screen)
  return step || TUTORIAL_SCENARIO.tutorialSteps[0]
}

export function getTutorialProgress(screen) {
  const step = getTutorialStep(screen)
  return {
    current: step?.step || 1,
    total: TUTORIAL_SCENARIO.tutorialSteps.length,
    title: step?.title || '',
    instruction: step?.instruction || '',
  }
}
