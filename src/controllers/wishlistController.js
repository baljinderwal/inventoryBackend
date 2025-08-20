import * as wishlistService from '../services/wishlistService.js';

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.getWishlistByUserId(req.user.id);
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving wishlist', error: error.message });
  }
};

export const addProductToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const wishlistItem = await wishlistService.addProductToWishlist(req.user.id, productId);
    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(500).json({ message: 'Error adding product to wishlist', error: error.message });
  }
};

export const removeProductFromWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    await wishlistService.removeProductFromWishlist(req.user.id, wishlistId);
    res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing product from wishlist', error: error.message });
  }
};
