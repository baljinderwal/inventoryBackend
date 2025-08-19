import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';
import bcrypt from 'bcryptjs';

const USER_KEY_PREFIX = 'user:userid:';

export const getAllUsers = async () => {
  const keys = await redisClient.keys(`${USER_KEY_PREFIX}[0-9]*`);
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

export const createUser = async (userData) => {
    const newId = uuidv4();
    const newUser = { ...userData, id: newId, role: userData.role };

    const pipeline = redisClient.pipeline();
    pipeline.set(`${USER_KEY_PREFIX}${newUser.id}`, JSON.stringify(newUser));
    pipeline.set(`user:email:${newUser.email}`, newUser.id);
    await pipeline.exec();

    return newUser;
};

export const createMultipleUsers = async (usersData) => {
    const pipeline = redisClient.pipeline();
    const newUsers = [];

    for (const userData of usersData) {
        const newId = uuidv4();
        const newUser = { ...userData, id: newId, role: userData.role || 'user' };
        newUsers.push(newUser);

        pipeline.set(`${USER_KEY_PREFIX}${newUser.id}`, JSON.stringify(newUser));
        pipeline.set(`user:email:${newUser.email}`, newUser.id);
    }

    await pipeline.exec();
    return newUsers;
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

export const createOrUpdateUserProfile = async (userData) => {
  const { email } = userData;
  if (!email) {
    throw new Error('Email is required to create or update a user profile.');
  }

  const user = await getUserByEmail(email);

  if (user) {
    // Update existing user, but don't update password this way.
    // Password updates should be handled separately for security.
    const { password, ...updateData } = userData;
    const updatedUser = { ...user, ...updateData };
    await redisClient.set(`${USER_KEY_PREFIX}${user.id}`, JSON.stringify(updatedUser));
    return updatedUser;
  } else {
    // Create new user
    if (!userData.password) {
      throw new Error('Password is required for a new user.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newId = uuidv4();
    const newUser = { ...userData, password: hashedPassword, id: newId, role: userData.role || 'user' };

    const pipeline = redisClient.pipeline();
    pipeline.set(`${USER_KEY_PREFIX}${newUser.id}`, JSON.stringify(newUser));
    pipeline.set(`user:email:${newUser.email}`, newUser.id);
    await pipeline.exec();

    // Return user object without password
    const { password, ...userToReturn } = newUser;
    return userToReturn;
  }
};

export const updateUserProfile = async (id, profileData) => {
  const key = `${USER_KEY_PREFIX}${id}`;
  const existingUser = await redisClient.get(key);

  if (!existingUser) {
    return null;
  }

  const user = JSON.parse(existingUser);
  const { address, phone } = profileData;
  const updatedUser = { ...user, address, phone };

  await redisClient.set(key, JSON.stringify(updatedUser));
  return updatedUser;
};

export const deleteUser = async (id) => {
  const user = await getUserById(id);
  if (!user) {
    return 0;
  }

  const pipeline = redisClient.pipeline();
  pipeline.del(`${USER_KEY_PREFIX}${id}`);
  pipeline.del(`user:email:${user.email}`);
  const results = await pipeline.exec();

  return results[0][1];
};

export const getUserByEmail = async (email) => {
    const userId = await redisClient.get(`user:email:${email}`);
    if (!userId) {
        return null;
    }
    return await getUserById(userId);
};

export const updateUserCredentials = async (id, credentials) => {
  const key = `${USER_KEY_PREFIX}${id}`;
  const existingUser = await redisClient.get(key);

  if (!existingUser) {
    return null;
  }

  const user = JSON.parse(existingUser);
  const { email, password } = credentials;

  if (email) {
    const oldEmailKey = `user:email:${user.email}`;
    const newEmailKey = `user:email:${email}`;
    const pipeline = redisClient.pipeline();
    pipeline.del(oldEmailKey);
    pipeline.set(newEmailKey, id);
    await pipeline.exec();
    user.email = email;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  const updatedUser = { ...user };
  await redisClient.set(key, JSON.stringify(updatedUser));
  return updatedUser;
};
