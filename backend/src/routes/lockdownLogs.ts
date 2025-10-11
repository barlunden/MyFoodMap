import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { prisma } from '../index.js';

const router = express.Router();

// Get lockdown logs for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    const whereClause: any = { userId: req.user!.userId };
    
    if (startDate || endDate) {
      whereClause.incidentDate = {};
      if (startDate) whereClause.incidentDate.gte = new Date(startDate as string);
      if (endDate) whereClause.incidentDate.lte = new Date(endDate as string);
    }

    const lockdownLogs = await prisma.lockdownLog.findMany({
      where: whereClause,
      orderBy: { incidentDate: 'desc' },
      take: parseInt(limit as string)
    });

    res.json(lockdownLogs);
  } catch (error) {
    console.error('Error fetching lockdown logs:', error);
    res.status(500).json({ error: 'Failed to fetch lockdown logs' });
  }
});

// Add new lockdown log
router.post('/', authenticateToken, async (req, res) => {
  try {
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

    // Validate required fields
    if (!incidentDate || !incidentTime) {
      return res.status(400).json({ 
        error: 'Incident date and time are required' 
      });
    }

    const lockdownLog = await prisma.lockdownLog.create({
      data: {
        userId: req.user!.userId,
        incidentDate: new Date(incidentDate),
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
      }
    });

    res.status(201).json(lockdownLog);
  } catch (error) {
    console.error('Error creating lockdown log:', error);
    res.status(500).json({ error: 'Failed to create lockdown log' });
  }
});

// Update lockdown log
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify ownership
    const lockdownLog = await prisma.lockdownLog.findFirst({
      where: { id, userId: req.user!.userId }
    });

    if (!lockdownLog) {
      return res.status(404).json({ error: 'Lockdown log not found' });
    }

    const updatedLockdownLog = await prisma.lockdownLog.update({
      where: { id },
      data: {
        ...updateData,
        incidentDate: updateData.incidentDate ? new Date(updateData.incidentDate) : undefined
      }
    });

    res.json(updatedLockdownLog);
  } catch (error) {
    console.error('Error updating lockdown log:', error);
    res.status(500).json({ error: 'Failed to update lockdown log' });
  }
});

// Delete lockdown log
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const lockdownLog = await prisma.lockdownLog.findFirst({
      where: { id, userId: req.user!.userId }
    });

    if (!lockdownLog) {
      return res.status(404).json({ error: 'Lockdown log not found' });
    }

    await prisma.lockdownLog.delete({
      where: { id }
    });

    res.json({ message: 'Lockdown log deleted successfully' });
  } catch (error) {
    console.error('Error deleting lockdown log:', error);
    res.status(500).json({ error: 'Failed to delete lockdown log' });
  }
});

// Get lockdown analytics/patterns
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const lockdownLogs = await prisma.lockdownLog.findMany({
      where: {
        userId: req.user!.userId,
        incidentDate: { gte: startDate }
      },
      orderBy: { incidentDate: 'asc' }
    });

    // Calculate analytics
    const analytics = {
      totalIncidents: lockdownLogs.length,
      averageDuration: calculateAverageDuration(lockdownLogs),
      frequencyTrend: calculateFrequencyTrend(lockdownLogs),
      commonTriggers: getCommonTriggers(lockdownLogs),
      effectiveStrategies: getEffectiveStrategies(lockdownLogs),
      energyCorrelation: getEnergyCorrelation(lockdownLogs),
      familyImpactTrend: getFamilyImpactTrend(lockdownLogs),
      timePatterns: getTimePatterns(lockdownLogs)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching lockdown analytics:', error);
    res.status(500).json({ error: 'Failed to fetch lockdown analytics' });
  }
});

// Get recent successful strategies
router.get('/strategies', authenticateToken, async (req, res) => {
  try {
    const recentStrategies = await prisma.lockdownLog.findMany({
      where: {
        userId: req.user!.userId,
        resolutionStrategy: { not: null },
        resolutionTimeMinutes: { not: null }
      },
      select: {
        resolutionStrategy: true,
        resolutionTimeMinutes: true,
        incidentDate: true,
        lessonsLearned: true
      },
      orderBy: { incidentDate: 'desc' },
      take: 20
    });

    // Group and rank strategies by effectiveness
    const strategyEffectiveness = groupStrategiesByEffectiveness(recentStrategies);

    res.json({
      recentStrategies,
      strategyEffectiveness
    });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({ error: 'Failed to fetch strategies' });
  }
});

// Helper functions for analytics
function calculateAverageDuration(logs: any[]) {
  const logsWithDuration = logs.filter(log => log.durationMinutes);
  if (logsWithDuration.length === 0) return 0;
  
  const total = logsWithDuration.reduce((sum, log) => sum + log.durationMinutes, 0);
  return Math.round(total / logsWithDuration.length);
}

