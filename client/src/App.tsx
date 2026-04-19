import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';
import { Books } from '@/pages/Books';
import { BookDetail } from '@/pages/BookDetail';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { MyLoans } from '@/pages/MyLoans';
import { MyReviews } from '@/pages/MyReviews';
import { AdminBooks } from '@/pages/admin/AdminBooks';
import { AdminAuthors } from '@/pages/admin/AdminAuthors';
import { AdminLoans } from '@/pages/admin/AdminLoans';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Books />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/my-loans" element={<MyLoans />} />
              <Route path="/my-reviews" element={<MyReviews />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Navigate to="/admin/books" replace />} />
              <Route path="/admin/books" element={<AdminBooks />} />
              <Route path="/admin/authors" element={<AdminAuthors />} />
              <Route path="/admin/loans" element={<AdminLoans />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
