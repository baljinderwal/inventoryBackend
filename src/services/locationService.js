import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redisClient.js';

const getLocationKey = (userId) => `s:user:${userId}:locations`;

export const getAllLocations = async (userId) => {
    const locations = await redisClient.hgetall(getLocationKey(userId));
    if (!locations || Object.keys(locations).length === 0) {
        return [];
    }
    return Object.values(locations).map(location => JSON.parse(location));
};

export const getLocationById = async (userId, locationId) => {
    const location = await redisClient.hget(getLocationKey(userId), locationId);
    return location ? JSON.parse(location) : null;
};

export const createLocation = async (userId, locationData) => {
    const { id, ...location } = locationData;
    const locationId = uuidv4();
    const newLocation = { ...location, id: locationId };

    await redisClient.hset(
        getLocationKey(userId),
        locationId,
        JSON.stringify(newLocation)
    );

    return newLocation;
};

export const createMultipleLocations = async (userId, locationsData) => {
    const pipeline = redisClient.pipeline();
    const newLocations = [];

    for (const locationData of locationsData) {
        const { id, ...location } = locationData;
        const locationId = uuidv4();
        const newLocation = { ...location, id: locationId };
        newLocations.push(newLocation);

        pipeline.hset(
            getLocationKey(userId),
            locationId,
            JSON.stringify(newLocation)
        );
    }

    await pipeline.exec();
    return newLocations;
};

export const updateLocation = async (userId, locationId, updates) => {
    const key = getLocationKey(userId);
    const existingLocationJSON = await redisClient.hget(key, locationId);

    if (!existingLocationJSON) {
        return null;
    }

    const existingLocation = JSON.parse(existingLocationJSON);
    const updatedLocation = { ...existingLocation, ...updates, id: locationId };

    await redisClient.hset(key, locationId, JSON.stringify(updatedLocation));
    return updatedLocation;
};

export const deleteLocation = async (userId, locationId) => {
    const key = getLocationKey(userId);
    return await redisClient.hdel(key, locationId);
};
