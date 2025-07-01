<script setup>
import { ref, onMounted, watch } from 'vue';
import { Tabbar, TabbarItem, showToast, Popup } from 'vant';
import { useRoute,useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
// 导入 AIChatView 组件
import AIChatView from '@/views/AIChatView.vue';

const activeTab = ref(0);
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

// 控制弹窗显示
const showChatPopup = ref(false);
// 控制发布选项弹窗显示
const showPublishOptions = ref(false);

// 跳转到创建帖子页面
const goToCreatePost = () => {
  showPublishOptions.value = false;
  router.push('/create-post');
};

// 跳转到创建宠物页面
const goToCreatePet = () => {
  showPublishOptions.value = false;
  router.push('/create-pet');
};

// 点击发布按钮时显示选项弹窗
const handlePublishClick = () => {
  showPublishOptions.value = true;
};

onMounted(() => {
  userStore.loadUserInfo();
  userStore.fetchCacheUsers();
});

watch(() => route.path, () => {
  userStore.loadUserInfo();
});

const onOffsetChange = (offset) => {
  // 可选：保留 offset 数据用于其他用途
};
const onOffsetChange2 = (offset) => {
  // 可选：保留 offset 数据用于其他用途
};
// 点击悬浮按钮时打开弹窗
const handleBubbleClick = () => {
  showChatPopup.value = true;
};
</script>

<template>
  <div class="app-container">
    <router-view />
    
    <!-- 底部导航栏 -->
    <Tabbar v-if="userStore.userInfo" v-model="activeTab" fixed class="custom-tabbar">
      <TabbarItem icon="home-o" name="home" to="/" class="tab-item">首页</TabbarItem>
      <TabbarItem icon="chat-o" name="cutePet" to="/cutePet" class="tab-item">萌宠</TabbarItem>
      <TabbarItem icon="friends-o" name="social" to="/social" class="tab-item">社区</TabbarItem>
      <TabbarItem icon="user-o" name="profile" to="/profile" class="tab-item">我的</TabbarItem>
    </Tabbar>
  
    <!-- 发布按钮 -->
    <div v-if="userStore.userInfo" class="publish-fab">
      <van-floating-bubble
        axis="xy"
        icon="plus"
        magnetic="x"
        @offset-change="onOffsetChange2"
        @click="handlePublishClick"
        class="publish-button"
        :style="{
          position: 'fixed',
          left: '51%',
          top: '92vh',
          transform: 'translateX(-50%)',
          zIndex: 10  
        }"
      />
      <div class="publish-ripple"></div>
    </div>
    
    <!-- AI聊天按钮 -->
    <div v-if="userStore.userInfo" class="ai-fab">
      <van-floating-bubble
        axis="xy"
        icon='../src/assets/images/logo.png'
        icon-size="20px"
        magnetic="x"
        @offset-change="onOffsetChange"
        @click="handleBubbleClick"
        class="ai-button"
        :style="{
          background: 'linear-gradient(135deg, #ff0cdf 0%, #ff6b9d 100%)',
          zIndex: 999
        }"
      />
      <div class="ai-ripple"></div>
    </div>
  
    <!-- AI聊天弹窗 -->
    <Popup
      v-model:show="showChatPopup"
      position="center"
      class="chat-popup"
      :style="{ width: '95%', height: '80%', borderRadius: '20px' }" 
      round
    >
      <div class="popup-header">
        <div class="popup-title">
          <span class="title-icon">🤖</span>
          <span class="title-text">AI助手</span>
        </div>
        <div class="close-btn" @click="showChatPopup = false">
          <van-icon name="cross" size="18" />
        </div>
      </div>
      <div class="popup-content">
        <AIChatView />
      </div>
    </Popup>

    <!-- 发布选项弹窗 -->
    <Popup
      v-model:show="showPublishOptions"
      position="bottom"
      round
      class="publish-popup"
      :style="{ padding: '30px 20px 40px' }"
    >
      <div class="popup-handle"></div>
      <div class="publish-header">
        <h3 class="publish-title">✨ 发布内容</h3>
        <p class="publish-subtitle">选择你想要分享的内容类型</p>
      </div>
      
      <div class="publish-options">
        <div class="option-item post-option" @click="goToCreatePost">
          <div class="option-icon-wrapper">
            <van-icon name="edit" size="28" color="#1989fa" class="option-icon" />
            <div class="icon-bg post-bg"></div>
          </div>
          <div class="option-content">
            <span class="option-title">发布帖子</span>
            <span class="option-desc">分享你的想法和故事</span>
          </div>
          <div class="option-arrow">
            <van-icon name="arrow" size="16" color="#999" />
          </div>
        </div>
        
        <div class="option-item pet-option" @click="goToCreatePet">
          <div class="option-icon-wrapper">
            <van-icon name="like" size="28" color="#ff9800" class="option-icon" />
            <div class="icon-bg pet-bg"></div>
          </div>
          <div class="option-content">
            <span class="option-title">发布宠物</span>
            <span class="option-desc">展示你的可爱宠物</span>
          </div>
          <div class="option-arrow">
            <van-icon name="arrow" size="16" color="#999" />
          </div>
        </div>
      </div>
    </Popup>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
}

