// Simple API client for MyFoodMap
const IS_DEMO_MODE = import.meta.env.PUBLIC_DEMO_MODE === 'true';
const IS_PRODUCTION = import.meta.env.PROD;

// Use Railway backend in production, local server in development
const API_BASE_URL = IS_PRODUCTION 
  ? (import.meta.env.PUBLIC_API_URL || 'https://myfoodmap-production.up.railway.app/api')
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

export interface SafeFoodSearchParams {
  q?: string;                 // generell søking (som i SearchParams)
  name?: string;              // spesifikt namn på safe food
  category?: string;          // kategori (frukt, grønsaker, etc)
  tags?: string;              // tags/labels
  isArfidFriendly?: boolean;  // er maten "ARFID-venleg"
  limit?: number;             // antal resultat
  offset?: number;            // for paginering
}

export interface SafeFood {
  id: string;
  userId: string;
  foodName: string;
  dateFirstAccepted: string; // ISO date string
  category?: string; // "protein", "carb", "fruit", "vegetable", "dairy", "snack"
  preparationNotes?: string;
  brandPreference?: string;
  textureNotes?: string;
  photoUrl?: string;
  isActive: boolean;
  notes?: string;
  
  // Discovery system fields
  timesConsumed: number;
  personalRating?: number; // 1-5 scale
  lastConsumedDate?: string; // ISO date string
  isEstablishedSafeFood: boolean;
  
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user: {
    id: string;
    name?: string;
    username?: string;
  };
  // Nytt: kobling til ingrediens for næringsberegning
  ingredientId?: string; // kobling til ingrediens-tabellen
  defaultAmount?: number; // f.eks. 1 stk, 100g, etc.
  defaultUnit?: string;   // "g", "ml", "stk", etc.
}

export interface CreateSafeFoodPayload {
  foodName: string;
  dateFirstAccepted: string;
  category?: string;
  preparationNotes?: string;
  brandPreference?: string;
  textureNotes?: string;
  photoUrl?: string;
  notes?: string;
  personalRating?: number;
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

export interface MealLog {
  id: string;
  userId: string;
  safeFoodId?: string;
  ingredientId?: string; // NY: direkte logging av ingrediens
  recipeId?: string;     // NY: logging av oppskrift
  mealDate: string;
  mealType: string;
  portionEaten: string; // "all", "most", "half", "few-bites", "none"
  weightGrams?: number; // faktisk mengde spist (hvis kjent)
  amount?: number;      // mengde (f.eks. 2 stk, 150g, 1 porsjon)
  unit?: string;        // "g", "ml", "stk", "portion"
  energyBefore?: number; // 1-5 scale
  energyAfter?: number; // 1-5 scale
  location?: string; // "home", "school", "restaurant", etc.
  successFactors?: string;
  notes?: string;
  createdAt: string;
  
  // Relations
  user: {
    id: string;
    name?: string;
  };
  safeFood?: {
    id: string;
    foodName: string;
  };
}

export interface LockdownLog {
  id: string;
  userId: string;
  incidentDate: string; // ISO date string
  incidentTime: string;
  durationMinutes?: number;
  energyLevelBefore?: number; // 1-5 scale
  triggers?: string;
  behaviorsObserved?: string;
  resolutionStrategy?: string;
  resolutionTimeMinutes?: number;
  familyImpactLevel?: number; // 1-5 scale
  notes?: string;
  lessonsLearned?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user: {
    id: string;
    name?: string;
  };
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
    // TEMPORARY: Use no-auth endpoint for testing
    return this.request<Recipe>('/recipes/no-auth', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
  }

