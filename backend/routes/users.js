const express = require('express');
const router = express.Router();
const { mysqlPool, redisClient } = require('../dbConfig'); // 假设 dbConfig.js 在 backend 目录下
const bcrypt = require('bcrypt'); // 用于密码哈希


// 定义 Redis 缓存的 key 和过期时间 (TTL)
const USERS_LIST_CACHE_KEY = 'users:list';
const USERS_LIST_CACHE_TTL = 60 * 60; // 用户列表缓存 1 小时



// ✅ 修改中间件：验证 Session
const verifySession = (req, res, next) => {
    // 检查 Session 中是否存在用户 ID 或用户信息
    if (req.session && req.session.user && req.session.user.id) {
        // 将 Session 中的用户信息附加到请求对象上，以便后续路由使用
        req.user = req.session.user;
        next(); // Session 有效，继续处理请求
    } else {
        // Session 无效或不存在，返回未授权错误
        res.status(401).json({ code: 401, message: '未授权：请先登录' });
    }
};


// ✅ GET /api/cacheUsers - 获取所有用户列表（带 Redis 缓存）
// 对应前端 userStore.js 中的 fetchCacheUsers
router.get('/cacheUsers', async (req, res) => {
    try {
        // Step 1: 查询 Redis 缓存
        if (redisClient.isReady) { // 检查 Redis 客户端是否已连接
            const cachedUsers = await redisClient.get(USERS_LIST_CACHE_KEY);
            if (cachedUsers) {
                console.log('用户列表：缓存命中');
                return res.json({
                    code: 200,
                    message: '缓存命中',
                    data: JSON.parse(cachedUsers), // 从 Redis 读取的是字符串，需要解析
                });
            }
        } else {
             console.warn('Redis 客户端未准备就绪，跳过缓存检查。');
        }


        console.log('用户列表缓存未命中，正在查询 MySQL 数据库');

        // Step 2: 缓存未命中，查询 MySQL
        // 查询用户列表，只包含前端需要的字段 (id, username, avatar)
        const [rows] = await mysqlPool.query(
            'SELECT id, username, avatar FROM users'
        );

        // Step 3: 写入 Redis 缓存
        if (rows.length > 0 && redisClient.isReady) {
            await redisClient.setEx(USERS_LIST_CACHE_KEY, USERS_LIST_CACHE_TTL, JSON.stringify(rows)); // 将结果转为 JSON 字符串存入 Redis
            console.log('用户列表已缓存到 Redis');
        } else if (!redisClient.isReady) {
             console.warn('Redis 客户端未准备就绪，跳过缓存写入。');
        }


        res.json({
            code: 200,
            message: '用户列表获取成功',
            data: rows,
        });

    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误',
        });
    }
});

// ✅ POST /api/send-code - 发送验证码 (示例，实际需要短信服务)
// 对应前端 LoginView.vue 中的 sendCode
router.post('/send-code', async (req, res) => {
    const { phone } = req.body;
    // 实际应用中，这里会调用短信服务API发送验证码
    // 并将验证码存储在 Redis 中，设置过期时间
    console.log(`向手机号 ${phone} 发送验证码... (模拟)`);
    const mockCode = '123456'; // 模拟验证码，请勿在生产环境使用固定验证码
    if (redisClient.isReady) {
        // 将验证码存储在 Redis 中，例如 key 为 `verification:code:${phone}`，过期时间 5 分钟
        await redisClient.setEx(`verification:code:${phone}`, 60 * 5, mockCode);
        console.log(`模拟验证码 ${mockCode} 已存储到 Redis，key: verification:code:${phone}`);
    } else {
        console.warn('Redis 客户端未准备就绪，验证码将不会被缓存。');
        // 在没有 Redis 的情况下，可能需要其他方式存储或直接返回错误
    }

    res.json({ code: 200, message: '验证码发送成功 (模拟)' });
});

// ✅ POST /api/register - 用户注册（仅验证码注册）

