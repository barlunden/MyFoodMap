import type { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';

interface RootProviderProps {
  children: ReactNode;
}

export default function RootProvider({ children }: RootProviderProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}