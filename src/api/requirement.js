import request from '@/utils/request'

// 分页查询我的需求
export const getMyRequirements = (data) => {
  return request.post('/api/requirement/query', data)
}

// 保存需求到我的需求库
export const saveRequirement = (data) => {
  return request.post('/api/requirement/create', data)
}

// 删除我的需求
export const deleteRequirement = (requirementId) => {
  return request.delete(`/api/requirement/delete/${requirementId}`)
}

// 修改我的需求
export const updateRequirement = (data) => {
  return request.post('/api/requirement/update', data)
}