import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function ZustandUserNameDisplay() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) return <span>Loading...</span>;
  if (!isAuthenticated || !user) return <span>Not logged in</span>;

  return (
    <span className="font-semibold text-blue-700">
      {user.name || user.username || user.email}
    </span>
  );
}
