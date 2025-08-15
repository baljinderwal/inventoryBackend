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

### Promotions and Discounts
The API now supports creating and managing promotions that can be applied to orders.
- **Admin-Managed**: Users with the `admin` role can create and delete promotions.
- **Automatic Application**: Promotions are automatically applied to orders at checkout. For example, a percentage discount can be applied to all products in a specific category.

### Product Reviews and Ratings
Authenticated users can now submit reviews and ratings for products.
- **User Reviews**: Any authenticated user can add a review to a product.
- **Average Rating**: The system automatically calculates and updates the average rating for each product based on the submitted reviews.

### Audit Trail
The API now logs critical actions performed by users, providing a clear record of important events.
- **Logged Actions**: The system logs actions such as creating an order, updating stock, and deleting a product.
- **Admin Access**: Users with the `admin` role can retrieve the audit logs.

### User Profile Management
Users can manage their profile information, including their address and phone number.
- **View Profile**: Authenticated users can view their own profile using the `GET /users/me` endpoint.
- **Update Profile**: Users can update their address and phone number using the `PUT /users/me` endpoint.

### Real-time Notifications
The API uses WebSockets to provide real-time notifications to users about their orders.
- **How it works**: When an order's status is updated, a notification is sent to the user who placed the order.
- **Connecting**: Clients can connect to the WebSocket server using their JWT token. `ws://localhost:4000?token=<your_jwt_token>`

### Wishlist Functionality
Users can maintain a wishlist of products they are interested in.
- **View Wishlist**: Get the list of product IDs in the wishlist with `GET /wishlist`.
- **Add to Wishlist**: Add a product to the wishlist with `POST /wishlist`.
- **Remove from Wishlist**: Remove a product with `DELETE /wishlist/{productId}`.

### Customer Management
The API now includes endpoints for managing customer data.
- **CRUD Operations**: Full support for creating, reading, updating, and deleting customers.
- **Secure Access**: All customer-related endpoints are protected and require authentication.

### Sales Order Management
The API now includes endpoints for managing sales orders.
- **CRUD Operations**: Full support for creating, reading,updating, and deleting sales orders.
- **Secure Access**: All sales order endpoints are protected and require authentication.

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

### Environment Variables

Before starting the server, you need to create a `.env` file in the root of the project to store your environment variables.

Create a file named `.env` and add the following content:

```
JWT_SECRET=mysecret
REDIS_HOST=localhost
REDIS_PORT=6379
```

- `JWT_SECRET`: A secret key used for signing JSON Web Tokens. For production, this should be a long, complex, and randomly generated string.
- `REDIS_HOST`: The hostname of your Redis server.
- `REDIS_PORT`: The port your Redis server is running on.

3.  **Start Redis using Docker:**
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

Send a `POST` request to `/auth/register` with the user's name, email, and password.

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Login

Send a `POST` request to `/auth/login` with the registered email and password.

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

The API will return a JWT token.

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI..."
}
```

### 3. Accessing Protected Routes

To access a protected route, include the token in the `Authorization` header of your request, prefixed with `Bearer `.

```
Authorization: Bearer <your_jwt_token>
```

### 4. Update User Profile

Authenticated users can update their email and password by sending a `PUT` request to `/users/me`.

```json
{
  "email": "new.email@example.com",
  "password": "new_strong_password"
}
```

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the Swagger UI at `http://localhost:4000/api-docs`.

You can use the "Authorize" button in the Swagger UI to add your JWT token and test the protected endpoints directly from the documentation.

## File-by-File Description

### Root Directory

- **`.gitignore`**: This file specifies which files and directories should be ignored by Git. This typically includes build artifacts, log files, and environment-specific files.
- **`package.json`**: This file contains metadata about the Node.js project, such as its name, version, and dependencies. It also defines the scripts that can be run, such as `start` and `test`.
- **`package-lock.json`**: This file is automatically generated for any operations where `npm` modifies either the `node_modules` tree, or `package.json`. It describes the exact tree that was generated, such that subsequent installs are able to generate identical trees, regardless of intermediate dependency updates.
- **`README.md`**: The main documentation file for the project. It provides an overview of the project, instructions on how to set it up and run it, and documentation for the API endpoints.
- **`test-dotenv.js`**: This is a utility file for testing the `dotenv` configuration. It is not part of the main application or the tests.

### `src` Directory

- **`src/app.js`**: This is the main application file. It creates an Express application instance and configures it with the necessary middleware, such as `cors` for handling Cross-Origin Resource Sharing and `express.json` for parsing JSON request bodies. It also sets up the Swagger UI for API documentation and registers the routes for all the different resources (`products`, `orders`, `suppliers`, `users`, `stock`, `locations`).
- **`src/server.js`**: This is the entry point of the application. It imports the Express app from `app.js`, connects to Redis, and starts the server on the specified port (or 4000 by default). It also includes a function to seed the database with some initial user data if no users exist.

