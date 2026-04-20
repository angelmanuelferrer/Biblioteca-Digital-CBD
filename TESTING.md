# Testing — Apollo Sandbox

URL: `http://localhost:4000/graphql`

Para operaciones autenticadas, añade el header en el panel **Headers**:
```json
{ "Authorization": "Bearer <token>" }
```

---

## a) register

```graphql
mutation Register($name: String!, $email: String!, $password: String!) {
  register(name: $name, email: $email, password: $password) {
    token
    user {
      id
      name
      email
      role
    }
  }
}
```

**Variables:**
```json
{
  "name": "Ana García",
  "email": "ana@biblioteca.com",
  "password": "secret123"
}
```

---

## b) login (guarda el token)

```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      name
      role
    }
  }
}
```

**Variables:**
```json
{
  "email": "ana@biblioteca.com",
  "password": "secret123"
}
```

> Copia el valor de `token` y úsalo como `Bearer <token>` en los headers.

---

## c) createAuthor _(requiere ADMIN)_

```graphql
mutation CreateAuthor($input: CreateAuthorInput!) {
  createAuthor(input: $input) {
    id
    name
    nationality
    birthDate
  }
}
```

**Variables:**
```json
{
  "input": {
    "name": "Miguel de Cervantes",
    "nationality": "Española",
    "bio": "Autor del Quijote.",
    "birthDate": "1547-09-29T00:00:00.000Z"
  }
}
```

> Guarda el `id` devuelto como `<authorId>`.

---

## d) createBook _(requiere ADMIN)_

```graphql
mutation CreateBook($input: CreateBookInput!) {
  createBook(input: $input) {
    id
    title
    availableCopies
    totalCopies
    authors {
      name
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "title": "Don Quijote de la Mancha",
    "description": "La historia del ingenioso hidalgo.",
    "genres": ["Novela", "Clásico"],
    "authorIds": ["<authorId>"],
    "totalCopies": 5,
    "publishedYear": 1605
  }
}
```

> Guarda el `id` devuelto como `<bookId>`.

---

## e) books (con filtros)

```graphql
query Books($search: String, $genre: String, $availableOnly: Boolean, $minRating: Float) {
  books(search: $search, genre: $genre, availableOnly: $availableOnly, minRating: $minRating) {
    items {
      id
      title
      averageRating
      availableCopies
      genres
      authors {
        name
      }
    }
    pageInfo {
      totalItems
      totalPages
      hasNextPage
    }
  }
}
```

**Variables (búsqueda por texto):**
```json
{
  "search": "Quijote"
}
```

**Variables (filtros combinados):**
```json
{
  "genre": "Novela",
  "availableOnly": true,
  "minRating": 0.0
}
```

---

## f) createLoan _(requiere auth)_

```graphql
mutation CreateLoan($bookId: ID!, $dueDate: String!) {
  createLoan(bookId: $bookId, dueDate: $dueDate) {
    id
    status
    loanDate
    dueDate
    book {
      title
      availableCopies
    }
  }
}
```

**Variables:**
```json
{
  "bookId": "<bookId>",
  "dueDate": "2026-07-01T00:00:00.000Z"
}
```

> Guarda el `id` devuelto como `<loanId>`.

---

## g) createReview _(requiere auth)_

```graphql
mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    id
    rating
    comment
    book {
      title
      averageRating
      ratingsCount
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "bookId": "<bookId>",
    "rating": 5,
    "comment": "Una obra maestra inmortal."
  }
}
```

---

## h) returnLoan _(requiere auth)_

```graphql
mutation ReturnLoan($loanId: ID!) {
  returnLoan(loanId: $loanId) {
    id
    status
    returnDate
    book {
      title
      availableCopies
    }
  }
}
```

**Variables:**
```json
{
  "loanId": "<loanId>"
}
```

---

## i) myLoans _(requiere auth)_

```graphql
query MyLoans($status: LoanStatus) {
  myLoans(status: $status, page: 1, limit: 10) {
    items {
      id
      status
      loanDate
      dueDate
      returnDate
      book {
        title
      }
    }
    pageInfo {
      totalItems
    }
  }
}
```

**Variables (todos):**
```json
{}
```

**Variables (solo activos):**
```json
{
  "status": "ACTIVE"
}
```

---

## j) myReviews _(requiere auth)_

```graphql
query MyReviews {
  myReviews(page: 1, limit: 10) {
    items {
      id
      rating
      comment
      book {
        title
      }
    }
    pageInfo {
      totalItems
    }
  }
}
```

---

## k) me _(requiere auth)_

```graphql
query Me {
  me {
    id
    name
    email
    role
    loans(page: 1, limit: 5) {
      items {
        id
        status
        dueDate
      }
      pageInfo {
        totalItems
      }
    }
    reviews(page: 1, limit: 5) {
      items {
        id
        rating
        book {
          title
        }
      }
    }
  }
}
```
