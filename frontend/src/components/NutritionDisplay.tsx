import React from 'react';
import { calculateRecipeNutrition, getNutritionFactsLabel, type RecipeIngredient } from '../utils/nutritionCalculator';

interface NutritionDisplayProps {
  ingredients: RecipeIngredient[];
  servings: number;
  className?: string;
}

const NutritionDisplay: React.FC<NutritionDisplayProps> = ({ 
  ingredients, 
  servings, 
  className = '' 
}) => {
  // Filter out ingredients that don't have nutrition data
  const ingredientsWithNutrition = ingredients.filter(ing => 
    ing.ingredient.calories !== undefined || 
    ing.ingredient.protein !== undefined ||
    ing.ingredient.carbs !== undefined ||
    ing.ingredient.fat !== undefined
  );

  // Don't show anything if no ingredients have nutrition data
  if (ingredientsWithNutrition.length === 0) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nutrition Information</h3>
        <p className="text-gray-600 text-sm">
          Nutrition information will be calculated automatically when ingredients 
          with nutritional data are added to the database.
        </p>
      </div>
    );
  }

  const nutrition = calculateRecipeNutrition(ingredientsWithNutrition, servings);
  const facts = getNutritionFactsLabel(nutrition);

  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Facts</h3>
      <div className="text-sm text-gray-600 mb-2">Per serving ({servings} serving{servings !== 1 ? 's' : ''} total)</div>
      
      <div className="space-y-2">
        {/* Calories */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <span className="font-semibold text-lg">Calories</span>
          <span className="font-bold text-lg">{facts.calories}</span>
        </div>

        {/* Macronutrients */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">Total Fat</span>
            <span>{facts.totalFat}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Carbohydrates</span>
            <span>{facts.totalCarbs}</span>
          </div>
          <div className="flex justify-between pl-4">
            <span>Dietary Fiber</span>
            <span>{facts.fiber}</span>
          </div>
          <div className="flex justify-between pl-4">
            <span>Total Sugars</span>
            <span>{facts.sugar}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Protein</span>
            <span>{facts.protein}</span>
          </div>
        </div>

        {/* Micronutrients */}
        <div className="border-t border-gray-200 pt-2 space-y-1">
          <div className="flex justify-between">
            <span>Sodium</span>
            <span>{facts.sodium}</span>
          </div>
          
          {(nutrition.vitaminAPerServing > 0 || nutrition.vitaminCPerServing > 0 || 
            nutrition.vitaminDPerServing > 0 || nutrition.calciumPerServing > 0 || 
            nutrition.ironPerServing > 0) && (
            <>
              {nutrition.vitaminAPerServing > 0 && (
                <div className="flex justify-between">
                  <span>Vitamin A</span>
                  <span>{facts.vitaminA}</span>
                </div>
              )}
              {nutrition.vitaminCPerServing > 0 && (
                <div className="flex justify-between">
                  <span>Vitamin C</span>
                  <span>{facts.vitaminC}</span>
                </div>
              )}
              {nutrition.vitaminDPerServing > 0 && (
                <div className="flex justify-between">
                  <span>Vitamin D</span>
                  <span>{facts.vitaminD}</span>
                </div>
              )}
              {nutrition.calciumPerServing > 0 && (
                <div className="flex justify-between">
                  <span>Calcium</span>
                  <span>{facts.calcium}</span>
                </div>
              )}
              {nutrition.ironPerServing > 0 && (
                <div className="flex justify-between">
                  <span>Iron</span>
                  <span>{facts.iron}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Data coverage note */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Calculated from {ingredientsWithNutrition.length} of {ingredients.length} ingredients with nutritional data.
          {ingredientsWithNutrition.length < ingredients.length && ' Some ingredients may not be included in calculations.'}
        </p>
      </div>
    </div>
  );
};

export default NutritionDisplay;