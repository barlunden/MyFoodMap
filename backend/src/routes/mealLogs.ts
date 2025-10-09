import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get meal logs for authenticated user (with optional date filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, mealType } = req.query;
    
    const whereClause: any = { userId: req.user!.userId };
    
    if (startDate || endDate) {
      whereClause.mealDate = {};
      if (startDate) whereClause.mealDate.gte = new Date(startDate as string);
      if (endDate) whereClause.mealDate.lte = new Date(endDate as string);
    }
    
    if (mealType) {
      whereClause.mealType = mealType;
    }

    const mealLogs = await prisma.mealLog.findMany({
      where: whereClause,
      include: {
        safeFood: {
          select: {
            id: true,
            foodName: true,
            category: true,
            photoUrl: true
          }
        }
      },
      orderBy: { mealDate: 'desc' }
    });

    res.json(mealLogs);
  } catch (error) {
    console.error('Error fetching meal logs:', error);
    res.status(500).json({ error: 'Failed to fetch meal logs' });
  }
});

// Add new meal log
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      safeFoodId,
      mealDate,
      mealType,
      portionEaten,
      energyBefore,
      energyAfter,
      location,
      successFactors,
      notes
    } = req.body;

    // Validate required fields
    if (!safeFoodId || !mealDate || !mealType || !portionEaten) {
      return res.status(400).json({ 
        error: 'Safe food ID, meal date, meal type, and portion eaten are required' 
      });
    }

    // Verify the safe food belongs to the user
    const safeFood = await prisma.safeFood.findFirst({
      where: { 
        id: safeFoodId, 
        userId: req.user!.userId,
        isActive: true
      }
    });

    if (!safeFood) {
      return res.status(404).json({ error: 'Safe food not found or inactive' });
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        userId: req.user!.userId,
        safeFoodId,
        mealDate: new Date(mealDate),
        mealType,
        portionEaten,
        energyBefore,
        energyAfter,
        location,
        successFactors,
        notes
      },
      include: {
        safeFood: {
          select: {
            id: true,
            foodName: true,
            category: true,
            photoUrl: true
          }
        }
      }
    });

    res.status(201).json(mealLog);
  } catch (error) {
    console.error('Error creating meal log:', error);
    res.status(500).json({ error: 'Failed to create meal log' });
  }
});

// Update meal log
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify ownership
    const mealLog = await prisma.mealLog.findFirst({
      where: { id, userId: req.user!.userId }
    });

    if (!mealLog) {
      return res.status(404).json({ error: 'Meal log not found' });
    }

    const updatedMealLog = await prisma.mealLog.update({
      where: { id },
      data: {
        ...updateData,
        mealDate: updateData.mealDate ? new Date(updateData.mealDate) : undefined
      },
      include: {
        safeFood: {
          select: {
            id: true,
            foodName: true,
            category: true,
            photoUrl: true
          }
        }
      }
    });

    res.json(updatedMealLog);
  } catch (error) {
    console.error('Error updating meal log:', error);
    res.status(500).json({ error: 'Failed to update meal log' });
  }
});

// Delete meal log
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const mealLog = await prisma.mealLog.findFirst({
      where: { id, userId: req.user!.userId }
    });

    if (!mealLog) {
      return res.status(404).json({ error: 'Meal log not found' });
    }

    await prisma.mealLog.delete({
      where: { id }
    });

    res.json({ message: 'Meal log deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal log:', error);
    res.status(500).json({ error: 'Failed to delete meal log' });
  }
});

