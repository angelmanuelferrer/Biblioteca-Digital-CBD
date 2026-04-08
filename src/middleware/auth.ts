import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import { verifyToken } from '../utils/auth';
import { Context } from '../types/context';

export async function buildContext({ req }: ExpressContextFunctionArgument): Promise<Context> {
  const authHeader = req.headers.authorization ?? '';

  if (!authHeader.startsWith('Bearer ')) {
    return {};
  }

  const token = authHeader.slice(7); // strip "Bearer "
  const payload = verifyToken(token);

  if (!payload) {
    return {};
  }

  return { userId: payload.userId, userRole: payload.userRole };
}
