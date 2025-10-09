import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  isArfidFriendly: boolean;
  tags?: string;
  user: {
    name?: string;
    username?: string;
  };
}

interface SearchResultsProps {
  query: string;
  searchParams: Record<string, string>;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, searchParams }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!query && Object.keys(searchParams).length === 1) {
          // If only 'q' param exists and it's empty, show all recipes
          const response = await apiClient.getRecipes();
          setRecipes(response);
        } else {
          // Perform search with the query and filters
          const searchFilters = {
            q: query,
            // Add other filters from searchParams as needed
            dietary: searchParams.dietary, // Keep as string since API expects string
            maxPrepTime: searchParams.maxPrepTime ? parseInt(searchParams.maxPrepTime) : undefined,
            maxCookTime: searchParams.maxCookTime ? parseInt(searchParams.maxCookTime) : undefined,
            difficulty: searchParams.difficulty,
            isArfidFriendly: searchParams.isArfidFriendly === 'true',
          };
          
          const results = await apiClient.searchRecipes(searchFilters);
          setRecipes(results);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Failed to search recipes');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Searching recipes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Search Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recipes Found</h3>
          <p className="text-gray-600 mb-4">
            {query ? `No recipes found for "${query}".` : 'No recipes match your search criteria.'}
          </p>
          <button 
            onClick={() => window.location.href = '/recipes'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600">
          Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
          {query && ` matching "${query}"`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
          // Parse tags
          let tags: string[] = [];
          try {
            if (recipe.tags) {
              tags = JSON.parse(recipe.tags);
            }
          } catch (e) {
            console.error('Error parsing tags:', e);
          }

          return (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    <a href={`/recipes/${recipe.id}`} className="hover:text-blue-600 transition-colors">
                      {recipe.title}
                    </a>
                  </h3>
                  {recipe.isArfidFriendly && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      ARFID
                    </span>
                  )}
                </div>
                
                {recipe.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                  <span>🍽️ {recipe.servings} servings</span>
                  {recipe.prepTime && <span>⏱️ {recipe.prepTime}m prep</span>}
                  {recipe.cookTime && <span>🔥 {recipe.cookTime}m cook</span>}
                  {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    by {recipe.user.name || recipe.user.username || 'Anonymous'}
                  </span>
                  <a 
                    href={`/recipes/${recipe.id}`}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    View Recipe
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResults;