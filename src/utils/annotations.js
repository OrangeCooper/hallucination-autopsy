export function splitIntoParagraphs(text) {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0)
}

export function scoreParagraphAnnotations(annotations, plantedErrors) {
  const errorByParagraph = {}
  plantedErrors.forEach(e => {
    if (e.paragraphNumber) errorByParagraph[e.paragraphNumber] = e
  })

  const matchedAnnotations = annotations.map(ann => {
    const plantedError = errorByParagraph[ann.paragraphNumber]
    if (!plantedError) {
      return { ...ann, matchedErrorId: null, wrongCategory: false, confidence: 0 }
    }
    const wrongCategory = ann.category !== plantedError.category
    return {
      ...ann,
      matchedErrorId: plantedError.errorId,
      wrongCategory,
      confidence: wrongCategory ? 0.5 : 1.0,
    }
  })

  const identifiedErrorIds = new Set(
    matchedAnnotations.filter(a => a.matchedErrorId).map(a => a.matchedErrorId)
  )

  const missedErrors = plantedErrors.filter(e => !identifiedErrorIds.has(e.errorId))

  const falsePositives = matchedAnnotations.filter(a => !a.matchedErrorId)

  return { matchedAnnotations, identifiedErrors: identifiedErrorIds, wrongCategoryErrors: new Set(), missedErrors, falsePositives }
}

export function matchAnnotations(annotations, plantedErrors) {
  return scoreParagraphAnnotations(annotations, plantedErrors)
}

const LEGAL_ENTITY_PATTERNS = [
  { type: 'case-citation', pattern: /[A-Z][a-zA-Z\s.]+v\.[A-Z][a-zA-Z\s.,]+\d+\s+(?:U\.S\.|F\.\d[dhr]|S\.Ct\.|L\.Ed\.\d|F\.Supp\.\d)[^,\s]*/g },
  { type: 'case-name', pattern: /[A-Z][a-zA-Z\s.]+v\.\s*[A-Z][a-zA-Z\s.]+/g },
  { type: 'statute', pattern: /\d+\s+U\.S\.C\.\s+§\s*\d+[a-zA-Z0-9()\-]*/g },
  { type: 'statute-short', pattern: /(?:Section|§)\s*\d+[a-zA-Z()\-]*/g },
  { type: 'rule', pattern: /(?:Rule|Article|Regulation)\s+\d+[a-zA-Z()\-./]*/g },
  { type: 'citation', pattern: /\b\d+\s+[A-Z]\.\s*\d+[a-z]?(?:\s+\(\d+[a-z]?[A-Z][a-z]+\.\s*\d{4}\))?/g },
  { type: 'year', pattern: /\(?\d{4}\)?/g },
]

export function extractLegalEntities(text) {
  const entities = []
  for (const { type, pattern } of LEGAL_ENTITY_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const m of matches) {
      entities.push({
        type,
        text: m[0].trim(),
        start: m.index,
        end: m.index + m[0].length,
      })
    }
  }

  entities.sort((a, b) => {
    const lenDiff = (b.end - b.start) - (a.end - a.start)
    if (lenDiff !== 0) return lenDiff
    const priority = ['case-citation', 'statute', 'rule', 'citation', 'case-name', 'statute-short', 'year']
    return priority.indexOf(a.type) - priority.indexOf(b.type)
  })

  const nonOverlapping = []
  const used = new Set()
  for (const e of entities) {
    const key = `${e.start}-${e.end}`
    if (used.has(key)) continue
    const overlaps = nonOverlapping.some(
      existing => Math.max(existing.start, e.start) < Math.min(existing.end, e.end)
    )
    if (!overlaps) {
      nonOverlapping.push(e)
      used.add(key)
    }
  }

  return nonOverlapping
}

export function suggestRefinedSelection(userText, entities) {
  if (entities.length === 0) return null

  const bestEntity = entities[0]
  if (bestEntity.text.length >= 5 && userText.includes(bestEntity.text)) {
    return bestEntity.text
  }

  return null
}

export function determineDocumentSection(text, offset) {
  const lines = text.split('\n')
  let charCount = 0
  for (const line of lines) {
    if (charCount + line.length > offset) {
      const trimmed = line.trim()
      if (trimmed.length > 0 && trimmed.length < 100 && !trimmed.endsWith('.')) {
        return trimmed
      }
      const prevLine = lines[Math.max(0, lines.indexOf(line) - 1)].trim()
      if (prevLine.length > 0 && prevLine.length < 100) return prevLine
      return `Section at ~${Math.floor(offset / 500) * 500 + 1} characters`
    }
    charCount += line.length + 1
  }
  return 'Document body'
}
