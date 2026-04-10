import { GraphQLError } from 'graphql';
import { Error as MongooseError, isValidObjectId } from 'mongoose';

export function assertValidId(id: string): void {
  if (!isValidObjectId(id)) {
    throw new GraphQLError(`Invalid ObjectId: "${id}"`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
}

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
