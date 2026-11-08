'use client'

import { useEffect, useState, useMemo } from 'react'
import { Recipe, Ingredient, IngredientCategory } from '@/app/types/recipe'

interface GroceryListPanelProps {
  recipes: Recipe[]
  onClose: () => void
}

interface AggregatedIngredient extends Ingredient {
  recipeIds: string[]
}

type GroupedList = Partial<Record<IngredientCategory, AggregatedIngredient[]>>

const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  produce: 'Fresh Produce',
  meat: 'Meat & Poultry',
  seafood: 'Seafood',
  dairy: 'Dairy & Eggs',
  pantry: 'Pantry & Dry Goods',
  spices: 'Herbs & Spices',
  bakery: 'Bread & Bakery',
}

const CATEGORY_ORDER: IngredientCategory[] = [
  'produce', 'meat', 'seafood', 'dairy', 'pantry', 'spices', 'bakery',
]

function aggregateIngredients(recipes: Recipe[]): GroupedList {
  const map = new Map<string, AggregatedIngredient>()

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}__${ing.unit.toLowerCase()}`
      const existing = map.get(key)
      if (existing) {
        existing.quantity = Number(existing.quantity) + Number(ing.quantity)
        existing.recipeIds.push(recipe.id)
      } else {
        map.set(key, { ...ing, recipeIds: [recipe.id] })
      }
    }
  }

  const grouped: GroupedList = {}
  for (const item of map.values()) {
    const cat = item.category
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat]!.push(item)
  }

  // Sort each category alphabetically
  for (const cat of Object.keys(grouped) as IngredientCategory[]) {
    grouped[cat]!.sort((a, b) => a.name.localeCompare(b.name))
  }

  return grouped
}

function formatQuantity(qty: number): string {
  if (qty % 1 === 0) return String(qty)
  // Round to 1 decimal
  return qty.toFixed(1).replace(/\.0$/, '')
}

export default function GroceryListPanel({ recipes, onClose }: GroceryListPanelProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const grouped = useMemo(() => aggregateIngredients(recipes), [recipes])

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

  const toggleItem = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleCopy = async () => {
    const lines: string[] = [`Grocery list for ${recipes.length} recipes\n`]
    for (const cat of CATEGORY_ORDER) {
      const items = grouped[cat]
      if (!items?.length) continue
      lines.push(`\n${CATEGORY_LABELS[cat].toUpperCase()}`)
      for (const item of items) {
        lines.push(`  • ${formatQuantity(item.quantity)} ${item.unit} ${item.name}`)
      }
    }
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalItems = Object.values(grouped).reduce((sum, arr) => sum + (arr?.length ?? 0), 0)

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
        aria-label="Grocery list"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-ink/8 shrink-0">
          <div>
            <h2 className="font-display text-ink text-lg font-semibold leading-none">Grocery List</h2>
            <p className="text-xs text-ink/40 mt-1">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} · {totalItems} items
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

        {/* Recipe chips */}
        <div className="px-6 py-3 border-b border-ink/5 shrink-0">
          <div className="flex flex-wrap gap-2">
            {recipes.map(r => (
              <span
                key={r.id}
                className="inline-flex items-center text-xs bg-ink/5 text-ink/60 rounded-full px-2.5 py-1"
              >
                {r.name}
              </span>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-7">
          {CATEGORY_ORDER.map(cat => {
            const items = grouped[cat]
            if (!items?.length) return null
            return (
              <section key={cat}>
                <h3 className="text-[10px] font-semibold text-ink/40 uppercase tracking-widest mb-3">
                  {CATEGORY_LABELS[cat]}
                </h3>
                <ul className="space-y-0 divide-y divide-ink/5">
                  {items.map(item => {
                    const key = `${item.name.toLowerCase()}__${item.unit.toLowerCase()}`
                    const isChecked = checked.has(key)
                    return (
                      <li
                        key={key}
                        className="flex items-center gap-3 py-2.5 cursor-pointer group"
                        onClick={() => toggleItem(key)}
                      >
                        <div className={`
                          w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center
                          transition-colors duration-150
                          ${isChecked
                            ? 'bg-terra border-terra'
                            : 'border-ink/20 group-hover:border-ink/40'
                          }
                        `}>
                          {isChecked && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm flex-1 capitalize transition-colors ${isChecked ? 'line-through text-ink/30' : 'text-ink'}`}>
                          {item.name}
                        </span>
                        <span className={`text-xs font-medium tabular-nums transition-colors shrink-0 ${isChecked ? 'text-ink/25' : 'text-ink/50'}`}>
                          {formatQuantity(item.quantity)} {item.unit}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-ink/8 flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium bg-ink text-cream h-10 rounded-lg hover:bg-ink/80 active:scale-95 transition-all duration-150"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.75"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.75"/>
                </svg>
                Copy to clipboard
              </>
            )}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 text-sm font-medium border border-ink/15 text-ink/60 hover:text-ink hover:border-ink/30 h-10 px-4 rounded-lg transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.75"/>
              <rect x="6" y="14" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.75"/>
            </svg>
            Print
          </button>
        </div>
      </aside>
    </>
  )
}
