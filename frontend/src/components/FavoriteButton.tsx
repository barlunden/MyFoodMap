import React, { useState } from 'react';

interface FavoriteButtonProps {
  recipeId: string;
  isFavorited?: boolean;
  onToggleFavorite?: (recipeId: string, isFavorited: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  disabled?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  recipeId,
  isFavorited = false,
  onToggleFavorite,
  size = 'md',
  showLabel = false,
  disabled = false
}) => {
  const [isLocalFavorited, setIsLocalFavorited] = useState(isFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    const newFavoriteState = !isLocalFavorited;
    
    // Optimistic update
    setIsLocalFavorited(newFavoriteState);
    
    try {
      // Call the parent handler if provided
      if (onToggleFavorite) {
        await onToggleFavorite(recipeId, newFavoriteState);
      }
      
      // In a real app, this would make an API call:
      // await fetch(`/api/recipes/${recipeId}/favorite`, {
      //   method: newFavoriteState ? 'POST' : 'DELETE',
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
    } catch (error) {
      // Revert on error
      setIsLocalFavorited(!newFavoriteState);
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isLoading}
      className={`
        ${buttonSizeClasses[size]}
        flex items-center space-x-2 rounded-lg transition-all duration-200
        ${isLocalFavorited 
          ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isLoading ? 'opacity-75' : ''}
      `}
      title={isLocalFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <div className={`${sizeClasses[size]} animate-spin`}>
          <svg fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        <svg
          className={`${sizeClasses[size]} transition-transform duration-200 ${
            isLocalFavorited ? 'scale-110' : 'scale-100'
          }`}
          fill={isLocalFavorited ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isLocalFavorited ? 0 : 2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      
      {showLabel && (
        <span className="text-sm font-medium">
          {isLocalFavorited ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;