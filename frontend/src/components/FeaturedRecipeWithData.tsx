import React, { useState, useEffect } from 'react';
import FeaturedRecipe from './FeaturedRecipe';
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
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sodium: number;
      calcium: number;
      iron: number;
    };
  }>;
  _count: {
    favorites: number;
  };
}

interface FeaturedRecipeWithDataProps {
  onViewRecipe?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorited: boolean) => void;
}

const FeaturedRecipeWithData: React.FC<FeaturedRecipeWithDataProps> = ({
  onViewRecipe,
  onToggleFavorite
}) => {
  const [recipe, setRecipe] = useState<BackendRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedRecipe = async () => {
      try {
        const data = await apiClient.getFeaturedRecipe() as BackendRecipe;
        setRecipe(data);
      } catch (err) {
        console.error('Error fetching featured recipe:', err);
        setError('Failed to load featured recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRecipe();
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

  if (!recipe) {
    return (
      <div className="relative bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative z-10 p-8 lg:p-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Velkommen til MyFoodMap</h1>
            <p className="text-xl text-gray-200 mb-8">
              A personalized app for food exploration and nutrition tracking for ARFID families
            </p>
            <a 
              href="/create" 
              className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
            >
              Create your first recipe
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
      // Convert different units to grams for calculation
      let amountInGrams = ri.amount;
      
      // Simple unit conversions (this would be more sophisticated in real app)
      if (ri.unit === 'dl') {
        amountInGrams = ri.amount * 100; // Assume 1 dl = 100g for most ingredients
      } else if (ri.unit === 'ss') {
        amountInGrams = ri.amount * 15; // 1 tablespoon ≈ 15g
      } else if (ri.unit === 'ts') {
        amountInGrams = ri.amount * 5; // 1 teaspoon ≈ 5g
      } else if (ri.unit === 'stk') {
        // For eggs, estimate 50g per egg
        if (ri.ingredient.name.toLowerCase().includes('egg')) {
          amountInGrams = ri.amount * 50;
        } else {
          amountInGrams = ri.amount * 100; // Default estimate
        }
      }
      
      // Calculate nutrition based on 100g values
      const factor = amountInGrams / 100;
      calories += (ri.ingredient.calories || 0) * factor;
      protein += (ri.ingredient.protein || 0) * factor;
      carbs += (ri.ingredient.carbs || 0) * factor;
      fat += (ri.ingredient.fat || 0) * factor;
    }
    
    // Return per-serving values
    return { 
      calories: Math.round(calories / recipe.servings), 
      protein: Math.round((protein / recipe.servings) * 10) / 10, 
      carbs: Math.round((carbs / recipe.servings) * 10) / 10, 
      fat: Math.round((fat / recipe.servings) * 10) / 10 
    };
  };

  const getTags = (recipe: BackendRecipe) => {
    try {
      return recipe.tags ? JSON.parse(recipe.tags) : [];
    } catch {
      return [];
    }
  };

  const getInstructions = (recipe: BackendRecipe) => {
    try {
      return recipe.instructions ? JSON.parse(recipe.instructions) : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="relative bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative z-10 p-8 lg:p-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="animate-pulse">
              <div className="h-8 bg-white bg-opacity-20 rounded mb-4 w-3/4 mx-auto"></div>
              <div className="h-4 bg-white bg-opacity-20 rounded mb-8 w-1/2 mx-auto"></div>
              <div className="h-12 bg-white bg-opacity-20 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative bg-red-600 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative z-10 p-8 lg:p-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Error Loading Recipe</h2>
            <p className="text-red-100">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="relative bg-gray-600 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative z-10 p-8 lg:p-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-2xl font-bold mb-4">No Featured Recipe</h2>
            <p className="text-gray-100">No featured recipe available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

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
      name: recipe.user.name || recipe.user.username || 'Unknown Cook',
      avatar: undefined // Backend doesn't return avatar yet
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