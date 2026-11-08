import { Recipe, Slot } from '@/app/types/recipe'
import { RECIPES } from '@/app/lib/data/recipes'

function scoreCandidate(candidate: Recipe, currentCollection: Recipe[]): number {
  if (currentCollection.length === 0) return 0

  let score = 0

  const usedCuisines = new Set(currentCollection.map(r => r.cuisine))
  const usedProteins = new Set(currentCollection.map(r => r.protein))
  const usedFlavors = new Set(currentCollection.flatMap(r => r.flavorProfile))
  const currentIngredientNames = new Set(
    currentCollection.flatMap(r => r.ingredients.map(i => i.name.toLowerCase()))
  )
  const times = currentCollection.map(r => r.prepTime + r.cookTime)
  const candidateTime = candidate.prepTime + candidate.cookTime

  // Cuisine diversity (highest weight)
  if (!usedCuisines.has(candidate.cuisine)) score += 3

  // Protein diversity
  if (!usedProteins.has(candidate.protein)) score += 2

  // Flavor profile diversity — each new flavor dimension adds a bit
  const newFlavors = candidate.flavorProfile.filter(f => !usedFlavors.has(f))
  score += newFlavors.length * 1.5

  // Time balance — if the current collection is skewed to very long or very short, nudge the other way
  const longRatio = times.filter(t => t > 90).length / times.length
  const shortRatio = times.filter(t => t <= 25).length / times.length
  if (longRatio >= 0.7 && candidateTime <= 60) score += 2
  if (shortRatio >= 0.7 && candidateTime > 40) score += 1.5

  // Shared-ingredient cluster bonus — small affinity reward so pantry staples link dishes
  const sharedCount = candidate.ingredients.filter(
    i => currentIngredientNames.has(i.name.toLowerCase())
  ).length
  score += Math.min(sharedCount * 0.3, 1.5)

  return score
}

function pickDiverseCollection(count: number, excluded: Set<string>): Recipe[] {
  const available = RECIPES.filter(r => !excluded.has(r.id))
  const result: Recipe[] = []

  for (let i = 0; i < count; i++) {
    const remaining = available.filter(r => !result.some(p => p.id === r.id))
    if (remaining.length === 0) break

    // Score each candidate and add a small random jitter to avoid pure determinism
    const scored = remaining.map(r => ({
      recipe: r,
      score: scoreCandidate(r, result) + Math.random() * 0.5,
    }))

    scored.sort((a, b) => b.score - a.score)

    // Pick randomly from the top 30% (at least 1) to stay varied
    const topK = scored.slice(0, Math.max(1, Math.ceil(scored.length * 0.3)))
    const picked = topK[Math.floor(Math.random() * topK.length)].recipe

    result.push(picked)
  }

  return result
}

export function buildInitialSlots(count = 5): Slot[] {
  const recipes = pickDiverseCollection(count, new Set())
  return recipes.map(recipe => ({ recipe, locked: false, shuffling: false }))
}

export function shuffleSlots(slots: Slot[]): Slot[] {
  const lockedIds = new Set(slots.filter(s => s.locked).map(s => s.recipe.id))
  const unlockedCount = slots.filter(s => !s.locked).length

  if (unlockedCount === 0) return slots

  const newRecipes = pickDiverseCollection(unlockedCount, lockedIds)
  let newIndex = 0

  return slots.map(slot => {
    if (slot.locked) return slot
    const recipe = newRecipes[newIndex++] ?? slot.recipe
    return { recipe, locked: false, shuffling: false }
  })
}

export { RECIPES }
