# Biblioteca Digital — GraphQL API

API GraphQL para gestión de una biblioteca digital: autores, libros, préstamos y reseñas.

## Requisitos

- Node.js 18+
- MongoDB 6+ (local o Atlas)

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```
MONGODB_URI=mongodb://localhost:27017/biblioteca
JWT_SECRET=cambia_esto_por_un_secreto_seguro
PORT=4000
```

| Variable | Descripción | Obligatoria |
|---|---|---|
| `MONGODB_URI` | URI de conexión a MongoDB | Sí |
| `JWT_SECRET` | Clave secreta para firmar JWT | Sí |
| `PORT` | Puerto del servidor (default: 4000) | No |

## Instalación y arranque

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Desarrollo (hot reload)
npm run dev

# Producción
npm run build
npm start
```

## Playground

Apollo Sandbox disponible en `http://localhost:4000/graphql` al arrancar el servidor.

Consulta [`TESTING.md`](./TESTING.md) para el flujo completo de pruebas con queries y mutations de ejemplo.

## Roles

| Rol | Permisos |
|---|---|
| `USER` | Préstamos, reseñas propias, lectura de catálogo |
| `ADMIN` | Todo lo anterior + gestión de autores, libros y vista de todos los préstamos |

El rol por defecto al registrarse es `USER`. Para promover a ADMIN, actualiza directamente en MongoDB:
```js
db.users.updateOne({ email: "admin@biblioteca.com" }, { $set: { role: "ADMIN" } })
```