router.post('/register', async (req, res) => {
    const { phone, code } = req.body;  // 只需要手机号和验证码

    // 1. 验证验证码
    if (redisClient.isReady) {
        const storedCode = await redisClient.get(`verification:code:${phone}`);
        if (!storedCode || storedCode !== code) {
            return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
        }
        await redisClient.del(`verification:code:${phone}`);
    } else {
         console.warn('Redis 客户端未准备就绪，跳过验证码检查。');
    }

    // 2. 检查手机号是否已注册
    try {
        const [existingUsers] = await mysqlPool.query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ code: 400, message: '手机号已注册' });
        }

        // 3. 注册用户（生成默认用户名，不设置密码）
        const defaultUsername = `用户${phone.slice(-4)}`; // 使用手机号后4位生成默认用户名
        const [result] = await mysqlPool.query(
            'INSERT INTO users (phone, username) VALUES (?, ?)',
            [phone, defaultUsername]
        );

        // 4. 注册成功，返回用户信息
        res.json({ 
            code: 200, 
            message: '注册成功', 
            data: { 
                id: result.insertId, 
                phone, 
                username: defaultUsername 
            } 
        });

    } catch (error) {
        console.error('用户注册失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});


// ✅ POST /api/login - 用户登录
// 对应前端 LoginView.vue 中的 submit (当 isRegister 为 false 时)
router.post('/login', async (req, res) => {
    const { phone, code, password } = req.body; // 假设登录可以使用验证码或密码

    console.log('Received login request:', req.body); // Add this line to log the request body

    try {
        const [users] = await mysqlPool.query('SELECT id, phone, username, password, avatar FROM users WHERE phone = ?', [phone]);
        const user = users[0];

        if (!user) {
            console.log('Login failed: Phone number not registered'); // Add log
            return res.status(400).json({ code: 400, message: '手机号未注册' });
        }

        let loginSuccess = false;
        if (code) { // 使用验证码登录
             console.log('Attempting login with code'); // Add log
             if (redisClient.isReady) {
                const storedCode = await redisClient.get(`verification:code:${phone}`);
                console.log(`Stored code for ${phone}: ${storedCode}, Received code: ${code}`); // Add log
                if (storedCode && storedCode === code) {
                    loginSuccess = true;
                    await redisClient.del(`verification:code:${phone}`); // 验证成功后删除验证码
                } else {
                     console.log('Login failed: Incorrect or expired verification code'); // Add log
                     return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
                }
             } else {
                 console.warn('Redis 客户端未准备就绪，无法验证验证码。');
                 return res.status(500).json({ code: 500, message: '服务器错误，无法验证验证码' });
             }

        } else if (password) { // 使用密码登录
            console.log('Attempting login with password'); // Add log
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                loginSuccess = true;
            } else {
                 console.log('Login failed: Incorrect password'); // Add log
                 return res.status(400).json({ code: 400, message: '密码错误' });
            }
        } else {
             console.log('Login failed: Neither code nor password provided'); // Add log
             return res.status(400).json({ code: 400, message: '请提供验证码或密码' });
        }


        if (loginSuccess) {
             // ✅ 登录成功，创建 Session 并存储用户信息
            req.session.user = {
                id: user.id,
                phone: user.phone,
                username: user.username,
                avatar: user.avatar
            };
            console.log(`用户 ${user.id} 登录成功，Session 已创建`);

            // 返回用户信息 (不再返回 token)
            res.json({
                code: 200,
                message: '登录成功',
                data: {
                    id: user.id,
                    phone: user.phone,
                    username: user.username,
                    avatar: user.avatar
                    // ✅ 移除 token 字段
                    // token: token // 将 token 返回给前端
                }
            });
        } else {
             // 理论上不会走到这里，因为上面已经处理了失败情况
             res.status(401).json({ code: 401, message: '登录失败' });
        }


    } catch (error) {
        console.error('用户登录失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});

// ✅ POST /api/logout - 用户退出登录
// 对应前端 userStore.js 中的 logout
// ✅ 使用 verifySession 中间件
router.post('/logout', verifySession, async (req, res) => {
    // ✅ 销毁 Session
    req.session.destroy((err) => {
        if (err) {
            console.error('销毁 Session 失败:', err);
            return res.status(500).json({ code: 500, message: '退出登录失败' });
        }
        console.log(`用户 ${req.user.id} 退出登录，Session 已销毁`);
        // 清除 Session cookie (可选，浏览器通常会自动处理)
        res.clearCookie('connect.sid'); // 'connect.sid' 是 express-session 默认的 cookie 名称
        res.json({ code: 200, message: '退出登录成功' });
    });
});


// ✅ GET /api/me - 获取当前登录用户信息
// 对应前端 userStore.js 中的 fetchUserInfo
// ✅ 使用 verifySession 中间件
router.get('/me', verifySession, async (req, res) => {
    try {
        // req.user 现在来自 Session
        const userId = req.user.id;

        // 可以从 Redis 缓存单个用户信息，或者直接从数据库查询
        // 这里为了简单，直接从数据库查询
        const [users] = await mysqlPool.query('SELECT id, phone, username, avatar FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            // 用户不存在，可能是 Session 中的用户 ID 无效
            // 理论上 verifySession 已经检查了 req.session.user，这里更多是数据一致性检查
            // 如果数据库中找不到用户，可以考虑销毁 Session
            req.session.destroy();
            return res.status(404).json({ code: 404, message: '用户未找到' });
        }

        res.json({ code: 200, message: '用户信息获取成功', data: user });

    } catch (error) {
        console.error('获取当前用户信息失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});

// ✅ GET /api/user/:userId - 获取指定用户信息 (此接口不需要登录，所以不使用 verifySession)
// 对应前端 ProfileView.vue 中的 fetchUser
router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        // 可以从 Redis 缓存单个用户信息，或者直接从数据库查询
        // 这里为了简单，直接从数据库查询
        const [users] = await mysqlPool.query('SELECT id, phone, username, avatar FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ code: 404, message: '用户未找到' });
        }

        res.json({ code: 200, message: '用户信息获取成功', data: user });

    } catch (error) {
        console.error('获取指定用户信息失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});

// ✅ PUT /api/user/:userId - 更新指定用户信息
// 对应前端 ProfileView.vue 中的 updateUser
// ✅ 使用 verifySession 中间件
router.put('/user/:userId', verifySession, async (req, res) => {
    const userId = req.params.userId;
    const { username, email, avatar, password } = req.body; // 允许更新的字段

    // 确保用户只能更新自己的信息
    // req.user 现在来自 Session
    if (req.user.id != userId) {
        return res.status(403).json({ code: 403, message: '禁止访问：无法更新其他用户的信息' });
    }

    try {
        let updateFields = [];
        let updateValues = [];

        if (username !== undefined) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (avatar !== undefined) {
            updateFields.push('avatar = ?');
            updateValues.push(avatar);
        }
        if (password !== undefined) {
             // 如果更新密码，需要先哈希
             const hashedPassword = await bcrypt.hash(password, 10);
             updateFields.push('password = ?');
             updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ code: 400, message: '没有提供要更新的字段' });
        }

        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(userId); // 将 userId 添加到值的数组末尾

        const [result] = await mysqlPool.query(sql, updateValues);

        if (result.affectedRows === 0) {
            // 虽然前面验证了 Session，但如果用户不存在或没有修改任何字段，affectedRows 可能为 0
            return res.status(404).json({ code: 404, message: '用户未找到或没有信息被修改' });
        }

        // ✅ 更新成功后，清除用户列表缓存
        if (redisClient.isReady) {
            await redisClient.del(USERS_LIST_CACHE_KEY);
            console.log(`用户 ${userId} 信息更新成功，已清除用户列表缓存`);
            // ✅ 可选：如果单个用户信息有缓存，也清除掉
            // await redisClient.del(`user:${userId}`);
        } else {
             console.warn('Redis 客户端未准备就绪，跳过缓存清除。');
        }

        // ✅ 更新 Session 中的用户信息 (如果更新了 username 或 avatar 等)
        // 重新从数据库查询最新用户信息并更新 Session 是一个更健壮的做法
        const [updatedUsers] = await mysqlPool.query('SELECT id, phone, username, avatar FROM users WHERE id = ?', [userId]);
        if (updatedUsers.length > 0) {
             req.session.user = {
                id: updatedUsers[0].id,
                phone: updatedUsers[0].phone,
                username: updatedUsers[0].username,
                avatar: updatedUsers[0].avatar
             };
             console.log(`Session 中的用户信息已更新`);
        }


        res.json({ code: 200, message: '用户信息更新成功' });

    } catch (error) {
        console.error('更新用户信息失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});


// 定义  POST /api/register - 用户注册
router.post('/register', async (req, res) => {
    const { phone, code } = req.body;  // 只需要手机号和验证码

    // 1. 验证验证码
    if (redisClient.isReady) {
        const storedCode = await redisClient.get(`verification:code:${phone}`);
        if (!storedCode || storedCode !== code) {
            return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
        }
        await redisClient.del(`verification:code:${phone}`);
    } else {
         console.warn('Redis 客户端未准备就绪，跳过验证码检查。');
    }

    // 2. 检查手机号是否已注册
    try {
        const [existingUsers] = await mysqlPool.query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ code: 400, message: '手机号已注册' });
        }

        // 3. 注册用户（生成默认用户名，不设置密码）
        const defaultUsername = `用户${phone.slice(-4)}`; // 使用手机号后4位生成默认用户名
        const [result] = await mysqlPool.query(
            'INSERT INTO users (phone, username) VALUES (?, ?)',
            [phone, defaultUsername]
        );

        // 4. 注册成功，返回用户信息
        res.json({ 
            code: 200, 
            message: '注册成功', 
            data: { 
                id: result.insertId, 
                phone, 
                username: defaultUsername 
            } 
        });

    } catch (error) {
        console.error('用户注册失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});


// ✅ POST /api/login - 用户登录

router.post('/login', async (req, res) => {
    const { phone, code, password } = req.body; // 假设登录可以使用验证码或密码

    console.log('Received login request:', req.body);

    try {
        const [users] = await mysqlPool.query('SELECT id, phone, username, password, avatar FROM users WHERE phone = ?', [phone]);
        const user = users[0];

        if (!user) {
            console.log('Login failed: Phone number not registered');
            return res.status(400).json({ code: 400, message: '手机号未注册' });
        }

        let loginSuccess = false;
        if (code) { // 使用验证码登录
             console.log('Attempting login with code');
             if (redisClient.isReady) {
                const storedCode = await redisClient.get(`verification:code:${phone}`);
                console.log(`Stored code for ${phone}: ${storedCode}, Received code: ${code}`);
                if (storedCode && storedCode === code) {
                    loginSuccess = true;
                    await redisClient.del(`verification:code:${phone}`); // 验证成功后删除验证码
                } else {
                     console.log('Login failed: Incorrect or expired verification code');
                     return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
                }
             } else {
                 console.warn('Redis 客户端未准备就绪，无法验证验证码。');
                 return res.status(500).json({ code: 500, message: '服务器错误，无法验证验证码' });
             }

        } else if (password) { // 使用密码登录
            console.log('Attempting login with password');
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                loginSuccess = true;
            } else {
                 console.log('Login failed: Incorrect password'); 
                 return res.status(400).json({ code: 400, message: '密码错误' });
            }
        } else {
             console.log('Login failed: Neither code nor password provided'); 
             return res.status(400).json({ code: 400, message: '请提供验证码或密码' });
        }


        if (loginSuccess) {
             // ✅ 登录成功，创建 Session 并存储用户信息
            req.session.user = {
                id: user.id,
                phone: user.phone,
                username: user.username,
                avatar: user.avatar
            };
            console.log(`用户 ${user.id} 登录成功，Session 已创建`);

            // 返回用户信息 (不再返回 token)
            res.json({
                code: 200,
                message: '登录成功',
                data: {
                    id: user.id,
                    phone: user.phone,
                    username: user.username,
                    avatar: user.avatar
                    // ✅ 移除 token 字段
                    // token: token // 将 token 返回给前端
                }
            });
        } else {
             // 理论上不会走到这里，因为上面已经处理了失败情况
             res.status(401).json({ code: 401, message: '登录失败' });
        }


    } catch (error) {
        console.error('用户登录失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});

// ✅ POST /api/logout - 用户退出登录
// 对应前端 userStore.js 中的 logout
// ✅ 使用 verifySession 中间件
router.post('/logout', verifySession, async (req, res) => {
    // ✅ 销毁 Session
    req.session.destroy((err) => {
        if (err) {
            console.error('销毁 Session 失败:', err);
            return res.status(500).json({ code: 500, message: '退出登录失败' });
        }
        console.log(`用户 ${req.user.id} 退出登录，Session 已销毁`);
        // 清除 Session cookie (可选，浏览器通常会自动处理)
        res.clearCookie('connect.sid'); // 'connect.sid' 是 express-session 默认的 cookie 名称
        res.json({ code: 200, message: '退出登录成功' });
    });
});


// ✅ GET /api/me - 获取当前登录用户信息
// 对应前端 userStore.js 中的 fetchUserInfo
// ✅ 使用 verifySession 中间件
router.get('/me', verifySession, async (req, res) => {
    try {
        // req.user 现在来自 Session
        const userId = req.user.id;

        // 可以从 Redis 缓存单个用户信息，或者直接从数据库查询
        // 这里为了简单，直接从数据库查询
        const [users] = await mysqlPool.query('SELECT id, phone, username, avatar FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            // 用户不存在，可能是 Session 中的用户 ID 无效
            // 理论上 verifySession 已经检查了 req.session.user，这里更多是数据一致性检查
            // 如果数据库中找不到用户，可以考虑销毁 Session
            req.session.destroy();
            return res.status(404).json({ code: 404, message: '用户未找到' });
        }

        res.json({ code: 200, message: '用户信息获取成功', data: user });

    } catch (error) {
        console.error('获取当前用户信息失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});

// ✅ GET /api/user/:userId - 获取指定用户信息 (此接口不需要登录，所以不使用 verifySession)
// 对应前端 ProfileView.vue 中的 fetchUser
router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        // 可以从 Redis 缓存单个用户信息，或者直接从数据库查询
        // 这里为了简单，直接从数据库查询
        const [users] = await mysqlPool.query('SELECT id, phone, username, avatar FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ code: 404, message: '用户未找到' });
        }

        res.json({ code: 200, message: '用户信息获取成功', data: user });

    } catch (error) {
        console.error('获取指定用户信息失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});

// ✅ PUT /api/user/:userId - 更新指定用户信息
// 对应前端 ProfileView.vue 中的 updateUser
// ✅ 使用 verifySession 中间件
router.put('/user/:userId', verifySession, async (req, res) => {
    const userId = req.params.userId;
    const { username, email, avatar, password } = req.body; // 允许更新的字段

    // 确保用户只能更新自己的信息
    // req.user 现在来自 Session
    if (req.user.id != userId) {
        return res.status(403).json({ code: 403, message: '禁止访问：无法更新其他用户的信息' });
    }

    try {
        let updateFields = [];
        let updateValues = [];

        if (username !== undefined) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (avatar !== undefined) {
            updateFields.push('avatar = ?');
            updateValues.push(avatar);
        }
        if (password !== undefined) {
             // 如果更新密码，需要先哈希
             const hashedPassword = await bcrypt.hash(password, 10);
             updateFields.push('password = ?');
             updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ code: 400, message: '没有提供要更新的字段' });
        }

        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(userId); // 将 userId 添加到值的数组末尾

        const [result] = await mysqlPool.query(sql, updateValues);

        if (result.affectedRows === 0) {
            // 虽然前面验证了 Session，但如果用户不存在或没有修改任何字段，affectedRows 可能为 0
            return res.status(404).json({ code: 404, message: '用户未找到或没有信息被修改' });
        }

        // ✅ 更新成功后，清除用户列表缓存
        if (redisClient.isReady) {
            await redisClient.del(USERS_LIST_CACHE_KEY);
            console.log(`用户 ${userId} 信息更新成功，已清除用户列表缓存`);
            // ✅ 可选：如果单个用户信息有缓存，也清除掉
            // await redisClient.del(`user:${userId}`);
        } else {
             console.warn('Redis 客户端未准备就绪，跳过缓存清除。');
        }

        // ✅ 更新 Session 中的用户信息 (如果更新了 username 或 avatar 等)
        // 重新从数据库查询最新用户信息并更新 Session 是一个更健壮的做法
        const [updatedUsers] = await mysqlPool.query('SELECT id, phone, username, avatar FROM users WHERE id = ?', [userId]);
        if (updatedUsers.length > 0) {
             req.session.user = {
                id: updatedUsers[0].id,
                phone: updatedUsers[0].phone,
                username: updatedUsers[0].username,
                avatar: updatedUsers[0].avatar
             };
             console.log(`Session 中的用户信息已更新`);
        }


        res.json({ code: 200, message: '用户信息更新成功' });

    } catch (error) {
        console.error('更新用户信息失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});


// 定义  POST /api/register - 用户注册
router.post('/register', async (req, res) => {
    const { phone, code } = req.body;  // 只需要手机号和验证码

    // 1. 验证验证码
    if (redisClient.isReady) {
        const storedCode = await redisClient.get(`verification:code:${phone}`);
        if (!storedCode || storedCode !== code) {
            return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
        }
        await redisClient.del(`verification:code:${phone}`);
    } else {
         console.warn('Redis 客户端未准备就绪，跳过验证码检查。');
    }

    // 2. 检查手机号是否已注册
    try {
        const [existingUsers] = await mysqlPool.query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ code: 400, message: '手机号已注册' });
        }

        // 3. 注册用户（生成默认用户名，不设置密码）
        const defaultUsername = `用户${phone.slice(-4)}`; // 使用手机号后4位生成默认用户名
        const [result] = await mysqlPool.query(
            'INSERT INTO users (phone, username) VALUES (?, ?)',
            [phone, defaultUsername]
        );

        // 4. 注册成功，返回用户信息
        res.json({ 
            code: 200, 
            message: '注册成功', 
            data: { 
                id: result.insertId, 
                phone, 
                username: defaultUsername 
            } 
        });

    } catch (error) {
        console.error('用户注册失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});


// ✅ POST /api/login - 用户登录

router.post('/login', async (req, res) => {
    const { phone, code, password } = req.body; // 假设登录可以使用验证码或密码

    console.log('Received login request:', req.body);

    try {
        const [users] = await mysqlPool.query('SELECT id, phone, username, password, avatar FROM users WHERE phone = ?', [phone]);
        const user = users[0];

        if (!user) {
            console.log('Login failed: Phone number not registered');
            return res.status(400).json({ code: 400, message: '手机号未注册' });
        }

        let loginSuccess = false;
        if (code) { // 使用验证码登录
             console.log('Attempting login with code');
             if (redisClient.isReady) {
                const storedCode = await redisClient.get(`verification:code:${phone}`);
                console.log(`Stored code for ${phone}: ${storedCode}, Received code: ${code}`);
                if (storedCode && storedCode === code) {
                    loginSuccess = true;
                    await redisClient.del(`verification:code:${phone}`); // 验证成功后删除验证码
                } else {
                     console.log('Login failed: Incorrect or expired verification code');
                     return res.status(400).json({ code: 400, message: '验证码错误或已过期' });
                }
             } else {
                 console.warn('Redis 客户端未准备就绪，无法验证验证码。');
                 return res.status(500).json({ code: 500, message: '服务器错误，无法验证验证码' });
             }

        } else if (password) { // 使用密码登录
            console.log('Attempting login with password');
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                loginSuccess = true;
            } else {
                 console.log('Login failed: Incorrect password'); 
                 return res.status(400).json({ code: 400, message: '密码错误' });
            }
        } else {
             console.log('Login failed: Neither code nor password provided'); 
             return res.status(400).json({ code: 400, message: '请提供验证码或密码' });
        }


        if (loginSuccess) {
             // ✅ 登录成功，创建 Session 并存储用户信息
            req.session.user = {
                id: user.id,
                phone: user.phone,
                username: user.username,
                avatar: user.avatar
            };
            console.log(`用户 ${user.id} 登录成功，Session 已创建`);

            // 返回用户信息 (不再返回 token)
            res.json({
                code: 200,
                message: '登录成功',
                data: {
                    id: user.id,
                    phone: user.phone,
                    username: user.username,
                    avatar: user.avatar
                    // ✅ 移除 token 字段
                    // token: token // 将 token 返回给前端
                }
            });
        } else {
             // 理论上不会走到这里，因为上面已经处理了失败情况
             res.status(401).json({ code: 401, message: '登录失败' });
        }


    } catch (error) {
        console.error('用户登录失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});

// ✅ POST /api/logout - 用户退出登录
// 对应前端 userStore.js 中的 logout
// ✅ 使用 verifySession 中间件
router.post('/logout', verifySession, async (req, res) => {
    // ✅ 销毁 Session
    req.session.destroy((err) => {
        if (err) {
            console.error('销毁 Session 失败:', err);
            return res.status(500).json({ code: 500, message: '退出登录失败' });
        }
        console.log(`用户 ${req.user.id} 退出登录，Session 已销毁`);
        // 清除 Session cookie (可选，浏览器通常会自动处理)
        res.clearCookie('connect.sid'); // 'connect.sid' 是 express-session 默认的 cookie 名称
        res.json({ code: 200, message: '退出登录成功' });
    });
});


// ✅ GET /api/me - 获取当前登录用户信息
// 对应前端 userStore.js 中的 fetchUserInfo
// ✅ 使用 verifySession 中间件
router.get('/me', verifySession, async (req, res) => {
    try {
        // req.user 现在来自 Session
        const userId = req.user.id;

        // 可以从 Redis 缓存单个用户信息，或者直接从数据库查询
        // 这里为了简单，直接从数据库查询
        const [users] = await mysqlPool.query('SELECT id, phone, username, avatar FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            // 用户不存在，可能是 Session 中的用户 ID 无效
            // 理论上 verifySession 已经检查了 req.session.user，这里更多是数据一致性检查
            // 如果数据库中找不到用户，可以考虑销毁 Session
            req.session.destroy();
            return res.status(404).json({ code: 404, message: '用户未找到' });
        }

        res.json({ code: 200, message: '用户信息获取成功', data: user });

    } catch (error) {
        console.error('获取当前用户信息失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});

// ✅ GET /api/user/:userId - 获取指定用户信息 (此接口不需要登录，所以不使用 verifySession)
// 对应前端 ProfileView.vue 中的 fetchUser
router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        // 可以从 Redis 缓存单个用户信息，或者直接从数据库查询
        // 这里为了简单，直接从数据库查询
        const [users] = await mysqlPool.query('SELECT id, phone, username, avatar FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ code: 404, message: '用户未找到' });
        }

        res.json({ code: 200, message: '用户信息获取成功', data: user });

    } catch (error) {
        console.error('获取指定用户信息失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});

// ✅ PUT /api/user/:userId - 更新指定用户信息
// 对应前端 ProfileView.vue 中的 updateUser
// ✅ 使用 verifySession 中间件
router.put('/user/:userId', verifySession, async (req, res) => {
    const userId = req.params.userId;
    const { username, email, avatar, password } = req.body; // 允许更新的字段

    // 确保用户只能更新自己的信息
    // req.user 现在来自 Session
    if (req.user.id != userId) {
        return res.status(403).json({ code: 403, message: '禁止访问：无法更新其他用户的信息' });
    }

    try {
        let updateFields = [];
        let updateValues = [];

        if (username !== undefined) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (avatar !== undefined) {
            updateFields.push('avatar = ?');
            updateValues.push(avatar);
        }
        if (password !== undefined) {
             // 如果更新密码，需要先哈希
             const hashedPassword = await bcrypt.hash(password, 10);
             updateFields.push('password = ?');
             updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ code: 400, message: '没有提供要更新的字段' });
        }

        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(userId); // 将 userId 添加到值的数组末尾

        const [result] = await mysqlPool.query(sql, updateValues);

        if (result.affectedRows === 0) {
            // 虽然前面验证了 Session，但如果用户不存在或没有修改任何字段，affectedRows 可能为 0
            return res.status(404).json({ code: 404, message: '用户未找到或没有信息被修改' });
        }

        // ✅ 更新成功后，清除用户列表缓存
        if (redisClient.isReady) {
            await redisClient.del(USERS_LIST_CACHE_KEY);
            console.log(`用户 ${userId} 信息更新成功，已清除用户列表缓存`);
            // ✅ 可选：如果单个用户信息有缓存，也清除掉
            // await redisClient.del(`user:${userId}`);
        } else {
             console.warn('Redis 客户端未准备就绪，跳过缓存清除。');
        }

        // ✅ 更新 Session 中的用户信息 (如果更新了 username 或 avatar 等)
        // 重新从数据库查询最新用户信息并更新 Session 是一个更健壮的做法
        const [updatedUsers] = await mysqlPool.query('SELECT id, phone, username, avatar FROM users WHERE id = ?', [userId]);
        if (updatedUsers.length > 0) {
             req.session.user = {
                id: updatedUsers[0].id,
                phone: updatedUsers[0].phone,
                username: updatedUsers[0].username,
                avatar: updatedUsers[0].avatar
             };
             console.log(`Session 中的用户信息已更新`);
        }


        res.json({ code: 200, message: '用户信息更新成功' });

    } catch (error) {
        console.error('更新用户信息失败:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
});


// 导出路由模块
module.exports = router;