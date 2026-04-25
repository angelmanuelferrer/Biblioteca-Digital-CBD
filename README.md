# Biblioteca Digital — GraphQL API

API GraphQL para gestión de una biblioteca digital: autores, libros, préstamos y reseñas.

## Aplicación desplegada

La aplicación está desplegada en [Render](https://biblioteca-digital-cbd.onrender.com/) y es accesible públicamente. El endpoint GraphQL está en `https://biblioteca-digital-cbd.onrender.com/graphql`, donde también está disponible el Apollo Sandbox.

> **Nota:** al estar en el plan gratuito de Render, el servidor puede tardar unos segundos en responder si lleva inactivo un tiempo (*cold start*).

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
# Instalar dependencias del servidor
npm install

# Copiar variables de entorno
cp .env.example .env

# Desarrollo del servidor (hot reload)
npm run dev
```

En otra terminal, arrancar el cliente:

```bash
cd client
npm install
npm run dev
```

El cliente estará disponible en `http://localhost:5173`.

Para producción:

```bash
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
