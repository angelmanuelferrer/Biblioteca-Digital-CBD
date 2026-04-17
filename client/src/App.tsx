import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Books } from '@/pages/Books';
import { BookDetail } from '@/pages/BookDetail';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { MyLoans } from '@/pages/MyLoans';
import { MyReviews } from '@/pages/MyReviews';

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
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
