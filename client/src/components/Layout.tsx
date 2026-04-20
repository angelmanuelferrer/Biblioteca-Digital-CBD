import { Link, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { clearAuth, getUser, isAuthed } from '@/store/auth';

export function Layout() {
  const navigate = useNavigate();
  const user = getUser();
  const authed = isAuthed();

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <BookOpen className="h-5 w-5" />
            Biblioteca
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <nav className="flex items-center gap-4 flex-1">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Libros
            </Link>
            {authed && (
              <>
                <Link to="/my-loans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mis Préstamos
                </Link>
                <Link to="/my-reviews" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mis Reseñas
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin/books" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Admin
                  </Link>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-2">
            {authed ? (
              <>
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesión">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Registrarse</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
