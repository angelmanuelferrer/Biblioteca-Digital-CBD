import { GraphQLError } from 'graphql';
import bcrypt from 'bcryptjs';
import { Context } from '../../types/context';
import { generateToken } from '../../utils/auth';
import { registerSchema, loginSchema } from '../../utils/validators';
import { requireAuth } from '../../utils/requireAuth';
import { handleMongooseError } from '../../utils/mongoHelpers';
import User from '../../models/User';

export const resolvers = {
  Query: {
    health: (_parent: unknown, _args: unknown, _context: Context): string => {
      return 'OK';
    },

    me: async (_parent: unknown, _args: unknown, context: Context) => {
      const { userId } = requireAuth(context);
      return User.findById(userId);
    },
  },

  Mutation: {
    register: async (
      _parent: unknown,
      args: { name: string; email: string; password: string }
    ) => {
      const parsed = registerSchema.safeParse(args);
      if (!parsed.success) {
        throw new GraphQLError(parsed.error.errors[0].message, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const { name, email, password } = parsed.data;

      const existing = await User.findOne({ email });
      if (existing) {
        throw new GraphQLError('Email already registered', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({ name, email, passwordHash })
        .catch(handleMongooseError);

      const token = generateToken(user._id.toString(), user.role);
      return { token, user };
    },

    login: async (
      _parent: unknown,
      args: { email: string; password: string }
    ) => {
      const parsed = loginSchema.safeParse(args);
      if (!parsed.success) {
        throw new GraphQLError(parsed.error.errors[0].message, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const { email, password } = parsed.data;

      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const token = generateToken(user._id.toString(), user.role);
      return { token, user };
    },
  },

  User: {
    id:        (parent: { _id: unknown }) => parent._id?.toString(),
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
  },
};
