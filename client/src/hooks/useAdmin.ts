import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql';
import type { Connection, Loan, Author } from '@/lib/types';

// ─── Queries ──────────────────────────────────────────────────────────────────

const ALL_LOANS_QUERY = `
  query AllLoans($status: LoanStatus, $page: Int, $limit: Int) {
    allLoans(status: $status, page: $page, limit: $limit) {
      items {
        id status loanDate dueDate returnDate
        user { id name email }
        book { id title }
      }
      pageInfo { page totalPages hasNextPage hasPreviousPage totalItems }
    }
  }
`;

const AUTHORS_QUERY = `
  query Authors($search: String, $page: Int, $limit: Int) {
    authors(search: $search, page: $page, limit: $limit) {
      items { id name bio nationality birthDate deathDate }
      pageInfo { page totalPages hasNextPage hasPreviousPage totalItems }
    }
  }
`;

// ─── Book mutations ───────────────────────────────────────────────────────────

const CREATE_BOOK = `
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) { id title }
  }
`;

const UPDATE_BOOK = `
  mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
    updateBook(id: $id, input: $input) { id title }
  }
`;

const DELETE_BOOK = `
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id)
  }
`;

// ─── Author mutations ─────────────────────────────────────────────────────────

const CREATE_AUTHOR = `
  mutation CreateAuthor($input: CreateAuthorInput!) {
    createAuthor(input: $input) { id name }
  }
`;

const UPDATE_AUTHOR = `
  mutation UpdateAuthor($id: ID!, $input: UpdateAuthorInput!) {
    updateAuthor(id: $id, input: $input) { id name }
  }
`;

const DELETE_AUTHOR = `
  mutation DeleteAuthor($id: ID!) {
    deleteAuthor(id: $id)
  }
`;

// ─── Hook exports ─────────────────────────────────────────────────────────────

export function useAllLoans(status?: string, page = 1) {
  return useQuery({
    queryKey: ['allLoans', status, page],
    queryFn: () =>
      gqlClient
        .request<{ allLoans: Connection<Loan> }>(ALL_LOANS_QUERY, {
          status: status || undefined,
          page,
          limit: 20,
        })
        .then((d) => d.allLoans),
  });
}

export function useAuthors(search = '', page = 1) {
  return useQuery({
    queryKey: ['authors', search, page],
    queryFn: () =>
      gqlClient
        .request<{ authors: Connection<Author> }>(AUTHORS_QUERY, {
          search: search || undefined,
          page,
          limit: 20,
        })
        .then((d) => d.authors),
  });
}

export function useAllAuthors() {
  return useQuery({
    queryKey: ['authors', 'all'],
    queryFn: () =>
      gqlClient
        .request<{ authors: Connection<Author> }>(AUTHORS_QUERY, { limit: 200, page: 1 })
        .then((d) => d.authors.items),
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      isbn?: string | null;
      description?: string | null;
      publishedYear?: number | null;
      genres: string[];
      authorIds: string[];
      totalCopies: number;
      availableCopies?: number | null;
    }) =>
      gqlClient
        .request<{ createBook: { id: string } }>(CREATE_BOOK, { input })
        .then((d) => d.createBook),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['genres'] });
    },
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: {
        title?: string;
        isbn?: string | null;
        description?: string | null;
        publishedYear?: number | null;
        genres?: string[];
        authorIds?: string[];
        totalCopies?: number;
        availableCopies?: number;
      };
    }) =>
      gqlClient
        .request<{ updateBook: { id: string } }>(UPDATE_BOOK, { id, input })
        .then((d) => d.updateBook),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['book', vars.id] });
      qc.invalidateQueries({ queryKey: ['genres'] });
    },
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      gqlClient
        .request<{ deleteBook: boolean }>(DELETE_BOOK, { id })
        .then((d) => d.deleteBook),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['genres'] });
    },
  });
}

export function useCreateAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      bio?: string;
      nationality?: string;
      birthDate?: string;
      deathDate?: string;
    }) =>
      gqlClient
        .request<{ createAuthor: { id: string } }>(CREATE_AUTHOR, { input })
        .then((d) => d.createAuthor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['authors'] });
    },
  });
}

export function useUpdateAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: {
        name?: string;
        bio?: string | null;
        nationality?: string | null;
        birthDate?: string | null;
        deathDate?: string | null;
      };
    }) =>
      gqlClient
        .request<{ updateAuthor: { id: string } }>(UPDATE_AUTHOR, { id, input })
        .then((d) => d.updateAuthor),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['authors'] });
      qc.invalidateQueries({ queryKey: ['author', vars.id] });
    },
  });
}

export function useDeleteAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      gqlClient
        .request<{ deleteAuthor: boolean }>(DELETE_AUTHOR, { id })
        .then((d) => d.deleteAuthor),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['authors'] });
      qc.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
