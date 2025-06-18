<template>
  <div class="search-container">
    <!-- 装饰性背景元素 -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <!-- 美化的搜索框 -->
    <div class="search-header">
      <van-search
        v-model="keyword"
        placeholder="请输入搜索关键词"
        show-action
        @search="onSearch"
        @cancel="onCancel"
        class="beautiful-search"
      >
        <!-- 添加左侧返回首页按钮 -->
        <template #left>
          <div class="back-button" @click="goToHome">
            <van-icon name="arrow-left" size="18" />
          </div>
        </template>
      </van-search>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <!-- 搜索历史 -->
      <div class="history-section" v-if="searchStore.searchHistory.length && !keyword">
        <div class="section-header">
          <h3>📚 搜索历史</h3>
        </div>
        <div class="history-tags">
          <van-tag
            plain
            type="primary"
            size="large"
            v-for="(item, index) in searchStore.searchHistory"
            :key="index"
            @click="searchFromHistory(item.keyword)"
            class="history-tag"
          >
            {{ item.keyword }}
          </van-tag>
        </div>
      </div>

      <!-- 萌宠热搜 -->
      <div class="trending-section" v-if="searchStore.trendingKeywords.length && !keyword">
        <div class="section-header">
          <h3>🔥 萌宠热搜</h3>
        </div>
        <div class="trending-tags">
          <van-tag
            plain
            type="danger"
            size="large"
            v-for="(item, index) in searchStore.trendingKeywords"
            :key="'trending-' + index"
            @click="searchFromTrending(item.keyword)"
            class="trending-tag"
          >
            {{ item.keyword }}
          </van-tag>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="result-section" v-if="keyword">
        <van-tabs v-model:active="activeTab" class="result-tabs">
          <van-tab title="🐾 宠物结果">
            <!-- 宠物结果 -->
            <div class="pet-results">
              <van-cell
                v-for="pet in searchStore.petResults"
                :key="'pet-' + pet.id"
                :title="pet.name"
                :label="`品种：${pet.species} | 年龄：${pet.age}岁`"
                class="pet-cell"
              >
                <template #icon>
                  <div class="pet-avatar">
                    <van-image
                      width="50"
                      height="50"
                      :src="pet.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
                      class="avatar-image"
                    />
                  </div>
                </template>
              </van-cell>
              <van-empty 
                v-if="searchStore.petResults.length === 0 && searchPerformed" 
                description="🐱 未找到相关宠物" 
                class="empty-state"
              />
            </div>
          </van-tab>
          <van-tab title="📝 帖子结果">
            <!-- 帖子结果 -->
            <div class="post-results">
              <van-cell
                v-for="post in searchStore.postResults"
                :key="'post-' + post.id"
                :title="post.title"
                :label="`作者：${post.username} | 点赞：${post.like_count}`"
                @click="goToPostDetail(post.id)"
                class="post-cell"
              />
              <van-empty 
                v-if="searchStore.postResults.length === 0 && searchPerformed" 
                description="📄 未找到相关帖子" 
                class="empty-state"
              />
            </div>
          </van-tab>
        </van-tabs>
      </div>
      
      <van-empty 
        v-if="!keyword && !searchStore.searchHistory.length && !searchStore.trendingKeywords.length" 
        description="🔍 暂无搜索历史或热搜" 
        class="empty-state"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search as VanSearch, Cell as VanCell, Image as VanImage, Tag as VanTag, Tabs as VanTabs, Tab as VanTab, Empty as VanEmpty, Notify, Icon as VanIcon } from 'vant';
import { useRouter } from 'vue-router';
import { useSearchStore } from '@/stores/searchStore.js';

const keyword = ref('');
const activeTab = ref(0);
const searchPerformed = ref(false);

const router = useRouter();
const searchStore = useSearchStore();

// 执行搜索
const onSearch = async () => {
  if (!keyword.value.trim()) {
    searchStore.clearResults();
    searchPerformed.value = false;
    await searchStore.fetchSearchHistory();
    await searchStore.fetchTrendingKeywords();
    return;
  }

  searchPerformed.value = true;
  try {
    await searchStore.searchPetsAndPosts(keyword.value);
  } catch (error) {
    Notify({ type: 'danger', message: searchStore.error || '搜索失败，请稍后重试' });
  }
};

// 取消搜索
const onCancel = async () => {
  keyword.value = '';
  searchStore.clearResults();
  searchPerformed.value = false;
  await searchStore.fetchSearchHistory();
  await searchStore.fetchTrendingKeywords();
};

// 从历史记录中搜索
const searchFromHistory = (histKeyword) => {
  keyword.value = histKeyword;
  onSearch();
};

