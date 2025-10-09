import React, { useState, useEffect } from 'react';
import FeaturedRecipe from './FeaturedRecipe';
import { apiClient, type Recipe, getTags } from '../lib/api';

interface FeaturedRecipeWithDataProps {
  onViewRecipe?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorited: boolean) => void;
}

const FeaturedRecipeWithData: React.FC<FeaturedRecipeWithDataProps> = ({
  onViewRecipe,
  onToggleFavorite
}) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get featured recipe, fallback to first recipe if none
        let featuredRecipe = await apiClient.getFeaturedRecipe();
        
        if (!featuredRecipe) {
          // Get the first available recipe as fallback
          const recipes = await apiClient.getRecipes({ limit: 1 });
          featuredRecipe = recipes[0] || null;
        }
        
        setRecipe(featuredRecipe);
      } catch (error) {
        console.error('Error loading featured recipe:', error);
        setError('Failed to load featured recipe');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedRecipe();
  }, []);

  if (loading) {
    return (
      <div className="relative bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative z-10 p-8 lg:p-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="animate-pulse">
              <div className="h-8 bg-white bg-opacity-20 rounded mb-4 w-3/4 mx-auto"></div>
              <div className="h-4 bg-white bg-opacity-20 rounded mb-8 w-1/2 mx-auto"></div>
              <div className="h-12 bg-white bg-opacity-20 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="relative bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative z-10 p-8 lg:p-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Welcome to MyFoodMap</h1>
            <p className="text-xl text-gray-200 mb-8">
              A personalized recipe and nutrition app for picky eaters and ARFID families
            </p>
            <a 
              href="/create" 
              className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
            >
              Create Your First Recipe
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Compute nutrition totals from ingredient data
  const computeNutrition = (ingredients: typeof recipe.ingredients) => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    for (const ri of ingredients) {
      // Assume ingredient nutrition fields are per 100g and ri.amount is in grams if unit is 'g'
      if (ri.unit === 'g') {
        const factor = ri.amount / 100;
        calories += (ri.ingredient.calories || 0) * factor;
        protein += (ri.ingredient.protein || 0) * factor;
        carbs += (ri.ingredient.carbs || 0) * factor;
        fat += (ri.ingredient.fat || 0) * factor;
      }
    }
    return { calories, protein, carbs, fat };
  };

  // Transform recipe data to match FeaturedRecipe props
  const transformedRecipe = {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    difficulty: recipe.difficulty as 'Easy' | 'Medium' | 'Hard' | undefined,
    author: {
      name: recipe.user.name || recipe.user.username || 'Unknown Chef',
      avatar: recipe.user.avatar
    },
    ingredients: recipe.ingredients.map(ri => ({
      id: ri.id,
      amount: ri.amount,
      unit: ri.unit,
      ingredient: {
        name: ri.ingredient.name,
        category: ri.ingredient.category
      }
    })),
    nutrition: computeNutrition(recipe.ingredients),
    tags: getTags(recipe)
  };

  return (
    <FeaturedRecipe
      recipe={transformedRecipe}
      onViewRecipe={onViewRecipe || ((id) => window.location.href = `/recipes/${id}`)}
      onToggleFavorite={onToggleFavorite}
    />
  );
};

export default FeaturedRecipeWithData;