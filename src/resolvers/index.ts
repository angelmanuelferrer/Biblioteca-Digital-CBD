import { resolvers as authResolvers } from '../schema/resolvers';
import { authorResolvers } from './author';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...authorResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...authorResolvers.Mutation,
  },
  User:   { ...authResolvers.User },
  Author: authorResolvers.Author,
};
