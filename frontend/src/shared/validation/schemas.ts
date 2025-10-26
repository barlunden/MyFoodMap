import { z } from 'zod';

// **************************************************
// User Authentication Schemas
// **************************************************

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be no more than 128 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)')
  .refine((val) => !val.toLowerCase().includes('password'), {
    message: 'Password cannot contain the word "password"',
  })
  .refine((val) => !val.includes('123456'), {
    message: 'Password cannot contain common sequences like "123456"',
  })
  .refine((val) => !/(.)\1{3,}/.test(val), {
    message: 'Password cannot contain more than 3 repeated characters',
  });

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(254, 'Email is too long')
  .toLowerCase()
  .transform((val) => val.trim());

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username must be no more than 30 characters long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .toLowerCase()
  .refine((val) => {
    const inappropriate = ['admin', 'root', 'system', 'test', 'user', 'null', 'undefined'];
    return !inappropriate.includes(val);
  }, {
    message: 'This username is not allowed',
  });

export const nameSchema = z
  .string()
  .max(100, 'Name must be no more than 100 characters long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform((val) => val.trim())
  .optional();

// **************************************************
// Authentication Request Schemas
// **************************************************

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  username: usernameSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// **************************************************
// Recipe Schemas
// **************************************************

export const recipeIngredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Ingredient name is required').max(100, 'Ingredient name too long'),
  amount: z.number().min(0, 'Amount must be positive').max(10000, 'Amount too large'),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit name too long'),
  notes: z.string().max(200, 'Notes too long').optional(),
});

export const recipeInstructionSchema = z
  .string()
  .min(5, 'Instruction must be at least 5 characters')
  .max(1000, 'Instruction too long');

export const recipeSchema = z.object({
  title: z
    .string()
    .min(3, 'Recipe title must be at least 3 characters long')
    .max(100, 'Recipe title must be no more than 100 characters long')
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(500, 'Description too long')
    .transform((val) => val.trim())
    .optional(),
  servings: z
    .number()
    .int('Servings must be a whole number')
    .min(1, 'Servings must be at least 1')
    .max(100, 'Servings cannot be more than 100'),
  prepTime: z
    .number()
    .int('Prep time must be a whole number')
    .min(0, 'Prep time cannot be negative')
    .max(1440, 'Prep time cannot be more than 24 hours')
    .optional(),
  cookTime: z
    .number()
    .int('Cook time must be a whole number')
    .min(0, 'Cook time cannot be negative')
    .max(1440, 'Cook time cannot be more than 24 hours')
    .optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(20, 'Too many tags')
    .optional()
    .default([]),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, 'Recipe must have at least one ingredient')
    .max(50, 'Too many ingredients'),
  instructions: z
    .array(recipeInstructionSchema)
    .min(1, 'Recipe must have at least one instruction')
    .max(50, 'Too many instructions'),
  isPublic: z.boolean().default(false),
  scalingKeyIngredient: z.string().optional(),
});

// **************************************************
// Safe Foods Schemas (ARFID specific)
// **************************************************

export const safeFoodSchema = z.object({
  foodName: z
    .string()
    .min(1, 'Food name is required')
    .max(100, 'Food name too long')
    .transform((val) => val.trim()),
  category: z
    .string()
    .max(50, 'Category name too long')
    .optional(),
  preparationNotes: z
    .string()
    .max(500, 'Preparation notes too long')
    .optional(),
  textureNotes: z
    .string()
    .max(500, 'Texture notes too long')
    .optional(),
  brandPreference: z
    .string()
    .max(100, 'Brand preference too long')
    .optional(),
  spiceLevel: z
    .number()
    .int()
    .min(0, 'Spice level must be 0 or higher')
    .max(10, 'Spice level must be 10 or lower')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes too long')
    .optional(),
  confidenceLevel: z
    .number()
    .int()
    .min(1, 'Confidence level must be between 1 and 5')
    .max(5, 'Confidence level must be between 1 and 5')
    .default(3),
  dateFirstAccepted: z
    .string()
    .datetime('Invalid date format')
    .optional(),
});

// **************************************************
// Meal Logging Schemas
// **************************************************

export const mealLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  foodName: z
    .string()
    .min(1, 'Food name is required')
    .max(100, 'Food name too long'),
  portion: z
    .string()
    .max(50, 'Portion description too long')
    .optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  wasSuccessful: z.boolean(),
  notes: z
    .string()
    .max(500, 'Notes too long')
    .optional(),
  spiceLevel: z
    .number()
    .int()
    .min(0)
    .max(10)
    .optional(),
  texture: z
    .string()
    .max(100, 'Texture description too long')
    .optional(),
});

// **************************************************
// Nutrition Schemas
// **************************************************

export const nutritionSchema = z.object({
  calories: z.number().min(0).max(10000).optional(),
  protein: z.number().min(0).max(1000).optional(),
  carbs: z.number().min(0).max(1000).optional(),
  fat: z.number().min(0).max(1000).optional(),
  fiber: z.number().min(0).max(200).optional(),
  sugar: z.number().min(0).max(1000).optional(),
  sodium: z.number().min(0).max(10000).optional(),
});

// **************************************************
// Search & Filter Schemas
// **************************************************

export const recipeSearchSchema = z.object({
  query: z.string().max(100).optional(),
  dietary: z.string().max(50).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  maxPrepTime: z.number().int().min(0).max(1440).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isPublic: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// **************************************************
// API Response Schemas
// **************************************************

export const apiErrorSchema = z.object({
  error: z.string(),
  details: z.array(z.string()).optional(),
  code: z.string().optional(),
});

export const apiSuccessSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// **************************************************
// Type Exports
// **************************************************

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RecipeRequest = z.infer<typeof recipeSchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type SafeFoodRequest = z.infer<typeof safeFoodSchema>;
export type MealLogRequest = z.infer<typeof mealLogSchema>;
export type NutritionData = z.infer<typeof nutritionSchema>;
export type RecipeSearchRequest = z.infer<typeof recipeSearchSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiSuccess = z.infer<typeof apiSuccessSchema>;

// **************************************************
// Validation Helper Functions
// **************************************************

export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return {
      success: false,
      errors: ['Validation failed with unknown error'],
    };
  }
}

export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  return result;
}