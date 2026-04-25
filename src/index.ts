import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { Context } from './types/context';
import { buildContext } from './middleware/auth';
import { checkLateLoans } from './utils/checkLateLoans';

dotenv.config();

async function main(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Missing env variable: MONGODB_URI');
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('Missing env variable: JWT_SECRET');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await checkLateLoans();

  const app = express();

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  });
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.NODE_ENV === 'production'
        ? [process.env.CLIENT_ORIGIN ?? '', 'https://sandbox.apollo.dev'].filter(Boolean)
        : '*',
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, { context: buildContext })
  );

  app.get('/health', (_req, res) => res.sendStatus(200));

  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  const PORT = parseInt(process.env.PORT ?? '4000', 10);
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
