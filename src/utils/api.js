import { jsonrepair } from 'jsonrepair'

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const MODEL = 'gpt-oss-120b'

async function callOpenRouter(messages, systemPrompt, maxTokens = 1000) {
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
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
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

function buildSemanticAnnotationContext(plantedErrors, userAnnotations) {
  const userMap = new Map()
  userAnnotations.forEach(a => {
    if (a.matchedErrorId) userMap.set(a.matchedErrorId, a)
  })

  return plantedErrors.map(e => {
    return {
      paragraphNumber: e.paragraphNumber || '?',
      errorCategory: e.category.replace(/-/g, ' '),
      result: userMap.has(e.errorId) ? 'Identified' : 'Missed',
    }
  })
}

export async function generateReviewSummary(scenario, userAnnotations, plantedErrors) {
  const systemPrompt = `You are a supervising partner reviewing an associate's supervision of AI-generated legal work.

Do NOT reference internal identifiers, annotation IDs, coordinates, offsets, labels, or technical metadata.

Refer only to:
- document sections,
- legal concepts,
- analytical mistakes,
- professional implications.

Write in professional analytical prose. No exclamation marks. No gamified language.`

  const semanticAnnotations = buildSemanticAnnotationContext(plantedErrors, userAnnotations)
  const userFound = semanticAnnotations.filter(a => a.result === 'Identified').length
  const falsePositives = userAnnotations.filter(a => !a.matchedErrorId).length

  const prompt = `Scenario: ${scenario.title} (${scenario.practiceArea}, ${scenario.jurisdiction})

Planted errors (${plantedErrors.length} total):
${semanticAnnotations.map(a => `- Paragraph ${a.paragraphNumber}: ${a.errorCategory} — ${a.result}`).join('\n')}

The associate identified ${userFound} of ${plantedErrors.length} planted issues and flagged ${falsePositives} passage(s) that were not errors.

Write a brief written review summary (3-5 sentences) in the register of partner-level analytical feedback. Reference specific paragraph numbers and error categories the associate handled well or missed. Reference document context, not internal identifiers.`

  const raw = await callOpenRouter([{ role: 'user', content: prompt }], systemPrompt)
  return sanitizeSummary(raw)
}

export async function generateFollowUpAnswer(errorCategory, explanation, scenarioTitle, userQuestion) {
  const systemPrompt = `You are a legal AI educator explaining a specific type of AI error in legal documents. Be precise and concise. Acknowledge uncertainty where it exists. Do not present your answer as definitive legal advice.`

  const prompt = `The user is reviewing "${scenarioTitle}". An error of type "${errorCategory}" was planted. Explanation: "${explanation}"

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
  'Litigation memo': 'a full inter-office litigation memorandum (400+ words, 3-5 sections: facts, legal standard, argument, conclusion)',
  'Client advisory': 'a client advice letter with formal letterhead, numbered sections, and signature block (400+ words)',
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
  const docTypePrompt = DOC_TYPE_PROMPTS[config.documentType] || 'a realistic legal document (400+ words, multiple sections)'
  const diffConfig = getDifficultyConfig(config.difficulty)
  const useRandom = config.errorCategories.length === 0
  const catList = useRandom
    ? [...ALLOWED_CATEGORIES].sort(() => Math.random() - 0.5).slice(0, diffConfig.errorCount)
    : config.errorCategories

  const systemPrompt = `You are a synthetic legal document generator. You output ONLY valid JSON. No markdown. No code fences. No explanations.

RULES:
- The "category" field MUST be one of: ${[...ALLOWED_CATEGORIES].join(', ')}. No other values allowed.
- Every exactText must appear verbatim in the document.
- exactText: 1 to 3 words only.
- No trailing commas. No markdown. No backticks.
- Document must be 400+ words with multiple paragraphs and sections.
- Paragraphs must be separated by blank lines (double newline). Each paragraph is a discrete unit.
- Every error must be fully contained within a single paragraph.
- Every error MUST be concrete and verifiable against a primary source.
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

Return ONLY this JSON (no markdown, no backticks):
{
  "title": "Short title",
  "practiceArea": "${config.practiceArea}",
  "documentType": "${config.documentType}",
  "difficulty": "${config.difficulty}",
  "jurisdiction": "${config.jurisdiction || 'General'}",
  "document": "Document text with double newlines between paragraphs. 400+ words.",
  "errors": [
    {
      "id": "err-1",
      "category": "hallucinated-citation",
      "paragraphNumber": 4,
      "exactText": "1-3 word phrase",
      "explanation": "2-4 sentences explaining the error and what the correct law actually is",
      "severity": "high"
    }
  ]
}

CRITICAL: Each error's category MUST be one of: ${[...ALLOWED_CATEGORIES].join(', ')}. exactText: 1-3 words, word-for-word in document. paragraphNumber must be integer 1-based. No two errors share a paragraphNumber.
Generate ${catList.length} errors, one per category. Every error must be concretely verifiable against a primary source.`

  let lastError = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const extra = attempt === 1 && lastError
        ? `\n\nPrevious attempt failed: ${lastError}. Fix: category must be one of ${[...ALLOWED_CATEGORIES].join(', ')}. Document must be 400+ words. exactText must be 1-3 words in document. Each error must have a unique paragraphNumber (integer, 1-based).`
        : ''
      const raw = await callOpenRouter(
        [{ role: 'user', content: prompt + extra }],
        systemPrompt,
        2500
      )
      const parsed = extractJSON(raw)

      if (!parsed.document || !parsed.errors || parsed.errors.length === 0) {
        throw new Error('Missing required fields')
      }

      const wordCount = parsed.document.split(/\s+/).length
      if (wordCount < 250) {
        throw new Error(`Document too short: ${wordCount} words (min 250)`)
      }

      const paragraphs = parsed.document.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      const usedParagraphs = new Set()

      for (const err of parsed.errors) {
        if (!ALLOWED_CATEGORIES.has(err.category)) {
          throw new Error(`Invalid category "${err.category}". Must be one of: ${[...ALLOWED_CATEGORIES].join(', ')}`)
        }
        if (!parsed.document.includes(err.exactText)) {
          throw new Error(`exactText "${err.exactText}" not in document`)
        }
        if (err.exactText.split(/\s+/).length > 4) {
          throw new Error(`exactText too long: "${err.exactText}"`)
        }

        const idx = parsed.document.indexOf(err.exactText)

        let actualParaNum = 0
        let charCount = 0
        for (let p = 0; p < paragraphs.length; p++) {
          const paraLen = paragraphs[p].length
          if (idx >= charCount && idx < charCount + paraLen + 2) {
            actualParaNum = p + 1
            break
          }
          charCount += paraLen + 2
        }

        if (actualParaNum === 0) {
          throw new Error(`Could not locate exactText "${err.exactText}" in any paragraph`)
        }

        err.paragraphNumber = actualParaNum

        if (usedParagraphs.has(err.paragraphNumber)) {
          throw new Error(`Duplicate paragraphNumber ${err.paragraphNumber} after correction. Two errors landed in the same paragraph.`)
        }
        usedParagraphs.add(err.paragraphNumber)

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

  throw new Error(lastError || 'Failed after 2 attempts')
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
