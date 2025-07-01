<script setup>
import { ref, reactive, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
// 导入 aiStore
import { aiStore } from '@/stores/ai'

const router = useRouter()

const inputValue = ref('')
const loading = ref(false)
const chatHistory = ref([])
const isTyping = ref(false)

// 从 store 中获取头像路径
const store = aiStore()
// 定义 AI 助手的头像路径
const botAvatarSrc = store.botAvatarSrc
// 定义用户的头像路径
const userAvatarSrc = store.userAvatarSrc
//定义cozeAPI的请求地址
const COZE_API_REQUEST_ADDRESS = store.COZE_API_REQUEST_ADDRESS
// 定义coze的授权密钥
const COZE_API_AUTH_KEY = store.COZE_API_AUTH_KEY
//定义coze工作流的id
const COZE_API_WORKFLOW_ID = store.COZE_API_WORKFLOW_ID
//定义coze机器人的id
const COZE_API_BOT_ID = store.COZE_API_BOT_ID
const typingTimer = ref(null)

// 显示提示消息
const showToast = (message, type = 'info') => {
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.classList.add('show')
  }, 100)
  
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

function clearPage() {
  inputValue.value = ''
  chatHistory.value = []

  if (typingTimer.value) {
    clearInterval(typingTimer.value)
    typingTimer.value = null
  }
}

function onConfirmClick() {
  const userInput = inputValue.value.trim()
  if (!userInput) {
    showToast('请输入内容', 'warning')
    return
  }

  const userMessage = {
    type: 'user',
    content: userInput,
    id: 'user-' + Date.now(),
    isThinking: false
  }

  chatHistory.value.push(userMessage)
  inputValue.value = ''
  isTyping.value = true

  setTimeout(() => {
    const botMessageIndex = chatHistory.value.length

    const botMessage = {
      type: 'bot',
      content: '',
      id: 'bot-' + Date.now(),
      isThinking: true
    }

    chatHistory.value.push(botMessage)
    scrollToBottom()

    callCozeWorkflow(userInput, botMessageIndex)
  }, 100)
}

function startTypingEffect(text, messageIndex) {
  if (!text) {
    updateBotMessage(messageIndex, '无数据')
    return
  }

  updateBotMessage(messageIndex, '')

  let index = 0
  const speed = 50

  if (typingTimer.value) {
    clearInterval(typingTimer.value)
  }

  typingTimer.value = setInterval(() => {
    if (index < text.length) {
      updateBotMessage(messageIndex, text.substring(0, index + 1))
      index++
      // 每次更新内容后都滚动，确保跟随内容
      scrollToBottom()
    } else {
      clearInterval(typingTimer.value)
      typingTimer.value = null
      updateBotMessage(messageIndex, text)
      isTyping.value = false
      // 最终完成后再次滚动确保到底部
      setTimeout(() => scrollToBottom(), 100)
    }
  }, speed)
}

function updateBotMessage(index, content) {
  if (index >= 0 && index < chatHistory.value.length) {
    chatHistory.value[index] = {
      ...chatHistory.value[index],
      content,
      type: 'bot',
      isThinking: false
    }
    // 使用setTimeout确保DOM更新后再滚动
    setTimeout(() => scrollToBottom(), 50)
  }
}

async function callCozeWorkflow(userInput, botMessageIndex) {
  try {
    const response = await fetch(COZE_API_REQUEST_ADDRESS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: COZE_API_AUTH_KEY
      },
      body: JSON.stringify({
        workflow_id: COZE_API_WORKFLOW_ID,
        bot_id: COZE_API_BOT_ID,
        parameters: {
          title: userInput || 'import'
        }
      })
    })

    const res = await response.json()
    const responseData = JSON.parse(res.data).answer || '无数据'
    startTypingEffect(responseData, botMessageIndex)
  } catch (err) {
    updateBotMessage(botMessageIndex, '操作失败：无网络连接')
    isTyping.value = false
    showToast('网络连接失败', 'error')
  }
}

function scrollToBottom() {
  const scrollArea = document.querySelector('.scrollarea')
  if (scrollArea) {
    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: 'smooth'
    })
  }
}

onBeforeUnmount(() => {
  if (typingTimer.value) {
    clearInterval(typingTimer.value)
    typingTimer.value = null
  }
})
</script>

