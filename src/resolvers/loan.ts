import { GraphQLError } from 'graphql';
import { FilterQuery } from 'mongoose';
import { Context } from '../types/context';
import { requireAuth, requireAdmin } from '../utils/requireAuth';
import { paginate } from '../utils/pagination';
import { assertValidId } from '../utils/mongoHelpers';
import Loan, { ILoan, LoanStatus } from '../models/Loan';
import Book from '../models/Book';
import User from '../models/User';

// ─── helpers ────────────────────────────────────────────────────────────────

function notFound(id: string): never {
  throw new GraphQLError(`Loan ${id} not found`, {
    extensions: { code: 'NOT_FOUND' },
  });
}

function canModify(loan: ILoan, context: Context): void {
  const isOwner = loan.userId.toString() === context.userId;
  const isAdmin = context.userRole === 'ADMIN';
  if (!isOwner && !isAdmin) {
    throw new GraphQLError('Not authorized to modify this loan', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

// ─── Query ───────────────────────────────────────────────────────────────────

const Query = {
  myLoans: async (
    _parent: unknown,
    args: { status?: LoanStatus; page?: number; limit?: number },
    context: Context
  ) => {
    const { userId } = requireAuth(context);
    const filter: FilterQuery<ILoan> = { userId };
    if (args.status) filter.status = args.status;
    return paginate(Loan, filter, args.page ?? 1, args.limit ?? 10);
  },

  allLoans: async (
    _parent: unknown,
    args: { status?: LoanStatus; page?: number; limit?: number },
    context: Context
  ) => {
    requireAdmin(context);
    const filter: FilterQuery<ILoan> = {};
    if (args.status) filter.status = args.status;
    return paginate(Loan, filter, args.page ?? 1, args.limit ?? 10);
  },
};

// ─── Mutation ────────────────────────────────────────────────────────────────

const Mutation = {
  createLoan: async (
    _parent: unknown,
    args: { bookId: string; dueDate: string },
    context: Context
  ) => {
    const { userId } = requireAuth(context);

    assertValidId(args.bookId, 'bookId');

    const book = await Book.findById(args.bookId);
    if (!book) {
      throw new GraphQLError(`Book ${args.bookId} not found`, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (book.availableCopies === 0) {
      throw new GraphQLError('No hay copias disponibles', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const dueDate = new Date(args.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(dueDate.getTime()) || dueDate < today) {
      throw new GraphQLError('dueDate must be a valid future date', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const loan = await Loan.create({
      userId,
      bookId: args.bookId,
      loanDate: new Date(),
      dueDate,
      status: 'ACTIVE',
    });

    await Book.findByIdAndUpdate(args.bookId, { $inc: { availableCopies: -1 } });

    return loan;
  },

  returnLoan: async (
    _parent: unknown,
    args: { loanId: string },
    context: Context
  ) => {
    assertValidId(args.loanId, 'loanId');
    requireAuth(context);

    const loan = await Loan.findById(args.loanId);
    if (!loan) notFound(args.loanId);

    canModify(loan, context);

    if (loan.status === 'RETURNED') {
      throw new GraphQLError('Este préstamo ya fue devuelto', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const updated = await Loan.findByIdAndUpdate(
      args.loanId,
      { $set: { returnDate: new Date(), status: 'RETURNED' } },
      { new: true }
    );

    if (!updated) notFound(args.loanId);

    await Book.findByIdAndUpdate(loan.bookId, { $inc: { availableCopies: 1 } });

    return updated;
  },
};

// ─── Field resolvers ─────────────────────────────────────────────────────────

const Loan_ = {
  id:         (parent: ILoan) => parent._id.toString(),
  loanDate:   (parent: ILoan) => parent.loanDate.toISOString(),
  dueDate:    (parent: ILoan) => parent.dueDate.toISOString(),
  returnDate: (parent: ILoan) => parent.returnDate?.toISOString() ?? null,
  createdAt:  (parent: ILoan) => parent.createdAt.toISOString(),
  updatedAt:  (parent: ILoan) => parent.updatedAt.toISOString(),
  user:       (parent: ILoan) => User.findById(parent.userId).exec(),
  book:       (parent: ILoan) => Book.findById(parent.bookId).exec(),
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const loanResolvers = {
  Query,
  Mutation,
  Loan: Loan_,
};
