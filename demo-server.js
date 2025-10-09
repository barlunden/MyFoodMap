// Simple Authentication Demo Server
// This demonstrates the working authentication system

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Mock user database (in real app, this would be Prisma)
const users = [];
let userIdCounter = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create user
    const user = {
      id: userIdCounter++,
      email,
      name: name || 'User',
      createdAt: new Date()
    };
    
    users.push({ ...user, password }); // In real app, hash password
    
    // Generate token (simplified)
    const token = `demo_token_${user.id}_${Date.now()}`;
    
    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create recipe endpoint (protected)
app.post('/api/recipes', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token.startsWith('demo_token_')) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Extract user ID from token
  const userId = token.split('_')[2];
  const user = users.find(u => u.id.toString() === userId);
  
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  const recipe = {
    id: `recipe_${Date.now()}`,
    title: req.body.title || 'Test Recipe',
    description: req.body.description || 'A demo recipe',
    userId: user.id,
    createdAt: new Date()
  };
  
  res.status(201).json(recipe);
});

// Get recipe endpoint
app.get('/api/recipes/:id', (req, res) => {
  res.json({
    id: req.params.id,
    title: 'Demo Recipe',
    description: 'This is a demonstration recipe',
    servings: 4,
    createdAt: new Date()
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Demo Authentication Server running on http://localhost:${PORT}`);
  console.log(`📝 Test with: node test-auth.js`);
});