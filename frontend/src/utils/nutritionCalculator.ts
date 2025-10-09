// Nutrition calculation utilities for recipes

export interface IngredientNutrition {
  id: string;
  name: string;
  // Nutrition per 100g
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fat?: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // milligrams
  // Micronutrients per 100g
  vitaminA?: number; // mcg
  vitaminC?: number; // mg
  vitaminD?: number; // mcg
  calcium?: number; // mg
  iron?: number; // mg
}

export interface RecipeIngredient {
  amount: number;
  unit: string;
  ingredient: IngredientNutrition;
}

export interface RecipeNutrition {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  totalVitaminA: number;
  totalVitaminC: number;
  totalVitaminD: number;
  totalCalcium: number;
  totalIron: number;
  // Per serving values
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  fiberPerServing: number;
  sugarPerServing: number;
  sodiumPerServing: number;
  vitaminAPerServing: number;
  vitaminCPerServing: number;
  vitaminDPerServing: number;
  calciumPerServing: number;
  ironPerServing: number;
}

// Common unit conversions to grams
const UNIT_TO_GRAMS: Record<string, number> = {
  // Weight units
  'g': 1,
  'kg': 1000,
  'oz': 28.35,
  'lb': 453.59,
  
  // Volume units (approximate for common ingredients)
  'ml': 1, // Assuming density of water (1g/ml)
  'l': 1000,
  'cup': 240, // Approximate for most liquids
  'cups': 240,
  'tbsp': 15,
  'tsp': 5,
  
  // Count-based (we'll need specific conversions for these)
  'piece': 100, // Default assumption - will vary by ingredient
  'pieces': 100,
  'large': 150,
  'medium': 100,
  'small': 50,
  'slice': 25,
  'slices': 25,
  'clove': 3, // For garlic
  'cloves': 3,
};

/**
 * Convert ingredient amount to grams for nutrition calculation
 */
export function convertToGrams(amount: number, unit: string, ingredientName?: string): number {
  const unitLower = unit.toLowerCase();
  
  // Special cases for specific ingredients
  if (ingredientName) {
    const ingredientLower = ingredientName.toLowerCase();
    
    // Eggs
    if (ingredientLower.includes('egg')) {
      if (unitLower.includes('large')) return amount * 50;
      if (unitLower.includes('medium')) return amount * 44;
      if (unitLower.includes('small')) return amount * 38;
      if (unitLower === 'piece' || unitLower === 'pieces') return amount * 50; // Assume large
    }
    
    // Flour (cups are different weights)
    if (ingredientLower.includes('flour')) {
      if (unitLower === 'cup' || unitLower === 'cups') return amount * 120;
    }
    
    // Sugar
    if (ingredientLower.includes('sugar')) {
      if (unitLower === 'cup' || unitLower === 'cups') return amount * 200;
    }
    
    // Butter
    if (ingredientLower.includes('butter')) {
      if (unitLower === 'cup' || unitLower === 'cups') return amount * 227;
      if (unitLower === 'tbsp') return amount * 14;
    }
    
    // Milk
    if (ingredientLower.includes('milk')) {
      if (unitLower === 'cup' || unitLower === 'cups') return amount * 240;
    }
  }
  
  // Default conversion
  const conversionFactor = UNIT_TO_GRAMS[unitLower];
  if (conversionFactor) {
    return amount * conversionFactor;
  }
  
  // If no conversion found, assume it's already in grams or use default
  console.warn(`Unknown unit: ${unit} for ${ingredientName || 'ingredient'}. Assuming 100g per unit.`);
  return amount * 100;
}

/**
 * Calculate total nutrition for a recipe
 */
