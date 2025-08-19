import * as userService from '../services/userService.js';

export const createUserProfile = async (req, res) => {
  try {
    const userProfile = await userService.createOrUpdateUserProfile(req.body);
    res.status(201).json({ message: 'User profile created or updated successfully', userProfile });
  } catch (error) {
    // A more specific error code could be used for "Password is required"
    if (error.message.includes('required')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // req.user is attached by the protect middleware
    const userId = req.user.id;
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Do not return password hash
    const { password, ...userProfile } = user;
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Prevent password and email from being updated through this endpoint
    delete updateData.password;
    delete updateData.email;

    const updatedUser = await userService.updateUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Do not return password hash
    const { password, ...userProfile } = updatedUser;
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const deletedCount = await userService.deleteUser(userId);

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
