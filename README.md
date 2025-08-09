# Redis Product API

This is a simple backend API built with Node.js, Express, and ioredis. It provides CRUD functionality for managing products stored in a Redis database.

## Prerequisites

- Node.js
- npm
- Docker (for running Redis)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd redis-product-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root of the project and add the following line:
   ```
   REDIS_URL=redis://localhost:6379
   ```

4. **Start Redis using Docker:**
   ```bash
   docker run -d -p 6379:6379 --name my-redis redis
   ```

5. **Start the server:**
   ```bash
   npm start
   ```
   The server will be running on `http://localhost:3000`.

## API Endpoints

### 1. Create a Product

- **URL:** `/products`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "id": "101",
    "name": "Laptop",
    "price": 1200,
    "description": "A powerful gaming laptop"
  }
  ```
- **cURL Command:**
  ```bash
  curl -X POST http://localhost:3000/products \
       -H "Content-Type: application/json" \
       -d '{"id":"101","name":"Laptop","price":1200,"description":"A powerful gaming laptop"}'
  ```

### 2. Get a Product

- **URL:** `/products/:id`
- **Method:** `GET`
- **cURL Command:**
  ```bash
  curl http://localhost:3000/products/101
  ```

### 3. Update a Product

- **URL:** `/products/:id`
- **Method:** `PUT`
- **Body:**
  ```json
  {
    "price": 1250,
    "description": "An updated gaming laptop with more RAM"
  }
  ```
- **cURL Command:**
  ```bash
  curl -X PUT http://localhost:3000/products/101 \
       -H "Content-Type: application/json" \
       -d '{"price":1250,"description":"An updated gaming laptop with more RAM"}'
  ```

### 4. Delete a Product

- **URL:** `/products/:id`
- **Method:** `DELETE`
- **cURL Command:**
  ```bash
  curl -X DELETE http://localhost:3000/products/101
  ```
