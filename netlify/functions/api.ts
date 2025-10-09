import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// Try to import Prisma - fallback to demo mode if it fails
let prisma: any = null;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('Prisma client initialized successfully');
} catch (error) {
  console.log('Prisma client failed to initialize, falling back to demo mode:', error);
}

// Simple API handler for Netlify Functions
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { httpMethod, path, queryStringParameters, body, headers } = event;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // Extract API path from Netlify function path
    // Handle both direct function calls and redirected API calls
    let apiPath = path?.replace('/.netlify/functions/api', '') || '/';
    if (apiPath.startsWith('/api/')) {
      apiPath = apiPath.replace('/api', '');
    }
    if (apiPath === '') {
      apiPath = '/';
    }
    
    // Add debug logging
    console.log('API Request:', {
      httpMethod,
      path,
      apiPath,
      body: body ? body : null,
      headers
    });
    
    // Health check endpoint
    if (apiPath === '/health' && httpMethod === 'GET') {
      // Test database connection
      let dbStatus = 'disconnected';
      let dbError = null;
      
      if (prisma) {
        try {
          // Simple query to test connection
          await prisma.$queryRaw`SELECT 1`;
          dbStatus = 'connected';
        } catch (error) {
          dbStatus = 'error';
          dbError = error instanceof Error ? error.message : 'Unknown database error';
        }
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          message: 'Netlify Functions API is running',
          database: dbStatus,
          databaseError: dbError,
          debug: { apiPath, httpMethod }
        }),
      };
    }

    // Simple auth endpoints without database for testing
    if (apiPath === '/auth/register' && httpMethod === 'POST') {
      console.log('Register request received:', body);
      
      try {
        const { email, password, name } = JSON.parse(body || '{}');
        
        // Just return success for testing - no database yet
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: {
              id: 'test-user-' + Date.now(),
              email: email,
              name: name || 'Test User'
            },
            token: 'test-token-' + Date.now(),
            message: 'Registration successful (demo mode)'
          }),
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid JSON in request body' }),
        };
      }
    }

    if (apiPath === '/auth/login' && httpMethod === 'POST') {
      console.log('Login request received:', body);
      
      try {
        const { email, password } = JSON.parse(body || '{}');
        
        // Just return success for testing - no database yet
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: {
              id: 'test-user-' + Date.now(),
              email: email,
              name: 'Test User'
            },
            token: 'test-token-' + Date.now(),
            message: 'Login successful (demo mode)'
          }),
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid JSON in request body' }),
        };
      }
    }

    // Simple recipes endpoint
    if (apiPath === '/recipes' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify([
          {
            id: '1',
            title: 'Demo Recipe',
            description: 'A simple demo recipe from Netlify Functions',
            servings: 2,
            instructions: '["Mix ingredients", "Cook for 10 minutes"]',
            tags: '["demo", "simple"]'
          }
        ]),
      };
    }

    // Default response for unhandled routes
    return {
      statusCode: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Endpoint not found',
        path: apiPath,
        method: httpMethod,
        availableEndpoints: [
          'GET /health',
          'POST /auth/login', 
          'POST /auth/register',
          'GET /recipes'
        ]
      }),
    };

  } catch (error) {
    console.error('API Error:', error);
    
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
    };
  }
};

export { handler };