'use client'

import { useState, useEffect, useCallback } from 'react'
import RecipeCard from '@/app/components/Generator/RecipeCard'
import CardSkeleton from '@/app/components/Generator/CardSkeleton'
import GeneratorToolbar from '@/app/components/Generator/GeneratorToolbar'
import RecipeDrawer from '@/app/components/Recipe/RecipeDrawer'
import GroceryListPanel from '@/app/components/GroceryList/GroceryListPanel'
import { Slot, Recipe } from '@/app/types/recipe'
import { buildInitialSlots, shuffleSlots, RECIPES } from '@/app/lib/generator'
import { loadFavorites, toggleFavorite } from '@/app/lib/favorites'
import FavoritesPanel from '@/app/components/Favorites/FavoritesPanel'

const MIN_SLOTS = 3
const MAX_SLOTS = 7
const SHUFFLE_FADE_MS = 220

export default function GeneratorPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)
  const [isGroceryOpen, setIsGroceryOpen] = useState(false)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  // Initialise on mount (client-only to avoid SSR mismatch with random)
  useEffect(() => {
    setSlots(buildInitialSlots(5))
    setFavoriteIds(loadFavorites())
    setMounted(true)
  }, [])

  const handleToggleFavorite = useCallback((id: string) => {
    setFavoriteIds(prev => toggleFavorite(prev, id))
  }, [])

  const handleShuffle = useCallback(() => {
    if (isShuffling) return
    const hasUnlocked = slots.some(s => !s.locked)
    if (!hasUnlocked) return

    setIsShuffling(true)

    // Phase 1: fade out unlocked cards
    setSlots(prev => prev.map(s => s.locked ? s : { ...s, shuffling: true }))

    // Phase 2: swap recipes then fade back in
    setTimeout(() => {
      setSlots(prev => shuffleSlots(prev).map(s => ({ ...s, shuffling: false })))
      setIsShuffling(false)
    }, SHUFFLE_FADE_MS)
  }, [slots, isShuffling])

  // Spacebar handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      if (activeRecipe || isGroceryOpen || isFavoritesOpen) return
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return
      e.preventDefault()
      handleShuffle()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleShuffle, activeRecipe, isGroceryOpen, isFavoritesOpen])

  const handleToggleLock = useCallback((index: number) => {
    setSlots(prev =>
      prev.map((s, i) => i === index ? { ...s, locked: !s.locked } : s)
    )
  }, [])

  const handleAddSlot = useCallback(() => {
    if (slots.length >= MAX_SLOTS) return
    setSlots(prev => {
      const usedIds = new Set(prev.map(s => s.recipe.id))
      const available = RECIPES.filter(r => !usedIds.has(r.id))
      if (available.length === 0) return prev
      const picked = available[Math.floor(Math.random() * available.length)]
      return [...prev, { recipe: picked, locked: false, shuffling: false }]
    })
  }, [slots.length])

  const handleRemoveSlot = useCallback(() => {
    if (slots.length <= MIN_SLOTS) return
    setSlots(prev => prev.slice(0, -1))
  }, [slots.length])

  if (!mounted || slots.length === 0) {
    return (
      <div className="flex flex-col h-full pb-16">
        <Header />
        <div className="flex flex-row flex-1 min-h-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="fixed bottom-0 inset-x-0 h-16 bg-cream/90 border-t border-ink/8" />
      </div>
    )
  }

  const lockedCount = slots.filter(s => s.locked).length

  return (
    <div className="flex flex-col h-full">
      <Header />

      {/* Card strip */}
      <main
        className={`
          flex flex-1 min-h-0
          flex-col sm:flex-row
          overflow-y-auto sm:overflow-hidden
          pb-16 sm:pb-16
        `}
        role="main"
        aria-label="Recipe collection"
      >
        {slots.map((slot, i) => (
          <RecipeCard
            key={`${slot.recipe.id}-${i}`}
            recipe={slot.recipe}
            locked={slot.locked}
            shuffling={slot.shuffling}
            favorited={favoriteIds.includes(slot.recipe.id)}
            onToggleLock={() => handleToggleLock(i)}
            onOpen={() => setActiveRecipe(slot.recipe)}
            index={i}
          />
        ))}
      </main>

      <GeneratorToolbar
        slotCount={slots.length}
        lockedCount={lockedCount}
        favoritesCount={favoriteIds.length}
        onShuffle={handleShuffle}
        onAddSlot={handleAddSlot}
        onRemoveSlot={handleRemoveSlot}
        onGroceryList={() => setIsGroceryOpen(true)}
        onFavorites={() => setIsFavoritesOpen(true)}
        canAdd={slots.length < MAX_SLOTS}
        canRemove={slots.length > MIN_SLOTS}
      />

      {/* Recipe detail drawer */}
      <RecipeDrawer
        recipe={activeRecipe}
        isFavorited={activeRecipe ? favoriteIds.includes(activeRecipe.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onClose={() => setActiveRecipe(null)}
      />

      {/* Grocery list panel */}
      {isGroceryOpen && (
        <GroceryListPanel
          recipes={slots.map(s => s.recipe)}
          onClose={() => setIsGroceryOpen(false)}
        />
      )}

      {/* Favorites panel */}
      {isFavoritesOpen && (
        <FavoritesPanel
          favoriteIds={favoriteIds}
          allRecipes={RECIPES}
          onToggleFavorite={handleToggleFavorite}
          onOpenRecipe={(recipe) => {
            setIsFavoritesOpen(false)
            setActiveRecipe(recipe)
          }}
          onClose={() => setIsFavoritesOpen(false)}
        />
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="shrink-0 flex items-center justify-between px-6 h-14 border-b border-ink/5 bg-cream/80 backdrop-blur-sm">
      <span className="font-display text-ink font-semibold text-lg tracking-tight">
        makan
      </span>
      <span className="text-xs text-ink/35 font-medium tracking-wider uppercase hidden sm:block">
        Discover your next meal
      </span>
    </header>
  )
}
