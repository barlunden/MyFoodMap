import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

// Component that handles auth safely
function HeaderWithAuth({ showSearch }: { showSearch?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // This will now be safely within the AuthProvider
  const { isAuthenticated, isLoading } = useAuth();

  const handleAuthClick = (mode: 'login' | 'register') => {
    console.log('Auth button clicked:', mode);
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // Default search handler
  const handleSearch = (query: string, filters: any) => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.append('q', query);
    // Add other filters as needed
    const searchUrl = `/search?${searchParams.toString()}`;
    window.location.href = searchUrl;
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <nav className="container mx-auto px-4 pt-8 pb-6">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <a href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              MyFoodMap
            </a>
            <p className="text-sm text-gray-600 mt-1">
              For picky eaters and ARFID families
            </p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/recipes" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Recipes
            </a>
            <a href="/nutrition" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Nutrition
            </a>
            <a href="/ingredients" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Ingredients
            </a>
            {isAuthenticated && (
              <>
                <a href="/food-diary" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  📖 Food Diary
                </a>
                <a href="/recipes/add" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Add Recipe
                </a>
              </>
            )}
            
            {/* Auth Controls */}
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleAuthClick('login')}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleAuthClick('register')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Search Bar Row */}
        {showSearch && (
          <div className="mb-2">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search recipes, ingredients, or dietary preferences..."
              showFilters={true}
            />
          </div>
        )}
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <a 
              href="/recipes" 
              className="block text-gray-600 hover:text-gray-900 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Recipes
            </a>
            <a 
              href="/nutrition" 
              className="block text-gray-600 hover:text-gray-900 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Nutrition
            </a>
            <a 
              href="/ingredients" 
              className="block text-gray-600 hover:text-gray-900 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Ingredients
            </a>
            {isAuthenticated && (
              <>
                <a 
                  href="/food-diary" 
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📖 Food Diary
                </a>
                <a 
                  href="/recipes/add" 
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Add Recipe
                </a>
              </>
            )}
            
            {!isAuthenticated && (
              <div className="border-t pt-4 space-y-3">
                <button 
                  onClick={() => {
                    handleAuthClick('login');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-600 hover:text-gray-900 font-medium"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    handleAuthClick('register');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </header>
  );
}

// Main component that wraps the header with its own AuthProvider
export default function SafeHeader({ showSearch = true }: { showSearch?: boolean }) {
  return (
    <AuthProvider>
      <HeaderWithAuth showSearch={showSearch} />
    </AuthProvider>
  );
}