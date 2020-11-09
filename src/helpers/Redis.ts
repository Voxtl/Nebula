import redis, { RedisClient } from 'redis';

export const Redis: RedisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
});