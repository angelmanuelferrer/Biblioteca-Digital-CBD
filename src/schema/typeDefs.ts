export const typeDefs = `#graphql

  # ── Base queries / mutations (extended below) ──────────────────────────────

  type Query {
    health: String
    me: User
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }

  # ── Auth ───────────────────────────────────────────────────────────────────

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }
`;
