# 宠物社交平台 (Pet Social Platform)

## 项目概述

本项目是一个基于现代化技术栈的宠物社交平台，为宠物爱好者提供分享、交流和互动的社区空间。项目采用前后端分离架构，集成了AI聊天、地图服务、实时天气等丰富功能，致力于打造优质的宠物社交体验。

**开发者**: 计应2305李阳  
**项目版本**: 1.0.0  
**最后更新**: 2025年6月15日
**演示视频**：https://b23.tv/Sj17fTf
## 技术架构

### 前端技术栈
- **框架**: Vue 3.5.13 (Composition API)
- **构建工具**: Vite 6.3.5
- **路由管理**: Vue Router 4.5.0
- **状态管理**: Pinia 3.0.1
- **UI组件库**: Vant 4.9.20 (移动端优化)
- **HTTP客户端**: Axios 1.10.0
- **nginx**部署:nginx-1.28.0

### 后端技术栈
- **运行时**: Node.js + Express
- **数据库**: MySQL 8.0.31
- **缓存**: Redis
- **认证**: express-session + bcrypt
- **跨域**: CORS

- ### 数据库设计

  - **存储引擎**: InnoDB
  - **字符集**: utf8mb4 (支持emoji)
  - **核心表**: 用户、宠物、帖子、评论、点赞、标签、搜索记录
  - ![这是一张宠物社交平台的图片](https://github.com/Lyles2163/pet_social/raw/master/frontend/vue/public/100.png)![这是一张宠物社交平台的图片](https://github.com/Lyles2163/pet_social/raw/master/frontend/vue/public/200.png)![这是一张宠物社交平台的图片](https://github.com/Lyles2163/pet_social/raw/master/frontend/vue/public/300.png)

## 核心功能

![这是一张宠物社交平台的图片](https://github.com/Lyles2163/pet_social/raw/master/frontend/vue/public/100.png)
![这是一张宠物社交平台的图片](https://github.com/Lyles2163/pet_social/raw/master/frontend/vue/public/200.png)
![这是一张宠物社交平台的图片](https://github.com/Lyles2163/pet_social/raw/master/frontend/vue/public/300.png)

### 🔐 用户系统
- 手机号+验证码登录/注册
- Session会话管理
- 用户信息管理
- 安全密码存储

### 🐾 宠物管理
- 宠物档案创建
- 宠物信息展示
- 萌宠社区互动

### 📝 社交功能
- 帖子发布与管理
- 评论互动系统
- 点赞功能
- 标签分类
- 热度排序

### 🔍 智能搜索
- 全文搜索(宠物/帖子)
- 搜索历史记录
- 热搜推荐
- 标签搜索

### 🤖 AI聊天
- 集成Coze AI工作流
- 实时对话体验
- 聊天历史记录

### 🗺️ 位置服务
- 高德地图集成
- 实时天气显示
- POI搜索
- 地理位置服务

## 性能优化

### 缓存策略
- **Redis缓存**: 用户列表、帖子列表、详情页面
- **本地存储**: 用户状态持久化
- **CDN加速**: 静态资源优化

### 数据库优化
- 连接池管理
- 索引优化
- 联表查询优化
- 参数化查询防注入

### 前端优化
- 路由懒加载
- 组件按需导入
- 图片懒加载
- 响应式设计

## 项目结构

```
project/
├── frontend/vue/          # Vue3前端应用
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── stores/        # Pinia状态管理
│   │   ├── router/        # 路由配置
│   │   └── components/    # 公共组件
│   └── dist/              # 构建输出
├── backend/               # Node.js后端服务
│   ├── routes/            # API路由
│   ├── app.js             # 应用入口
│   └── dbConfig.js        # 数据库配置
├── sql/                   # 数据库文件
│   ├── pet_social.sql     # 数据库结构和数据
│   └── database.md        # 数据库设计文档
└── pet_social/nginx/      # Nginx部署配置
```

## 部署架构

- **前端**: Nginx静态文件服务
- **后端**: Node.js Express服务 (端口3000)
- **数据库**: MySQL 8.0.31
- **缓存**: Redis
- **反向代理**: Nginx

## 快速启动

### 环境要求
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+


## 项目亮点

- ✨ **现代化技术栈**: Vue3 + Node.js + MySQL + Redis
- 📱 **移动端优化**: 专为移动设备设计的用户体验
- 🚀 **高性能**: 多层缓存策略，响应速度优异
- 🔒 **安全可靠**: 完善的认证体系和数据保护
- 🎨 **美观界面**: 现代化UI设计，丰富的动画效果
- 🤖 **AI集成**: 创新的AI聊天功能
- 🌍 **位置服务**: 深度集成地图和天气服务

## 开发文档

- [前端开发日志](frontend/vue/frontend.md)
- [后端开发日志](backend/backend.md)
- [数据库设计文档](sql/database.md)

## 许可证

本项目仅供学习和研究使用。

---

**联系方式**: 计应2305李阳  
**项目地址**: `https://github.com/Lyles2163/pet_social_App`
```
        
