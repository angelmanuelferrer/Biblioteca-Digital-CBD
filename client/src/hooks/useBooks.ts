import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql';
import type { Connection, Book } from '@/lib/types';

const BOOKS_QUERY = `
  query Books($search: String, $genre: String, $availableOnly: Boolean, $page: Int, $limit: Int) {
    books(search: $search, genre: $genre, availableOnly: $availableOnly, page: $page, limit: $limit) {
      items {
        id title isbn description publishedYear genres availableCopies totalCopies averageRating ratingsCount
        authors { id name }
      }
      pageInfo { page totalPages hasNextPage hasPreviousPage totalItems }
    }
  }
`;

const BOOK_QUERY = `
  query Book($id: ID!) {
    book(id: $id) {
      id title isbn description publishedYear genres availableCopies totalCopies averageRating ratingsCount
      authors { id name bio nationality }
      reviews(page: 1, limit: 20) {
        items { id rating comment createdAt user { id name } }
        pageInfo { totalItems }
      }
    }
  }
`;

export interface BooksFilter {
  search?: string;
  genre?: string;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}

export function useBooks(filter: BooksFilter = {}) {
  const { search, genre, availableOnly, page = 1, limit = 9 } = filter;
  return useQuery({
    queryKey: ['books', filter],
    queryFn: () =>
      gqlClient
        .request<{ books: Connection<Book> }>(BOOKS_QUERY, {
          search: search || undefined,
          genre: genre || undefined,
          availableOnly: availableOnly || undefined,
          page,
          limit,
        })
        .then((d) => d.books),
  });
}

const GENRES_QUERY = `query { genres }`;

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () =>
      gqlClient.request<{ genres: string[] }>(GENRES_QUERY).then((d) => d.genres),
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () =>
      gqlClient.request<{ book: Book | null }>(BOOK_QUERY, { id }).then((d) => d.book),
    enabled: !!id,
  });
}
