// 环境配置
const config = {
  // 开发环境
  development: {
    // TODO: 前后端联测时，将此处改为真实的后端API地址
    // 例如：'http://localhost:8080' 或 'http://192.168.1.100:8080'
    apiBaseUrl: '', // 前端测试时不需要后端连接
    appTitle: '智能设计助手'
  },
  // 生产环境
  production: {
    // TODO: 生产环境部署时，将此处改为生产环境的API地址
    // 例如：'https://api.yourdomain.com'
    apiBaseUrl: 'https://api.example.com',
    appTitle: '智能设计助手'
  }
}

// 获取当前环境
const env = import.meta.env.MODE || 'development'

// 导出当前环境配置
export default config[env]
