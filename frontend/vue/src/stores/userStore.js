import { defineStore } from 'pinia';
import axios from 'axios';
import { useGlobalStore } from '@/stores/global';

export const useUserStore = defineStore('user', {
  state: () => ({
    cacheResult: null, // 存储缓存操作结果（包含成功/失败信息）
    userInfo: null, // 存储用户信息
    cachedUsers: [], // ✅ 新增：存储所有缓存的用户列表
    loading: false, // 添加loading状态
    error: null, // 添加错误状态
  }),
  actions: {
    async fetchCacheUsers() {
      const globalStore = useGlobalStore();
      const POST_NAME = globalStore.POST_NAME;
      try {
        const res = await axios.get(`${POST_NAME}/cacheUsers`);
        this.cacheResult = {
          success: true,
          message: res.data.message,
          count: res.data.data?.length || 0,
        };
        // ✅ 存储获取到的用户列表
        if (res.data.code === 200 && Array.isArray(res.data.data)) {
            this.cachedUsers = res.data.data;
        } else {
            this.cachedUsers = []; // 清空或保持为空
        }
        return {
          data: {
            data: res.data.data,
          },
        };
      } catch (error) {
        this.cacheResult = {
          success: false,
          message: '缓存失败：' + error.message,
        };
        throw error;
      }
    },
    
    // 获取用户信息
    async fetchUser(userId) {
      this.loading = true;
      this.error = null;
      try {
        const globalStore = useGlobalStore();
        const POST_NAME = globalStore.POST_NAME;
        const response = await axios.get(`${POST_NAME}/user/${userId}`);
        
        if (response.data.code === 200) {
          this.userInfo = response.data.data;
          // 同时更新localStorage
          localStorage.setItem('user', JSON.stringify(response.data.data));
          console.log('获取用户信息成功:', this.userInfo);
          return response.data;
        } else {
          this.error = response.data.message;
          console.error('获取用户信息失败:', response.data.message);
          throw new Error(response.data.message);
        }
      } catch (error) {
        this.error = error.message;
        console.error('获取用户信息异常:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新用户信息
    async updateUser(userId, userData) {
      this.loading = true;
      this.error = null;
      try {
        const globalStore = useGlobalStore();
        const POST_NAME = globalStore.POST_NAME;
        const response = await axios.put(`${POST_NAME}/user/${userId}`, userData);
        
        if (response.data.code === 200) {
          this.userInfo = { ...this.userInfo, ...userData };
          // 同时更新localStorage
          localStorage.setItem('user', JSON.stringify(this.userInfo));
          console.log('更新用户信息成功:', this.userInfo);
          return response.data;
        } else {
          this.error = response.data.message;
          console.error('更新用户信息失败:', response.data.message);
          throw new Error(response.data.message);
        }
      } catch (error) {
        this.error = error.message;
        console.error('更新用户信息异常:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 从 localStorage 加载用户信息
    loadUserInfo() {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          this.userInfo = JSON.parse(storedUser);
        } catch (e) {
          console.error('Failed to parse user from localStorage', e);
          localStorage.removeItem('user'); // 清除无效的用户信息
          this.userInfo = null; // 清除 userInfo
        }
      } else {
        this.userInfo = null; // 如果 localStorage 中没有用户，则清除 userInfo
      }
    },
    
    // ✅ 新增 action 来设置用户信息并保存到 localStorage
    setUserInfo(user) {
      this.userInfo = user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    },
    
    // ✅ 新增 action 来从 localStorage 加载用户信息
    loadUserInfoFromLocalStorage() {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          this.userInfo = JSON.parse(user);
          console.log('User info loaded from localStorage:', this.userInfo); // 添加日志
        } catch (e) {
          console.error('Failed to parse user info from localStorage:', e);
          this.userInfo = null;
          localStorage.removeItem('user'); // 清除无效数据
        }
      } else {
        this.userInfo = null;
      }
    },
  },
});
