'use client'

import Image from 'next/image'
import Badge from '@/app/components/ui/Badge'
import LockButton from '@/app/components/ui/LockButton'
import { Recipe } from '@/app/types/recipe'

interface RecipeCardProps {
  recipe: Recipe
  locked: boolean
  shuffling: boolean
  favorited: boolean
  onToggleLock: () => void
  onOpen: () => void
  index: number
}

export default function RecipeCard({
  recipe,
  locked,
  shuffling,
  favorited,
  onToggleLock,
  onOpen,
  index,
}: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <div
      className={`
        relative flex-1 min-w-0 min-h-72 sm:min-h-0 cursor-pointer overflow-hidden group
        transition-all duration-300 ease-out
        ${shuffling ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}
        ${locked ? 'ring-2 ring-inset ring-white/30' : ''}
      `}
      onClick={onOpen}
      style={{ transitionDelay: shuffling ? '0ms' : `${index * 40}ms` }}
    >
      {/* Background photo */}
      <Image
        src={recipe.imageUrl}
        alt={recipe.name}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 20vw"
        priority={index < 3}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

      {/* Hover brightening */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />

      {/* Lock button */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <LockButton locked={locked} onToggle={onToggleLock} />
      </div>

      {/* Always-visible lock indicator when locked */}
      {locked && (
        <div className="absolute top-4 right-4 z-20">
          <LockButton locked={locked} onToggle={onToggleLock} />
        </div>
      )}

      {/* Heart badge — always visible when favorited */}
      {favorited && (
        <div className="absolute top-4 left-4 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-terra text-white shadow-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
      )}

      {/* Card info */}
      <div
        className={`
          absolute bottom-0 inset-x-0 p-5 z-20
          translate-y-1 group-hover:translate-y-0
          transition-transform duration-300 ease-out
        `}
      >
        {/* Badges */}
        <div className="flex items-center gap-1.5 mb-3">
          <Badge variant="cuisine">{recipe.cuisine}</Badge>
          <Badge variant="time">
            {totalTime < 60
              ? `${totalTime}m`
              : `${Math.floor(totalTime / 60)}h ${totalTime % 60 > 0 ? `${totalTime % 60}m` : ''}`}
          </Badge>
        </div>

        {/* Dish name */}
        <h2 className="font-display text-white text-xl lg:text-2xl font-semibold leading-tight mb-2">
          {recipe.name}
        </h2>

        {/* Description — fades in on hover */}
        <p className="text-white/60 text-sm leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
          {recipe.description}
        </p>
      </div>
    </div>
  )
}
