import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import type { Recipe as ApiRecipe } from '../lib/api';

interface Ingredient {
  id: string;
  name: string;
  // legg til andre felt ved behov
}

// Use the Recipe type from api for consistency
type Recipe = ApiRecipe;

interface SafeFood {
  id: string;
  foodName: string;
  brandPreference?: string;
  // legg til andre felt ved behov
}

interface MealLog {
  id: string;
  userId: string;
  safeFoodId?: string;
  recipeId?: string;
  ingredientId?: string;
  mealDate: string;
  mealType: string;
  portionEaten: string;
  energyBefore?: number;
  energyAfter?: number;
  location?: string;
  successFactors?: string;
  notes?: string;
  createdAt: string;
  amountEatenGrams?: number;
  safeFood?: SafeFood;
  recipe?: Recipe;
  ingredient?: Ingredient;
  nutrition?: any;
}

interface MealLoggerProps {
  className?: string;
}

type MealEntityType = 'safeFood' | 'recipe' | 'ingredient';


interface NewMealLog {
  entityType: MealEntityType;
  safeFoodId?: string;
  recipeId?: string;
  ingredientId?: string;
  mealType: string;
  amountEatenGrams: string;
  energyBefore?: number;
  energyAfter?: number;
  location?: string;
  successFactors?: string;
  notes?: string;
}

