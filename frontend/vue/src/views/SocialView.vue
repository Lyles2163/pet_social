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
                    :src="post.avatar || 'data:image/webp;base64,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'"
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