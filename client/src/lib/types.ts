export interface PageInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Connection<T> {
  items: T[];
  pageInfo: PageInfo;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  nationality?: string;
  birthDate?: string;
  deathDate?: string;
}

export interface Book {
  id: string;
  title: string;
  isbn?: string;
  description?: string;
  publishedYear?: number;
  genres: string[];
  authors: Author[];
  averageRating: number;
  ratingsCount: number;
  availableCopies: number;
  totalCopies: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Review {
  id: string;
  user: User;
  book: Book;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'LATE';

export interface Loan {
  id: string;
  user: User;
  book: Book;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
}

export interface AuthPayload {
  token: string;
  user: User;
}