<template>
  <div class="chat-container">
    <!-- 渐变装饰条 -->
    <div class="gradient-strip"></div>
    
    <!-- 标题栏 -->
    <div class="ai-title">
      <div class="title-content">
        <div class="title-icon">🤖</div>
        <h1 class="title-text">萌宠AI助手</h1>
        <div class="title-decoration"></div>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div class="scrollarea">
      <div class="container">
        <div class="chat-messages">
          <!-- 欢迎消息 -->
          <div class="message bot-message welcome-message">
            <div class="message-avatar">
              <img :src="botAvatarSrc" alt="AI助手" />
              <div class="avatar-status"></div>
            </div>
            <div class="message-wrapper">
              <div class="bot-name">
                <span class="name-text">萌宠百事通</span>
                <div class="online-indicator">在线</div>
              </div>
              <div class="message-content bot-content">
                <div class="welcome-text">
                  <span class="greeting">👋 嗨，我是萌宠百事通！</span>
                  <span class="description">有宠物方面的问题尽管找我，我会为您提供专业的建议和帮助。</span>
                </div>
              </div>
               <div class="quick-replies">
         <div style="display: flex; justify-content: center;justify-items: center;">
          <button 
            class="quick-reply-btn" 
            @click="inputValue = '我的狗狗不吃饭怎么办？'"
            :disabled="isTyping"
          >
            🍽️ 不吃饭
          </button>
          <button 
            class="quick-reply-btn" 
            @click="inputValue = '猫咪疫苗接种时间表'"
            :disabled="isTyping"
          >
            💉 疫苗接种
          </button>
          <button 
            class="quick-reply-btn" 
            @click="inputValue = '宠物训练技巧'"
            :disabled="isTyping"
          >
            🎾 训练技巧
          </button>
         </div>
        </div>
            </div>
          </div>

          <!-- 聊天历史 -->
          <div 
            v-for="(item, index) in chatHistory" 
            :key="item.id" 
            class="message" 
            :class="[item.type + '-message']"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <template v-if="item.type === 'user'">
              <div class="message-wrapper user-wrapper">
                <div class="message-content user-content">
                  <div class="message-text">{{ item.content }}</div>
                  <div class="message-time">{{ new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}</div>
                </div>
              </div>
              <div class="message-avatar user-avatar">
                <img :src="userAvatarSrc" alt="用户" />
              </div>
            </template>

            <template v-if="item.type === 'bot'">
              <div class="message-avatar">
                <img :src="botAvatarSrc" alt="AI助手" />
                <div class="avatar-status" :class="{ typing: item.isThinking }"></div>
              </div>
              <div class="message-wrapper">
                <div class="bot-name">
                  <span class="name-text">萌宠百事通</span>
                  <div v-if="item.isThinking" class="typing-indicator">正在输入...</div>
                </div>
                <div class="message-content bot-content">
                  <div v-if="!item.isThinking" class="message-text">{{ item.content }}</div>
                  <div v-if="item.isThinking" class="thinking-animation">
                    <div class="thinking-text">正在思考中</div>
                    <div class="loading-dots">
                      <div class="dot"></div>
                      <div class="dot"></div>
                      <div class="dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div id="bottom-anchor" ref="bottomAnchor"></div>
          <div class="chat-spacer"></div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <div class="input-wrapper">
          <input
            class="chat-input"
            placeholder="💭 输入宠物问题试试看吧~"
            v-model="inputValue"
            @keyup.enter="onConfirmClick"
            :disabled="isTyping"
          />
          <button 
            class="send-button" 
            @click="onConfirmClick"
            :disabled="isTyping || !inputValue.trim()"
            :class="{ active: inputValue.trim() }"
          >
            <div class="send-icon">✈️</div>
            <div class="ripple"></div>
          </button>
        </div>
        
        <!-- 快捷回复 -->
       
      </div>
    </div>

      <div class="upup"></div>
   
  </div>
</template>

<style scoped>
.upup{
  width: 100%;
  height: 140px;
}
/* 动画定义 */
@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes titleGlow {
  0%, 100% {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6);
  }
}

@keyframes avatarPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes dotFlashing {
  0%, 50% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  25% {
    opacity: 1;
    transform: scale(1.2);
  }
}

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

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 基础样式 */
.chat-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: pageSlideIn 0.6s ease-out;
}

/* 渐变装饰条 */
.gradient-strip {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
  background-size: 300% 100%;
  animation: gradientShift 3s ease infinite;
  z-index: 1000;
}

