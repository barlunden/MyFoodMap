import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

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
  mealDate: string;
  mealType: string;
  portionEaten: string;
  energyBefore?: number;
  energyAfter?: number;
  location?: string;
  successFactors?: string;
  notes?: string;
  createdAt: string;
  safeFood: SafeFood;
}

interface MealLoggerProps {
  className?: string;
}

interface NewMealLog {
  safeFoodId: string;
  mealType: string;
  portionEaten: string;
  energyBefore?: number;
  energyAfter?: number;
  location?: string;
  successFactors?: string;
  notes?: string;
}

export default function MealLogger({ className = '' }: MealLoggerProps) {
  const [safeFoods, setSafeFoods] = useState<SafeFood[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeal, setNewMeal] = useState<NewMealLog>({
    safeFoodId: '',
    mealType: 'breakfast',
    portionEaten: 'all',
    energyBefore: undefined,
    energyAfter: undefined,
    location: 'home',
    successFactors: '',
    notes: ''
  });

  useEffect(() => {
    // Hent trygge matvarer og meal logs frå backend
    Promise.all([
      apiClient.getSafeFoods(),
      apiClient.getMealLogs({}) // evt. legg til filtrering
    ])
      .then(([foods, logs]) => {
        setSafeFoods(foods);
        // Filter out logs where safeFood is missing to satisfy the type
        setMealLogs(
          logs.filter((log: any) => log.safeFood) as MealLog[]
        );
      })
      .catch(() => {
        setSafeFoods([]);
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
      return 'I dag';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('nb-NO', {
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

    const selectedSafeFood = safeFoods.find(f => f.id === newMeal.safeFoodId);
    if (!selectedSafeFood) return;

    const mealToLog = {
      safeFoodId: newMeal.safeFoodId,
      mealDate: new Date().toISOString(),
      mealType: newMeal.mealType,
      portionEaten: newMeal.portionEaten,
      energyBefore: newMeal.energyBefore,
      energyAfter: newMeal.energyAfter,
      location: newMeal.location,
      successFactors: newMeal.successFactors,
      notes: newMeal.notes
    };

    try {
      const savedMeal = await apiClient.logMeal(mealToLog);
      if (savedMeal.safeFood) {
        setMealLogs([savedMeal as MealLog, ...mealLogs]);
      }
      setNewMeal({
        safeFoodId: '',
        mealType: 'breakfast',
        portionEaten: 'all',
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
    <div className={`space-y-6 ${className}`}>
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Log new meal</h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Safe Food Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hvilken trygg matvare? *
                  </label>
                  <select
                    value={newMeal.safeFoodId}
                    onChange={(e) => setNewMeal({ ...newMeal, safeFoodId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Velg en matvare...</option>
                    {safeFoods.map(food => (
                      <option key={food.id} value={food.id}>
                        {food.foodName} {food.brandPreference ? `(${food.brandPreference})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meal Type and Portion */}
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
                      How much was eaten? *
                    </label>
                    <div className="space-y-2">
                      {portionOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNewMeal({ ...newMeal, portionEaten: option.value })}
                          className={`w-full p-2 rounded-lg border text-sm font-medium transition-colors text-left ${
                            newMeal.portionEaten === option.value
                              ? `border-blue-500 ${option.bg} ${option.color}`
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
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
                    Hvor?
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
                    Hva hjalp til at dette gikk bra?
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
                      <p className="text-gray-600">{log.safeFood.foodName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${portionStyle}`}>
                        {portionOptions.find(p => p.value === log.portionEaten)?.label}
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
                  {log.successFactors && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-green-700">Success factors: </span>
                      <span className="text-sm text-gray-600">{log.successFactors}</span>
                    </div>
                  )}
                  {log.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Notater: </span>
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
    </div>
  );
}