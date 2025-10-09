// Simple API client for MyFoodMap
const IS_DEMO_MODE = import.meta.env.PUBLIC_DEMO_MODE === 'true';
const IS_PRODUCTION = import.meta.env.MODE === 'production';

// Use Netlify Functions in production, local server in development
const API_BASE_URL = IS_PRODUCTION 
  ? '/api' // Netlify Functions
  : (import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api');

console.log('API Base URL:', API_BASE_URL);
console.log('Demo Mode:', IS_DEMO_MODE);
console.log('Production Mode:', IS_PRODUCTION);

// Demo data for static build
const DEMO_INGREDIENTS = [
  {
    id: '1',
    name: 'Chicken Breast',
    category: 'Protein',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0
  },
  {
    id: '2', 
    name: 'Brown Rice',
    category: 'Grains',
    calories: 123,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8
  },
  {
    id: '3',
    name: 'Broccoli',
    category: 'Vegetables',
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6
  },
  {
    id: '4',
    name: 'Banana',
    category: 'Fruits',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6
  },
  {
    id: '5',
    name: 'Ostepop (Cheese Puffs)',
    category: 'Snacks',
    calories: 520,
    protein: 6,
    carbs: 50,
    fat: 32,
    fiber: 2
  }
];

const DEMO_RECIPES = [
  {
    id: '1',
    title: 'Simple Chicken and Rice',
    description: 'A basic ARFID-friendly meal with familiar textures',
    servings: 2,
    ingredients: [
      { id: '1', amount: 200, unit: 'g' },
      { id: '2', amount: 150, unit: 'g' }
    ],
    instructions: [
      'Cook rice according to package instructions',
      'Season chicken breast with salt',
      'Cook chicken in pan until done',
      'Serve together'
    ],
    prepTime: 10,
    cookTime: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  instructions: string; // JSON string
  servings: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  visibility: string;
  isArfidFriendly: boolean;
  arfidNotes?: string;
  tags?: string; // JSON string
  recipeTimers?: string; // JSON string of recipe-specific timers
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
  ingredients: Array<{
    id: string;
    amount: number;
    unit: string;
    notes?: string;
    brand?: string;
    isOptional: boolean;
    order: number;
    ingredient: {
      id: string;
      name: string;
      category?: string;
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
    };
  }>;
  _count: {
    favorites: number;
  };
}

export interface SearchParams {
  q?: string;
  dietary?: string;
  maxPrepTime?: number;
  maxCookTime?: number;
  difficulty?: string;
  isArfidFriendly?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateRecipePayload {
  title: string;
  description?: string;
  instructions: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  visibility?: string;
  isArfidFriendly?: boolean;
  arfidNotes?: string;
  tags?: string;
  scalingKeyIngredientId?: string;
  ingredients: Array<{
    amount: number;
    unit: string;
    notes?: string;
    brand?: string;
    isOptional?: boolean;
    ingredientId: string;
  }>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('demo-token');
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    } : {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Use demo data if in demo mode AND not in production
    if (IS_DEMO_MODE && !IS_PRODUCTION) {
      console.log('Using demo data for:', endpoint);
      return this.getDemoData(endpoint, options);
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log('API Client: Making request to:', url);
    
    const response = await fetch(url, {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });

    console.log('API Client: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Client: Error response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Client: Response data:', data);
    return data;
  }

  private getDemoData<T>(endpoint: string, options: RequestInit = {}): T {
    const [, resource, id] = endpoint.split('/');
    const method = options.method || 'GET';
    
    if (endpoint === '/health') {
      return { status: 'OK', timestamp: new Date().toISOString() } as T;
    }

    switch (resource) {
      case 'recipes':
        if (method === 'GET' && !id) return DEMO_RECIPES as T;
        if (method === 'GET' && id) return DEMO_RECIPES.find(r => r.id === id) as T;
        if (method === 'POST') {
          const newRecipe = { ...JSON.parse(options.body as string), id: Date.now().toString() };
          return newRecipe as T;
        }
        return DEMO_RECIPES as T;
        
      case 'ingredients':
        if (method === 'GET' && !id) return DEMO_INGREDIENTS as T;
        if (method === 'POST') {
          const newIngredient = { ...JSON.parse(options.body as string), id: Date.now().toString() };
          return newIngredient as T;
        }
        return DEMO_INGREDIENTS as T;
        
      case 'auth':
        return { user: { id: '1', email: 'demo@example.com', name: 'Demo User' }, token: 'demo-token' } as T;
        
      default:
        return [] as T;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    if (IS_DEMO_MODE && !IS_PRODUCTION) {
      // Demo mode - always succeed with demo user
      const demoAuth = { 
        user: { id: '1', email: email, name: 'Demo User' }, 
        token: 'demo-token' 
      };
      // Store demo token for subsequent requests
      localStorage.setItem('demo-token', 'demo-token');
      localStorage.setItem('demo-user', JSON.stringify(demoAuth.user));
      return demoAuth;
    }
    
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<{ user: any; token: string }> {
    if (IS_DEMO_MODE && !IS_PRODUCTION) {
      // Demo mode - always succeed with demo user
      const demoAuth = { 
        user: { id: '1', email: email, name: name || 'Demo User' }, 
        token: 'demo-token' 
      };
      // Store demo token for subsequent requests
      localStorage.setItem('demo-token', 'demo-token');
      localStorage.setItem('demo-user', JSON.stringify(demoAuth.user));
      return demoAuth;
    }
    
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout(): Promise<void> {
    if (IS_DEMO_MODE && !IS_PRODUCTION) {
      // Demo mode - just clear local storage
      localStorage.removeItem('demo-token');
      localStorage.removeItem('demo-user');
      return;
    }
    
    await this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<any> {
    if (IS_DEMO_MODE && !IS_PRODUCTION) {
      const demoUser = localStorage.getItem('demo-user');
      if (demoUser) {
        return JSON.parse(demoUser);
      }
      return null;
    }
    
    return this.request<any>('/auth/me');
  }

  // Recipe endpoints
  async getRecipes(params: SearchParams = {}): Promise<Recipe[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    return this.request<Recipe[]>(`/recipes${query ? `?${query}` : ''}`);
  }

  async getRecipe(id: string, scale?: number): Promise<Recipe> {
    const query = scale ? `?scale=${scale}` : '';
    return this.request<Recipe>(`/recipes/${id}${query}`);
  }

  async searchRecipes(params: SearchParams): Promise<Recipe[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request<Recipe[]>(`/recipes/search?${searchParams.toString()}`);
  }

  async getFeaturedRecipe(): Promise<Recipe | null> {
    try {
      return await this.request<Recipe>('/recipes/featured');
    } catch (error) {
      console.warn('No featured recipe found:', error);
      return null;
    }
  }

  async createRecipe(recipeData: CreateRecipePayload): Promise<Recipe> {
    return this.request<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
  }

  async toggleFavorite(recipeId: string): Promise<{ favorited: boolean }> {
    return this.request<{ favorited: boolean }>(`/recipes/${recipeId}/favorite`, {
      method: 'POST',
    });
  }

  async getFavoriteRecipes(): Promise<Recipe[]> {
    return this.request<Recipe[]>('/recipes/favorites/mine');
  }

  // Ingredient endpoints
  async getIngredients(): Promise<any[]> {
    return this.request<any[]>('/ingredients');
  }

  async getIngredient(id: string): Promise<any> {
    return this.request<any>(`/ingredients/${id}`);
  }

  async searchIngredients(query: string): Promise<any[]> {
    const searchParams = new URLSearchParams({ q: query });
    return this.request<any[]>(`/ingredients?${searchParams.toString()}`);
  }

  async createIngredient(ingredientData: any): Promise<any> {
    return this.request<any>('/ingredients', {
      method: 'POST',
      body: JSON.stringify(ingredientData),
    });
  }

  async updateIngredient(id: string, ingredientData: any): Promise<any> {
    return this.request<any>(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ingredientData),
    });
  }

  async deleteIngredient(id: string): Promise<void> {
    return this.request<void>(`/ingredients/${id}`, {
      method: 'DELETE',
    });
  }

  async findOrCreateIngredient(name: string, category?: string): Promise<any> {
    try {
      // First, search for existing ingredient
      const existing = await this.searchIngredients(name);
      const exactMatch = existing.find(ing => 
        ing.name.toLowerCase() === name.toLowerCase()
      );
      
      if (exactMatch) {
        return exactMatch;
      }
      
      // If not found, create new ingredient
      return await this.createIngredient({ 
        name: name.trim(), 
        category: category || 'Other' 
      });
    } catch (error) {
      console.error('Error finding/creating ingredient:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Helper function to parse JSON strings safely
export function safeParseJson<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

// Helper function to format instructions
export function getInstructions(recipe: Recipe): string[] {
  return safeParseJson(recipe.instructions, []);
}

// Helper function to get tags
export function getTags(recipe: Recipe): string[] {
  return safeParseJson(recipe.tags, []);
}