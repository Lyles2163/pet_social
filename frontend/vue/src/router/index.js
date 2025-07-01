import { createRouter, createWebHistory } from 'vue-router'
import SocialView from '../views/SocialView.vue';
// 导入 useUserStore
import { useUserStore } from '@/stores/userStore';
import { showFailToast } from 'vant';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/ai-chat',
    name: 'ai-chat',
    component: () => import('../views/AIChatView.vue')
  },
  {
    path: '/social', 
    name: 'social',
    component: SocialView
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue')
  }
  ,
  {
    path: '/postdetail/:id', // 添加 :id 参数
    name: 'postdetail',
    component: () => import('../views/PostDetailView.vue'),
    props: true // 允许将路由参数作为 props 传递
  },
  {
    path: '/create-post',
    name: 'create-post',
    component: () => import('../views/PostCreateView.vue')
  },
  {
    path: '/create-pet',
    name: 'create-pet',
    component: () => import('../views/PetCreateView.vue')
  }
  ,
  {
    path: '/ipMap',
    name: 'ipmap',
    component: () => import('../views/IPMap.vue')
  },
  {
    path: '/ipMap2',
    name: 'ipmap2',
    component: () => import('../views/IPMap2.vue')
  }
  ,
  {
    path: '/cutePet',
    name: 'cutePet',
    component: () => import('../views/CutePetView.vue')
  }
  ,
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 
  routes
});

// 添加导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore(); // 获取 userStore 实例

  // 检查目标路由是否不是登录页，并且用户信息为空
  if (to.path !== '/login' && !userStore.userInfo) {
    // 如果未登录且目标不是登录页，则重定向到登录页
    next('/login');
    showFailToast('请先登录');
  } else {
    // 否则，允许导航继续
    next();
  }
});


export default router;
