<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Cell, CellGroup, Button, Uploader,showFailToast,showSuccessToast } from 'vant'
import { useUserStore } from '@/stores/userStore' // 引入userStore
import axios from 'axios';

const router = useRouter()
const userStore = useUserStore() // 使用userStore

const editMode = ref(false)
const formData = ref({
  username: '',
  email: '',
  avatar: '',
  phone: ''
})

// 从store中获取用户信息
const user = computed(() => userStore.userInfo)
const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)

const logout = () => {
  userStore.setUserInfo(null) // 使用store方法清除用户信息
  router.push('/login')
}

const afterRead = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file.file);

    // 修改为从session获取认证信息
    const { data } = await axios.post('http://localhost:3000/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // 移除Bearer Token方式
        Cookie: document.cookie // 自动携带session cookie
      },
      withCredentials: true // 启用凭证传输
    });

    // 更新本地用户信息和store
    userStore.userInfo.avatar = data.data.url;
    formData.value.avatar = data.data.url;
    
    // 触发父组件更新
    emit('update:modelValue', data.data.url);
    showSuccessToast('头像更新成功');
  } catch (error) {
    console.error('上传失败:', error);
    showFailToast('头像更新失败');
  }
}

const fetchUser = async () => {
  try {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      console.error('未找到用户信息')
      router.push('/login')
      return
    }
    
    const userId = JSON.parse(storedUser).id
    const response = await userStore.fetchUser(userId)
    formData.value = { ...response.data }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}
const notodo = () => {
  showFailToast('😊稍等,加急开发中...');
}
const updateUser = async () => {
  try {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      console.error('未找到用户信息')
      router.push('/login')
      return
    }
    
    const userId = JSON.parse(storedUser).id
    const response = await axios.put(`http://222.186.56.249:52858/api/user/${userId}`, formData.value, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
    
    if (response.data.code === 200) {
      showSuccessToast('更新成功')
      editMode.value = false
      await fetchUser()
    } else {
      showFailToast(response.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    showFailToast(error.response?.data?.message || '服务器错误')
  }
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div class="profile-container">
    <div class="header-section">
      <h1 class="page-title">个人中心</h1>
      <div class="title-decoration"></div>
    </div>
    
    <div v-if="user" class="profile-content">
      <Transition name="fade-slide" mode="out-in">
        <div v-if="!editMode" key="view" class="profile-view">
          <div class="avatar-section">
            <div class="avatar-container">
              <Uploader :after-read="afterRead">
                <div class="avatar-wrapper">
                  <img :src="user.avatar || 'https://img.yzcdn.cn/vant/user-default.png'" class="avatar">
                  <div class="avatar-overlay">
                    <span class="upload-text">点击上传</span>
                  </div>
                </div>
              </Uploader>
            </div>
          </div>
          
          <div class="user-info-card">
            <div class="info-item" v-for="(item, index) in [
              { label: '用户名', value: user.username, icon: '👤' },
              { label: '邮箱', value: user.email || '未设置', icon: '📧' },
              { label: '手机号', value: user.phone, icon: '📱' }
            ]" :key="item.label" :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="info-icon">{{ item.icon }}</div>
              <div class="info-content">
                <span class="info-label">{{ item.label }}</span>
                <span class="info-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
          
          <Button @click="editMode = true" class="edit-btn" type="primary" :loading="loading">
            <span class="btn-text">✏️ 编辑信息</span>
          </Button>
          
          <div class="menu-section">
            <CellGroup class="menu-group">
              <Cell title="🐾 我的宠物"  @click="notodo" is-link class="menu-item" />
              <Cell title="❤️ 我的收藏"  @click="notodo" is-link class="menu-item" />
              <Cell title="⚙️ 设置"  @click="notodo" is-link class="menu-item" />
              <Cell title="🚪 退出登录" is-link @click="logout" class="menu-item logout-item" />
            </CellGroup>
          </div>
        </div>
        
        <div v-else key="edit" class="profile-edit">
          <div class="edit-header">
            <h2 class="edit-title">编辑个人信息</h2>
            <div class="edit-subtitle">完善你的个人资料</div>
          </div>
          
          <div class="form-container">
            <div class="form-group" v-for="(field, index) in [
              { key: 'username', label: '用户名', type: 'text', icon: '👤' },
              { key: 'email', label: '邮箱', type: 'email', icon: '📧' },
              { key: 'avatar', label: '头像URL', type: 'text', icon: '🖼️' },
              { key: 'phone', label: '手机号', type: 'tel', icon: '📱', disabled: true }
            ]" :key="field.key" :style="{ animationDelay: `${index * 0.1}s` }">
              <label class="form-label">
                <span class="label-icon">{{ field.icon }}</span>
                {{ field.label }}
              </label>
              <div class="input-wrapper">
                <input 
                  v-model="formData[field.key]" 
                  :type="field.type"
                  :disabled="field.disabled"
                  class="form-input"
                  :placeholder="`请输入${field.label}`"
                >
              </div>
            </div>
          </div>
          
          <div class="button-group">
            <Button @click="updateUser" type="primary" class="save-btn" :loading="loading">
              <span class="btn-text">💾 保存修改</span>
            </Button>
            <Button @click="editMode = false" type="default" class="cancel-btn" :disabled="loading">
              <span class="btn-text">❌取消</span>
            </Button>
          </div>
        </div>
      </Transition>
    </div>
    
    <div v-else-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-text">{{ error }}</div>
      <Button @click="fetchUser" type="primary">重试</Button>
    </div>
  </div>
</template>

<style scoped>
/* 基础容器样式 */
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.profile-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
  pointer-events: none;
}

