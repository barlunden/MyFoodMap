// Demo API client for Netlify deployment without backend
// Uses localStorage to simulate API responses

interface Ingredient {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  ingredients: any[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  createdAt: string;
  updatedAt: string;
}

class DemoApiClient {
  private baseURL = '';

  private getDemoIngredients(): Ingredient[] {
    return [
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
  }

  private getDemoRecipes(): Recipe[] {
    return [
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
  }

  // Initialize demo data
  private initDemoData() {
    if (!localStorage.getItem('demo-ingredients')) {
      localStorage.setItem('demo-ingredients', JSON.stringify(this.getDemoIngredients()));
    }
    if (!localStorage.getItem('demo-recipes')) {
      localStorage.setItem('demo-recipes', JSON.stringify(this.getDemoRecipes()));
    }
  }

  // Auth methods (demo - always succeeds)
  async register(data: { email: string; password: string; name: string }) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const user = { id: '1', email: data.email, name: data.name };
    localStorage.setItem('demo-user', JSON.stringify(user));
    localStorage.setItem('demo-token', 'demo-jwt-token');
    return { user, token: 'demo-jwt-token' };
  }

  async login(data: { email: string; password: string }) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = { id: '1', email: data.email, name: 'Demo User' };
    localStorage.setItem('demo-user', JSON.stringify(user));
    localStorage.setItem('demo-token', 'demo-jwt-token');
    return { user, token: 'demo-jwt-token' };
  }

  async logout() {
    localStorage.removeItem('demo-user');
    localStorage.removeItem('demo-token');
  }

  // Ingredients methods
  async getIngredients(): Promise<Ingredient[]> {
    this.initDemoData();
    await new Promise(resolve => setTimeout(resolve, 200));
    const ingredients = localStorage.getItem('demo-ingredients');
    return ingredients ? JSON.parse(ingredients) : [];
  }

  async createIngredient(data: Omit<Ingredient, 'id'>): Promise<Ingredient> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const ingredients = await this.getIngredients();
    const newIngredient = { ...data, id: Date.now().toString() };
    ingredients.push(newIngredient);
    localStorage.setItem('demo-ingredients', JSON.stringify(ingredients));
    return newIngredient;
  }

  async updateIngredient(id: string, data: Partial<Ingredient>): Promise<Ingredient> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const ingredients = await this.getIngredients();
    const index = ingredients.findIndex(ing => ing.id === id);
    if (index === -1) throw new Error('Ingredient not found');
    
    ingredients[index] = { ...ingredients[index], ...data };
    localStorage.setItem('demo-ingredients', JSON.stringify(ingredients));
    return ingredients[index];
  }

  async deleteIngredient(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const ingredients = await this.getIngredients();
    const filtered = ingredients.filter(ing => ing.id !== id);
    localStorage.setItem('demo-ingredients', JSON.stringify(filtered));
  }

  // Recipes methods
  async getRecipes(): Promise<Recipe[]> {
    this.initDemoData();
    await new Promise(resolve => setTimeout(resolve, 200));
    const recipes = localStorage.getItem('demo-recipes');
    return recipes ? JSON.parse(recipes) : [];
  }

  async getRecipe(id: string): Promise<Recipe> {
    const recipes = await this.getRecipes();
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) throw new Error('Recipe not found');
    return recipe;
  }

  async createRecipe(data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const recipes = await this.getRecipes();
    const newRecipe = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    recipes.push(newRecipe);
    localStorage.setItem('demo-recipes', JSON.stringify(recipes));
    return newRecipe;
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    const recipes = await this.getRecipes();
    await new Promise(resolve => setTimeout(resolve, 200));
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(query.toLowerCase()) ||
      recipe.description.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Export demo client for Netlify deployment
export const apiClient = new DemoApiClient();