const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { mysqlPool } = require('../dbConfig');
const fs = require('fs');

// 创建存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/storeImages'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 文件上传接口
// 添加认证中间件
// 修改认证中间件为标准的express中间件格式
const authMiddleware = (req, res, next) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }
  req.user = req.session.user;
  next();
};

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(400).json({ code: 400, message: '缺少用户ID参数' });
    }

    // 创建存储目录
    const uploadDir = path.join(__dirname, '../../public/storeImages');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (!req.file) {
      return res.status(400).json({ code: 400, message: '未选择文件' });
    }

    const filePath = `/storeImages/${req.file.filename}`;
    
    // 将路径保存到数据库
    // 更新数据库语句
    const [result] = await mysqlPool.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [filePath, req.body.userId]
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;