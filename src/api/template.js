import request from '../utils/request'

// 新增模板
export const createTemplate = (data) => {
  return request({
    url: '/api/templates',
    method: 'post',
    data
  })
}

// 单条查询模板
export const getTemplate = (templateId) => {
  return request({
    url: `/api/templates/${templateId}`,
    method: 'get'
  })
}

// 分页查询模板
export const getTemplateList = (params) => {
  return request({
    url: '/api/templates',
    method: 'get',
    params
  })
}

// 修改模板
export const updateTemplate = (templateId, data) => {
  return request({
    url: `/api/templates/${templateId}`,
    method: 'put',
    data
  })
}

// 删除模板
export const deleteTemplate = (templateId) => {
  return request({
    url: `/api/templates/${templateId}`,
    method: 'delete'
  })
}

// 填充模板实例
export const fillTemplate = (templateId, data) => {
  return request({
    url: `/api/templates/${templateId}/fill`,
    method: 'post',
    data
  })
}
