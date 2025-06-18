<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import { usePostStore } from '@/stores/postStore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const postStore = usePostStore();

const postId = route.params.id;
const post = ref(null);
const comments = ref([]);
const newCommentContent = ref('');
const showCommentPopup = ref(false);
const isLiked = ref(false);
const isSubmitting = ref(false);

// 显示提示消息
const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

// 获取帖子详情
const fetchPostDetail = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/posts/${postId}`);
    if (response.data.code === 200) {
      if (Array.isArray(response.data.data) && response.data.data.length > 0) {
        post.value = response.data.data[0];
      } else {
        post.value = null;
        showToast('未找到帖子详情', 'error');
        console.error('未找到帖子详情:', response.data);
      }
      console.log('帖子详情:', post.value);
    } else {
      showToast('获取帖子详情失败: ' + response.data.message, 'error');
      console.error('获取帖子详情失败:', response.data.message);
    }
  } catch (error) {
    showToast('获取帖子详情异常', 'error');
    console.error('获取帖子详情异常:', error);
  }
};

// 获取评论列表
const fetchComments = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/posts/${postId}/comments`);
    if (response.data.code === 200) {
      comments.value = response.data.data;
      console.log('评论列表:', comments.value);
    } else {
      showToast('获取评论列表失败: ' + response.data.message, 'error');
      console.error('获取评论列表失败:', response.data.message);
    }
  } catch (error) {
    showToast('获取评论列表异常', 'error');
    console.error('获取评论列表异常:', error);
  }
};

