// Mock data for frontend development without backend
export interface MockUser {
  id: string;
  email: string;
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  dietaryPreferences?: string;
  arfidConsiderations?: string;
  createdAt: string;
}

export interface MockIngredient {
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
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
}

export interface MockRecipeIngredient {
  id: string;
  amount: number;
  unit: string;
  notes?: string;
  brand?: string;
  isOptional: boolean;
  order: number;
  ingredient: MockIngredient;
}

export interface MockRecipe {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  visibility: string;
  isFeatured: boolean;
  isArfidFriendly: boolean;
  arfidNotes?: string;
  scalingKeyIngredientId?: string;
  tags?: string;
  recipeTimers?: string;
  createdAt: string;
  updatedAt: string;
  user: MockUser;
  ingredients: MockRecipeIngredient[];
}

export interface MockSafeFood {
  id: string;
  userId: string;
  foodName: string;
  dateFirstAccepted: string;
  category?: string;
  preparationNotes?: string;
  brandPreference?: string;
  textureNotes?: string;
  photoUrl?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockMealLog {
  id: string;
  userId: string;
  safeFoodId: string;
  mealDate: string;
  mealType: string;
  portionEaten: string;
  energyBefore?: number;
  energyAfter?: number;
  location?: string;
  successFactors?: string;
  notes?: string;
  createdAt: string;
  safeFood: MockSafeFood;
}

export interface MockLockdownLog {
  id: string;
  userId: string;
  incidentDate: string;
  incidentTime: string;
  durationMinutes?: number;
  energyLevelBefore?: number;
  triggers?: string;
  behaviorsObserved?: string;
  resolutionStrategy?: string;
  resolutionTimeMinutes?: number;
  familyImpactLevel?: number;
  notes?: string;
  lessonsLearned?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock user
export const mockUser: MockUser = {
  id: "user1",
  email: "emma@example.com",
  username: "emma_arfid",
  name: "Emma Johnson",
  bio: "Mom of two children with ARFID. Sharing recipes and tips for safe food exploration.",
  avatar: "/avatars/emma.jpg",
  dietaryPreferences: JSON.stringify(["gluten-sensitive", "texture-aware", "limited-vegetables"]),
  arfidConsiderations: "Focus on consistent textures and familiar flavors. Avoid mixed textures.",
  createdAt: "2024-01-15T09:00:00Z"
};

// Mock ingredients
export const mockIngredients: MockIngredient[] = [
  {
    id: "ing1",
    name: "All-purpose flour",
    category: "grain",
    calories: 364,
    protein: 10.3,
    carbs: 76.3,
    fat: 0.98,
    fiber: 2.7,
    sugar: 0.27,
    sodium: 2,
    vitaminA: 0,
    vitaminC: 0,
    calcium: 15,
    iron: 1.17
  },
  {
    id: "ing2",
    name: "Eggs",
    category: "protein",
    calories: 155,
    protein: 13.0,
    carbs: 1.1,
    fat: 11.0,
    fiber: 0,
    sugar: 1.1,
    sodium: 124,
    vitaminA: 160,
    vitaminC: 0,
    calcium: 50,
    iron: 1.75
  },
  {
    id: "ing3",
    name: "Whole milk",
    category: "dairy",
    calories: 61,
    protein: 3.15,
    carbs: 4.8,
    fat: 3.25,
    fiber: 0,
    sugar: 4.8,
    sodium: 40,
    vitaminA: 46,
    vitaminC: 0,
    calcium: 113,
    iron: 0.03
  },
  {
    id: "ing4",
    name: "White sugar",
    category: "sweetener",
    calories: 387,
    protein: 0,
    carbs: 99.98,
    fat: 0,
    fiber: 0,
    sugar: 99.98,
    sodium: 1,
    vitaminA: 0,
    vitaminC: 0,
    calcium: 1,
    iron: 0.01
  },
  {
    id: "ing5",
    name: "Butter",
    category: "fat",
    calories: 717,
    protein: 0.85,
    carbs: 0.06,
    fat: 81.11,
    fiber: 0,
    sugar: 0.06,
    sodium: 11,
    vitaminA: 684,
    vitaminC: 0,
    calcium: 24,
    iron: 0.02
  },
  {
    id: "ing6",
    name: "Baking powder",
    category: "leavening",
    calories: 53,
    protein: 0,
    carbs: 27.7,
    fat: 0,
    fiber: 0.2,
    sugar: 0,
    sodium: 8220,
    vitaminA: 0,
    vitaminC: 0,
    calcium: 5876,
    iron: 0.49
  },
  {
    id: "ing7",
    name: "Ripe bananas",
    category: "fruit",
    calories: 89,
    protein: 1.09,
    carbs: 22.84,
    fat: 0.33,
    fiber: 2.6,
    sugar: 12.23,
    sodium: 1,
    vitaminA: 3,
    vitaminC: 8.7,
    calcium: 5,
    iron: 0.26
  }
];

// Mock safe foods
export const mockSafeFoods: MockSafeFood[] = [
  {
    id: "safe1",
    userId: "user1",
    foodName: "White bread rolls (specific store)",
    dateFirstAccepted: "2023-05-15T00:00:00Z",
    category: "carb",
    preparationNotes: "Must be fresh, not too soft or too hard",
    brandPreference: "Baker Hansen bread rolls",
    textureNotes: "Even, soft texture inside. Not too crispy crust.",
    isActive: true,
    notes: "Works best for breakfast and lunch. Can eat with butter.",
    createdAt: "2023-05-15T08:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z"
  },
  {
    id: "safe2",
    userId: "user1",
    foodName: "Pasta (white, smooth)",
    dateFirstAccepted: "2023-03-22T00:00:00Z",
    category: "carb",
    preparationNotes: "Cooked just right - not too hard or too soft. Smooth pasta without texture.",
    brandPreference: "Barilla Spaghetti",
    textureNotes: "Even, smooth texture. No rough surface or grit.",
    isActive: true,
    notes: "Can eat with just butter or a little salt. No sauces with lumps.",
    createdAt: "2023-03-22T12:00:00Z",
    updatedAt: "2024-02-01T15:00:00Z"
  },
  {
    id: "safe3",
    userId: "user1",
    foodName: "Yellow cheese slices",
    dateFirstAccepted: "2023-01-10T00:00:00Z",
    category: "protein",
    preparationNotes: "Thin, even slices. Not too thick.",
    brandPreference: "Norvegia Light",
    textureNotes: "Even, soft consistency. No hard bits or holes.",
    isActive: true,
    notes: "Works on bread or alone. Must be fresh.",
    createdAt: "2023-01-10T07:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z"
  },
  {
    id: "safe4",
    userId: "user1",
    foodName: "Vanilla yogurt (plain)",
    dateFirstAccepted: "2023-08-03T00:00:00Z",
    category: "dairy",
    preparationNotes: "Room temperature, not cold. Stirred well so it's smooth.",
    brandPreference: "Tine Natural Vanilla",
    textureNotes: "Completely smooth, no lumps or bits. Creamy consistency.",
    isActive: true,
    notes: "Can eat for breakfast or snacks. Important that it's not sour.",
    createdAt: "2023-08-03T14:00:00Z",
    updatedAt: "2024-02-10T09:00:00Z"
  },
  {
    id: "safe5",
    userId: "user1",
    foodName: "Applesauce (homemade)",
    dateFirstAccepted: "2024-01-12T00:00:00Z",
    category: "fruit",
    preparationNotes: "Cooked to completely smooth consistency, no bits or peels. Slightly sweet.",
    brandPreference: "Homemade from sweet apples",
    textureNotes: "Completely smooth purée consistency. No texture variation.",
    isActive: true,
    notes: "Recently accepted! Can help get fruit in. Like it lukewarm.",
    createdAt: "2024-01-12T16:00:00Z",
    updatedAt: "2024-02-15T10:00:00Z"
  }
];

// Mock recipes
export const mockRecipes: MockRecipe[] = [
  {
    id: "recipe1",
    title: "Simple Pancakes (ARFID-friendly)",
    description: "Soft, smooth pancakes without texture variations. Perfect for sensitive taste preferences.",
    instructions: JSON.stringify([
      "Mix flour, sugar and baking powder in a large bowl",
      "Whisk eggs and milk together in another bowl",
      "Pour the liquid slowly into the flour mixture while whisking gently",
      "Let the batter rest for 5 minutes for smooth consistency",
      "Heat a thick-bottomed pan over medium heat",
      "Melt a little butter in the pan",
      "Pour batter for one pancake at a time",
      "Cook until golden on both sides (about 2-3 min per side)",
      "Serve warm with desired toppings"
    ]),
    servings: 4,
    prepTime: 10,
    cookTime: 15,
    difficulty: "Easy",
    visibility: "PUBLIC",
    isFeatured: true,
    isArfidFriendly: true,
    arfidNotes: "Smooth texture without lumps. Can be made thinner or thicker according to preference. No surprising ingredients.",
    scalingKeyIngredientId: "ing2", // Eggs as scaling base
    tags: JSON.stringify(["ARFID-friendly", "smooth-texture", "basic-ingredients", "breakfast"]),
    recipeTimers: JSON.stringify([
      {"name": "Let batter rest", "minutes": 5, "stepIndex": 3},
      {"name": "Cook first side", "minutes": 3, "stepIndex": 7},
      {"name": "Cook second side", "minutes": 2, "stepIndex": 7}
    ]),
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-02-01T14:00:00Z",
    user: mockUser,
    ingredients: [
      {
        id: "ri1",
        amount: 2,
        unit: "cups",
        notes: "Sift to avoid lumps",
        brand: "",
        isOptional: false,
        order: 1,
        ingredient: mockIngredients[0] // All-purpose flour
      },
      {
        id: "ri2",
        amount: 2,
        unit: "pieces",
        notes: "Room temperature for best results",
        brand: "",
        isOptional: false,
        order: 2,
        ingredient: mockIngredients[1] // Eggs
      },
      {
        id: "ri3",
        amount: 3,
        unit: "cups",
        notes: "Can use lactose-free if needed",
        brand: "",
        isOptional: false,
        order: 3,
        ingredient: mockIngredients[2] // Whole milk
      },
      {
        id: "ri4",
        amount: 1,
        unit: "tbsp",
        notes: "",
        brand: "",
        isOptional: false,
        order: 4,
        ingredient: mockIngredients[3] // White sugar
      },
      {
        id: "ri5",
        amount: 1,
        unit: "tsp",
        notes: "",
        brand: "",
        isOptional: false,
        order: 5,
        ingredient: mockIngredients[5] // Baking powder
      },
      {
        id: "ri6",
        amount: 2,
        unit: "tbsp",
        notes: "For cooking",
        brand: "",
        isOptional: false,
        order: 6,
        ingredient: mockIngredients[4] // Butter
      }
    ]
  },
  {
    id: "recipe2",
    title: "Banana Puree (Introduction Recipe)",
    description: "Completely smooth banana puree for gradual introduction of fruit flavors. Sweetness can be adjusted.",
    instructions: JSON.stringify([
      "Choose ripe, sweet bananas without brown spots",
      "Cut bananas into small pieces",
      "Mash with fork until completely smooth consistency",
      "Alternative: Use immersion blender for extra smooth result",
      "Taste and add a little vanilla if desired",
      "Serve immediately or store chilled"
    ]),
    servings: 2,
    prepTime: 5,
    cookTime: 0,
    difficulty: "Easy",
    visibility: "PUBLIC",
    isFeatured: false,
    isArfidFriendly: true,
    arfidNotes: "Introduction to fruit flavor in familiar texture. Start with small amounts. Consistency can be adjusted.",
    scalingKeyIngredientId: "ing7", // Bananas as scaling base
    tags: JSON.stringify(["ARFID-friendly", "introduction-food", "no-cook", "smooth-texture", "snack"]),
    createdAt: "2024-02-05T09:00:00Z",
    updatedAt: "2024-02-10T11:00:00Z",
    user: mockUser,
    ingredients: [
      {
        id: "ri7",
        amount: 2,
        unit: "pieces",
        notes: "Ripe and sweet, without brown spots",
        brand: "",
        isOptional: false,
        order: 1,
        ingredient: mockIngredients[6] // Ripe bananas
      }
    ]
  }
];

// Mock meal logs
export const mockMealLogs: MockMealLog[] = [
  {
    id: "meal1",
    userId: "user1",
    safeFoodId: "safe1",
    mealDate: "2024-02-15T07:00:00Z",
    mealType: "breakfast",
    portionEaten: "all",
    energyBefore: 3,
    energyAfter: 4,
    location: "home",
    successFactors: "Calm morning, no stress",
    notes: "Ate the whole bread roll with butter. Seemed satisfied.",
    createdAt: "2024-02-15T07:30:00Z",
    safeFood: mockSafeFoods[0]
  },
  {
    id: "meal2",
    userId: "user1", 
    safeFoodId: "safe2",
    mealDate: "2024-02-14T17:00:00Z",
    mealType: "dinner",
    portionEaten: "most",
    energyBefore: 2,
    energyAfter: 4,
    location: "home",
    successFactors: "Made favorite pasta, nothing new on the plate",
    notes: "Ate almost everything. Left a little at the end, but that's completely normal.",
    createdAt: "2024-02-14T18:00:00Z",
    safeFood: mockSafeFoods[1]
  },
  {
    id: "meal3",
    userId: "user1",
    safeFoodId: "safe4",
    mealDate: "2024-02-14T15:00:00Z", 
    mealType: "snack",
    portionEaten: "half",
    energyBefore: 4,
    energyAfter: 4,
    location: "home",
    successFactors: "Had plenty of time, no pressure",
    notes: "Took a break halfway, but that was fine. No stress.",
    createdAt: "2024-02-14T15:30:00Z",
    safeFood: mockSafeFoods[3]
  }
];

// Mock lockdown logs
export const mockLockdownLogs: MockLockdownLog[] = [
  {
    id: "lockdown1",
    userId: "user1",
    incidentDate: "2024-02-10T18:30:00Z",
    incidentTime: "18:30",
    durationMinutes: 45,
    energyLevelBefore: 2,
    triggers: "New food on plate without warning, loud noise from kitchen",
    behaviorsObserved: "Refused to come to table, hid under table in living room",
    resolutionStrategy: "Removed the new food, put on calm music, gave time",
    resolutionTimeMinutes: 25,
    familyImpactLevel: 3,
    notes: "Had to make a completely new dinner. Important to give advance notice of changes.",
    lessonsLearned: "Always announce when new things come on the plate. Give time to prepare.",
    createdAt: "2024-02-10T19:30:00Z",
    updatedAt: "2024-02-10T20:00:00Z"
  },
  {
    id: "lockdown2", 
    userId: "user1",
    incidentDate: "2024-02-05T12:15:00Z",
    incidentTime: "12:15",
    durationMinutes: 20,
    energyLevelBefore: 3,
    triggers: "Lunch at friend's house, unknown food",
    behaviorsObserved: "Became completely quiet, eyes wide, started to hyperventilate slightly",
    resolutionStrategy: "Took to a quiet room, breathing exercises, offered safe food from home",
    resolutionTimeMinutes: 15,
    familyImpactLevel: 2,
    notes: "Fortunately had safe food from home. Friend was understanding.",
    lessonsLearned: "Always have backup food when we're away. Prepare friends in advance.",
    createdAt: "2024-02-05T13:00:00Z",
    updatedAt: "2024-02-05T13:15:00Z"
  }
];

// Helper functions for mock API
export const getMockUser = () => mockUser;
export const getMockRecipes = () => mockRecipes;
export const getMockSafeFoods = () => mockSafeFoods;
export const getMockMealLogs = () => mockMealLogs;
export const getMockLockdownLogs = () => mockLockdownLogs;
export const getMockIngredients = () => mockIngredients;

export const getFeaturedRecipe = () => mockRecipes.find(r => r.isFeatured) || mockRecipes[0];
export const getArfidFriendlyRecipes = () => mockRecipes.filter(r => r.isArfidFriendly);