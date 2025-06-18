
# 宠物社交平台数据库开发日志

## 项目概述

本项目是一个宠物社交平台的数据库设计，采用 MySQL 8.0.31 作为数据库管理系统。数据库名称为 `pet_social`，设计了完整的用户社交、宠物管理、内容发布、搜索记录等功能模块的数据存储方案。

## 数据库架构设计

### 核心技术选型

- **数据库**: MySQL 8.0.31
- **字符集**: utf8mb4 (支持完整的UTF-8字符集，包括emoji)
- **存储引擎**: InnoDB (支持事务、外键约束)
- **排序规则**: utf8mb4_0900_ai_ci (不区分大小写，支持AI排序)

### 数据表结构设计

#### 1. 用户表 (users)

**表结构**:
```sql
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL COMMENT '电话号',
  `email` varchar(100) NOT NULL,
  `avatar` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB;
```

**设计特点**:
- 使用 `bigint unsigned` 作为主键，支持大量用户数据
- 用户名和邮箱设置唯一约束，防止重复注册
- 密码字段长度255，支持加密存储
- 头像字段支持长URL存储
- 自动维护创建时间和更新时间
- 为邮箱字段创建索引，优化查询性能

**数据示例**: 当前存储了16个用户，包含完整的用户信息和头像链接

#### 2. 宠物表 (pets)

**表结构**:
```sql
CREATE TABLE `pets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(50) NOT NULL,
  `species` varchar(50) NOT NULL,
  `gender` tinyint NOT NULL COMMENT '0:女 1:男',
  `age` int NOT NULL,
  `avatar` varchar(512) DEFAULT NULL,
  `description` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pet_user` (`user_id`),
  CONSTRAINT `pets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
```

**设计特点**:
- 与用户表建立外键关联，支持级联删除
- 性别使用 `tinyint` 类型，节省存储空间
- 年龄以月为单位存储，提供更精确的年龄信息
- 支持宠物头像和详细描述
- 为用户ID创建索引，优化查询性能

**数据示例**: 存储了3只宠物的信息，包括猫和狗的详细资料

#### 3. 帖子表 (posts)

**表结构**:
```sql
CREATE TABLE `posts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `title` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `cover_image` varchar(1024) DEFAULT NULL,
  `like_count` int DEFAULT '0',
  `comment_count` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_user` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
```

**设计特点**:
- 支持长标题和富文本内容
- 封面图片字段支持长URL
- 冗余存储点赞数和评论数，提高查询性能
- 与用户表建立外键关联
- 自动维护时间戳

**数据示例**: 存储了20篇帖子，涵盖宠物日常、训练、美容等多种主题

#### 4. 评论表 (comments)

**表结构**:
```sql
CREATE TABLE `comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comment_post` (`post_id`),
  KEY `idx_comment_user` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
```

**设计特点**:
- 双外键设计，关联帖子和用户
- 支持级联删除，保证数据一致性
- 为帖子ID和用户ID分别创建索引
- 支持富文本评论内容

#### 5. 点赞表 (likes)

**表结构**:
```sql
CREATE TABLE `likes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `post_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`post_id`,`user_id`),
  KEY `idx_like_post` (`post_id`),
  KEY `idx_like_user` (`user_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
```

**设计特点**:
- 联合唯一约束防止重复点赞
- 双外键设计确保数据完整性
- 支持级联删除
- 优化的索引设计提高查询性能

#### 6. 标签表 (tags)

**表结构**:
```sql
CREATE TABLE `tags` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `search_count` int unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB;
```

**设计特点**:
- 标签名称唯一约束
- 搜索计数字段支持热门标签统计
- 简洁的设计便于扩展

#### 7. 帖子标签关联表 (post_tags)

**表结构**:
```sql
CREATE TABLE `post_tags` (
  `post_id` bigint unsigned NOT NULL,
  `tag_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `fk_post_tags_tag` (`tag_id`),
  CONSTRAINT `fk_post_tags_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
```

**设计特点**:
- 多对多关系设计
- 联合主键确保关系唯一性
- 双向外键约束
- 支持级联删除

#### 8. 搜索记录表 (search_records)

**表结构**:
```sql
CREATE TABLE `search_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `keyword` varchar(100) NOT NULL,
  `search_type` enum('pet','post') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `search_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
```

**设计特点**:
- 使用 ENUM 类型限制搜索类型
- 记录用户搜索行为
- 支持搜索分析和推荐
- 与用户表建立外键关联

## 数据库设计亮点

### 1. 完整的约束体系

- **主键约束**: 所有表都有自增主键
- **外键约束**: 建立了完整的表间关系
- **唯一约束**: 防止数据重复
- **级联删除**: 保证数据一致性

### 2. 性能优化设计

- **索引策略**: 为常用查询字段创建索引
- **数据类型优化**: 合理选择数据类型节省存储空间
- **冗余字段**: 适当冗余提高查询性能（如点赞数、评论数）

### 3. 扩展性考虑

- **字符集支持**: 使用 utf8mb4 支持emoji和多语言
- **时间戳**: 自动维护创建和更新时间
- **灵活的字段长度**: 为未来扩展预留空间

### 4. 业务逻辑支持

- **社交功能**: 完整的用户、帖子、评论、点赞体系
- **宠物管理**: 详细的宠物信息存储
- **标签系统**: 支持内容分类和搜索
- **搜索记录**: 支持用户行为分析

