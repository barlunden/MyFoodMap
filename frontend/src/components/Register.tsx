import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { validatePassword, validateEmail, validateName, type PasswordValidationResult } from '../utils/validation';

interface RegisterProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

export default function Register({ onClose, onSwitchToLogin }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  
  const { register } = useAuth();

  // Real-time validation
  const emailValidation = useMemo(() => validateEmail(email), [email]);
  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const nameValidation = useMemo(() => validateName(name), [name]);
  
  const passwordsMatch = password === confirmPassword;
  const isFormValid = emailValidation.isValid && 
                     passwordValidation.isValid && 
                     nameValidation.isValid && 
                     passwordsMatch && 
                     confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Final validation
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid email');
      return;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    if (name && !nameValidation.isValid) {
      setError(nameValidation.error || 'Please enter a valid name');
      return;
    }

    setIsLoading(true);

    try {
      await register(email.trim(), password, name.trim() || undefined);
      onClose?.();
      // Redirect to recipes page
      window.location.href = '/recipes';
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        // Handle validation errors from backend
        if (error.message.includes('Validation failed')) {
          setError('Please check your input and try again');
        } else {
          setError(error.message);
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: PasswordValidationResult['strength']) => {
    switch (strength) {
      case 'strong': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getPasswordStrengthText = (strength: PasswordValidationResult['strength']) => {
    switch (strength) {
      case 'strong': return 'Strong password';
      case 'medium': return 'Medium strength';
      default: return 'Weak password';
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Join MyFoodMap</h2>
        <p className="text-gray-600 mt-2">Create your account to start scaling recipes</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              name && !nameValidation.isValid ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
          {name && !nameValidation.isValid && (
            <p className="mt-1 text-sm text-red-600">{nameValidation.error}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              email && !emailValidation.isValid ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          {email && !emailValidation.isValid && (
            <p className="mt-1 text-sm text-red-600">{emailValidation.error}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordHelp(true)}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                password && !passwordValidation.isValid ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Create a strong password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPasswordHelp(!showPasswordHelp)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          
          {/* Password strength indicator */}
          {password && (
            <div className={`mt-2 p-2 rounded border text-xs ${getPasswordStrengthColor(passwordValidation.strength)}`}>
              <div className="font-medium">{getPasswordStrengthText(passwordValidation.strength)}</div>
            </div>
          )}
          
          {/* Password help */}
          {showPasswordHelp && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div className="font-medium text-blue-800 mb-2">Password Requirements:</div>
              <ul className="text-blue-700 space-y-1">
                <li className={password.length >= 8 ? 'text-green-600' : ''}>
                  ✓ At least 8 characters long
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                  ✓ One uppercase letter
                </li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                  ✓ One lowercase letter
                </li>
                <li className={/\d/.test(password) ? 'text-green-600' : ''}>
                  ✓ One number
                </li>
                <li className={/[@$!%*?&]/.test(password) ? 'text-green-600' : ''}>
                  ✓ One special character (@$!%*?&)
                </li>
              </ul>
            </div>
          )}
          
          {/* Password errors */}
          {password && !passwordValidation.isValid && (
            <div className="mt-2">
              {passwordValidation.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">{error}</p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              confirmPassword && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
            disabled={isLoading}
          />
          {confirmPassword && !passwordsMatch && (
            <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}