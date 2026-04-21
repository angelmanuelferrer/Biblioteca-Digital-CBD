import { GraphQLError } from 'graphql';
import { Context } from '../types/context';

export function requireAuth(context: Context): { userId: string; userRole: string } {
  if (!context.userId) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return { userId: context.userId, userRole: context.userRole ?? '' };
}

export function requireAdmin(context: Context): { userId: string; userRole: string } {
  const auth = requireAuth(context);
  if (auth.userRole !== 'ADMIN') {
    throw new GraphQLError('Not authorized', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return auth;
}