export default function MealLogger({ className = '' }: MealLoggerProps) {
  const [safeFoods, setSafeFoods] = useState<SafeFood[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeal, setNewMeal] = useState<NewMealLog>({
    entityType: 'safeFood',
    safeFoodId: '',
    recipeId: '',
    ingredientId: '',
    mealType: 'breakfast',
    amountEatenGrams: '',
    energyBefore: undefined,
    energyAfter: undefined,
    location: 'home',
    successFactors: '',
    notes: ''
  });

  useEffect(() => {
    // Hent trygge matvarer, oppskrifter, ingredienser og meal logs frå backend
    Promise.all([
      apiClient.getSafeFoods(),
      apiClient.getRecipes ? apiClient.getRecipes() : Promise.resolve([]),
      apiClient.getIngredients ? apiClient.getIngredients() : Promise.resolve([]),
      apiClient.getMealLogs({})
    ])
      .then(([foods, recipes, ingredients, logs]) => {
        setSafeFoods(foods);
        setRecipes(recipes);
        setIngredients(ingredients);
        setMealLogs(logs as MealLog[]);
      })
      .catch(() => {
        setSafeFoods([]);
        setRecipes([]);
        setIngredients([]);
        setMealLogs([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🍎' },
  ];

  const portionOptions = [
    { value: 'none', label: 'Not eaten', color: 'text-red-600', bg: 'bg-red-100' },
    { value: 'few-bites', label: 'A few bites', color: 'text-orange-600', bg: 'bg-orange-100' },
    { value: 'half', label: 'Half portion', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'most', label: 'Most of it', color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'all', label: 'All', color: 'text-green-600', bg: 'bg-green-100' },
  ];

  const energyLevels = [1, 2, 3, 4, 5];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getPortionStyle = (portion: string) => {
    const option = portionOptions.find(p => p.value === portion);
    return option ? `${option.color} ${option.bg}` : 'text-gray-600 bg-gray-100';
  };

  const getMealTypeInfo = (type: string) => {
    return mealTypes.find(m => m.value === type) || { value: type, label: type, icon: '🍽️' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let mealToLog: any = {
      mealDate: new Date().toISOString(),
      mealType: newMeal.mealType,
      portionEaten: 'all', // Default to 'all' for required backend field
      amountEatenGrams: newMeal.amountEatenGrams ? Number(newMeal.amountEatenGrams) : undefined,
      energyBefore: newMeal.energyBefore,
      energyAfter: newMeal.energyAfter,
      location: newMeal.location,
      successFactors: newMeal.successFactors,
      notes: newMeal.notes
    };

    if (newMeal.entityType === 'safeFood') {
      if (!newMeal.safeFoodId) return;
      mealToLog.safeFoodId = newMeal.safeFoodId;
    } else if (newMeal.entityType === 'recipe') {
      if (!newMeal.recipeId) return;
      mealToLog.recipeId = newMeal.recipeId;
    } else if (newMeal.entityType === 'ingredient') {
      if (!newMeal.ingredientId) return;
      mealToLog.ingredientId = newMeal.ingredientId;
    }

    try {
      const savedMeal = await apiClient.logMeal(mealToLog);
      setMealLogs([savedMeal as MealLog, ...mealLogs]);
      setNewMeal({
        entityType: 'safeFood',
        safeFoodId: '',
        recipeId: '',
        ingredientId: '',
        mealType: 'breakfast',
        amountEatenGrams: '',
        energyBefore: undefined,
        energyAfter: undefined,
        location: 'home',
        successFactors: '',
        notes: ''
      });
      setShowAddForm(false);
    } catch (error) {
      alert('Failed to log meal');
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meal Log</h2>
          <p className="text-gray-600 mt-1">
            Keep track of meals and progress
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Log meal</span>
        </button>
      </div>

      {/* Add Meal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              {/* Meal Entity Type Selection */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What are you logging? *
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${newMeal.entityType === 'safeFood' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                      onClick={() => setNewMeal({ ...newMeal, entityType: 'safeFood', safeFoodId: '', recipeId: '', ingredientId: '' })}
                    >Safe food</button>
                    <button
                      type="button"
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${newMeal.entityType === 'recipe' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                      onClick={() => setNewMeal({ ...newMeal, entityType: 'recipe', safeFoodId: '', recipeId: '', ingredientId: '' })}
                    >Recipe</button>
                    <button
                      type="button"
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${newMeal.entityType === 'ingredient' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                      onClick={() => setNewMeal({ ...newMeal, entityType: 'ingredient', safeFoodId: '', recipeId: '', ingredientId: '' })}
                    >Ingredient</button>
                  </div>
                </div>
                {newMeal.entityType === 'safeFood' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Which safe food? *
                    </label>
                    <select
                      value={newMeal.safeFoodId}
                      onChange={(e) => setNewMeal({ ...newMeal, safeFoodId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Choose the food eaten...</option>
                      {safeFoods.map(food => (
                        <option key={food.id} value={food.id}>
                          {food.foodName} {food.brandPreference ? `(${food.brandPreference})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {newMeal.entityType === 'recipe' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Which recipe? *
                    </label>
                    <select
                      value={newMeal.recipeId}
                      onChange={(e) => setNewMeal({ ...newMeal, recipeId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Choose a recipe...</option>
                      {recipes.map(recipe => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {newMeal.entityType === 'ingredient' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Which ingredient? *
                    </label>
                    <select
                      value={newMeal.ingredientId}
                      onChange={(e) => setNewMeal({ ...newMeal, ingredientId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Choose an ingredient...</option>
                      {ingredients.map(ingredient => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Meal Type and Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal type *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {mealTypes.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setNewMeal({ ...newMeal, mealType: type.value })}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            newMeal.mealType === type.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg mb-1">{type.icon}</div>
                            <div>{type.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount eaten (grams or ml) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={newMeal.amountEatenGrams}
                      onChange={e => setNewMeal({ ...newMeal, amountEatenGrams: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. 200"
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(() => {
                        if (newMeal.entityType === 'safeFood') {
                          const food = safeFoods.find(f => f.id === newMeal.safeFoodId);
                          return food && food.brandPreference ? `Standard serving: ${food.brandPreference}` : '';
                        }
                        if (newMeal.entityType === 'recipe') {
                          const recipe = recipes.find(r => r.id === newMeal.recipeId);
                          return recipe && recipe.title ? `Standard serving: ${recipe.title}` : '';
                        }
                        if (newMeal.entityType === 'ingredient') {
                          const ing = ingredients.find(i => i.id === newMeal.ingredientId);
                          return ing && ing.name ? `Standard serving: ${ing.name}` : '';
                        }
                        return '';
                      })()}
                    </div>
                  </div>
                </div>
                {/* Energy Levels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Energy level before meal
                    </label>
                    <div className="flex space-x-2">
                      {energyLevels.map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setNewMeal({ ...newMeal, energyBefore: level })}
                          className={`w-10 h-10 rounded-full border-2 font-medium transition-colors ${
                            newMeal.energyBefore === level
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300 text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Energy level after meal
                    </label>
                    <div className="flex space-x-2">
                      {energyLevels.map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setNewMeal({ ...newMeal, energyAfter: level })}
                          className={`w-10 h-10 rounded-full border-2 font-medium transition-colors ${
                            newMeal.energyAfter === level
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-gray-300 text-gray-700 hover:border-green-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Where?
                    </label>
                  <input
                    type="text"
                    value={newMeal.location}
                    onChange={(e) => setNewMeal({ ...newMeal, location: e.target.value })}
                    placeholder="home, school, restaurant..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {/* Success Factors */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What helped make this meal successful?
                    </label>
                  <input
                    type="text"
                    value={newMeal.successFactors}
                    onChange={(e) => setNewMeal({ ...newMeal, successFactors: e.target.value })}
                    placeholder="calm atmosphere, good timing, favorite food..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newMeal.notes}
                    onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
                    placeholder="Additional notes about how the meal went..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Log meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Recent Meal Logs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent meals</h3>
        {mealLogs.map(log => {
          const mealTypeInfo = getMealTypeInfo(log.mealType);
          const portionStyle = getPortionStyle(log.portionEaten);
          let entityLabel = '';
          if (log.safeFood) entityLabel = log.safeFood.foodName;
          else if (log.recipe) entityLabel = log.recipe.title;
          else if (log.ingredient) entityLabel = log.ingredient.name;
          // Show amount eaten
          let amountEaten = log.amountEatenGrams || '';
          return (
            <div
              key={log.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-xl">{mealTypeInfo.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {mealTypeInfo.label} - {formatDate(log.mealDate)}
                      </h4>
                      <p className="text-gray-600">{entityLabel}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        {amountEaten ? `${amountEaten} g/ml` : '—'}
                      </span>
                    </div>
                    {(log.energyBefore || log.energyAfter) && (
                      <div className="flex items-center space-x-4">
                        {log.energyBefore && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-500">Before:</span>
                            <div className="flex space-x-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 rounded-full ${
                                    i < log.energyBefore! ? 'bg-blue-400' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {log.energyAfter && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-500">Etter:</span>
                            <div className="flex space-x-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 rounded-full ${
                                    i < log.energyAfter! ? 'bg-green-400' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {log.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{log.location}</span>
                      </div>
                    )}
                  </div>
                  {/* Vis næringsinnhold hvis tilgjengelig */}
                  {log.nutrition && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-blue-700">Nutrition: </span>
                      <span className="text-sm text-gray-600">
                        {Object.entries(log.nutrition).map(([key, value]) => (
                          <span key={key} className="mr-2">{key}: {String(value)}</span>
                        ))}
                      </span>
                    </div>
                  )}
                  {log.successFactors && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-green-700">Success factors: </span>
                      <span className="text-sm text-gray-600">{log.successFactors}</span>
                    </div>
                  )}
                  {log.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Notes: </span>
                      <span className="text-sm text-gray-600">{log.notes}</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(log.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {mealLogs.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No meals logged yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by logging your first meal.</p>
        </div>
      )}
    </>
  );
}
