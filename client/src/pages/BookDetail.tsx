import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/StarRating';
import { ReviewCard } from '@/components/ReviewCard';
import { useBook } from '@/hooks/useBooks';
import { useCreateLoan } from '@/hooks/useLoans';
import { useCreateReview, useMyReviews } from '@/hooks/useReviews';
import { isAuthed, getUser } from '@/store/auth';

export function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authed = isAuthed();
  const currentUser = getUser();

  const { data: book, isLoading } = useBook(id ?? '');
  const { data: myReviews } = useMyReviews();
  const createLoan = useCreateLoan();
  const createReview = useCreateReview();

  const [loanOpen, setLoanOpen] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');

  const alreadyReviewed = myReviews?.items.some((r) => r.book.id === id);

  const handleLoan = () => {
    if (!id || !dueDate) return;
    createLoan.mutate(
      { bookId: id, dueDate: new Date(dueDate).toISOString() },
      { onSuccess: () => { setLoanOpen(false); setDueDate(''); } }
    );
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    createReview.mutate(
      { bookId: id, rating: parseInt(reviewRating), comment: reviewComment || undefined },
      { onSuccess: () => { setReviewComment(''); setReviewRating('5'); } }
    );
  };

  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!book) return <div className="text-center py-16 text-muted-foreground">Libro no encontrado</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Badge variant={book.availableCopies > 0 ? 'success' : 'destructive'} className="w-full justify-center py-1.5">
              {book.availableCopies > 0 ? `${book.availableCopies} copias disponibles` : 'Sin copias disponibles'}
            </Badge>
            {authed && book.availableCopies > 0 && (
              <Button className="w-full" onClick={() => setLoanOpen(true)}>
                Pedir prestado
              </Button>
            )}
            {!authed && (
              <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                Inicia sesión para pedir
              </Button>
            )}
          </div>
        </div>

        {/* Main info */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{book.title}</h1>
            <p className="text-muted-foreground">{book.authors.map((a) => a.name).join(', ')}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <StarRating rating={book.averageRating} />
            <span className="text-sm text-muted-foreground">({book.ratingsCount} reseñas)</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {book.genres.map((g) => <Badge key={g} variant="outline">{g}</Badge>)}
            {book.publishedYear && <Badge variant="secondary">{book.publishedYear}</Badge>}
          </div>
          {book.description && <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>}
          {book.isbn && <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>}
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Reseñas ({book.reviews?.pageInfo.totalItems ?? 0})</h2>

        {/* Add review form */}
        {authed && !alreadyReviewed && (
          <Card>
            <CardHeader><CardTitle className="text-base">Añadir reseña</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleReview} className="space-y-3">
                <div className="flex gap-3">
                  <div className="space-y-1.5">
                    <Label>Puntuación</Label>
                    <Select value={reviewRating} onValueChange={setReviewRating}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={n.toString()}>{'⭐'.repeat(n)} {n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Comentario (opcional)</Label>
                  <Textarea
                    placeholder="¿Qué te ha parecido?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button type="submit" size="sm" disabled={createReview.isPending}>
                  {createReview.isPending ? 'Enviando…' : 'Publicar reseña'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {book.reviews?.items.length === 0 && (
          <p className="text-sm text-muted-foreground">Aún no hay reseñas. ¡Sé el primero!</p>
        )}

        <div className="space-y-3">
          {book.reviews?.items.map((review) => (
            <ReviewCard
              key={review.id}
              review={{ ...review, book }}
              isOwn={review.user.id === currentUser?.id}
            />
          ))}
        </div>
      </div>

      {/* Loan dialog */}
      <Dialog open={loanOpen} onOpenChange={setLoanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pedir prestado: {book.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Fecha de devolución</Label>
            <Input
              id="dueDate"
              type="date"
              min={today}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          {createLoan.error && (
            <p className="text-sm text-destructive">{(createLoan.error as Error).message}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanOpen(false)}>Cancelar</Button>
            <Button onClick={handleLoan} disabled={!dueDate || createLoan.isPending}>
              {createLoan.isPending ? 'Procesando…' : 'Confirmar préstamo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
