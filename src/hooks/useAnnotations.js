import { useState, useCallback } from 'react'

export function useAnnotations() {
  const [annotations, setAnnotations] = useState([])

  const addAnnotation = useCallback((paragraphIndex, paragraphNumber, category, explanation = '') => {
    const ann = {
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      paragraphIndex,
      paragraphNumber,
      category,
      explanation,
      createdAt: Date.now(),
    }
    setAnnotations(prev => [...prev, ann])
    return ann
  }, [])

  const removeAnnotation = useCallback((id) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
  }, [])

  const updateAnnotation = useCallback((id, updates) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }, [])

  const clearAll = useCallback(() => {
    setAnnotations([])
  }, [])

  return { annotations, addAnnotation, removeAnnotation, updateAnnotation, clearAll }
}