export function calculateRecipeNutrition(
  ingredients: RecipeIngredient[],
  servings: number = 1
): RecipeNutrition {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSugar = 0;
  let totalSodium = 0;
  let totalVitaminA = 0;
  let totalVitaminC = 0;
  let totalVitaminD = 0;
  let totalCalcium = 0;
  let totalIron = 0;

  ingredients.forEach(recipeIngredient => {
    const { amount, unit, ingredient } = recipeIngredient;
    
    // Convert to grams
    const gramsUsed = convertToGrams(amount, unit, ingredient.name);
    
    // Calculate nutrition contribution (per 100g basis)
    const factor = gramsUsed / 100;
    
    totalCalories += (ingredient.calories || 0) * factor;
    totalProtein += (ingredient.protein || 0) * factor;
    totalCarbs += (ingredient.carbs || 0) * factor;
    totalFat += (ingredient.fat || 0) * factor;
    totalFiber += (ingredient.fiber || 0) * factor;
    totalSugar += (ingredient.sugar || 0) * factor;
    totalSodium += (ingredient.sodium || 0) * factor;
    totalVitaminA += (ingredient.vitaminA || 0) * factor;
    totalVitaminC += (ingredient.vitaminC || 0) * factor;
    totalVitaminD += (ingredient.vitaminD || 0) * factor;
    totalCalcium += (ingredient.calcium || 0) * factor;
    totalIron += (ingredient.iron || 0) * factor;
  });

  // Calculate per-serving values
  const caloriesPerServing = totalCalories / servings;
  const proteinPerServing = totalProtein / servings;
  const carbsPerServing = totalCarbs / servings;
  const fatPerServing = totalFat / servings;
  const fiberPerServing = totalFiber / servings;
  const sugarPerServing = totalSugar / servings;
  const sodiumPerServing = totalSodium / servings;
  const vitaminAPerServing = totalVitaminA / servings;
  const vitaminCPerServing = totalVitaminC / servings;
  const vitaminDPerServing = totalVitaminD / servings;
  const calciumPerServing = totalCalcium / servings;
  const ironPerServing = totalIron / servings;

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
    totalSugar: Math.round(totalSugar * 10) / 10,
    totalSodium: Math.round(totalSodium),
    totalVitaminA: Math.round(totalVitaminA),
    totalVitaminC: Math.round(totalVitaminC * 10) / 10,
    totalVitaminD: Math.round(totalVitaminD * 10) / 10,
    totalCalcium: Math.round(totalCalcium),
    totalIron: Math.round(totalIron * 10) / 10,
    caloriesPerServing: Math.round(caloriesPerServing),
    proteinPerServing: Math.round(proteinPerServing * 10) / 10,
    carbsPerServing: Math.round(carbsPerServing * 10) / 10,
    fatPerServing: Math.round(fatPerServing * 10) / 10,
    fiberPerServing: Math.round(fiberPerServing * 10) / 10,
    sugarPerServing: Math.round(sugarPerServing * 10) / 10,
    sodiumPerServing: Math.round(sodiumPerServing),
    vitaminAPerServing: Math.round(vitaminAPerServing),
    vitaminCPerServing: Math.round(vitaminCPerServing * 10) / 10,
    vitaminDPerServing: Math.round(vitaminDPerServing * 10) / 10,
    calciumPerServing: Math.round(calciumPerServing),
    ironPerServing: Math.round(ironPerServing * 10) / 10,
  };
}

/**
 * Format nutrition value for display
 */
export function formatNutritionValue(value: number, unit: string): string {
  if (value === 0) return `0${unit}`;
  if (value < 1) return `${value.toFixed(1)}${unit}`;
  if (value < 10) return `${value.toFixed(1)}${unit}`;
  return `${Math.round(value)}${unit}`;
}

/**
 * Get nutrition facts label data
 */
export function getNutritionFactsLabel(nutrition: RecipeNutrition) {
  return {
    calories: nutrition.caloriesPerServing,
    totalFat: formatNutritionValue(nutrition.fatPerServing, 'g'),
    totalCarbs: formatNutritionValue(nutrition.carbsPerServing, 'g'),
    fiber: formatNutritionValue(nutrition.fiberPerServing, 'g'),
    sugar: formatNutritionValue(nutrition.sugarPerServing, 'g'),
    protein: formatNutritionValue(nutrition.proteinPerServing, 'g'),
    sodium: formatNutritionValue(nutrition.sodiumPerServing, 'mg'),
    vitaminA: formatNutritionValue(nutrition.vitaminAPerServing, 'mcg'),
    vitaminC: formatNutritionValue(nutrition.vitaminCPerServing, 'mg'),
    vitaminD: formatNutritionValue(nutrition.vitaminDPerServing, 'mcg'),
    calcium: formatNutritionValue(nutrition.calciumPerServing, 'mg'),
    iron: formatNutritionValue(nutrition.ironPerServing, 'mg'),
  };
}