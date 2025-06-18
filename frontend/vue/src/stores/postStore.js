import { defineStore } from 'pinia';
import axios from 'axios';
import { useGlobalStore } from './global.js';

export const usePostStore = defineStore('post', {
  state: () => ({
    postsList: [],
    loading: false,
    error: null
  }),
  
  actions: {
    // 获取帖子列表（支持排序）
    async fetchPosts(sortBy = 'created_at', sortOrder = 'DESC') {
      this.loading = true;
      this.error = null;
      try {
        const globalStore = useGlobalStore();
        const response = await axios.get(`${globalStore.POST_NAME}posts`, {
          params: {
            sortBy: sortBy,
            sortOrder: sortOrder,
          },
        });
        
        if (response.data.code === 200) {
          this.postsList = response.data.data;
          console.log('帖子列表:', this.postsList);
          return this.postsList;
        } else {
          this.error = response.data.message;
          console.error('获取帖子列表失败:', response.data.message);
          throw new Error(response.data.message);
        }
      } catch (error) {
        this.error = error.message;
        console.error('获取帖子列表异常:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 根据 Tab 索引获取排序参数
    getSortParams(tabIndex) {
      switch (tabIndex) {
        case 0: // 最热
          return { sortBy: 'like_count', sortOrder: 'DESC' };
        case 1: // 最新
          return { sortBy: 'created_at', sortOrder: 'DESC' };
        default:
          return { sortBy: 'created_at', sortOrder: 'DESC' };
      }
    },
    
    // 根据 Tab 获取帖子列表
    async fetchPostsByTab(tabIndex) {
      const { sortBy, sortOrder } = this.getSortParams(tabIndex);
      return await this.fetchPosts(sortBy, sortOrder);
    },
    
    // 创建帖子
    async createPost(postData) {
      this.loading = true;
      this.error = null;
      try {
        const globalStore = useGlobalStore();
        const response = await axios.post(`${globalStore.POST_NAME}posts`, {
          user_id: postData.user_id,
          title: postData.title,
          content: postData.content,
          cover_image: postData.cover_image,
          tags: postData.tags,
        });
        
        if (response.data.code === 200) {
          console.log('帖子创建成功:', response.data.data);
          return response.data;
        } else {
          this.error = response.data.message;
          console.error('创建帖子失败:', response.data.message);
          throw new Error(response.data.message);
        }
      } catch (error) {
        this.error = error.message;
        console.error('创建帖子异常:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 点赞帖子
    async likePost(postId) {
      this.loading = true;
      this.error = null;
      try {
        const globalStore = useGlobalStore();
        const response = await axios.post(`${globalStore.POST_NAME}posts/${postId}/like`);
        
        if (response.data.code === 200) {
          console.log('点赞成功:', response.data.data);
          return response.data;
        } else {
          this.error = response.data.message;
          console.error('点赞失败:', response.data.message);
          throw new Error(response.data.message);
        }
      } catch (error) {
        this.error = error.message;
        console.error('点赞异常:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 清空帖子列表
    clearPosts() {
      this.postsList = [];
    },
    
    // 重置状态
    resetState() {
      this.postsList = [];
      this.loading = false;
      this.error = null;
    }
  }
});