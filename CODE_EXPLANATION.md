# Codebase Explanation

This document provides a file-by-file explanation of the `redis-product-api` repository.

---

## `package.json`

This `package.json` file defines a Node.js project with the following details:

*   **`name`**: `redis-product-api`
*   **`description`**: "A simple product API using Node.js, Express, and Redis."
*   **`main`**: The entry point of the application is `src/server.js`.
*   **`type`**: The project uses modern JavaScript ES modules (`import/export` syntax).
*   **`scripts`**:
    *   `start`: You can run the application by executing `npm start` in your terminal, which in turn runs `node src/server.js`.
*   **`dependencies`**: These are the external libraries the project uses:
    *   `cors`: Enables Cross-Origin Resource Sharing, allowing the API to be called from web browsers on different domains.
    *   `dotenv`: Loads configuration from a `.env` file into environment variables.
    *   `express`: A popular and minimalist web framework for building the API.
    *   `ioredis`: A robust Redis client used to connect to and interact with a Redis database.
    *   `swagger-jsdoc` and `swagger-ui-express`: These are used to automatically generate and serve interactive API documentation.

In short, this file sets up a simple REST API built with Express that manages product data and uses Redis. It also includes tools for API documentation.

---

## `src/server.js`

This `src/server.js` file is the application's entry point. Here's what it does:

1.  **`import app from './app.js';`**: It imports the core Express application configuration from the neighboring `app.js` file. This is a common pattern to keep the server startup logic separate from the application setup.
2.  **`import dotenv from 'dotenv';`**: It imports the `dotenv` library.
3.  **`dotenv.config();`**: This line executes the `dotenv` configuration, which reads a file named `.env` in the project root and loads its key-value pairs into the application's environment variables.
4.  **`const PORT = process.env.PORT || 3000;`**: It defines the port the server will listen on. It first tries to get the port number from an environment variable named `PORT`. If that's not set, it defaults to `3000`.
5.  **`app.listen(PORT, () => { ... });`**: This is the command that actually starts the web server. The imported `app` object begins listening for incoming HTTP requests on the specified `PORT`, and the callback function logs a confirmation message to the console once the server is running.

In summary, this file boots up the web server, making the application accessible on a specific port.

---

## `src/app.js`

This file is where the core Express application is created and configured. Here’s a step-by-step explanation:

1.  **Imports**: It imports all necessary modules: `express`, `cors`, `swagger-ui-express`, the `swaggerSpec` configuration, and the `productRoutes`.
2.  **`const app = express();`**: This line creates a new instance of an Express application.
3.  **Middleware Setup**:
    *   **`app.use(cors());`**: Applies the `cors` middleware to allow the API to be called from different domains.
    *   **`app.use(express.json());`**: A crucial built-in middleware that parses incoming request bodies in JSON format.
4.  **API Documentation Route**:
    *   **`app.use('/api-docs', ...);`**: This line sets up the interactive API documentation, making it available at the `/api-docs` URL.
5.  **Application Routes**:
    *   **`app.use('/products', productRoutes);`**: This "mounts" the `productRoutes` router. Any request whose path starts with `/products` will be handed off to this router.
6.  **`export default app;`**: It exports the fully configured `app` object to be used in `src/server.js`.

In summary, `app.js` builds the application by plugging together middleware, routes, and documentation.

---

## `src/routes/productRoutes.js`

This file sets up the specific API endpoints for handling products.

1.  **Imports**: It imports the `Router` from Express and the controller functions from `productController.js`.
2.  **Swagger/OpenAPI Documentation**: The large comment blocks (`/** ... */`) are annotations used by `swagger-jsdoc` to automatically generate the API documentation. They define the data schemas, API tags, and details for each endpoint.
3.  **Route Definitions**: It defines the standard RESTful routes for a `products` resource, mapping each HTTP method and path to a specific controller function:
    *   `GET /`: Fetches all products (`getAllProducts`).
    *   `GET /:id`: Fetches a single product by its SKU (`getProduct`).
    *   `POST /`: Creates a new product (`createProduct`).
    *   `PUT /:id`: Updates an existing product (`updateProduct`).
    *   `DELETE /:id`: Deletes a product (`deleteProduct`).
4.  **Export**: It exports the configured `router` to be used by `app.js`.

---

## `src/controllers/productController.js`

This is the "Controller" layer. Its job is to handle the HTTP request and response and call the service layer to execute business logic.

Each function:
1.  Handles the `req` (request) and `res` (response) objects.
2.  Extracts information from the request (e.g., `req.params`, `req.body`).
3.  Calls the appropriate function from the `productService`.
4.  Sends back an HTTP response with the correct status code and JSON data.
5.  Catches errors and sends a `500 Internal Server Error` response.

This file neatly separates web-related concerns from the data-handling logic.

---

## `src/services/productService.js`

This is the core of the business logic, responsible for directly managing product data in the Redis database.

1.  **Redis Client**: It imports the configured `redisClient`.
2.  **Key Prefixing**: It uses a `PRODUCT_KEY_PREFIX` (`product:`) to organize data in Redis, which is a best practice.
3.  **Data Format**: It uses `JSON.stringify()` to save objects to Redis and `JSON.parse()` to read them back.
4.  **Functions**: It provides functions for `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`, and `getAllProducts`, which execute the corresponding Redis commands (`GET`, `SET`, `DEL`, `KEYS`, `MGET`).

This file effectively abstracts the database operations away from the controller.

---

## `src/config/redisClient.js`

This file is dedicated to setting up the connection to the Redis database.

1.  **Load Configuration**: It uses `dotenv` to load the Redis host, port, and password from a `.env` file, keeping credentials out of the code.
2.  **Validate Configuration**: It checks that the required variables are set and exits the application if they are not.
3.  **Instantiate Client**: It creates a new `Redis` client instance from the `ioredis` library with the loaded configuration.
4.  **Connection Events**: It listens for `ready` and `error` events to log the connection status.
5.  **Export**: It exports the `redisClient` instance to be used by the `productService`.

---

## `src/config/swagger.js`

This file configures the `swagger-jsdoc` library to automatically generate API documentation.

1.  **Options**: It defines a configuration object.
    *   `definition`: Sets the OpenAPI version, API title, description, and server URL.
    *   `apis`: Tells the library where to find the documentation comments (in this case, all `.js` files in `src/routes`).
2.  **Generation**: It calls `swaggerJsdoc(options)` to generate the specification object based on the configuration.
3.  **Export**: It exports the generated `swaggerSpec` to be used by `swagger-ui-express` in `app.js`.

---

## `.gitignore` and `README.md`

### `.gitignore`

A configuration file for Git that tells it which files to ignore.
*   `node_modules`: This generated directory contains downloaded dependencies and should not be tracked in version control.
*   `.env`: This file contains sensitive credentials and must be ignored for security reasons.

### `README.md`

The main documentation file for the project. It includes a project description, setup prerequisites, a step-by-step guide for getting started, and examples of how to use the API endpoints with `curl`.
