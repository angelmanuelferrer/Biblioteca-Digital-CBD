import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql';
import type { Connection, Loan, LoanStatus } from '@/lib/types';

const MY_LOANS_QUERY = `
  query MyLoans($status: LoanStatus, $page: Int) {
    myLoans(status: $status, page: $page, limit: 20) {
      items {
        id status loanDate dueDate returnDate
        book { id title authors { name } }
      }
      pageInfo { totalItems totalPages page }
    }
  }
`;

const CREATE_LOAN = `
  mutation CreateLoan($bookId: ID!, $dueDate: String!) {
    createLoan(bookId: $bookId, dueDate: $dueDate) {
      id status loanDate dueDate book { id title availableCopies }
    }
  }
`;

const RETURN_LOAN = `
  mutation ReturnLoan($loanId: ID!) {
    returnLoan(loanId: $loanId) {
      id status returnDate book { id title availableCopies }
    }
  }
`;

export function useMyLoans(status?: LoanStatus, page = 1) {
  return useQuery({
    queryKey: ['myLoans', status, page],
    queryFn: () =>
      gqlClient
        .request<{ myLoans: Connection<Loan> }>(MY_LOANS_QUERY, { status, page })
        .then((d) => d.myLoans),
  });
}

export function useCreateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { bookId: string; dueDate: string }) =>
      gqlClient.request<{ createLoan: Loan }>(CREATE_LOAN, vars).then((d) => d.createLoan),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['myLoans'] });
      void qc.invalidateQueries({ queryKey: ['book', data.book.id] });
    },
  });
}

export function useReturnLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { loanId: string }) =>
      gqlClient.request<{ returnLoan: Loan }>(RETURN_LOAN, vars).then((d) => d.returnLoan),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['myLoans'] });
      void qc.invalidateQueries({ queryKey: ['book', data.book.id] });
    },
  });
}
