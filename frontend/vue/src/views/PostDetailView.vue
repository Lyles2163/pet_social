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
    await postStore.fetchPostDetail(postId);
    post.value = postStore.currentPost;
  } catch (error) {
    showToast('获取帖子详情失败', 'error');
  }
};

// 获取评论列表
const fetchComments = async () => {
  try {
    await postStore.fetchComments(postId);
    comments.value = postStore.comments;
  } catch (error) {
    showToast('获取评论失败', 'error');
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
    const response = await axios.post(`http://222.186.56.249:52858/api/posts/${postId}/comments`, {
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
  return user ? user.avatar : 'data:image/webp;base64,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';
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
 background: rgba(44, 62, 80, 0.95);
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
  background: rgba(44, 62, 80, 0.95);
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