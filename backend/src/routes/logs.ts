import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// Get all safe foods for a user (needed for meal logging)
router.get('/safe-foods', async (_req, res) => {
  try {
    const userId = 'cmgmi7b0l000ftw2hz1sc3g33'; // Use the actual seeded user ID

    const safeFoods = await prisma.safeFood.findMany({
      where: { userId },
      orderBy: { foodName: 'asc' }
    });

    res.json(safeFoods);
  } catch (error) {
    console.error('Error fetching safe foods:', error);
    res.status(500).json({ error: 'Failed to fetch safe foods' });
  }
});

// Add a new safe food
router.post('/safe-foods', async (req, res) => {
  try {
    const userId = 'cmgmi7b0l000ftw2hz1sc3g33'; // Use the actual seeded user ID
    
    const {
      foodName,
      dateFirstAccepted,
      category,
      preparationNotes,
      textureNotes,
      brandPreference,
      notes
    } = req.body;

    const safeFood = await prisma.safeFood.create({
      data: {
        userId,
        foodName,
        dateFirstAccepted: new Date(dateFirstAccepted),
        category,
        preparationNotes,
        textureNotes,
        brandPreference,
        notes
      }
    });

    res.status(201).json(safeFood);
  } catch (error) {
    console.error('Error creating safe food:', error);
    res.status(500).json({ error: 'Failed to create safe food' });
  }
});

// Get all logs for a user (meal logs, lockdown logs, safe foods)
router.get('/', async (_req, res) => {
  try {
    // For now, we'll use a hardcoded user ID since we don't have auth
    const userId = 'cmgmi7b0l000ftw2hz1sc3g33'; // Use the actual seeded user ID

    // Get meal logs
    const mealLogs = await prisma.mealLog.findMany({
      where: { userId },
      include: {
        safeFood: true,
        user: true
      },
      orderBy: { mealDate: 'desc' },
      take: 20
    });

    // Get lockdown logs
    const lockdownLogs = await prisma.lockdownLog.findMany({
      where: { userId },
      include: {
        user: true
      },
      orderBy: { incidentDate: 'desc' },
      take: 20
    });

    // Get recently added safe foods
    const safeFoods = await prisma.safeFood.findMany({
      where: { userId },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Combine and format all logs with type information
    const allLogs = [
      ...mealLogs.map((log: any) => ({
        id: log.id,
        type: 'meal',
        date: log.mealDate,
        title: `${log.mealType}${log.safeFood ? ` - ${log.safeFood.foodName}` : ''}`,
        description: `Portion eaten: ${log.portionEaten}${log.weightGrams ? ` | Weight: ${log.weightGrams}g` : ''}${log.successFactors ? ` | Success factors: ${log.successFactors}` : ''}`,
        data: log
      })),
      ...lockdownLogs.map((log: any) => ({
        id: log.id,
        type: 'lockdown',
        date: log.incidentDate,
        title: `Challenge Episode`,
        description: `Duration: ${log.durationMinutes || 'Unknown'} min${log.triggers ? ` | Triggers: ${log.triggers}` : ''}`,
        data: log
      })),
      ...safeFoods.map((food: any) => ({
        id: food.id,
        type: 'safefood',
        date: food.dateFirstAccepted,
        title: `New Safe Food: ${food.foodName}`,
        description: `Category: ${food.category || 'Unknown'}${food.preparationNotes ? ` | Prep: ${food.preparationNotes}` : ''}`,
        data: food
      }))
    ];

    // Sort all logs by date (newest first)
    allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(allLogs.slice(0, 50)); // Return top 50 most recent logs
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get meal logs only
router.get('/meals', async (_req, res) => {
  try {
    const userId = 'cmgmi7b0l000ftw2hz1sc3g33';

    const mealLogs = await prisma.mealLog.findMany({
      where: { userId },
      include: {
        safeFood: true,
        user: true
      },
      orderBy: { mealDate: 'desc' }
    });

    res.json(mealLogs);
  } catch (error) {
    console.error('Error fetching meal logs:', error);
    res.status(500).json({ error: 'Failed to fetch meal logs' });
  }
});

// Get lockdown logs only
router.get('/lockdowns', async (_req, res) => {
  try {
    const userId = 'cmgmi7b0l000ftw2hz1sc3g33';

    const lockdownLogs = await prisma.lockdownLog.findMany({
      where: { userId },
      include: {
        user: true
      },
      orderBy: { incidentDate: 'desc' }
    });

    res.json(lockdownLogs);
  } catch (error) {
    console.error('Error fetching lockdown logs:', error);
    res.status(500).json({ error: 'Failed to fetch lockdown logs' });
  }
});

// Add a new meal log
router.post('/meals', async (req, res) => {
  try {
    const userId = 'cmgmi7b0l000ftw2hz1sc3g33'; // Use the actual seeded user ID from PostgreSQL
    
    const {
      safeFoodId,
      mealDate,
      mealType,
      portionEaten,
      weightGrams,
      energyBefore,
      energyAfter,
      location,
      successFactors,
      notes
    } = req.body;

    // Validate that the safe food exists and belongs to the user (if provided)
    let safeFood = null;
    if (safeFoodId) {
      safeFood = await prisma.safeFood.findFirst({
        where: {
          id: safeFoodId,
          userId: userId
        }
      });

      if (!safeFood) {
        return res.status(400).json({ 
          error: 'Safe food not found or does not belong to user',
          safeFoodId,
          userId 
        });
      }
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        userId,
        safeFoodId,
        mealDate: new Date(mealDate),
        mealType,
        portionEaten,
        weightGrams: weightGrams ? parseFloat(weightGrams.toString()) : null,
        energyBefore,
        energyAfter,
        location,
        successFactors,
        notes
      },
      include: {
        safeFood: true,
        user: true
      }
    });

    res.json(mealLog);
  } catch (error) {
    console.error('Error creating meal log:', error);
    res.status(500).json({ error: 'Failed to create meal log', details: error instanceof Error ? error.message : String(error) });
  }
});

// Create a new lockdown log
router.post('/lockdowns', async (req, res) => {
  try {
    const userId = 'cmgmi7b0l000ftw2hz1sc3g33'; // Use the actual seeded user ID
    const {
      incidentDate,
      incidentTime,
      durationMinutes,
      energyLevelBefore,
      triggers,
      behaviorsObserved,
      resolutionStrategy,
      resolutionTimeMinutes,
      familyImpactLevel,
      notes,
      lessonsLearned
    } = req.body;

    const lockdownLog = await prisma.lockdownLog.create({
      data: {
        userId,
        incidentDate: new Date(incidentDate),
        incidentTime: incidentTime || new Date().toTimeString().slice(0, 5), // Default to current time if not provided
        durationMinutes: durationMinutes ? parseInt(durationMinutes.toString()) : null,
        energyLevelBefore: parseInt(energyLevelBefore.toString()),
        triggers: triggers || '',
        behaviorsObserved: behaviorsObserved || '',
        resolutionStrategy: resolutionStrategy || '',
        resolutionTimeMinutes: resolutionTimeMinutes ? parseInt(resolutionTimeMinutes.toString()) : null,
        familyImpactLevel: parseInt(familyImpactLevel.toString()),
        notes: notes || '',
        lessonsLearned: lessonsLearned || ''
      },
      include: {
        user: true
      }
    });

    res.json(lockdownLog);
  } catch (error) {
    console.error('Error creating lockdown log:', error);
    res.status(500).json({ error: 'Failed to create lockdown log', details: error instanceof Error ? error.message : String(error) });
  }
});

export default router;