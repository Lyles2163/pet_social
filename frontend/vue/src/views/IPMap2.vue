<template>
  <div class="map-container">
    <!-- 装饰性背景元素 -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <!-- 美化的分割线 -->
    <div class="divider-container">
      <van-divider 
        :style="{ color: '#667eea', borderColor: '#667eea', padding: '0 16px' }"
        class="beautiful-divider"
      >
        🗺️ 地区选择
      </van-divider>
    </div>

    <!-- 地图容器 -->
    <div class="map-wrapper">
      <div id="container" class="map"></div>
    </div>

    <!-- 按钮组 -->
    <div class="button-group">
      <van-button 
        type="primary" 
        round 
        @click="getLocation"
        icon="location-o"
        class="action-btn location-btn"
      >
        <span class="btn-text">📍 重新定位</span>
      </van-button>
      <van-button 
        type="success" 
        round 
        @click="showPoiDrawer = true"
        icon="location-o"
        class="action-btn poi-btn"
      >
        <span class="btn-text">🏪 周边地点 ({{ nearbyPois.length }})</span>
      </van-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading vertical class="custom-loading">
        <div class="loading-text">🌍 正在获取位置信息...</div>
      </van-loading>
    </div>

    <!-- 信息卡片 -->
    <div v-else class="info-container">
      <van-cell-group class="info-group">
        <div class="weather-box">
          <van-divider 
            content-position="left"
            :style="{ color: '#07c160', margin: '16px 0' }"
            class="weather-divider"
          >
            <van-icon name="weather-o" size="20" class="weather-icon" /> 🌤️ 天气信息
          </van-divider>
          
          <van-cell v-if="weatherInfo" class="weather-cell">
            <template #title>
              <div class="weather-title">
                <van-tag type="primary" size="large" class="location-tag">{{ weatherInfo.province }}</van-tag>
                <van-tag type="success" size="large" class="location-tag">{{ weatherInfo.city }}</van-tag>
                <van-tag plain type="warning" size="large" class="weather-tag">{{ weatherInfo.weather }}</van-tag>
              </div>
            </template>
            <template #label>
              <div class="weather-detail">
                <p class="detail-item">🌡️ 温度: <span class="detail-value">{{ weatherInfo.temperature }}</span></p>
                <p class="detail-item">💧 湿度: <span class="detail-value">{{ weatherInfo.humidity }}</span></p>
                <p class="detail-item">🎐 风向: <span class="detail-value">{{ weatherInfo.winddirection }}</span></p>
                <p class="detail-item">🌀 风力: <span class="detail-value">{{ weatherInfo.windpower }}</span></p>
                <p class="update-time">🕒 {{ weatherInfo.reporttime }}</p>
              </div>
            </template>
          </van-cell>
          <van-empty v-else description="🌫️ 暂无天气信息" class="empty-state" />
        </div>
      </van-cell-group>
    </div>

    <!-- POI抽屉 -->
    <van-popup
      v-model:show="showPoiDrawer"
      position="bottom"
      :style="{ height: '70%', borderRadius: '20px 20px 0 0' }"
      class="poi-popup"
    >
      <van-nav-bar
        title="🏪 周边地点"
        left-text="关闭"
        left-arrow
        @click-left="showPoiDrawer = false"
        class="poi-nav-bar"
      />
      <van-list class="poi-drawer">
        <van-cell 
          v-for="(poi, index) in nearbyPois" 
          :key="index" 
          @click="moveToPoi(poi)"
          class="poi-cell"
        >
          <template #title>
            <div class="poi-title">
              <span class="poi-name">📍 {{ poi.name }}</span>
              <van-tag type="danger" class="distance-tag">
                {{ poi.distance }}米
              </van-tag>
            </div>
          </template>
          <template #label>
            <span class="poi-address">🏠 {{ poi.address }}</span>
          </template>
        </van-cell>
      </van-list>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useGlobalStore } from '@/stores/global'
