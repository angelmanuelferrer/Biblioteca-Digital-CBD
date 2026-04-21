import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyLoans, useReturnLoan } from '@/hooks/useLoans';
import type { Loan, LoanStatus } from '@/lib/types';

const STATUS_LABEL: Record<LoanStatus, string> = {
  ACTIVE: 'Activo',
  RETURNED: 'Devuelto',
  LATE: 'Vencido',
};

const STATUS_VARIANT: Record<LoanStatus, 'info' | 'secondary' | 'destructive'> = {
  ACTIVE: 'info',
  RETURNED: 'secondary',
  LATE: 'destructive',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES');
}

export function MyLoans() {
  const { data, isLoading } = useMyLoans();
  const returnLoan = useReturnLoan();
  const [confirmLoan, setConfirmLoan] = useState<Loan | null>(null);

  const handleReturn = () => {
    if (!confirmLoan) return;
    returnLoan.mutate({ loanId: confirmLoan.id }, { onSuccess: () => setConfirmLoan(null) });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mis Préstamos</h1>

      {data?.items.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No tienes préstamos registrados.</p>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Libro</th>
                <th className="px-4 py-3 text-left font-medium">Prestado</th>
                <th className="px-4 py-3 text-left font-medium">Vence</th>
                <th className="px-4 py-3 text-left font-medium">Devuelto</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((loan) => (
                <tr key={loan.id} className="border-b last:border-0 hover:bg-muted/25">
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{loan.book.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(loan.loanDate)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(loan.dueDate)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{loan.returnDate ? fmt(loan.returnDate) : '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[loan.status]}>{STATUS_LABEL[loan.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {loan.status === 'ACTIVE' && (
                      <Button size="sm" variant="outline" onClick={() => setConfirmLoan(loan)}>
                        Devolver
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!confirmLoan} onOpenChange={(open) => !open && setConfirmLoan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Devolver libro?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Devolverás <strong>{confirmLoan?.book.title}</strong>. Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLoan(null)}>Cancelar</Button>
            <Button onClick={handleReturn} disabled={returnLoan.isPending}>
              {returnLoan.isPending ? 'Procesando…' : 'Confirmar devolución'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
