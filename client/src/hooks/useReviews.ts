import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql';
import type { Connection, Review } from '@/lib/types';

const MY_REVIEWS_QUERY = `
  query MyReviews($page: Int) {
    myReviews(page: $page, limit: 20) {
      items {
        id rating comment createdAt updatedAt
        book { id title authors { name } }
        user { id name }
      }
      pageInfo { totalItems totalPages page }
    }
  }
`;

const CREATE_REVIEW = `
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id rating comment book { id averageRating ratingsCount }
    }
  }
`;

const UPDATE_REVIEW = `
  mutation UpdateReview($id: ID!, $input: UpdateReviewInput!) {
    updateReview(id: $id, input: $input) {
      id rating comment book { id averageRating ratingsCount }
    }
  }
`;

const DELETE_REVIEW = `
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

export function useMyReviews(page = 1) {
  return useQuery({
    queryKey: ['myReviews', page],
    queryFn: () =>
      gqlClient
        .request<{ myReviews: Connection<Review> }>(MY_REVIEWS_QUERY, { page })
        .then((d) => d.myReviews),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { bookId: string; rating: number; comment?: string }) =>
      gqlClient
        .request<{ createReview: Review }>(CREATE_REVIEW, { input })
        .then((d) => d.createReview),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['book', data.book.id] });
      void qc.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: { rating?: number; comment?: string | null } }) =>
      gqlClient
        .request<{ updateReview: Review }>(UPDATE_REVIEW, vars)
        .then((d) => d.updateReview),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['book', data.book.id] });
      void qc.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; bookId: string }) =>
      gqlClient.request<{ deleteReview: boolean }>(DELETE_REVIEW, { id: vars.id }).then((d) => d.deleteReview),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['book', vars.bookId] });
      void qc.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });
}
