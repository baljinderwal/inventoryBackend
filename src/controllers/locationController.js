import * as locationService from '../services/locationService.js';

export const getAllLocations = async (req, res) => {
  try {
    const locations = await locationService.getAllLocations();
    res.status(200).json({ locations });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving locations', error: error.message });
  }
};

export const getLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await locationService.getLocationById(id);

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving location', error: error.message });
  }
};

export const createLocation = async (req, res) => {
  try {
    const newLocation = await locationService.createLocation(req.body);
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating location', error: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedLocation = await locationService.updateLocation(id, updates);

    if (!updatedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json(updatedLocation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await locationService.deleteLocation(id);

    if (result === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting location', error: error.message });
  }
};
