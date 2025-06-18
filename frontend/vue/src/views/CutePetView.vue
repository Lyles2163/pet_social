<template>
  <div class="cute-pet-container">
    <!-- 美化后的导航栏 -->
    <div class="nav-header">
      <van-nav-bar 
        title="🐾 可爱宠物列表" 
        left-arrow 
        @click-left="$router.back()" 
        class="custom-nav"
      />
      <div class="nav-decoration"></div>
    </div>
    
    <!-- 统计信息卡片 -->
    <div class="stats-card" v-if="petStore.pets.length > 0">
      <div class="stat-item">
        <div class="stat-icon">🐕</div>
        <div class="stat-content">
          <div class="stat-number">{{ petStore.pets.length }}</div>
          <div class="stat-label">可爱宠物</div>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-number">{{ uniqueOwnersCount }}</div>
          <div class="stat-label">宠物主人</div>
        </div>
      </div>
    </div>

    <!-- 宠物列表 -->
    <div class="pets-content">
      <van-list
        v-model:loading="petStore.loading"
        :finished="petStore.finished"
        finished-text="🎉 没有更多可爱的宠物了"
        @load="onLoad"
        offset="300"
        class="pet-list"
      >
        <div 
          v-for="(pet, index) in petStore.pets"
          :key="pet.id"
          class="pet-card-wrapper"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="pet-card">
            <!-- 宠物头像区域 -->
            <div class="pet-avatar-section">
              <div class="avatar-wrapper">
                <van-image
                  width="100"
                  height="100"
                  fit="cover"
                  :src="pet.avatar || 'default-avatar.png'"
                  @error="handleImageError"
                  class="pet-avatar"
                />
                <div class="avatar-ring"></div>
                <div class="favorite-btn">
                  <van-icon name="like" size="16" color="#ff6b6b" />
                </div>
              </div>
            </div>

            <!-- 宠物信息区域 -->
            <div class="pet-info-section">
              <div class="pet-header">
                <h3 class="pet-name">{{ pet.name }}</h3>
                <van-tag 
                  :type="pet.gender === 1 ? 'primary' : 'danger'" 
                  class="gender-tag"
                  round
                >
                  {{ genderText(pet.gender) }}
                </van-tag>
              </div>
              
              <div class="pet-details">
                <div class="detail-item">
                  <span class="detail-icon">🐾</span>
                  <span class="detail-text">品种：{{ pet.species }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-icon">🎂</span>
                  <span class="detail-text">年龄：{{ pet.age }}岁</span>
                </div>
              </div>

              <!-- 主人信息 -->
              <div class="owner-section">
                <div class="owner-info">
                  <div class="owner-avatar-wrapper">
                    <van-image
                      width="32"
                      height="32"
                      round
                      :src="pet.owner_avatar || 'default-avatar.png'"
                      @error="handleImageError"
                      class="owner-avatar"
                    />
                  </div>
                  <div class="owner-details">
                    <span class="owner-label">主人</span>
                    <span class="owner-name">{{ pet.username }}</span>
                  </div>
                </div>
                <div class="action-buttons">
                  <div class="action-btn chat-btn">
                    <van-icon name="chat-o" size="14" />
                  </div>
                  <div class="action-btn more-btn">
                    <van-icon name="ellipsis" size="14" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </van-list>
      
      <!-- 空状态 -->
      <div v-if="!petStore.loading && petStore.finished && petStore.pets.length === 0" class="empty-state">
        <div class="empty-icon">🐕‍🦺</div>
        <div class="empty-title">暂无宠物信息</div>
        <div class="empty-desc">快来分享你的可爱宠物吧！</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { usePetStore } from '@/stores/petStore';
import {
  List as VanList,
  Card as VanCard,
  Image as VanImage,
  Tag as VanTag,
  NavBar as VanNavBar,
  Empty as VanEmpty,
  Icon as VanIcon,
  showToast // 引入 Toast 组件用于错误提示
} from 'vant';
import 'vant/lib/index.css'; // 引入 Vant 样式

export default {
  components: {
    VanList,
    VanCard,
    VanImage,
    VanTag,
    VanNavBar,
    VanEmpty,
    VanIcon
  },
  setup() {
    const petStore = usePetStore();
    
    // 计算唯一主人数量
    const uniqueOwnersCount = computed(() => {
      const uniqueOwners = new Set(petStore.pets.map(pet => pet.username));
      return uniqueOwners.size;
    });
    
    // 定义性别文本转换函数
    const genderText = (value) => value === 1 ? '男孩' : '女孩';

    // 处理图片加载失败
    const handleImageError = (event) => {
      event.target.src = 'default-avatar.png'; // 加载失败时显示默认图片
    };

    // Vant List 组件的加载回调
    const onLoad = async () => {
      // 由于我们一次性加载所有数据，onLoad 只需要在组件挂载时触发一次
      // 如果后端接口支持分页，这里需要根据当前页码加载下一页数据
      if (!petStore.finished) {
        try {
          await petStore.fetchPets();
        } catch (error) {
          showToast('加载宠物信息失败'); // 使用 Vant Toast 提示用户
        }
      }
    };

    // 组件挂载时触发加载数据
    onMounted(() => {
      // 重置状态，确保每次进入页面都重新加载
      petStore.resetState();
      onLoad(); // 首次加载数据
    });

    return {
      petStore,
      uniqueOwnersCount,
      genderText,
      onLoad,
      handleImageError
    };
  }
}
</script>

<style scoped>
/* 基础容器 */
.cute-pet-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.cute-pet-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="paws" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="%23ffffff" opacity="0.05"/><circle cx="40" cy="40" r="2" fill="%23ffffff" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23paws)"/></svg>') repeat;
  pointer-events: none;
}

