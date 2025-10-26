import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import KitchenMode from './KitchenMode';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  visibility: string;
  isArfidFriendly: boolean;
  arfidNotes?: string;
  tags?: string;
  instructions: string; // JSON string from API
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
  ingredients: Array<{
    id: string;
    amount: number;
    unit: string;
    notes?: string;
    brand?: string;
    isOptional: boolean;
    order: number;
    ingredient: {
      id: string;
      name: string;
      category?: string;
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
      vitaminA?: number;
      vitaminC?: number;
      vitaminD?: number;
      calcium?: number;
      iron?: number;
    };
  }>;
}

interface RecipeDetailProps {
  recipeId: string;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipeId }) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scaleValue, setScaleValue] = useState(1);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'nutrition'>('ingredients');
  const [showKitchenMode, setShowKitchenMode] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching recipe with ID:', recipeId);
        
        const recipeData = await apiClient.getRecipe(recipeId);
        console.log('Fetched recipe data:', recipeData);
        setRecipe(recipeData);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  // Parse instructions from JSON string
  let instructions: string[] = [];
  if (recipe) {
    try {
      instructions = JSON.parse(recipe.instructions);
    } catch (e) {
      console.error('Error parsing instructions:', e);
      instructions = [recipe.instructions]; // Fallback to treating as single instruction
    }
  }

  // Parse tags from JSON string
  let tags: string[] = [];
  if (recipe) {
    try {
      if (recipe.tags) {
        tags = JSON.parse(recipe.tags);
      }
    } catch (e) {
      console.error('Error parsing tags:', e);
      tags = [];
    }
  }

  // Calculate scaled ingredients
  const getScaledIngredients = () => {
    if (!recipe) return [];
    return recipe.ingredients.map(recipeIngredient => ({
      ...recipeIngredient,
      amount: recipeIngredient.amount * scaleValue
    }));
  };

  // Calculate nutrition from ingredients
  const calculateNutrition = () => {
    if (!recipe?.ingredients) return null;
    
    const scaledIngredients = getScaledIngredients();
    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0
    };

    scaledIngredients.forEach(recipeIngredient => {
      const { ingredient, amount, unit } = recipeIngredient;
      
      // Convert amount to grams for calculation (simplified conversion)
      let amountInGrams = amount;
      switch (unit.toLowerCase()) {
        case 'kg':
          amountInGrams = amount * 1000;
          break;
        case 'lb':
          amountInGrams = amount * 453.592;
          break;
        case 'oz':
          amountInGrams = amount * 28.3495;
          break;
        case 'cup':
        case 'cups':
          amountInGrams = amount * 240; // Approximate for liquids
          break;
        case 'tbsp':
        case 'tablespoon':
        case 'tablespoons':
          amountInGrams = amount * 15;
          break;
        case 'tsp':
        case 'teaspoon':
        case 'teaspoons':
          amountInGrams = amount * 5;
          break;
        case 'large':
          // For eggs, assume 50g per large egg
          amountInGrams = amount * 50;
          break;
        default:
          // Assume grams if unit not recognized
          amountInGrams = amount;
      }

      // Calculate nutrition per 100g and scale to actual amount
      const ratio = amountInGrams / 100;
      
      totalNutrition.calories += (ingredient.calories || 0) * ratio;
      totalNutrition.protein += (ingredient.protein || 0) * ratio;
      totalNutrition.carbs += (ingredient.carbs || 0) * ratio;
      totalNutrition.fat += (ingredient.fat || 0) * ratio;
      totalNutrition.fiber += (ingredient.fiber || 0) * ratio;
      totalNutrition.sugar += (ingredient.sugar || 0) * ratio;
      totalNutrition.sodium += (ingredient.sodium || 0) * ratio;
      totalNutrition.vitaminA += (ingredient.vitaminA || 0) * ratio;
      totalNutrition.vitaminC += (ingredient.vitaminC || 0) * ratio;
      totalNutrition.vitaminD += (ingredient.vitaminD || 0) * ratio;
      totalNutrition.calcium += (ingredient.calcium || 0) * ratio;
      totalNutrition.iron += (ingredient.iron || 0) * ratio;
    });

    return totalNutrition;
  };

  const nutrition = calculateNutrition();

  const handleStartKitchenMode = () => {
    setShowKitchenMode(true);
  };

  const handleExitKitchenMode = () => {
    setShowKitchenMode(false);
  };

  // If Kitchen Mode is active, show only that
  if (showKitchenMode && recipe) {
    return (
      <KitchenMode 
        recipeId={recipeId}
        onExit={handleExitKitchenMode}
        initialScale={scaleValue}
      />
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading recipe...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto p-8 bg-red-50 border border-red-200 rounded-xl">
          <div className="text-center">
            <h3 className="text-xl font-bold text-red-800 mb-2">Recipe Not Found</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <button 
              onClick={() => window.location.href = '/recipes'}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Browse Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h2>
          <p className="text-gray-600 mb-6">The recipe you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">{recipe.title}</h1>
            <div className="flex space-x-3">
              <button 
                onClick={handleStartKitchenMode}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V4a2 2 0 00-2-2H5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>🍳 Kitchen Mode</span>
              </button>
              <button 
                onClick={() => window.location.href = `/recipes/${recipe.id}/edit`}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>✏️ Edit</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                💾 Save Recipe
              </button>
            </div>
          </div>
          
          {recipe.description && (
            <p className="text-gray-600 text-lg mb-4">{recipe.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            <span>🍽️ Serves {Math.round(recipe.servings * scaleValue)}</span>
            {recipe.prepTime && <span>⏱️ Prep: {recipe.prepTime} min</span>}
            {recipe.cookTime && <span>🔥 Cook: {recipe.cookTime} min</span>}
            {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
              {recipe.isArfidFriendly && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ARFID-Friendly
                </span>
              )}
            </div>
          )}

          {/* Scaling Controls */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <label className="font-medium text-gray-700">Scale Recipe:</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setScaleValue(Math.max(0.25, scaleValue - 0.25))}
                  className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={scaleValue}
                  onChange={(e) => setScaleValue(Math.max(0.25, parseFloat(e.target.value) || 1))}
                  className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
                  min="0.25"
                  step="0.25"
                />
                <button
                  onClick={() => setScaleValue(scaleValue + 0.25)}
                  className="w-8 h-8 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <span className="text-gray-600 ml-2">
                  (Serves {Math.round(recipe.servings * scaleValue)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['ingredients', 'instructions', 'nutrition'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'ingredients' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
                <div className="space-y-3">
                  {getScaledIngredients().map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{item.ingredient.name}</span>
                          <span className="text-gray-600 font-mono">
                            {item.amount.toFixed(2)} {item.unit}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                        )}
                        {item.brand && (
                          <p className="text-sm text-blue-600 mt-1">Brand: {item.brand}</p>
                        )}
                        {item.isOptional && (
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mt-1 inline-block">
                            Optional
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'instructions' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <div className="space-y-4">
                  {instructions.map((step, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && nutrition && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Nutrition Information</h2>
                <div className="bg-white border-2 border-black p-4 font-mono text-sm">
                  <div className="text-xl font-bold border-b-4 border-black pb-1 mb-2">
                    Nutrition Facts
                  </div>
                  <div className="text-base mb-2">
                    Servings per recipe: {Math.round(recipe.servings * scaleValue)}
                  </div>
                  <div className="border-b border-black pb-2 mb-2">
                    <span className="text-base font-bold">Serving size: 1 portion</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xl font-bold border-b-4 border-black pb-1">
                      <span>Calories</span>
                      <span>{Math.round(nutrition.calories / (recipe.servings * scaleValue))}</span>
                    </div>
                    
                    <div className="text-right text-sm font-bold">% Daily Value*</div>
                    
                    <div className="flex justify-between border-b border-gray-300">
                      <span className="font-bold">Total Fat</span>
                      <span>{Math.round(nutrition.fat / (recipe.servings * scaleValue))}g</span>
                    </div>
                    
                    <div className="flex justify-between border-b border-gray-300">
                      <span className="font-bold">Protein</span>
                      <span>{Math.round(nutrition.protein / (recipe.servings * scaleValue))}g</span>
                    </div>
                    
                    <div className="flex justify-between border-b border-gray-300">
                      <span className="font-bold">Total Carbohydrate</span>
                      <span>{Math.round(nutrition.carbs / (recipe.servings * scaleValue))}g</span>
                    </div>
                    
                    <div className="flex justify-between ml-4">
                      <span>Dietary Fiber</span>
                      <span>{Math.round(nutrition.fiber / (recipe.servings * scaleValue))}g</span>
                    </div>
                    
                    <div className="flex justify-between ml-4 border-b border-gray-300">
                      <span>Total Sugars</span>
                      <span>{Math.round(nutrition.sugar / (recipe.servings * scaleValue))}g</span>
                    </div>
                    
                    <div className="flex justify-between border-b-4 border-black">
                      <span className="font-bold">Sodium</span>
                      <span>{Math.round(nutrition.sodium / (recipe.servings * scaleValue))}mg</span>
                    </div>
                  </div>
                  
                  <div className="text-xs mt-4 border-t border-black pt-2">
                    * Percent Daily Values are based on a 2000 calorie diet.
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Nutrition values are calculated from ingredient data and may vary based on specific brands and preparation methods.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {recipe.isArfidFriendly && recipe.arfidNotes && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">ARFID-Friendly Notes</h3>
                <p className="text-green-700 text-sm">{recipe.arfidNotes}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Recipe Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">By:</span>
                  <span>{recipe.user.name || recipe.user.username || 'Anonymous'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visibility:</span>
                  <span className="capitalize">{recipe.visibility}</span>
                </div>
              </div>
            </div>

            {nutrition && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3">Quick Nutrition</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Calories:</span>
                    <span className="font-semibold">{Math.round(nutrition.calories)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per Serving:</span>
                    <span className="font-semibold">{Math.round(nutrition.calories / (recipe.servings * scaleValue))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span>{Math.round(nutrition.protein)}g total</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs:</span>
                    <span>{Math.round(nutrition.carbs)}g total</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat:</span>
                    <span>{Math.round(nutrition.fat)}g total</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
