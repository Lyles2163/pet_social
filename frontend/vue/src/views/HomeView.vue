<script setup>
import { ref, onMounted } from 'vue';
import { Swipe, SwipeItem, Grid, GridItem, Button, Image as VanImage, Icon, Search as VanSearch } from 'vant';
import { CUTE_GIF } from '@/stores/global';
import { USERS_DEFAULT_AVATAR } from '@/stores/global';
import { useUserStore } from '@/stores/userStore';
import { usePostStore } from '@/stores/postStore'; // 新增：导入postStore
import { useGlobalStore } from '@/stores/global'; // 导入 global store
import { useRouter } from 'vue-router'; // 导入 useRouter

function getIcon(name) {
  return new URL(`../assets/images/icon/${name}.png`, import.meta.url).href;
}

const userList = ref([]);
const router = useRouter(); // 获取路由实例
const value = ref(''); // 搜索框的值
const weatherInfo = ref(null); // 存储天气信息
const globalStore = useGlobalStore(); // 获取 global store 实例
const postStore = usePostStore(); // 新增：获取 post store 实例

// 新增：获取当前位置并获取天气信息
const fetchCurrentWeather = async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // 调用 store 中的接口获取地址和 adcode
        const addressResult = await globalStore.fetchAddressByRestApi(longitude, latitude);
        if (addressResult.status === '1' && addressResult.regeocode) {
          const adcode = addressResult.regeocode.addressComponent.adcode;
          // 调用 store 中的接口获取天气
          const weatherResult = await globalStore.fetchWeatherByAdcode(adcode);
          if (weatherResult.status === '1' && weatherResult.lives?.length > 0) {
            const weatherData = weatherResult.lives[0];
            weatherInfo.value = {
              city: weatherData.city,
              weather: weatherData.weather,
              temperature: `${weatherData.temperature}℃`,
            };
          } else {
            console.error('获取天气失败:', weatherResult.info || '无数据');
            weatherInfo.value = { city: '未知', weather: '未知', temperature: '--℃' };
          }
        } else {
          console.error('地址解析失败:', addressResult.info || '无数据');
          weatherInfo.value = { city: '未知', weather: '未知', temperature: '--℃' };
        }
      } catch (error) {
        console.error('获取位置或天气异常:', error);
        weatherInfo.value = { city: '未知', weather: '未知', temperature: '--℃' };
      }
    }, (error) => {
      console.error('定位失败:', error);
      weatherInfo.value = { city: '定位失败', weather: '--', temperature: '--℃' };
    });
  } else {
    console.error('浏览器不支持地理位置');
    weatherInfo.value = { city: '不支持定位', weather: '--', temperature: '--℃' };
  }
};

// 新增：跳转到 IPMap 页面
const goToMap = () => {
  router.push('/ipmap');
};

const goToSearch = () => {
  router.push('/search');
};
// 修改：使用 postStore 的 fetchPosts 方法
const fetchPosts = async () => {
  try {
    await postStore.fetchPosts();
  } catch (error) {
    console.error('获取帖子列表失败:', error);
  }
};

// 跳转到帖子详情页
const goToPostDetail = (postId) => {
  // 修改这里，使用命名路由并传递参数
  router.push({ name: 'postdetail', params: { id: postId } });
};

onMounted(async () => {
  try {
    const res = await userStore.fetchCacheUsers();
    userList.value = res.data || [];
    console.log(userList.value);
  } catch (error) {
    console.error('获取用户缓存失败:', error);
  }
  fetchPosts(); // 在组件挂载后调用获取帖子列表的函数
  fetchCurrentWeather(); // 在组件挂载后获取当前位置和天气
});

