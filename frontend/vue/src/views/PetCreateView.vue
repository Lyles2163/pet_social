<script setup>
import { ref } from 'vue';
import { showSuccessToast, showFailToast } from 'vant'; // 保留 toast 通知功能
import { useRouter } from 'vue-router';
import { usePetStore } from '@/stores/petStore';

const router = useRouter();
const petStore = usePetStore();

const petForm = ref({
  pet_name: '',
  pet_type: '',
  pet_age: '',
  pet_gender: '',
  description: '',
  pet_image: '',
  user_id: 1, // TODO: 实际应从登录状态中获取
});

// 表单验证状态
const formErrors = ref({
  pet_name: '',
  pet_type: ''
});

// 验证表单
const validateForm = () => {
  let isValid = true;
  
  // 重置错误信息
  formErrors.value.pet_name = '';
  formErrors.value.pet_type = '';
  
  // 验证宠物名称
  if (!petForm.value.pet_name.trim()) {
    formErrors.value.pet_name = '请填写宠物名称';
    isValid = false;
  }
  
  // 验证宠物类型
  if (!petForm.value.pet_type.trim()) {
    formErrors.value.pet_type = '请填写宠物类型';
    isValid = false;
  }
  
  return isValid;
};

const onSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  try {
    const result = await petStore.createPet({
      user_id: petForm.value.user_id,
      pet_name: petForm.value.pet_name,
      pet_type: petForm.value.pet_type,
      pet_age: petForm.value.pet_age,
      pet_gender: petForm.value.pet_gender,
      description: petForm.value.description,
      pet_image: petForm.value.pet_image,
    });

    if (result.success) {
      showSuccessToast('发布成功');
      router.push('/cutePet');
    } else {
      showFailToast(result.message || '发布失败');
    }
  } catch (error) {
    showFailToast('发布宠物信息出错');
    console.error('发布宠物信息出错:', error);
  }
};

const onCancel = () => {
  router.back();
};
</script>

<template>
  <div class="pet-create-page">
    <!-- 🌈 美化背景 -->
    <div class="background-gradient"></div>
    
    <!-- ✨ 装饰元素 -->
    <div class="decorative-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
      <div class="floating-star star-1">🐾</div>
      <div class="floating-star star-2">🌟</div>
      <div class="floating-star star-3">✨</div>
    </div>

    <div class="pet-create-view">
      <!-- 🎯 导航栏 -->
      <div class="custom-nav-bar">
        <div class="nav-left" @click="onCancel">
          <span class="nav-arrow">←</span>
          <span class="nav-text">返回</span>
        </div>
        <div class="nav-title">🐾 发布宠物信息</div>
        <div class="nav-right"></div>
      </div>

      <!-- 📝 表单容器 -->
      <div class="form-container">
        <!-- 🎨 标题区域 -->
        <div class="title-section">
          <div class="title-icon">🐕‍🦺</div>
          <h2 class="form-title">分享您的萌宠</h2>
          <p class="form-subtitle">让更多人认识您可爱的小伙伴</p>
        </div>

        <form @submit="onSubmit" class="pet-form">
          <div class="form-group">
            <!-- 宠物名称 -->
            <div class="form-field" :class="{ 'has-error': formErrors.pet_name }">
              <label for="pet_name" class="field-label">🏷️ 宠物名称</label>
              <input 
                id="pet_name"
                v-model="petForm.pet_name"
                type="text"
                class="field-input"
                placeholder="请输入宠物名称"
              />
              <div class="error-message" v-if="formErrors.pet_name">{{ formErrors.pet_name }}</div>
            </div>
            
            <!-- 宠物类型 -->
            <div class="form-field" :class="{ 'has-error': formErrors.pet_type }">
              <label for="pet_type" class="field-label">🐱 宠物类型</label>
              <input 
                id="pet_type"
                v-model="petForm.pet_type"
                type="text"
                class="field-input"
                placeholder="如：猫、狗、兔子等"
              />
              <div class="error-message" v-if="formErrors.pet_type">{{ formErrors.pet_type }}</div>
            </div>
            
            <!-- 宠物年龄 -->
            <div class="form-field">
              <label for="pet_age" class="field-label">🎂 宠物年龄</label>
              <input 
                id="pet_age"
                v-model="petForm.pet_age"
                type="number"
                class="field-input"
                placeholder="请输入宠物年龄（可选）"
              />
            </div>
            
            <!-- 宠物性别 -->
            <div class="form-field">
              <label for="pet_gender" class="field-label">⚧️ 宠物性别</label>
              <input 
                id="pet_gender"
                v-model="petForm.pet_gender"
                type="text"
                class="field-input"
                placeholder="如：公/母（可选）"
              />
            </div>
            
            <!-- 宠物描述 -->
            <div class="form-field">
              <label for="description" class="field-label">📝 宠物描述</label>
              <textarea 
                id="description"
                v-model="petForm.description"
                class="field-input textarea-input"
                placeholder="请输入宠物描述（可选）"
                rows="3"
              ></textarea>
            </div>
            
            <!-- 宠物图片 -->
            <div class="form-field">
              <label for="pet_image" class="field-label">📸 宠物图片</label>
              <input 
                id="pet_image"
                v-model="petForm.pet_image"
                type="text"
                class="field-input"
                placeholder="请输入图片地址（可选）"
              />
            </div>
          </div>

          <!-- 🚀 提交按钮 -->
          <div class="submit-section">
            <button type="submit" class="submit-btn">
              <span class="btn-icon">🎉</span>
              <span class="btn-text">发布萌宠</span>
              <div class="btn-ripple"></div>
            </button>
          </div>
        </form>

        <!-- 🎨 底部装饰 -->
        <div class="bottom-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-text">分享快乐 · 传递爱心 · 萌宠世界</div>
          <div class="decoration-line"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 🎨 页面容器 */
