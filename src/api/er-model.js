import request from '../utils/request'

// ER模型相关API接口

// 查询ER模型列表
export const getERModelList = (params) => {
  return request.post('/api/er/query', params)
}

// 生成ER模型
export const generateERModel = (data) => {
  // 实现将由其他开发者完成
}

// 获取ER模型详情
export const getERModelDetail = (id) => {
  // 实现将由其他开发者完成
}

// 获取ER模型（别名）
export const getERModel = (id) => {
  // 实现将由其他开发者完成
}

// 删除ER模型
export const deleteERModel = (id) => {
  // 实现将由其他开发者完成
}