// Get daily meal summary
router.get('/daily/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId: req.user!.userId,
        mealDate: {
          gte: targetDate,
          lt: nextDay
        }
      },
      include: {
        safeFood: {
          select: {
            id: true,
            foodName: true,
            category: true,
            photoUrl: true
          }
        }
      },
      orderBy: [
        { mealType: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Group by meal type
    const mealsByType = mealLogs.reduce((acc: any, meal: any) => {
      if (!acc[meal.mealType]) {
        acc[meal.mealType] = [];
      }
      acc[meal.mealType].push(meal);
      return acc;
    }, {});

    // Calculate daily stats
    interface DailyMealStats {
        totalMeals: number;
        successfulMeals: number;
        averageEnergyBefore: number;
        averageEnergyAfter: number;
        foodsTriedCount: number;
    }

    const stats: DailyMealStats = {
        totalMeals: mealLogs.length,
        successfulMeals: mealLogs.filter((m: any) => ['all', 'most'].includes(m.portionEaten)).length,
        averageEnergyBefore: mealLogs.reduce((sum: number, m: any) => sum + (m.energyBefore || 0), 0) / mealLogs.length,
        averageEnergyAfter: mealLogs.reduce((sum: number, m: any) => sum + (m.energyAfter || 0), 0) / mealLogs.length,
        foodsTriedCount: new Set(mealLogs.map((m: any) => m.safeFoodId)).size
    };

    res.json({
      date: targetDate,
      mealsByType,
      stats,
      allMeals: mealLogs
    });
  } catch (error) {
    console.error('Error fetching daily meal summary:', error);
    res.status(500).json({ error: 'Failed to fetch daily meal summary' });
  }
});

// Get meal patterns/analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId: req.user!.userId,
        mealDate: { gte: startDate }
      },
      include: {
        safeFood: {
          select: {
            id: true,
            foodName: true,
            category: true
          }
        }
      }
    });

    // Calculate analytics
    interface Analytics {
        totalMeals: number;
        successRate: number;
        mostSuccessfulMealType: MostSuccessfulMealType;
        favoritefoods: FavoriteFood[];
        energyTrends: EnergyTrend[];
        successFactors: SuccessFactor[];
    }

    interface MostSuccessfulMealType {
        mealType: string;
        successRate: number;
    }

    interface FavoriteFood {
        foodName: string;
        count: number;
    }

    interface EnergyTrend {
        date: Date;
        before: number;
        after: number;
        improvement: number;
    }

    interface SuccessFactor {
        factor: string;
        count: number;
    }

    const analytics: Analytics = {
        totalMeals: mealLogs.length,
        successRate: mealLogs.filter((m: any) => ['all', 'most'].includes(m.portionEaten)).length / mealLogs.length,
        mostSuccessfulMealType: getMostSuccessfulMealType(mealLogs),
        favoritefoods: getFavoriteFoods(mealLogs),
        energyTrends: getEnergyTrends(mealLogs),
        successFactors: getSuccessFactors(mealLogs)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching meal analytics:', error);
    res.status(500).json({ error: 'Failed to fetch meal analytics' });
  }
});

// Helper functions for analytics
function getMostSuccessfulMealType(mealLogs: any[]) {
  const successByType: any = {};
  mealLogs.forEach(meal => {
    if (!successByType[meal.mealType]) {
      successByType[meal.mealType] = { total: 0, successful: 0 };
    }
    successByType[meal.mealType].total++;
    if (['all', 'most'].includes(meal.portionEaten)) {
      successByType[meal.mealType].successful++;
    }
  });

  let bestType = '';
  let bestRate = 0;
  Object.entries(successByType).forEach(([type, data]: [string, any]) => {
    const rate = data.successful / data.total;
    if (rate > bestRate) {
      bestRate = rate;
      bestType = type;
    }
  });

  return { mealType: bestType, successRate: bestRate };
}

function getFavoriteFoods(mealLogs: any[]) {
  const foodCounts: any = {};
  mealLogs.forEach(meal => {
    const foodName = meal.safeFood.foodName;
    if (!foodCounts[foodName]) {
      foodCounts[foodName] = 0;
    }
    foodCounts[foodName]++;
  });

  return Object.entries(foodCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([name, count]) => ({ foodName: name, count: count as number }));
}

function getEnergyTrends(mealLogs: any[]) {
  const energyData = mealLogs
    .filter(meal => meal.energyBefore && meal.energyAfter)
    .map(meal => ({
      date: meal.mealDate,
      before: meal.energyBefore,
      after: meal.energyAfter,
      improvement: meal.energyAfter - meal.energyBefore
    }));

  return energyData;
}

function getSuccessFactors(mealLogs: any[]) {
  const factors: any = {};
  mealLogs
    .filter(meal => meal.successFactors && ['all', 'most'].includes(meal.portionEaten))
    .forEach(meal => {
      if (!factors[meal.successFactors]) {
        factors[meal.successFactors] = 0;
      }
      factors[meal.successFactors]++;
    });

  return Object.entries(factors)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([factor, count]) => ({ factor, count: count as number }));
}

export default router;