.pet-create-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
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

/* 📱 主容器 */
.pet-create-view {
  position: relative;
  z-index: 1;
  animation: containerSlideIn 0.8s ease-out 0.2s both;
}

@keyframes containerSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🎯 导航栏 */
.custom-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-left:hover {
  opacity: 0.8;
}

.nav-arrow {
  font-size: 18px;
}

.nav-title {
  font-weight: bold;
  font-size: 18px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 📝 表单容器 */
.form-container {
  padding: 20px;
  animation: formSlideIn 0.8s ease-out 0.4s both;
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

/* 🎨 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: titleSlideIn 0.8s ease-out 0.6s both;
}

.title-icon {
  font-size: 48px;
  margin-bottom: 15px;
  animation: iconBounce 2s ease-in-out infinite;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}

@keyframes titleSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

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

/* 📝 表单样式 */
.pet-form {
  animation: formContentSlideIn 0.8s ease-out 0.8s both;
}

@keyframes formContentSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 📝 表单组 */
.form-group {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  margin-bottom: 20px;
  padding: 5px 15px;
}

/* 📝 表单字段 */
.form-field {
  animation: fieldSlideIn 0.6s ease-out both;
  transition: all 0.3s ease;
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.form-field:last-child {
  border-bottom: none;
}

.form-field:nth-child(1) { animation-delay: 0.1s; }
.form-field:nth-child(2) { animation-delay: 0.2s; }
.form-field:nth-child(3) { animation-delay: 0.3s; }
.form-field:nth-child(4) { animation-delay: 0.4s; }
.form-field:nth-child(5) { animation-delay: 0.5s; }
.form-field:nth-child(6) { animation-delay: 0.6s; }

@keyframes fieldSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
}

.field-input::placeholder {
  color: #999;
}

.form-field:hover .field-input {
  border-color: #667eea;
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

/* 📝 文本域字段 */
.textarea-input {
  min-height: 80px;
  resize: vertical;
}

/* 🚀 提交区域 */
.submit-section {
  margin: 30px 0;
  animation: submitSlideIn 0.8s ease-out 1s both;
}

@keyframes submitSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 🚀 提交按钮 */
.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  height: 55px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  border-radius: 30px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 20px;
  animation: iconPulse 2s infinite;
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

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
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
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  animation: lineGlow 2s ease-in-out infinite;
}

.decoration-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@keyframes decorationSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
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

/* 📱 响应式设计 */
@media (max-width: 768px) {
  .form-container {
    padding: 15px;
  }
  
  .title-section {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .title-icon {
    font-size: 40px;
  }
  
  .form-title {
    font-size: 20px;
  }
  
  .form-subtitle {
    font-size: 14px;
  }
  
  .submit-btn {
    height: 50px;
    font-size: 16px;
  }
  
  .field-label {
    font-size: 14px;
  }
  
  .field-input {
    font-size: 14px;
    padding: 10px 12px;
  }
  
  .decoration-text {
    font-size: 12px;
  }
  
  .decoration-line {
    width: 40px;
  }
}

/* 🌙 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .title-section {
    background: rgba(30, 30, 30, 0.95);
    color: #fff;
  }
  
  .form-title {
    background: linear-gradient(135deg, #8fa7ff, #9d7bca);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .form-subtitle {
    color: #ccc;
  }
  
  .form-group {
    background: rgba(30, 30, 30, 0.95);
  }
  
  .field-label {
    color: #fff;
  }
  
  .field-input {
    color: #fff;
    background: rgba(50, 50, 50, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .field-input::placeholder {
    color: #aaa;
  }
  
  .custom-nav-bar {
    background: rgba(30, 30, 30, 0.95);
  }
  
  .nav-title {
    background: linear-gradient(135deg, #8fa7ff, #9d7bca);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .nav-left {
    color: #8fa7ff;
  }
}
</style>