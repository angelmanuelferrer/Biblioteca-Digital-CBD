import { GraphQLError } from 'graphql';
import { FilterQuery } from 'mongoose';
import { Context } from '../types/context';
import { requireAdmin } from '../utils/requireAuth';
import { paginate } from '../utils/pagination';
import { assertValidId, handleMongooseError } from '../utils/mongoHelpers';
import Author, { IAuthor } from '../models/Author';
import Book from '../models/Book';

// ─── helpers ────────────────────────────────────────────────────────────────

function notFound(id: string): never {
  throw new GraphQLError(`Author ${id} not found`, {
    extensions: { code: 'NOT_FOUND' },
  });
}

// ─── Query ──────────────────────────────────────────────────────────────────

const Query = {
  authors: async (
    _parent: unknown,
    args: { search?: string; page?: number; limit?: number }
  ) => {
    const { search, page = 1, limit = 10 } = args;

    const filter: FilterQuery<IAuthor> = search
      ? {
          $or: [
            { name:        { $regex: search, $options: 'i' } },
            { nationality: { $regex: search, $options: 'i' } },
            { bio:         { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    return paginate(Author, filter, page, limit);
  },

  author: async (_parent: unknown, args: { id: string }) => {
    assertValidId(args.id);
    const found = await Author.findById(args.id);
    if (!found) notFound(args.id);
    return found;
  },
};

// ─── Mutation ────────────────────────────────────────────────────────────────

interface CreateAuthorInput {
  name: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
}

interface UpdateAuthorInput {
  name?: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
}

const Mutation = {
  createAuthor: async (
    _parent: unknown,
    args: { input: CreateAuthorInput },
    context: Context
  ) => {
    requireAdmin(context);
    return Author.create(args.input).catch(handleMongooseError);
  },

  updateAuthor: async (
    _parent: unknown,
    args: { id: string; input: UpdateAuthorInput },
    context: Context
  ) => {
    assertValidId(args.id);
    requireAdmin(context);

    const updated = await Author.findByIdAndUpdate(
      args.id,
      { $set: args.input },
      { new: true, runValidators: true }
    ).catch(handleMongooseError);

    if (!updated) notFound(args.id);
    return updated;
  },

  deleteAuthor: async (
    _parent: unknown,
    args: { id: string },
    context: Context
  ) => {
    assertValidId(args.id);
    requireAdmin(context);
    const result = await Author.findByIdAndDelete(args.id);
    return result !== null;
  },
};

// ─── Field resolvers ─────────────────────────────────────────────────────────

const Author_ = {
  id:        (parent: IAuthor) => parent._id.toString(),
  birthDate: (parent: IAuthor) => parent.birthDate?.toISOString() ?? null,
  deathDate: (parent: IAuthor) => parent.deathDate?.toISOString() ?? null,
  createdAt: (parent: IAuthor) => parent.createdAt.toISOString(),
  updatedAt: (parent: IAuthor) => parent.updatedAt.toISOString(),
  books:     (parent: IAuthor) => Book.find({ authorIds: parent._id }).exec(),
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const authorResolvers = {
  Query,
  Mutation,
  Author: Author_,
};
