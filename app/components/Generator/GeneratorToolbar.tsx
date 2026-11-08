'use client'

interface GeneratorToolbarProps {
  slotCount: number
  lockedCount: number
  favoritesCount: number
  onShuffle: () => void
  onAddSlot: () => void
  onRemoveSlot: () => void
  onGroceryList: () => void
  onFavorites: () => void
  canAdd: boolean
  canRemove: boolean
}

export default function GeneratorToolbar({
  slotCount,
  lockedCount,
  favoritesCount,
  onShuffle,
  onAddSlot,
  onRemoveSlot,
  onGroceryList,
  onFavorites,
  canAdd,
  canRemove,
}: GeneratorToolbarProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-cream/90 backdrop-blur-md border-t border-ink/8">
      <div className="max-w-screen-2xl mx-auto px-5 h-16 flex items-center justify-between gap-4">

        {/* Left: slot count */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-medium text-ink/40 tracking-widest uppercase whitespace-nowrap">
            {slotCount} {slotCount === 1 ? 'dish' : 'dishes'}
            {lockedCount > 0 && (
              <span className="text-terra ml-1.5">· {lockedCount} locked</span>
            )}
          </span>
        </div>

        {/* Center: spacebar hint + mobile shuffle */}
        <div className="flex items-center gap-3">
          <span className="hidden lg:flex items-center gap-1.5 text-ink/35 text-xs select-none">
            <kbd className="inline-flex items-center rounded border border-ink/15 bg-ink/5 px-1.5 py-0.5 font-mono text-xs">
              Space
            </kbd>
            to shuffle
          </span>
          <button
            onClick={onShuffle}
            className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink transition-colors"
          >
            <ShuffleIcon />
            Shuffle
          </button>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* Slot count adjuster */}
          <div className="hidden sm:flex items-center gap-0 rounded-lg border border-ink/10 overflow-hidden">
            <button
              onClick={onRemoveSlot}
              disabled={!canRemove}
              className="px-3 h-8 text-ink/50 hover:text-ink hover:bg-ink/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-lg leading-none"
              aria-label="Remove a dish slot"
            >
              −
            </button>
            <div className="w-px h-5 bg-ink/10" />
            <button
              onClick={onAddSlot}
              disabled={!canAdd}
              className="px-3 h-8 text-ink/50 hover:text-ink hover:bg-ink/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-lg leading-none"
              aria-label="Add a dish slot"
            >
              +
            </button>
          </div>

          {/* Favorites button */}
          <button
            onClick={onFavorites}
            className="relative flex items-center gap-2 border border-ink/15 text-ink/60 hover:text-ink hover:border-ink/30 text-sm font-medium px-4 h-9 rounded-lg transition-colors"
            aria-label="Saved recipes"
          >
            <HeartIcon />
            <span className="hidden sm:inline">Saved</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-terra text-white text-[10px] font-semibold px-1 leading-none">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Grocery list CTA */}
          <button
            onClick={onGroceryList}
            className="flex items-center gap-2 bg-ink text-cream text-sm font-medium px-4 h-9 rounded-lg hover:bg-ink/80 active:scale-95 transition-all duration-150"
          >
            <ShoppingBagIcon />
            <span className="hidden sm:inline">Grocery list</span>
            <span className="sm:hidden">List</span>
          </button>
        </div>

      </div>
    </div>
  )
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ShuffleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M16 3h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 20L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M21 16v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 15l6 6M4 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ShoppingBagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
