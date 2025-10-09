import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import ingredientRoutes from './routes/ingredients.js';
import userRoutes from './routes/users.js';
import safeFoodRoutes from './routes/safeFoods.js';
import mealLogRoutes from './routes/mealLogs.js';
import lockdownLogRoutes from './routes/lockdownLogs.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:4321',
    'http://localhost:4322', // Allow both ports since Astro might switch
    'http://localhost:4323',
    'http://localhost:4324',
    'http://localhost:4325' // Allow multiple ports for development
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/safe-foods', safeFoodRoutes);
app.use('/api/meal-logs', mealLogRoutes);
app.use('/api/lockdown-logs', lockdownLogRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug route to check database
app.get('/api/debug/recipes', async (_req, res) => {
  try {
    console.log('Debug: Checking recipes in database...');
    const count = await prisma.recipe.count();
    console.log(`Debug: Found ${count} recipes in database`);
    
    const recipes = await prisma.recipe.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        visibility: true,
        createdAt: true
      }
    });
    
    console.log('Debug: Sample recipes:', recipes);
    
    res.json({ 
      count, 
      samples: recipes,
      message: 'Database connection working' 
    });
  } catch (error) {
    console.error('Debug: Database error:', error);
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Database connection failed', details: message });
  }
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };