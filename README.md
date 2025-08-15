# Redis Product API

This is a backend API built with Node.js, Express, and ioredis. It provides CRUD functionality for managing products, orders, suppliers, stock, and users stored in a Redis database.

## Major Features

### Role-Based Access Control (RBAC)
The API now implements a simple RBAC system to control access to sensitive operations.
- **Roles**: Users can have different roles. By default, a newly registered user is assigned the `user` role. The system is designed to support other roles, such as `admin`.
- **Protected Routes**: Certain actions are restricted to specific roles. For example, deleting products or suppliers is now an **admin-only** action.
- **How it Works**: When a user logs in, their role is embedded in their JWT. A special middleware checks this role on protected routes to grant or deny access.

### Advanced Product Search and Filtering
The `GET /products` endpoint has been significantly upgraded to support efficient searching, sorting, and pagination, making it suitable for large product catalogs. The previous implementation, which used the `KEYS` command, has been replaced with a scalable solution using Redis indexes.
- **Filtering**: Filter products by `category`.
- **Sorting**: Sort products by `price` or `name`.
- **Pagination**: Control the number of results per page using `page` and `limit` parameters.

**Example Query:**
`GET /products?category=Electronics&sortBy=price&sortOrder=desc&page=1&limit=20`
- `category` (string): Filters products by the specified category.
- `sortBy` (string): Sorts results by `price` or `name`.
- `sortOrder` (string): `asc` (default) or `desc`.
- `page` (number): The page number to retrieve (default: `1`).
- `limit` (number): The number of items per page (default: `10`).

### Transactional Order Processing
The order creation process is now fully transactional, guaranteeing data integrity and preventing race conditions.
- **Atomic Operations**: When an order is created, the system checks for product availability and decrements stock in a single, atomic transaction using Redis's `WATCH`/`MULTI`/`EXEC` commands.
- **Conflict Resolution**: If stock levels change while an order is being placed (e.g., due to a concurrent purchase), the transaction will safely fail, and the API will return an error message prompting the user to try again. This prevents overselling and ensures the database remains in a consistent state.

## Prerequisites

- Node.js
- npm
- Docker (for running Redis)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd redis-product-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Redis connection details and a JWT secret.
    ```
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_PASSWORD=
    JWT_SECRET=your_super_secret_key
    ```

4.  **Start Redis using Docker:**
    ```bash
    docker run -d -p 6379:6379 --name my-redis redis
    ```

5.  **Start the server:**
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:4000`.

## Authentication

The API uses JSON Web Tokens (JWT) to authenticate requests. To access protected endpoints, you must first register and log in to obtain a token.

### 1. Register a new user
A new user will be assigned the `user` role by default.
`POST /auth/register`
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Login
The returned JWT will now contain the user's role.
`POST /auth/login`
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Accessing Protected Routes
Include the token in the `Authorization` header. Admin-only routes will now return a `403 Forbidden` error if accessed by a non-admin user.
```
Authorization: Bearer <your_jwt_token>
```

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the Swagger UI at `http://localhost:4000/api-docs`. You can use the "Authorize" button in the Swagger UI to add your JWT token and test the protected endpoints.
