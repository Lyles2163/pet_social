const mysql = require('mysql2/promise');
const redis = require('redis');

const POST_NAME = 'localhost';
// MySQL 配置
const mysqlConfig = {
  host: POST_NAME,
  port: 3308,
  user: 'root',
  password: '',
  database: 'pet_social'
};

// 创建 MySQL 连接池
const mysqlPool = mysql.createPool(mysqlConfig);

// Redis 配置（新增 database: 0 指定使用第一个库）
const redisClient = redis.createClient({
  socket: {
    host: POST_NAME,
    port: 6379
  },
  password: '',
  database: 0 // 显式指定使用 0 号库（第一个库）
});

// 连接 Redis
redisClient.connect().then(() => {
  console.log('Redis 连接成功');
}).catch((err) => {
  console.error('Redis 连接失败:', err);
});

module.exports = {
  mysqlPool,
  redisClient
};