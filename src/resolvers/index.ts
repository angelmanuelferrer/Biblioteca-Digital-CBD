import { resolvers as authResolvers } from '../schema/resolvers';
import { authorResolvers } from './author';
import { bookResolvers } from './book';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...authorResolvers.Query,
    ...bookResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...authorResolvers.Mutation,
    ...bookResolvers.Mutation,
  },
  User:   { ...authResolvers.User },
  Author: authorResolvers.Author,
  Book:   bookResolvers.Book,
};
