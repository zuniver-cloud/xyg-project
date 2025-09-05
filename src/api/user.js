import request from '@/utils/request'

// 分页查询用户
export const getUserList = (params) => {
  return request.post('/api/admin/userManagement/page', params)
}

// 新增用户
export const addUser = (data) => {
  return request.post('/api/admin/userManagement/addUser', data)
}

// 删除用户
export const deleteUser = (userId) => {
  return request.delete(`/api/admin/userManagement/deleteUser/${userId}`)
}

// 更新用户
export const updateUser = (data) => {
  return request.put('/api/admin/updateUser', data)
}