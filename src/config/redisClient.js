import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';

let redisClient;

if (process.env.NODE_ENV === 'test') {
  redisClient = new RedisMock();
} else {
    // Load from environment variables
    const REDIS_HOST = process.env.REDIS_HOST;
    const REDIS_PORT = process.env.REDIS_PORT;
    const REDIS_USERNAME = process.env.REDIS_USERNAME || 'default';
    const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

  if (!REDIS_HOST || !REDIS_PORT || !REDIS_PASSWORD) {
    console.error('❌ Missing Redis configuration in environment variables.');
    process.exit(1);
  }

  redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD
    // ❌ No TLS here because port 14050 is plain TCP
  });

  redisClient.on('ready', () => {
    console.log('✅ Connected to Redis and ready to use');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });
}

export default redisClient;
