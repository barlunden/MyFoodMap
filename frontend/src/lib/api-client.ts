// Simple API client for backend communication
const IS_PRODUCTION = import.meta.env.MODE === 'production';
const API_BASE_URL = IS_PRODUCTION 
  ? (import.meta.env.PUBLIC_API_URL || 'https://myfoodmap-production.up.railway.app/api')
  : (import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api');

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${error}`);
      throw error;
    }
  }

  // Recipe endpoints
  async getRecipes() {
    return this.request('/recipes');
  }

  async getFeaturedRecipe() {
    return this.request('/recipes/featured');
  }

  async getRecipe(id: string) {
    return this.request(`/recipes/${id}`);
  }

  async createRecipe(recipeData: any) {
    return this.request('/recipes/no-auth', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
  }

  async updateRecipe(id: string, recipeData: any) {
    return this.request(`/recipes/no-auth/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData),
    });
  }

  // Logs endpoints
  async getLogs() {
    return this.request('/logs');
  }

  async getMealLogs() {
    return this.request('/logs/meals');
  }

  async getLockdownLogs() {
    return this.request('/logs/lockdowns');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();