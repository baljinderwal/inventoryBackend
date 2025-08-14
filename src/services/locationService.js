import redisClient from '../config/redisClient.js';

const LOCATION_KEY_PREFIX = 'location:';
const LOCATION_ID_COUNTER_KEY = 'location:id_counter';

export const getAllLocations = async () => {
  const keys = await redisClient.keys(`${LOCATION_KEY_PREFIX}*`);
  const locationKeys = keys.filter(key => key !== LOCATION_ID_COUNTER_KEY);
  if (!locationKeys.length) {
    return [];
  }
  const locations = await redisClient.mget(locationKeys);
  return locations.map(location => JSON.parse(location));
};

export const getLocationById = async (id) => {
  const location = await redisClient.get(`${LOCATION_KEY_PREFIX}${id}`);
  return location ? JSON.parse(location) : null;
};

export const createLocation = async (location) => {
  const id = await redisClient.incr(LOCATION_ID_COUNTER_KEY);
  const newLocation = { id, ...location };
  await redisClient.set(`${LOCATION_KEY_PREFIX}${id}`, JSON.stringify(newLocation));
  return newLocation;
};

export const updateLocation = async (id, updates) => {
  const key = `${LOCATION_KEY_PREFIX}${id}`;
  const existingLocation = await redisClient.get(key);

  if (!existingLocation) {
    return null;
  }

  const location = JSON.parse(existingLocation);
  const updatedLocation = { ...location, ...updates };

  await redisClient.set(key, JSON.stringify(updatedLocation));
  return updatedLocation;
};

export const deleteLocation = async (id) => {
  const result = await redisClient.del(`${LOCATION_KEY_PREFIX}${id}`);
  return result;
};
