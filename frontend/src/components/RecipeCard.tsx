import React, { useState } from 'react';
import FavoriteButton from './FavoriteButton.tsx';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  scalingKeyIngredient?: {
    name: string;
    amount: number;
    unit: string;
  };
  ingredients: Array<{
    id: string;
    amount: number;
    unit: string;
    ingredient: {
      name: string;
      category?: string;
    };
  }>;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface RecipeCardProps {
  recipe: Recipe;
  onView?: (id: string) => void;
  onScale?: (id: string, scale: number) => void;
  onToggleFavorite?: (id: string, isFavorited: boolean) => void;
  isFavorited?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onView, 
  onScale, 
  onToggleFavorite,
  isFavorited = false 
}) => {
  const [scaleValue, setScaleValue] = useState(1);
  const [isScaling, setIsScaling] = useState(false);

  const handleScaleChange = (newScale: number) => {
    setScaleValue(newScale);
    if (onScale) {
      onScale(recipe.id, newScale);
    }
  };

  const scaledServings = Math.round(recipe.servings * scaleValue);
  const scaledKeyIngredient = recipe.scalingKeyIngredient ? {
    ...recipe.scalingKeyIngredient,
    amount: parseFloat((recipe.scalingKeyIngredient.amount * scaleValue).toFixed(2))
  } : null;

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 leading-tight flex-1 mr-3">{recipe.title}</h3>
          <div className="flex space-x-1 shrink-0">
            <FavoriteButton
              recipeId={recipe.id}
              isFavorited={isFavorited}
              onToggleFavorite={onToggleFavorite}
              size="md"
            />
            <button 
              onClick={() => setIsScaling(!isScaling)}
              className={`p-2 rounded-lg transition-colors ${
                isScaling 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Scale Recipe"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21l3-3-3-3m0 0l3-3m-3 3h11M3 4h18M5 8h14M7 12h10" />
              </svg>
            </button>
            <button 
              onClick={() => onView?.(recipe.id)}
              className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              title="View Recipe"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        {recipe.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>
        )}

        {/* Recipe Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {scaledServings} serving{scaledServings !== 1 ? 's' : ''}
            </span>
            {totalTime > 0 && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {totalTime} min
              </span>
            )}
          </div>
          
          {recipe.nutrition && (
            <span className="font-medium text-blue-600">
              {Math.round(recipe.nutrition.calories * scaleValue / recipe.servings)} cal/serving
            </span>
          )}
        </div>
      </div>

      {/* Scaling Interface */}
      {isScaling && (
        <div className="px-6 pb-4 border-t border-gray-100 bg-green-50">
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Scale Recipe:</label>
              <span className="text-sm text-green-700 font-medium">{(scaleValue * 100).toFixed(0)}%</span>
            </div>
            
            <div className="flex items-center space-x-3 mb-3">
              <button 
                onClick={() => handleScaleChange(0.5)}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ½×
              </button>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={scaleValue}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <button 
                onClick={() => handleScaleChange(2)}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                2×
              </button>
            </div>

            {scaledKeyIngredient && (
              <div className="text-xs text-gray-600 bg-white rounded-md p-2">
                <span className="font-medium">Key ingredient:</span> {scaledKeyIngredient.amount} {scaledKeyIngredient.unit} {scaledKeyIngredient.name}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ingredients Preview */}
      <div className="px-6 pb-4 flex-grow">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Ingredients:</h4>
        <div className="flex flex-wrap gap-2">
          {recipe.ingredients.slice(0, 4).map((ing) => (
            <span 
              key={ing.id}
              className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                ing.ingredient.category === 'protein' ? 'bg-red-100 text-red-700' :
                ing.ingredient.category === 'vegetable' ? 'bg-green-100 text-green-700' :
                ing.ingredient.category === 'grain' ? 'bg-yellow-100 text-yellow-700' :
                ing.ingredient.category === 'dairy' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}
            >
              {parseFloat((ing.amount * scaleValue).toFixed(2))} {ing.unit} {ing.ingredient.name}
            </span>
          ))}
          {recipe.ingredients.length > 4 && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{recipe.ingredients.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Nutrition Preview */}
      {recipe.nutrition && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{Math.round(recipe.nutrition.calories * scaleValue / recipe.servings)}</div>
              <div className="text-xs text-gray-500">Calories</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{Math.round(recipe.nutrition.protein * scaleValue / recipe.servings)}g</div>
              <div className="text-xs text-gray-500">Protein</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">{Math.round(recipe.nutrition.carbs * scaleValue / recipe.servings)}g</div>
              <div className="text-xs text-gray-500">Carbs</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{Math.round(recipe.nutrition.fat * scaleValue / recipe.servings)}g</div>
              <div className="text-xs text-gray-500">Fat</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Always at bottom */}
      <div className="px-6 py-3 mt-auto">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onView?.(recipe.id)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm text-left font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Recipe
          </button>
          <a 
            href={`/recipes/${recipe.id}`}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm text-left font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V4a2 2 0 00-2-2H5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Kitchen Mode
          </a>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;