import { 
  Popup as VanPopup,
  NavBar as VanNavBar,
  List as VanList,
  Button as VanButton,
  Loading as VanLoading,
  Empty as VanEmpty,
  Divider as VanDivider,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  Tag as VanTag,
  Icon as VanIcon
} from 'vant'

const store = useGlobalStore()

// 默认经纬度：广州白云
const DEFAULT_LAT = 23.382501
const DEFAULT_LNG = 113.443763

// 响应式状态
const map = ref(null)
const marker = ref(null)
const infoWindow = ref(null)
const loading = ref(false)
const position = reactive({ lng: '', lat: '' })
const address = ref('')
const adcode = ref('')
const nearbyPois = ref([])
const weatherInfo = ref(null)
const showPoiDrawer = ref(false)

// 地图初始化
const initMap = (center = [DEFAULT_LNG, DEFAULT_LAT]) => {
  map.value = new AMap.Map('container', {
    zoom: 13,
    center,
    viewMode: '2D'
  })
}

// 创建可拖动标记
const createDraggableMarker = (lnglat) => {
  if (marker.value) map.value.remove(marker.value)

  marker.value = new AMap.Marker({
    position: new AMap.LngLat(lnglat.lng, lnglat.lat),
    title: '拖动我选择位置',
    draggable: true,
    cursor: 'move'
  })

  marker.value.on('dragend', (e) => {
    const newPosition = e.target.getPosition()
    position.lng = newPosition.getLng()
    position.lat = newPosition.getLat()
    map.value.setCenter([position.lng, position.lat])
    reverseGeocode(position.lng, position.lat)
    searchNearbyPoisByApi(position.lng, position.lat)
  })

  marker.value.on('click', () => {
    infoWindow.value.open(map.value, marker.value.getPosition())
  })

  map.value.add(marker.value)
}

// 获取当前位置
const getLocation = async () => {
  loading.value = true
  try {
    // 获取客户端IP
    const clientIp = await store.fetchClientIp()
    if (!clientIp) throw new Error('无法获取客户端IP')

    // 使用IP定位获取坐标
    const ipResult = await store.fetchIpLocation(clientIp)
    if (ipResult.status === '1') {
      // 成功获取IP定位信息
      const [lng, lat] = ipResult.rectangle.split(';')[0].split(',').map(Number)
      position.lng = lng
      position.lat = lat
      map.value.setCenter([lng, lat])
      createDraggableMarker({ lng, lat })
      await reverseGeocode(lng, lat)
      searchNearbyPoisByApi(lng, lat)
    } else {
      // IP定位失败，使用默认经纬度
      console.warn('IP定位失败，使用默认坐标:', { lng: DEFAULT_LNG, lat: DEFAULT_LAT })
      position.lng = DEFAULT_LNG
      position.lat = DEFAULT_LAT
      map.value.setCenter([DEFAULT_LNG, DEFAULT_LAT])
      createDraggableMarker({ lng: DEFAULT_LNG, lat: DEFAULT_LAT })
      await reverseGeocode(DEFAULT_LNG, DEFAULT_LAT)
      searchNearbyPoisByApi(DEFAULT_LNG, DEFAULT_LAT)
    }
  } catch (error) {
    // 异常捕获，兜底到默认坐标
    console.error('定位异常:', error)
  
    position.lng = DEFAULT_LNG
    position.lat = DEFAULT_LAT
    map.value.setCenter([DEFAULT_LNG, DEFAULT_LAT])
    createDraggableMarker({ lng: DEFAULT_LNG, lat: DEFAULT_LAT })
    await reverseGeocode(DEFAULT_LNG, DEFAULT_LAT)
    searchNearbyPoisByApi(DEFAULT_LNG, DEFAULT_LAT)
  } finally {
    loading.value = false
  }
}

