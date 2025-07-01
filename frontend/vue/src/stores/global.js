import { defineStore } from 'pinia'
export const CUTE_GIF = '../../src/assets/images/cute.gif'
export const USERS_DEFAULT_AVATAR = 'http://pic.imeitou.com/uploads/allimg/241128/3-24112QQ021.jpg'
export const POST_NAME = 'http://222.186.56.249:52858/api/'

export const useGlobalStore = defineStore('global', () => {
  // 高德地图相关请求方法
  const fetchAddressByRestApi = async (lng, lat) => {
    const key = '15a7d0b535279aba5f88afe405d1e5a0'
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&key=${key}`
    )
    return await response.json()
  }

  const searchNearbyPoisByApi = async (lng, lat) => {
    const key = '15a7d0b535279aba5f88afe405d1e5a0'
    const response = await fetch(
      `https://restapi.amap.com/v5/place/around?key=${key}&location=${lng},${lat}&radius=1000`
    )
    return await response.json()
  }

  const fetchWeatherByAdcode = async (adcode) => {
    const key = '15a7d0b535279aba5f88afe405d1e5a0'
    const response = await fetch(
      `https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${key}`
    )
    return await response.json()
  }

  // 新增IP定位方法
  const fetchIpLocation = async (ip) => {
    const key = '15a7d0b535279aba5f88afe405d1e5a0'
    const response = await fetch(
      `https://restapi.amap.com/v3/ip?ip=${ip}&key=${key}&output=json`
    )
    return await response.json()
  }

  // 新增客户端IP获取方法
  const fetchClientIp = async () => {
    try {
      const response = await fetch('https://ipinfo.io/json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error('获取客户端IP失败:', error)
      return null
    }
  }

  return {
    POST_NAME: 'http://222.186.56.249:52858/api/',
    CUTE_GIF: '../../src/assets/images/cute.gif',
    USERS_DEFAULT_AVATAR: 'http://pic.imeitou.com/uploads/allimg/241128/3-24112QQ021.jpg',
    fetchAddressByRestApi,
    searchNearbyPoisByApi,
    fetchWeatherByAdcode,
    fetchIpLocation,
    fetchClientIp
  }
})