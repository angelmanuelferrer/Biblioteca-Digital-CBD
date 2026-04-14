import { resolvers as authResolvers } from '../schema/resolvers';
import { authorResolvers } from './author';
import { bookResolvers } from './book';
import { loanResolvers } from './loan';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...authorResolvers.Query,
    ...bookResolvers.Query,
    ...loanResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...authorResolvers.Mutation,
    ...bookResolvers.Mutation,
    ...loanResolvers.Mutation,
  },
  User:   { ...authResolvers.User },
  Author: authorResolvers.Author,
  Book:   bookResolvers.Book,
  Loan:   loanResolvers.Loan,
};
