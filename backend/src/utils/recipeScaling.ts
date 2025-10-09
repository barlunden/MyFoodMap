// Recipe scaling utility functions

interface RecipeIngredient {
  id: string;
  amount: number;
  unit: string;
  notes?: string;
  order: number;
  ingredient: {
    id: string;
    name: string;
    category?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

interface Recipe {
  id: string;
  title: string;
  description?: string;
  instructions: string[];
  servings: number;
  prepTime?: number;
  cookTime?: number;
  scalingKeyIngredientId?: string;
  ingredients: RecipeIngredient[];
}

/**
 * Scales a recipe by a given multiplier
 */
export function scaleRecipe(recipe: Recipe, multiplier: number): Recipe {
  return {
    ...recipe,
    servings: Math.round(recipe.servings * multiplier),
    ingredients: recipe.ingredients.map(ingredient => ({
      ...ingredient,
      amount: parseFloat((ingredient.amount * multiplier).toFixed(3))
    }))
  };
}

/**
 * Scales a recipe based on a key ingredient amount
 */
export function scaleRecipeByKeyIngredient(
  recipe: Recipe,
  keyIngredientId: string,
  newAmount: number
): Recipe {
  const keyIngredient = recipe.ingredients.find(
    ing => ing.ingredient.id === keyIngredientId
  );
  
  if (!keyIngredient) {
    throw new Error('Key ingredient not found in recipe');
  }
  
  const multiplier = newAmount / keyIngredient.amount;
  return scaleRecipe(recipe, multiplier);
}