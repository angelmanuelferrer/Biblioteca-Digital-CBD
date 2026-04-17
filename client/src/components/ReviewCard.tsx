import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUpdateReview, useDeleteReview } from '@/hooks/useReviews';
import type { Review } from '@/lib/types';

interface ReviewCardProps {
  review: Review;
  isOwn?: boolean;
}

export function ReviewCard({ review, isOwn = false }: ReviewCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editRating, setEditRating] = useState(review.rating.toString());
  const [editComment, setEditComment] = useState(review.comment ?? '');

  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const handleUpdate = () => {
    updateReview.mutate(
      { id: review.id, input: { rating: parseInt(editRating), comment: editComment || null } },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  const handleDelete = () => {
    deleteReview.mutate(
      { id: review.id, bookId: review.book.id },
      { onSuccess: () => setDeleteOpen(false) }
    );
  };

  return (
    <>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{review.user.name}</span>
                <Badge variant="outline" className="text-xs">
                  {new Date(review.createdAt).toLocaleDateString('es-ES')}
                </Badge>
              </div>
              <StarRating rating={review.rating} size="sm" />
              {review.comment && <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>}
            </div>
            {isOwn && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
                  Borrar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar reseña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Puntuación</Label>
              <Select value={editRating} onValueChange={setEditRating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={n.toString()}>{'⭐'.repeat(n)} {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Comentario</Label>
              <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={updateReview.isPending}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar reseña?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteReview.isPending}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
