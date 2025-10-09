import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { validateRegistrationData, validateLoginData } from '../utils/validation.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    // Validate input data
    const validation = validateRegistrationData(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.errors 
      });
    }
    
    const { email, password, name, username } = validation.sanitizedData!;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(username ? [{ username }] : [])
        ]
      }
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    // Hash password with strong salt
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name: name || null,
        username: username || null
      }
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    // Return user data (without password) and token
    res.status(201).json({
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('email')) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (error.message.includes('username')) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    // Validate input data
    const validation = validateLoginData(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.errors 
      });
    }
    
    const { email, password } = validation.sanitizedData!;
    
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    // Return user data (without password) and token
    res.json({
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;