// 从热搜中搜索
const searchFromTrending = async (trendKeyword) => {
  keyword.value = trendKeyword;
  searchPerformed.value = true;

  try {
    await searchStore.searchPostsByTag(trendKeyword);
    activeTab.value = 1;
  } catch (error) {
    Notify({ type: 'danger', message: searchStore.error || '根据标签搜索帖子失败，请稍后重试' });
  }
};

// 跳转到帖子详情页
const goToPostDetail = (postId) => {
  router.push({ name: 'postdetail', params: { id: postId } });
};

// 组件挂载时获取搜索历史和热搜
onMounted(async () => {
  await searchStore.fetchSearchHistory();
  await searchStore.fetchTrendingKeywords();
});

// 返回首页
const goToHome = () => {
  router.push('/');
};
</script>

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

/* 标签动画 */
@keyframes tagSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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

/* 背景圆圈动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 卡片悬停动画 */
@keyframes cardHover {
  from {
    transform: translateY(0) scale(1);
  }
  to {
    transform: translateY(-4px) scale(1.02);
  }
}

/* 主容器 */
.search-container {
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

/* 搜索头部 */
.search-header {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
  padding: 10px;
}

.beautiful-search {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.beautiful-search :deep(.van-search__content) {
  background: transparent;
  border-radius: 25px;
}

.beautiful-search :deep(.van-field__control) {
  font-size: 16px;
  color: #fffcfc;
}

.beautiful-search :deep(.van-field__control)::placeholder {
  color: #ffffff;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  margin-right: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.back-button:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: scale(1.1);
}

.back-button:active {
  transform: scale(0.95);
}

/* 内容区域 */
.content-area {
  padding: 20px;
  position: relative;
  z-index: 5;
  animation: containerFadeIn 0.8s ease-out 0.2s both;
}

/* 区块样式 */
.history-section, .trending-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  animation: containerFadeIn 0.6s ease-out;
}

.history-section::before, .trending-section::before {
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

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  animation: iconBounce 2s ease-in-out infinite;
}

/* 标签样式 */
.history-tags, .trending-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag, .trending-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  animation: tagSlideIn 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

.history-tag:nth-child(n) {
  animation-delay: calc(0.1s * var(--index, 0));
}

.trending-tag:nth-child(n) {
  animation-delay: calc(0.1s * var(--index, 0));
}

.history-tag:hover, .trending-tag:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.history-tag:active, .trending-tag:active {
  transform: translateY(0) scale(0.98);
}

/* 结果区域 */
.result-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  animation: containerFadeIn 0.6s ease-out;
}

.result-tabs :deep(.van-tabs__nav) {
  background: rgba(102, 126, 234, 0.1);
}

.result-tabs :deep(.van-tab) {
  font-weight: 600;
  color: #666;
}

.result-tabs :deep(.van-tab--active) {
  color: #667eea;
}

.result-tabs :deep(.van-tabs__line) {
  background: linear-gradient(90deg, #667eea, #764ba2);
  height: 3px;
  border-radius: 2px;
}

/* 宠物结果 */
.pet-results, .post-results {
  padding: 16px;
}

.pet-cell, .post-cell {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.pet-cell:hover, .post-cell:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.pet-cell:active, .post-cell:active {
  transform: translateY(0);
}

.pet-avatar {
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  margin-right: 12px;
}

.avatar-image {
  border-radius: 50%;
  transition: all 0.3s ease;
}

.pet-cell:hover .avatar-image {
  transform: scale(1.1) rotate(5deg);
}

/* 空状态 */
.empty-state {
  padding: 40px 20px;
  color: #999;
}

.empty-state :deep(.van-empty__description) {
  color: #999;
  font-size: 16px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-area {
    padding: 16px;
  }
  
  .history-section, .trending-section {
    padding: 16px;
    border-radius: 16px;
  }
  
  .section-header h3 {
    font-size: 16px;
  }
  
  .beautiful-search {
    border-radius: 20px;
  }
  
  .pet-results, .post-results {
    padding: 12px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .search-container {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }
  
  .history-section, .trending-section, .result-section {
    background: rgba(45, 55, 72, 0.95);
    color: white;
  }
  
  .section-header h3 {
    color: #e2e8f0;
  }
  
  .pet-cell, .post-cell {
    background: rgba(74, 85, 104, 0.8);
    color: white;
  }
  
  .pet-cell:hover, .post-cell:hover {
    background: rgba(74, 85, 104, 0.95);
  }
  
  .beautiful-search {
    background: rgba(74, 85, 104, 0.9);
  }
  
  .beautiful-search :deep(.van-field__control) {
    color: #e2e8f0;
  }
}
</style>