/* 头部样式 */
.header-section {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: titleSlideIn 0.8s ease-out;
}

.title-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
  margin: 15px auto;
  border-radius: 2px;
  animation: decorationExpand 1s ease-out 0.3s both;
}

/* 内容区域 */
.profile-content {
  position: relative;
  z-index: 1;
}

/* 头像区域 */
.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-container {
  display: inline-block;
  position: relative;
  animation: avatarFloat 0.8s ease-out;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.upload-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

/* 用户信息卡片 */
.user-info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: cardSlideUp 0.6s ease-out 0.2s both;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  animation: itemFadeIn 0.5s ease-out both;
  transition: all 0.3s ease;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  transform: translateX(5px);
  background: rgba(102, 126, 234, 0.05);
  border-radius: 10px;
  margin: 0 -10px;
  padding: 15px 10px;
}

.info-icon {
  font-size: 24px;
  margin-right: 15px;
  width: 40px;
  text-align: center;
}

.info-content {
  flex: 1;
}

.info-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
}

.info-value {
  display: block;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

/* 按钮样式 */
.edit-btn {
  width: 100%;
  margin-bottom: 25px;
  height: 50px;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  animation: buttonSlideIn 0.6s ease-out 0.4s both;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-text {
  font-size: 16px;
  font-weight: 600;
}

/* 菜单区域 */
.menu-section {
  animation: menuSlideIn 0.6s ease-out 0.6s both;
}

.menu-group {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.menu-item {
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.menu-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(5px);
}

.logout-item:hover {
  background: rgba(255, 107, 107, 0.1);
}

/* 编辑模式样式 */
.profile-edit {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.edit-header {
  text-align: center;
  margin-bottom: 30px;
}

.edit-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px 0;
  animation: titleSlideIn 0.6s ease-out;
}

.edit-subtitle {
  color: #666;
  font-size: 14px;
  animation: subtitleFadeIn 0.6s ease-out 0.2s both;
}

.form-container {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
  animation: formItemSlideIn 0.5s ease-out both;
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.label-icon {
  margin-right: 8px;
  font-size: 16px;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.save-btn, .cancel-btn {
  flex: 1;
  height: 50px;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  max-width: 200px;
}

.save-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.4);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(78, 205, 196, 0.6);
}

.cancel-btn {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  color: #6c757d;
}

.cancel-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  font-size: 18px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 关键帧动画 */
@keyframes titleSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes decorationExpand {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

@keyframes avatarFloat {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
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

@keyframes itemFadeIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes buttonSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes menuSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes formItemSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .avatar {
    width: 120px;
    height: 120px;
  }
  
  .user-info-card {
    padding: 20px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .save-btn, .cancel-btn {
    max-width: none;
  }
}
</style>