#### `src/config`

- **`src/config/redisClient.js`**: This file is responsible for creating and configuring the Redis client. It reads the Redis connection details (host, port, username, password) from the environment variables and uses them to create a new `ioredis` instance. It also includes event listeners to log when the client is ready to use or when there is a connection error. The configured Redis client is then exported for use in other parts of the application.
- **`src/config/swagger.js`**: This file configures the Swagger documentation for the API. It uses the `swagger-jsdoc` library to generate a Swagger specification based on the JSDoc comments in the route files. It defines the basic information for the API, such as the title, version, and description, and specifies the location of the route files that contain the Swagger annotations. The generated `swaggerSpec` is then exported to be used with `swagger-ui-express` in `src/app.js`.

#### `src/controllers`

- **`src/controllers/authController.js`**: This file contains the controller functions for user registration and login.
- **`src/controllers/customerController.js`**: This file contains the controller functions for the `customers` resource. These functions handle the incoming HTTP requests, call the appropriate service functions to interact with the database, and then send the HTTP responses. It includes functions for all the CRUD operations (`getAllCustomers`, `getCustomer`, `createCustomer`, `updateCustomer`, `deleteCustomer`).
- **`src/controllers/salesOrderController.js`**: This file contains the controller functions for the `salesOrders` resource. These functions handle the incoming HTTP requests, call the appropriate service functions to interact with the database, and then send the HTTP responses. It includes functions for all the CRUD operations (`getAllSalesOrders`, `getSalesOrder`, `createSalesOrder`, `updateSalesOrder`, `deleteSalesOrder`).
- **`src/controllers/orderController.js`**: This file contains the controller functions for the `orders` resource. These functions handle the incoming HTTP requests, call the appropriate service functions to interact with the database, and then send the HTTP responses. It includes functions for all the CRUD operations (`getAllOrders`, `getOrder`, `createOrder`, `updateOrder`, `deleteOrder`) as well as the enhanced query endpoints (`getOrdersBySupplier`, `getOrdersByStatus`).
- **`src/controllers/productController.js`**: This file contains the controller functions for the `products` resource. These functions handle the incoming HTTP requests, call the appropriate service functions to interact with the database, and then send the HTTP responses. It includes functions for all the CRUD operations (`getAllProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`).
- **`src/controllers/locationController.js`**: This file contains the controller functions for the `locations` resource. These functions handle the incoming HTTP requests, call the appropriate service functions to interact with the database, and then send the HTTP responses. It includes functions for all the CRUD operations (`getAllLocations`, `getLocation`, `createLocation`, `updateLocation`, `deleteLocation`).
- **`src/controllers/stockController.js`**: This file contains the controller functions for the `stock` resource. These functions handle the incoming HTTP requests, call the appropriate service functions to interact with the database, and then send the HTTP responses. It includes functions for all the CRUD operations (`getAllStock`, `getStock`, `createStock`, `updateStock`, `deleteStock`).
- **`src/controllers/supplierController.js`**: This file contains the controller functions for the `suppliers` resource. These functions handle the incoming HTTP requests, call the appropriate service functions to interact with the database, and then send the HTTP responses. It includes functions for all the CRUD operations (`getAllSuppliers`, `getSupplier`, `createSupplier`, `updateSupplier`, `deleteSupplier`) as well as the enhanced query endpoint (`getProductsBySupplier`).
- **`src/controllers/userController.js`**: This file contains the controller functions for the `users` resource. These functions handle the incoming HTTP requests, call the appropriate service functions to interact with the database, and then send the HTTP responses. It includes functions for all the CRUD operations (`getAllUsers`, `getUser`, `createUser`, `updateUser`, `deleteUser`).
- **`src/controllers/promotionController.js`**: This file contains the controller functions for the `promotions` resource.
- **`src/controllers/reviewController.js`**: This file contains the controller functions for product reviews.
- **`src/controllers/auditController.js`**: This file contains the controller functions for retrieving audit logs.

#### `src/middleware`

- **`src/middleware/authMiddleware.js`**: This file contains the `protect` middleware, which verifies the JWT token from the `Authorization` header to protect routes.

#### `src/routes`

