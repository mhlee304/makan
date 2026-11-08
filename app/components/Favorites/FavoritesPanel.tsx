'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Recipe } from '@/app/types/recipe'
import Badge from '@/app/components/ui/Badge'

interface FavoritesPanelProps {
  favoriteIds: string[]
  allRecipes: Recipe[]
  onToggleFavorite: (id: string) => void
  onOpenRecipe: (recipe: Recipe) => void
  onClose: () => void
}

export default function FavoritesPanel({
  favoriteIds,
  allRecipes,
  onToggleFavorite,
  onOpenRecipe,
  onClose,
}: FavoritesPanelProps) {
  const favorites = allRecipes.filter(r => favoriteIds.includes(r.id))

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] bg-cream shadow-2xl flex flex-col"
        aria-label="Saved recipes"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-ink/8 shrink-0">
          <div>
            <h2 className="font-display text-ink text-lg font-semibold leading-none">Saved Recipes</h2>
            <p className="text-xs text-ink/40 mt-1">
              {favorites.length} {favorites.length === 1 ? 'recipe' : 'recipes'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-ink/5 text-ink/50 hover:text-ink transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-16">
              <HeartEmptyIcon />
              <p className="font-display text-ink text-base font-semibold">No saved recipes yet</p>
              <p className="text-sm text-ink/40 max-w-xs">
                Open any recipe and tap the heart to save it here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {favorites.map(recipe => (
                <li key={recipe.id}>
                  <FavoriteCard
                    recipe={recipe}
                    onOpen={() => onOpenRecipe(recipe)}
                    onRemove={() => onToggleFavorite(recipe.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}

function FavoriteCard({
  recipe,
  onOpen,
  onRemove,
}: {
  recipe: Recipe
  onOpen: () => void
  onRemove: () => void
}) {
  const totalTime = recipe.prepTime + recipe.cookTime
  const timeLabel = totalTime < 60
    ? `${totalTime}m`
    : `${Math.floor(totalTime / 60)}h${totalTime % 60 > 0 ? ` ${totalTime % 60}m` : ''}`

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-ink/8 hover:border-ink/15 group transition-colors">
      {/* Thumbnail */}
      <button
        onClick={onOpen}
        className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-ink/5"
        aria-label={`View ${recipe.name}`}
      >
        <Image
          src={recipe.imageUrl}
          alt={recipe.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="64px"
        />
      </button>

      {/* Info */}
      <button
        onClick={onOpen}
        className="flex-1 min-w-0 text-left"
        aria-label={`Open ${recipe.name}`}
      >
        <p className="font-display text-ink text-sm font-semibold leading-snug line-clamp-1 mb-1">
          {recipe.name}
        </p>
        <div className="flex items-center gap-1.5">
          <Badge variant="cuisine">{recipe.cuisine}</Badge>
          <Badge variant="time">{timeLabel}</Badge>
        </div>
      </button>

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-terra hover:bg-terra/10 transition-colors"
        aria-label={`Remove ${recipe.name} from saved`}
      >
        <HeartFilledIcon />
      </button>
    </div>
  )
}

function HeartFilledIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function HeartEmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-ink/15">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