// 逆向地理编码
const reverseGeocode = async (lng, lat) => {
  loading.value = true
  AMap.plugin('AMap.Geocoder', async () => {
    const geocoder = new AMap.Geocoder({ radius: 1000, extensions: 'all' })
    geocoder.getAddress(new AMap.LngLat(lng, lat), async (status, result) => {
      if (status === 'complete' && result.regeocode) {
        handleGeocodeSuccess(result.regeocode)
      } else {
        await handleGeocodeFallback(lng, lat)
      }
      loading.value = false
    })
  })
}

// 处理地理编码成功
const handleGeocodeSuccess = (regeocode) => {
  address.value = regeocode.formattedAddress
  adcode.value = regeocode.addressComponent.adcode
  updateInfoWindow(address.value)
  fetchWeatherByAdcode(adcode.value)
}

// 地理编码备用方案
const handleGeocodeFallback = async (lng, lat) => {
  try {
    const result = await store.fetchAddressByRestApi(lng, lat)
    if (result.status === '1' && result.regeocode) {
      address.value = result.regeocode.formatted_address
      adcode.value = result.regeocode.addressComponent.adcode
      updateInfoWindow(address.value)
      fetchWeatherByAdcode(adcode.value)
    }
  } catch (error) {
    console.error('地址解析失败:', error)
  }
}

// 获取周边POI
const searchNearbyPoisByApi = async (lng, lat) => {
  try {
    const result = await store.searchNearbyPoisByApi(lng, lat)
    if (result.status === '1' && result.pois?.length > 0) {
      nearbyPois.value = result.pois.map(poi => ({
        name: poi.name,
        address: poi.address,
        distance: parseInt(poi.distance),
        location: {
          lng: parseFloat(poi.location.split(',')[0]),
          lat: parseFloat(poi.location.split(',')[1])
        }
      }))
    }
  } catch (error) {
    console.error('周边地点搜索失败:', error)
  }
}

// 获取天气信息
const fetchWeatherByAdcode = async (adcode) => {
  try {
    const result = await store.fetchWeatherByAdcode(adcode)
    if (result.status === '1' && result.lives?.length > 0) {
      const weatherData = result.lives[0]
      weatherInfo.value = {
        city: weatherData.city,
        province: weatherData.province,
        weather: weatherData.weather,
        temperature: `${weatherData.temperature}℃`,
        humidity: `${weatherData.humidity}%`,
        winddirection: weatherData.winddirection,
        windpower: weatherData.windpower,
        reporttime: weatherData.reporttime
      }
    }
  } catch (error) {
    console.error('天气获取失败:', error)
  }
}

// 更新信息窗口
const updateInfoWindow = (content) => {
  if (!infoWindow.value) {
    infoWindow.value = new AMap.InfoWindow()
  }
  infoWindow.value.setContent(content)
  if (marker.value) {
    infoWindow.value.open(map.value, marker.value.getPosition())
  }
}

// 移动至POI位置
const moveToPoi = (poi) => {
  const { lng, lat } = poi.location
  position.lng = lng
  position.lat = lat
  map.value.setCenter([lng, lat])
  marker.value.setPosition(new AMap.LngLat(lng, lat))
  reverseGeocode(lng, lat)
}

onMounted(() => {
  initMap()
  getLocation()
})
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

/* 渐变动画 */
@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 主容器 */
.map-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  animation: pageSlideIn 0.6s ease-out;
  padding: 0 16px;
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

/* 分割线容器 */
.divider-container {
  position: relative;
  z-index: 5;
  animation: containerFadeIn 0.8s ease-out 0.2s both;
}

.beautiful-divider {
  font-weight: 600;
  font-size: 16px;
  animation: iconBounce 2s ease-in-out infinite;
}

/* 地图容器 */
.map-wrapper {
  position: relative;
  z-index: 5;
  animation: containerFadeIn 0.8s ease-out 0.4s both;
}

.map {
  height: 40vh;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  position: relative;
}

.map::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
  background-size: 300% 100%;
  animation: gradientShift 3s ease infinite;
  z-index: 10;
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 20px 0;
  position: relative;
  z-index: 5;
  animation: containerFadeIn 0.8s ease-out 0.6s both;
}

