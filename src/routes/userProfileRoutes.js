import { Router } from 'express';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '../controllers/userProfileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// The POST route is for creating/updating a profile (comprehensive registration).
// It doesn't require the user to be authenticated yet, as they might be creating their profile.
router.post('/', createUserProfile);

// The following routes operate on the authenticated user's profile.
// They all need the 'protect' middleware to identify the user.
router.get('/', protect, getUserProfile);
router.put('/', protect, updateUserProfile);
router.delete('/', protect, deleteUserProfile);

export default router;
