import { GraphQLClient } from 'graphql-request';
import { getToken } from '@/store/auth';

export const gqlClient = new GraphQLClient(import.meta.env.VITE_API_URL ?? '/graphql', {
  headers: () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : ({} as Record<string, string>);
  },
});
