import { GraphQLError } from 'graphql';
import { FilterQuery, Types } from 'mongoose';
import { Context } from '../types/context';
import { requireAdmin } from '../utils/requireAuth';
import { paginate } from '../utils/pagination';
import { assertValidId, handleMongooseError } from '../utils/mongoHelpers';
import Book, { IBook } from '../models/Book';
import Author from '../models/Author';
import Review, { IReview } from '../models/Review';

// ─── helpers ────────────────────────────────────────────────────────────────

function notFound(id: string): never {
  throw new GraphQLError(`Book ${id} not found`, {
    extensions: { code: 'NOT_FOUND' },
  });
}

// ─── Query ───────────────────────────────────────────────────────────────────

interface BooksArgs {
  search?: string;
  genre?: string;
  authorId?: string;
  minRating?: number;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}

const Query = {
  genres: async () => Book.distinct('genres'),

  books: async (_parent: unknown, args: BooksArgs) => {
    const { search, genre, authorId, minRating, availableOnly, page = 1, limit = 10 } = args;

    const filter: FilterQuery<IBook> = {};

    if (search)   Object.assign(filter, { $text: { $search: search } });
    if (genre)    filter.genres = genre;
    if (authorId) {
      assertValidId(authorId, 'authorId');
      filter.authorIds = new Types.ObjectId(authorId);
    }
    if (minRating != null) filter.averageRating = { $gte: minRating };
    if (availableOnly)     filter.availableCopies = { $gt: 0 };

    return paginate(Book, filter, page, limit);
  },

  book: async (_parent: unknown, args: { id: string }) => {
    assertValidId(args.id);
    const found = await Book.findById(args.id);
    if (!found) notFound(args.id);
    return found;
  },
};

// ─── Mutation ────────────────────────────────────────────────────────────────

interface CreateBookInput {
  title: string;
  isbn?: string;
  description?: string;
  publishedYear?: number;
  genres: string[];
  authorIds: string[];
  totalCopies: number;
  availableCopies?: number;
}

interface UpdateBookInput {
  title?: string;
  isbn?: string;
  description?: string;
  publishedYear?: number;
  genres?: string[];
  authorIds?: string[];
  totalCopies?: number;
  availableCopies?: number;
}

const Mutation = {
  createBook: async (
    _parent: unknown,
    args: { input: CreateBookInput },
    context: Context
  ) => {
    requireAdmin(context);

    const { authorIds, availableCopies, totalCopies, ...rest } = args.input;

    const found = await Author.countDocuments({ _id: { $in: authorIds } });
    if (found !== authorIds.length) {
      throw new GraphQLError('One or more authorIds do not exist', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    return Book.create({
      ...rest,
      authorIds,
      totalCopies,
      availableCopies: availableCopies ?? totalCopies,
    }).catch(handleMongooseError);
  },

  updateBook: async (
    _parent: unknown,
    args: { id: string; input: UpdateBookInput },
    context: Context
  ) => {
    assertValidId(args.id);
    requireAdmin(context);

    const updated = await Book.findByIdAndUpdate(
      args.id,
      { $set: args.input },
      { new: true, runValidators: true }
    ).catch(handleMongooseError);

    if (!updated) notFound(args.id);
    return updated;
  },

  deleteBook: async (
    _parent: unknown,
    args: { id: string },
    context: Context
  ) => {
    assertValidId(args.id);
    requireAdmin(context);
    const result = await Book.findByIdAndDelete(args.id);
    return result !== null;
  },
};

// ─── Field resolvers ─────────────────────────────────────────────────────────

const Book_ = {
  id:        (parent: IBook) => parent._id.toString(),
  createdAt: (parent: IBook) => parent.createdAt.toISOString(),
  updatedAt: (parent: IBook) => parent.updatedAt.toISOString(),
  authors:   (parent: IBook) => Author.find({ _id: { $in: parent.authorIds } }).exec(),
  reviews:   (parent: IBook, args: { page?: number; limit?: number }) => {
    const filter: FilterQuery<IReview> = { bookId: parent._id };
    return paginate(Review, filter, args.page ?? 1, args.limit ?? 10);
  },
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const bookResolvers = {
  Query,
  Mutation,
  Book: Book_,
};

// TODO: handle empty search result edge case in books query
