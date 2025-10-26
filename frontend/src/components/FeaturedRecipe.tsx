import React from 'react';
import FavoriteButton from './FavoriteButton.tsx';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  author?: {
    name: string;
    avatar?: string;
  };
  image?: string;
  ingredients: Array<{
    id: string;
    amount: number;
    unit: string;
    ingredient: {
      name: string;
      category?: string;
    };
  }>;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags?: string[];
}

interface FeaturedRecipeProps {
  recipe: Recipe;
  onViewRecipe?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorited: boolean) => void;
  isFavorited?: boolean;
}

const FeaturedRecipe: React.FC<FeaturedRecipeProps> = ({
  recipe,
  onViewRecipe,
  onToggleFavorite,
  isFavorited = false
}) => {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl overflow-hidden shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black opacity-30"></div>
      </div>
      
      {/* Featured Badge */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>Featured Recipe</span>
        </div>
      </div>

      {/* Favorite Button */}
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-white/20 backdrop-blur-xs rounded-lg">
          <FavoriteButton
            recipeId={recipe.id}
            isFavorited={isFavorited}
            onToggleFavorite={onToggleFavorite}
            size="lg"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Column - Recipe Info */}
            <div className="text-white">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {recipe.title}
              </h1>
              
              {recipe.description && (
                <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                  {recipe.description}
                </p>
              )}

              {/* Recipe Meta */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-blue-100">{recipe.servings} servings</span>
                </div>
                
                {totalTime > 0 && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-100">{totalTime} minutes</span>
                  </div>
                )}
                
                {recipe.difficulty && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-blue-100">{recipe.difficulty}</span>
                  </div>
                )}
              </div>

              {/* Author */}
              {recipe.author && (
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    {recipe.author.avatar ? (
                      <img src={recipe.author.avatar} alt={recipe.author.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-blue-200">Recipe by</div>
                    <div className="font-semibold text-white">{recipe.author.name}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => onViewRecipe?.(recipe.id)}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  View Full Recipe
                </button>
                <a
                  href={`/recipes/${recipe.id}`}
                  className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                >
                  Start Cooking
                </a>
              </div>
            </div>

            {/* Right Column - Recipe Preview */}
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Preview</h3>
              
              {/* Key Ingredients */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-blue-100 mb-3">Key Ingredients</h4>
                <div className="space-y-2">
                  {recipe.ingredients.slice(0, 4).map((ing) => (
                    <div key={ing.id} className="flex justify-between text-white">
                      <span>{ing.ingredient.name}</span>
                      <span className="text-blue-200">{ing.amount} {ing.unit}</span>
                    </div>
                  ))}
                  {recipe.ingredients.length > 4 && (
                    <div className="text-blue-200 text-sm italic">
                      +{recipe.ingredients.length - 4} more ingredients
                    </div>
                  )}
                </div>
              </div>

              {/* Nutrition Highlights */}
              {recipe.nutrition && (
                <div>
                  <h4 className="text-lg font-semibold text-blue-100 mb-3">Nutrition per Serving</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{recipe.nutrition.calories}</div>
                      <div className="text-xs text-blue-200">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{recipe.nutrition.protein}g</div>
                      <div className="text-xs text-blue-200">Protein</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedRecipe;