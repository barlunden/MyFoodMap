import React, { useState, useEffect } from 'react';

// Get API base URL from environment
const IS_PRODUCTION = import.meta.env.MODE === 'production';
const getApiBaseUrl = () => IS_PRODUCTION 
  ? (import.meta.env.PUBLIC_API_URL || 'https://myfoodmap-production.up.railway.app/api')
  : (import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api');

interface SafeFood {
  id: string;
  foodName: string;
  category?: string;
  preparationNotes?: string;
  textureNotes?: string;
  brandPreference?: string;
  personalRating?: number;
  notes?: string;
  isEstablishedSafeFood: boolean;
  timesConsumed: number;
  dateFirstAccepted?: string;
  createdAt: string;
  updatedAt: string;
}

const SafeFoodsManager: React.FC = () => {
  const [safeFoods, setSafeFoods] = useState<SafeFood[]>([]);
  const [filteredSafeFoods, setFilteredSafeFoods] = useState<SafeFood[]>([]);
  const [suggestions, setSuggestions] = useState<SafeFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<SafeFood | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('established');
  
  // Form state
  const [formData, setFormData] = useState({
    foodName: '',
    category: '',
    preparationNotes: '',
    textureNotes: '',
    brandPreference: '',
    personalRating: 5,
    notes: '',
    isEstablishedSafeFood: false
  });

  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    loadSafeFoods();
    loadSuggestions();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [safeFoods, searchTerm, categoryFilter, sortBy]);

  const loadSafeFoods = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/safe-foods`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your safe foods');
        }
        throw new Error('Failed to load safe foods');
      }
      
      const data = await response.json();
      setSafeFoods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load safe foods');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Skip if not authenticated
      
      const response = await fetch(`${apiBaseUrl}/safe-foods/suggestions/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  const filterAndSort = () => {
    let filtered = safeFoods.filter(food => {
      const matchesSearch = food.foodName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || food.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'established':
          if (a.isEstablishedSafeFood !== b.isEstablishedSafeFood) {
            return b.isEstablishedSafeFood ? 1 : -1;
          }
          return b.timesConsumed - a.timesConsumed;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'alpha':
          return a.foodName.localeCompare(b.foodName);
        case 'rating':
          return (b.personalRating || 0) - (a.personalRating || 0);
        default:
          return 0;
      }
    });

    setFilteredSafeFoods(filtered);
  };

  const openAddModal = () => {
    setEditingFood(null);
    setFormData({
      foodName: '',
      category: '',
      preparationNotes: '',
      textureNotes: '',
      brandPreference: '',
      personalRating: 5,
      notes: '',
      isEstablishedSafeFood: false
    });
    setShowModal(true);
  };

  const openEditModal = (food: SafeFood) => {
    setEditingFood(food);
    setFormData({
      foodName: food.foodName,
      category: food.category || '',
      preparationNotes: food.preparationNotes || '',
      textureNotes: food.textureNotes || '',
      brandPreference: food.brandPreference || '',
      personalRating: food.personalRating || 5,
      notes: food.notes || '',
      isEstablishedSafeFood: food.isEstablishedSafeFood
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to manage safe foods');
      }
      
      const url = editingFood 
        ? `${apiBaseUrl}/safe-foods/${editingFood.id}`
        : `${apiBaseUrl}/safe-foods`;
      
      const method = editingFood ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to manage safe foods');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save safe food');
      }
      
      setShowModal(false);
      loadSafeFoods();
      
      // Show success message
      alert(editingFood ? 'Safe food updated!' : 'Safe food added!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save safe food');
    }
  };

  const deleteSafeFood = async (id: string) => {
    if (!confirm('Are you sure you want to delete this safe food?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to manage safe foods');
      }
      
      const response = await fetch(`${apiBaseUrl}/safe-foods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to manage safe foods');
        }
        throw new Error('Failed to delete safe food');
      }
      
      loadSafeFoods();
      alert('Safe food deleted');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete safe food');
    }
  };

  const promoteSafeFood = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to promote foods');
      }
      
      const response = await fetch(`${apiBaseUrl}/safe-foods/${id}/promote`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to promote foods');
        }
        throw new Error('Failed to promote food');
      }
      
      loadSafeFoods();
      loadSuggestions();
      alert('Food promoted to safe food! 🎉');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to promote food');
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      'protein': 'bg-red-100 text-red-800',
      'carb': 'bg-yellow-100 text-yellow-800',
      'fruit': 'bg-pink-100 text-pink-800',
      'vegetable': 'bg-green-100 text-green-800',
      'dairy': 'bg-blue-100 text-blue-800',
      'snack': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading safe foods...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={loadSafeFoods}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Safe Foods</h1>
              <p className="text-gray-600">Manage your trusted foods and discover new safe options</p>
            </div>
            <button 
              onClick={openAddModal}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add Safe Food
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">🎉 New Safe Food Suggestions!</h3>
            <p className="text-yellow-700 mb-3">These foods have been consumed 5+ times. Consider adding them as safe foods:</p>
            <div className="space-y-2">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                  <div>
                    <span className="font-medium">{suggestion.foodName}</span>
                    <span className="text-sm text-gray-500 ml-2">(consumed {suggestion.timesConsumed} times)</span>
                  </div>
                  <button 
                    onClick={() => promoteSafeFood(suggestion.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Add as Safe Food
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-0">
              <input 
                type="text" 
                placeholder="Search safe foods..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Categories</option>
              <option value="protein">Protein</option>
              <option value="carb">Carbohydrates</option>
              <option value="fruit">Fruits</option>
              <option value="vegetable">Vegetables</option>
              <option value="dairy">Dairy</option>
              <option value="snack">Snacks</option>
            </select>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="established">Established First</option>
              <option value="recent">Most Recent</option>
              <option value="alpha">Alphabetical</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Safe Foods Grid */}
        {filteredSafeFoods.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Safe Foods Yet</h3>
            <p className="text-gray-500 mb-6">Start building your safe foods list by adding foods you trust and enjoy.</p>
            <button 
              onClick={openAddModal}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              Add Your First Safe Food
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSafeFoods.map(food => {
              const rating = food.personalRating || 0;
              const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(10 - Math.floor(rating));
              
              return (
                <div key={food.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{food.foodName}</h3>
                      {food.isEstablishedSafeFood ? 
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Established</span> : 
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Exploring</span>
                      }
                    </div>
                    
                    {food.category && (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(food.category)} mb-2`}>
                        {food.category}
                      </span>
                    )}
                    
                    {rating > 0 && (
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400 text-sm mr-1">{stars.slice(0, rating)}</span>
                        <span className="text-gray-300 text-sm">{stars.slice(rating)}</span>
                        <span className="text-gray-500 text-sm ml-2">{rating}/10</span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <div>Consumed: {food.timesConsumed} times</div>
                      {food.dateFirstAccepted && (
                        <div>Safe since: {new Date(food.dateFirstAccepted).toLocaleDateString()}</div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {food.preparationNotes && (
                        <p className="text-sm text-gray-600 mb-2"><strong>Prep:</strong> {food.preparationNotes}</p>
                      )}
                      {food.textureNotes && (
                        <p className="text-sm text-gray-600 mb-2"><strong>Texture:</strong> {food.textureNotes}</p>
                      )}
                      {food.brandPreference && (
                        <p className="text-sm text-gray-600 mb-2"><strong>Brand:</strong> {food.brandPreference}</p>
                      )}
                      {food.notes && (
                        <p className="text-sm text-gray-600 mb-2">{food.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => openEditModal(food)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteSafeFood(food.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingFood ? 'Edit Safe Food' : 'Add Safe Food'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.foodName}
                      onChange={(e) => setFormData(prev => ({ ...prev, foodName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g. Mamma's Homemade Chicken Nuggets"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select a category</option>
                      <option value="protein">Protein</option>
                      <option value="carb">Carbohydrates</option>
                      <option value="fruit">Fruits</option>
                      <option value="vegetable">Vegetables</option>
                      <option value="dairy">Dairy</option>
                      <option value="snack">Snacks</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Notes</label>
                    <textarea 
                      rows={2}
                      value={formData.preparationNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, preparationNotes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="How must this food be prepared?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texture Notes</label>
                    <textarea 
                      rows={2}
                      value={formData.textureNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, textureNotes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Important texture requirements"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Preference</label>
                    <input 
                      type="text" 
                      value={formData.brandPreference}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandPreference: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Specific brand that works"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Personal Rating (1-10)</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={formData.personalRating}
                      onChange={(e) => setFormData(prev => ({ ...prev, personalRating: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 (Dislike)</span>
                      <span>{formData.personalRating}</span>
                      <span>10 (Love)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea 
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Any other important notes"
                    />
                  </div>

                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData.isEstablishedSafeFood}
                      onChange={(e) => setFormData(prev => ({ ...prev, isEstablishedSafeFood: e.target.checked }))}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      This is an established safe food
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeFoodsManager;