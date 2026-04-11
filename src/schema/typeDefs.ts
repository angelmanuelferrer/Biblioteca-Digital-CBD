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

  # ── Pagination ─────────────────────────────────────────────────────────────

  type PageInfo {
    page: Int!
    limit: Int!
    totalItems: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  # ── Author ─────────────────────────────────────────────────────────────────

  type Author {
    id: ID!
    name: String!
    bio: String
    birthDate: String
    deathDate: String
    nationality: String
    books: [Book!]!
    createdAt: String!
    updatedAt: String!
  }

  type AuthorConnection {
    items: [Author!]!
    pageInfo: PageInfo!
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

  # ── Book ───────────────────────────────────────────────────────────────────

  type Book {
    id: ID!
    title: String!
    isbn: String
    description: String
    publishedYear: Int
    genres: [String!]!
    authors: [Author!]!
    averageRating: Float!
    ratingsCount: Int!
    availableCopies: Int!
    totalCopies: Int!
    createdAt: String!
    updatedAt: String!
  }

  type BookConnection {
    items: [Book!]!
    pageInfo: PageInfo!
  }

  input CreateBookInput {
    title: String!
    isbn: String
    description: String
    publishedYear: Int
    genres: [String!]!
    authorIds: [ID!]!
    totalCopies: Int!
    availableCopies: Int
  }

  input UpdateBookInput {
    title: String
    isbn: String
    description: String
    publishedYear: Int
    genres: [String!]
    authorIds: [ID!]
    totalCopies: Int
    availableCopies: Int
  }

  extend type Query {
    books(
      search: String
      genre: String
      authorId: ID
      minRating: Float
      availableOnly: Boolean
      page: Int = 1
      limit: Int = 10
    ): BookConnection!
    book(id: ID!): Book
  }

  extend type Mutation {
    createBook(input: CreateBookInput!): Book!
    updateBook(id: ID!, input: UpdateBookInput!): Book!
    deleteBook(id: ID!): Boolean!
  }
`;
