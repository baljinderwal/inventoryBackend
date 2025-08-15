import redisClient from '../config/redisClient.js';

const PRODUCT_KEY_PREFIX = 'product:';
const ALL_PRODUCTS_SKU_KEY = 'products:all_skus';
const PRODUCT_PRICE_SORTED_SET_KEY = 'products:price';
const PRODUCT_CATEGORY_SET_PREFIX = 'products:category:';

export const getProductById = async (sku) => {
  const product = await redisClient.get(`${PRODUCT_KEY_PREFIX}${sku}`);
  return product ? JSON.parse(product) : null;
};

export const createProduct = async (productData) => {
  const newId = await redisClient.incr('product:id_counter');
  const newProduct = { ...productData, id: newId };

  const pipeline = redisClient.pipeline();
  pipeline.set(`${PRODUCT_KEY_PREFIX}${newProduct.sku}`, JSON.stringify(newProduct));
  pipeline.set(`product:id:${newProduct.id}`, newProduct.sku);

  // Add to indexes
  pipeline.sadd(ALL_PRODUCTS_SKU_KEY, newProduct.sku);
  if (newProduct.price) {
    pipeline.zadd(PRODUCT_PRICE_SORTED_SET_KEY, newProduct.price, newProduct.sku);
  }
  if (newProduct.category) {
    pipeline.sadd(`${PRODUCT_CATEGORY_SET_PREFIX}${newProduct.category}`, newProduct.sku);
  }

  await pipeline.exec();
  return newProduct;
};

export const updateProduct = async (sku, updates) => {
  const key = `${PRODUCT_KEY_PREFIX}${sku}`;
  const existingProductJSON = await redisClient.get(key);

  if (!existingProductJSON) {
    return null;
  }

  const existingProduct = JSON.parse(existingProductJSON);
  const updatedProduct = { ...existingProduct, ...updates };

  const pipeline = redisClient.pipeline();

  // Update main product hash
  pipeline.set(key, JSON.stringify(updatedProduct));

  // Update indexes
  // Price index
  if (updates.price !== undefined && updates.price !== existingProduct.price) {
    pipeline.zadd(PRODUCT_PRICE_SORTED_SET_KEY, updates.price, sku);
  }
  // Category index
  if (updates.category && updates.category !== existingProduct.category) {
    if (existingProduct.category) {
      pipeline.srem(`${PRODUCT_CATEGORY_SET_PREFIX}${existingProduct.category}`, sku);
    }
    pipeline.sadd(`${PRODUCT_CATEGORY_SET_PREFIX}${updates.category}`, sku);
  }

  await pipeline.exec();
  return updatedProduct;
};

export const updateProductById = async (id, updates) => {
    const sku = await redisClient.get(`product:id:${id}`);
    if (!sku) {
        return null;
    }
    return await updateProduct(sku, updates);
};

export const deleteProduct = async (sku) => {
  const key = `${PRODUCT_KEY_PREFIX}${sku}`;
  const productJSON = await redisClient.get(key);
  if (!productJSON) {
    return 0;
  }
  const product = JSON.parse(productJSON);

  const pipeline = redisClient.pipeline();
  pipeline.del(key);
  if (product.id) {
    pipeline.del(`product:id:${product.id}`);
  }

  // Remove from indexes
  pipeline.srem(ALL_PRODUCTS_SKU_KEY, sku);
  if (product.price) {
    pipeline.zrem(PRODUCT_PRICE_SORTED_SET_KEY, sku);
  }
  if (product.category) {
    pipeline.srem(`${PRODUCT_CATEGORY_SET_PREFIX}${product.category}`, sku);
  }

  const results = await pipeline.exec();
  return results[0][1]; // Result of the first del command
};

export const getAllProducts = async (options = {}) => {
  const { category, sortBy, sortOrder = 'asc', page = 1, limit = 10 } = options;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let skuKeys;

  // Step 1: Get initial set of SKUs based on category filter
  const categoryKey = category ? `${PRODUCT_CATEGORY_SET_PREFIX}${category}` : ALL_PRODUCTS_SKU_KEY;

  // Step 2: Get sorted SKUs if sorting is requested
  if (sortBy === 'price') {
    const rangeMethod = sortOrder.toLowerCase() === 'desc' ? 'zrevrange' : 'zrange';
    if (category) {
        // If filtering by category, we need to intersect the category set with the price sorted set
        const tempKey = `temp:intersection:${Date.now()}`;
        await redisClient.zinterstore(tempKey, 2, categoryKey, PRODUCT_PRICE_SORTED_SET_KEY, 'WEIGHTS', 0, 1);
        skuKeys = await redisClient[rangeMethod](tempKey, start, end);
        await redisClient.del(tempKey); // Clean up temporary key
    } else {
        skuKeys = await redisClient[rangeMethod](PRODUCT_PRICE_SORTED_SET_KEY, start, end);
    }
  } else {
    // For other sorting or no sorting, we get SKUs and sort in-app.
    // This is less efficient for non-price sorting but avoids complex Redis logic without RediSearch.
    const allSkusInCategory = await redisClient.smembers(categoryKey);
    // Note: smembers doesn't guarantee order. For pagination without sorting, this is non-deterministic.
    // A more robust solution would use SSCAN, but for simplicity, we'll slice here.
    skuKeys = allSkusInCategory.slice(start, end + 1);
  }

  if (!skuKeys || skuKeys.length === 0) {
    return [];
  }

  const productKeys = skuKeys.map(sku => `${PRODUCT_KEY_PREFIX}${sku}`);
  const products = await redisClient.mget(productKeys);

  const parsedProducts = products.filter(p => p).map(p => JSON.parse(p));

  // In-app sorting for non-indexed fields (e.g., name)
  if (sortBy && sortBy !== 'price') {
      parsedProducts.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
          if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
          return 0;
      });
  }

  return parsedProducts;
};


export const getProductByNumericId = async (id) => {
  const sku = await redisClient.get(`product:id:${id}`);
  if (!sku) {
    return null;
  }
  return await getProductById(sku);
};