.action-btn {
  flex: 1;
  max-width: 200px;
  height: 50px;
  font-weight: 600;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.location-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.poi-btn {
  background: linear-gradient(135deg, #07c160 0%, #38d9a9 100%);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-btn:active::before {
  width: 300px;
  height: 300px;
  animation: ripple 0.6s ease-out;
}

.btn-text {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 加载容器 */
.loading-container {
  position: relative;
  z-index: 5;
  animation: containerFadeIn 0.8s ease-out 0.8s both;
}

.custom-loading {
  padding: 40px 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin: 20px 0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-top: 12px;
}

/* 信息容器 */
.info-container {
  position: relative;
  z-index: 5;
  animation: containerFadeIn 0.8s ease-out 0.8s both;
}

.info-group {
  background: transparent;
}

.weather-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin: 16px 0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.weather-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #07c160, #38d9a9, #20bf6b, #26de81);
  background-size: 300% 100%;
  animation: gradientShift 3s ease infinite;
}

.weather-divider {
  font-weight: 600;
  font-size: 16px;
}

.weather-icon {
  animation: iconBounce 2s ease-in-out infinite;
}

.weather-cell {
  background: transparent;
  padding: 16px 0;
}

.weather-title {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.location-tag, .weather-tag {
  transition: all 0.3s ease;
  animation: containerFadeIn 0.6s ease-out;
}

.location-tag:hover, .weather-tag:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.weather-detail {
  font-size: 16px;
}

.detail-item {
  margin: 12px 0;
  font-size: 15px;
  color: #333;
  transition: all 0.3s ease;
}

.detail-item:hover {
  color: #667eea;
  transform: translateX(4px);
}

.detail-value {
  font-weight: 600;
  color: #667eea;
}

.update-time {
  font-size: 14px;
  margin-top: 16px !important;
  color: #999;
  font-style: italic;
}

/* POI弹窗 */
.poi-popup {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
}

.poi-nav-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.poi-nav-bar :deep(.van-nav-bar__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.poi-nav-bar :deep(.van-nav-bar__left) {
  color: white;
}

.poi-nav-bar :deep(.van-icon) {
  color: white;
}

.poi-drawer {
  height: calc(100% - 46px);
  overflow-y: auto;
  padding: 16px;
}

.poi-cell {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.poi-cell:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.poi-cell:active {
  transform: translateY(0);
}

.poi-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.poi-name {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.distance-tag {
  transition: all 0.3s ease;
}

.distance-tag:hover {
  transform: scale(1.1);
}

.poi-address {
  color: #666;
  font-size: 13px;
  margin-top: 4px;
  display: block;
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
  .map-container {
    padding: 0 12px;
  }
  
  .map {
    height: 35vh;
    border-radius: 16px;
  }
  
  .button-group {
    gap: 12px;
    margin: 16px 0;
  }
  
  .action-btn {
    height: 48px;
    font-size: 14px;
  }
  
  .weather-box {
    padding: 16px;
    border-radius: 16px;
  }
  
  .weather-title {
    gap: 8px;
  }
  
  .detail-item {
    font-size: 14px;
  }
  
  .poi-drawer {
    padding: 12px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .map-container {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }
  
  .weather-box {
    background: rgba(45, 55, 72, 0.95);
    color: white;
  }
  
  .weather-cell {
    color: white;
  }
  
  .detail-item {
    color: #e2e8f0;
  }
  
  .detail-item:hover {
    color: #90cdf4;
  }
  
  .detail-value {
    color: #90cdf4;
  }
  
  .poi-cell {
    background: rgba(74, 85, 104, 0.9);
    color: white;
  }
  
  .poi-cell:hover {
    background: rgba(74, 85, 104, 1);
  }
  
  .poi-name {
    color: #e2e8f0;
  }
  
  .poi-address {
    color: #a0aec0;
  }
  
  .custom-loading {
    background: rgba(45, 55, 72, 0.95);
  }
  
  .loading-text {
    color: #e2e8f0;
  }
}
</style>