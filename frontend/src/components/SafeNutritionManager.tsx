import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import NutritionManager from './NutritionManager';

// Safe wrapper for NutritionManager with AuthProvider
const SafeNutritionManager: React.FC = () => {
  return (
    <AuthProvider>
      <NutritionManager />
    </AuthProvider>
  );
};

export default SafeNutritionManager;