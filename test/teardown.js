import redisClient from '../src/config/redisClient.js';

export default async () => {
  await new Promise(resolve => global.server.close(resolve));
  await redisClient.quit();
};