- **`src/routes/authRoutes.js`**: This file defines the API routes for authentication (`/register`, `/login`).
- **`src/routes/customerRoutes.js`**: This file defines the API routes for the `customers` resource. It uses an Express Router to create the routes and associates them with the corresponding controller functions from `customerController.js`. This file also contains the Swagger JSDoc annotations that define the `Customer` schema and the API endpoints for the Swagger documentation.
- **`src/routes/salesOrderRoutes.js`**: This file defines the API routes for the `salesOrders` resource. It uses an Express Router to create the routes and associates them with the corresponding controller functions from `salesOrderController.js`. This file also contains the Swagger JSDoc annotations that define the `SalesOrder` schema and the API endpoints for the Swagger documentation.
- **`src/routes/orderRoutes.js`**: This file defines the API routes for the `orders` resource. It uses an Express Router to create the routes and associates them with the corresponding controller functions from `orderController.js`. This file also contains the Swagger JSDoc annotations that define the `Order` schema and the API endpoints for the Swagger documentation.
- **`src/routes/productRoutes.js`**: This file defines the API routes for the `products` resource. It uses an Express Router to create the routes and associates them with the corresponding controller functions from `productController.js`. This file also contains the Swagger JSDoc annotations that define the `Product` schema and the API endpoints for the Swagger documentation.
- **`src/routes/locationRoutes.js`**: This file defines the API routes for the `locations` resource. It uses an Express Router to create the routes and associates them with the corresponding controller functions from `locationController.js`. This file also contains the Swagger JSDoc annotations that define the `Location` schema and the API endpoints for the Swagger documentation.
- **`src/routes/stockRoutes.js`**: This file defines the API routes for the `stock` resource. It uses an Express Router to create the routes and associates them with the corresponding controller functions from `stockController.js`. This file also contains the Swagger JSDoc annotations that define the `Stock` and `Batch` schemas and the API endpoints for the Swagger documentation.
- **`src/routes/supplierRoutes.js`**: This file defines the API routes for the `suppliers` resource. It uses an Express Router to create the routes and associates them with the corresponding controller functions from `supplierController.js`. This file also contains the Swagger JSDoc annotations that define the `Supplier` schema and the API endpoints for the Swagger documentation.
- **`src/routes/userRoutes.js`**: This file defines the API routes for the `users` resource. It uses an Express Router to create the routes and associates them with the corresponding controller functions from `userController.js`. This file also contains the Swagger JSDoc annotations that define the `User` schema and the API endpoints for the Swagger documentation.
- **`src/routes/promotionRoutes.js`**: This file defines the API routes for the `promotions` resource.
- **`src/routes/reviewRoutes.js`**: This file defines the API routes for product reviews.
- **`src/routes/auditRoutes.js`**: This file defines the API routes for retrieving audit logs.

#### `src/services`

- **`src/services/authService.js`**: This service handles the logic for user registration (password hashing) and login (password verification and JWT creation).
- **`src/services/customerService.js`**: This file contains the service functions for the `customers` resource. These functions encapsulate the business logic and interact with the in-memory data store to perform CRUD operations.
- **`src/services/salesOrderService.js`**: This file contains the service functions for the `salesOrders` resource. These functions encapsulate the business logic and interact with the in-memory data store to perform CRUD operations.
- **`src/services/orderService.js`**: This file contains the service functions for the `orders` resource. These functions encapsulate the business logic and interact with the Redis database. **It now includes stock validation before creating an order.** It also uses efficient Redis sets for indexing orders by status and supplier.
- **`src/services/productService.js`**: This file contains the service functions for the `products` resource. These functions encapsulate the business logic and interact with the Redis database. **It now auto-generates numeric IDs and maintains an index for them.**
- **`src/services/locationService.js`**: This file contains the service functions for the `locations` resource. These functions encapsulate the business logic and interact with the Redis database to perform CRUD operations. It uses the `redisClient` to store and retrieve location data, which is prefixed with `location:`. It uses a Redis counter to generate auto-incrementing integer IDs for new locations.
- **`src/services/stockService.js`**: This file contains the service functions for the `stock` resource. These functions encapsulate the business logic and interact with the Redis database to perform CRUD operations and other data-related tasks. It uses the `redisClient` to store and retrieve stock data, which is prefixed with `stock:`.
- **`src/services/supplierService.js`**: This file contains the service functions for the `suppliers` resource. These functions encapsulate the business logic and interact with the Redis database to perform CRUD operations and other data-related tasks. It uses the `redisClient` to store and retrieve supplier data, which is prefixed with `supplier:`. It also includes a function to get all products for a specific supplier.
- **`src/services/userService.js`**: This file contains the service functions for the `users` resource. These functions encapsulate the business logic and interact with the Redis database. **It now auto-generates user IDs and maintains an index for user emails.**
- **`src/services/promotionService.js`**: This file contains the service functions for the `promotions` resource.
- **`src/services/reviewService.js`**: This file contains the service functions for product reviews.
- **`src/services/auditService.js`**: This file contains the service functions for logging critical actions.

### `test` Directory

- **`test/orders.test.js`**: This file contains the tests for the new endpoints of the `orders` resource. It uses Jest and Supertest to send requests to the API and assert that the responses are correct. It tests getting orders by supplier and by status.
- **`test/stock.test.js`**: This file contains the tests for the `stock` resource. It tests all the CRUD operations for stock.
- **`test/suppliers.test.js`**: This file contains the tests for the new endpoint of the `suppliers` resource. It tests getting all products for a specific supplier.
- **`test/user.test.js`**: This file contains the tests for the `users` resource. It tests all the CRUD operations for users.
