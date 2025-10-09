import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { scaleRecipe } from '../utils/recipeScaling.js';

const router = express.Router();

// Search recipes with advanced filters
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const {
      q, // search query
      dietary, // comma-separated dietary restrictions
      maxPrepTime,
      maxCookTime,
      difficulty,
      isArfidFriendly,
      includeIngredients,
      excludeIngredients,
      visibility = 'PUBLIC',
      limit = 20,
      offset = 0
    } = req.query;

    // Build where clause
    const where: any = {
      visibility: visibility as string
    };

    // Text search on title and description (SQLite case-insensitive)
    if (q) {
      where.OR = [
        { title: { contains: q as string } },
        { description: { contains: q as string } }
      ];
    }

    // Dietary filters
    if (dietary) {
      const dietaryArray = (dietary as string).split(',');
      where.tags = {
        hasEvery: dietaryArray
      };
    }

    // Time filters
    if (maxPrepTime) {
      where.prepTime = { lte: parseInt(maxPrepTime as string) };
    }
    if (maxCookTime) {
      where.cookTime = { lte: parseInt(maxCookTime as string) };
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = difficulty as string;
    }

    // ARFID filter
    if (isArfidFriendly === 'true') {
      where.isArfidFriendly = true;
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        ingredients: {
          include: { ingredient: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json(recipes);
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).json({ error: 'Failed to search recipes' });
  }
});

// Get featured recipe
router.get('/featured', async (req, res) => {
  try {
    const featuredRecipe = await prisma.recipe.findFirst({
      where: {
        isFeatured: true,
        visibility: 'PUBLIC'
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        ingredients: {
          include: { ingredient: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!featuredRecipe) {
      // If no featured recipe, get a popular one
      const popularRecipe = await prisma.recipe.findFirst({
        where: { visibility: 'PUBLIC' },
        include: {
          user: {
            select: { id: true, name: true, username: true, avatar: true }
          },
          ingredients: {
            include: { ingredient: true },
            orderBy: { order: 'asc' }
          },
          _count: {
            select: { favorites: true }
          }
        },
        orderBy: { favorites: { _count: 'desc' } }
      });
      
      return res.json(popularRecipe);
    }

    res.json(featuredRecipe);
  } catch (error) {
    console.error('Error fetching featured recipe:', error);
    res.status(500).json({ error: 'Failed to fetch featured recipe' });
  }
});

// Get all recipes (public and user's own) - temporarily no auth for debugging
router.get('/', async (req, res) => {
  try {
    console.log('GET /recipes - Request received');
    const { visibility = 'PUBLIC', limit = 20, offset = 0 } = req.query;

    console.log('Fetching recipes with params:', { visibility, limit, offset });

    const recipes = await prisma.recipe.findMany({
      where: {
        visibility: 'PUBLIC' // For debugging, only show public recipes
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        ingredients: {
          include: { ingredient: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    console.log(`Found ${recipes.length} recipes`);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get single recipe with scaling option
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { scale } = req.query;
    const userId = req.user?.userId;
    
    // Build where clause for privacy
    const where: any = { id };
    
    if (userId) {
      // If authenticated, can see public recipes and own recipes
      where.OR = [
        { visibility: 'PUBLIC' },
        { userId }
      ];
    } else {
      // If not authenticated, only public recipes
      where.visibility = 'PUBLIC';
    }
    
    const recipe = await prisma.recipe.findFirst({
      where,
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        ingredients: {
          include: { ingredient: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { favorites: true }
        }
      }
    });
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    if (scale && scale !== '1') {
      const scaledRecipe = scaleRecipe(recipe, parseFloat(scale as string));
      return res.json(scaledRecipe);
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Create new recipe (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      instructions,
      servings,
      prepTime,
      cookTime,
      difficulty,
      visibility,
      isArfidFriendly,
      arfidNotes,
      tags,
      recipeTimers,
      scalingKeyIngredientId,
      ingredients
    } = req.body;
    
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('Creating recipe for user:', userId);
    console.log('Recipe data:', { title, ingredients: ingredients?.length });
    
    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        instructions,
        servings: parseInt(servings) || 1,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        difficulty,
        visibility: visibility || 'PUBLIC',
        isArfidFriendly: Boolean(isArfidFriendly),
        arfidNotes,
        tags: tags || [],
        recipeTimers: recipeTimers || null,
        scalingKeyIngredientId,
        userId,
        ingredients: {
          create: ingredients.map((ing: any, index: number) => ({
            amount: parseFloat(ing.amount),
            unit: ing.unit,
            notes: ing.notes,
            brand: ing.brand,
            isOptional: Boolean(ing.isOptional),
            order: index,
            ingredientId: ing.ingredientId
          }))
        }
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        ingredients: { 
          include: { ingredient: true },
          orderBy: { order: 'asc' }
        }
      }
    });
    
    console.log('Recipe created successfully:', recipe.id);
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// Toggle favorite
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Check if already favorited
    const existingFavorite = await prisma.recipeFavorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: id
        }
      }
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.recipeFavorite.delete({
        where: {
          userId_recipeId: {
            userId,
            recipeId: id
          }
        }
      });
      res.json({ favorited: false });
    } else {
      // Add favorite
      await prisma.recipeFavorite.create({
        data: {
          userId,
          recipeId: id
        }
      });
      res.json({ favorited: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// Get user's favorite recipes
router.get('/favorites/mine', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { limit = 20, offset = 0 } = req.query;

    const favorites = await prisma.recipeFavorite.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            user: {
              select: { id: true, name: true, username: true, avatar: true }
            },
            ingredients: {
              include: { ingredient: true },
              orderBy: { order: 'asc' }
            },
            _count: {
              select: { favorites: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    interface FavoriteRecipeUser {
      id: string;
      name: string | null;
      username: string;
      avatar: string | null;
    }

    interface FavoriteRecipeIngredient {
      id: string;
      amount: number;
      unit: string;
      notes: string | null;
      brand: string | null;
      isOptional: boolean;
      order: number;
      ingredient: {
        id: string;
        name: string;
        // Add more fields as needed
      };
    }

    interface FavoriteRecipeCount {
      favorites: number;
    }

    interface FavoriteRecipe {
      id: string;
      title: string;
      description: string | null;
      instructions: string[];
      servings: number;
      prepTime: number | null;
      cookTime: number | null;
      difficulty: string | null;
      visibility: string;
      isArfidFriendly: boolean;
      arfidNotes: string | null;
      tags: string[];
      scalingKeyIngredientId: string | null;
      userId: string;
      user: FavoriteRecipeUser;
      ingredients: FavoriteRecipeIngredient[];
      _count: FavoriteRecipeCount;
      // Add more fields as needed
    }

    interface RecipeFavorite {
      recipe: FavoriteRecipe;
      // Add more fields as needed
    }

    const favoritesTyped: RecipeFavorite[] = favorites;

    res.json(favoritesTyped.map((fav: RecipeFavorite) => fav.recipe));
  } catch (error) {
    console.error('Error fetching favorite recipes:', error);
    res.status(500).json({ error: 'Failed to fetch favorite recipes' });
  }
});

export default router;