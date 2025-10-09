// Simple API client for MyFoodMap with conditional demo mode
import { apiClient as demoApiClient } from './api-demo';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';
const IS_DEMO_MODE = import.meta.env.PUBLIC_DEMO_MODE === 'true';

console.log('API Base URL:', API_BASE_URL);
console.log('Demo Mode:', IS_DEMO_MODE);

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
    // Use demo client in demo mode
    if (IS_DEMO_MODE) {
      console.log('Using demo API client for:', endpoint);
      return this.routeToDemoClient(endpoint, options);
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

  private async routeToDemoClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Route to appropriate demo method based on endpoint
    const [, resource, id, action] = endpoint.split('/');
    const method = options.method || 'GET';
    
    if (endpoint === '/health') {
      return { status: 'OK', timestamp: new Date().toISOString() } as T;
    }

    switch (resource) {
      case 'recipes':
        if (method === 'GET' && !id) return demoApiClient.getRecipes();
        if (method === 'GET' && id) return demoApiClient.getRecipe(id);
        if (method === 'POST') return demoApiClient.createRecipe(JSON.parse(options.body as string));
        if (action === 'search') return demoApiClient.searchRecipes('');
        break;
      case 'ingredients':
        if (method === 'GET' && !id) return demoApiClient.getIngredients();
        if (method === 'POST') return demoApiClient.createIngredient(JSON.parse(options.body as string));
        if (method === 'PUT') return demoApiClient.updateIngredient(id, JSON.parse(options.body as string));
        if (method === 'DELETE') return demoApiClient.deleteIngredient(id);
        break;
      case 'auth':
        if (action === 'register') return demoApiClient.register(JSON.parse(options.body as string));
        if (action === 'login') return demoApiClient.login(JSON.parse(options.body as string));
        break;
    }
    
    throw new Error(`Demo API: Endpoint not implemented: ${endpoint}`);
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