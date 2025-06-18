import { defineStore } from 'pinia'
export const CUTE_GIF = '../../src/assets/images/cute.gif'
export const USERS_DEFAULT_AVATAR = 'http://pic.imeitou.com/uploads/allimg/241128/3-24112QQ021.jpg'
export const POST_NAME = 'http://localhost:3000/api/'

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

  return {
    POST_NAME: 'http://localhost:3000/api/',
    CUTE_GIF: '../../src/assets/images/cute.gif',
    USERS_DEFAULT_AVATAR: 'http://pic.imeitou.com/uploads/allimg/241128/3-24112QQ021.jpg',
    fetchAddressByRestApi,
    searchNearbyPoisByApi,
    fetchWeatherByAdcode
  }
})