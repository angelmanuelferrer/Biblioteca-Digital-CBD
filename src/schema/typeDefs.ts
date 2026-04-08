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

  # ── Author ─────────────────────────────────────────────────────────────────

  type Author {
    id: ID!
    name: String!
    bio: String
    birthDate: String
    deathDate: String
    nationality: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthorConnection {
    items: [Author!]!
  }

  input CreateAuthorInput {
    name: String!
    bio: String
    birthDate: String
    deathDate: String
    nationality: String
  }

  input UpdateAuthorInput {
    name: String
    bio: String
    birthDate: String
    deathDate: String
    nationality: String
  }

  extend type Query {
    authors(search: String, page: Int = 1, limit: Int = 10): AuthorConnection!
    author(id: ID!): Author
  }

  extend type Mutation {
    createAuthor(input: CreateAuthorInput!): Author!
    updateAuthor(id: ID!, input: UpdateAuthorInput!): Author!
    deleteAuthor(id: ID!): Boolean!
  }
`;
