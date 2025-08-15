import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userService from './userService.js';

export const register = async (userData) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await userService.createUser({
    name,
    email,
    password: hashedPassword,
  });

  return newUser;
};

export const login = async (email, password) => {
  // Find user by email
  const user = await userService.getUserByEmail(email);
  if (!user) {
    return null;
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return null;
  }

  // Create JWT
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expires in 1 hour
  });

  return token;
};
