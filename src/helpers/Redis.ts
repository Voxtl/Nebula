import redis, { RedisClient } from 'redis';

let Redis:RedisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
});

module.exports = Redis;
export default Redis;