import { Navigate, Outlet } from 'react-router-dom';
import { isAuthed } from '@/store/auth';

export function ProtectedRoute() {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return <Outlet />;
}
