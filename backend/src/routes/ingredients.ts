import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all ingredients with search
router.get('/', async (req, res) => {
  try {
    const { q, search, category, limit = 50, offset = 0 } = req.query;
    
    const searchTerm = q || search; // Support both 'q' and 'search' params
    const where: any = {};
    
    // Search by name (SQLite case-insensitive)
    if (searchTerm) {
      where.name = {
        contains: searchTerm as string
      };
    }
    
    // Filter by category
    if (category) {
      where.category = category as string;
    }
    
    const ingredients = await prisma.ingredient.findMany({
      where,
      orderBy: { name: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });
    
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// Get single ingredient with recipe usage
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        recipeIngredients: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                visibility: true
              }
            }
          },
          take: 10 // Limit to 10 recipes using this ingredient
        }
      }
    });
    
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    res.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    res.status(500).json({ error: 'Failed to fetch ingredient' });
  }
});

// Create custom ingredient (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      category,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      vitaminA,
      vitaminC,
      vitaminD,
      calcium,
      iron
    } = req.body;
    
    console.log('Creating ingredient:', name, 'by user:', req.user?.userId);
    
    // Check if ingredient already exists
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { name: name.toLowerCase().trim() }
    });
    
    if (existingIngredient) {
      console.log('Ingredient already exists:', existingIngredient.id);
      return res.json(existingIngredient); // Return existing instead of error
    }
    
    const ingredient = await prisma.ingredient.create({
      data: {
        name: name.toLowerCase().trim(),
        category,
        calories: calories ? parseFloat(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        fiber: fiber ? parseFloat(fiber) : null,
        sugar: sugar ? parseFloat(sugar) : null,
        sodium: sodium ? parseFloat(sodium) : null,
        vitaminA: vitaminA ? parseFloat(vitaminA) : null,
        vitaminC: vitaminC ? parseFloat(vitaminC) : null,
        vitaminD: vitaminD ? parseFloat(vitaminD) : null,
        calcium: calcium ? parseFloat(calcium) : null,
        iron: iron ? parseFloat(iron) : null
      }
    });
    
    console.log('Ingredient created successfully:', ingredient.id);
    res.status(201).json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// Update ingredient nutrition (authenticated users only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      vitaminA,
      vitaminC,
      vitaminD,
      calcium,
      iron
    } = req.body;
    
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name: name?.toLowerCase().trim(),
        category,
        calories: calories ? parseFloat(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        fiber: fiber ? parseFloat(fiber) : null,
        sugar: sugar ? parseFloat(sugar) : null,
        sodium: sodium ? parseFloat(sodium) : null,
        vitaminA: vitaminA ? parseFloat(vitaminA) : null,
        vitaminC: vitaminC ? parseFloat(vitaminC) : null,
        vitaminD: vitaminD ? parseFloat(vitaminD) : null,
        calcium: calcium ? parseFloat(calcium) : null,
        iron: iron ? parseFloat(iron) : null
      }
    });
    
    res.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// Update ingredient nutrition (authenticated users only)
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove non-updateable fields
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: updateData
    });
    
    res.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// Delete ingredient (authenticated users only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ingredient is used in any recipes
    const usage = await prisma.recipeIngredient.findFirst({
      where: { ingredientId: id }
    });
    
    if (usage) {
      return res.status(400).json({ 
        error: 'Cannot delete ingredient as it is used in recipes' 
      });
    }
    
    await prisma.ingredient.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

// Get ingredient categories
router.get('/categories/list', async (_req, res) => {
  try {
    const categories = await prisma.ingredient.findMany({
      select: { category: true },
      distinct: ['category'],
      where: {
        category: { not: null }
      },
      orderBy: { category: 'asc' }
    });
    
    res.json(categories.map((c: { category: string | null }) => c.category).filter(Boolean));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;