/* 底部导航栏美化 */
.custom-tabbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.custom-tabbar :deep(.van-tabbar-item) {
  transition: all 0.3s ease;
}

.custom-tabbar :deep(.van-tabbar-item--active) {
  transform: translateY(-2px);
}

.custom-tabbar :deep(.van-tabbar-item__icon) {
  transition: all 0.3s ease;
}

.custom-tabbar :deep(.van-tabbar-item--active .van-tabbar-item__icon) {
  transform: scale(1.1);
}

/* 发布按钮容器 */
.publish-fab {
  position: relative;
}

.publish-button {
  animation: fabBounceIn 0.8s ease-out 0.5s both;
}

.publish-button :deep(.van-floating-bubble) {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%) !important;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.publish-button :deep(.van-floating-bubble:hover) {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6);
}

.publish-button :deep(.van-floating-bubble:active) {
  transform: scale(0.95);
}

.publish-ripple {
  position: fixed;
  left: 51%;
  top: 92vh;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  border: 2px solid rgba(255, 107, 107, 0.3);
  border-radius: 50%;
  animation: rippleEffect 2s ease-out infinite;
  pointer-events: none;
  z-index: 999;
}

/* AI按钮容器 */
.ai-fab {
  position: relative;
}

.ai-button {
  animation: aiBounceIn 0.8s ease-out 0.3s both;
}

.ai-button :deep(.van-floating-bubble) {
  box-shadow: 0 8px 25px rgba(255, 12, 223, 0.4);
  transition: all 0.3s ease;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.ai-button :deep(.van-floating-bubble:hover) {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(255, 12, 223, 0.6);
}

.ai-button :deep(.van-floating-bubble:active) {
  transform: scale(0.95);
}

.ai-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border: 2px solid rgba(255, 12, 223, 0.3);
  border-radius: 50%;
  animation: rippleEffect 2s ease-out infinite 1s;
  pointer-events: none;
}

/* AI聊天弹窗 */
.chat-popup {
  animation: popupSlideIn 0.4s ease-out;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.popup-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 20px;
  animation: iconBounce 2s ease-in-out infinite;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  padding: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.popup-content {
  height: calc(100% - 70px);
  overflow: hidden;
}

/* 发布选项弹窗 */
.publish-popup {
  animation: slideUpIn 0.4s ease-out;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.popup-handle {
  width: 40px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  margin: 0 auto 20px;
  animation: handlePulse 2s ease-in-out infinite;
}

.publish-header {
  text-align: center;
  margin-bottom: 25px;
}

.publish-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
  animation: titleSlideIn 0.6s ease-out 0.2s both;
}

.publish-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  animation: subtitleFadeIn 0.6s ease-out 0.4s both;
}

.publish-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  animation: optionSlideIn 0.5s ease-out both;
}

.post-option {
  animation-delay: 0.1s;
}

.pet-option {
  animation-delay: 0.2s;
}

.option-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.option-item:active {
  transform: translateY(0);
}

.option-icon-wrapper {
  position: relative;
  margin-right: 15px;
}

.option-icon {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.icon-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  opacity: 0.1;
  transition: all 0.3s ease;
}

.post-bg {
  background: #1989fa;
}

.pet-bg {
  background: #ff9800;
}

.option-item:hover .icon-bg {
  opacity: 0.2;
  transform: translate(-50%, -50%) scale(1.2);
}

.option-item:hover .option-icon {
  transform: scale(1.1);
}

.option-content {
  flex: 1;
}

.option-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.option-desc {
  display: block;
  font-size: 13px;
  color: #666;
}

.option-arrow {
  transition: all 0.3s ease;
}

.option-item:hover .option-arrow {
  transform: translateX(5px);
}

/* 关键帧动画 */
@keyframes fabBounceIn {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0) rotate(180deg);
  }
  60% {
    opacity: 1;
    transform: translateX(-50%) scale(1.2) rotate(-10deg);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1) rotate(0deg);
  }
}

@keyframes aiBounceIn {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes rippleEffect {
  0% {
    transform: translateX(-50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) scale(2);
    opacity: 0;
  }
}

@keyframes popupSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUpIn {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes handlePulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
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

@keyframes subtitleFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes optionSlideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-popup {
    width: 98% !important;
    height: 70% !important;
  }
  
  .publish-popup {
    padding: 25px 15px 35px !important;
  }
  
  .option-item {
    padding: 18px 15px;
  }
  
  .publish-title {
    font-size: 18px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .custom-tabbar {
    background: rgba(30, 30, 30, 0.95);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  .publish-popup {
    background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  }
  
  .option-item {
    background: #333;
    color: #e0e0e0;
  }
  
  .publish-title {
    color: #f0f0f0;
  }
  
  .publish-subtitle {
    color: #b0b0b0;
  }
  
  .option-title {
    color: #f0f0f0;
  }
  
  .option-desc {
    color: #b0b0b0;
  }
}
</style>