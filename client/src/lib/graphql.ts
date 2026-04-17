import { GraphQLClient } from 'graphql-request';
import { getToken } from '@/store/auth';

export const gqlClient = new GraphQLClient('http://localhost:4000/graphql', {
  headers: () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
