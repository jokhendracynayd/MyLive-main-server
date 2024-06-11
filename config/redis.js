var Redis = require('ioredis');

let redisClient = null;
const connectRedis = async () => {
  redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
  });

  // Event: When connected to Redis
  redisClient.on('connect', () => {
      console.log('🍁Redis connected !! Redis HOST',redisClient.options.host);
  });

  // Event: When an error occurs
  redisClient.on('error', (err) => {
      console.error('🪭Redis Error:', err);
      process.exit(1);
  });
}

connectRedis();
module.exports=redisClient