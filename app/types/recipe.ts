export type IngredientCategory =
  | 'produce'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'pantry'
  | 'spices'
  | 'bakery'

export interface Ingredient {
  name: string
  quantity: number
  unit: string
  category: IngredientCategory
}

export interface Recipe {
  id: string
  name: string
  cuisine: string
  description: string
  imageUrl: string
  prepTime: number
  cookTime: number
  servings: number
  ingredients: Ingredient[]
  instructions: string[]
  tags: string[]
  protein: string
  flavorProfile: string[]
}

export interface Slot {
  recipe: Recipe
  locked: boolean
  shuffling: boolean
}
