'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Badge from '@/app/components/ui/Badge'
import { Recipe } from '@/app/types/recipe'

interface RecipeDrawerProps {
  recipe: Recipe | null
  isFavorited: boolean
  onToggleFavorite: (id: string) => void
  onClose: () => void
}

export default function RecipeDrawer({ recipe, isFavorited, onToggleFavorite, onClose }: RecipeDrawerProps) {
  const isOpen = recipe !== null

  // Trap Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!recipe) return null

  const totalTime = recipe.prepTime + recipe.cookTime

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h${m > 0 ? ` ${m}m` : ''}`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 right-0 z-50 h-full
          w-full sm:w-[480px]
          bg-cream overflow-y-auto scrollbar-thin
          shadow-2xl
          transition-transform duration-350 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-label="Recipe detail"
      >
        {/* Hero image */}
        <div className="relative h-64 sm:h-72 bg-ink/10 shrink-0">
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="480px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 flex items-center justify-center w-9 h-9 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors z-10"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Favorite button */}
          <button
            onClick={() => onToggleFavorite(recipe.id)}
            className={`absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full backdrop-blur-sm transition-all duration-200 z-10 ${
              isFavorited
                ? 'bg-terra text-white hover:bg-terra/80'
                : 'bg-black/30 text-white hover:bg-black/50'
            }`}
            aria-label={isFavorited ? 'Remove from saved' : 'Save recipe'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Name over image */}
          <div className="absolute bottom-0 inset-x-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="cuisine">{recipe.cuisine}</Badge>
            </div>
            <h2 className="font-display text-white text-2xl sm:text-3xl font-semibold leading-tight">
              {recipe.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">

          {/* Meta row */}
          <div className="flex items-center gap-6 pb-5 border-b border-ink/8">
            <MetaStat label="Prep" value={formatTime(recipe.prepTime)} />
            <MetaStat label="Cook" value={formatTime(recipe.cookTime)} />
            <MetaStat label="Total" value={formatTime(totalTime)} />
            <MetaStat label="Serves" value={String(recipe.servings)} />
          </div>

          {/* Description */}
          <p className="text-ink/70 text-sm leading-relaxed">{recipe.description}</p>

          {/* Ingredients */}
          <section>
            <h3 className="font-display text-ink text-lg font-semibold mb-4">Ingredients</h3>
            <ul className="space-y-2.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-baseline justify-between gap-4">
                  <span className="text-sm text-ink capitalize">{ing.name}</span>
                  <span className="text-sm text-ink/50 whitespace-nowrap shrink-0 font-medium tabular-nums">
                    {typeof ing.quantity === 'number' && ing.quantity % 1 !== 0
                      ? ing.quantity.toFixed(1)
                      : ing.quantity}{' '}
                    {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Instructions */}
          <section>
            <h3 className="font-display text-ink text-lg font-semibold mb-4">Instructions</h3>
            <ol className="space-y-5">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-display text-terra font-semibold text-sm mt-0.5 shrink-0 w-5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-ink/75 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Spacer for toolbar clearance on mobile */}
          <div className="h-4" />
        </div>
      </aside>
    </>
  )
}

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-medium text-ink/40 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-semibold text-ink tabular-nums">{value}</span>
    </div>
  )
}
