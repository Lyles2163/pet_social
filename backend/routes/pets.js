const express = require('express');
const router = express.Router();
const { mysqlPool, redisClient } = require('../dbConfig');

// 获取所有宠物信息（带缓存）
router.get('/pets', async (req, res) => {
    try {
        // 先尝试从 Redis 获取缓存
        const cachedData = await redisClient.get('pets:all');
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }

        // 缓存不存在时查询数据库
        const [results] = await mysqlPool.query(`
            SELECT p.*, u.username, u.phone ,u.avatar as owner_avatar
            FROM pets p
            JOIN users u ON p.user_id = u.id
        `);

        // 将结果存入 Redis 并设置 1 天过期时间
        await redisClient.setEx('pets:all', 86400, JSON.stringify(results));
        
        res.json(results);
    } catch (error) {
        console.error('获取宠物信息失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 新增：发布宠物信息接口
router.post('/pets', async (req, res) => {
    // 假设请求体包含 user_id, pet_name, pet_type, pet_age, pet_gender, description, pet_image
    const { user_id, pet_name, pet_type, pet_age, pet_gender, description, pet_image } = req.body;

    if (!user_id || !pet_name || !pet_type) {
        return res.status(400).json({ code: 400, message: '缺少必要信息：用户ID、宠物名称或宠物类型' });
    }

    try {
        // 插入宠物信息到数据库
        const [result] = await mysqlPool.query(
            'INSERT INTO pets (user_id, pet_name, pet_type, pet_age, pet_gender, description, pet_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, pet_name, pet_type, pet_age || null, pet_gender || null, description || null, pet_image || null]
        );

        if (result.affectedRows === 0) {
            throw new Error('宠物信息插入失败');
        }

        const petId = result.insertId;

        // 清理 Redis 缓存
        if (redisClient.isReady) {
            await redisClient.del('pets:all');
            console.log('宠物列表缓存已清理');
        } else {
            console.warn('Redis 客户端未准备就绪，跳过缓存清理。');
        }

        res.json({
            code: 200,
            message: '宠物信息发布成功',
            petId: petId,
        });

    } catch (error) {
        console.error('发布宠物信息失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});

module.exports = router;