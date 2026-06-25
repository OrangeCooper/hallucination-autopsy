import { jsonrepair } from 'jsonrepair'
import { getErrorId } from './annotations'

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const MODEL = 'gpt-oss-120b'

let warmedUp = false

export async function warmUpAPI() {
  if (warmedUp || !API_KEY) return
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
      }),
      signal: AbortSignal.timeout(10000),
    })
    warmedUp = true
  } catch {}
}

async function callOpenRouter(messages, systemPrompt, maxTokens = 1000) {
  if (!API_KEY) {
    throw new Error('Missing OpenRouter API key. Set VITE_OPENROUTER_API_KEY before generating scenarios.')
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120000)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hallucination-autopsy.vercel.app',
        'X-Title': 'Hallucination Autopsy',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.2,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API error ${response.status}: ${err}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (Array.isArray(content)) {
      return content.map(part => typeof part === 'string' ? part : part?.text || '').join('\n')
    }
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('AI response did not include text content')
    }
    return content
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('AI generation timed out. Try a simpler configuration or lower difficulty.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

function extractJSON(raw) {
  const trimmed = raw.trim()
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed
  try {
    return JSON.parse(jsonStr)
  } catch {
    try {
      return JSON.parse(jsonrepair(jsonStr))
    } catch {
      const braceMatch = jsonStr.match(/\{[\s\S]*\}/)
      if (braceMatch) {
        try {
          return JSON.parse(jsonrepair(braceMatch[0]))
        } catch {}
      }
      throw new Error('Failed to parse JSON after repair attempts')
    }
  }
}

function firstArray(...values) {
  return values.find(value => Array.isArray(value))
}

function firstString(...values) {
  return values.find(value => typeof value === 'string' && value.trim().length > 0)
}

function normalizeGeneratedScenario(rawParsed, config) {
  const parsed = rawParsed?.scenario || rawParsed?.trainingScenario || rawParsed?.case || rawParsed
  const document = firstString(
    parsed?.document,
    parsed?.documentText,
    parsed?.generatedDocument,
    parsed?.legalDocument,
    parsed?.memo,
    parsed?.content,
    parsed?.text,
  )
  const errors = firstArray(
    parsed?.errors,
    parsed?.plantedErrors,
    parsed?.planted_errors,
    parsed?.issues,
    parsed?.hallucinations,
    parsed?.answerKey,
    parsed?.answer_key,
  )

  const missing = []
  if (!document) missing.push('document')
  if (!errors || errors.length === 0) missing.push('errors')
  if (missing.length > 0) {
    const topLevelKeys = rawParsed && typeof rawParsed === 'object' ? Object.keys(rawParsed).join(', ') : 'none'
    const nestedKeys = parsed && parsed !== rawParsed && typeof parsed === 'object' ? Object.keys(parsed).join(', ') : ''
    throw new Error(`Missing required field(s): ${missing.join(', ')}. Received top-level keys: ${topLevelKeys}${nestedKeys ? `; nested keys: ${nestedKeys}` : ''}`)
  }

  return {
    title: firstString(parsed.title, parsed.name, parsed.scenarioTitle) || `${parsed.practiceArea || config.practiceArea} - ${parsed.documentType || config.documentType}`,
    practiceArea: firstString(parsed.practiceArea, parsed.areaOfLaw, parsed.area, parsed.practice_area) || config.practiceArea,
    documentType: firstString(parsed.documentType, parsed.type, parsed.document_type) || config.documentType,
    difficulty: firstString(parsed.difficulty, parsed.complexity) || config.difficulty,
    jurisdiction: firstString(parsed.jurisdiction, parsed.legalSystem) || config.jurisdiction || 'General',
    aiTaskDescription: firstString(parsed.aiTaskDescription, parsed.taskDescription, parsed.ai_task_description),
    assumedRole: firstString(parsed.assumedRole, parsed.reviewerRole, parsed.assumed_role),
    professionalStakes: firstString(parsed.professionalStakes, parsed.stakes, parsed.professional_stakes),
    document,
    errors,
  }
}

function normalizeGeneratedError(rawError, index) {
  return {
    ...rawError,
    errorId: getErrorId(rawError) || rawError?.error_id || rawError?.errorID || `err-${index + 1}`,
    category: rawError?.category || rawError?.errorCategory || rawError?.type,
    paragraphNumber: Number(rawError?.paragraphNumber ?? rawError?.paragraph ?? rawError?.paragraph_number),
    exactText: firstString(rawError?.exactText, rawError?.exact_text, rawError?.text, rawError?.phrase, rawError?.span),
    explanation: firstString(rawError?.explanation, rawError?.rationale, rawError?.reason) || 'No explanation provided.',
    severity: rawError?.severity || 'medium',
  }
}

const CATEGORY_ALIASES = {
  hallucinatedcitation: 'hallucinated-citation',
  hallucinatedcase: 'hallucinated-citation',
  fabricatedcitation: 'hallucinated-citation',
  fakecitation: 'hallucinated-citation',
  misrepresentedholding: 'misrepresented-holding',
  misstatedholding: 'misrepresented-holding',
  wrongholding: 'misrepresented-holding',
  jurisdictionaldrift: 'jurisdictional-drift',
  wrongjurisdiction: 'jurisdictional-drift',
  jurisdictiondrift: 'jurisdictional-drift',
  temporalerror: 'temporal-error',
  outdatedlaw: 'temporal-error',
  outdatedauthority: 'temporal-error',
  falseprecision: 'false-precision',
  overprecision: 'false-precision',
  unsupportedprecision: 'false-precision',
  omissionerror: 'omission-error',
  materialomission: 'omission-error',
}

function normalizeCategory(category) {
  if (!category) return category
  const slug = String(category).trim().toLowerCase().replace(/[_\s]+/g, '-')
  if (ALLOWED_CATEGORIES.has(slug)) return slug
  const compact = slug.replace(/[^a-z]/g, '')
  return CATEGORY_ALIASES[compact] || slug
}

function findExactTextInDocument(documentText, exactText) {
  if (!exactText) return null
  const directIndex = documentText.indexOf(exactText)
  if (directIndex >= 0) return { text: exactText, index: directIndex }

  const escaped = exactText
    .trim()
    .split(/\s+/)
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+')
    .replace(/["“”]/g, '["“”]')
    .replace(/['‘’]/g, "['‘’]")
  const match = documentText.match(new RegExp(escaped, 'i'))
  if (!match || match.index == null) return null
  return { text: documentText.slice(match.index, match.index + match[0].length), index: match.index }
}

const ID_PATTERNS = [
  /\b\d{3,}[A-Z]\b/g,
  /annotation[_-]?[0-9]+/gi,
  /offset[:_]\s*\d+/gi,
]

function sanitizeSummary(text) {
  let clean = text
  for (const pattern of ID_PATTERNS) {
    clean = clean.replace(pattern, '')
  }
  clean = clean.replace(/\s{2,}/g, ' ').trim()
  return clean
}

function buildSemanticAnnotationContext(plantedErrors, userAnnotations, overrides = {}) {
  const userMap = new Map()
  userAnnotations.forEach(a => {
    if (a.matchedErrorId) userMap.set(a.matchedErrorId, a)
  })

  return plantedErrors.map(e => {
    const errorId = getErrorId(e)
    const ann = userMap.get(errorId)
    const override = overrides[errorId]

    let result
    if (override === 'mark-missed') {
      result = 'Missed (reviewer manually marked as missed)'
    } else if (override === 'mark-identified') {
      result = 'Identified (reviewer manually marked as identified)'
    } else if (override === 'accept-category') {
      result = 'Identified (reviewer manually accepted their chosen category)'
    } else if (override === 'exclude-error') {
      result = 'Excluded (reviewer marked the planted issue as not a real error)'
    } else if (ann?.overrideResult === 'missed') {
      result = 'Missed (reviewer manually marked as missed)'
    } else if (ann?.overrideResult === 'identified') {
      result = 'Identified (reviewer manually marked as identified)'
    } else if (ann?.overrideResult === 'accepted-category') {
      result = 'Identified (reviewer manually accepted their chosen category)'
    } else if (ann?.overrideResult === 'excluded') {
      result = 'Excluded (reviewer marked the planted issue as not a real error)'
    } else if (ann) {
      result = ann.wrongCategory ? 'Identified (wrong category)' : 'Identified'
    } else {
      result = 'Missed'
    }

    return {
      paragraphNumber: e.paragraphNumber || '?',
      errorCategory: e.category.replace(/-/g, ' '),
      result,
    }
  })
}

export async function generateReviewSummary(scenario, userAnnotations, plantedErrors, rawAnnotations, overrides = {}) {
  const systemPrompt = `You are a supervising partner reviewing an associate's supervision of AI-generated legal work.

CRITICAL — The "error category" labels below (e.g. "hallucinated citation", "misrepresented holding", "omission error", "false precision", "temporal error", "jurisdictional drift") are CLASSIFICATION LABELS for planted training errors. They are NOT headings, titles, or content from the document being reviewed. Never refer to an error category as if it were a paragraph heading or document section title.

Do NOT reference internal identifiers, annotation IDs, coordinates, offsets, labels, or technical metadata.

Refer only to:
- document sections,
- legal concepts,
- analytical mistakes,
- professional implications.

Write in professional analytical prose. No exclamation marks. No gamified language.`

  const semanticAnnotations = buildSemanticAnnotationContext(plantedErrors, userAnnotations, overrides)
  const userFound = semanticAnnotations.filter(a => a.result.startsWith('Identified')).length
  const correctCat = semanticAnnotations.filter(a => a.result === 'Identified').length
  const wrongCat = semanticAnnotations.filter(a => a.result === 'Identified (wrong category)').length
  const trueMissed = semanticAnnotations.filter(a => a.result === 'Missed').length
  const overrideIdentified = semanticAnnotations.filter(a => a.result.includes('manually marked as identified')).length
  const overrideMissed = semanticAnnotations.filter(a => a.result.includes('manually marked as missed')).length
  const overrideCategoryAccepted = semanticAnnotations.filter(a => a.result.includes('accepted their chosen category')).length
  const overrideExcluded = semanticAnnotations.filter(a => a.result.startsWith('Excluded')).length
  const promotedFalsePositives = userAnnotations.filter(a => a.overrideResult === 'promoted-false-positive').length
  const falsePositives = userAnnotations.filter(a => !a.matchedErrorId && a.overrideResult !== 'promoted-false-positive').length

  const seen = new Set()
  const userNoteEntries = []

  for (const a of (userAnnotations || [])) {
    if (!a.explanation) continue
    const key = `${a.paragraphNumber}|${a.explanation}`
    if (seen.has(key)) continue
    seen.add(key)
    const err = a.matchedErrorId ? plantedErrors.find(e => getErrorId(e) === a.matchedErrorId) : null
    if (err) {
      let status
      if (a.overrideResult === 'missed') status = 'reviewer manually marked missed'
      else if (a.overrideResult === 'identified') status = 'reviewer manually marked identified'
      else if (a.overrideResult === 'accepted-category') status = 'reviewer manually accepted their chosen category'
      else if (a.overrideResult === 'excluded') status = 'reviewer marked this planted issue as not a real error'
      else if (err.category === a.category) status = 'correctly identified'
      else status = 'wrong category'
      userNoteEntries.push(`- Paragraph ${a.paragraphNumber} [error: ${err.category.replace(/-/g, ' ')}, status: ${status}] associate wrote: "${a.explanation}"`)
    } else {
      const status = a.overrideResult === 'promoted-false-positive'
        ? 'reviewer manually accepted this as a valid issue'
        : 'not a planted error'
      userNoteEntries.push(`- Paragraph ${a.paragraphNumber} [${status}] associate wrote: "${a.explanation}"`)
    }
  }

  for (const a of (rawAnnotations || [])) {
    if (!a.explanation) continue
    const key = `${a.paragraphNumber}|${a.explanation}`
    if (seen.has(key)) continue
    seen.add(key)
    const err = plantedErrors.find(e => e.paragraphNumber === a.paragraphNumber)
    if (err) {
      userNoteEntries.push(`- Paragraph ${a.paragraphNumber} [error: ${err.category.replace(/-/g, ' ')}] associate wrote: "${a.explanation}"`)
    } else {
      userNoteEntries.push(`- Paragraph ${a.paragraphNumber} [not a planted error] associate wrote: "${a.explanation}"`)
    }
  }

  const userDescriptions = userNoteEntries.join('\n')

  const overrideEntries = Object.entries(overrides)
    .filter(([, action]) => action === 'mark-identified' || action === 'mark-missed' || action === 'accept-category' || action === 'exclude-error' || action === 'promote-false-positive')
    .map(([errorId, action]) => {
      if (errorId.startsWith('fp:')) {
        return `- User-flagged non-planted passage [manual override → ${action === 'promote-false-positive' ? 'accepted as valid issue' : action}]`
      }
      const err = plantedErrors.find(e => getErrorId(e) === errorId)
      if (!err) return ''
      const label = action === 'mark-identified'
        ? 'identified'
        : action === 'mark-missed'
          ? 'missed'
          : action === 'accept-category'
            ? 'category accepted'
            : 'excluded as not a real error'
      return `- Paragraph ${err.paragraphNumber} [error: ${err.category.replace(/-/g, ' ')}, manual override → ${label}]`
    })
    .filter(Boolean)

  const prompt = `Scenario: ${scenario.title} (${scenario.practiceArea}, ${scenario.jurisdiction})

Planted errors (${plantedErrors.length} total):
${semanticAnnotations.map(a => `- Para ${a.paragraphNumber} | error classification: [${a.errorCategory}] → user result: ${a.result}`).join('\n')}

Breakdown: ${correctCat} correctly identified (correct error category), ${wrongCat} identified but wrong category, ${trueMissed} missed entirely, ${overrideCategoryAccepted} category override(s) accepted, ${overrideExcluded} planted issue(s) excluded as not real errors${overrideIdentified > 0 || overrideMissed > 0 ? ` (${overrideIdentified} overridden to identified, ${overrideMissed} overridden to missed)` : ''}. The associate also flagged ${falsePositives} passage(s) that were not planted errors and ${promotedFalsePositives} non-planted passage(s) manually accepted as valid issues.${overrideEntries.length > 0 ? `\n\nManual overrides applied:\n${overrideEntries.join('\n')}` : ''}

THE ASSOCIATE'S OWN NOTES FOR EACH FLAGGED PASSAGE:
${userDescriptions || '(The associate did not leave any notes.)'}

Write a brief written review summary (3-5 sentences) in the register of partner-level analytical feedback. YOU MUST:
1. Quote or reference what the associate wrote in their notes and respond to their specific reasoning.
2. When the assessment for an error is "Identified" (the associate flagged the correct paragraph AND assigned the correct error category), explicitly acknowledge that they correctly identified both the error and its type.
3. When the assessment is "Identified (wrong category)", note that while they found the error, they assigned the wrong error category — treat this as partial recognition but flag the category gap.
4. When the assessment indicates the associate overrode the result manually, factor this into your assessment of their judgment.
5. Where the associate assigned the wrong error category, note this as a category recognition issue.
6. If a planted issue was excluded as not a real error or a non-planted passage was accepted as valid, describe that as a reviewer override rather than treating the original ground truth as absolute.
Reference specific paragraph numbers and error categories. Do NOT reference internal identifiers.`

  const raw = await callOpenRouter([{ role: 'user', content: prompt }], systemPrompt)
  return sanitizeSummary(raw)
}

export async function generateFollowUpAnswer(errorCategory, explanation, scenarioTitle, userQuestion, conversationHistory = []) {
  const systemPrompt = `You are a legal AI educator explaining a specific type of AI error in legal documents. Be precise and concise. Acknowledge uncertainty where it exists. Do not present your answer as definitive legal advice.`

  const historyContext = conversationHistory.length > 0
    ? `Previous conversation:\n${conversationHistory.map(m => `${m.role}: ${m.text}`).join('\n')}\n\n`
    : ''

  const prompt = `${historyContext}The user is reviewing "${scenarioTitle}". An error of type "${errorCategory}" was planted. Explanation: "${explanation}"

The user asks: "${userQuestion}"

Provide a concise, accurate response. Maximum 4 sentences.`

  const raw = await callOpenRouter([{ role: 'user', content: prompt }], systemPrompt)
  return sanitizeSummary(raw)
}

export async function generateSkillDevelopmentAdvice(profile) {
  const systemPrompt = `You are a legal training advisor. Review this lawyer's error detection history and provide brief, specific, actionable development advice. Maximum 3 sentences. Do not use motivational language. Do not use exclamation marks.`

  const entries = Object.entries(profile.categories || {})
    .filter(([, v]) => v.encountered > 0)
    .sort((a, b) => (a[1].identified / a[1].encountered) - (b[1].identified / b[1].encountered))

  const weakest = entries.slice(0, 2).map(([id]) => id.replace(/-/g, ' '))
  const strongest = entries.slice(-1).map(([id]) => id.replace(/-/g, ' '))

  const prompt = `The lawyer has a cumulative detection rate of ${profile.totalIdentified}/${profile.totalEncountered} errors across ${profile.sessionsCompleted} sessions.

Most consistent categories: ${strongest.join(', ') || 'none yet'}.
Least consistent categories: ${weakest.join(', ') || 'none yet'}.

Provide brief, specific development advice referencing areas of law or document types that would help address the weaker categories. No motivational language. Maximum 3 sentences.`

  const raw = await callOpenRouter([{ role: 'user', content: prompt }], systemPrompt)
  return sanitizeSummary(raw)
}

const ALLOWED_CATEGORIES = new Set([
  'hallucinated-citation',
  'misrepresented-holding',
  'jurisdictional-drift',
  'temporal-error',
  'false-precision',
  'omission-error',
])

const DOC_TYPE_PROMPTS = {
  'Litigation memo': 'a full inter-office litigation memorandum (350+ words, 3-5 sections: facts, legal standard, argument, conclusion)',
  'Client advisory': 'a client advice letter with formal letterhead, numbered sections, and signature block (350+ words)',
  'Contract clause': 'a detailed contractual provision with subsections, definitions, and conditions',
  'Compliance checklist': 'a structured compliance checklist with numbered items, citations, and regulatory references',
  'Arbitration brief': 'a formal arbitration submission with statement of facts, legal arguments, and prayer for relief',
  'Motion draft': 'a court motion with notice of motion, certificate of service, and supporting memorandum of law',
  'Opinion letter': 'a formal legal opinion with background, assumptions, analysis, and conclusion',
  'Research memo': 'a legal research memorandum with issue, brief answer, facts, discussion, and recommendation',
}

function getDifficultyConfig(difficulty) {
  switch (difficulty) {
    case 'Standard':
      return { errorCount: 3, subtlety: `ERROR SUBTLETY: Standard. Errors are reasonably detectable to a trained legal eye. Fabricated citations should use slightly implausible docket numbers or years (e.g. a case number that does not match the reporter's publication year). The error is in a specific verifiable detail.`, preference: `PREFER: hallucinated citations (fabricated but professionally styled case names) and false precision (wrong but close section numbers).` }
    case 'Complex':
      return { errorCount: 3, subtlety: `ERROR SUBTLETY: Complex. Errors are harder to spot. Fabricated citations must use realistic litigant names (surnames of real attorneys, plausible corporate names, actual government agencies). The error should rely on the reader knowing the actual law rather than spotting an invented party name.`, preference: `PREFER: omission errors (missing carve-outs in otherwise accurate statements), misrepresented holdings (subtly wrong description of a real case's holding), and jurisdictional drift (applying a different jurisdiction's rule).` }
    case 'Multi-jurisdictional':
      return { errorCount: 4, subtlety: `ERROR SUBTLETY: Multi-jurisdictional. The document spans multiple legal systems. At least one error must involve cross-jurisdictional confusion (e.g. applying UK pleading standards in a US federal analysis). Fabricated citations must be plausible within their claimed jurisdiction's citation format and naming conventions.`, preference: `PREFER: jurisdictional drift and misrepresented holdings. At least one error must cite the law of a different jurisdiction as if it were binding.` }
    case 'Adversarial':
      return { errorCount: 4, subtlety: `ERROR SUBTLETY: Adversarial — hardest level. Errors should be difficult to detect even for an experienced practitioner. Fabricated citations should be virtually indistinguishable from real ones on superficial review: use real-sounding party names, correct citation formats, and plausible years. The exactText should be a short common word or standard legal phrase that is subtly wrong in context, not a obviously suspicious name.`, preference: `PREFER: omission errors, false precision, and misrepresented holdings — categories that do not rely on invented party names but on subtle inaccuracies in otherwise correct-looking passages.` }
    default:
      return { errorCount: 3, subtlety: '', preference: '' }
  }
}

export async function generateScenario(config) {
  const docTypePrompt = DOC_TYPE_PROMPTS[config.documentType] || 'a realistic legal document (350+ words, multiple sections)'
  const diffConfig = getDifficultyConfig(config.difficulty)
  const requestedCategories = Array.isArray(config.errorCategories) ? config.errorCategories : []
  const useRandom = requestedCategories.length === 0
  let catList = useRandom
    ? [...ALLOWED_CATEGORIES].sort(() => Math.random() - 0.5).slice(0, diffConfig.errorCount)
    : requestedCategories.filter(category => ALLOWED_CATEGORIES.has(category))
  if (catList.length === 0) {
    catList = [...ALLOWED_CATEGORIES].sort(() => Math.random() - 0.5).slice(0, diffConfig.errorCount)
  }

  const systemPrompt = `You are a synthetic legal document generator. You output ONLY valid JSON. No markdown. No code fences. No explanations.

RULES:
- The "category" field MUST be one of: ${[...ALLOWED_CATEGORIES].join(', ')}. No other values allowed.
- Every exactText must appear verbatim in the document.
- exactText: 1 to 3 words only.
- No trailing commas. No markdown. No backticks.
- Document must be 350+ words with multiple paragraphs and sections.
- Paragraphs must be separated by blank lines (double newline). Each paragraph is a discrete unit.
- Every error must be fully contained within a single paragraph.
- Every error MUST be concrete and verifiable against a primary source.
- The document must contain ONLY the requested planted errors. All other legal propositions, citations, dates, jurisdictional references, and statistics must be accurate and internally consistent.
- Non-error paragraphs must not contain fabricated citations, unsupported precise numbers, outdated law, wrong jurisdiction law, omitted controlling exceptions, or misstated holdings.
- Do not create ambiguous "maybe wrong" passages outside the listed errors. If a reasonable reviewer would flag a passage, it must be one of the returned errors.
- AVOID temporal errors based on missing dates — use actual superseded statutes or overruled cases instead.

FABRICATED CITATION RULES — CRITICAL:
- A fabricated error citation (the planted hallucination) must use realistic litigant names: real surnames of attorneys, plausible corporate names (using standard suffixes like "Inc.", "LLC", "Co."), actual government agencies, or real place names. NEVER use "Doe", "ABC", "XYZ", "M/s", "John Doe", "Jane Roe", "State", "Corporation" alone, or any obvious placeholder.
- The error must lie in a specific verifiable detail: the wrong volume number for the year, a reporter that does not exist for that court, a section number that does not correspond to the cited statute, a case year that does not match the docket numbering convention, or a holding that does not match the cited case.
- Real case names in non-error paragraphs must be genuine, well-known cases from the jurisdiction.`

  const prompt = `Generate a legal training scenario.

Parameters:
- Practice Area: ${config.practiceArea}
- Document Type: ${config.documentType}
- Jurisdiction: ${config.jurisdiction || 'General'}
- Difficulty: ${config.difficulty}
- Error Categories: ${catList.join(', ')}

The document must be ${docTypePrompt}.
Jurisdiction: ${config.jurisdiction || 'General'}. All legal citations must be from this jurisdiction.

Use realistic legal formatting: section headings, citations, party names, dates.

${diffConfig.subtlety}

${diffConfig.preference}

FABRICATED CITATION QUALITY:
- Every fabricated citation must be professionally styled and structurally indistinguishable from a real citation on first glance.
- Use realistic party names: e.g. "Bradford v. Pacific Northwest Utilities, 127 F.4th 892 (9th Cir. 2025)" — real-sounding surname, realistic corporate name, plausible docket number, proper Bluebook format.
- NEVER use placeholder names (Doe, Roe, ABC, XYZ, M/s). The fabricated case name must look like it could be a real pending or recently decided case.
- For hallucinated-citation errors, the exactText should be a specific part of the citation that is wrong (e.g. "F.4th 892" when that volume does not exist yet, or "9th Cir." when the case was actually from a different circuit).
- In non-error paragraphs, use only genuine well-known cases that a lawyer in the jurisdiction would recognize.

PARAGRAPH STRUCTURE:
- Separate paragraphs with blank lines (double newline). Count them carefully.
- Each paragraph must contain a discrete unit of legal analysis or information.
- Paragraphs should not be explicitly numbered in the document text.
- Ensure enough paragraphs exist that error paragraphs are not obvious by elimination.

ERROR REQUIREMENTS:
- Each error must be CONCRETE and VERIFIABLE against a primary source.
- Fully contained within a single paragraph.
- Every error in a distinct paragraph — unique paragraphNumber per error.
- After writing, verify paragraphNumber accuracy by splitting on blank lines.
- Before returning JSON, audit every paragraph that is NOT listed in errors and make it legally accurate, jurisdictionally consistent, current, and free of suspicious precise claims.
- Include no decoy errors. The reviewer should not be rewarded for flagging any paragraph outside the returned errors array.
- For every returned error, the explanation must identify why the flagged text is wrong, what the correct legal source or rule is, and why the surrounding non-error text should not itself be treated as an error.

Return ONLY this JSON (no markdown, no backticks):
{
  "title": "Short title",
  "practiceArea": "${config.practiceArea}",
  "documentType": "${config.documentType}",
  "difficulty": "${config.difficulty}",
  "jurisdiction": "${config.jurisdiction || 'General'}",
  "aiTaskDescription": "2-3 sentences. What the AI was asked to do: describe the specific legal task, document purpose, and the analytical work required. Must reference the practice area, document type, and jurisdiction.",
  "assumedRole": "1-2 sentences. The reviewer's role in this context. E.g. 'You are a second-year litigation associate asked to verify a motion memo before filing in the Northern District of California.' Must reference the practice area and document type.",
  "professionalStakes": "1-2 sentences. What is at stake if errors go undetected. Must be concrete and specific to the practice area, e.g. financial exposure, precedential harm, regulatory penalty, or client detriment.",
  "document": "Document text with double newlines between paragraphs. 350+ words.",
  "errors": [
    {
      "errorId": "err-1",
      "category": "hallucinated-citation",
      "paragraphNumber": 4,
      "exactText": "1-3 word phrase",
      "explanation": "3-5 sentences explaining the error, the correct law or source, and why nearby non-error text should not be treated as erroneous",
      "severity": "high"
    }
  ]
}

CRITICAL: Each error's category MUST be one of: ${[...ALLOWED_CATEGORIES].join(', ')}. exactText: 1-3 words, word-for-word in document. paragraphNumber must be integer 1-based. No two errors share a paragraphNumber. No paragraph outside the errors array may contain an intentional or likely legal error.
Generate ${catList.length} errors, one per category. Every error must be concretely verifiable against a primary source.`

  let lastError = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const extra = attempt === 1 && lastError
        ? `\n\nPrevious attempt failed: ${lastError}. Return a single JSON object with required top-level fields: title, practiceArea, documentType, jurisdiction, document, errors. The errors field must be a non-empty array. Fix: category must be one of ${[...ALLOWED_CATEGORIES].join(', ')}. Document must be 350+ words. exactText must be 1-3 words in document. Each error must have a unique paragraphNumber (integer, 1-based).`
        : attempt === 2 && lastError
          ? `\n\nPrevious attempts failed: ${lastError}. Use the simplest valid JSON shape now. Do not nest the result. Do not use markdown. Required keys: {"title":"...","practiceArea":"...","documentType":"...","jurisdiction":"...","document":"...","errors":[{"errorId":"err-1","category":"${catList[0] || 'hallucinated-citation'}","paragraphNumber":2,"exactText":"short phrase","explanation":"..."}]}.`
        : ''
      const raw = await callOpenRouter(
        [{ role: 'user', content: prompt + extra }],
        systemPrompt,
        1000
      )
      const parsed = normalizeGeneratedScenario(extractJSON(raw), config)

      if (!parsed.aiTaskDescription) {
        parsed.aiTaskDescription = `The AI was asked to draft a ${parsed.documentType || config.documentType} addressing ${parsed.practiceArea || config.practiceArea} law under ${parsed.jurisdiction || config.jurisdiction || 'the relevant jurisdiction'}.`
      }
      if (!parsed.assumedRole) {
        parsed.assumedRole = `You are reviewing an AI-generated ${parsed.documentType || config.documentType} for accuracy in the area of ${parsed.practiceArea || config.practiceArea} law.`
      }
      if (!parsed.professionalStakes) {
        parsed.professionalStakes = `Errors in this document could lead to incorrect legal advice, adverse rulings, or professional liability.`
      }

      const wordCount = parsed.document.split(/\s+/).length
      if (wordCount < 220) {
        throw new Error(`Document too short: ${wordCount} words (min 220)`)
      }

      const paragraphs = parsed.document.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      if (paragraphs.length < Math.max(4, parsed.errors.length + 1)) {
        throw new Error(`Document needs more paragraphs; received ${paragraphs.length}`)
      }
      const usedParagraphs = new Set()

      parsed.errors = parsed.errors.map(normalizeGeneratedError)

      for (const [index, err] of parsed.errors.entries()) {
        delete err.id
        err.category = normalizeCategory(err.category)

        if (!ALLOWED_CATEGORIES.has(err.category)) {
          throw new Error(`Invalid category "${err.category}". Must be one of: ${[...ALLOWED_CATEGORIES].join(', ')}`)
        }
        const textMatch = findExactTextInDocument(parsed.document, err.exactText)
        if (!textMatch) {
          throw new Error(`exactText "${err.exactText}" not in document`)
        }
        err.exactText = textMatch.text
        if (err.exactText.split(/\s+/).length > 3) {
          throw new Error(`exactText too long: "${err.exactText}"`)
        }

        const claimedParaIndex = Number.isInteger(err.paragraphNumber) ? err.paragraphNumber - 1 : -1
        let actualParaNum = 0
        if (claimedParaIndex >= 0 && paragraphs[claimedParaIndex]?.includes(err.exactText)) {
          actualParaNum = claimedParaIndex + 1
        } else {
          const matchingParagraphs = paragraphs
            .map((paragraph, index) => paragraph.includes(err.exactText) ? index + 1 : null)
            .filter(Boolean)

          if (matchingParagraphs.length === 1) {
            actualParaNum = matchingParagraphs[0]
          } else if (matchingParagraphs.length > 1) {
            throw new Error(`exactText "${err.exactText}" appears in multiple paragraphs; choose more distinctive exactText`)
          } else {
            throw new Error(`Could not locate exactText "${err.exactText}" in any paragraph`)
          }
        }

        err.paragraphNumber = actualParaNum

        if (usedParagraphs.has(err.paragraphNumber)) {
          throw new Error(`Duplicate paragraphNumber ${err.paragraphNumber} after correction. Two errors landed in the same paragraph.`)
        }
        usedParagraphs.add(err.paragraphNumber)

        const paragraphStart = parsed.document.indexOf(paragraphs[actualParaNum - 1])
        const idx = paragraphStart + paragraphs[actualParaNum - 1].indexOf(err.exactText)
        err.startOffset = idx
        err.endOffset = idx + err.exactText.length
        err.correctLaw = err.correctLaw || ''
        err.realWorldParallel = err.realWorldParallel || ''
        err.caveat = 'This explanation was AI-generated for a synthetic training scenario.'
      }

      return parsed
    } catch (err) {
      lastError = err.message
    }
  }

  throw new Error(lastError || 'Failed after 3 attempts')
}

export async function generateRecommendation(profile, sessions) {
  const systemPrompt = `You are a legal training advisor generating a practice recommendation. Be specific, concise, and analytical. Maximum 4 sentences. No motivational language.`

  const entries = Object.entries(profile.categories || {})
    .filter(([, v]) => v.encountered > 0)
    .sort((a, b) => (a[1].identified / a[1].encountered) - (b[1].identified / b[1].encountered))

  const weakest = entries.slice(0, 2).map(([id]) => id.replace(/-/g, ' '))

  const prompt = `The lawyer has completed ${profile.sessionsCompleted} sessions.

Weakest categories: ${weakest.join(', ') || 'none yet identified'}.

Recommend the next exercise: practice area, document type, complexity, and which error types to focus on. Be specific. Maximum 4 sentences.`

  const raw = await callOpenRouter([{ role: 'user', content: prompt }], systemPrompt)
  return sanitizeSummary(raw)
}