/* 导航栏区域 */
.nav-header {
  position: relative;
  z-index: 10;
}

.custom-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  animation: navSlideDown 0.6s ease-out;
}

.custom-nav :deep(.van-nav-bar__title) {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.nav-decoration {
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
  animation: decorationExpand 1s ease-out 0.3s both;
}

/* 统计卡片 */
.stats-card {
  margin: 20px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: statsSlideIn 0.8s ease-out 0.2s both;
  position: relative;
  z-index: 5;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 24px;
  animation: iconBounce 2s ease-in-out infinite;
}

.stat-content {
  text-align: left;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #ddd, transparent);
}

/* 内容区域 */
.pets-content {
  padding: 0 16px 100px;
  position: relative;
  z-index: 1;
}

.pet-list {
  background: transparent;
}

/* 宠物卡片 */
.pet-card-wrapper {
  margin-bottom: 20px;
  animation: cardSlideUp 0.6s ease-out both;
}

.pet-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pet-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.pet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.pet-card:hover::before {
  left: 100%;
}

/* 头像区域 */
.pet-avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.pet-avatar {
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.pet-card:hover .pet-avatar {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.avatar-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 3px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: all 0.3s ease;
}

.pet-card:hover .avatar-ring {
  opacity: 1;
  animation: ringRotate 3s linear infinite;
}

.favorite-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.8);
}

.pet-card:hover .favorite-btn {
  opacity: 1;
  transform: scale(1);
}

.favorite-btn:hover {
  transform: scale(1.1);
  background: #ff6b6b;
}

.favorite-btn:hover :deep(.van-icon) {
  color: white !important;
}

/* 宠物信息区域 */
.pet-info-section {
  text-align: center;
}

.pet-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pet-name {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.gender-tag {
  font-size: 12px;
  font-weight: 600;
  animation: tagPulse 2s ease-in-out infinite;
}

.pet-details {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.detail-icon {
  font-size: 16px;
}

/* 主人区域 */
.owner-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.owner-avatar-wrapper {
  position: relative;
}

.owner-avatar {
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.owner-info:hover .owner-avatar {
  transform: scale(1.1);
}

.owner-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.owner-label {
  font-size: 11px;
  color: #999;
  line-height: 1;
}

.owner-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
}

.chat-btn {
  background: #4ecdc4;
  color: white;
  border-color: #4ecdc4;
}

.chat-btn:hover {
  background: #45b7d1;
  transform: scale(1.1);
}

.more-btn {
  background: #f8f9fa;
  color: #666;
}

.more-btn:hover {
  background: #e9ecef;
  transform: scale(1.1);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  animation: emptyFadeIn 0.8s ease-out;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: emptyIconFloat 3s ease-in-out infinite;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.empty-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 关键帧动画 */
@keyframes navSlideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes decorationExpand {
  from {
    width: 0;
    margin: 0 auto;
  }
  to {
    width: 100%;
    margin: 0;
  }
}

@keyframes statsSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
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

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes tagPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes ringRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes emptyFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes emptyIconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cute-pet-container {
    padding: 0;
  }
  
  .stats-card {
    margin: 15px 12px;
    padding: 16px;
  }
  
  .pets-content {
    padding: 0 12px 80px;
  }
  
  .pet-card {
    padding: 16px;
  }
  
  .pet-details {
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .pet-name {
    font-size: 18px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .custom-nav {
    background: rgba(30, 30, 30, 0.95);
  }
  
  .custom-nav :deep(.van-nav-bar__title) {
    color: #f0f0f0;
  }
  
  .stats-card,
  .pet-card {
    background: rgba(30, 30, 30, 0.95);
    color: #e0e0e0;
  }
  
  .stat-number,
  .pet-name {
    color: #f0f0f0;
  }
  
  .stat-label,
  .detail-item {
    color: #b0b0b0;
  }
  
  .owner-name {
    color: #f0f0f0;
  }
  
  .owner-label {
    color: #999;
  }
}
</style>