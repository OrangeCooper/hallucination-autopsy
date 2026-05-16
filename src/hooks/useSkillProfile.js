import { useState, useCallback, useEffect } from 'react'
import { getSkillProfile, saveSkillProfile, getSessions, saveSessions } from '../utils/storage'
import { ERROR_CATEGORIES } from '../data/errorCategories'

const EMPTY_PROFILE = {
  totalEncountered: 0,
  totalIdentified: 0,
  sessionsCompleted: 0,
  categories: Object.fromEntries(
    ERROR_CATEGORIES.map(c => [c.id, { encountered: 0, identified: 0 }])
  ),
}

export function useSkillProfile() {
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    setProfile(getSkillProfile() || EMPTY_PROFILE)
    setSessions(getSessions() || [])
  }, [])

  const updateFromSession = useCallback((scenario, matchedAnnotations, plantedErrors, mode, overrides, effectiveIdentified) => {
    const newProfile = { ...profile }
    newProfile.sessionsCompleted += 1
    const identified = effectiveIdentified
      ? new Set(effectiveIdentified)
      : new Set(matchedAnnotations.filter(a => a.matchedErrorId).map(a => a.matchedErrorId))

    if (!effectiveIdentified && overrides) {
      for (const [errorId, action] of Object.entries(overrides)) {
        if (action === 'mark-identified') identified.add(errorId)
        if (action === 'mark-missed') identified.delete(errorId)
      }
    }

    plantedErrors.forEach(e => {
      const cat = newProfile.categories[e.category]
      if (cat) {
        cat.encountered += 1
        if (identified.has(e.errorId)) {
          cat.identified += 1
          newProfile.totalIdentified += 1
        }
        newProfile.totalEncountered += 1
      }
    })

    const falsePositives = matchedAnnotations.filter(a => !a.matchedErrorId).length

    const avgConfidence = matchedAnnotations
      .filter(a => a.matchedErrorId)
      .reduce((sum, a) => sum + (a.confidence || 0), 0) / (identified.size || 1)

    const newSession = {
      date: new Date().toISOString(),
      scenarioTitle: scenario.title,
      scenarioId: scenario.id,
      practiceArea: scenario.practiceArea,
      complexity: scenario.complexity,
      mode: mode || (scenario.isGenerated ? 'generated' : 'static'),
      totalErrors: plantedErrors.length,
      identified: identified.size,
      missed: plantedErrors.length - identified.size,
      falsePositives,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      overrides: overrides || null,
    }

    setProfile(newProfile)
    saveSkillProfile(newProfile)

    const updatedSessions = [newSession, ...sessions]
    setSessions(updatedSessions)
    saveSessions(updatedSessions)

    return newSession
  }, [profile, sessions])

  const resetProfile = useCallback(() => {
    setProfile(EMPTY_PROFILE)
    setSessions([])
    saveSkillProfile(EMPTY_PROFILE)
    saveSessions([])
  }, [])

  return { profile, sessions, updateFromSession, resetProfile }
}
