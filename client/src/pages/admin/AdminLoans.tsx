import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllLoans } from '@/hooks/useAdmin';
import type { LoanStatus } from '@/lib/types';

const ADMIN_NAV = [
  { to: '/admin/books', label: 'Libros' },
  { to: '/admin/authors', label: 'Autores' },
  { to: '/admin/loans', label: 'Préstamos' },
];

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  RETURNED: 'Devuelto',
  LATE: 'Tardío',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  RETURNED: 'secondary',
  LATE: 'destructive',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function AdminLoans() {
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useAllLoans(status, page);

  const handleStatus = (val: string) => { setStatus(val === 'TODOS' ? '' : val); setPage(1); };

  return (
    <div className="space-y-6">
      <nav className="flex gap-2 border-b pb-3">
        {ADMIN_NAV.map((n) => (
          <Link key={n.to} to={n.to}>
            <Button variant={n.to === '/admin/loans' ? 'default' : 'ghost'} size="sm">{n.label}</Button>
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Select onValueChange={handleStatus} defaultValue="TODOS">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="ACTIVE">Activos</SelectItem>
            <SelectItem value="RETURNED">Devueltos</SelectItem>
            <SelectItem value="LATE">Tardíos</SelectItem>
          </SelectContent>
        </Select>
        {data && (
          <span className="text-sm text-muted-foreground">{data.pageInfo.totalItems} préstamo{data.pageInfo.totalItems !== 1 ? 's' : ''}</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : isError ? (
        <div className="py-6 text-center space-y-1">
          <p className="text-destructive text-sm font-medium">Error al cargar los préstamos</p>
          <p className="text-muted-foreground text-xs font-mono">{(error as Error)?.message ?? 'Error desconocido'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Usuario</th>
                <th className="text-left px-3 py-2 font-medium">Libro</th>
                <th className="text-left px-3 py-2 font-medium">Préstamo</th>
                <th className="text-left px-3 py-2 font-medium">Vencimiento</th>
                <th className="text-left px-3 py-2 font-medium">Devolución</th>
                <th className="text-left px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((loan) => (
                <tr key={loan.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    <div className="font-medium">{loan.user?.name ?? <span className="italic text-muted-foreground">Usuario eliminado</span>}</div>
                    <div className="text-muted-foreground text-xs">{loan.user?.email ?? '—'}</div>
                  </td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{loan.book?.title ?? <span className="italic text-muted-foreground">Libro eliminado</span>}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDate(loan.loanDate)}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDate(loan.dueDate)}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {loan.returnDate ? formatDate(loan.returnDate) : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={STATUS_VARIANTS[loan.status as LoanStatus] ?? 'secondary'}>
                      {STATUS_LABELS[loan.status] ?? loan.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No hay préstamos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={!data.pageInfo.hasPreviousPage} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Página {data.pageInfo.page} de {data.pageInfo.totalPages}</span>
          <Button variant="outline" size="sm" disabled={!data.pageInfo.hasNextPage} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
        </div>
      )}
    </div>
  );
}
