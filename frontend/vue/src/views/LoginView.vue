<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'; // 导入 userStore
import { useGlobalStore } from '@/stores/global'; // 新增：导入 globalStore
import { showSuccessToast, showFailToast } from 'vant'
const phone = ref('')
const code = ref('')
const isRegister = ref(false)
const router = useRouter()
const userStore = useUserStore(); // 获取 userStore 实例
const globalStore = useGlobalStore(); // 新增：获取 globalStore 实例

const sendCode = async () => {
  try {
    const response = await axios.post(`${globalStore.POST_NAME}send-code`, { 
      phone: phone.value 
    });
    
    // 显示生成的验证码（实际生产环境应移除）
    showSuccessToast(`验证码：${response.data.data.code}`);
  } catch (error) {
    showFailToast('发送验证码失败: ' + error.response?.data?.message || error.message)
  }
}

const submit = async () => {
  try {
    const endpoint = isRegister.value ? 'register' : 'login'
    const { data } = await axios.post(`${globalStore.POST_NAME}${endpoint}`, {
      phone: phone.value,
      code: code.value
    }, {
      withCredentials: true // ✅ 确保登录请求也携带 cookie
    });

    showSuccessToast(isRegister.value ? '注册成功' : '登录成功');

    // ✅ 使用 userStore 的 action 来设置用户信息并保存到 localStorage
    userStore.setUserInfo(data.data);

    router.push('/'); // 跳转到首页

  } catch (error) {
    alert('操作失败: ' + error.response?.data?.message || error.message);
  }
}
</script>

<template>
  <div class="login-page">
    <!-- 🌈 美化背景 -->
    <div class="background-gradient"></div>
    
    <!-- ✨ 装饰元素 -->
    <div class="decorative-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
      <div class="floating-star star-1">⭐</div>
      <div class="floating-star star-2">🌟</div>
      <div class="floating-star star-3">✨</div>
    </div>

    <div class="login-container">
      <!-- 🎯 标题区域 -->
      <div class="title-section">
        <div class="app-logo">
          <div class="logo-icon">🐾</div>
          <div class="app-name">萌宠社区</div>
        </div>
        <h1 class="page-title">
          <span class="title-emoji">{{ isRegister ? '🎉' : '👋' }}</span>
          {{ isRegister ? '欢迎注册' : '欢迎回来' }}
        </h1>
        <p class="subtitle">{{ isRegister ? '加入我们的萌宠大家庭' : '继续您的萌宠之旅' }}</p>
      </div>

      <!-- 📱 表单区域 -->
      <div class="form-container">
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📱</span>
            手机号
          </label>
          <div class="input-wrapper">
            <input 
              v-model="phone" 
              type="tel" 
              placeholder="请输入手机号"
              class="form-input"
            >
            <div class="input-border"></div>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🔐</span>
            验证码
          </label>
          <div class="code-input-group">
            <div class="input-wrapper flex-1">
              <input 
                v-model="code" 
                type="text" 
                placeholder="请输入验证码"
                class="form-input"
              >
              <div class="input-border"></div>
            </div>
            <button @click="sendCode" class="code-btn">
              <span class="btn-icon">📨</span>
              获取验证码
            </button>
          </div>
        </div>
        
        <button @click="submit" class="submit-btn">
          <span class="btn-icon">{{ isRegister ? '🎊' : '🚀' }}</span>
          <span class="btn-text">{{ isRegister ? '立即注册' : '立即登录' }}</span>
          <div class="btn-ripple"></div>
        </button>
        
        <p class="toggle-text" @click="isRegister = !isRegister">
          <span class="toggle-icon">{{ isRegister ? '👤' : '✨' }}</span>
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </p>
      </div>

      <!-- 🎨 底部装饰 -->
      <div class="bottom-decoration">
        <div class="decoration-line"></div>
        <div class="decoration-text">安全 · 便捷 · 有趣</div>
        <div class="decoration-line"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 🎨 页面容器 */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  animation: pageSlideIn 0.8s ease-out;
}

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

