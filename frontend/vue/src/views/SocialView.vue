<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { List, PullRefresh, Tab, Tabs, Button, Cell } from 'vant';
import { useRouter } from 'vue-router';
import { usePostStore } from '@/stores/postStore.js';

const activeTab = ref(0);
const refreshing = ref(false);
const finished = ref(true);

const router = useRouter();
const postStore = usePostStore();

// 使用 computed 获取帖子列表和加载状态
const posts = computed(() => postStore.postsList);
const loading = computed(() => postStore.loading);

// 获取帖子列表的函数
const fetchPosts = async () => {
  if (postStore.loading) return; // 避免重复加载

  try {
    await postStore.fetchPostsByTab(activeTab.value);
    finished.value = true; // 数据加载完成
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    // 可以显示错误提示
  } finally {
    refreshing.value = false; // 刷新结束
  }
};

// 下拉刷新
const onRefresh = () => {
  postStore.clearPosts(); // 清空当前列表
  fetchPosts(); // 重新获取数据
};

const createPost = () => {
  router.push('/create-post');
};

// 组件挂载时获取最新帖子
onMounted(() => {
  fetchPosts();
});

// 监听 activeTab 变化，切换 Tab 时重新获取数据
watch(activeTab, (newTab, oldTab) => {
  if (newTab !== oldTab) {
    postStore.clearPosts(); // 清空当前列表
    fetchPosts(); // 获取新 Tab 的数据
  }
});

// 点击帖子跳转到详情页
const goToPostDetail = (postId) => {
  router.push({ name: 'postdetail', params: { id: postId } });
};
</script>

<template>
  <div class="social-view">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">🐾 宠物社区</h1>
        <div class="title-decoration"></div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="tabs-container">
      <Tabs v-model:active="activeTab" class="custom-tabs">
        <Tab title="🔥 最热" class="tab-item"></Tab>
        <Tab title="⭐ 最新" class="tab-item"></Tab>
      </Tabs>
    </div>

    <!-- 内容区域 -->
    <div class="content-container">
      <PullRefresh v-model="refreshing" @refresh="onRefresh" class="pull-refresh">
        <List
          v-model:loading="loading"
          :finished="finished"
          finished-text="🎉 没有更多精彩内容了"
          @load="fetchPosts"
          class="post-list"
        >
          <div
            v-for="(post, index) in posts"
            :key="post.id"
            class="post-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="goToPostDetail(post.id)"
          >
            <!-- 用户信息头部 -->
            <div class="post-header">
              <div class="user-info">
                <div class="avatar-wrapper">
                  <img 
                    :src="post.avatar || '/default-avatar.png'"
                    class="user-avatar"
                    alt="用户头像"
                  />
                  <div class="avatar-ring"></div>
                </div>
                <div class="user-meta">
                  <div class="username">{{ post.username }}</div>
                  <div class="post-time">{{ post.created_at }}</div>
                </div>
              </div>
              <div class="post-menu">
                <div class="menu-dot"></div>
                <div class="menu-dot"></div>
                <div class="menu-dot"></div>
              </div>
            </div>

            <!-- 帖子标题 -->
            <div class="post-title">
              {{ post.title }}
            </div>

            <!-- 帖子内容 -->
            <div class="post-content">
              <div 
                v-if="post.content" 
                class="post-text"
              >
                {{ post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content }}
              </div>
              
              <div v-if="post.cover_image" class="image-container">
                <img 
                  :src="post.cover_image" 
                  class="cover-image"
                  alt="封面图"
                />
                <div class="image-overlay">
                  <div class="overlay-icon">🔍</div>
                </div>
              </div>
            </div>

            <!-- 互动区域 -->
            <div class="post-actions">
              <div class="action-item like-action">
                <div class="action-icon">❤️</div>
                <span class="action-count">{{ post.like_count || 0 }}</span>
              </div>
              <div class="action-item comment-action">
                <div class="action-icon">💬</div>
                <span class="action-count">{{ post.comment_count || 0 }}</span>
              </div>
              <div class="action-item share-action">
                <div class="action-icon">📤</div>
                <span class="action-text">分享</span>
              </div>
            </div>
          </div>
        </List>
      </PullRefresh>
    </div>
  </div>
</template>

<style scoped>
/* 基础容器 */
.social-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

