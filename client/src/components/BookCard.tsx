import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import type { Book } from '@/lib/types';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();
  const available = book.availableCopies > 0;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full"
      onClick={() => navigate(`/books/${book.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight line-clamp-2">{book.title}</CardTitle>
          <Badge variant={available ? 'success' : 'destructive'} className="shrink-0 text-xs">
            {available ? `${book.availableCopies} disp.` : 'Agotado'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {book.authors.map((a) => a.name).join(', ')}
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {book.genres.slice(0, 3).map((g) => (
            <Badge key={g} variant="outline" className="text-xs">
              {g}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <StarRating rating={book.averageRating} size="sm" />
          <span className="text-xs text-muted-foreground">{book.ratingsCount} reseñas</span>
        </div>
      </CardContent>
    </Card>
  );
}
