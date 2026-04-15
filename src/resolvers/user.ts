import { IUser } from '../models/User';
import Review from '../models/Review';
import Loan from '../models/Loan';
import { paginate } from '../utils/pagination';

const User_ = {
  reviews: (parent: IUser, args: { page?: number; limit?: number }) =>
    paginate(Review, { userId: parent._id }, args.page ?? 1, args.limit ?? 10),

  loans: (parent: IUser, args: { page?: number; limit?: number }) =>
    paginate(Loan, { userId: parent._id }, args.page ?? 1, args.limit ?? 10),
};

export const userResolvers = {
  User: User_,
};
