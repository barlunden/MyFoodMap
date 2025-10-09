import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';

interface FoodEntry {
  id?: string;
  date: string;
  time: string;
  food: string;
  foodId?: string; // Reference to ingredient in database
  amount: string;
  amountInGrams?: number; // Actual amount for calculation
  notes?: string;
  // Calculated nutrition (per entry)
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface Ingredient {
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
}

const FoodDiary: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  
  // Amount options with gram estimates
  const amountOptions = [
    { label: '🔵 Small (a bite/sip)', value: 'Small', grams: 10 },
    { label: '🟡 Medium (normal portion)', value: 'Medium', grams: 50 },
    { label: '🟢 Large (big portion)', value: 'Large', grams: 100 },
    { label: '⭐ All (ate everything)', value: 'All', grams: 150 },
    { label: '📏 Custom amount', value: 'Custom', grams: 0 }
  ];
  
  // Common foods - can be populated from database later
  // For now, we'll skip this to avoid build warnings

  const [newEntry, setNewEntry] = useState<FoodEntry>({
    date: selectedDate,
    time: new Date().toTimeString().slice(0, 5),
    food: '',
    foodId: '',
    amount: '',
    amountInGrams: 0,
    notes: ''
  });

  // Load entries for selected date
  useEffect(() => {
    loadEntriesForDate(selectedDate);
  }, [selectedDate]);

  // Load ingredients when component mounts
  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const ingredientList = await apiClient.getIngredients();
      setIngredients(ingredientList || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const calculateNutrition = (ingredient: Ingredient, grams: number): Partial<FoodEntry> => {
    if (!ingredient || grams <= 0) return {};
    
    const factor = grams / 100; // Convert per 100g to actual amount
    
    return {
      calories: ingredient.calories ? Math.round(ingredient.calories * factor) : undefined,
      protein: ingredient.protein ? Math.round(ingredient.protein * factor * 10) / 10 : undefined,
      carbs: ingredient.carbs ? Math.round(ingredient.carbs * factor * 10) / 10 : undefined,
      fat: ingredient.fat ? Math.round(ingredient.fat * factor * 10) / 10 : undefined,
    };
  };

  const handleIngredientChange = (ingredientId: string) => {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (ingredient) {
      setSelectedIngredient(ingredient);
      setNewEntry({
        ...newEntry,
        food: ingredient.name,
        foodId: ingredientId
      });
    } else if (ingredientId === 'custom') {
      setSelectedIngredient(null);
      setNewEntry({
        ...newEntry,
        food: '',
        foodId: ''
      });
    }
  };

  const handleAmountChange = (amountValue: string) => {
    const amountOption = amountOptions.find(opt => opt.value === amountValue);
    const grams = amountOption?.grams || 0;
    
    let nutrition = {};
    if (selectedIngredient && grams > 0) {
      nutrition = calculateNutrition(selectedIngredient, grams);
    }
    
    setNewEntry({
      ...newEntry,
      amount: amountValue,
      amountInGrams: grams,
      ...nutrition
    });
  };

  const loadEntriesForDate = (date: string) => {
    // Get from localStorage for now - can be database later
    const storedEntries = localStorage.getItem(`foodDiary_${date}`);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    } else {
      setEntries([]);
    }
  };

  const saveEntry = () => {
    if (!newEntry.food.trim()) return;

    const entryWithId = {
      ...newEntry,
      id: Date.now().toString(),
      date: selectedDate
    };

    const updatedEntries = [...entries, entryWithId];
    setEntries(updatedEntries);
    
    // Save to localStorage
    localStorage.setItem(`foodDiary_${selectedDate}`, JSON.stringify(updatedEntries));
    
    // Reset form
    setNewEntry({
      date: selectedDate,
      time: new Date().toTimeString().slice(0, 5),
      food: '',
      foodId: '',
      amount: '',
      amountInGrams: 0,
      notes: ''
    });
    setSelectedIngredient(null);
    setShowAddForm(false);
  };

  const deleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    setEntries(updatedEntries);
    localStorage.setItem(`foodDiary_${selectedDate}`, JSON.stringify(updatedEntries));
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Food Diary</h2>
          <p className="text-gray-600">You need to be logged in to use the food diary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📖 Food Diary</h1>
          <p className="text-gray-600">Log what is actually eaten each day</p>
        </div>

