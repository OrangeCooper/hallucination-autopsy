import { useState, useCallback, useEffect } from 'react'
import { getSkillProfile, saveSkillProfile, getSessions, saveSessions } from '../utils/storage'
import { ERROR_CATEGORIES } from '../data/errorCategories'
import { getErrorId, scoreParagraphAnnotations } from '../utils/annotations'

function createEmptyProfile() {
  return {
    totalEncountered: 0,
    totalIdentified: 0,
    sessionsCompleted: 0,
    categories: Object.fromEntries(
      ERROR_CATEGORIES.map(c => [c.id, { encountered: 0, identified: 0 }])
    ),
  }
}

function normalizeMode(mode, scenario) {
  if (mode === 'tutorial') return 'tutorial'
  if (mode === 'static') return 'static'
  if (mode === 'generated' || scenario?.isGenerated) return 'generated'
  return 'static'
}

export function useSkillProfile() {
  const [profile, setProfile] = useState(createEmptyProfile)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    setProfile(getSkillProfile() || createEmptyProfile())
    setSessions(getSessions() || [])
  }, [])

  const updateFromSession = useCallback((scenario, rawAnnotations, plantedErrors, mode, overrides, effectiveIdentified) => {
    const { matchedAnnotations } = scoreParagraphAnnotations(rawAnnotations, plantedErrors)
    const plantedIds = new Set(plantedErrors.map(getErrorId).filter(Boolean))
    const excludedIds = new Set(
      Object.entries(overrides || {})
        .filter(([, action]) => action === 'exclude-error')
        .map(([id]) => id)
    )

    const identified = new Set(
      effectiveIdentified
        ? [...effectiveIdentified].filter(id => plantedIds.has(id) && !excludedIds.has(id))
        : matchedAnnotations.filter(a => plantedIds.has(a.matchedErrorId) && !excludedIds.has(a.matchedErrorId)).map(a => a.matchedErrorId)
    )
    if (!effectiveIdentified && overrides) {
      for (const [errorId, action] of Object.entries(overrides)) {
        if (!plantedIds.has(errorId)) continue
        if (action === 'mark-identified') identified.add(errorId)
        if (action === 'accept-category') identified.add(errorId)
        if (action === 'mark-missed') identified.delete(errorId)
        if (action === 'exclude-error') identified.delete(errorId)
      }
    }

    const newProfile = {
      ...profile,
      categories: Object.fromEntries(
        ERROR_CATEGORIES.map(c => {
          const stats = profile.categories?.[c.id] || { encountered: 0, identified: 0 }
          return [c.id, { ...stats }]
        })
      ),
    }
    newProfile.sessionsCompleted += 1

    const sessionCategories = Object.fromEntries(
      ERROR_CATEGORIES.map(c => [c.id, { encountered: 0, identified: 0 }])
    )

    plantedErrors.forEach(e => {
      const errorId = getErrorId(e)
      if (excludedIds.has(errorId)) return

      const matched = matchedAnnotations.find(a => a.matchedErrorId === errorId)
      const creditedCategory = overrides?.[errorId] === 'accept-category' && matched?.category
        ? matched.category
        : e.category
      const cat = newProfile.categories[creditedCategory]
      if (cat) {
        cat.encountered += 1
        sessionCategories[creditedCategory].encountered += 1
        newProfile.totalEncountered += 1
        if (identified.has(errorId)) {
          cat.identified += 1
          sessionCategories[creditedCategory].identified += 1
          newProfile.totalIdentified += 1
        }
      }
    })

    const promotedFalsePositives = matchedAnnotations.filter(a => !a.matchedErrorId && overrides?.[`fp:${a.id}`] === 'promote-false-positive')
    promotedFalsePositives.forEach(a => {
      const cat = newProfile.categories[a.category]
      if (!cat) return
      cat.encountered += 1
      cat.identified += 1
      sessionCategories[a.category].encountered += 1
      sessionCategories[a.category].identified += 1
      newProfile.totalEncountered += 1
      newProfile.totalIdentified += 1
    })

    const falsePositives = matchedAnnotations.filter(a => !a.matchedErrorId && overrides?.[`fp:${a.id}`] !== 'promote-false-positive').length

    const identifiedAnnotations = matchedAnnotations.filter(a => a.matchedErrorId)
    const sumConfidence = identifiedAnnotations.reduce((sum, a) => sum + (a.confidence || 0), 0)
    const avgConfidence = identifiedAnnotations.length > 0
      ? sumConfidence / identifiedAnnotations.length
      : 0

    const newSession = {
      date: new Date().toISOString(),
      scenarioTitle: scenario.title,
      scenarioId: scenario.id,
      practiceArea: scenario.practiceArea,
      complexity: scenario.complexity,
      mode: normalizeMode(mode, scenario),
      totalErrors: plantedErrors.length - excludedIds.size + promotedFalsePositives.length,
      identified: identified.size + promotedFalsePositives.length,
      missed: plantedErrors.length - excludedIds.size - identified.size,
      falsePositives,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      overrides: overrides || null,
      categories: sessionCategories,
    }

    setProfile(newProfile)
    saveSkillProfile(newProfile)

    const updatedSessions = [newSession, ...sessions]
    setSessions(updatedSessions)
    saveSessions(updatedSessions)

    return newSession
  }, [profile, sessions])

  const resetProfile = useCallback(() => {
    const emptyProfile = createEmptyProfile()
    setProfile(emptyProfile)
    setSessions([])
    saveSkillProfile(emptyProfile)
    saveSessions([])
  }, [])

  return { profile, sessions, updateFromSession, resetProfile }
}
