import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { BookCard } from '@/components/BookCard';
import { useBooks, useGenres } from '@/hooks/useBooks';

export function Books() {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data: genreList = [] } = useGenres();

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(inputValue); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [inputValue]);

  const { data, isLoading } = useBooks({ search, genre, availableOnly, page });

  const handleGenreChange = (val: string) => {
    setGenre(val === 'Todos' ? '' : val);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar libros…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select onValueChange={handleGenreChange} defaultValue="Todos">
            <SelectTrigger>
              <SelectValue placeholder="Género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              {genreList.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="available" checked={availableOnly} onCheckedChange={(v) => { setAvailableOnly(v); setPage(1); }} />
          <Label htmlFor="available" className="cursor-pointer text-sm">Solo disponibles</Label>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No se encontraron libros</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.items.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      )}

      {/* Pagination */}
      {data && data.pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" disabled={!data.pageInfo.hasPreviousPage} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {data.pageInfo.page} de {data.pageInfo.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={!data.pageInfo.hasNextPage} onClick={() => setPage((p) => p + 1)}>
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
