import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '../api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({})
  const permissions = ref([])

  const isLoggedIn = computed(() => !!token.value)

  const login = async (credentials) => {
    try {
      // TODO: 前后端联测时，取消注释以下真实API调用代码，并删除模拟登录代码
      // const response = await loginApi(credentials)
      // token.value = response.token
      // localStorage.setItem('token', response.token)
      
      // 测试阶段：模拟登录响应
      const mockResponse = {
        token: 'test-token-' + Date.now(),
        userInfo: {
          id: 1,
          username: credentials.username,
          name: credentials.username === 'admin' ? '管理员' : '普通用户',
          email: credentials.username + '@example.com',
          role: credentials.username === 'admin' ? 'admin' : 'user'
        }
      }
      
      token.value = mockResponse.token
      localStorage.setItem('token', mockResponse.token)
      
      // 保存用户角色
      if (mockResponse.userInfo && mockResponse.userInfo.role) {
        localStorage.setItem('userRole', mockResponse.userInfo.role)
      }
      
      // TODO: 前后端联测时，取消注释以下真实用户信息获取代码
      // await fetchUserInfo()
      
      // 测试阶段：模拟用户信息
      userInfo.value = mockResponse.userInfo
      permissions.value = mockResponse.userInfo.role === 'admin' ? ['admin'] : ['user']
      
      return mockResponse
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = {}
    permissions.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
  }

  const fetchUserInfo = async () => {
    // TODO: 前后端联测时，实现真实的用户信息获取逻辑
    // const response = await getUserInfo()
    // userInfo.value = response
    // permissions.value = response.permissions || []
  }

  return {
    token,
    userInfo,
    permissions,
    isLoggedIn,
    login,
    logout,
    fetchUserInfo
  }
})
