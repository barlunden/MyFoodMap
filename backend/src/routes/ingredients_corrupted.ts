im// Create custom ingredient (temporarily unauthenticated for development)
router.post('/', async (req, res) => {
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
    } = req.body;express';
import { prisma } from '../index.js';
import// Create new ingredient
router.post('/', async (req, res) => {
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
    } = req.body;n } from '../middleware/auth.js';

const router = express.Router();

// Get all ingredients with search
router.get('/', async (req, res) => {
  try {
    const { q, search, category, limit = 50, offset = 0 } = req.query;
    
    const searchTerm = q || search; // Support both 'q' and 'search' params
    const where: any = {};
    
    // Search by name
    if (searchTerm) {
      where.name = {
        contains: searchTerm as string,
        mode: 'insensitive'
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

// Get single ingredient
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

// Create custom ingredient (authenticated users only)
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
    
    // Check if ingredient already exists
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { name: name.toLowerCase().trim() }
    });
    
    if (existingIngredient) {
      return res.status(409).json({ error: 'Ingredient already exists' });
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
    
    res.status(201).json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Failed to create ingredient' });
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

// Get ingredient categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.ingredient.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });
    
    const categoryList = categories
      .map(c => c.category)
      .filter(Boolean) // Remove null values
      .sort();
    
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;