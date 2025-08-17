import * as userService from '../services/userService.js';

export const getMe = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { email, password } = req.body;
    const updatedUser = await userService.updateUserCredentials(req.user.id, { email, password });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

import bcrypt from 'bcryptjs';

export const createUser = async (req, res) => {
  try {
    const { id, name, email, password, role } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { id, name, email, password: hashedPassword, role };
    await userService.createUser(newUser);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

export const createMultipleUsers = async (req, res) => {
  try {
    const usersData = req.body;
    if (usersData.some(u => !u.id)) {
      return res.status(400).json({ message: 'User ID is required for all users' });
    }

    const salt = await bcrypt.genSalt(10);
    const newUsers = await Promise.all(usersData.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return { ...user, password: hashedPassword };
    }));

    await userService.createMultipleUsers(newUsers);
    res.status(201).json({ message: 'Users created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating users', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedUser = await userService.updateUser(id, updates);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);

    if (result === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};
