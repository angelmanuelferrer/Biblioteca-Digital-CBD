import { GraphQLError } from 'graphql';
import { Error as MongooseError, isValidObjectId } from 'mongoose';

/**
 * Validates that `id` is a well-formed ObjectId before hitting MongoDB.
 * Prevents unhandled CastErrors from reaching Apollo.
 */
export function assertValidId(id: string, label = 'id'): void {
  if (!isValidObjectId(id)) {
    throw new GraphQLError(`Invalid ${label}: "${id}"`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
}

/**
 * Converts a Mongoose ValidationError into a readable GraphQLError.
 * Call inside catch blocks around Model.create / findByIdAndUpdate.
 */
export function handleMongooseError(err: unknown): never {
  if (err instanceof MongooseError.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
    throw new GraphQLError(message, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  throw err;
}
