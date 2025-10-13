import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all safe foods for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const safeFoods = await prisma.safeFood.findMany({
      where: { userId: req.user.userId },
      orderBy: [
        { isEstablishedSafeFood: 'desc' }, // Established safe foods first
        { timesConsumed: 'desc' }, // Then by consumption count
        { updatedAt: 'desc' } // Then by most recently updated
      ]
    });

    res.json(safeFoods);
  } catch (error) {
    console.error('Error fetching safe foods:', error);
    res.status(500).json({ error: 'Failed to fetch safe foods' });
  }
});

// Get a specific safe food for authenticated user
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const safeFood = await prisma.safeFood.findFirst({
      where: { 
        id,
        userId: req.user.userId
      },
      include: {
        mealLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Last 10 meal logs for this food
        }
      }
    });

    if (!safeFood) {
      return res.status(404).json({ error: 'Safe food not found' });
    }

    res.json(safeFood);
  } catch (error) {
    console.error('Error fetching safe food:', error);
    res.status(500).json({ error: 'Failed to fetch safe food' });
  }
});

// Create a new safe food (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const {
      foodName,
      category,
      preparationNotes,
      brandPreference,
      textureNotes,
      notes,
      personalRating,
      isEstablishedSafeFood = false
    } = req.body;

    if (!foodName) {
      return res.status(400).json({ error: 'Food name is required' });
    }

    // Check if this food already exists for this user
    const existingFood = await prisma.safeFood.findFirst({
      where: {
        userId: req.user.userId,
        foodName: {
          equals: foodName,
          mode: 'insensitive'
        }
      }
    });

    if (existingFood) {
      return res.status(400).json({ error: 'This food already exists in your safe foods list' });
    }

    const safeFood = await prisma.safeFood.create({
      data: {
        userId: req.user.userId,
        foodName,
        category,
        preparationNotes,
        brandPreference,
        textureNotes,
        notes,
        personalRating,
        isEstablishedSafeFood,
        dateFirstAccepted: isEstablishedSafeFood ? new Date() : null,
        timesConsumed: isEstablishedSafeFood ? 1 : 0
      }
    });

    res.status(201).json(safeFood);
  } catch (error) {
    console.error('Error creating safe food:', error);
    res.status(500).json({ error: 'Failed to create safe food' });
  }
});

// Update a safe food (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const {
      foodName,
      category,
      preparationNotes,
      brandPreference,
      textureNotes,
      notes,
      personalRating,
      isEstablishedSafeFood
    } = req.body;

    // Check if safe food exists and belongs to user
    const existingFood = await prisma.safeFood.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!existingFood) {
      return res.status(404).json({ error: 'Safe food not found' });
    }

    const updateData: any = {
      foodName,
      category,
      preparationNotes,
      brandPreference,
      textureNotes,
      notes,
      personalRating,
      isEstablishedSafeFood
    };

    // If promoting to established safe food, set dateFirstAccepted
    if (isEstablishedSafeFood && !existingFood.isEstablishedSafeFood) {
      updateData.dateFirstAccepted = new Date();
    }

    const safeFood = await prisma.safeFood.update({
      where: { id },
      data: updateData
    });

    res.json(safeFood);
  } catch (error) {
    console.error('Error updating safe food:', error);
    res.status(500).json({ error: 'Failed to update safe food' });
  }
});

// Delete a safe food (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if safe food exists and belongs to user
    const existingFood = await prisma.safeFood.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!existingFood) {
      return res.status(404).json({ error: 'Safe food not found' });
    }

    await prisma.safeFood.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting safe food:', error);
    res.status(500).json({ error: 'Failed to delete safe food' });
  }
});

// Get safe food suggestions (foods consumed 5+ times but not yet established) - requires auth
router.get('/suggestions/pending', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const suggestions = await prisma.safeFood.findMany({
      where: {
        userId: req.user.userId,
        isEstablishedSafeFood: false,
        timesConsumed: {
          gte: 5 // 5 or more times consumed
        }
      },
      orderBy: { timesConsumed: 'desc' }
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching safe food suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Promote a food to established safe food (requires authentication)
router.post('/:id/promote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const safeFood = await prisma.safeFood.update({
      where: { 
        id,
        userId: req.user.userId 
      },
      data: {
        isEstablishedSafeFood: true,
        dateFirstAccepted: new Date()
      }
    });

    res.json(safeFood);
  } catch (error) {
    console.error('Error promoting safe food:', error);
    res.status(500).json({ error: 'Failed to promote safe food' });
  }
});

export default router;