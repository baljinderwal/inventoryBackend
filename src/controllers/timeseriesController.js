import * as timeseriesService from '../services/timeseriesService.js';

export const addShoe = async (req, res) => {
  try {
    const { size, color, quantity } = req.body;
    if (!size || !color || !quantity) {
      return res.status(400).json({ message: 'Missing required fields: size, color, quantity' });
    }
    await timeseriesService.addShoe(size, color, quantity);
    res.status(201).json({ message: 'Shoe data added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding shoe data', error: error.message });
  }
};

export const getShoes = async (req, res) => {
  try {
    const filters = req.query;
    const shoes = await timeseriesService.getShoes(filters);
    res.status(200).json(shoes);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving shoe data', error: error.message });
  }
};

export const sellShoe = async (req, res) => {
    try {
        const { size, color } = req.body;
        if (!size || !color) {
            return res.status(400).json({ message: 'Missing required fields: size, color' });
        }
        await timeseriesService.sellShoe(size, color);
        res.status(200).json({ message: 'Shoe sold successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error selling shoe', error: error.message });
    }
};
