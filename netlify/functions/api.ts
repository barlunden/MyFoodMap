import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

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
    const apiPath = path?.replace('/.netlify/functions/api', '') || '/';
    
    // Add debug logging
    console.log('Request details:', {
      httpMethod,
      path,
      apiPath,
      body: body ? JSON.parse(body) : null
    });
    
    // Health check endpoint
    if (apiPath === '/health' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          message: 'Netlify Functions API is running'
        }),
      };
    }

    // Auth endpoints
    if (apiPath === '/auth/login' && httpMethod === 'POST') {
      const { email, password } = JSON.parse(body || '{}');
      
      try {
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: email }
        });
        
        if (!user || user.password !== password) { // In a real app, use bcrypt.compare()
          return {
            statusCode: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid credentials' }),
          };
        }
        
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: {
              id: user.id,
              email: user.email,
              name: user.name
            },
            token: `netlify-token-${user.id}`
          }),
        };
      } catch (error) {
        console.error('Login error:', error);
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Database error' }),
        };
      }
    }

    if (apiPath === '/auth/register' && httpMethod === 'POST') {
      const { email, password, name } = JSON.parse(body || '{}');
      
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: email }
        });
        
        if (existingUser) {
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'User already exists' }),
          };
        }
        
        // Create new user
        const user = await prisma.user.create({
          data: {
            email: email,
            name: name || 'User',
            password: password, // In a real app, you would hash the password here
          }
        });
        
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: {
              id: user.id,
              email: user.email,
              name: user.name
            },
            token: `netlify-token-${user.id}`
          }),
        };
      } catch (error) {
        console.error('Registration error:', error);
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Database error' }),
        };
      }
    }

    // Recipe endpoints - get from database
    if (apiPath.startsWith('/recipes')) {
      if (apiPath === '/recipes' && httpMethod === 'GET') {
        try {
          const recipes = await prisma.recipe.findMany({
            include: {
              user: {
                select: { id: true, name: true, username: true }
              },
              ingredients: {
                include: {
                  ingredient: true
                },
                orderBy: { order: 'asc' }
              },
              _count: {
                select: { favorites: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          });
          
          return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify(recipes),
          };
        } catch (error) {
          console.error('Error fetching recipes:', error);
          return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Database error' }),
          };
        }
      }

      // Get single recipe
      const recipeIdMatch = apiPath.match(/^\/recipes\/(\w+)$/);
      if (recipeIdMatch && httpMethod === 'GET') {
        const recipeId = recipeIdMatch[1];
        
        try {
          const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: {
              user: {
                select: { id: true, name: true, username: true }
              },
              ingredients: {
                include: {
                  ingredient: true
                },
                orderBy: { order: 'asc' }
              },
              _count: {
                select: { favorites: true }
              }
            }
          });
          
          if (recipe) {
            return {
              statusCode: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify(recipe),
            };
          } else {
            return {
              statusCode: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              body: JSON.stringify({ error: 'Recipe not found' }),
            };
          }
        } catch (error) {
          console.error('Error fetching recipe:', error);
          return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Database error' }),
          };
        }
      }

      // Search recipes
      if (apiPath === '/recipes/search' && httpMethod === 'GET') {
        const query = queryStringParameters?.q?.toLowerCase() || '';
        
        try {
          const recipes = await prisma.recipe.findMany({
            where: {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            },
            include: {
              user: {
                select: { id: true, name: true, username: true }
              },
              ingredients: {
                include: {
                  ingredient: true
                },
                orderBy: { order: 'asc' }
              },
              _count: {
                select: { favorites: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          });
          
          return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify(recipes),
          };
        } catch (error) {
          console.error('Error searching recipes:', error);
          return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Database error' }),
          };
        }
      }
    }

    // Default response for unhandled routes
    return {
      statusCode: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Not found',
        path: apiPath,
        method: httpMethod,
        availableEndpoints: [
          'GET /health',
          'POST /auth/login', 
          'POST /auth/register',
          'GET /recipes',
          'GET /recipes/:id',
          'GET /recipes/search'
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
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };