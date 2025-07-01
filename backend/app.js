const express = require('express');
const cors = require('cors'); // 引入 cors 中间件
const app = express();
const port = 3000;

// 引入数据库和 Redis 配置
const { mysqlPool, redisClient } = require('./dbConfig');

// 引入路由文件
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const petsRouter = require('./routes/pets');  // <-- 新增这行
const searchRouter = require('./routes/search');
const uploadRouter = require('./routes/upload'); // 新增

// 引入 Session 和 connect-redis
const session = require('express-session');
const { RedisStore } = require('connect-redis');

// 配置中间件
app.use(cors({
    origin: ['http://localhost',
             'http://localhost:5173',
             'https://gorgeous-thrush-sincerely.ngrok-free.app',
             'http://222.186.56.249:33546'], 
    credentials: true // 允许发送 cookie
})); 

// app.use(cors({
//     origin: function(origin, callback) {
//         // 允许所有源（包括所有端口）的请求
//         callback(null, true);
//     },
//     credentials: true // 允许发送 cookie
// }));
app.use(express.json()); // 解析 JSON 格式的请求体

// 配置 Session 中间件
// 确保session配置在路由挂载之前
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: '计应2305李阳_20250405_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// 之后挂载路由
app.use('/api', usersRouter);
app.use('/api', postsRouter);
app.use('/api', petsRouter);
app.use('/api/search', searchRouter);
app.use('/api', uploadRouter); // 新增

// 定义一个简单的根路由，用于测试服务器是否运行
app.get('/', (req, res) => {
  res.send('服务器已经启动成功!');
});

// 处理未找到的路由 (404 错误)
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 启动服务器 + 检查数据库和 Redis 连接状态
async function startServer() {
  try {
    // 等待 Redis 连接就绪
    if (!redisClient.isReady) {
      console.log('等待 Redis 连接...');
      await new Promise(resolve => redisClient.on('ready', resolve));
      console.log('Redis 客户端现在已准备就绪');
    }

    // 启动服务器
    const server = app.listen(port,'0.0.0.0', () => {
      console.log(`node服务器启动成功`);
    });

    // 检查 MySQL 数据库连接
    mysqlPool.getConnection((err, connection) => {
      if (err) {
        console.error('MySQL 连接失败:', err);
      } else {
        console.log('MySQL 连接成功.');
        connection.release(); // 释放连接
      }
    });

  } catch (error) {
    console.error('启动服务器时出错:', error);
    process.exit(1); // 终止进程
  }
}

startServer();