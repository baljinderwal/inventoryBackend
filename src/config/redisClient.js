import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Load from environment variables
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_USERNAME = process.env.REDIS_USERNAME || 'default';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

if (!REDIS_HOST || !REDIS_PORT || !REDIS_PASSWORD) {
  console.error('❌ Missing Redis configuration in environment variables');
  process.exit(1);
}

// Create Redis client
const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  username: REDIS_USERNAME, // required for Redis Cloud
  password: REDIS_PASSWORD,
  tls: {} // Redis Cloud often requires TLS, remove if local
});

redisClient.on('ready', () => {
  console.log('✅ Connected to Redis and ready to use');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redisClient;