  async updateRecipe(id: string, recipeData: any): Promise<Recipe> {
    // TEMPORARY: use no-auth endpoint for testing
    return this.request<Recipe>(`/recipes/no-auth/${id}`, {
      method: 'PUT',
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
    return this.request<any>('/ingredients/no-auth', {
      method: 'POST',
      body: JSON.stringify(ingredientData),
    });
  }

  async updateIngredient(id: string, ingredientData: any): Promise<any> {
    return this.request<any>(`/ingredients/no-auth/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ingredientData),
    });
  }

  async deleteIngredient(id: string): Promise<void> {
    return this.request<void>(`/ingredients/no-auth/${id}`, {
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

  // Meal endpoints
  async logMeal(meal: {
    safeFoodId: string;
    mealDate: string;
    mealType: string;
    portionEaten: string;
    energyBefore?: number;
    energyAfter?: number;
    location?: string;
    successFactors?: string;
    notes?: string;
  }): Promise<MealLog> {
    return this.request<MealLog>('/meal-logs', {
      method: 'POST',
      body: JSON.stringify(meal),
    });
  }


  // Safe Foods endpoints

  async getSafeFoods(params: SafeFoodSearchParams = {}): Promise<SafeFood[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request<any[]>(`/safe-foods?${searchParams.toString()}`);
  }

  async getSafeFood(id: string): Promise<SafeFood> {
    return this.request<SafeFood>(`/safe-foods/${id}`);
  }

  async createSafeFood(safeFoodData: CreateSafeFoodPayload): Promise<SafeFood> {
    return this.request<SafeFood>('/safe-foods', {
      method: 'POST',
      body: JSON.stringify(safeFoodData),
    });
  }

  async updateSafeFood(id: string, safeFoodData: Partial<CreateSafeFoodPayload>): Promise<SafeFood> {
    return this.request<SafeFood>(`/safe-foods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(safeFoodData),
    });
  }

  async deleteSafeFood(id: string): Promise<void> {
    return this.request<void>(`/safe-foods/${id}`, {
      method: 'DELETE',
    });
  }

  // Get Logs endpoints

  async getLogs(): Promise<any[]> {
    return this.request<any[]>('/logs');
  }

  async getMealLogs(params: { startDate?: string; endDate?: string; mealType?: string } = {}): Promise<MealLog[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
  const query = searchParams.toString();
    return this.request<MealLog[]>(`/meal-logs${query ? `?${query}` : ''}`);
  }

  async getLockdownLogs(): Promise<LockdownLog[]> {
    return this.request<LockdownLog[]>('/logs/lockdowns');
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

/**
 * Nutrition summary type
 */
export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  // Add more fields as needed (sugar, sodium, etc)
}

/**
 * Calculate nutrition for a meal log entry.
 * Supports: SafeFood, Ingredient, or Recipe as source.
 */
export async function calculateMealNutrition(mealLog: MealLog): Promise<NutritionSummary | null> {
  // Helper for andel spist
  function getPortionMultiplier(portion: string): number {
    switch (portion) {
      case "all": return 1;
      case "most": return 0.75;
      case "half": return 0.5;
      case "few-bites": return 0.2;
      case "none": return 0;
      default: return 1;
    }
  }
  const portionMultiplier = getPortionMultiplier(mealLog.portionEaten);

  // 1. SafeFood
  if (mealLog.safeFoodId) {
    const safeFood = await apiClient.getSafeFood(mealLog.safeFoodId);
    if (safeFood.ingredientId) {
      const ingredient = await apiClient.getIngredient(safeFood.ingredientId);
      // Bruk weightGrams eller defaultAmount
      const grams = mealLog.weightGrams ?? safeFood.defaultAmount ?? 0;
      const factor = grams / 100 * portionMultiplier;
      return {
        calories: (ingredient.calories ?? 0) * factor,
        protein: (ingredient.protein ?? 0) * factor,
        carbs: (ingredient.carbs ?? 0) * factor,
        fat: (ingredient.fat ?? 0) * factor,
        fiber: (ingredient.fiber ?? 0) * factor,
      };
    }
    return null;
  }

  // 2. Direkte ingrediens
  if (mealLog.ingredientId) {
    const ingredient = await apiClient.getIngredient(mealLog.ingredientId);
    const grams = mealLog.weightGrams ?? mealLog.amount ?? 0;
    const factor = grams / 100 * portionMultiplier;
    return {
      calories: (ingredient.calories ?? 0) * factor,
      protein: (ingredient.protein ?? 0) * factor,
      carbs: (ingredient.carbs ?? 0) * factor,
      fat: (ingredient.fat ?? 0) * factor,
      fiber: (ingredient.fiber ?? 0) * factor,
    };
  }

  // 3. Oppskrift
  if (mealLog.recipeId) {
    const recipe = await apiClient.getRecipe(mealLog.recipeId);
    // Summer næring for alle ingredienser i oppskriften
    let total: NutritionSummary = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    for (const ing of recipe.ingredients) {
      const grams = ing.unit === "g" ? ing.amount : 0; // For enkelhet, kun gram støttes her
      const ingredient = ing.ingredient;
      const factor = grams / 100;
      total.calories += (ingredient.calories ?? 0) * factor;
      total.protein += (ingredient.protein ?? 0) * factor;
      total.carbs += (ingredient.carbs ?? 0) * factor;
      total.fat += (ingredient.fat ?? 0) * factor;
      total.fiber += (ingredient.fiber ?? 0) * factor;
    }
    // Del på antall porsjoner og multipliser med andel spist
    const perPortion = {
      calories: total.calories / (recipe.servings || 1),
      protein: total.protein / (recipe.servings || 1),
      carbs: total.carbs / (recipe.servings || 1),
      fat: total.fat / (recipe.servings || 1),
      fiber: total.fiber / (recipe.servings || 1),
    };
    return {
      calories: perPortion.calories * portionMultiplier,
      protein: perPortion.protein * portionMultiplier,
      carbs: perPortion.carbs * portionMultiplier,
      fat: perPortion.fat * portionMultiplier,
      fiber: perPortion.fiber * portionMultiplier,
    };
  }

  // Ingen kilde funnet
  return null;
}

/**
 * Aggregate total nutrition for a dag basert på meal logs.
 * @param mealLogs Array of MealLog
 * @returns NutritionSummary for the day
 */
export async function calculateDayNutrition(mealLogs: MealLog[]): Promise<NutritionSummary> {
  const total: NutritionSummary = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };

  for (const log of mealLogs) {
    const nutrition = await calculateMealNutrition(log);
    if (nutrition) {
      total.calories += nutrition.calories;
      total.protein += nutrition.protein;
      total.carbs += nutrition.carbs;
      total.fat += nutrition.fat;
      total.fiber += nutrition.fiber;
    }
  }
  return total;
}