.social-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>') repeat;
  pointer-events: none;
}

/* 头部区域 */
.header-section {
  padding: 20px 16px 10px;
  position: relative;
  z-index: 2;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: titleSlideDown 0.8s ease-out;
}

.title-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
  margin: 10px auto;
  border-radius: 2px;
  animation: decorationExpand 1s ease-out 0.3s both;
}

/* Tab 区域 */
.tabs-container {
  padding: 0 16px;
  position: relative;
  z-index: 2;
  margin-bottom: 10px;
}

.custom-tabs {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: tabSlideIn 0.6s ease-out 0.2s both;
}

.custom-tabs :deep(.van-tab) {
  font-weight: 600;
  font-size: 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.custom-tabs :deep(.van-tab--active) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transform: scale(1.05);
}

/* 内容容器 */
.content-container {
  padding: 0 16px 100px;
  position: relative;
  z-index: 1;
}

.pull-refresh {
  min-height: 60vh;
}

.post-list {
  background: transparent;
}

/* 帖子卡片 */
.post-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  margin-bottom: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  animation: cardSlideUp 0.6s ease-out both;
  position: relative;
  overflow: hidden;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.post-card:hover::before {
  left: 100%;
}

/* 帖子头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.avatar-ring {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: all 0.3s ease;
}

.post-card:hover .avatar-ring {
  opacity: 1;
  animation: ringPulse 2s ease-in-out infinite;
}

.user-meta {
  flex: 1;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 16px;
  margin-bottom: 4px;
}

.post-time {
  color: #666;
  font-size: 13px;
}

.post-menu {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.post-menu:hover {
  background: rgba(102, 126, 234, 0.1);
}

.menu-dot {
  width: 4px;
  height: 4px;
  background: #999;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.post-menu:hover .menu-dot {
  background: #667eea;
  transform: scale(1.2);
}

/* 帖子标题 */
.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
}

/* 帖子内容 */
.post-content {
  margin-bottom: 16px;
}

.post-text {
  color: #666;
  line-height: 1.6;
  font-size: 15px;
  margin-bottom: 12px;
}

.image-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.cover-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: all 0.3s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.image-container:hover .cover-image {
  transform: scale(1.05);
}

.overlay-icon {
  font-size: 24px;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

/* 互动区域 */
.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.like-action:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}

.comment-action:hover {
  background: rgba(78, 205, 196, 0.1);
  color: #4ecdc4;
}

.share-action:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.action-icon {
  font-size: 16px;
  transition: all 0.3s ease;
}

.action-item:hover .action-icon {
  transform: scale(1.2);
}

.action-count, .action-text {
  font-weight: 500;
}

/* 发布按钮 */
.fab-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.create-btn {
  width: 140px;
  height: 50px;
  border-radius: 25px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border: none;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
  animation: fabSlideIn 0.8s ease-out 0.5s both;
}

.create-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
}

.create-btn:active {
  transform: translateY(-1px) scale(1.02);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  font-size: 18px;
  animation: iconSpin 2s ease-in-out infinite;
}

.btn-text {
  font-weight: 600;
  font-size: 14px;
}

/* 关键帧动画 */
@keyframes titleSlideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes decorationExpand {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

@keyframes tabSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fabSlideIn {
  from {
    opacity: 0;
    transform: translateX(100px) rotate(180deg);
  }
  to {
    opacity: 1;
    transform: translateX(0) rotate(0deg);
  }
}

@keyframes ringPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}

@keyframes iconSpin {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .social-view {
    padding: 0;
  }
  
  .header-section {
    padding: 15px 12px 8px;
  }
  
  .page-title {
    font-size: 1.6rem;
  }
  
  .tabs-container {
    padding: 0 12px;
  }
  
  .content-container {
    padding: 0 12px 80px;
  }
  
  .post-card {
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .fab-container {
    bottom: 15px;
    right: 15px;
  }
  
  .create-btn {
    width: 120px;
    height: 45px;
  }
  
  .btn-text {
    font-size: 13px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .post-card {
    background: rgba(30, 30, 30, 0.95);
    color: #e0e0e0;
  }
  
  .username {
    color: #f0f0f0;
  }
  
  .post-title {
    color: #f0f0f0;
  }
  
  .post-text {
    color: #b0b0b0;
  }
}
</style>