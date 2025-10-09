import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import FoodDiary from './FoodDiary';

// Safe wrapper for FoodDiary with AuthProvider
const SafeFoodDiary: React.FC = () => {
  return (
    <AuthProvider>
      <FoodDiary />
    </AuthProvider>
  );
};

export default SafeFoodDiary;