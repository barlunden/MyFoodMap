// Server-side validation utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Password requirements (same as frontend)
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  allowedSpecialChars: '@$!%*?&',
} as const;

// Validation regexes
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

/**
 * Validates password on server side
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (typeof password !== 'string') {
    errors.push('Password must be a string');
    return { isValid: false, errors };
  }
  
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
  const lowercasePassword = password.toLowerCase();
  if (lowercasePassword.includes('password')) {
    errors.push('Password cannot contain the word "password"');
  }
  
  if (lowercasePassword.includes('123456')) {
    errors.push('Password cannot contain common sequences like "123456"');
  }
  
  // Check for repeated characters
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Password cannot contain more than 3 repeated characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates email on server side
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  if (typeof email !== 'string') {
    errors.push('Email must be a string');
    return { isValid: false, errors };
  }
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    errors.push('Email is required');
  }
  
  if (trimmedEmail.length > 254) {
    errors.push('Email is too long');
  }
  
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates username on server side
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  
  if (!username) {
    errors.push('Username is required');
    return { isValid: false, errors };
  }
  
  if (typeof username !== 'string') {
    errors.push('Username must be a string');
    return { isValid: false, errors };
  }
  
  const trimmedUsername = username.trim();
  
  if (trimmedUsername.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (trimmedUsername.length > 30) {
    errors.push('Username must be no more than 30 characters long');
  }
  
  if (!USERNAME_REGEX.test(trimmedUsername)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  // Check for inappropriate usernames
  const inappropriate = ['admin', 'root', 'system', 'test', 'user', 'null', 'undefined'];
  if (inappropriate.includes(trimmedUsername.toLowerCase())) {
    errors.push('This username is not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates name field
 */
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name) {
    // Name is optional, so return valid if not provided
    return { isValid: true, errors: [] };
  }
  
  if (typeof name !== 'string') {
    errors.push('Name must be a string');
    return { isValid: false, errors };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length > 100) {
    errors.push('Name must be no more than 100 characters long');
  }
  
  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes string input
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .substring(0, 1000); // Limit length to prevent DoS
}

/**
 * Validates request body for registration
 */
export function validateRegistrationData(data: any): {
  isValid: boolean;
  errors: string[];
  sanitizedData?: {
    email: string;
    password: string;
    name?: string;
    username?: string;
  };
} {
  const allErrors: string[] = [];
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  allErrors.push(...emailValidation.errors);
  
  // Validate password
  const passwordValidation = validatePassword(data.password);
  allErrors.push(...passwordValidation.errors);
  
  // Validate optional name
  const nameValidation = validateName(data.name);
  allErrors.push(...nameValidation.errors);
  
  // Validate optional username
  let usernameValidation: ValidationResult = { isValid: true, errors: [] };
  if (data.username) {
    usernameValidation = validateUsername(data.username);
    allErrors.push(...usernameValidation.errors);
  }
  
  const isValid = allErrors.length === 0;
  
  if (isValid) {
    return {
      isValid: true,
      errors: [],
      sanitizedData: {
        email: sanitizeString(data.email).toLowerCase(),
        password: data.password, // Don't sanitize password - keep original for hashing
        name: data.name ? sanitizeString(data.name) : undefined,
        username: data.username ? sanitizeString(data.username).toLowerCase() : undefined,
      },
    };
  }
  
  return {
    isValid: false,
    errors: allErrors,
  };
}

/**
 * Validates request body for login
 */
export function validateLoginData(data: any): {
  isValid: boolean;
  errors: string[];
  sanitizedData?: {
    email: string;
    password: string;
  };
} {
  const allErrors: string[] = [];
  
  // Basic validation for login (less strict than registration)
  if (!data.email) {
    allErrors.push('Email is required');
  } else if (typeof data.email !== 'string') {
    allErrors.push('Email must be a string');
  }
  
  if (!data.password) {
    allErrors.push('Password is required');
  } else if (typeof data.password !== 'string') {
    allErrors.push('Password must be a string');
  }
  
  const isValid = allErrors.length === 0;
  
  if (isValid) {
    return {
      isValid: true,
      errors: [],
      sanitizedData: {
        email: sanitizeString(data.email).toLowerCase(),
        password: data.password, // Don't sanitize password
      },
    };
  }
  
  return {
    isValid: false,
    errors: allErrors,
  };
}