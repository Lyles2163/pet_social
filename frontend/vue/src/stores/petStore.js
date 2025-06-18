import { defineStore } from 'pinia';
import axios from 'axios';
import { useGlobalStore } from '@/stores/global';

export const usePetStore = defineStore('pet', {
  state: () => ({
    pets: [],
    loading: false,
    finished: false,
  }),
  
  actions: {
    // 获取宠物列表
    async fetchPets() {
      this.loading = true;
      try {
        const globalStore = useGlobalStore();
        const { data } = await axios.get(`${globalStore.POST_NAME}pets`, {
          withCredentials: true // 确保发送 cookie
        });
        // 处理图片路径，如果 avatar 为空则使用默认图片路径
        this.pets = data.map(pet => ({
          ...pet,
          avatar: pet.avatar || 'default-avatar.png'
        }));
        this.finished = true; // 数据加载完成
        return this.pets;
      } catch (error) {
        console.error('加载宠物信息失败:', error);
        throw error;
      } finally {
        this.loading = false; // 停止加载状态
      }
    },
    
    // 发布宠物信息
    async createPet(petData) {
      try {
        const globalStore = useGlobalStore();
        const response = await axios.post(`${globalStore.POST_NAME}pets`, petData);
        
        if (response.data.code === 200) {
          // 发布成功后刷新宠物列表
          await this.fetchPets();
          return { success: true, message: '发布成功' };
        } else {
          return { success: false, message: response.data.message || '发布失败' };
        }
      } catch (error) {
        console.error('发布宠物信息出错:', error);
        return { success: false, message: error.message || '发布宠物信息出错' };
      }
    },
    
    // 重置状态
    resetState() {
      this.loading = false;
      this.finished = false;
    }
  }
});