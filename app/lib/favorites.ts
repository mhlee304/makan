const STORAGE_KEY = 'makan_favorites'

export function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function saveFavorites(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage full or unavailable — silent fail
  }
}

export function toggleFavorite(currentIds: string[], recipeId: string): string[] {
  const next = currentIds.includes(recipeId)
    ? currentIds.filter(id => id !== recipeId)
    : [...currentIds, recipeId]
  saveFavorites(next)
  return next
}
