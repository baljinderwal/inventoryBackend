import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';

const USER_PRODUCTS_KEY_PREFIX = 's:user:';

const getUserProductsKey = (userId) => `${USER_PRODUCTS_KEY_PREFIX}${userId}:products`;

const logStream = fs.createWriteStream(path.join(process.cwd(), 'server.log'), { flags: 'a' });

const logRequest = (message) => {
  const timestamp = new Date().toISOString();
  logStream.write(`[${timestamp}] ${message}\n`);
  console.log(`[${timestamp}] ${message}`);
};

export const getProductById = async (userId, productId) => {
  const userProductsKey = getUserProductsKey(userId);
  const productJSON = await redisClient.hget(userProductsKey, productId);
  return productJSON ? JSON.parse(productJSON) : null;
};

export const createProduct = async (userId, productData) => {
  const userProductsKey = getUserProductsKey(userId);
  const productId = uuidv4();

  // Ignore any incoming productId and use the generated one
  const newProduct = {
    ...productData,
    id: productId,
  };

  await redisClient.hset(userProductsKey, productId, JSON.stringify(newProduct));

  return newProduct;
};

export const createMultipleProducts = async (userId, productsData) => {
  const userProductsKey = getUserProductsKey(userId);
  const newProducts = [];
  const pipeline = redisClient.pipeline();

  for (const productData of productsData) {
    const productId = uuidv4();
    const newProduct = {
      ...productData,
      id: productId,
    };
    newProducts.push(newProduct);
    pipeline.hset(userProductsKey, productId, JSON.stringify(newProduct));
  }

  await pipeline.exec();
  return newProducts;
};

export const updateProduct = async (userId, productId, updates) => {
  const userProductsKey = getUserProductsKey(userId);
  const existingProductJSON = await redisClient.hget(userProductsKey, productId);

  if (!existingProductJSON) {
    return null;
  }

  const existingProduct = JSON.parse(existingProductJSON);
  const updatedProduct = { ...existingProduct, ...updates, id: productId };

  await redisClient.hset(userProductsKey, productId, JSON.stringify(updatedProduct));

  return updatedProduct;
};

export const deleteProduct = async (userId, productId) => {
  
  const userProductsKey = getUserProductsKey(userId);
  logRequest(`Deleting product ${productId} for user ${userId} from key ${userProductsKey}`);
  return await redisClient.hdel(userProductsKey, productId);
};

export const getAllProducts = async (userId, options = {}) => {
  const { sortBy, sortOrder = 'asc', page = 1, limit = 10 } = options;
  const userProductsKey = getUserProductsKey(userId);

  const allProducts = await redisClient.hgetall(userProductsKey);

  if (!allProducts) {
    return [];
  }

  let parsedProducts = Object.values(allProducts).map(p => JSON.parse(p));

  // In-app sorting
  if (sortBy) {
      parsedProducts.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
          if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
          return 0;
      });
  }

  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;

  return parsedProducts.slice(start, end);
};

export const findProductByIdAcrossUsers = async (productId) => {
  const stream = redisClient.scanStream({
    match: `${USER_PRODUCTS_KEY_PREFIX}*:products`,
    count: 100,
  });

  for await (const userProductsKey of stream) {
    const productJSON = await redisClient.hget(userProductsKey, productId);
    if (productJSON) {
      return JSON.parse(productJSON);
    }
  }

  return null;
};