/* 🌈 美化背景 */
.background-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #f5576c 75%,
    #4facfe 100%
  );
  z-index: -2;
  animation: gradientShift 10s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background: linear-gradient(
      135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #f5576c 75%,
      #4facfe 100%
    );
  }
  50% {
    background: linear-gradient(
      135deg,
      #4facfe 0%,
      #00f2fe 25%,
      #667eea 50%,
      #764ba2 75%,
      #f093fb 100%
    );
  }
}

/* ✨ 装饰元素 */
.decorative-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.floating-star {
  position: absolute;
  font-size: 20px;
  animation: twinkle 3s ease-in-out infinite;
}

.star-1 {
  top: 20%;
  right: 20%;
  animation-delay: 1s;
}

.star-2 {
  top: 70%;
  left: 80%;
  animation-delay: 3s;
}

.star-3 {
  bottom: 30%;
  right: 10%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

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

/* 📱 登录容器 */
.login-container {
  max-width: 420px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 40px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: containerSlideIn 0.8s ease-out 0.2s both;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe);
  background-size: 200% 100%;
  animation: gradientMove 3s ease-in-out infinite;
}

@keyframes containerSlideIn {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes gradientMove {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 🎯 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 35px;
  animation: titleSlideIn 0.8s ease-out 0.4s both;
}

.app-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
}

.logo-icon {
  font-size: 32px;
  animation: logoSpin 3s ease-in-out infinite;
}

