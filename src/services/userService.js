import redisClient from '../config/redisClient.js';

const USER_KEY_PREFIX = 'user:';

export const getAllUsers = async () => {
  const keys = await redisClient.keys(`${USER_KEY_PREFIX}*`);
  if (!keys.length) {
    return [];
  }
  const users = await redisClient.mget(keys);
  return users.map(user => JSON.parse(user));
};

export const getUserById = async (id) => {
  const user = await redisClient.get(`${USER_KEY_PREFIX}${id}`);
  return user ? JSON.parse(user) : null;
};

export const createUser = async (user) => {
  await redisClient.set(`${USER_KEY_PREFIX}${user.id}`, JSON.stringify(user));
};

export const updateUser = async (id, updates) => {
  const key = `${USER_KEY_PREFIX}${id}`;
  const existingUser = await redisClient.get(key);

  if (!existingUser) {
    return null;
  }

  const user = JSON.parse(existingUser);
  const updatedUser = { ...user, ...updates };

  await redisClient.set(key, JSON.stringify(updatedUser));
  return updatedUser;
};

export const deleteUser = async (id) => {
  const result = await redisClient.del(`${USER_KEY_PREFIX}${id}`);
  return result;
};
