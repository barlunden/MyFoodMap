import React, { useState, useEffect } from 'react';

// Get API base URL from environment
const IS_PRODUCTION = import.meta.env.MODE === 'production';
const getApiBaseUrl = () => IS_PRODUCTION 
  ? (import.meta.env.PUBLIC_API_URL || 'https://myfoodmap-production.up.railway.app/api')
  : (import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api');

interface SafeFood {
  id: string;
  foodName: string;
  category: string;
  preparationNotes?: string;
  textureNotes?: string;
  brandPreference?: string;
}

interface AddLogEntryProps {
  onLogAdded?: () => void;
}

const AddLogEntry: React.FC<AddLogEntryProps> = ({ onLogAdded }) => {
  const [activeTab, setActiveTab] = useState<'meal' | 'safefood' | 'lockdown'>('meal');
  const [safeFoods, setSafeFoods] = useState<SafeFood[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Meal log form state
  const [mealForm, setMealForm] = useState({
    safeFoodId: '',
    mealDate: new Date().toISOString().slice(0, 16),
    mealType: 'lunch',
    portionEaten: 'most',
    weightGrams: '',
    energyBefore: 3,
    energyAfter: 3,
    location: 'home',
    successFactors: '',
    notes: ''
  });

  // Safe food form state
  const [safeFoodForm, setSafeFoodForm] = useState({
    foodName: '',
    dateFirstAccepted: new Date().toISOString().slice(0, 10),
    category: 'other',
    preparationNotes: '',
    textureNotes: '',
    brandPreference: '',
    notes: ''
  });

  // Lockdown log form state
  const [lockdownForm, setLockdownForm] = useState({
    incidentDate: new Date().toISOString().slice(0, 16),
    incidentTime: new Date().toTimeString().slice(0, 5),
    durationMinutes: '',
    energyLevelBefore: 3,
    triggers: '',
    behaviorsObserved: '',
    resolutionStrategy: '',
    resolutionTimeMinutes: '',
    familyImpactLevel: 3,
    notes: '',
    lessonsLearned: ''
  });

  // Load safe foods for meal logging
  useEffect(() => {
    const fetchSafeFoods = async () => {
      try {
        // Use the logs endpoint for safe foods without auth
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/logs/safe-foods`);
        if (response.ok) {
          const foods = await response.json();
          setSafeFoods(foods);
        }
      } catch (err) {
        console.error('Error fetching safe foods:', err);
      }
    };

    if (activeTab === 'meal') {
      fetchSafeFoods();
    }
  }, [activeTab]);

  const resetForms = () => {
    setMealForm({
      safeFoodId: '',
      mealDate: new Date().toISOString().slice(0, 16),
      mealType: 'lunch',
      portionEaten: 'most',
      weightGrams: '',
      energyBefore: 3,
      energyAfter: 3,
      location: 'home',
      successFactors: '',
      notes: ''
    });

    setSafeFoodForm({
      foodName: '',
      dateFirstAccepted: new Date().toISOString().slice(0, 10),
      category: 'other',
      preparationNotes: '',
      textureNotes: '',
      brandPreference: '',
      notes: ''
    });

    setLockdownForm({
      incidentDate: new Date().toISOString().slice(0, 16),
      incidentTime: new Date().toTimeString().slice(0, 5),
      durationMinutes: '',
      energyLevelBefore: 3,
      triggers: '',
      behaviorsObserved: '',
      resolutionStrategy: '',
      resolutionTimeMinutes: '',
      familyImpactLevel: 3,
      notes: '',
      lessonsLearned: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      
      if (activeTab === 'meal') {
        if (!mealForm.safeFoodId) {
          throw new Error('Please select a safe food');
        }
        
        response = await fetch(`${getApiBaseUrl()}/logs/meals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...mealForm,
            weightGrams: mealForm.weightGrams ? parseFloat(mealForm.weightGrams) : null,
            energyBefore: parseInt(mealForm.energyBefore.toString()),
            energyAfter: parseInt(mealForm.energyAfter.toString())
          })
        });
      } else if (activeTab === 'safefood') {
        if (!safeFoodForm.foodName.trim()) {
          throw new Error('Please enter a food name');
        }
        
        response = await fetch(`${getApiBaseUrl()}/logs/safe-foods`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...safeFoodForm,
            dateFirstAccepted: new Date(safeFoodForm.dateFirstAccepted)
          })
        });
      } else if (activeTab === 'lockdown') {
        response = await fetch(`${getApiBaseUrl()}/logs/lockdowns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...lockdownForm,
            durationMinutes: lockdownForm.durationMinutes ? parseInt(lockdownForm.durationMinutes) : null,
            resolutionTimeMinutes: lockdownForm.resolutionTimeMinutes ? parseInt(lockdownForm.resolutionTimeMinutes) : null,
            energyLevelBefore: parseInt(lockdownForm.energyLevelBefore.toString()),
            familyImpactLevel: parseInt(lockdownForm.familyImpactLevel.toString())
          })
        });
      }

      if (response && response.ok) {
        setSuccess(`${activeTab === 'meal' ? 'Meal log' : activeTab === 'safefood' ? 'Safe food' : 'Challenge episode'} added successfully!`);
        resetForms();
        if (onLogAdded) onLogAdded();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to save entry');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const energyLevels = [
    { value: 1, label: '1 - Very Low' },
    { value: 2, label: '2 - Low' },
    { value: 3, label: '3 - Moderate' },
    { value: 4, label: '4 - High' },
    { value: 5, label: '5 - Very High' }
  ];

  const portionOptions = [
    { value: 'none', label: 'None' },
    { value: 'few-bites', label: 'Few Bites' },
    { value: 'half', label: 'Half' },
    { value: 'most', label: 'Most' },
    { value: 'all', label: 'All' }
  ];

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];

  const categories = [
    { value: 'protein', label: 'Protein' },
    { value: 'carb', label: 'Carbohydrate' },
    { value: 'vegetable', label: 'Vegetable' },
    { value: 'fruit', label: 'Fruit' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'snack', label: 'Snack' },
    { value: 'other', label: 'Other' }
  ];

  const locations = [
    { value: 'home', label: 'Home' },
    { value: 'school', label: 'School' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'friend', label: "Friend's House" },
    { value: 'family', label: 'Family Gathering' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('meal')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'meal'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🍽️ Log Meal
          </button>
          <button
            onClick={() => setActiveTab('safefood')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'safefood'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ✅ Add Safe Food
          </button>
          <button
            onClick={() => setActiveTab('lockdown')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'lockdown'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⚠️ Log Challenge Episode
          </button>
        </nav>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meal Log Form */}
          {activeTab === 'meal' && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Safe Food *</label>
                  <select
                    value={mealForm.safeFoodId}
                    onChange={(e) => setMealForm(prev => ({ ...prev, safeFoodId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select a safe food...</option>
                    {safeFoods.map(food => (
                      <option key={food.id} value={food.id}>
                        {food.foodName} ({food.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                  <select
                    value={mealForm.mealType}
                    onChange={(e) => setMealForm(prev => ({ ...prev, mealType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {mealTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={mealForm.mealDate}
                    onChange={(e) => setMealForm(prev => ({ ...prev, mealDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portion Eaten</label>
                  <select
                    value={mealForm.portionEaten}
                    onChange={(e) => setMealForm(prev => ({ ...prev, portionEaten: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {portionOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (grams)</label>
                  <input
                    type="number"
                    value={mealForm.weightGrams}
                    onChange={(e) => setMealForm(prev => ({ ...prev, weightGrams: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 150"
                    min="0"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional: Weight of the food portion</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energy Before</label>
                  <select
                    value={mealForm.energyBefore}
                    onChange={(e) => setMealForm(prev => ({ ...prev, energyBefore: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {energyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energy After</label>
                  <select
                    value={mealForm.energyAfter}
                    onChange={(e) => setMealForm(prev => ({ ...prev, energyAfter: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {energyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={mealForm.location}
                    onChange={(e) => setMealForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {locations.map(location => (
                      <option key={location.value} value={location.value}>{location.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Success Factors</label>
                <input
                  type="text"
                  value={mealForm.successFactors}
                  onChange={(e) => setMealForm(prev => ({ ...prev, successFactors: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="What helped make this meal successful?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={mealForm.notes}
                  onChange={(e) => setMealForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Additional notes about this meal..."
                />
              </div>
            </>
          )}

          {/* Safe Food Form */}
          {activeTab === 'safefood' && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Food Name *</label>
                  <input
                    type="text"
                    value={safeFoodForm.foodName}
                    onChange={(e) => setSafeFoodForm(prev => ({ ...prev, foodName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Chicken Nuggets"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={safeFoodForm.category}
                    onChange={(e) => setSafeFoodForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date First Accepted</label>
                  <input
                    type="date"
                    value={safeFoodForm.dateFirstAccepted}
                    onChange={(e) => setSafeFoodForm(prev => ({ ...prev, dateFirstAccepted: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Preference</label>
                  <input
                    type="text"
                    value={safeFoodForm.brandPreference}
                    onChange={(e) => setSafeFoodForm(prev => ({ ...prev, brandPreference: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Tyson brand only"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Notes</label>
                  <input
                    type="text"
                    value={safeFoodForm.preparationNotes}
                    onChange={(e) => setSafeFoodForm(prev => ({ ...prev, preparationNotes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Baked, not fried"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Texture Notes</label>
                  <input
                    type="text"
                    value={safeFoodForm.textureNotes}
                    onChange={(e) => setSafeFoodForm(prev => ({ ...prev, textureNotes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Crispy outside, tender inside"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={safeFoodForm.notes}
                  onChange={(e) => setSafeFoodForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about this safe food..."
                />
              </div>
            </>
          )}

          {/* Lockdown Log Form */}
          {activeTab === 'lockdown' && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Incident Date & Time</label>
                  <input
                    type="datetime-local"
                    value={lockdownForm.incidentDate}
                    onChange={(e) => setLockdownForm(prev => ({ ...prev, incidentDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={lockdownForm.durationMinutes}
                    onChange={(e) => setLockdownForm(prev => ({ ...prev, durationMinutes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="How long did it last?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level Before</label>
                  <select
                    value={lockdownForm.energyLevelBefore}
                    onChange={(e) => setLockdownForm(prev => ({ ...prev, energyLevelBefore: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {energyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Family Impact Level</label>
                  <select
                    value={lockdownForm.familyImpactLevel}
                    onChange={(e) => setLockdownForm(prev => ({ ...prev, familyImpactLevel: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {energyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Time (minutes)</label>
                  <input
                    type="number"
                    value={lockdownForm.resolutionTimeMinutes}
                    onChange={(e) => setLockdownForm(prev => ({ ...prev, resolutionTimeMinutes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="How long to resolve?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Triggers</label>
                <textarea
                  value={lockdownForm.triggers}
                  onChange={(e) => setLockdownForm(prev => ({ ...prev, triggers: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="What triggered this episode?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Behaviors Observed</label>
                <textarea
                  value={lockdownForm.behaviorsObserved}
                  onChange={(e) => setLockdownForm(prev => ({ ...prev, behaviorsObserved: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="What behaviors were observed?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Strategy</label>
                <textarea
                  value={lockdownForm.resolutionStrategy}
                  onChange={(e) => setLockdownForm(prev => ({ ...prev, resolutionStrategy: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="What helped resolve the situation?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lessons Learned</label>
                <textarea
                  value={lockdownForm.lessonsLearned}
                  onChange={(e) => setLockdownForm(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="What can be done differently next time?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={lockdownForm.notes}
                  onChange={(e) => setLockdownForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Any additional observations or notes..."
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForms}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 text-white rounded-md transition-colors flex items-center space-x-2 ${
                activeTab === 'meal' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : activeTab === 'safefood'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>
                {isSubmitting 
                  ? 'Saving...' 
                  : `Add ${activeTab === 'meal' ? 'Meal Log' : activeTab === 'safefood' ? 'Safe Food' : 'Challenge Log'}`
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLogEntry;