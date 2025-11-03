
import { useAuthStore } from "../store/authStore";

export default function UserNameDisplay() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) return <div className="text-gray-400">...</div>;
  if (!isAuthenticated || !user) return <div className="text-red-500">Ingen bruker funnet</div>;

  return (
    <div className="text-right">
      <p className="text-sm text-gray-500">Welcome back,</p>
      <p className="text-lg font-semibold text-indigo-600">{user.name || user.email}</p>
    </div>
  );
}