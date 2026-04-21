import { Skeleton } from '@/components/ui/skeleton';
import { ReviewCard } from '@/components/ReviewCard';
import { useMyReviews } from '@/hooks/useReviews';

export function MyReviews() {
  const { data, isLoading } = useMyReviews();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mis Reseñas</h1>

      {data?.items.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          Aún no has escrito ninguna reseña.
        </p>
      ) : (
        <div className="space-y-3">
          {data?.items.map((review) => (
            <div key={review.id}>
              <p className="text-xs text-muted-foreground mb-1 font-medium">
                {review.book.title}
              </p>
              <ReviewCard review={review} isOwn />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
