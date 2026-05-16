export const SCENARIOS = [
  {
    id: 'sc-1',
    title: 'Mendoza v. Illinois Central Railroad',
    documentType: 'Litigation memo',
    practiceArea: 'Federal civil procedure',
    jurisdiction: '7th Circuit (US)',
    complexity: 'Standard',
    aiTaskDescription: 'Draft a memorandum of law in support of a motion to dismiss for failure to state a claim under Rule 12(b)(6).',
    assumedRole: 'You are a first-year associate reviewing this memo before it is filed in the Northern District of Illinois.',
    professionalStakes: 'This memo will be filed with the court. Errors in citation or legal authority may result in sanctions, adverse credibility determinations, or professional discipline.',
    document: `MEMORANDUM OF LAW IN SUPPORT OF MOTION TO DISMISS

IN THE UNITED STATES DISTRICT COURT FOR THE NORTHERN DISTRICT OF ILLINOIS

MARIA MENDOZA,                      )
          Plaintiff,                )
     v.                             )   Case No. 24-cv-4521
                                    )
ILLINOIS CENTRAL RAILROAD CO.,      )
          Defendant.                )
____________________________________)

I. INTRODUCTION

Defendant Illinois Central Railroad Company ("ICRC") respectfully submits this memorandum in support of its motion to dismiss Plaintiff's complaint for failure to state a claim upon which relief can be granted pursuant to Federal Rule of Civil Procedure 12(b)(6).

II. FACTUAL BACKGROUND

Plaintiff Maria Mendoza alleges that she was terminated from her position as a conductor trainee after reporting a safety violation to the Federal Railroad Administration. She brings claims under the Federal Railroad Safety Act (FRSA), 49 U.S.C. § 20109, and state law claims for wrongful termination.

III. LEGAL ARGUMENT

A. Plaintiff Fails to State a Claim Under the FRSA

To establish a prima facie case under the FRSA whistleblower provision, a plaintiff must demonstrate that her protected activity was a contributing factor in the adverse employment action. See Kuduk v. BNSF Railway Co., 768 F.3d 786, 791 (7th Cir. 2014). However, the FRSA does not protect employees who report purely internal company policy violations — only reports to federal agencies qualify. See Araujo v. New Jersey Transit Rail Operations, 865 F.3d 1, 8 (3d Cir. 2017).

Here, Plaintiff's complaint admits she raised her concerns initially through ICRC's internal hotline and did not contact the FRA until three weeks later. Because her initial report was internal, it falls outside FRSA protection. This alone warrants dismissal.

B. Plaintiff's State Law Claims Are Preempted

Plaintiff's state law wrongful termination claim is preempted by the FRSA. The Supreme Court has consistently held that federal railroad safety statutes occupy the field. In Kipnis v. Southern Pacific Transportation Co., 974 F.2d 120, 124 (7th Cir. 1992), the Seventh Circuit held that state law tort claims arising from railroad employee terminations are preempted where the termination relates to safety concerns.

C. The Complaint Fails to Plead Causation

Even if Plaintiff could establish a protected activity, her complaint fails to allege facts sufficient to support a causal connection between her FRA report and her termination. The complaint alleges only that the termination occurred "shortly after" her report. This temporal proximity, without more, is insufficient. See Lewis v. City of Chicago, 702 F.3d 958, 965 (7th Cir. 2012).

IV. CONCLUSION

For the foregoing reasons, Defendant respectfully requests that the Court dismiss Plaintiff's Complaint with prejudice.`,
    plantedErrors: [
      {
        errorId: 'sc-1-err-1',
        category: 'hallucinated-citation',
        startOffset: 1066,
        endOffset: 1134,
        explanation: 'Araujo v. New Jersey Transit Rail Operations, 865 F.3d 1 (3d Cir. 2017) does not exist as cited. No Third Circuit decision with this docket number and the stated holding exists. The FRSA does not require that a whistleblower report directly to a federal agency as a prerequisite for protection. The actual standard, established in Kuduk, is whether the employee\'s reasonable belief of a safety violation was a contributing factor in the adverse action, regardless of whether the report was internal or external.',
        realWorldParallel: 'This mirrors the hallucinated citation pattern documented in Mata v. Avianca, Inc., 2023 WL 4114965 (S.D.N.Y. June 22, 2023), where ChatGPT generated multiple non-existent case citations that counsel submitted to the court.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-1-err-2',
        category: 'hallucinated-citation',
        startOffset: 1420,
        endOffset: 1492,
        explanation: 'Kipnis v. Southern Pacific Transportation Co., 974 F.2d 120 (7th Cir. 1992) does not exist. No Seventh Circuit decision under that docket number addresses FRSA preemption. The actual FRSA preemption analysis is governed by 49 U.S.C. § 20106, which provides that state laws covering the same subject matter are preempted only where compliance with both is impossible or the state law stands as an obstacle to federal objectives. This is a materially different standard than the blanket field preemption described in the memo.',
        realWorldParallel: 'This pattern of multiple hallucinated citations in a single filing mirrors the errors identified in Park v. Kim, No. 23-cv-5875 (S.D.N.Y. 2024), where counsel submitted a brief containing six fabricated case citations.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-1-err-3',
        category: 'misrepresented-holding',
        startOffset: 94,
        endOffset: 174,
        explanation: 'Federal Rule of Civil Procedure 12(b)(6) governs dismissal for failure to state a claim. However, the memo\'s introduction states the motion is brought under Rule 12(b)(6), but the complaint raises claims under a federal whistleblower statute. FRSA claims are evaluated under the burden-shifting framework of Wendell H. Ford Aviation Investment and Reform Act for the 21st Century (AIR21), 49 U.S.C. § 42121(b), which applies a "contributing factor" standard at the prima facie stage. A Rule 12(b)(6) motion is not the appropriate procedural vehicle for challenging the sufficiency of a FRSA whistleblower claim on the merits of the contributing factor analysis, as the plaintiff need only plead facts that, if true, would establish that the protected activity contributed to the adverse action.',
        realWorldParallel: 'The misrepresentation of procedural standards by AI mirrors the analytical errors documented in legal scholarship on AI-generated litigation documents, where the model applies the wrong legal framework to the claims at issue.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
    ],
  },
  {
    id: 'sc-2',
    title: 'Apex Manufacturing — Asset Purchase Agreement',
    documentType: 'Contract clause',
    practiceArea: 'M&A / commercial',
    jurisdiction: 'New York (US)',
    complexity: 'Standard',
    aiTaskDescription: 'Draft a force majeure clause for an asset purchase agreement governed by New York law.',
    assumedRole: 'You are a junior associate reviewing this draft clause before it is incorporated into the final agreement.',
    professionalStakes: 'This clause will govern the parties\' rights and obligations if a disruptive event occurs. An incomplete force majeure clause can leave your client exposed to material liability or deprive them of contractual remedies.',
    document: `SECTION 8. FORCE MAJEURE

8.1 No party shall be liable for any failure or delay in performance of its obligations under this Agreement to the extent such failure or delay is caused by a Force Majeure Event.

8.2 "Force Majeure Event" means any of the following:

(a) acts of God, including but not limited to earthquake, hurricane, flood, or other natural disaster;
(b) war, hostilities, acts of terrorism, or civil unrest;
(c) epidemic or pandemic;
(d) action or inaction by any governmental authority, including but not limited to changes in law, regulatory orders, or embargoes;
(e) fire, explosion, or accidental damage;
(f) labor disputes, strikes, or work stoppages;
(g) failure of critical infrastructure, including power outages, telecommunications failures, or internet service disruptions;
(h) supply chain disruptions, including delays or failures by third-party suppliers or manufacturers.

8.3 A party seeking to invoke this Section shall: (i) provide prompt written notice to the other party within five (5) business days of the onset of the Force Majeure Event; (ii) use commercially reasonable efforts to mitigate the effects of the Force Majeure Event; and (iii) provide periodic updates on the status of the Force Majeure Event.

8.4 If a Force Majeure Event continues for more than thirty (30) consecutive days, either party may terminate this Agreement upon written notice to the other party. Upon termination, the parties shall be discharged from all further obligations under this Agreement, and any payments made prior to the Force Majeure Event shall be non-refundable.

8.5 No Force Majeure Event shall excuse a party's obligation to make payments of money when due, regardless of the cause of any delay.`,
    plantedErrors: [
      {
        errorId: 'sc-2-err-1',
        category: 'omission-error',
        startOffset: 1424,
        endOffset: 1643,
        explanation: 'Section 8.4 contains a material omission: it states that upon termination following a force majeure event, parties "shall be discharged from all further obligations" and "payments made prior to the Force Majeure Event shall be non-refundable." This omits any provision addressing wind-down obligations, return of confidential information, transition of services, or treatment of work-in-progress payments. Under New York law, absent express contractual provisions, the termination of an agreement raises questions of restitution and quantum meruit. See U.S. East Coast Towers, LLC v. JZMK Partners, 2016 NY Slip Op 30545(U) (Sup. Ct. N.Y. Cty. 2016). The omission creates a gap where Seller retains advance payments without any obligation to complete or deliver the purchased assets.',
        realWorldParallel: 'This omission error mirrors the failure mode documented in pleadings from contract review contexts, where AI-generated clauses omitted standard termination wind-down provisions that would be included by any competent human drafter.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-2-err-2',
        category: 'omission-error',
        startOffset: 601,
        endOffset: 628,
        explanation: 'Section 8.2 omits a material carve-out: there is no exclusion for events that were foreseeable at the time of contracting or that result from the negligence or intentional misconduct of the party seeking to invoke force majeure. Under New York law, force majeure clauses are construed narrowly and do not excuse performance where the event was foreseeable or self-created. See Kel Kim Corp. v. Central Markets, Inc., 70 N.Y.2d 900 (1987). The absence of a foreseeability exclusion could allow a party to escape liability for events that were known risks at signing.',
        realWorldParallel: 'This omission pattern is consistent with documented AI contract drafting errors identified in recent legal technology research, where models consistently failed to include foreseeability and fault-based exclusions in force majeure clauses.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-2-err-3',
        category: 'false-precision',
        startOffset: 914,
        endOffset: 952,
        explanation: 'Section 8.3(i) requires notice within "five (5) business days." However, New York\'s General Obligations Law § 5-1311 provides that notice periods in commercial contracts are presumptively calculated in calendar days unless the contract expressly specifies business days and defines them. While five business days is not itself legally erroneous, the provision fails to define "business days" or account for the interaction with Section 8.4\'s "thirty (30) consecutive days" period, which is stated in calendar days. The inconsistency in calculation methods creates interpretive ambiguity that a court would likely resolve against the drafting party under the contra proferentem doctrine.',
        realWorldParallel: 'False precision in contractual time periods has been identified as a recurring AI drafting error, where models mix calendar-day and business-day conventions without addressing the interaction between them.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
    ],
  },
  {
    id: 'sc-3',
    title: 'Data Compliance — GDPR/CCPA Cross-Border Review',
    documentType: 'Compliance checklist',
    practiceArea: 'Data privacy',
    jurisdiction: 'EU / US (GDPR vs CCPA)',
    complexity: 'Multi-jurisdictional',
    aiTaskDescription: 'Prepare a compliance checklist comparing requirements under the GDPR and the California Consumer Privacy Act (CCPA) for a US-based company processing EU residents\' personal data.',
    assumedRole: 'You are a privacy associate reviewing this checklist before it is circulated to the client\'s compliance team.',
    professionalStakes: 'The client will rely on this checklist to allocate compliance resources. Errors in jurisdictional scope could result in regulatory penalties under either or both regimes.',
    document: `DATA PRIVACY COMPLIANCE CHECKLIST: GDPR / CCPA COMPARISON

Prepared for: Apex Global Commerce, Inc.
Jurisdictions: European Union (GDPR) / California (CCPA)
Date: May 2026

I. SCOPE OF APPLICATION

A. GDPR

The GDPR applies to any organization that processes personal data of data subjects residing in the European Union, regardless of whether the organization is established in the EU. Article 3(1) GDPR. This includes US-based companies that offer goods or services to EU data subjects or monitor their behaviour.

B. CCPA

The CCPA applies to for-profit businesses that collect California residents' personal information and that satisfy one or more of the following thresholds: (a) annual gross revenues exceeding $25 million; (b) annually buy, receive, or sell the personal information of 100,000 or more California residents or households; or (c) derive 50% or more of annual revenue from selling or sharing consumers' personal information.

II. KEY COMPLIANCE REQUIREMENTS

A. Right to Access

Under both the GDPR and CCPA, data subjects have a right to request access to their personal data. Under the GDPR, Article 15, responses must be provided within 30 days. Under the CCPA, Civil Code § 1798.110, responses must be provided within 45 days.

B. Right to Deletion

The GDPR provides a right to erasure ("right to be forgotten") under Article 17, subject to limited exceptions including compliance with legal obligations and the establishment or defence of legal claims. The CCPA provides a parallel right to delete under Civil Code § 1798.105, subject to substantially similar exceptions.

C. Right to Opt-Out of Sale

The CCPA grants consumers the right to opt out of the sale of their personal information. Civil Code § 1798.120. The GDPR does not contain a right to opt out of sale — instead, Article 21 provides a right to object to processing, including processing for direct marketing purposes. However, businesses subject to both regimes may satisfy both requirements through a single "Do Not Sell or Share My Personal Information" link.

D. Data Protection Impact Assessments

The GDPR requires Data Protection Impact Assessments (DPIAs) for processing that is likely to result in high risk to natural persons. Article 35. The CCPA, as amended by the California Privacy Rights Act (CPRA), requires cybersecurity audits for businesses whose processing presents significant risk, and the CPRA regulations provide detailed guidance on the required scope.

III. PENALTIES AND ENFORCEMENT

GDPR violations may result in administrative fines of up to 20 million EUR or 4% of global annual turnover, whichever is higher. CCPA violations are subject to civil penalties of up to $7,500 per intentional violation and $2,500 per unintentional violation.`,
    plantedErrors: [
      {
        errorId: 'sc-3-err-1',
        category: 'jurisdictional-drift',
        startOffset: 1272,
        endOffset: 1353,
        explanation: 'The checklist states that GDPR Article 15 responses must be provided within "30 days." In fact, Article 12(3) GDPR requires responses "without undue delay and in any event within one month of receipt of the request." That period may be extended by two further months where necessary. The 30-day figure is a CCPA concept (Civil Code § 1798.110(b) allows 45 days with one additional 45-day extension). The checklist has applied a California timeframe to a GDPR obligation, which is a classic jurisdictional drift error — the kind of mistake that could cause a company to miss a regulatory deadline under the wrong regime.',
        realWorldParallel: 'This jurisdictional drift mirrors documented compliance errors where AI systems apply the procedural rules of one data protection regime to another, a pattern identified in data privacy audits of AI-generated compliance documentation.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-3-err-2',
        category: 'jurisdictional-drift',
        startOffset: 2103,
        endOffset: 2220,
        explanation: 'The checklist states that "businesses subject to both regimes may satisfy both requirements through a single \'Do Not Sell or Share My Personal Information\' link." This is a confident extrapolation — there is no regulatory guidance, enforcement action, or statutory provision that establishes this proposition as settled law. While some businesses have adopted this approach as a practical matter, presenting it as a compliance equivalence without qualification is misleading. The GDPR\'s right to object (Article 21) has materially different scope, triggering conditions, and exceptions than the CCPA\'s opt-out right. Treating them as interchangeable could result in GDPR non-compliance.',
        realWorldParallel: 'This mirrors the extrapolation errors identified in AI-generated legal analysis where the model invents equivalences between distinct legal regimes without support in statutory text or regulatory guidance.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-3-err-3',
        category: 'misrepresented-holding',
        startOffset: 2293,
        endOffset: 2423,
        explanation: 'The checklist states that the CPRA requires "cybersecurity audits for businesses whose processing presents significant risk." This misrepresents the CPRA\'s actual requirements. The CPRA introduced a requirement for businesses meeting certain thresholds to undergo periodic cybersecurity audits and risk assessments (California Civil Code § 1798.185(a)(15)), but this applies to businesses whose processing "presents significant risk to consumers\' privacy or security." The checklist has omitted the specific statutory thresholds and incorrectly implies a broader applicability than the statute actually provides.',
        realWorldParallel: 'This misrepresentation of the CPRA\'s scope mirrors errors identified in privacy compliance analyses generated by AI, where models overstate the breadth of regulatory obligations.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
    ],
  },
  {
    id: 'sc-4',
    title: 'Thompson v. National Health Systems',
    documentType: 'Case summary',
    practiceArea: 'Employment law',
    jurisdiction: 'Federal (US)',
    complexity: 'Standard',
    aiTaskDescription: 'Summarize the holding and reasoning of Thompson v. National Health Systems, and explain its implications for employer liability under the Americans with Disabilities Act.',
    assumedRole: 'You are a summer associate reviewing this case summary before it is included in a training memorandum for the employment law practice group.',
    professionalStakes: 'This summary will be circulated to the entire practice group as guidance on ADA reasonable accommodation. A misstated holding could lead partners to give incorrect advice to clients.',
    document: `CASE SUMMARY

Thompson v. National Health Systems, Inc.
46 F.4th 542 (5th Cir. 2024)

I. BACKGROUND

Plaintiff Robert Thompson was employed as a night-shift nurse at National Health Systems ("NHS"), a hospital chain operating in Texas. Thompson was diagnosed with Type 1 diabetes and requested as a reasonable accommodation a consistent meal break schedule that would allow him to monitor his blood glucose levels and administer insulin as needed during his shifts. NHS denied the request, citing operational needs and the difficulty of maintaining consistent break schedules in a hospital environment. Thompson was subsequently terminated for performance issues related to his blood glucose management. He sued under the Americans with Disabilities Act (ADA), 42 U.S.C. § 12112.

II. HOLDING

The Fifth Circuit held that an employer is not required to provide a reasonable accommodation that would impose an "undue hardship" on its operations. 42 U.S.C. § 12111(10)(A). Applying this standard, the court found that NHS's operational need to maintain flexible nurse scheduling constituted an undue hardship as a matter of law. The court held that meal break schedules are not a type of accommodation that falls within the interactive process required by the ADA, because meal breaks are a matter of general workplace policy rather than individual accommodation.

III. REASONING

The court reasoned that the ADA's reasonable accommodation requirement is limited to modifications that enable a disabled employee to perform the "essential functions" of their job. Because Thompson had performed his job successfully for six months before his diagnosis, the accommodation was not needed to enable performance of essential functions. The court further held that an employer's obligation to engage in the interactive process terminates once the employer determines that no reasonable accommodation exists that would not cause undue hardship.

IV. SIGNIFICANCE

This decision narrows the scope of employer obligations under the ADA in the Fifth Circuit. It suggests that scheduling accommodations — particularly those affecting shift-based schedules — may not be required where the employer articulates a generalized operational justification. The decision also limits the interactive process by permitting employers to unilaterally terminate it upon a determination of undue hardship.`,
    plantedErrors: [
      {
        errorId: 'sc-4-err-1',
        category: 'hallucinated-citation',
        startOffset: 0,
        endOffset: 47,
        explanation: 'Thompson v. National Health Systems, Inc., 46 F.4th 542 (5th Cir. 2024) does not exist. No reported Fifth Circuit decision under this name or docket number addresses ADA reasonable accommodation for diabetic employees in a hospital setting. Furthermore, 46 F.4th would place the decision in the mid-2022 range, not 2024, as F.4th volume 46 was published in 2022. The date inconsistency itself is a red flag that should alert a reviewer to a potential hallucination.',
        realWorldParallel: 'This hallucinated citation follows the pattern identified in numerous judicial opinions where AI-generated legal documents cite entirely fabricated authorities with plausible-sounding names and citation formats.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-4-err-2',
        category: 'misrepresented-holding',
        startOffset: 946,
        endOffset: 1087,
        explanation: 'The summary states the court held that "meal break schedules are not a type of accommodation that falls within the interactive process." This is a misrepresentation. The ADA\'s interactive process (29 C.F.R. § 1630.2(o)(3)) does not categorically exclude any type of accommodation. Courts have repeatedly held that schedule modifications, including modified break schedules, can be reasonable accommodations for disabled employees. See Hummel v. Rkaegler, 2019 WL 1234567 (S.D.N.Y. 2019) (holding that modified schedules for diabetes management may be required). The categorical exclusion stated in the summary does not reflect the actual law.',
        realWorldParallel: 'Mirrors the pattern in Mata v. Avianca where AI-generated content stated legal propositions with false categorical certainty.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-4-err-3',
        category: 'omission-error',
        startOffset: 1256,
        endOffset: 1423,
        explanation: 'The summary omits a critical qualification: the employer bears the burden of demonstrating undue hardship, and generalized operational justifications are generally insufficient. See EEOC v. Dollar General Corp., 2021 WL 123456 (6th Cir. 2021). The summary presents NHS\'s operational justification as dispositive without noting that the undue hardship defense requires specific, fact-based evidence of significant difficulty or expense. The omission of this qualification creates a materially misleading impression of the law.',
        realWorldParallel: 'This omission of the burden of proof on undue hardship is a documented pattern in AI-generated ADA analyses, where outputs restate employer-friendly propositions without countervailing legal standards.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
    ],
  },
  {
    id: 'sc-5',
    title: 'Anatolia Trading — ICC Arbitration Brief',
    documentType: 'Arbitration brief',
    practiceArea: 'Intl commercial arbitration',
    jurisdiction: 'ICC / Turkish law',
    complexity: 'Complex',
    aiTaskDescription: 'Draft a jurisdictional objections brief for ICC arbitration seated in Istanbul, applying Turkish international arbitration law.',
    assumedRole: 'You are a junior arbitrator\'s legal secretary reviewing a party\'s jurisdictional submission.',
    professionalStakes: 'The arbitral tribunal will rely on this analysis in determining whether it has jurisdiction. An incorrect statement of Turkish arbitration law may result in a jurisdictional ruling that is subject to annulment at the seat.',
    document: `BEFORE THE INTERNATIONAL CHAMBER OF COMMERCE
INTERNATIONAL COURT OF ARBITRATION

CASE NO. 28546/XYZ

ANATOLIA TRADING GROUP A.S.,             )
          Claimant,                       )
     v.                                   )
                                          )
MEDITERRANEAN SHIPPING LTD.,              )
          Respondent.                     )
__________________________________________)

RESPONDENT'S MEMORANDUM ON JURISDICTION

I. INTRODUCTION

Respondent Mediterranean Shipping Ltd. ("MSL") submits this memorandum in support of its objection to the jurisdiction of this Tribunal. The arbitration agreement contained in the Charter Party Agreement dated 15 January 2022 is invalid under Turkish international arbitration law, and the Tribunal should decline jurisdiction.

II. GOVERNING LAW

The arbitration agreement is governed by Turkish International Arbitration Law No. 4686 ("TIAL"), as the seat of arbitration is Istanbul, Turkey. Article 4 of TIAL incorporates the UNCITRAL Model Law on International Commercial Arbitration regarding the formal validity of arbitration agreements. Under Article 4(A) of TIAL, an arbitration agreement must be in writing and must be signed by both parties.

III. ARGUMENT

A. The Arbitration Agreement Does Not Satisfy the Writing Requirement

The Charter Party Agreement contains an arbitration clause at Clause 22. However, the clause was incorporated by reference to MSL's standard terms and conditions, which were attached to the email confirmation but not physically signed by MSL. Under Turkish law, an arbitration agreement incorporated by reference to unsigned standard terms does not satisfy the writing requirement of Article 4(A) of TIAL. See Istanbul Court of Appeals, 11th Civil Chamber, Decision No. 2023/1452 (holding that unsigned standard terms do not constitute a valid arbitration agreement).

Turkish law diverges from the approach taken under the New York Convention, where incorporation by reference to standard terms is generally sufficient. This distinction is well-established. The Tribunal should apply the stricter Turkish approach.

B. The Arbitration Agreement Lacks Mutual Consent

Turkish arbitration law additionally requires that the parties' mutual consent to arbitration must be express. Article 4(B) of TIAL provides that the arbitration agreement must clearly reflect the parties' intention to submit disputes to arbitration. The email chain between the parties shows that while Claimant proposed ICC arbitration, MSL did not expressly confirm its agreement to this forum. Silence in response to a proposed arbitration clause does not constitute consent under Turkish law.

C. The Tribunal Should Decline Jurisdiction

For the foregoing reasons, the arbitration agreement does not satisfy the formal validity requirements of Turkish law. The Tribunal should decline jurisdiction and order that any disputes between the parties be resolved in the Turkish Commercial Courts.

IV. CONCLUSION

Respondent respectfully requests that the Tribunal issue an order declining jurisdiction and dismissing the arbitration.`,
    plantedErrors: [
      {
        errorId: 'sc-5-err-1',
        category: 'temporal-error',
        startOffset: 1045,
        endOffset: 1109,
        explanation: 'The brief states that Article 4 of TIAL "incorporates the UNCITRAL Model Law" regarding formal validity. However, Turkish International Arbitration Law No. 4686 was amended by Law No. 7421 in December 2023, which significantly revised the formal validity requirements. Under the amended Article 4(A), arbitration agreements incorporated by reference to electronic communications — including email attachments — are expressly recognized as valid, consistent with the 2006 amendments to the UNCITRAL Model Law Article 7(2). The brief cites the pre-amendment version of TIAL, which is a temporal error. A court or tribunal applying the current law would reject this argument.',
        realWorldParallel: 'This temporal error mirrors the pattern in documented AI failures where models rely on superseded versions of statutes, a particular risk in jurisdictions with recent legislative amendments to arbitration frameworks.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-5-err-2',
        category: 'misrepresented-holding',
        startOffset: 1460,
        endOffset: 1625,
        explanation: 'The brief states that "silence in response to a proposed arbitration clause does not constitute consent under Turkish law." While Turkish law generally requires express consent for arbitration agreements, the brief extrapolates this principle to the specific facts without acknowledging the role of Article 7(5) of the Model Law (as adopted in Turkey), which provides that a reference in a contract to a document containing an arbitration clause constitutes an arbitration agreement in writing, provided the reference is such as to make that clause part of the contract. The characterization of silence as determinative, without addressing the incorporation-by-reference analysis, is an oversimplification that misrepresents the actual legal analysis required.',
        realWorldParallel: 'This confident extrapolation pattern has been documented in AI-drafted arbitration submissions where models assert legal propositions with unwarranted certainty, omitting countervailing authority and analytical nuance.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-5-err-3',
        category: 'false-precision',
        startOffset: 701,
        endOffset: 761,
        explanation: 'The brief cites "Article 4(A) of TIAL" regarding the writing requirement. However, TIAL Article 4 is structured differently. The formal validity requirement is contained in Article 4(1), not Article 4(A). There is no subsection "A" within Article 4 of TIAL. While this may appear a minor formatting error, false precision in statutory citation is professionally dangerous: it can cause a reviewing court or tribunal to doubt the diligence of counsel and can waste time locating non-existent provisions. Moreover, a statutory reference that cannot be verified may mask a more substantive error.',
        realWorldParallel: 'False precision in statutory citation was identified as a recurring error in AI-generated legal documents in the 2024 ABA Legal Technology Survey Report, where models consistently invent subsection designations that do not appear in the actual legislation.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
    ],
  },
  {
    id: 'sc-6',
    title: 'SEC Regulatory Analysis — Digital Asset Custody',
    documentType: 'Regulatory memo',
    practiceArea: 'Financial regulation',
    jurisdiction: 'SEC / US federal',
    complexity: 'Complex',
    aiTaskDescription: 'Analyze the regulatory treatment of digital asset custody services under the Securities Exchange Act of 1934 and SEC rules.',
    assumedRole: 'You are a regulatory associate reviewing this memo before it is provided to a fintech client.',
    professionalStakes: 'The client will make operational and compliance decisions based on this analysis. An error in the characterization of SEC requirements could lead to regulatory enforcement action.',
    document: `CONFIDENTIAL MEMORANDUM

TO:          Compliance Committee
FROM:        Digital Assets Practice Group
RE:          Regulatory Treatment of Digital Asset Custody Services
DATE:        May 1, 2026

I. EXECUTIVE SUMMARY

This memorandum analyses the application of the Securities Exchange Act of 1934 and related SEC rules to the proposed digital asset custody services of Apex Digital Trust, LLC ("ADT"). We conclude that the proposed custody model raises material regulatory considerations under Rule 15c3-3 (the "Customer Protection Rule") and the SEC's 2024 Staff Accounting Bulletin No. 121 (SAB 121).

II. APPLICABLE REGULATORY FRAMEWORK

A. The Customer Protection Rule — 17 C.F.R. § 240.15c3-3

Rule 15c3-3 requires broker-dealers to maintain physical possession or control of customer fully paid securities and excess margin securities. The rule applies to both traditional securities and, as confirmed by SEC Staff guidance in 2023, to digital asset securities. Compliance requires that the broker-dealer either: (a) maintain physical possession of the securities in a manner that protects customer property; or (b) hold the securities through a clearing corporation.

B. SEC Staff Accounting Bulletin No. 121 — SAB 121

SAB 121, issued in March 2022, provides the SEC Staff's view that entities obligated to safeguard crypto-assets for others should record a liability on their balance sheet at the fair value of the crypto-assets and a corresponding asset. The Bulletin applies to all entities that safeguard crypto-assets, including banks, trust companies, and broker-dealers.

The practical effect of SAB 121 is that any entity providing digital asset custody services must maintain capital reserves equal to the full fair value of custodied assets. As of January 2025, approximately seventy-three percent of all entities subject to SAB 121 reporting requirements have failed to maintain the mandated capital reserves. This data is derived from a comprehensive study published in the Harvard Business Review, Q4 2024.

III. ANALYSIS

A. Application of Rule 15c3-3 to ADT's Proposed Model

ADT's proposed custody model involves maintaining customer digital assets in "cold wallet" storage, with private keys held by a qualified custodian. Under the SEC's 2023 Staff Guidance on Digital Asset Securities, cold wallet storage satisfies the control requirement of Rule 15c3-3, provided that the broker-dealer can demonstrate unilateral control over the assets. We recommend that ADT implement a multi-signature arrangement with the qualified custodian to satisfy this requirement.

B. Interaction Between Rule 15c3-3 and SAB 121

Entities subject to both Rule 15c3-3 and SAB 121 face overlapping compliance obligations. Where Rule 15c3-3 requires possession or control of customer assets, SAB 121 requires balance sheet recognition of custodied assets. These requirements are not duplicative. An entity may comply with Rule 15c3-3 through a qualified custodian arrangement while maintaining the balance sheet treatment required under SAB 121.

IV. RECOMMENDATIONS

ADT should proceed with its proposed custody model, subject to the following: (1) implementation of a multi-signature cold wallet arrangement; (2) engagement of a qualified custodian meeting the requirements of Rule 15c3-3; and (3) preparation for balance sheet recognition of custodied assets in accordance with SAB 121.`,
    plantedErrors: [
      {
        errorId: 'sc-6-err-1',
        category: 'false-precision',
        startOffset: 1187,
        endOffset: 1317,
        explanation: 'The memo cites "SEC Staff guidance in 2023" as confirming that Rule 15c3-3 applies to "digital asset securities." This overstates the state of SEC guidance. The SEC Staff issued a Statement on Digital Asset Securities on December 23, 2022, not in 2023. Furthermore, that Staff Statement addressed the application of the federal securities laws to digital assets generally, but did not specifically confirm the application of Rule 15c3-3 to digital asset securities. The precision of a specific year and a specific claimed confirmation by Staff guidance gives the false impression of settled regulatory authority where none exists.',
        realWorldParallel: 'False precision in SEC regulatory analysis has been identified as a recurring error in AI-generated securities law memoranda, where models attribute specific positions to regulators without supporting citations.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-6-err-2',
        category: 'hallucinated-citation',
        startOffset: 1663,
        endOffset: 1903,
        explanation: 'The memo states that "approximately seventy-three percent of all entities subject to SAB 121 reporting requirements have failed to maintain the mandated capital reserves" and attributes this to a "comprehensive study published in the Harvard Business Review, Q4 2024." No such study exists. This is a confident extrapolation — the AI has invented a data point and a scholarly source to support it. In a regulatory memo, invented empirical claims are exceptionally dangerous because they can create reliance on false premises for compliance decisions. Readers should verify all empirical claims independently.',
        realWorldParallel: 'This invented study pattern mirrors documented AI behavior where models generate plausible-sounding but entirely fabricated data, and was identified in multiple expert declarations submitted in litigations involving AI-generated expert reports.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-6-err-3',
        category: 'misrepresented-holding',
        startOffset: 1968,
        endOffset: 2132,
        explanation: 'The memo states that "cold wallet storage satisfies the control requirement of Rule 15c3-3, provided that the broker-dealer can demonstrate unilateral control over the assets." This misrepresents the SEC Staff\'s position. The 2022 SEC Staff Statement on Digital Asset Securities did not conclude that cold wallet storage satisfies Rule 15c3-3. In fact, the Staff Statement identified significant unresolved questions about whether and how broker-dealers can maintain control over digital asset securities for purposes of the Customer Protection Rule. No SEC guidance has confirmed that cold wallet arrangements satisfy Rule 15c3-3, and the issue remains unsettled as a matter of regulatory interpretation.',
        realWorldParallel: 'This misrepresentation of SEC guidance mirrors the analytical errors identified in AI-generated securities law analysis in the SEC\'s 2024 Risk Alert on off-channel communications, where staff noted the risk of over-reliance on AI-generated legal analysis.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
    ],
  },
  {
    id: 'sc-7',
    title: 'Sharma v. Union of India — Privacy Advisory',
    documentType: 'Client advice letter',
    practiceArea: 'Constitutional law',
    jurisdiction: 'India (Supreme Court)',
    complexity: 'Complex',
    aiTaskDescription: 'Draft a client advice letter analysing the constitutional right to privacy under Indian law following the Supreme Court\'s decision in K.S. Puttaswamy v. Union of India.',
    assumedRole: 'You are a litigation associate preparing an advice letter for a technology client on the scope of privacy protections under Indian constitutional law.',
    professionalStakes: 'The client will base its data handling policies on this advice. An inaccurate statement of Indian constitutional law could lead to a significant data breach liability or regulatory penalty.',
    document: `PRIVILEGED AND CONFIDENTIAL
ATTORNEY-CLIENT COMMUNICATION

TO:          Board of Directors, NovaTech India Pvt. Ltd.
FROM:        Legal Counsel
RE:          Constitutional Right to Privacy — Implications for Biometric Data Processing
DATE:        May 15, 2026

Dear Members of the Board,

You have requested our analysis of the constitutional framework governing your proposed biometric data processing operations in India. This letter summarises the current state of Indian constitutional law and provides our assessment of the legal risks.

I. THE CONSTITUTIONAL RIGHT TO PRIVACY

The Supreme Court of India, in Justice K.S. Puttaswamy (Retd.) v. Union of India, (2017) 10 SCC 1, unanimously held that the right to privacy is a fundamental right protected under Article 21 of the Constitution of India. The nine-judge bench established that privacy is an intrinsic part of the right to life and personal liberty and is not subject to the restrictions that apply to other fundamental rights such as freedom of speech under Article 19.

The Puttaswamy framework requires that any state intrusion into privacy must satisfy a threefold test: (1) legality — the intrusion must be authorised by law; (2) legitimate aim — the law must serve a legitimate state interest; and (3) proportionality — the intrusion must be proportionate to the aim pursued.

The right to privacy under Article 21 has been held by the Delhi High Court in Sharma v. Union of India, 2023 SCC OnLine Del 4521, to extend to all biometric data, including facial recognition data, fingerprint data, and behavioural biometrics. The Delhi High Court held that any collection of biometric data by private entities without explicit, informed, and revocable consent constitutes a violation of Article 21.

II. APPLICATION TO BIOMETRIC DATA PROCESSING

The Puttaswamy framework applies not only to state action but also to private entities processing personal data that affects the fundamental rights of individuals. The Supreme Court in Puttaswamy expressly held that Article 21 has horizontal application — meaning that private entities are bound by constitutional obligations when processing personal data that implicates privacy.

The Digital Personal Data Protection Act, 2023 (DPDPA), enacted pursuant to the Puttaswamy framework, codifies certain privacy protections for digital personal data. Section 7 of the DPDPA requires that consent for processing sensitive personal data be explicit, informed, and revocable. Biometric data is classified as sensitive personal data under the DPDPA Rules.

III. RISK ASSESSMENT

Your proposed biometric time-attendance system, which captures fingerprint data of employees, falls within the scope of constitutional protections recognised in Puttaswamy and clarified in Sharma. Based on our analysis, the system raises concerns under the proportionality prong of the Puttaswamy framework, as the collection of biometric data for routine time-attendance purposes may not satisfy the proportionality requirement.

IV. RECOMMENDATIONS

We recommend that NovaTech: (1) obtain explicit, informed, and revocable consent from all employees; (2) conduct a data protection impact assessment; (3) implement data minimisation measures; and (4) provide an alternative non-biometric attendance method.

Please contact us with any questions regarding the above analysis.`,
    plantedErrors: [
      {
        errorId: 'sc-7-err-1',
        category: 'misrepresented-holding',
        startOffset: 735,
        endOffset: 905,
        explanation: 'The letter states that the Puttaswamy court held that privacy "is not subject to the restrictions that apply to other fundamental rights such as freedom of speech under Article 19." This is a direct misrepresentation of the holding. Puttaswamy explicitly held that the right to privacy is subject to reasonable restrictions — specifically, the same limitations that apply to other Article 21 rights. The court did not exempt privacy from Article 19-type restrictions; rather, it held that the threefold test of legality, legitimate aim, and proportionality applies. The letter presents the exact opposite of what the court held.',
        realWorldParallel: 'This pattern of inverting a court\'s holding in AI-generated legal analysis has been documented in multiple jurisdictions, where models generate plausible-sounding but substantively reversed legal propositions.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-7-err-2',
        category: 'hallucinated-citation',
        startOffset: 1070,
        endOffset: 1150,
        explanation: 'Sharma v. Union of India, 2023 SCC OnLine Del 4521 does not exist. No Delhi High Court decision under this docket number addresses biometric data privacy. The proposition attributed to this non-existent case — that any collection of biometric data by private entities without explicit consent violates Article 21 — is also not an accurate statement of Indian law. The Supreme Court in Puttaswamy did not hold that Article 21 applies horizontally to private entities, and no Indian court has established a constitutional tort for biometric data collection by private actors.',
        realWorldParallel: 'This hallucinated Indian case citation follows the same pattern as hallucinated US citations documented in Mata v. Avianca, where AI systems generate entire case names and citation numbers that have no basis in reality.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-7-err-3',
        category: 'misrepresented-holding',
        startOffset: 1447,
        endOffset: 1575,
        explanation: 'The letter states that "the Supreme Court in Puttaswamy expressly held that Article 21 has horizontal application — meaning that private entities are bound by constitutional obligations." This is a confident extrapolation. The Puttaswamy court expressly declined to decide the question of horizontal application of fundamental rights. The majority opinion noted that the question of whether Article 21 applies to private actors was not before the court and expressly left it open. Presenting this unsettled question as settled law is a significant extrapolation that could mislead a client about the scope of constitutional remedies available.',
        realWorldParallel: 'This extrapolation pattern — where an AI model states an unresolved legal question as settled — mirrors errors documented in AI-generated legal memoranda submitted in Indian High Court proceedings.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
    ],
  },
  {
    id: 'sc-8',
    title: 'Multi-Jurisdictional Procedure — Consolidated Analysis',
    documentType: 'Procedural summary',
    practiceArea: 'Civil litigation',
    jurisdiction: 'Multi-jurisdictional (US Federal, UK, Singapore)',
    complexity: 'Multi-jurisdictional',
    aiTaskDescription: 'Prepare a procedural summary comparing pleading standards, discovery obligations, and summary judgment standards across the US federal courts, England and Wales, and Singapore.',
    assumedRole: 'You are a global litigation associate reviewing a multi-jurisdictional procedural reference for a cross-border case team.',
    professionalStakes: 'Partners on three continents will rely on this summary for procedural strategy in a multi-forum dispute. Errors could result in missed deadlines, waived arguments, or sanctions.',
    document: `PROCEDURAL SUMMARY: CROSS-JURISDICTIONAL REFERENCE

Prepared for: Global Case Team — Apex International v. Mediterranean Holdings
Jurisdictions: United States (Federal), England and Wales, Singapore
Date: May 2026

I. PLEADING STANDARDS

A. United States Federal Courts

Federal pleading is governed by Federal Rule of Civil Procedure 8(a), which requires "a short and plain statement of the claim showing that the pleader is entitled to relief." Under Bell Atlantic Corp. v. Twombly, 550 U.S. 544 (2007) and Ashcroft v. Iqbal, 556 U.S. 662 (2009), the plaintiff must plead "enough facts to state a claim to relief that is plausible on its face." This is the "plausibility standard." The plaintiff may plead in the alternative, including inconsistent claims, under Rule 8(d)(2).

B. England and Wales

The Civil Procedure Rules (CPR) require a statement of case that includes "a concise statement of the facts on which the claimant relies." CPR 16.4(1)(a). There is no explicit plausibility requirement comparable to Twombly/Iqbal. However, claims that are "legally incoherent" or "vexatious" may be struck out under CPR 3.4(2)(a). In practice, the English approach remains closer to the pre-Twombly US approach of notice pleading.

C. Singapore

Singapore procedural law is governed by the Rules of Court 2021. Order 38, Rule 2 requires that originating claims be accompanied by a statement of claim containing "the material facts on which the claimant relies." The Singapore Court of Appeal in Vickers v. Pacific Holdings, [2025] SGCA 18, recently clarified that Singapore adopts a "heightened plausibility standard" analogous to the US approach under Iqbal.

D. Summary of Differences

The key distinction is: US and Singapore employ a plausibility threshold for pleadings (Singapore's having been confirmed by Vickers), while England and Wales permit claims that meet the minimum standard of factual coherence.

II. DISCOVERY

A. United States

US discovery under Rules 26-36 is the broadest of the three jurisdictions, permitting discovery of "any nonprivileged matter that is relevant to any party's claim or defense and proportional to the needs of the case." Rule 26(b)(1). The scope includes ESI (electronically stored information), which must be produced in native format unless otherwise stipulated.

B. England and Wales

English disclosure under CPR 31 is more limited. Standard disclosure requires disclosure of documents on which a party relies and documents that adversely affect its own case or support another party's case. The court may order "extended disclosure" under the Disclosure Pilot Scheme in the Business and Property Courts.

C. Singapore

Singapore's discovery regime was significantly narrowed by the Rules of Court 2021. Discovery is now limited to documents that are "necessary" for the fair disposal of the matter. This standard is narrower than both the US and English approaches.

III. SUMMARY JUDGMENT

A. United States

Rule 56 provides for summary judgment where "there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law." The burden is on the moving party.

B. England and Wales

CPR 24.2 permits summary judgment where the claimant has "no real prospect of succeeding" or the defendant has "no real prospect of successfully defending" the claim.

C. Singapore

Order 31 of the Rules of Court 2021 permits summary judgment where the opposing party has "no reasonable prospect of success." The standard is substantively similar to the English approach.`,
    plantedErrors: [
      {
        errorId: 'sc-8-err-1',
        category: 'hallucinated-citation',
        startOffset: 1959,
        endOffset: 2010,
        explanation: 'Vickers v. Pacific Holdings, [2025] SGCA 18, does not exist. No reported Singapore Court of Appeal decision under this name or citation number addresses pleading standards. Singapore does not employ a "heightened plausibility standard" analogous to Iqbal. The Singapore Court of Appeal has consistently followed the approach in the UK, requiring material facts but not a plausibility threshold. See Three Rivers District Council v. Bank of England (No. 3), [2003] 2 AC 1 (HL), which was adopted in Singapore in LBO v. LBP, [2023] SGHC 12.',
        realWorldParallel: 'The fabrication of a Singapore Court of Appeal decision demonstrates that jurisdictional hallucination is not limited to US and UK caselaw — AI systems generate fake authorities across all common law jurisdictions.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-8-err-2',
        category: 'temporal-error',
        startOffset: 2339,
        endOffset: 2466,
        explanation: 'The summary states that standard disclosure under CPR 31 requires disclosure of documents that "adversely affect its own case." However, CPR 31 has been significantly amended by the Disclosure Pilot Scheme, which has been mandatory in the Business and Property Courts since 2022 and has now been extended more broadly. The new regime under CPR 31.5 (as amended in April 2024) requires Extended Disclosure rather than standard disclosure in most cases. The pre-amendment standard disclosure regime described in this summary is outdated.',
        realWorldParallel: 'Temporal errors in UK procedural law have been documented in multiple AI-generated litigation summaries, where models rely on pre-amendment versions of the CPR.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-8-err-3',
        category: 'misrepresented-holding',
        startOffset: 2624,
        endOffset: 2741,
        explanation: 'The summary misrepresents Singapore\'s discovery standard by stating it is "narrower than both the US and English approaches." Under the Rules of Court 2021, Singapore\'s discovery standard requires disclosure of documents that are "necessary" for fair disposal. However, this is applied in practice similarly to the English standard of documents that adversely affect or support a party\'s case. The characterization as "narrower" is a misrepresentation. Furthermore, the discovery regime in the Rules of Court 2021 is supplemented by case-specific court management, meaning the standard is more flexible than the summary implies.',
        realWorldParallel: 'This misrepresentation of comparative procedural law mirrors errors identified in AI-generated cross-border litigation guides, where models incorrectly characterize the relative breadth of different jurisdictions\' discovery regimes.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
      {
        errorId: 'sc-8-err-4',
        category: 'omission-error',
        startOffset: 998,
        endOffset: 1178,
        explanation: 'The summary of US pleading standards omits the important qualification that Federal Rule of Civil Procedure 9(b) imposes a heightened pleading standard for fraud and mistake claims. A cross-jurisdictional reference that fails to note Rule 9(b) is materially incomplete, as it creates the impression that all claims in US federal court are subject only to the Rule 8(a) plausibility standard. This omission is particularly significant in a multi-jurisdictional context where other jurisdictions do not have analogous heightened pleading rules.',
        realWorldParallel: 'This omission of Rule 9(b) in a comparative pleading analysis demonstrates how AI systems frequently omit material jurisdictional-specific qualifications when producing multi-jurisdictional summaries.',
        caveat: 'The legal information in this explanation reflects publicly available sources as of the date of scenario creation.',
      },
    ],
  },
]

export const COMPLEXITY_LEVELS = [
  { id: 'Standard', label: 'Standard', description: '2-3 planted errors with moderate subtlety' },
  { id: 'Complex', label: 'Complex', description: '3 planted errors with greater subtlety and higher stakes' },
  { id: 'Multi-jurisdictional', label: 'Multi-jurisdictional', description: '3-4 planted errors spanning multiple jurisdictions' },
]
