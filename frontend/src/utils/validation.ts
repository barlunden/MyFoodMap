// Frontend validation utilities using Zod for MyFoodMap
import { z } from 'zod';
import {
  passwordSchema,
  emailSchema,
  usernameSchema,
  nameSchema,
  registerSchema,
  loginSchema,
  recipeSchema,
  safeFoodSchema,
  mealLogSchema,
  validateWithSchema,
  safeValidate,
  type RegisterRequest,
  type LoginRequest,
  type RecipeRequest,
  type SafeFoodRequest,
  type MealLogRequest,
} from '../shared/validation/schemas'

// Re-export commonly used schemas and types
export {
  passwordSchema,
  emailSchema,
  usernameSchema,
  nameSchema,
  registerSchema,
  loginSchema,
  recipeSchema,
  safeFoodSchema,
  mealLogSchema,
  validateWithSchema,
  safeValidate,
};

export type {
  RegisterRequest,
  LoginRequest,
  RecipeRequest,
  SafeFoodRequest,
  MealLogRequest,
};

// **************************************************
// Legacy Interface Support (for backwards compatibility)
// **************************************************

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

// **************************************************
// Enhanced Validation Functions
// **************************************************

/**
 * Validates password with strength calculation
 */
export function validatePassword(password: string): PasswordValidationResult {
  const result = safeValidate(passwordSchema, password);
  
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.errors.map((err: { message: string }) => err.message),
      strength: 'weak',
    };
  }
  
  // Calculate strength
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const isLongEnough = password.length >= 8;
  const isVeryLong = password.length >= 12;
  
  const strengthPoints = [hasUpper, hasLower, hasNumber, hasSpecial, isLongEnough, isVeryLong]
    .filter(Boolean).length;
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (strengthPoints >= 5) {
    strength = 'strong';
  } else if (strengthPoints >= 4) {
    strength = 'medium';
  }
  
  return {
    isValid: true,
    errors: [],
    strength,
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): EmailValidationResult {
  const result = safeValidate(emailSchema, email);
  
  if (!result.success) {
    return {
      isValid: false,
      error: result.error.errors[0]?.message || 'Invalid email',
    };
  }
  
  return { isValid: true };
}

/**
 * Validates username format
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const result = safeValidate(usernameSchema, username);
  
  if (!result.success) {
    return {
      isValid: false,
      error: result.error.errors[0]?.message || 'Invalid username',
    };
  }
  
  return { isValid: true };
}

/**
 * Validates name format (for full name)
 */
export function validateName(name: string): { isValid: boolean; error?: string } {
  const result = safeValidate(nameSchema, name);
  
  if (!result.success) {
    return {
      isValid: false,
      error: result.error.errors[0]?.message || 'Invalid name',
    };
  }
  
  return { isValid: true };
}

/**
 * Validates recipe title (legacy function)
 */
export function validateRecipeTitle(title: string): { isValid: boolean; error?: string } {
  const titleSchema = z.string()
    .min(3, 'Recipe title must be at least 3 characters long')
    .max(100, 'Recipe title must be no more than 100 characters long');
  
  const result = safeValidate(titleSchema, title);
  
  if (!result.success) {
    return {
      isValid: false,
      error: result.error.errors[0]?.message || 'Invalid recipe title',
    };
  }
  
  return { isValid: true };
}

/**
 * Validates and formats servings number
 */
export function validateServings(servings: number | string): { isValid: boolean; value?: number; error?: string } {
  const servingsSchema = z.number()
    .int('Servings must be a whole number')
    .min(1, 'Servings must be at least 1')
    .max(100, 'Servings cannot be more than 100');
  
  const num = typeof servings === 'string' ? parseInt(servings, 10) : servings;
  const result = safeValidate(servingsSchema, num);
  
  if (!result.success) {
    return {
      isValid: false,
      error: result.error.errors[0]?.message || 'Invalid servings',
    };
  }
  
  return { isValid: true, value: result.data };
}

/**
 * Sanitizes user input to prevent XSS (legacy function)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim(); // Remove leading/trailing whitespace
}

// **************************************************
// New Zod-based Validation Functions
// **************************************************

/**
 * Validates complete registration data
 */
export function validateRegistration(data: unknown) {
  return validateWithSchema(registerSchema, data);
}

/**
 * Validates login data
 */
export function validateLogin(data: unknown) {
  return validateWithSchema(loginSchema, data);
}

/**
 * Validates recipe data
 */
export function validateRecipe(data: unknown) {
  return validateWithSchema(recipeSchema, data);
}

/**
 * Validates safe food data
 */
export function validateSafeFood(data: unknown) {
  return validateWithSchema(safeFoodSchema, data);
}

/**
 * Validates meal log data
 */
export function validateMealLog(data: unknown) {
  return validateWithSchema(mealLogSchema, data);
}

// **************************************************
// Form Validation Helpers
// **************************************************

/**
 * Real-time form field validation
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { isValid: boolean; error?: string } {
  const result = safeValidate(schema, value);
  
  if (!result.success) {
    return {
      isValid: false,
      error: result.error.errors[0]?.message || 'Invalid input',
    };
  }
  
  return { isValid: true };
}

/**
 * Validates form data incrementally as user types
 */
export function validateFormField(fieldName: string, value: unknown): { isValid: boolean; error?: string } {
  switch (fieldName) {
    case 'email':
      return validateField(emailSchema, value);
    case 'password':
      const passwordResult = validatePassword(value as string);
      return {
        isValid: passwordResult.isValid,
        error: passwordResult.errors[0],
      };
    case 'username':
      return validateField(usernameSchema, value);
    case 'name':
      return validateField(nameSchema, value);
    default:
      return { isValid: true };
  }
}

// **************************************************
// ARFID-specific Validation
// **************************************************

/**
 * Validates spice level for ARFID users
 */
export function validateSpiceLevel(level: number): { isValid: boolean; error?: string } {
  const spiceLevelSchema = z.number()
    .int('Spice level must be a whole number')
    .min(0, 'Spice level must be 0 or higher')
    .max(10, 'Spice level must be 10 or lower');
  
  return validateField(spiceLevelSchema, level);
}

/**
 * Validates confidence level for safe foods
 */
export function validateConfidenceLevel(level: number): { isValid: boolean; error?: string } {
  const confidenceSchema = z.number()
    .int('Confidence level must be a whole number')
    .min(1, 'Confidence level must be between 1 and 5')
    .max(5, 'Confidence level must be between 1 and 5');
  
  return validateField(confidenceSchema, level);
}

// **************************************************
// Constants
// **************************************************

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  allowedSpecialChars: '@$!%*?&',
} as const;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;