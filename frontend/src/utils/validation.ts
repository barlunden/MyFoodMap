// Shared validation utilities for MyFoodMap

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  allowedSpecialChars: '@$!%*?&',
} as const;

// Strong password regex: 8+ chars, uppercase, lowercase, number, special char
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;

// Email validation regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates password against security requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  // Check length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`);
  }
  
  // Check character requirements
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[@$!%*?&]/.test(password)) {
    errors.push(`Password must contain at least one special character (${PASSWORD_REQUIREMENTS.allowedSpecialChars})`);
  }
  
  // Check for common weak patterns
  if (password.toLowerCase().includes('password')) {
    errors.push('Password cannot contain the word "password"');
  }
  
  if (password.toLowerCase().includes('123456')) {
    errors.push('Password cannot contain common sequences like "123456"');
  }
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const isLongEnough = password.length >= 8;
  const isVeryLong = password.length >= 12;
  
  const strengthPoints = [hasUpper, hasLower, hasNumber, hasSpecial, isLongEnough, isVeryLong].filter(Boolean).length;
  
  if (strengthPoints >= 5) {
    strength = 'strong';
  } else if (strengthPoints >= 4) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

/**
 * Validates username format
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be no more than 30 characters long' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  return { isValid: true };
}

/**
 * Validates name format (for full name)
 */
export function validateName(name: string): { isValid: boolean; error?: string } {
  if (!name) {
    // Name is optional, so return valid if not provided
    return { isValid: true };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Name must be no more than 100 characters long' };
  }
  
  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true };
}

/**
 * Validates recipe title
 */
export function validateRecipeTitle(title: string): { isValid: boolean; error?: string } {
  if (!title || !title.trim()) {
    return { isValid: false, error: 'Recipe title is required' };
  }
  
  if (title.trim().length < 3) {
    return { isValid: false, error: 'Recipe title must be at least 3 characters long' };
  }
  
  if (title.length > 100) {
    return { isValid: false, error: 'Recipe title must be no more than 100 characters long' };
  }
  
  return { isValid: true };
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Validates and formats servings number
 */
export function validateServings(servings: number | string): { isValid: boolean; value?: number; error?: string } {
  const num = typeof servings === 'string' ? parseInt(servings, 10) : servings;
  
  if (isNaN(num) || num < 1) {
    return { isValid: false, error: 'Servings must be at least 1' };
  }
  
  if (num > 100) {
    return { isValid: false, error: 'Servings cannot be more than 100' };
  }
  
  return { isValid: true, value: num };
}