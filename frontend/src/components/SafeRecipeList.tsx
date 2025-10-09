import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { apiClient, type Recipe, getTags } from '../lib/api';

// Component that handles recipes safely within AuthProvider
function RecipeListWithAuth() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Now safely within AuthProvider
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('SafeRecipeList: Starting to load recipes...');
        
        const data = await apiClient.getRecipes({ limit: 20 });
        console.log('SafeRecipeList: Loaded recipes successfully, count:', data.length);
        setRecipes(data);
      } catch (error) {
        console.error('SafeRecipeList: Error loading recipes:', error);
        setError(`Failed to load recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 text-lg">Loading delicious recipes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-red-50 rounded-xl">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Recipes</h3>
        <p className="text-red-700 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isAuthenticated ? 'My Recipes' : 'Public Recipes'}
          </h2>
          <p className="text-gray-600 mt-2">Scale your favorite recipes to fit any occasion</p>
        </div>
        {isAuthenticated && (
          <a 
            href="/recipes/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Recipe</span>
          </a>
        )}
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start building your personalized recipe collection with smart scaling and nutrition tracking.
          </p>
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              Debug: Recipes array length: {recipes.length}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Auth status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
            </p>
          </div>
          {isAuthenticated ? (
            <a 
              href="/recipes/add"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Create Your First Recipe
            </a>
          ) : (
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
              Sign In to Create Recipes
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              Debug: Successfully loaded {recipes.length} recipes
            </p>
            <p className="text-xs text-green-600 mt-1">
              First recipe: {recipes[0]?.title || 'No title'}
            </p>
            <p className="text-xs text-green-600">
              Auth status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col h-full">
                {/* Recipe Content */}
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{recipe.description || 'No description'}</p>
                  
                  {/* Recipe Stats */}
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>🍽️ Serves {recipe.servings}</span>
                    <span>⏱️ {recipe.prepTime ? `${recipe.prepTime}min` : 'No prep time'}</span>
                    {recipe.difficulty && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Ingredient Keywords */}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Key Ingredients:</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 4).map((ing: any, index: number) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {ing.ingredient?.name || ing.name || 'Unknown'}
                          </span>
                        ))}
                        {recipe.ingredients.length > 4 && (
                          <span className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                            +{recipe.ingredients.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {(() => {
                    const tags = getTags(recipe);
                    return tags.length > 0 ? (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Tags:</h4>
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag: string, index: number) => (
                            <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="inline-block bg-blue-200 text-blue-600 text-xs px-2 py-1 rounded">
                              +{tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Nutritional Highlights */}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 text-xs">
                        {/* Show basic nutritional categories if available */}
                        <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          🥄 {recipe.ingredients.length} ingredients
                        </span>
                        {recipe.prepTime && recipe.prepTime <= 15 && (
                          <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded">
                            ⚡ Quick prep
                          </span>
                        )}
                        {recipe.difficulty === 'Easy' && (
                          <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            👍 Simple
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Action Button */}
                <div className="p-6 pt-0 mt-auto">
                  <a 
                    href={`/recipes/${recipe.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Recipe
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main component that wraps with its own AuthProvider
export default function SafeRecipeList() {
  return (
    <AuthProvider>
      <RecipeListWithAuth />
    </AuthProvider>
  );
}