.app-name {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-emoji {
  font-size: 32px;
  animation: bounce 2s infinite;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}

@keyframes titleSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoSpin {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(10deg) scale(1.1);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

/* 📝 表单容器 */
.form-container {
  animation: formSlideIn 0.8s ease-out 0.6s both;
}

@keyframes formSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 📝 表单组 */
.form-group {
  margin-bottom: 25px;
  animation: formGroupSlideIn 0.6s ease-out both;
}

.form-group:nth-child(1) {
  animation-delay: 0.1s;
}

.form-group:nth-child(2) {
  animation-delay: 0.2s;
}

@keyframes formGroupSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 🏷️ 标签 */
.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.label-icon {
  font-size: 18px;
  animation: iconPulse 2s infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 📝 输入框包装器 */
.input-wrapper {
  position: relative;
  overflow: hidden;
}

.flex-1 {
  flex: 1;
}

/* 📝 输入框 */
.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 15px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.form-input::placeholder {
  color: #aaa;
  transition: all 0.3s ease;
}

.form-input:focus::placeholder {
  color: #ccc;
  transform: translateY(-2px);
}

/* 📝 输入框边框动画 */
.input-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.form-input:focus + .input-border {
  width: 100%;
}

/* 📱 验证码输入组 */
.code-input-group {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

/* 📨 验证码按钮 */
.code-btn {
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  min-height: 54px;
}

.code-btn:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.code-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 16px;
  animation: iconBounce 2s infinite;
}

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* 🚀 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 18px;
  margin-top: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  animation: submitBtnSlideIn 0.8s ease-out 0.8s both;
  min-height: 54px;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(-1px);
}

.btn-text {
  position: relative;
  z-index: 2;
}

.btn-ripple {
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

.submit-btn:active .btn-ripple {
  width: 300px;
  height: 300px;
}

@keyframes submitBtnSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 🔄 切换文本 */
.toggle-text {
  margin-top: 25px;
  text-align: center;
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  animation: toggleSlideIn 0.8s ease-out 1s both;
  padding: 10px;
  border-radius: 10px;
}

.toggle-text:hover {
  color: #5a6fd8;
  transform: translateY(-2px);
  background: rgba(102, 126, 234, 0.05);
}

.toggle-icon {
  font-size: 18px;
  animation: toggleIconSpin 3s ease-in-out infinite;
}

@keyframes toggleSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toggleIconSpin {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

/* 🎨 底部装饰 */
.bottom-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  gap: 15px;
  animation: decorationSlideIn 0.8s ease-out 1.2s both;
}

.decoration-line {
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  animation: lineGlow 2s ease-in-out infinite;
}

.decoration-text {
  color: #999;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

@keyframes decorationSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes lineGlow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* 📱 响应式设计 - 优化版本 */

/* 超小屏幕 (小于480px) */
@media (max-width: 479px) {
  .login-page {
    padding: 10px;
    min-height: 100vh;
    align-items: flex-start; /* 改为顶部对齐，避免在某些手机上内容溢出 */
    padding-top: 40px; /* 添加顶部间距 */
  }
  
  .login-container {
    padding: 20px 15px;
    border-radius: 20px;
    margin: 0;
    max-width: 100%; /* 确保容器不会超出屏幕 */
  }
  
  .page-title {
    font-size: 20px;
    flex-direction: row; /* 改为水平布局，节省空间 */
    gap: 5px;
    flex-wrap: wrap; /* 允许在需要时换行 */
    justify-content: center;
  }
  
  .title-emoji {
    font-size: 22px;
  }
  
  .app-name {
    font-size: 18px;
  }
  
  .logo-icon {
    font-size: 22px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .form-input {
    padding: 12px 14px;
    font-size: 15px;
    border-radius: 12px;
  }
  
  .code-input-group {
    flex-direction: row; /* 改为水平布局 */
    gap: 8px;
    align-items: center;
  }
  
  .code-btn {
    width: auto; /* 不再占用100%宽度 */
    padding: 12px 10px;
    font-size: 13px;
    border-radius: 12px;
    min-height: 46px;
    flex-shrink: 0; /* 防止按钮被压缩 */
  }
  
  .btn-icon {
    font-size: 14px;
  }
  
  .submit-btn {
    padding: 14px;
    font-size: 16px;
    border-radius: 12px;
    min-height: 46px;
  }
  
  .form-label {
    font-size: 14px;
    margin-bottom: 6px;
  }
  
  .form-group {
    margin-bottom: 18px;
  }
  
  .bottom-decoration {
    flex-direction: row; /* 改为水平布局 */
    gap: 8px;
    margin-top: 15px;
  }
  
  .decoration-line {
    width: 40px;
  }
  
  .decoration-text {
    font-size: 11px;
  }
  
  /* 隐藏部分装饰元素以提高可读性 */
  .floating-circle {
    opacity: 0.2;
    display: none; /* 在超小屏幕上完全隐藏 */
  }
  
  .floating-star {
    opacity: 0.3;
    display: none; /* 在超小屏幕上完全隐藏 */
  }
  
  .toggle-text {
    margin-top: 15px;
    font-size: 14px;
  }
  
  .title-section {
    margin-bottom: 20px;
  }
  
  .app-logo {
    margin-bottom: 12px;
  }
}

/* 小屏幕 (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .login-page {
    padding: 15px;
  }
  
  .login-container {
    padding: 25px 20px;
    max-width: 400px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .app-name {
    font-size: 20px;
  }
  
  .code-input-group {
    flex-direction: row; /* 改为水平布局 */
    gap: 10px;
    align-items: center;
  }
  
  .code-btn {
    width: auto; /* 不再占用100%宽度 */
    flex-shrink: 0; /* 防止按钮被压缩 */
    white-space: nowrap;
    padding: 12px 15px;
  }
  
  .form-input {
    padding: 12px 16px;
    font-size: 16px;
  }
  
  .submit-btn {
    padding: 15px;
    font-size: 16px;
  }
  
  .bottom-decoration {
    flex-direction: row; /* 改为水平布局 */
    gap: 10px;
  }
  
  .decoration-line {
    width: 60px;
  }
}

/* 中等屏幕 (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .login-container {
    max-width: 450px;
    padding: 35px 25px;
  }
  
  .page-title {
    font-size: 26px;
  }
  
  .app-name {
    font-size: 22px;
  }
  
  .form-input {
    padding: 14px 18px;
  }
  
  .code-btn {
    padding: 14px 18px;
  }
  
  .submit-btn {
    padding: 16px;
    font-size: 17px;
  }
}

/* 大屏幕 (1024px及以上) */
@media (min-width: 1024px) {
  .login-container {
    max-width: 480px;
    padding: 45px 35px;
  }
  
  .page-title {
    font-size: 30px;
  }
  
  .app-name {
    font-size: 26px;
  }
  
  .logo-icon {
    font-size: 36px;
  }
  
  .subtitle {
    font-size: 17px;
  }
  
  .form-input {
    padding: 16px 22px;
    font-size: 17px;
  }
  
  .code-btn {
    padding: 16px 22px;
    font-size: 15px;
  }
  
  .submit-btn {
    padding: 20px;
    font-size: 19px;
  }
  
  .form-label {
    font-size: 17px;
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 600px) {
  .login-page {
    padding: 10px;
  }
  
  .login-container {
    padding: 20px 25px;
    margin: 5px 0;
  }
  
  .title-section {
    margin-bottom: 20px;
  }
  
  .app-logo {
    margin-bottom: 10px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .bottom-decoration {
    margin-top: 15px;
  }
  
  /* 进一步减少装饰元素的干扰 */
  .floating-circle {
    opacity: 0.2;
  }
  
  .floating-star {
    opacity: 0.3;
  }
}

/* 🌙 深色模式支持 - 增强版 */
@media (prefers-color-scheme: dark) {
  .login-container {
    background: rgba(30, 30, 30, 0.95);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .page-title {
    color: #fff;
  }
  
  .subtitle {
    color: #ccc;
  }
  
  .form-label {
    color: #fff;
  }
  
  .form-input {
    background: rgba(50, 50, 50, 0.9);
    border-color: rgba(102, 126, 234, 0.3);
    color: #fff;
  }
  
  .form-input:focus {
    background: rgba(60, 60, 60, 1);
    border-color: #667eea;
  }
  
  .form-input::placeholder {
    color: #888;
  }
  
  .form-input:focus::placeholder {
    color: #aaa;
  }
  
  .decoration-text {
    color: #666;
  }
  
  .toggle-text:hover {
    background: rgba(102, 126, 234, 0.1);
  }
  
  /* 深色模式下的装饰元素 */
  .floating-circle {
    background: rgba(255, 255, 255, 0.05);
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .login-container {
    border: 2px solid #333;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  
  .form-input {
    border-width: 2px;
  }
  
  .form-input:focus {
    border-width: 3px;
  }
  
  .code-btn, .submit-btn {
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .floating-circle,
  .floating-star {
    animation: none;
  }
  
  .background-gradient {
    animation: none;
  }
}

/* 针对iPhone SE等超小屏幕设备的特殊优化 */
@media (max-width: 375px) {
  .login-container {
    padding: 15px 12px;
  }
  
  .code-btn {
    padding: 10px 8px;
    font-size: 12px;
  }
  
  .btn-icon {
    font-size: 13px;
  }
  
  .form-input {
    padding: 10px 12px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .app-logo {
    margin-bottom: 10px;
  }
  
  .title-section {
    margin-bottom: 15px;
  }
}

/* 触摸设备优化 - 增强版 */
@media (hover: none) and (pointer: coarse) {
  .form-input {
    min-height: 46px;
    font-size: 16px; /* 增大字体，提高可读性 */
  }
  
  .code-btn {
    min-height: 46px;
    min-width: auto; /* 移除最小宽度限制 */
    padding-left: 10px;
    padding-right: 10px;
  }
  
  .submit-btn {
    min-height: 46px;
  }
  
  .toggle-text {
    min-height: 44px;
    padding: 10px;
  }
  
  /* 增大点击区域 */
  .form-label, .toggle-text {
    padding: 5px 0;
  }
  
  /* 调整输入框内边距，使触摸更容易 */
  .form-input {
    padding-top: 12px;
    padding-bottom: 12px;
  }
  
  /* 移除hover效果，使用active效果 */
  .code-btn:hover,
  .submit-btn:hover,
  .toggle-text:hover {
    transform: none;
  }
  
  .code-btn:active {
    transform: scale(0.98);
  }
  
  .submit-btn:active {
    transform: scale(0.98);
  }
  
  .toggle-text:active {
    transform: scale(0.98);
    background: rgba(102, 126, 234, 0.1);
  }
}
</style>