function calculateFrequencyTrend(logs: any[]) {
  // Group by week and calculate frequency trend
  const weeklyData: any = {};
  logs.forEach(log => {
    const week = getWeekKey(log.incidentDate);
    weeklyData[week] = (weeklyData[week] || 0) + 1;
  });

  return Object.entries(weeklyData)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

function getCommonTriggers(logs: any[]) {
  const triggers: any = {};
  logs.forEach(log => {
    if (log.triggers) {
      // Simple word-based analysis - in production, use more sophisticated NLP
      const words = log.triggers.toLowerCase().split(/\s+/);
      words.forEach((word: string) => {
        if (word.length > 3) { // Filter out short words
          triggers[word] = (triggers[word] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(triggers)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([trigger, count]) => ({ trigger, count }));
}

function getEffectiveStrategies(logs: any[]) {
  const strategies: any = {};
  logs.forEach(log => {
    if (log.resolutionStrategy && log.resolutionTimeMinutes) {
      if (!strategies[log.resolutionStrategy]) {
        strategies[log.resolutionStrategy] = {
          count: 0,
          totalTime: 0,
          averageTime: 0
        };
      }
      strategies[log.resolutionStrategy].count++;
      strategies[log.resolutionStrategy].totalTime += log.resolutionTimeMinutes;
      strategies[log.resolutionStrategy].averageTime = 
        strategies[log.resolutionStrategy].totalTime / strategies[log.resolutionStrategy].count;
    }
  });

  return Object.entries(strategies)
    .map(([strategy, data]: [string, any]) => ({
      strategy,
      count: data.count,
      averageResolutionTime: Math.round(data.averageTime)
    }))
    .sort((a, b) => a.averageResolutionTime - b.averageResolutionTime)
    .slice(0, 10);
}

function getEnergyCorrelation(logs: any[]) {
  const energyData = logs
    .filter(log => log.energyLevelBefore && log.durationMinutes)
    .map(log => ({
      energyLevel: log.energyLevelBefore,
      duration: log.durationMinutes
    }));

  // Group by energy level and calculate average duration
  const correlation: any = {};
  energyData.forEach(data => {
    if (!correlation[data.energyLevel]) {
      correlation[data.energyLevel] = { total: 0, count: 0 };
    }
    correlation[data.energyLevel].total += data.duration;
    correlation[data.energyLevel].count++;
  });

  return Object.entries(correlation)
    .map(([level, data]: [string, any]) => ({
      energyLevel: parseInt(level),
      averageDuration: Math.round(data.total / data.count),
      incidentCount: data.count
    }))
    .sort((a, b) => a.energyLevel - b.energyLevel);
}

function getFamilyImpactTrend(logs: any[]) {
  const impactData = logs
    .filter(log => log.familyImpactLevel)
    .map(log => ({
      date: log.incidentDate,
      impact: log.familyImpactLevel
    }));

  return impactData;
}

function getTimePatterns(logs: any[]) {
  const timePatterns: any = {};
  logs.forEach(log => {
    if (log.incidentTime) {
      const hour = parseInt(log.incidentTime.split(':')[0]);
      const timeSlot = getTimeSlot(hour);
      timePatterns[timeSlot] = (timePatterns[timeSlot] || 0) + 1;
    }
  });

  return Object.entries(timePatterns)
    .map(([timeSlot, count]) => ({ timeSlot, count }))
    .sort((a, b) => (b.count as number) - (a.count as number));
}

function groupStrategiesByEffectiveness(strategies: any[]) {
  const grouped: any = {};
  strategies.forEach(strategy => {
    const key = strategy.resolutionStrategy;
    if (!grouped[key]) {
      grouped[key] = {
        strategy: key,
        uses: 0,
        totalTime: 0,
        averageTime: 0,
        recentUse: null
      };
    }
    grouped[key].uses++;
    grouped[key].totalTime += strategy.resolutionTimeMinutes;
    grouped[key].averageTime = grouped[key].totalTime / grouped[key].uses;
    if (!grouped[key].recentUse || strategy.incidentDate > grouped[key].recentUse) {
      grouped[key].recentUse = strategy.incidentDate;
    }
  });

  return Object.values(grouped)
    .sort((a: any, b: any) => a.averageTime - b.averageTime);
}

function getWeekKey(date: Date) {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getTimeSlot(hour: number) {
  if (hour < 6) return 'Night (12AM-6AM)';
  if (hour < 12) return 'Morning (6AM-12PM)';
  if (hour < 18) return 'Afternoon (12PM-6PM)';
  return 'Evening (6PM-12AM)';
}

export default router;