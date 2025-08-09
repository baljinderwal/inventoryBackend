import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/products', productRoutes);

export default app;
