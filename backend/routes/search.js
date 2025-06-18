const express = require('express');
const router = express.Router();
const { mysqlPool } = require('../dbConfig');

// 辅助函数：保存搜索记录并更新热搜计数
async function saveSearchRecord(userId, keyword, searchType) {
    if (!keyword) {
        // 如果没有关键词，则不保存
        return;
    }
    try {
        // 1. 保存用户搜索历史 (如果用户已登录)
        if (userId) {
            // 检查是否已有相同的最新记录，避免重复保存
            const [existing] = await mysqlPool.query(
                `SELECT id FROM search_records
                 WHERE user_id = ? AND keyword = ? AND search_type = ?
                 ORDER BY created_at DESC LIMIT 1`,
                [userId, keyword, searchType]
            );

            if (existing.length === 0) {
                 await mysqlPool.query(
                    `INSERT INTO search_records (user_id, keyword, search_type) VALUES (?, ?, ?)`,
                    [userId, keyword, searchType]
                );
            }
        }

        // 2. 更新 tags 表中的搜索计数 (用于热搜)
        await mysqlPool.query(
            `INSERT INTO tags (name, search_count)
             VALUES (?, 1)
             ON DUPLICATE KEY UPDATE search_count = search_count + 1`,
            [keyword]
        );

    } catch (error) {
        console.error('保存搜索记录或更新热搜计数失败:', error);
        // 不中断主搜索流程
    }
}

// 搜索宠物
router.get('/pets', async (req, res) => {
    const { keyword } = req.query;
    // ✅ 修改这里：从 req.session.user?.id 获取用户ID
    const userId = req.session.user?.id;

    if (!keyword) {
        return res.json([]); // 如果没有关键词，返回空数组
    }

    try {
        const [results] = await mysqlPool.query(
            `SELECT * FROM pets 
            WHERE name LIKE ? OR species LIKE ? OR description LIKE ?`,
            [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
        );

        // 保存搜索记录 (异步执行，不影响搜索结果返回)
        saveSearchRecord(userId, keyword, 'pet');

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '搜索失败' });
    }
});

// 搜索帖子
router.get('/posts', async (req, res) => {
    const { keyword } = req.query;
    // ✅ 修改这里：从 req.session.user?.id 获取用户ID
    const userId = req.session.user?.id;

     if (!keyword) {
        return res.json([]); // 如果没有关键词，返回空数组
    }

    try {
        const [results] = await mysqlPool.query(
            `SELECT posts.*, users.username 
            FROM posts 
            JOIN users ON posts.user_id = users.id
            WHERE title LIKE ? OR content LIKE ?`,
            [`%${keyword}%`, `%${keyword}%`]
        );

        // 保存搜索记录 (异步执行，不影响搜索结果返回)
        saveSearchRecord(userId, keyword, 'post');

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '搜索失败' });
    }
});

// 获取用户搜索历史
router.get('/history', async (req, res) => {
    // ✅ 修改这里：从 req.session.user?.id 获取用户ID
    const userId = req.session.user?.id;

    if (!userId) {
        // 如果用户未登录，返回空历史记录而不是错误
        return res.json([]);
    }

    try {
        // 获取最近的10条搜索记录
        const [history] = await mysqlPool.query(
            `SELECT keyword, search_type FROM search_records
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 10`,
            [userId]
        );
        res.json(history);
    } catch (error) {
        console.error('获取搜索历史失败:', error);
        res.status(500).json({ error: '获取搜索历史失败' });
    }
});

// ✅ 新增接口：获取热搜关键词
router.get('/trending', async (req, res) => {
    try {
        const [trending] = await mysqlPool.query(
            `SELECT name as keyword FROM tags
             ORDER BY search_count DESC
             LIMIT 6` // 获取前6个热搜关键词
        );
        res.json(trending);
    } catch (error) {
        console.error('获取热搜关键词失败:', error);
        res.status(500).json({ error: '获取热搜关键词失败' });
    }
});

// ✅ 新增接口：根据标签名称查询帖子
router.get('/posts/byTag', async (req, res) => {
    const { tagName } = req.query;
    const userId = req.session.user?.id; // 获取用户ID，用于保存搜索记录（可选）

    if (!tagName) {
        return res.json([]); // 如果没有标签名称，返回空数组
    }

    try {
        // 查询与该标签关联的帖子，并获取作者信息
        const [results] = await mysqlPool.query(
            `SELECT
                p.*,
                u.username
             FROM
                posts p
             JOIN
                users u ON p.user_id = u.id
             JOIN
                post_tags pt ON p.id = pt.post_id
             JOIN
                tags t ON pt.tag_id = t.id
             WHERE
                t.name = ?`,
            [tagName]
        );

        // 保存搜索记录 (异步执行，不影响搜索结果返回)
        // 这里我们将标签名称作为关键词保存，searchType 可以自定义，例如 'tag'
        saveSearchRecord(userId, tagName, 'tag');

        res.json(results);
    } catch (error) {
        console.error('根据标签查询帖子失败:', error);
        res.status(500).json({ error: '根据标签查询帖子失败' });
    }
});


module.exports = router;