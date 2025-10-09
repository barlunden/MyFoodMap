import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '../../backend/src/routes/auth.js';
import recipeRoutes from '../../backend/src/routes/recipes.js';
import ingredientRoutes from '../../backend/src/routes/ingredients.js';

dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app-name.netlify.app'] 
    : ['http://localhost:4321', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/recipes', recipeRoutes);
app.use('/ingredients', ingredientRoutes);

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Netlify Function handler
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Convert Netlify event to Express-compatible request
  const { path, httpMethod, headers, body, queryStringParameters } = event;
  
  // Create mock request/response for Express
  const req = {
    method: httpMethod,
    url: path,
    headers: headers || {},
    body: body ? (headers['content-type']?.includes('application/json') ? JSON.parse(body) : body) : {},
    query: queryStringParameters || {},
    params: {}
  };

  let responseBody = '';
  let statusCode = 200;
  let responseHeaders = {};

  const res = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseBody = JSON.stringify(data);
      responseHeaders = { ...responseHeaders, 'Content-Type': 'application/json' };
      return res;
    },
    send: (data: any) => {
      responseBody = typeof data === 'string' ? data : JSON.stringify(data);
      return res;
    },
    header: (key: string, value: string) => {
      responseHeaders = { ...responseHeaders, [key]: value };
      return res;
    }
  };

  try {
    // Handle the request with Express app
    await new Promise((resolve, reject) => {
      app(req as any, res as any, (err: any) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    return {
      statusCode,
      headers: responseHeaders,
      body: responseBody
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };