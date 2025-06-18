<script setup>
import { ref } from 'vue';
import { showSuccessToast } from 'vant'; // 保留 toast 通知功能
import { useRouter } from 'vue-router';
import { usePostStore } from '@/stores/postStore'; // 引入postStore

const router = useRouter();
const postStore = usePostStore(); // 使用postStore

const postForm = ref({
  title: '',
  content: '',
  cover_image: '', // 可选字段
  tags: '', // 用户输入的标签字符串，如 "狗,猫"
  user_id: 1, // TODO: 实际应从登录状态中获取
});

// 表单验证状态
const formErrors = ref({
  title: '',
  content: ''
});

// 验证表单
const validateForm = () => {
  let isValid = true;
  
  // 重置错误信息
  formErrors.value.title = '';
  formErrors.value.content = '';
  
  // 验证标题
  if (!postForm.value.title.trim()) {
    formErrors.value.title = '请填写标题';
    isValid = false;
  }
  
  // 验证内容
  if (!postForm.value.content.trim()) {
    formErrors.value.content = '请填写内容';
    isValid = false;
  }
  
  return isValid;
};

const onSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  const tagArray = postForm.value.tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag); // 过滤空值

  try {
    const response = await postStore.createPost({
      user_id: postForm.value.user_id,
      title: postForm.value.title,
      content: postForm.value.content,
      cover_image: postForm.value.cover_image,
      tags: tagArray,
    });

    if (response.code === 200) {
      showSuccessToast('发布成功');
      router.push('/');
    } else {
      console.error('发布失败: ' + response.message);
    }
  } catch (error) {
    console.error('发布帖子出错:', error);
  }
};

const onCancel = () => {
  router.back();
};
</script>

<template>
  <div class="post-create-view">
    <!-- 装饰性背景元素 -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
      <div class="bg-star bg-star-1">✨</div>
      <div class="bg-star bg-star-2">🌟</div>
      <div class="bg-star bg-star-3">💫</div>
    </div>

    <!-- 渐变顶部栏 -->
    <div class="gradient-top-bar">
      <div class="custom-nav-bar">
        <div class="nav-left" @click="onCancel">
          <span class="nav-arrow">←</span>
          <span class="nav-text">返回</span>
        </div>
        <div class="nav-title">📝 发布动态</div>
        <div class="nav-right"></div>
      </div>
    </div>

    <!-- 主要内容容器 -->
    <div class="main-container">
      <form @submit="onSubmit" class="beautiful-form">
        <div class="form-header">
          <div class="form-header-icon">📝</div>
          <h2 class="form-header-title">分享您的动态</h2>
          <p class="form-header-subtitle">与社区分享您的宠物生活点滴</p>
        </div>
        
        <div class="form-group">
          <!-- 标题 -->
          <div class="form-field" :class="{ 'has-error': formErrors.title }">
            <label for="title" class="field-label">📌 标题</label>
            <input 
              id="title"
              v-model="postForm.title"
              type="text"
              class="field-input"
              placeholder="请输入标题"
            />
            <div class="error-message" v-if="formErrors.title">{{ formErrors.title }}</div>
          </div>
          
          <!-- 内容 -->
          <div class="form-field" :class="{ 'has-error': formErrors.content }">
            <label for="content" class="field-label">📄 内容</label>
            <textarea 
              id="content"
              v-model="postForm.content"
              class="field-input textarea-input"
              placeholder="请输入内容"
              rows="5"
            ></textarea>
            <div class="error-message" v-if="formErrors.content">{{ formErrors.content }}</div>
          </div>
          
          <!-- 封面图URL -->
          <div class="form-field">
            <label for="cover_image" class="field-label">🖼️ 封面图URL</label>
            <input 
              id="cover_image"
              v-model="postForm.cover_image"
              type="text"
              class="field-input"
              placeholder="请输入图片地址（可选）"
            />
          </div>
          
          <!-- 标签 -->
          <div class="form-field">
            <label for="tags" class="field-label">🏷️ 标签</label>
            <input 
              id="tags"
              v-model="postForm.tags"
              type="text"
              class="field-input"
              placeholder="多个标签用逗号分隔（可选）"
            />
            <div class="field-tip">例如：猫咪,日常,萌宠</div>
          </div>
        </div>

        <div class="submit-container">
          <button type="submit" class="submit-button">
            <span class="button-icon">✨</span>
            <span class="button-text">发布动态</span>
            <div class="button-ripple"></div>
          </button>
        </div>
      </form>
      
      <!-- 侧边装饰 -->
      <div class="side-decoration side-decoration-left">
        <div class="deco-line"></div>
      </div>
      <div class="side-decoration side-decoration-right">
        <div class="deco-line"></div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="bottom-decoration">
      <div class="decoration-line"></div>
      <div class="brand-slogan">💫 分享美好时光 · 记录幸福瞬间</div>
      <div class="decoration-line"></div>
    </div>
  </div>
</template>

<style scoped>
/* 页面加载动画 */
@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 容器动画 */
@keyframes containerFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 图标弹跳动画 */
@keyframes iconBounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
}