const userStore = useUserStore();
const cuteGif = CUTE_GIF;
const swipes = ref([
  { url: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.4gMiS5qRJUF-TPCHYtWYKwHaHa?w=174&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'  },
  { url: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.4EtSV0AnfAp609CDDpMZ8QHaFO?w=242&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'  }
]);

const swipes2 = ref([
  { url: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.Z1U5EaCV4PVYhVsFnXfIQgHaHa?w=142&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'  },
  { url: 'https://cbu01.alicdn.com/img/ibank/2020/303/265/14533562303_1455645693.jpg'  },
  { url: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.4EtSV0AnfAp609CDDpMZ8QHaFO?w=242&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'  },
  { url: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.jq5eFik3TkpYq-hy08knIwHaE0?rs=1&pid=ImgDetMain'  },
]);
const grids = ref([
  { icon: 'friends-o', text: '热门话题' },
  { icon: 'comment-o', text: '宠物资讯' },
  { icon: 'star-o', text: '精选推荐' },
  { icon: 'chat-o', text: 'AI咨询' },
  { icon: 'friends-o', text: '社区' },
  { icon: 'plus', text: '更多' },
  { icon: 'location-o', text: '附近' },
  { icon: 'calendar-o', text: '日程' },
]);
</script>

<template>
  <div class="home-container">
    <!-- 🌈 美化背景 -->
    <div class="bj"></div>
    
    <!-- ✨ 装饰元素 -->
    <div class="decorative-elements">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
      <div class="floating-star star-1">⭐</div>
      <div class="floating-star star-2">🌟</div>
      <div class="floating-star star-3">✨</div>
    </div>

    <!-- 🔍 搜索和天气容器 -->
    <div class="search-weather-container">
      <!-- 🌤️ 天气信息显示区域 -->
      <div class="weather-display" @click="goToMap">
        <div v-if="weatherInfo" class="weather-content">
          <div class="city-name">
            <span class="weather-emoji">📍</span>
            {{ weatherInfo.city }} 
            <Icon name="arrow-down" class="arrow-icon" />
          </div>
          <div class="weather-temp">
            <span class="weather-emoji">🌤️</span>
            {{ weatherInfo.weather }} {{ weatherInfo.temperature }}
          </div>
        </div>
        <div v-else class="weather-loading">
          <span class="loading-emoji">🔄</span>
          加载天气...
        </div>
      </div>
      
      <!-- 🔍 搜索框 -->
      <van-search
        @click="goToSearch"
        clearable
        v-model="value"
        shape="round"
        background="transparent"
        placeholder=" 请输入搜索关键词"
        class="search-bar"
      />
    </div>

    <!-- 🎯 图标容器 -->
    <div class="icon-container">
      <div class="icon_div" v-for="(icon, index) in [
        { src: getIcon('Scan'), text: '扫一扫',  },
        { src: getIcon('Payment'), text: '收付款' },
        { src: getIcon('Travel'), text: '出行' },
        { src: getIcon('Card'), text: '卡包' }
      ]" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
        <div class="icon-wrapper">
          <img class="icon-item" :src="icon.src" alt="">
          <div class="icon-emoji">{{ icon.emoji }}</div>
        </div>
        <p class="p_icon">{{ icon.text }}</p>
      </div>
    </div>

    <div class="home-page">
      <!-- 🎠 轮播图和功能入口合并区域 -->
      <div class="carousel-grid-section">
        <!-- 轮播图区域 -->
        <div class="carousel-section">
          <div class="swipe-container left-swipe">
            <Swipe class="swipe" autoplay="3000" vertical>
              <SwipeItem v-for="(item, index) in swipes" :key="index">
                <img :src="item.url" />
              </SwipeItem>
            </Swipe>
          </div>
          
          <div class="image-container center-image">
            <div class="image-overlay">
              <div class="promo-badge top-badge">🎉 萌宠大放送 精彩乐不停</div>
              <div class="promo-badge bottom-badge">🎁 速来领劵 享优惠 更多惊喜</div>
            </div>
          </div>
          
          <div class="swipe-container right-swipe">
            <Swipe class="swipe" autoplay="3000">
              <SwipeItem v-for="(item, index) in swipes2" :key="index">
                <img :src="item.url" />
              </SwipeItem>
            </Swipe>
          </div>
        </div>

        <!-- 🎯 功能入口网格 -->
        <div class="grid-section-compact">
          <Grid :column-num="4" :border="false" class="transparent-grid-item-compact">
            <GridItem
              v-for="(item, index) in grids"
              :key="index"
              :icon="item.icon"
              :text="item.text"
              class="grid-item-enhanced-compact"
              :style="{ animationDelay: `${index * 0.05}s` }"
            />
          </Grid>
        </div>
      </div>

      <!-- 📱 帖子列表 -->
      <div class="posts-list">
        <div 
          class="post-item" 
          v-for="(post, index) in postStore.postsList" 
          :key="post.id" 
          @click="goToPostDetail(post.id)"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="post-image-wrapper">
            <VanImage
              width="100%"
              height="150"
              fit="cover"
              :src="post.cover_image || 'placeholder.jpg'"
              class="post-image"
            />
            <div class="post-overlay">
              <div class="like-badge">
                <Icon name="like-o" /> {{ post.like_count }}
              </div>
            </div>
          </div>
          
          <div class="post-content">
            <div class="post-title">{{ post.title }}</div>
            <div class="post-description">{{ post.content }}</div>
            <div class="post-meta">
              <div class="post-user">
                <VanImage
                  round
                  width="20"
                  height="20"
                  :src="post.avatar || USERS_DEFAULT_AVATAR"
                  class="user-avatar"
                />
                <span class="username">{{ post.username || '未知用户' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="upup"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 🎨 页面容器动画 */
.home-container {
  animation: pageSlideIn 0.8s ease-out;
  position: relative;
  overflow-x: hidden;
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
.bj {
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #f5576c 75%,
    #4facfe 100%
  );
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
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

/* 🔍 搜索和天气容器 */
.search-weather-container {
  display: flex;
  align-items: center; /* 确保垂直居中对齐 */
  gap: 15px; /* 使用gap替代margin-right */
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: containerSlideIn 0.6s ease-out 0.2s both;
  /* 防止换行 */
  flex-wrap: nowrap;
}

@keyframes containerSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🌤️ 天气显示 */
.weather-display {
  flex-grow: 1;
 
  color: white;
  cursor: pointer;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.weather-display:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.weather-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  white-space: nowrap; /* 防止文字换行 */
}

.city-name {
  font-size: 14px; /* 稍微减小字体 */
  font-weight: bold;
  display: flex;
  align-items: center;
  margin-bottom: 3px; /* 减小间距 */
}

.weather-temp {
  font-size: 12px; /* 稍微减小字体 */
  display: flex;
  align-items: center;
}

.weather-emoji {
  margin-right: 3px; /* 减小间距 */
  font-size: 14px;
}

.arrow-icon {
  margin-left: 3px;
  animation: bounce 2s infinite;
}

.weather-loading {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.loading-emoji {
  margin-right: 5px;
  animation: spin 1s linear infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 🔍 搜索框 */
.search-bar {
  flex: 6; /* 占据剩余空间 */
  /* 允许收缩 */
  border-radius: 25px;
  overflow: hidden;
}

.search-bar :deep(.van-search__content) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.search-bar :deep(.van-search__content):hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

/* 🎯 图标容器 */
.icon-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 15px;
  margin: 0 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: containerSlideIn 0.6s ease-out 0.4s both;
}

.icon_div {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: iconSlideUp 0.6s ease-out both;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.icon_div:hover {
  transform: translateY(-5px);
}

.icon-wrapper {
  position: relative;
  margin-bottom: 8px;
}

.icon-item {
  width: 45px;
  height: 45px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  object-fit: contain;
}

.icon-item:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.icon-emoji {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 16px;
  animation: pulse 2s infinite;
}

.p_icon {
  font-size: 14px;
  color: #ffffff;
  margin: 0;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@keyframes iconSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* 🏠 主页内容 */
.home-page {
  padding: 15px;
  animation: contentFadeIn 0.8s ease-out 0.6s both;
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🎠 轮播图和功能入口合并区域 */
.carousel-grid-section {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 🎠 轮播图区域 */
.carousel-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
}

.swipe-container {
  flex:1 ;
  animation: swipeSlideIn 0.8s ease-out both;
}

.left-swipe {
  width: 100%;
  animation-delay: 0.1s;
}

.right-swipe {
  animation-delay: 0.3s;
}

.swipe {
  height: 12vh;
  width: 12vh;
  margin: 1vh;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.swipe:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.swipe img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.swipe:hover img {
  transform: scale(1.1);
}

.center-image {
  position: relative;
  flex: 1.5;
  animation: centerImageSlideIn 0.8s ease-out 0.2s both;
}

.imgss {
  width: 100%;
  height: 14vh;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.center-image:hover .imgss {
  transform: scale(1.02);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.promo-badge {
  position: absolute;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: badgeFloat 3s ease-in-out infinite;
}

.top-badge {
transform: translateX(-200px);
  left: 12px;
  background: rgba(255, 193, 7, 0.9);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.bottom-badge {
  bottom: 8px;
  left: 12px;
  background: rgba(220, 53, 69, 0.9);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  animation-delay: 1.5s;
}

@keyframes swipeSlideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes centerImageSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes badgeFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* 🎯 紧凑网格区域 */
.grid-section-compact {

}

.transparent-grid-item-compact :deep(.van-grid) {
  background-color: transparent !important;
}

.transparent-grid-item-compact :deep(.van-grid-item) {
  background-color: transparent !important;
  border: none !important;
}

.transparent-grid-item-compact :deep(.van-grid-item__content) {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  margin: 3px;
  padding: 8px 6px;
  min-height: 60px;
}

.grid-item-enhanced-compact {
  animation: gridItemSlideIn 0.6s ease-out both;
}

.transparent-grid-item-compact :deep(.van-grid-item__content):hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.transparent-grid-item-compact :deep(.van-grid-item__icon) {
  font-size: 20px !important;
  color: #fff !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.transparent-grid-item-compact :deep(.van-grid-item__content):hover .van-grid-item__icon {
  transform: scale(1.1);
}

.transparent-grid-item-compact :deep(.van-grid-item__text) {
  color: #fff !important;
  font-weight: 500;
  font-size: 12px !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin-top: 4px;
}

@keyframes gridItemSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 📱 帖子列表 */
.posts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: space-between;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.post-item {
  width: calc(50% - 7.5px);
  flex: 0 0 calc(50% - 7.5px); /* 添加flex属性确保宽度固定 */
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: postSlideIn 0.6s ease-out both;
  margin-bottom: 15px; /* 确保底部有间距 */
  max-width: calc(50% - 7.5px); /* 添加最大宽度限制 */
}

.post-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 1);
}

.post-image-wrapper {
  position: relative;
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: 150px;
  transition: transform 0.3s ease;
}

.post-item:hover .post-image {
  transform: scale(1.1);
}

.post-overlay {
  position: absolute;
  top: 0;
  right: 0;
  padding: 10px;
}

.like-badge {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  color: #ff6b6b;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.post-item:hover .like-badge {
  background: #ff6b6b;
  color: white;
  transform: scale(1.1);
}

.post-content {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.post-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  transition: color 0.3s ease;
}

.post-item:hover .post-title {
  color: #667eea;
}

.post-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  border: 2px solid rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.post-item:hover .user-avatar {
  border-color: #667eea;
  transform: scale(1.1);
}

.username {
  font-size: 12px;
  color: #999;
  font-weight: 500;
  transition: color 0.3s ease;
}

.post-item:hover .username {
  color: #667eea;
}

@keyframes postSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.upup {
  width: 100%;
  height: 80px;
}

/* 📱 响应式设计 */
@media (max-width: 768px) {
  .carousel-section {
    flex-direction: row;
    
   
  }
  
  .swipe-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .post-item {
    width: 100%;
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .icon-container {
    padding: 15px 10px;
  }
  
  .icon-item {
    width: 35px;
    height: 35px;
  }
  
  .p_icon {
    font-size: 12px;
  }
}

/* 响应式设计 - 确保在小屏幕上也能正常显示 */
@media (max-width: 480px) {
  .search-weather-container {
    padding: 12px;
    gap: 10px;
  }
  
  .weather-display {
    min-width: 100px;
    padding: 8px;
  }
  
  .city-name {
    font-size: 12px;
  }
  
  .weather-temp {
    font-size: 11px;
  }
  
  .weather-emoji {
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .weather-display {
    min-width: 80px;
    padding: 6px;
  }
  
  .city-name {
    font-size: 11px;
  }
  
  .weather-temp {
    font-size: 10px;
  }
}

/* 🌙 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .post-item {
    background: rgba(30, 30, 30, 0.95);
    color: #fff;
  }
  
  .post-title {
    color: #fff;
  }
  
  .post-item:hover .post-title {
    color: #8fa7ff;
  }
  
  .post-description {
    color: #ccc;
  }
  
  .username {
    color: #aaa;
  }
  
  .post-item:hover .username {
    color: #8fa7ff;
  }
}
</style>