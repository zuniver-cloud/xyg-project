import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({})
  const permissions = ref([])

  const isLoggedIn = computed(() => !!token.value)

  const login = async (credentials) => {
    try {
      // 调用真实API登录
      const response = await loginApi(credentials)
      
      if (response.code === 0) {
        // 保存token
        token.value = response.data.token
        localStorage.setItem('token', response.data.token)
        
        // 根据userId判断用户角色（这里需要根据实际业务逻辑调整）
        const userRole = credentials.userId === '001779999' ? 'admin' : 'user'
        
        // 构建用户信息
        const userInfoData = {
          id: response.data.userId,
          userId: response.data.userId,
          name: userRole === 'admin' ? '管理员' : '普通用户',
          role: userRole
        }
        
        userInfo.value = userInfoData
        permissions.value = userRole === 'admin' ? ['admin'] : ['user']
        
        // 保存用户角色
        localStorage.setItem('userRole', userRole)
        
        return {
          token: response.data.token,
          userInfo: userInfoData
        }
      } else {
        throw new Error(response.msg || '登录失败')
      }
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