        {/* Date selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-semibold text-gray-900">
              Select date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add meal
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add meal</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time:
                </label>
                <input
                  type="time"
                  value={newEntry.time}
                  onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food:
                </label>
                <select
                  value={newEntry.foodId || ''}
                  onChange={(e) => handleIngredientChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select food...</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} {ingredient.category && `(${ingredient.category})`}
                    </option>
                  ))}
                  <option value="custom">Other food...</option>
                </select>
              </div>

              {newEntry.foodId === 'custom' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specify food:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter what was eaten..."
                    value={newEntry.food}
                    onChange={(e) => setNewEntry({...newEntry, food: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount:
                </label>
                <select
                  value={newEntry.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select amount...</option>
                  {amountOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {newEntry.amount === 'Custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount in grams:
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g., 75"
                    value={newEntry.amountInGrams || ''}
                    onChange={(e) => {
                      const grams = parseInt(e.target.value) || 0;
                      let nutrition = {};
                      if (selectedIngredient && grams > 0) {
                        nutrition = calculateNutrition(selectedIngredient, grams);
                      }
                      setNewEntry({
                        ...newEntry,
                        amountInGrams: grams,
                        ...nutrition
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Show calculated nutrition if available */}
              {(newEntry.calories || newEntry.protein || newEntry.carbs || newEntry.fat) && (
                <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Calculated Nutrition:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {newEntry.calories && (
                      <div className="text-blue-700">
                        <span className="font-medium">{newEntry.calories}</span> cal
                      </div>
                    )}
                    {newEntry.protein && (
                      <div className="text-blue-700">
                        <span className="font-medium">{newEntry.protein}g</span> protein
                      </div>
                    )}
                    {newEntry.carbs && (
                      <div className="text-blue-700">
                        <span className="font-medium">{newEntry.carbs}g</span> carbs
                      </div>
                    )}
                    {newEntry.fat && (
                      <div className="text-blue-700">
                        <span className="font-medium">{newEntry.fat}g</span> fat
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional):
                </label>
                <input
                  type="text"
                  placeholder="E.g. 'liked it a lot' or 'didn't want more'"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={saveEntry}
                disabled={!newEntry.food.trim() || !newEntry.amount}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Today's entries */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              Meals for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {entries.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No meals recorded for this date
              </div>
            ) : (
              entries
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((entry) => (
                  <div key={entry.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {entry.time}
                          </span>
                          <span className="font-medium text-gray-900">
                            {entry.food}
                          </span>
                          <span className="text-sm text-gray-600">
                            {entry.amount}
                            {entry.amountInGrams && ` (${entry.amountInGrams}g)`}
                          </span>
                        </div>
                        
                        {/* Show nutrition if calculated */}
                        {(entry.calories || entry.protein || entry.carbs || entry.fat) && (
                          <div className="ml-20 flex gap-4 text-xs text-gray-500">
                            {entry.calories && <span>{entry.calories} cal</span>}
                            {entry.protein && <span>{entry.protein}g protein</span>}
                            {entry.carbs && <span>{entry.carbs}g carbs</span>}
                            {entry.fat && <span>{entry.fat}g fat</span>}
                          </div>
                        )}
                        
                        {entry.notes && (
                          <p className="text-sm text-gray-600 mt-1 ml-20">
                            💭 {entry.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEntry(entry.id!)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Quick stats */}
        {entries.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Today's overview:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
                <div className="text-blue-700">meals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {entries.filter(e => e.amount.includes('All')).length}
                </div>
                <div className="text-green-700">finished</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {entries.filter(e => e.amount.includes('Medium')).length}
                </div>
                <div className="text-yellow-700">medium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(entries.map(e => e.food)).size}
                </div>
                <div className="text-purple-700">different foods</div>
              </div>
            </div>
            
            {/* Daily nutrition totals */}
            {(() => {
              const totalCalories = entries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
              const totalProtein = entries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
              const totalCarbs = entries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
              const totalFat = entries.reduce((sum, entry) => sum + (entry.fat || 0), 0);
              
              if (totalCalories > 0 || totalProtein > 0 || totalCarbs > 0 || totalFat > 0) {
                return (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-3">Daily Nutrition Totals:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {totalCalories > 0 && (
                        <div className="text-center bg-white rounded p-3">
                          <div className="text-lg font-bold text-orange-600">{Math.round(totalCalories)}</div>
                          <div className="text-orange-700">calories</div>
                        </div>
                      )}
                      {totalProtein > 0 && (
                        <div className="text-center bg-white rounded p-3">
                          <div className="text-lg font-bold text-red-600">{Math.round(totalProtein * 10) / 10}g</div>
                          <div className="text-red-700">protein</div>
                        </div>
                      )}
                      {totalCarbs > 0 && (
                        <div className="text-center bg-white rounded p-3">
                          <div className="text-lg font-bold text-yellow-600">{Math.round(totalCarbs * 10) / 10}g</div>
                          <div className="text-yellow-700">carbs</div>
                        </div>
                      )}
                      {totalFat > 0 && (
                        <div className="text-center bg-white rounded p-3">
                          <div className="text-lg font-bold text-purple-600">{Math.round(totalFat * 10) / 10}g</div>
                          <div className="text-purple-700">fat</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDiary;