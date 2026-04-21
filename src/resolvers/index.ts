import { resolvers as authResolvers } from '../schema/resolvers';
import { authorResolvers } from './author';
import { bookResolvers } from './book';
import { reviewResolvers } from './review';
import { loanResolvers } from './loan';
import { userResolvers } from './user';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...authorResolvers.Query,
    ...bookResolvers.Query,
    ...reviewResolvers.Query,
    ...loanResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...authorResolvers.Mutation,
    ...bookResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...loanResolvers.Mutation,
  },
  User:   { ...authResolvers.User, ...userResolvers.User },
  Author: authorResolvers.Author,
  Book:   bookResolvers.Book,
  Review: reviewResolvers.Review,
  Loan:   loanResolvers.Loan,
};
