import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';

interface Ingredient {
  id: string;
  name: string;
  category?: string;
  // Nutritional data per 100g
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  // Micronutrients
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  createdAt: string;
  updatedAt: string;
}

interface NutritionFormData {
  name: string;
  category: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
  vitaminA: string;
  vitaminC: string;
  vitaminD: string;
  calcium: string;
  iron: string;
}

const NutritionManager: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = [
    'Protein', 'Vegetable', 'Fruit', 'Grain', 'Dairy', 
    'Fat/Oil', 'Spice/Herb', 'Beverage', 'Snack', 'Other'
  ];

  const [formData, setFormData] = useState<NutritionFormData>({
    name: '',
    category: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    sodium: '',
    vitaminA: '',
    vitaminC: '',
    vitaminD: '',
    calcium: '',
    iron: ''
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const ingredients = await apiClient.getIngredients();
      setIngredients(ingredients || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      const nutritionData = {
        name: formData.name.trim(),
        category: formData.category || null,
        calories: formData.calories ? parseFloat(formData.calories) : null,
        protein: formData.protein ? parseFloat(formData.protein) : null,
        carbs: formData.carbs ? parseFloat(formData.carbs) : null,
        fat: formData.fat ? parseFloat(formData.fat) : null,
        fiber: formData.fiber ? parseFloat(formData.fiber) : null,
        sugar: formData.sugar ? parseFloat(formData.sugar) : null,
        sodium: formData.sodium ? parseFloat(formData.sodium) : null,
        vitaminA: formData.vitaminA ? parseFloat(formData.vitaminA) : null,
        vitaminC: formData.vitaminC ? parseFloat(formData.vitaminC) : null,
        vitaminD: formData.vitaminD ? parseFloat(formData.vitaminD) : null,
        calcium: formData.calcium ? parseFloat(formData.calcium) : null,
        iron: formData.iron ? parseFloat(formData.iron) : null,
      };

      if (editingId) {
        await apiClient.updateIngredient(editingId, nutritionData);
      } else {
        await apiClient.createIngredient(nutritionData);
      }

      resetForm();
      loadIngredients();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert('Error saving ingredient. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', category: '', calories: '', protein: '', carbs: '',
      fat: '', fiber: '', sugar: '', sodium: '', vitaminA: '',
      vitaminC: '', vitaminD: '', calcium: '', iron: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      category: ingredient.category || '',
      calories: ingredient.calories?.toString() || '',
      protein: ingredient.protein?.toString() || '',
      carbs: ingredient.carbs?.toString() || '',
      fat: ingredient.fat?.toString() || '',
      fiber: ingredient.fiber?.toString() || '',
      sugar: ingredient.sugar?.toString() || '',
      sodium: ingredient.sodium?.toString() || '',
      vitaminA: ingredient.vitaminA?.toString() || '',
      vitaminC: ingredient.vitaminC?.toString() || '',
      vitaminD: ingredient.vitaminD?.toString() || '',
      calcium: ingredient.calcium?.toString() || '',
      iron: ingredient.iron?.toString() || '',
    });
    setEditingId(ingredient.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return;
    
    try {
      await apiClient.deleteIngredient(id);
      loadIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Error deleting ingredient. Please try again.');
    }
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nutrition Database</h2>
          <p className="text-gray-600">You need to be logged in to manage nutrition data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍎 Nutrition Database</h1>
          <p className="text-gray-600">Manage nutritional information for ingredients</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              + Add Ingredient
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Ingredient' : 'Add New Ingredient'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Chicken breast, Broccoli, Rice"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Macronutrients */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Macronutrients (per 100g)
                </h4>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.calories}
                      onChange={(e) => setFormData({...formData, calories: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="kcal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protein
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.protein}
                      onChange={(e) => setFormData({...formData, protein: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="g"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carbs
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.carbs}
                      onChange={(e) => setFormData({...formData, carbs: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="g"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fat
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.fat}
                      onChange={(e) => setFormData({...formData, fat: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="g"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiber
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.fiber}
                      onChange={(e) => setFormData({...formData, fiber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="g"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sugar
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.sugar}
                      onChange={(e) => setFormData({...formData, sugar: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="g"
                    />
                  </div>
                </div>
              </div>

              {/* Micronutrients */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Micronutrients (per 100g)
                </h4>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sodium
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.sodium}
                      onChange={(e) => setFormData({...formData, sodium: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vitamin A
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.vitaminA}
                      onChange={(e) => setFormData({...formData, vitaminA: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="mcg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vitamin C
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.vitaminC}
                      onChange={(e) => setFormData({...formData, vitaminC: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vitamin D
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.vitaminD}
                      onChange={(e) => setFormData({...formData, vitaminD: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="mcg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calcium
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.calcium}
                      onChange={(e) => setFormData({...formData, calcium: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Iron
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.iron}
                      onChange={(e) => setFormData({...formData, iron: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="mg"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Save'} Ingredient
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ingredients List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              Ingredients Database ({filteredIngredients.length} items)
            </h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading ingredients...</p>
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || selectedCategory ? 'No ingredients match your filters' : 'No ingredients added yet'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredIngredients.map((ingredient) => (
                <div key={ingredient.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {ingredient.name}
                        </h4>
                        {ingredient.category && (
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {ingredient.category}
                          </span>
                        )}
                      </div>
                      
                      {/* Nutrition Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
                        {ingredient.calories && (
                          <div>
                            <span className="text-gray-600">Calories:</span>
                            <span className="ml-1 font-medium">{ingredient.calories}</span>
                          </div>
                        )}
                        {ingredient.protein && (
                          <div>
                            <span className="text-gray-600">Protein:</span>
                            <span className="ml-1 font-medium">{ingredient.protein}g</span>
                          </div>
                        )}
                        {ingredient.carbs && (
                          <div>
                            <span className="text-gray-600">Carbs:</span>
                            <span className="ml-1 font-medium">{ingredient.carbs}g</span>
                          </div>
                        )}
                        {ingredient.fat && (
                          <div>
                            <span className="text-gray-600">Fat:</span>
                            <span className="ml-1 font-medium">{ingredient.fat}g</span>
                          </div>
                        )}
                        {ingredient.fiber && (
                          <div>
                            <span className="text-gray-600">Fiber:</span>
                            <span className="ml-1 font-medium">{ingredient.fiber}g</span>
                          </div>
                        )}
                        {ingredient.sodium && (
                          <div>
                            <span className="text-gray-600">Sodium:</span>
                            <span className="ml-1 font-medium">{ingredient.sodium}mg</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(ingredient)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionManager;