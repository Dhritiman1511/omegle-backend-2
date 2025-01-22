const Redis = require('ioredis');

// Create a Redis client using the connection string from environment variables
const redisClient = new Redis(process.env.REDIS_URL);

// Handle connection events
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redisClient;
