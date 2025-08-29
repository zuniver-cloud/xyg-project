import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: (to) => {
      // 动态重定向，在路由守卫中处理
      return '/user-management'
    },
    children: [
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('../views/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'User', roles: ['admin'] }
      },
      {
        path: 'template-management',
        name: 'TemplateManagement',
        component: () => import('../views/TemplateManagement.vue'),
        meta: { title: '模板管理', icon: 'Document', roles: ['admin'] }
      },
      {
        path: 'requirement-management',
        name: 'RequirementManagement',
        component: () => import('../views/RequirementManagement.vue'),
        meta: { title: '我的需求管理', icon: 'Folder', roles: ['admin', 'user'] },
        redirect: 'input',
        children: [
          {
            path: 'input',
            name: 'RequirementInput',
            component: () => import('../views/RequirementInput.vue'),
            meta: { title: '需求录入', icon: 'Edit', roles: ['admin', 'user'] }
          },
          {
            path: 'repository',
            name: 'RequirementRepository',
            component: () => import('../views/RequirementRepository.vue'),
            meta: { title: '需求仓库', icon: 'Folder', roles: ['admin', 'user'] }
          }
        ]
      },
      {
        path: 'er-generator',
        name: 'ERGenerator',
        component: () => import('../views/ERLayout.vue'),
        meta: { title: 'ER模型生成功能', icon: 'Share', roles: ['admin', 'user'] },
        redirect: 'generate',
        children: [
          {
            path: 'generate',
            name: 'ERGenerate',
            component: () => import('../views/ERGenerator.vue'),
            meta: { title: '生成ER模型', icon: 'DataAnalysis', roles: ['admin', 'user'] }
          },
          {
            path: 'manage',
            name: 'ERManage',
            component: () => import('../views/ERManage.vue'),
            meta: { title: 'ER仓库', icon: 'Setting', roles: ['admin', 'user'] }
          }
        ]
      },
      {
        path: 'data-standards',
        name: 'DataStandards',
        component: () => import('../views/DataStandards.vue'),
        meta: { title: '数据标准推荐', icon: 'DataAnalysis', roles: ['admin', 'user'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // TODO: 前后端联测时，取消注释以下token获取代码，并删除测试阶段的默认值
  // const token = localStorage.getItem('token')
  // const userRole = localStorage.getItem('userRole')
  
  // 测试阶段：设置默认token和用户角色，避免路由拦截
  const token = localStorage.getItem('token') || 'test-token'
  const userRole = localStorage.getItem('userRole') || 'admin'
  
  console.log('路由守卫:', { to: to.path, token: !!token, userRole, from: from.path })
  
  // 不需要认证的页面
  if (to.meta.requiresAuth === false) {
    console.log('不需要认证的页面，直接通过')
    next()
    return
  }
  
  // TODO: 前后端联测时，取消注释以下token检查代码
  // 检查是否已登录
  // if (!token) {
  //   console.log('未登录，跳转到登录页')
  //   next('/login')
  //   return
  // }
  
  // 检查用户角色权限
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    console.log('权限不足，根据用户角色跳转')
    // 根据用户角色跳转到不同的默认页面
    if (userRole === 'admin') {
      next('/user-management')
    } else {
      next('/requirement-management/input')
    }
    return
  }
  
  // 处理根路径的重定向
  if (to.path === '/') {
    if (userRole === 'admin') {
      next('/user-management')
    } else {
      next('/requirement-management/input')
    }
    return
  }
  
  next()
})

export default router
