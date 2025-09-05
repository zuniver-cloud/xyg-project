import request from '@/utils/request'

// 分页查询数据标准
export const getStandardList = (params) => {
  return request.post('/api/standard/query', params)
}

// 修改数据标准
export const updateStandard = (data) => {
  return request.post('/api/standard/edit', data)
}

// 删除数据标准
export const deleteStandard = (standardId) => {
  return request.delete(`/api/standard/remove/${standardId}`)
}

// 生成数据标准
export const generateDataStandard = (data) => {
  return request.post('/api/standard/generate', data)
}