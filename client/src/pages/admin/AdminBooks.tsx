import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useBooks } from '@/hooks/useBooks';
import { useAuthors, useCreateBook, useUpdateBook, useDeleteBook } from '@/hooks/useAdmin';
import type { Book } from '@/lib/types';

const ADMIN_NAV = [
  { to: '/admin/books', label: 'Libros' },
  { to: '/admin/authors', label: 'Autores' },
  { to: '/admin/loans', label: 'Préstamos' },
];

interface BookForm {
  title: string;
  isbn: string;
  description: string;
  publishedYear: string;
  genresRaw: string;
  authorIds: string[];
  totalCopies: string;
  availableCopies: string;
}

const emptyForm = (): BookForm => ({
  title: '',
  isbn: '',
  description: '',
  publishedYear: '',
  genresRaw: '',
  authorIds: [],
  totalCopies: '1',
  availableCopies: '1',
});

function bookToForm(b: Book): BookForm {
  return {
    title: b.title,
    isbn: b.isbn ?? '',
    description: b.description ?? '',
    publishedYear: b.publishedYear?.toString() ?? '',
    genresRaw: b.genres.join(', '),
    authorIds: b.authors.map((a) => a.id),
    totalCopies: b.totalCopies.toString(),
    availableCopies: b.availableCopies.toString(),
  };
}

export function AdminBooks() {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [form, setForm] = useState<BookForm>(emptyForm());
  const [formError, setFormError] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [authorSearchInput, setAuthorSearchInput] = useState('');
  const [preloadedAuthors, setPreloadedAuthors] = useState<import('@/lib/types').Author[]>([]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(inputValue); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [inputValue]);

  useEffect(() => {
    const t = setTimeout(() => setAuthorSearch(authorSearchInput), 300);
    return () => clearTimeout(t);
  }, [authorSearchInput]);

  const { data, isLoading } = useBooks({ search, page, limit: 20 });
  const { data: authorsData } = useAuthors(authorSearch, 1);
  const allAuthors = useMemo(() => {
    const results = authorsData?.items ?? [];
    const resultIds = new Set(results.map((a) => a.id));
    const missing = preloadedAuthors.filter((a) => !resultIds.has(a.id));
    return [...missing, ...results];
  }, [authorsData, preloadedAuthors]);
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const openCreate = () => { setEditingBook(null); setForm(emptyForm()); setFormError(''); setAuthorSearchInput(''); setPreloadedAuthors([]); setDialogOpen(true); };
  const openEdit = (b: Book) => { setEditingBook(b); setForm(bookToForm(b)); setFormError(''); setAuthorSearchInput(''); setPreloadedAuthors(b.authors); setDialogOpen(true); };

  const toggleAuthor = (id: string) => {
    setForm((f) => ({
      ...f,
      authorIds: f.authorIds.includes(id)
        ? f.authorIds.filter((a) => a !== id)
        : [...f.authorIds, id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setFormError('El título es obligatorio'); return; }
    if (!form.totalCopies || Number(form.totalCopies) < 1) { setFormError('Las copias totales deben ser ≥ 1'); return; }
    if (form.availableCopies !== '' && Number(form.availableCopies) > Number(form.totalCopies)) { setFormError('Las copias disponibles no pueden superar las totales'); return; }

    const genres = form.genresRaw.split(',').map((g) => g.trim()).filter(Boolean);
    const strOrNull = (v: string) => v.trim() || null;
    const input = {
      title: form.title.trim(),
      isbn: strOrNull(form.isbn),
      description: strOrNull(form.description),
      publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      genres,
      authorIds: form.authorIds,
      totalCopies: Number(form.totalCopies),
      availableCopies: form.availableCopies ? Number(form.availableCopies) : undefined,
    };

    try {
      if (editingBook) {
        await updateBook.mutateAsync({ id: editingBook.id, input });
      } else {
        await createBook.mutateAsync(input);
      }
      setDialogOpen(false);
    } catch {
      setFormError('Error al guardar. Comprueba los datos.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBook.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    }
  };

  const isPending = createBook.isPending || updateBook.isPending;

  return (
    <div className="space-y-6">
      {/* Admin sub-nav */}
      <nav className="flex gap-2 border-b pb-3">
        {ADMIN_NAV.map((n) => (
          <Link key={n.to} to={n.to}>
            <Button variant={n.to === '/admin/books' ? 'default' : 'ghost'} size="sm">{n.label}</Button>
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Buscar libros…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo libro
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Título</th>
                <th className="text-left px-3 py-2 font-medium">Autores</th>
                <th className="text-left px-3 py-2 font-medium">Géneros</th>
                <th className="text-left px-3 py-2 font-medium">Copias</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {data?.items.map((book) => (
                <tr key={book.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 font-medium max-w-[220px] truncate">{book.title}</td>
                  <td className="px-3 py-2 text-muted-foreground">{book.authors.map((a) => a.name).join(', ') || '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {book.genres.slice(0, 2).map((g) => <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>)}
                      {book.genres.length > 2 && <Badge variant="outline" className="text-xs">+{book.genres.length - 2}</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{book.availableCopies}/{book.totalCopies}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(book)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(book)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No se encontraron libros</td></tr>
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

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBook ? 'Editar libro' : 'Nuevo libro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>ISBN</Label>
                <Input value={form.isbn} onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Año de publicación</Label>
                <Input type="number" value={form.publishedYear} onChange={(e) => setForm((f) => ({ ...f, publishedYear: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Géneros (separados por coma)</Label>
              <Input placeholder="Ej: Ficción, Thriller" value={form.genresRaw} onChange={(e) => setForm((f) => ({ ...f, genresRaw: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Copias totales *</Label>
                <Input type="number" min="1" value={form.totalCopies} onChange={(e) => setForm((f) => ({ ...f, totalCopies: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Copias disponibles</Label>
                <Input type="number" min="0" value={form.availableCopies} onChange={(e) => setForm((f) => ({ ...f, availableCopies: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Autores</Label>
              <Input
                placeholder="Buscar autor…"
                value={authorSearchInput}
                onChange={(e) => setAuthorSearchInput(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                {allAuthors.map((author) => (
                  <label key={author.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={form.authorIds.includes(author.id)}
                      onChange={() => toggleAuthor(author.id)}
                      className="accent-primary"
                    />
                    {author.name}
                  </label>
                ))}
                {allAuthors.length === 0 && <p className="text-muted-foreground text-xs p-1">No hay autores disponibles</p>}
              </div>
            </div>
            {formError && <p className="text-destructive text-sm">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar libro</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Seguro que quieres eliminar <span className="font-medium text-foreground">"{deleteTarget?.title}"</span>? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteBook.isPending}>
              {deleteBook.isPending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
