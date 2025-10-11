import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

// Backend recipe type  
interface BackendRecipe {
  id: string;
  title: string;
  description: string;
  instructions: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  isArfidFriendly: boolean;
  arfidNotes: string | null;
  tags: string;
  user: {
    name: string;
    username: string;
  };
  ingredients: Array<{
    id: string;
    amount: number;
    unit: string;
    ingredient: {
      id: string;
      name: string;
      category: string;
    };
  }>;
  _count: {
    favorites: number;
  };
}

export default function SafeRecipeList() {
  const [recipes, setRecipes] = useState<BackendRecipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<BackendRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyArfidFriendly, setShowOnlyArfidFriendly] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await apiClient.getRecipes() as BackendRecipe[];
        setAllRecipes(data);
        setRecipes(data); // Show all recipes initially
        console.log('Fetched recipes:', data.length);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Filter recipes based on toggle
  useEffect(() => {
    if (showOnlyArfidFriendly) {
      const arfidRecipes = allRecipes.filter(recipe => recipe.isArfidFriendly);
      setRecipes(arfidRecipes);
    } else {
      setRecipes(allRecipes);
    }
  }, [showOnlyArfidFriendly, allRecipes]);

  const formatInstructions = (instructionsJson: string) => {
    try {
      const instructions = JSON.parse(instructionsJson);
      return Array.isArray(instructions) ? instructions : [];
    } catch {
      return [];
    }
  };

  const getTags = (recipe: BackendRecipe) => {
    try {
      return recipe.tags ? JSON.parse(recipe.tags) : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 text-lg">Loading ARFID-friendly recipes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Recipes</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Filter Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setShowOnlyArfidFriendly(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showOnlyArfidFriendly
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Recipes ({allRecipes.length})
          </button>
          <button
            onClick={() => setShowOnlyArfidFriendly(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showOnlyArfidFriendly
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ARFID-Friendly ({allRecipes.filter(r => r.isArfidFriendly).length})
          </button>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {showOnlyArfidFriendly ? 'No ARFID-friendly recipes yet' : 'No recipes yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {showOnlyArfidFriendly 
              ? 'Create your first ARFID-friendly recipe or mark existing recipes as ARFID-friendly.'
              : 'Get started building your personal recipe collection with smart scaling and nutrition tracking.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => {
            const instructions = formatInstructions(recipe.instructions);
            const tags = getTags(recipe);
            
            return (
              <div key={recipe.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col h-full border border-gray-200">
                {/* ARFID-Friendly Badge */}
                {recipe.isArfidFriendly && (
                  <div className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-t-lg text-center">
                    ✓ ARFID-vennlig
                  </div>
                )}

                {/* Recipe Content */}
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{recipe.description || 'Ingen beskrivelse tilgjengelig'}</p>
                  
                  {/* ARFID Notes */}
                  {recipe.arfidNotes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-800">ARFID-notater:</p>
                          <p className="text-sm text-blue-700">{recipe.arfidNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recipe Stats */}
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4 flex-wrap gap-2">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{recipe.servings} porsjoner</span>
                    </span>
                    
                    {recipe.prepTime && (
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{recipe.prepTime}min tilberedning</span>
                      </span>
                    )}
                    
                    {recipe.cookTime && (
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                        <span>{recipe.cookTime}min steking</span>
                      </span>
                    )}
                    
                    {recipe.difficulty && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {recipe.difficulty === 'Easy' ? 'Enkel' : 
                         recipe.difficulty === 'Medium' ? 'Middels' : 'Vanskelig'}
                      </span>
                    )}
                  </div>

                  {/* Key Ingredients */}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Hovedingredienser:</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 4).map((ing, index) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {ing.ingredient.name}
                          </span>
                        ))}
                        {recipe.ingredients.length > 4 && (
                          <span className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                            +{recipe.ingredients.length - 4} flere
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tagger:</h4>
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag: string, index: number) => (
                          <span key={index} className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="inline-block bg-indigo-200 text-indigo-600 text-xs px-2 py-1 rounded">
                            +{tags.length - 3} flere
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recipe Highlights */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 text-xs">
                      <span className="inline-flex items-center bg-orange-100 text-orange-700 px-2 py-1 rounded space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>{recipe.ingredients.length} ingredienser</span>
                      </span>
                      
                      {recipe.prepTime && recipe.prepTime <= 15 && (
                        <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Rask tilberedning</span>
                        </span>
                      )}
                      
                      {recipe.difficulty === 'Easy' && (
                        <span className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          <span>Enkel</span>
                        </span>
                      )}

                      {instructions.length > 0 && instructions.length <= 6 && (
                        <span className="inline-flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          <span>Few steps</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fixed Action Buttons */}
                <div className="p-6 pt-0 mt-auto">
                  <div className="flex space-x-2">
                    <a 
                      href={`/recipes/${recipe.id}`}
                      className="flex-1 bg-indigo-600 text-white text-center py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Se oppskrift
                    </a>
                    <a 
                      href={`/recipes/${recipe.id}/edit`}
                      className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center"
                      title="Edit Recipe"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}