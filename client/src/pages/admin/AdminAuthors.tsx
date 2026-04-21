import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useAuthors,
  useCreateAuthor,
  useUpdateAuthor,
  useDeleteAuthor,
} from '@/hooks/useAdmin';
import type { Author } from '@/lib/types';

const ADMIN_NAV = [
  { to: '/admin/books', label: 'Libros' },
  { to: '/admin/authors', label: 'Autores' },
  { to: '/admin/loans', label: 'Préstamos' },
];

interface AuthorForm {
  name: string;
  bio: string;
  nationality: string;
  birthDate: string;
  deathDate: string;
}

const emptyForm = (): AuthorForm => ({ name: '', bio: '', nationality: '', birthDate: '', deathDate: '' });

function isoToDate(iso: string | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

function authorToForm(a: Author): AuthorForm {
  return {
    name: a.name,
    bio: a.bio ?? '',
    nationality: a.nationality ?? '',
    birthDate: isoToDate(a.birthDate),
    deathDate: isoToDate(a.deathDate),
  };
}

export function AdminAuthors() {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);
  const [form, setForm] = useState<AuthorForm>(emptyForm());
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setSearch(inputValue); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [inputValue]);

  const { data, isLoading } = useAuthors(search, page);
  const createAuthor = useCreateAuthor();
  const updateAuthor = useUpdateAuthor();
  const deleteAuthor = useDeleteAuthor();

  const openCreate = () => { setEditingAuthor(null); setForm(emptyForm()); setFormError(''); setDialogOpen(true); };
  const openEdit = (a: Author) => { setEditingAuthor(a); setForm(authorToForm(a)); setFormError(''); setDialogOpen(true); };

  const f = (field: keyof AuthorForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setFormError('El nombre es obligatorio'); return; }
    const strOrNull = (v: string) => v.trim() || null;
    const input = {
      name: form.name.trim(),
      bio: strOrNull(form.bio),
      nationality: strOrNull(form.nationality),
      birthDate: strOrNull(form.birthDate),
      deathDate: strOrNull(form.deathDate),
    };
    try {
      if (editingAuthor) {
        await updateAuthor.mutateAsync({ id: editingAuthor.id, input });
      } else {
        await createAuthor.mutateAsync({ ...input, bio: input.bio ?? undefined, nationality: input.nationality ?? undefined, birthDate: input.birthDate ?? undefined, deathDate: input.deathDate ?? undefined });
      }
      setDialogOpen(false);
    } catch {
      setFormError('Error al guardar. Comprueba los datos.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteAuthor.mutateAsync(deleteTarget.id); } finally { setDeleteTarget(null); }
  };

  const isPending = createAuthor.isPending || updateAuthor.isPending;

  return (
    <div className="space-y-6">
      <nav className="flex gap-2 border-b pb-3">
        {ADMIN_NAV.map((n) => (
          <Link key={n.to} to={n.to}>
            <Button variant={n.to === '/admin/authors' ? 'default' : 'ghost'} size="sm">{n.label}</Button>
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Buscar autores…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo autor
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Nombre</th>
                <th className="text-left px-3 py-2 font-medium">Nacionalidad</th>
                <th className="text-left px-3 py-2 font-medium">Bio</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {data?.items.map((author) => (
                <tr key={author.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 font-medium">{author.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{author.nationality ?? '—'}</td>
                  <td className="px-3 py-2 text-muted-foreground max-w-xs truncate">{author.bio ?? '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(author)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(author)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">No se encontraron autores</td></tr>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAuthor ? 'Editar autor' : 'Nuevo autor'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={f('name')} />
            </div>
            <div className="space-y-1">
              <Label>Nacionalidad</Label>
              <Input value={form.nationality} onChange={f('nationality')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fecha de nacimiento</Label>
                <Input placeholder="YYYY-MM-DD" value={form.birthDate} onChange={f('birthDate')} />
              </div>
              <div className="space-y-1">
                <Label>Fecha de fallecimiento</Label>
                <Input placeholder="YYYY-MM-DD" value={form.deathDate} onChange={f('deathDate')} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Biografía</Label>
              <Textarea rows={4} value={form.bio} onChange={f('bio')} />
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
            <DialogTitle>Eliminar autor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Seguro que quieres eliminar a <span className="font-medium text-foreground">"{deleteTarget?.name}"</span>? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteAuthor.isPending}>
              {deleteAuthor.isPending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