// 添加评论
const addComment = async () => {
  if (!newCommentContent.value.trim()) {
    showToast('评论内容不能为空', 'warning');
    return;
  }

  const currentUser = userStore.userInfo;
  if (!currentUser || !currentUser.id) {
    showToast('请先登录', 'warning');
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await axios.post(`http://localhost:3000/api/posts/${postId}/comments`, {
      userId: currentUser.id,
      content: newCommentContent.value.trim(),
    });

    if (response.data.code === 200) {
      showToast('评论成功', 'success');
      newCommentContent.value = '';
      showCommentPopup.value = false;
      fetchComments();
      fetchPostDetail();
    } else {
      showToast('评论失败: ' + response.data.message, 'error');
      console.error('评论失败:', response.data.message);
    }
  } catch (error) {
    showToast('评论异常', 'error');
    console.error('评论异常:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// 点赞帖子
const likePost = async () => {
  try {
    const response = await postStore.likePost(postId);
    
    if (response.code === 200) {
      showToast('点赞成功', 'success');
      isLiked.value = true;
      fetchPostDetail();
    } else {
      showToast('点赞失败: ' + response.message, 'error');
      console.error('点赞失败:', response.message);
    }
  } catch (error) {
    showToast('点赞异常', 'error');
    console.error('点赞异常:', error);
  }
};

// 根据用户ID从缓存的用户列表中查找用户头像
const getUserAvatar = (userId) => {
  const user = userStore.cachedUsers.find(u => u.id === userId);
  return user ? user.avatar : 'https://img.yzcdn.cn/vant/user-default.png';
};

// 格式化时间
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
};

onMounted(() => {
  if (postId) {
    fetchPostDetail();
    fetchComments();
  } else {
    showToast('帖子ID缺失', 'error');
  }
});

const onClickLeft = () => history.back();
</script>

<template>
  <div class="post-detail-page">
    <!-- 渐变装饰条 -->
    <div class="gradient-strip"></div>
    
    <!-- 导航栏 -->
    <div class="nav-bar">
      <button class="back-btn" @click="onClickLeft">
        <i class="icon">←</i>
        <span>返回</span>
      </button>
      <h1 class="nav-title">📖 帖子详情</h1>
      <div class="nav-placeholder"></div>
    </div>

    <!-- 帖子详情 -->
    <div v-if="post" class="post-detail-container">
      <!-- 帖子封面 -->
      <div class="post-cover-container">
        <img 
          class="post-cover" 
          :src="post.cover_image || 'placeholder.jpg'" 
          :alt="post.title"
          @error="$event.target.src = 'https://via.placeholder.com/400x250/f0f0f0/999?text=暂无图片'"
        />
        <div class="cover-overlay">
          <h2 class="post-title">{{ post.title }}</h2>
        </div>
      </div>

      <!-- 帖子信息卡片 -->
      <div class="post-info-card">
        <div class="post-meta">
          <div class="author-info">
            <img 
              class="author-avatar" 
              :src="getUserAvatar(post.user_id)" 
              :alt="post.username"
            />
            <div class="author-details">
              <span class="author-name">{{ post.username || '未知用户' }}</span>
              <span class="post-time">{{ formatTime(post.created_at) }}</span>
            </div>
          </div>
          <div class="post-stats">
            <div class="stat-item">
              <i class="stat-icon">👍</i>
              <span>{{ post.like_count }}</span>
            </div>
            <div class="stat-item">
              <i class="stat-icon">💬</i>
              <span>{{ post.comment_count }}</span>
            </div>
          </div>
        </div>
        
        <div class="post-content">
          <p>{{ post.content }}</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button 
          class="action-btn like-btn" 
          :class="{ liked: isLiked }"
          @click="likePost"
        >
          <i class="btn-icon">{{ isLiked ? '❤️' : '🤍' }}</i>
          <span>点赞 ({{ post.like_count }})</span>
          <div class="ripple"></div>
        </button>
        <button 
          class="action-btn comment-btn" 
          @click="showCommentPopup = true"
        >
          <i class="btn-icon">💬</i>
          <span>评论 ({{ post.comment_count }})</span>
          <div class="ripple"></div>
        </button>
      </div>

      <!-- 评论列表 -->
      <div class="comments-section">
        <div class="section-header">
          <h3>💭 评论列表</h3>
          <span class="comment-count">{{ comments.length }}条评论</span>
        </div>
        
        <div class="comments-list">
          <div 
            v-for="(comment, index) in comments" 
            :key="comment.id" 
            class="comment-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <img 
              class="comment-avatar" 
              :src="getUserAvatar(comment.user_id)" 
              :alt="comment.username"
            />
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-username">{{ comment.username || '未知用户' }}</span>
                <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
            </div>
          </div>
          
          <div v-if="comments.length === 0" class="empty-comments">
            <i class="empty-icon">💭</i>
            <p>还没有评论，快来抢沙发吧！</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 评论弹窗 -->
    <div v-if="showCommentPopup" class="comment-popup-overlay" @click="showCommentPopup = false">
      <div class="comment-popup" @click.stop>
        <div class="popup-header">
          <h3>✍️ 写评论</h3>
          <button class="close-btn" @click="showCommentPopup = false">✕</button>
        </div>
        
        <div class="popup-content">
          <textarea
            v-model="newCommentContent"
            class="comment-input"
            placeholder="分享你的想法..."
            maxlength="200"
            rows="4"
          ></textarea>
          
          <div class="input-footer">
            <span class="char-count">{{ newCommentContent.length }}/200</span>
          </div>
          
          <button 
            class="submit-btn" 
            :class="{ loading: isSubmitting }"
            :disabled="isSubmitting || !newCommentContent.trim()"
            @click="addComment"
          >
            <span v-if="!isSubmitting">发布评论</span>
            <span v-else>发布中...</span>
            <div class="ripple"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="bottom-decoration">
      <div class="decoration-text">✨ 分享精彩瞬间 ✨</div>
    </div>
  </div>
</template>

<style scoped>
/* 页面动画 */
@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes containerFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes commentSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 基础样式 */
.post-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: pageSlideIn 0.6s ease-out;
  position: relative;
  overflow-x: hidden;
}

/* 渐变装饰条 */
.gradient-strip {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
  background-size: 300% 100%;
  animation: gradientShift 3s ease infinite;
  z-index: 1000;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
  margin-top: 4px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.nav-title {
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.nav-placeholder {
  width: 80px;
}

/* 帖子详情容器 */
.post-detail-container {
  padding: 1rem;
  animation: containerFadeIn 0.8s ease-out 0.2s both;
}

/* 帖子封面 */
.post-cover-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.post-cover {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-cover:hover {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 2rem 1.5rem 1.5rem;
  color: white;
}

.post-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 帖子信息卡片 */
.post-info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #fefbfb;
  font-size: 0.95rem;
}

.post-time {
  font-size: 0.8rem;
  color: #bebebe;
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #666;
}

.stat-icon {
  font-size: 1rem;
}

.post-content {
  line-height: 1.6;
  color: #ffffff;
  font-size: 1rem;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.like-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
}

.like-btn.liked {
  background: linear-gradient(135deg, #ff4757, #ff3742);
  transform: scale(1.05);
}

.comment-btn {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1.1rem;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

.action-btn:active .ripple {
  animation: ripple 0.6s linear;
}

/* 评论区域 */
.comments-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #faf7f7;
}

.comment-count {
  font-size: 0.85rem;
  color: #e3e3e3;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: commentSlideIn 0.5s ease-out;
}

.comment-item:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(4px);
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(102, 126, 234, 0.2);
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-username {
  font-weight: 600;
  color: #323232;
  font-size: 0.9rem;
}

.comment-time {
  font-size: 0.8rem;
  color: #666;
}

.comment-text {
  margin: 0;
  line-height: 1.5;
  color: #444;
  font-size: 0.9rem;
}

.empty-comments {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* 评论弹窗 */
.comment-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.comment-popup {
  width: 100%;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 1.5rem;
  transform: translateY(100%);
  animation: slideUp 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  to { transform: translateY(0); }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.popup-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 100;
}

.comment-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-footer {
  display: flex;
  justify-content: flex-end;
}

.char-count {
  font-size: 0.8rem;
  color: #666;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-btn.loading {
  pointer-events: none;
}

/* 底部装饰 */
.bottom-decoration {
  text-align: center;
  padding: 2rem 1rem;
  margin-top: 2rem;
}

.decoration-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Toast 样式 */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  z-index: 10000;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.toast.show {
  transform: translateX(-50%) translateY(0);
}

.toast-success {
  background: rgba(76, 175, 80, 0.9);
}

.toast-error {
  background: rgba(244, 67, 54, 0.9);
}

.toast-warning {
  background: rgba(255, 152, 0, 0.9);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-bar {
    padding: 0.75rem;
  }
  
  .nav-title {
    font-size: 1.1rem;
  }
  
  .post-detail-container {
    padding: 0.75rem;
  }
  
  .post-cover {
    height: 200px;
  }
  
  .post-title {
    font-size: 1.3rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .action-btn {
    padding: 1rem;
  }
  
  .comment-popup {
    padding: 1rem;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .post-detail-page {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .nav-bar {
    background: rgba(44, 62, 80, 0.95);
    color: white;
  }
  
  .post-info-card,
  .comments-section {
    background: rgba(44, 62, 80, 0.95);
    color: white;
  }
  
  .comment-popup {
    background: #2c3e50;
    color: white;
  }
  
  .comment-input {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .comment-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>