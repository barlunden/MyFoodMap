import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Try to use auth context, with fallback
  let user, logout, isAuthenticated;
  try {
    const authContext = useAuth();
    user = authContext.user;
    logout = authContext.logout;
    isAuthenticated = authContext.isAuthenticated;
  } catch (error) {
    // Fallback if not in AuthProvider context
    return <div className="text-gray-600 text-sm">User menu unavailable</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    window.location.href = '/';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.name || 'User'}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            
            <div className="py-2">
              <a
                href="/recipes"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Recipes
              </a>
              <a
                href="/recipes/add"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Add Recipe
              </a>
              <a
                href="/recipes/favorites"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Favorites
              </a>
            </div>
            
            <div className="border-t border-gray-100 py-2">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}