/* 标题栏 */
.ai-title {
  position: fixed;
  top: 4px;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(44, 62, 80, 0.95);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.title-content {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.title-icon {
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

.title-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  animation: titleGlow 2s ease-in-out infinite;
}

.title-decoration {
  position: absolute;
  top: -10px;
  right: -20px;
  width: 20px;
  height: 20px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 50%;
  animation: float 2s ease-in-out infinite reverse;
}

/* 聊天区域 */
.scrollarea {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-top: 84px;
  padding-bottom: 180px;
  background: rgba(44, 62, 80, 0.95);
  scroll-behavior: smooth;
  height: calc(100vh - 200px); /* 确保固定高度 */
}

.container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: fit-content;
}

/* 消息样式 */
.message {
  display: flex;
  max-width: 85%;
  animation: messageSlideIn 0.5s ease-out;
}

.bot-message {
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
  flex-direction: row;
}

.welcome-message {
  border-radius: 20px;
 
}

/* 头像样式 */
.message-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
  position: relative;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar {
  margin-right: 0;
  margin-left: 12px;
}

.avatar-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #4CAF50;
  border-radius: 50%;
  border: 2px solid white;
  transition: all 0.3s ease;
}

.avatar-status.typing {
  background: #FF9800;
  animation: avatarPulse 1s ease-in-out infinite;
}

/* 消息包装器 */
.message-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-wrapper {
  align-items: flex-end;
}

/* 机器人名称 */
.bot-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.name-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.online-indicator {
  font-size: 0.7rem;
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.typing-indicator {
  font-size: 0.7rem;
  color: #FF9800;
  background: rgba(255, 152, 0, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

/* 消息内容 */
.message-content {
  border-radius: 18px;
  padding: 12px 16px;
  font-size: 0.95rem;
  line-height: 1.5;
  word-break: break-word;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bot-content {
  background: linear-gradient(135deg, #667eea, #764ba2);
  backdrop-filter: blur(10px);
  color: #ffffff;

}

.user-content {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-align: right;
}

.message-text {
  margin: 0;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 4px;
}

/* 欢迎消息特殊样式 */
.welcome-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.greeting {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

/* 思考动画 */
.thinking-animation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thinking-text {
  color: #ffffff;
  font-style: italic;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: dotFlashing 1.4s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* 输入区域 */
.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(44, 62, 80, 0.95);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  background: rgb(96, 96, 96);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
}

.chat-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15);
}

.chat-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-button.active {
  background: linear-gradient(135deg, #4CAF50, #45a049);
}

.send-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.send-button:active .send-icon {
  transform: scale(0.9);
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

.send-button:active .ripple {
  animation: ripple 0.6s linear;
}

/* 快捷回复 */
.quick-replies {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-reply-btn {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 0.8rem;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.quick-reply-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

.quick-reply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 确保底部锚点可见 */
#bottom-anchor {
  height: 1px;
  width: 100%;
  clear: both;
}

.chat-spacer {
  height: 20px;
  flex-shrink: 0;
}

/* 底部装饰 */
.bottom-decoration {
  position: fixed;
  bottom: 160px;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
}

.decoration-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 500;
}

/* Toast 样式 */
.toast {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  z-index: 10000;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.toast.show {
  transform: translateX(-50%) translateY(0);
}

.toast-success {
  background: rgba(76, 175, 80, 0.9);
}

.toast-error {
  background: rgba(244, 67, 54, 0.9);
}

.toast-warning {
  background: rgba(255, 152, 0, 0.9);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-title {
    height: 70px;
  }
  
  .title-text {
    font-size: 1.3rem;
  }
  
  .scrollarea {
    padding-top: 74px;
    padding-bottom: 200px;
  }
  
  .chat-messages {
    padding: 0.75rem;
    gap: 1rem;
  }
  
  .message {
    max-width: 90%;
  }
  
  .message-avatar {
    width: 40px;
    height: 40px;
  }
  
  .input-area {
    padding: 0.75rem;
  }
  
  .quick-replies {
    justify-content: center;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .chat-container {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .ai-title {
    background: rgba(44, 62, 80, 0.95);
  }
  
  .input-area {
    background: rgba(44, 62, 80, 0.95);
  }
  
  .chat-input {
    background: rgba(255, 255, 255, 0.1);
    color: rgb(255, 255, 255);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .chat-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  .quick-reply-btn {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
  }
}
/* 提示词样式 */
.suggestion-tips {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tips-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tip-item {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tip-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

/* 输入区域用户头像样式 */
.user-avatar-input {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.user-avatar-input img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 修改输入包装器布局 */
.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center; /* 改为居中对齐 */
}

/* 调整输入框样式以适应新布局 */
.chat-input {
  flex: 1;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 40px; /* 固定高度与头像一致 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-avatar-input {
    width: 35px;
    height: 35px;
  }
  
  .chat-input {
    height: 35px;
    padding: 10px 16px;
  }
  
  .send-button {
    width: 35px;
    height: 35px;
  }
  
  .tips-list {
    gap: 4px;
  }
  
  .tip-item {
    font-size: 0.75rem;
  }
}
</style>