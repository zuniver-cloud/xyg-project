import request from '@/utils/request'

// 用户登录
export const login = (data) => {
  return request.post('/api/home/login', data)
}

// 用户登出
export const logout = () => {
  return request.post('/api/home/logout')
}
