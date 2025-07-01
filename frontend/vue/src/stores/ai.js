import { defineStore } from 'pinia'
export const aiStore = defineStore('ai', () => {
  // 定义 AI 助手的头像路径
  const botAvatarSrc = new URL('@/assets/images/logo.jpg', import.meta.url).href
  // 定义用户的头像路径
  const userAvatarSrc = new URL('@/assets/images/school-logo.jpg', import.meta.url).href
  //定义cozeAPI的请求地址
  const COZE_API_REQUEST_ADDRESS = 'https://api.coze.cn/v1/workflow/run'
  // 定义coze的授权密钥
  const COZE_API_AUTH_KEY = 'Bearer pat_obIPjmAI7Ol2uoool5JpCDs1dmYhkVseTDDFuTFZdLHnn9ApydInLiTlCZfjuw9X'
  //定义coze工作流的id
  const COZE_API_WORKFLOW_ID = '7479332859150368809'
  //定义coze机器人的id
  const COZE_API_BOT_ID = '7479331687332544539'
  return {  botAvatarSrc,
            userAvatarSrc,
            COZE_API_REQUEST_ADDRESS,
            COZE_API_AUTH_KEY,
            COZE_API_WORKFLOW_ID,
            COZE_API_BOT_ID }
})
