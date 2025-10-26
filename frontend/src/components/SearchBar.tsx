import React, { useState } from 'react';

interface SearchFilters {
  dietary: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  isArfidFriendly?: boolean;
  includeIngredients: string[];
  excludeIngredients: string[];
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search recipes...", 
  showFilters = true 
}) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    dietary: [],
    includeIngredients: [],
    excludeIngredients: []
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleDietaryFilter = (filter: string) => {
    setFilters(prev => ({
      ...prev,
      dietary: prev.dietary.includes(filter)
        ? prev.dietary.filter(f => f !== filter)
        : [...prev.dietary, filter]
    }));
  };

  const dietaryOptions = [
    'Gluten-free',
    'Dairy-free',
    'Vegetarian',
    'Vegan',
    'Nut-free',
    'Low-sodium',
    'High-protein',
    'ARFID-friendly'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative flex items-center bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex-1 flex items-center">
          <svg className="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border-0 rounded-lg focus:outline-hidden focus:ring-0"
          />
        </div>
        
        {showFilters && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-3 text-sm font-medium border-l border-gray-200 transition-colors ${
              showAdvanced ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Filters
          </button>
        )}
        
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Dietary Restrictions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Dietary Restrictions</h4>
              <div className="space-y-2">
                {dietaryOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.dietary.includes(option)}
                      onChange={() => toggleDietaryFilter(option)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Constraints */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Time Constraints</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Prep Time</label>
                  <select
                    value={filters.maxPrepTime || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      maxPrepTime: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Any time</option>
                    <option value="15">15 min or less</option>
                    <option value="30">30 min or less</option>
                    <option value="60">1 hour or less</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Cook Time</label>
                  <select
                    value={filters.maxCookTime || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      maxCookTime: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Any time</option>
                    <option value="15">15 min or less</option>
                    <option value="30">30 min or less</option>
                    <option value="60">1 hour or less</option>
                    <option value="120">2 hours or less</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Difficulty & Special */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Difficulty & Special</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={filters.difficulty || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' | undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Any difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isArfidFriendly || false}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      isArfidFriendly: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">ARFID-friendly only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setFilters({
                dietary: [],
                includeIngredients: [],
                excludeIngredients: []
              })}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;