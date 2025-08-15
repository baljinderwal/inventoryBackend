import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import userRoutes from './routes/userRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/users', userRoutes);
app.use('/stock', stockRoutes);
app.use('/locations', locationRoutes);
app.use('/auth', authRoutes);
app.use('/promotions', promotionRoutes);
app.use('/audit', auditRoutes);

export default app;
