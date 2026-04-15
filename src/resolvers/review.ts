import { GraphQLError } from 'graphql';
import { Context } from '../types/context';
import { requireAuth } from '../utils/requireAuth';
import { paginate } from '../utils/pagination';
import { recalculateBookRating } from '../utils/recalculateRating';
import { assertValidId, handleMongooseError } from '../utils/mongoHelpers';
import Review, { IReview } from '../models/Review';
import Book from '../models/Book';
import User from '../models/User';

// ─── helpers ────────────────────────────────────────────────────────────────

function notFound(id: string): never {
  throw new GraphQLError(`Review ${id} not found`, {
    extensions: { code: 'NOT_FOUND' },
  });
}

function canModify(review: IReview, context: Context): void {
  const isOwner = review.userId.toString() === context.userId;
  const isAdmin = context.userRole === 'ADMIN';
  if (!isOwner && !isAdmin) {
    throw new GraphQLError('Not authorized to modify this review', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

// ─── Query ───────────────────────────────────────────────────────────────────

const Query = {
  myReviews: async (
    _parent: unknown,
    args: { page?: number; limit?: number },
    context: Context
  ) => {
    const { userId } = requireAuth(context);
    return paginate(Review, { userId }, args.page ?? 1, args.limit ?? 10);
  },
};

// ─── Mutation ────────────────────────────────────────────────────────────────

interface CreateReviewInput {
  bookId: string;
  rating: number;
  comment?: string;
}

interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

const Mutation = {
  createReview: async (
    _parent: unknown,
    args: { input: CreateReviewInput },
    context: Context
  ) => {
    const { userId } = requireAuth(context);
    const { bookId, rating, comment } = args.input;

    assertValidId(bookId, 'bookId');

    const book = await Book.findById(bookId);
    if (!book) {
      throw new GraphQLError(`Book ${bookId} not found`, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const existing = await Review.findOne({ userId, bookId });
    if (existing) {
      throw new GraphQLError('You have already reviewed this book', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const review = await Review.create({ userId, bookId, rating, comment })
      .catch(handleMongooseError);

    await recalculateBookRating(bookId);
    return review;
  },

  updateReview: async (
    _parent: unknown,
    args: { id: string; input: UpdateReviewInput },
    context: Context
  ) => {
    assertValidId(args.id);
    requireAuth(context);

    const review = await Review.findById(args.id);
    if (!review) notFound(args.id);

    canModify(review, context);

    const updated = await Review.findByIdAndUpdate(
      args.id,
      { $set: args.input },
      { new: true, runValidators: true }
    ).catch(handleMongooseError);

    if (!updated) notFound(args.id);

    await recalculateBookRating(review.bookId.toString());
    return updated;
  },

  deleteReview: async (
    _parent: unknown,
    args: { id: string },
    context: Context
  ) => {
    assertValidId(args.id);
    requireAuth(context);

    const review = await Review.findById(args.id);
    if (!review) notFound(args.id);

    canModify(review, context);

    await Review.findByIdAndDelete(args.id);
    await recalculateBookRating(review.bookId.toString());
    return true;
  },
};

// ─── Field resolvers ─────────────────────────────────────────────────────────

const Review_ = {
  id:        (parent: IReview) => parent._id.toString(),
  createdAt: (parent: IReview) => parent.createdAt.toISOString(),
  updatedAt: (parent: IReview) => parent.updatedAt.toISOString(),
  user:      (parent: IReview) => User.findById(parent.userId).exec(),
  book:      (parent: IReview) => Book.findById(parent.bookId).exec(),
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const reviewResolvers = {
  Query,
  Mutation,
  Review: Review_,
};
