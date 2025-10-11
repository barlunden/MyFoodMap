import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { prisma } from '../index.js';

const router = express.Router();

// Get all safe foods for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }
    const safeFoods = await prisma.safeFood.findMany({
      where: { userId: req.user.userId },
      orderBy: [
        { isActive: 'desc' },
        { dateFirstAccepted: 'desc' }
      ]
    });

    res.json(safeFoods);
  } catch (error) {
    console.error('Error fetching safe foods:', error);
    res.status(500).json({ error: 'Failed to fetch safe foods' });
  }
});

// Add new safe food
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      foodName,
      dateFirstAccepted,
      category,
      preparationNotes,
      brandPreference,
      textureNotes,
      photoUrl,
      notes
    } = req.body;

    // Validate required fields
    if (!foodName || !dateFirstAccepted) {
      return res.status(400).json({ 
        error: 'Food name and date first accepted are required' 
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }
    const safeFood = await prisma.safeFood.create({
      data: {
        userId: req.user.userId,
        foodName,
        dateFirstAccepted: new Date(dateFirstAccepted),
        category,
        preparationNotes,
        brandPreference,
        textureNotes,
        photoUrl,
        notes
      }
    });

    res.status(201).json(safeFood);
  } catch (error) {
    console.error('Error creating safe food:', error);
    res.status(500).json({ error: 'Failed to create safe food' });
  }
});

// Update safe food
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify ownership
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }
    const safeFood = await prisma.safeFood.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!safeFood) {
      return res.status(404).json({ error: 'Safe food not found' });
    }

    const updatedSafeFood = await prisma.safeFood.update({
      where: { id },
      data: {
        ...updateData,
        dateFirstAccepted: updateData.dateFirstAccepted 
          ? new Date(updateData.dateFirstAccepted) 
          : undefined
      }
    });

    res.json(updatedSafeFood);
  } catch (error) {
    console.error('Error updating safe food:', error);
    res.status(500).json({ error: 'Failed to update safe food' });
  }
});

// Deactivate safe food (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }
    const safeFood = await prisma.safeFood.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!safeFood) {
      return res.status(404).json({ error: 'Safe food not found' });
    }

    const updatedSafeFood = await prisma.safeFood.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Safe food deactivated', safeFood: updatedSafeFood });
  } catch (error) {
    console.error('Error deactivating safe food:', error);
    res.status(500).json({ error: 'Failed to deactivate safe food' });
  }
});

// Get safe foods by category
router.get('/category/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }
    
    const safeFoods = await prisma.safeFood.findMany({
      where: { 
        userId: req.user.userId,
        category,
        isActive: true
      },
      orderBy: { dateFirstAccepted: 'desc' }
    });

    res.json(safeFoods);
  } catch (error) {
    console.error('Error fetching safe foods by category:', error);
    res.status(500).json({ error: 'Failed to fetch safe foods by category' });
  }
});

// Get acceptance timeline (progress over time)
router.get('/timeline', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }
    const safeFoods = await prisma.safeFood.findMany({
      where: { 
        userId: req.user.userId,
        isActive: true
      },
      select: {
        id: true,
        foodName: true,
        dateFirstAccepted: true,
        category: true
      },
      orderBy: { dateFirstAccepted: 'asc' }
    });

    // Group by month for timeline visualization
    interface SafeFoodTimelineItem {
        id: string;
        foodName: string;
        dateFirstAccepted: Date;
        category: string | null;
    }

    type Timeline = Record<string, SafeFoodTimelineItem[]>;

    const timeline: Timeline = safeFoods.reduce((acc: Timeline, food: SafeFoodTimelineItem) => {
        const monthKey = food.dateFirstAccepted.toISOString().substring(0, 7); // YYYY-MM
        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(food);
        return acc;
    }, {});

    res.json(timeline);
  } catch (error) {
    console.error('Error fetching acceptance timeline:', error);
    res.status(500).json({ error: 'Failed to fetch acceptance timeline' });
  }
});

export default router;