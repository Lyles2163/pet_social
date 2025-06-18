const express = require('express');
const router = express.Router();
const { mysqlPool, redisClient } = require('../dbConfig'); // 引入数据库和 Redis 客户端

const POST_CACHE_TTL = 86400; // 缓存过期时间，1天（秒）
// ✅ 修改：帖子列表的 Redis Key 包含排序信息
const POSTS_LIST_CACHE_KEY_PREFIX = 'posts:list'; // 帖子列表缓存 Key 前缀
const TAG_CACHE_TTL = 86400 ; // 标签缓存过期时间，1天

// ✅ 修改：获取所有宠物信息列表（带缓存逻辑，支持排序）
router.get('/posts', async (req, res) => {
  try {
    // ✅ 新增：获取排序参数，默认为按创建时间倒序
    const sortBy = req.query.sortBy || 'created_at'; // 默认按创建时间
    const sortOrder = req.query.sortOrder || 'DESC'; // 默认倒序

    // 校验排序字段是否合法，防止 SQL 注入
    const validSortBy = ['created_at', 'like_count'];
    const validSortOrder = ['ASC', 'DESC'];

    if (!validSortBy.includes(sortBy) || !validSortOrder.includes(sortOrder.toUpperCase())) {
        return res.status(400).json({
            code: 400,
            message: '无效的排序参数',
        });
    }

    // ✅ 修改：根据排序参数生成 Redis Key
    const postsListCacheKey = `${POSTS_LIST_CACHE_KEY_PREFIX}:${sortBy}:${sortOrder.toUpperCase()}`;

    // Step 1: 查询 Redis 缓存
    if (redisClient.isReady) { // 检查 Redis 客户端是否已连接
        const cachedList = await redisClient.get(postsListCacheKey);
        if (cachedList) {
          console.log(`帖子列表 (${sortBy} ${sortOrder})：缓存命中`);
          return res.json({
            code: 200,
            message: '缓存命中',
            data: JSON.parse(cachedList), // 从 Redis 读取的是字符串，需要解析
          });
        }
    } else {
        console.warn('Redis 客户端未准备就绪，跳过缓存检查。');
    }

    console.log(`帖子列表 (${sortBy} ${sortOrder}) 缓存未命中，正在查询 MySQL 数据库`);

    // Step 2: 缓存未命中，查询 MySQL
    // ✅ 修改：联表查询 users 表，并选择 u.username 和 u.avatar，并根据参数排序
    const [rows] = await mysqlPool.query(
      `SELECT p.id, p.user_id, p.title, p.content, p.cover_image, p.like_count, p.comment_count, p.created_at, u.username, u.avatar FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.${sortBy} ${sortOrder}`
    );

    // Step 3: 写入 Redis 缓存
    if (rows.length > 0 && redisClient.isReady) {
        await redisClient.setEx(postsListCacheKey, POST_CACHE_TTL, JSON.stringify(rows)); // 将结果转为 JSON 字符串存入 Redis
        console.log(`Posts list (${sortBy} ${sortOrder}) cached in Redis`);
    } else if (!redisClient.isReady) {
        console.warn('Redis 客户端未准备就绪，跳过缓存写入。');
    }

    res.json({
      code: 200,
      message: '帖子列表获取成功',
      data: rows,
    });

  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});


// ✅ 新增：根据ID获取宠物信息（带缓存逻辑）
router.get('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const redisKey = `post:${postId}`; // 单个帖子的缓存 Key

  try {
    // Step 1: 查询 Redis 缓存
    const cachedPost = await redisClient.get(redisKey);
    if (cachedPost) {
      console.log(`Cache hit for post:${postId}`);
      return res.json({
        code: 200,
        message: '缓存命中',
        data: JSON.parse(cachedPost), // 从 Redis 读取的是字符串，需要解析
      });
    }

    console.log(`Cache miss for post:${postId}, querying MySQL`);

    // Step 2: 缓存未命中，查询 MySQL
    const [rows] = await mysqlPool.query(
      'SELECT p.id, p.user_id, p.title, p.content, p.cover_image, p.like_count, p.comment_count, p.created_at, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
      [postId]
    );

    // Step 3: 写入 Redis 缓存
    if (rows.length > 0) {
        await redisClient.setEx(redisKey, POST_CACHE_TTL, JSON.stringify(rows)); // 将结果转为 JSON 字符串存入 Redis
        console.log(`Post:${postId} cached in Redis`);
    }

    res.json({
      code: 200,
      message: '宠物信息获取成功',
      data: rows,
    });
  } catch (error) {
    console.error('获取宠物信息失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// ✅ 新增：获取帖子评论列表（带缓存逻辑）
router.get('/posts/:id/comments', async (req, res) => {
  const postId = req.params.id;
  const redisKey = `post:${postId}:comments`; // 评论列表的 Redis Key

  try {
    // Step 1: 查询 Redis 缓存
    const cachedComments = await redisClient.get(redisKey);
    if (cachedComments) {
      console.log(`Cache hit for comments:${postId}`);
      return res.json({
        code: 200,
        message: '评论缓存命中',
        data: JSON.parse(cachedComments), // 从 Redis 读取的是字符串，需要解析
      });
    }

    console.log(`Cache miss for comments:${postId}, querying MySQL`);

    // Step 2: 缓存未命中，查询 MySQL
    const [rows] = await mysqlPool.query(
      'SELECT c.id, c.post_id, c.user_id, c.content, c.created_at, u.username, u.avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC', // ✅ 修改：添加 u.avatar
      [postId]
    );

    // Step 3: 写入 Redis 缓存
    if (rows.length > 0) {
        await redisClient.setEx(redisKey, POST_CACHE_TTL, JSON.stringify(rows)); // 将结果转为 JSON 字符串存入 Redis
        console.log(`Comments for post:${postId} cached in Redis`);
    }

    res.json({
      code: 200,
      message: '评论列表获取成功',
      data: rows,
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// ✅ 新增：添加评论
router.post('/posts/:id/comments', async (req, res) => {
  const postId = req.params.id;
  const { userId, content } = req.body; // 假设请求体包含 userId 和 content

  if (!userId || !content) {
    return res.status(400).json({ code: 400, message: '缺少用户ID或评论内容' });
  }

  const commentsRedisKey = `post:${postId}:comments`; // 评论列表缓存 Key
  const postRedisKey = `post:${postId}`; // 单个帖子缓存 Key
  const listRedisKey = POSTS_LIST_CACHE_KEY; // 列表缓存 Key


  try {
    // Step 1: 插入评论到数据库
    const [result] = await mysqlPool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );

    if (result.affectedRows === 0) {
       throw new Error('评论插入失败');
    }

    // Step 2: 更新帖子的评论计数
    await mysqlPool.query(
      'UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?',
      [postId]
    );

    // Step 3: 清理相关缓存
    await redisClient.del(commentsRedisKey); // 清理评论列表缓存
    await redisClient.del(postRedisKey); // 清理单个帖子缓存 (更新评论计数)
    await redisClient.del(listRedisKey); // 清理列表缓存 (更新评论计数)

    res.json({
      code: 200,
      message: '评论添加成功',
      commentId: result.insertId,
    });
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// ✅ 新增：点赞帖子
router.post('/posts/:id/like', async (req, res) => {
  const postId = req.params.id;
  // 假设点赞不需要用户ID，只是简单计数
  // 如果需要记录哪个用户点了赞，需要额外的表和逻辑

  const postRedisKey = `post:${postId}`; // 单个帖子缓存 Key
  // ✅ 修改：需要清理所有可能的列表缓存 Key
  const listRedisKeysToInvalidate = [
      `${POSTS_LIST_CACHE_KEY_PREFIX}:created_at:DESC`,
      `${POSTS_LIST_CACHE_KEY_PREFIX}:like_count:DESC`,
      // 如果有其他排序方式，也需要在这里添加对应的 Key
  ];


  try {
    // Step 1: 更新帖子的点赞计数
    const [result] = await mysqlPool.query(
      'UPDATE posts SET like_count = like_count + 1 WHERE id = ?',
      [postId]
    );

    if (result.affectedRows === 0) {
       return res.status(404).json({ code: 404, message: '帖子不存在' });
    }

    // Step 2: 清理相关缓存
    if (redisClient.isReady) {
        await redisClient.del(postRedisKey); // 清理单个帖子缓存 (更新点赞计数)
        // ✅ 修改：清理所有列表缓存
        await redisClient.del(listRedisKeysToInvalidate);
        console.log(`Cache invalidated for post:${postId} and list caches`);
    } else {
        console.warn('Redis 客户端未准备就绪，跳过缓存清理。');
    }


    res.json({
      code: 200,
      message: '点赞成功',
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});


// ✅ 修改：更新宠物信息并清理缓存 (清理所有列表缓存)
router.put('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const { title, content, cover_image, like_count, comment_count } = req.body; // 允许更新的字段

  const postRedisKey = `post:${postId}`; // 单个帖子的缓存 Key
  // ✅ 修改：需要清理所有可能的列表缓存 Key
  const listRedisKeysToInvalidate = [
      `${POSTS_LIST_CACHE_KEY_PREFIX}:created_at:DESC`,
      `${POSTS_LIST_CACHE_KEY_PREFIX}:like_count:DESC`,
      // 如果有其他排序方式，也需要在这里添加对应的 Key
  ];


  // 校验是否有更新内容
  if (!title && !content && !cover_image && like_count === undefined && comment_count === undefined) {
     return res.status(400).json({ code: 400, message: '请至少提供一个要更新的字段' });
  }

  try {
    // 构建 SQL 和参数
    const fields = [];
    const values = [];

    if (title !== undefined) { // 允许更新为空字符串
      fields.push('title = ?');
      values.push(title);
    }
    if (content !== undefined) { // 允许更新为空字符串
      fields.push('content = ?');
      values.push(content);
    }
    if (cover_image !== undefined) { // 允许更新为 null 或空字符串
      fields.push('cover_image = ?');
      values.push(cover_image === '' ? null : cover_image); // 如果传入空字符串，存为 null
    }
    if (like_count !== undefined) { // 允许更新为 0
      fields.push('like_count = ?');
      values.push(like_count);
    }
    if (comment_count !== undefined) { // 允许更新为 0
      fields.push('comment_count = ?');
      values.push(comment_count);
    }

    values.push(postId); // 最后一个参数是 WHERE id = ?

    const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;

    const [result] = await mysqlPool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '宠物信息不存在或没有内容更新' });
    }

    // Step 2: 删除 Redis 缓存 (缓存失效)
    if (redisClient.isReady) {
        await redisClient.del(postRedisKey); // 删除单个帖子的缓存
        // ✅ 修改：删除所有帖子列表的缓存
        await redisClient.del(listRedisKeysToInvalidate);
        console.log(`Cache invalidated for post:${postId} and list caches`);
    } else {
        console.warn('Redis 客户端未准备就绪，跳过缓存清理。');
    }


    // 可选：返回更新后的数据（需要重新查询或从请求体构建）
    // 为了简单，这里只返回成功消息
    res.json({
      code: 200,
      message: '宠物信息更新成功，缓存已清除',
    });
  } catch (error) {
    console.error('更新宠物信息失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});


// ✅ 新增：发布帖子接口（包含标签处理，清理所有列表缓存）
router.post('/posts', async (req, res) => {
  // 假设请求体包含 user_id, title, content, cover_image, tags (string array)
  const { user_id, title, content, cover_image, tags } = req.body;

  if (!user_id || !title || !content) {
    return res.status(400).json({ code: 400, message: '缺少用户ID、标题或内容' });
  }

  const tagIds = [];
  const newTagNames = []; // 用于批量插入新标签

  // ✅ 新增：需要清理所有可能的列表缓存 Key
  const listRedisKeysToInvalidate = [
      `${POSTS_LIST_CACHE_KEY_PREFIX}:created_at:DESC`,
      `${POSTS_LIST_CACHE_KEY_PREFIX}:like_count:DESC`,
      // 如果有其他排序方式，也需要在这里添加对应的 Key
  ];


  try {
    // Step 1: 处理标签
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagRedisKey = `tag:name:${tagName}`;
        let tagId = null;

        // 1.1 检查 Redis 缓存
        if (redisClient.isReady) {
            const cachedTagId = await redisClient.get(tagRedisKey);
            if (cachedTagId) {
              tagId = parseInt(cachedTagId, 10);
              console.log(`Tag cache hit for ${tagName}: ${tagId}`);
              tagIds.push(tagId);
              continue; // 找到缓存，处理下一个标签
            }
        } else {
             console.warn('Redis 客户端未准备就绪，跳过标签缓存检查。');
        }


        // 1.2 Redis 未命中，查询数据库
        console.log(`Tag cache miss for ${tagName}, querying MySQL`);
        const [tagRows] = await mysqlPool.query('SELECT id FROM tags WHERE name = ?', [tagName]);

        if (tagRows.length > 0) {
          // 标签已存在
          tagId = tagRows[0].id;
          tagIds.push(tagId);
          // 缓存到 Redis
          if (redisClient.isReady) {
             await redisClient.setEx(tagRedisKey, TAG_CACHE_TTL, tagId.toString());
             console.log(`Tag ${tagName}:${tagId} cached in Redis`);
          }
        } else {
          // 标签不存在，标记为新标签待插入
          newTagNames.push(tagName);
        }
      }

      // 1.3 批量插入新标签并获取ID
      if (newTagNames.length > 0) {
          const insertValues = newTagNames.map(name => [name]);
          const [insertResult] = await mysqlPool.query('INSERT INTO tags (name) VALUES ?', [insertValues]);

          // 获取新插入标签的ID，并缓存到 Redis
          const firstNewId = insertResult.insertId;
          for (let i = 0; i < newTagNames.length; i++) {
              const newTagId = firstNewId + i;
              tagIds.push(newTagId);
              const newTagName = newTagNames[i];
              const newTagRedisKey = `tag:name:${newTagName}`;
              if (redisClient.isReady) {
                 await redisClient.setEx(newTagRedisKey, TAG_CACHE_TTL, newTagId.toString());
                 console.log(`New tag ${newTagName}:${newTagId} inserted and cached`);
              }
          }
      }
    }

    // Step 2: 插入帖子到数据库
    const [postResult] = await mysqlPool.query(
      'INSERT INTO posts (user_id, title, content, cover_image) VALUES (?, ?, ?, ?)',
      [user_id, title, content, cover_image || null] // cover_image 允许为 null
    );

    if (postResult.affectedRows === 0) {
       throw new Error('帖子插入失败');
    }

    const postId = postResult.insertId;

    // Step 3: 插入 post_tags 关联
    if (tagIds.length > 0) {
        const postTagValues = tagIds.map(tagId => [postId, tagId]);
        await mysqlPool.query('INSERT INTO post_tags (post_id, tag_id) VALUES ?', [postTagValues]);
        console.log(`Post ${postId} associated with tags: ${tagIds.join(',')}`);
    }

    // Step 4: 清理帖子列表缓存
    if (redisClient.isReady) {
        // ✅ 修改：清理所有列表缓存
        await redisClient.del(listRedisKeysToInvalidate);
        console.log(`Invalidated list caches: ${listRedisKeysToInvalidate.join(', ')}`);
    } else {
        console.warn('Redis 客户端未准备就绪，跳过列表缓存清理。');
    }


    res.json({
      code: 200,
      message: '帖子发布成功',
      postId: postId,
    });

  } catch (error) {
    console.error('发布帖子失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});


module.exports = router;