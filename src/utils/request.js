import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import config from '../config'

// 创建axios实例
const service = axios.create({
  baseURL: config.apiBaseUrl,  // 使用配置文件中的API地址
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // TODO: 前后端联测时，取消注释以下token验证代码
    // const userStore = useUserStore()
    // if (userStore.token) {
    //   config.headers['Authorization'] = `Bearer ${userStore.token}`
    // }
    
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const { code, message, data } = response.data
    
    if (code === 200) {
      return data
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  error => {
    console.error('Response error:', error)
    
    // TODO: 前后端联测时，删除以下模拟响应代码
    // 前端测试阶段：模拟成功响应，避免API请求失败
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.log('前端测试模式：模拟API响应')
      return Promise.resolve({
        code: 200,
        message: '前端测试模式',
        data: null
      })
    }
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // TODO: 前后端联测时，取消注释以下token过期处理代码
          // ElMessage.error('登录已过期，请重新登录')
          // const userStore = useUserStore()
          // userStore.logout()
          // window.location.href = '/login'
          ElMessage.error('认证失败，请检查登录状态')
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default service
