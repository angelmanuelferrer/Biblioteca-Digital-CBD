import { Navigate, Outlet } from 'react-router-dom';
import { isAuthed, getUser } from '@/store/auth';

export function AdminRoute() {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  if (getUser()?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}