/* 按钮涟漪效果 */
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

/* 背景圆圈动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 星星闪烁动画 */
@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 线条光晕动画 */
@keyframes lineGlow {
  0%, 100% {
    opacity: 0.5;
    width: 40px;
  }
  50% {
    opacity: 1;
    width: 60px;
  }
}

/* 主容器 */
.post-create-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  animation: pageSlideIn 0.6s ease-out;
}

/* 装饰性背景 */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  animation: float 6s ease-in-out infinite;
}

.bg-circle-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.bg-circle-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.bg-star {
  position: absolute;
  font-size: 20px;
  animation: twinkle 3s ease-in-out infinite;
}

.bg-star-1 {
  top: 25%;
  right: 15%;
  animation-delay: 0s;
}

.bg-star-2 {
  top: 70%;
  left: 10%;
  animation-delay: 1.5s;
}

.bg-star-3 {
  bottom: 15%;
  right: 25%;
  animation-delay: 3s;
}

/* 渐变顶部栏 */
.gradient-top-bar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
}

.custom-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  color: white;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-left:hover {
  opacity: 0.8;
}

.nav-arrow {
  font-size: 18px;
}

.nav-text {
  font-weight: 500;
}

.nav-title {
  font-weight: 600;
  font-size: 18px;
  animation: iconBounce 2s ease-in-out infinite;
}

/* 主要内容容器 */
.main-container {
  padding: 20px;
  position: relative;
  z-index: 5;
  animation: containerFadeIn 0.8s ease-out 0.2s both;
}

/* 表单样式 */
.beautiful-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  max-width: 600px;
  margin: 0 auto;
}

.beautiful-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
  background-size: 300% 100%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 表单头部 */
.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.form-header-icon {
  font-size: 40px;
  margin-bottom: 12px;
  animation: iconBounce 2s ease-in-out infinite;
}

.form-header-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-header-subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}

/* 表单组 */
.form-group {
  margin-bottom: 20px;
}

/* 表单字段 */
.form-field {
  margin-bottom: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.field-label {
  display: block;
  font-weight: 600;
  color: #333;
  font-size: 16px;
  margin-bottom: 8px;
}

.field-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  color: #333;
  transition: all 0.3s ease;
}

.field-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(4px);
}

.field-input::placeholder {
  color: #999;
}

.field-tip {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
}

/* 错误状态 */
.has-error .field-input {
  border-color: #f5576c;
  background: rgba(245, 87, 108, 0.05);
}

.error-message {
  color: #f5576c;
  font-size: 14px;
  margin-top: 5px;
  animation: errorShake 0.6s ease-in-out;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* 文本域 */
.textarea-input {
  min-height: 120px;
  resize: vertical;
}

/* 提交按钮容器 */
.submit-container {
  margin-top: 30px;
  position: relative;
}

/* 提交按钮 */
.submit-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  height: 54px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  border-radius: 30px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
}

.submit-button:active {
  transform: translateY(-1px);
}

.button-icon {
  font-size: 20px;
  animation: iconBounce 2s infinite;
}

.button-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.6s ease;
}

.submit-button:active .button-ripple {
  width: 300px;
  height: 300px;
  animation: ripple 0.6s ease-out;
}

/* 侧边装饰 */
.side-decoration {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.side-decoration-left {
  left: 10px;
}

.side-decoration-right {
  right: 10px;
}

.deco-line {
  width: 3px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* 底部装饰 */
.bottom-decoration {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 15px;
}

.decoration-line {
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: lineGlow 2s ease-in-out infinite;
}

.brand-slogan {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-align: center;
  font-weight: 500;
  letter-spacing: 1px;
  white-space: nowrap;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    padding: 16px;
  }
  
  .beautiful-form {
    padding: 20px;
    border-radius: 16px;
  }
  
  .form-header-icon {
    font-size: 32px;
  }
  
  .form-header-title {
    font-size: 20px;
  }
  
  .form-header-subtitle {
    font-size: 14px;
  }
  
  .field-label {
    font-size: 15px;
  }
  
  .field-input {
    font-size: 15px;
    padding: 10px 12px;
  }
  
  .submit-button {
    height: 48px;
    font-size: 16px;
  }
  
  .nav-title {
    font-size: 16px;
  }
  
  .side-decoration {
    display: none;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .post-create-view {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }
  
  .beautiful-form {
    background: rgba(45, 55, 72, 0.95);
    color: white;
  }
  
  .form-header-title {
    background: linear-gradient(135deg, #90cdf4, #a3bffa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .form-header-subtitle {
    color: #cbd5e0;
  }
  
  .field-label {
    color: #e2e8f0;
  }
  
  .field-input {
    background: rgba(74, 85, 104, 0.8);
    color: #e2e8f0;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .field-input::placeholder {
    color: #a0aec0;
  }
  
  .field-tip {
    color: #a0aec0;
  }
  
  .submit-button {
    background: linear-gradient(135deg, #4299e1 0%, #805ad5 100%);
  }
}
</style>