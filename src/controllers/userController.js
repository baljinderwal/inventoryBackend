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

export const updateUserProfile = async (req, res) => {
  try {
    const { address, phone } = req.body;
    const updatedUser = await userService.updateUserProfile(req.user.id, { address, phone });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  const { email, password } = req.query;

  try {
    // Handle login
    if (email && password) {
      const user = await userService.getUserByEmail(email);
      if (user && user.password === password) { // In a real app, use bcrypt to compare passwords
        return res.status(200).json([user]);
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // Handle user existence check for signup
    if (email) {
      const user = await userService.getUserByEmail(email);
      return res.status(200).json(user ? [user] : []);
    }

    // Original functionality: get all users
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

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const newUser = await userService.createUser({ name, email, password, role: 'Staff' });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
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
