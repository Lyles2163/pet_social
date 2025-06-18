import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useGlobalStore } from './global.js';

export const useSearchStore = defineStore('searchStore', () => {
  // 状态
  const searchHistory = ref([]);
  const trendingKeywords = ref([]);
  const petResults = ref([]);
  const postResults = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const globalStore = useGlobalStore();

  // 获取搜索历史
  const fetchSearchHistory = async () => {
    try {
      const res = await axios.get(`${globalStore.POST_NAME}search/history`, {
        withCredentials: true
      });
      const uniqueHistory = [];
      const seenKeywords = new Set();
      for (const item of res.data) {
        if (!seenKeywords.has(item.keyword)) {
          uniqueHistory.push(item);
          seenKeywords.add(item.keyword);
        }
      }
      searchHistory.value = uniqueHistory;
      return uniqueHistory;
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      searchHistory.value = [];
      throw error;
    }
  };

  // 获取热搜关键词
  const fetchTrendingKeywords = async () => {
    try {
      const res = await axios.get(`${globalStore.POST_NAME}search/trending`);
      trendingKeywords.value = res.data;
      return res.data;
    } catch (error) {
      console.error('获取热搜关键词失败:', error);
      trendingKeywords.value = [];
      throw error;
    }
  };

  // 执行搜索
  const searchPetsAndPosts = async (keyword) => {
    if (!keyword.trim()) {
      petResults.value = [];
      postResults.value = [];
      return { pets: [], posts: [] };
    }

    loading.value = true;
    error.value = null;
    
    try {
      const [petsRes, postsRes] = await Promise.all([
        axios.get(`${globalStore.POST_NAME}search/pets`, {
          params: { keyword },
          withCredentials: true
        }),
        axios.get(`${globalStore.POST_NAME}search/posts`, {
          params: { keyword },
          withCredentials: true
        })
      ]);

      petResults.value = petsRes.data;
      postResults.value = postsRes.data;

      // 更新搜索历史和热搜
      await fetchSearchHistory();
      await fetchTrendingKeywords();

      return {
        pets: petsRes.data,
        posts: postsRes.data
      };
    } catch (err) {
      console.error('搜索失败:', err);
      error.value = '搜索失败，请稍后重试';
      petResults.value = [];
      postResults.value = [];
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 根据标签搜索帖子
  const searchPostsByTag = async (tagName) => {
    loading.value = true;
    error.value = null;
    petResults.value = [];

    try {
      const res = await axios.get(`${globalStore.POST_NAME}search/posts/byTag`, {
        params: { tagName },
        withCredentials: true
      });

      postResults.value = res.data;

      // 更新搜索历史和热搜
      await fetchSearchHistory();
      await fetchTrendingKeywords();

      return res.data;
    } catch (err) {
      console.error('根据标签搜索帖子失败:', err);
      error.value = '根据标签搜索帖子失败，请稍后重试';
      postResults.value = [];
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 清空搜索结果
  const clearResults = () => {
    petResults.value = [];
    postResults.value = [];
    error.value = null;
  };

  // 重置状态
  const resetState = () => {
    searchHistory.value = [];
    trendingKeywords.value = [];
    petResults.value = [];
    postResults.value = [];
    loading.value = false;
    error.value = null;
  };

  return {
    // 状态
    searchHistory,
    trendingKeywords,
    petResults,
    postResults,
    loading,
    error,
    // 方法
    fetchSearchHistory,
    fetchTrendingKeywords,
    searchPetsAndPosts,
    searchPostsByTag,
    clearResults,
    resetState
  };
});