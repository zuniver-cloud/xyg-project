<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <img src="../assets/icbc.png" alt="Logo" v-if="!isCollapse" />
        <el-icon v-else><Cpu /></el-icon>
        <span v-if="!isCollapse">智能设计助手</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <template v-for="route in menuRoutes">
          <!-- 有子菜单的情况 -->
          <el-sub-menu
            v-if="route.children && route.children.length > 0"
            :key="route.path"
            :index="`/${route.path}`"
          >
            <template #title>
              <el-icon><component :is="route.meta.icon" /></el-icon>
              <span>{{ route.meta.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="`/${route.path}/${child.path}`"
            >
              <el-icon><component :is="child.meta.icon" /></el-icon>
              <template #title>{{ child.meta.title }}</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 没有子菜单的情况 -->
          <el-menu-item v-else :key="route.path" :index="`/${route.path}`">
            <el-icon><component :is="route.meta.icon" /></el-icon>
            <template #title>{{ route.meta.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button type="text" @click="toggleCollapse" class="collapse-btn">
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo.avatar">
                {{ userStore.userInfo.name?.charAt(0) }}
              </el-avatar>
              <span class="username">{{
                userStore.userInfo.nickname || userStore.userInfo.username
              }}</span>
              <span class="user-role"
                >({{
                  userStore.userInfo.role === "admin" ? "管理员" : "普通用户"
                }})</span
              >
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { ElMessageBox } from "element-plus";
import { Cpu, Fold, Expand, ArrowDown } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isCollapse = ref(false);

// 菜单路由
const menuRoutes = computed(() => {
  const mainRoute = router.getRoutes().find((r) => r.path === "/");
  const userRole = localStorage.getItem("userRole") || "user";

  console.log("菜单路由检查:", { userRole });

  return (
    mainRoute?.children?.filter((route) => {
      // 过滤掉没有标题的路由
      if (!route.meta?.title) return false;

      // 检查权限
      if (route.meta.roles && !route.meta.roles.includes(userRole)) {
        console.log("过滤菜单:", route.meta.title, "用户角色:", userRole);
        return false;
      }

      // 如果有子菜单，过滤子菜单
      if (route.children && route.children.length > 0) {
        route.children = route.children.filter((child) => {
          if (!child.meta?.title) return false;
          if (child.meta.roles && !child.meta.roles.includes(userRole)) {
            return false;
          }
          return true;
        });

        // 如果过滤后没有子菜单，则不显示父菜单
        if (route.children.length === 0) {
          return false;
        }
      }

      return true;
    }) || []
  );
});

// 当前激活的菜单
const activeMenu = computed(() => route.path);

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title);
  return matched.map((item) => ({
    title: item.meta.title,
    path: item.path,
  }));
});

// 切换侧边栏
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 处理用户下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case "profile":
      // 跳转到个人资料页面
      break;
    case "password":
      // 打开修改密码对话框
      break;
    case "logout":
      try {
        await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        await userStore.logout();
        router.push("/login");
      } catch {
        // 用户取消
      }
      break;
  }
};
</script>

<style scoped lang="scss">
.app-layout {
  height: 100vh;
  width: 100vw;
  display: flex;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.sidebar {
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);

  .logo {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.05);

    img {
      width: 36px;
      height: 36px;
      margin-right: 12px;
      border-radius: 8px;
    }

    span {
      background: linear-gradient(45deg, #3498db, #9b59b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .sidebar-menu {
    border: none;
    background: transparent;
    height: calc(100vh - 70px);
    overflow-y: auto;
    padding: 10px 0;

    :deep(.el-menu-item) {
      color: #ecf0f1;
      margin: 4px 8px;
      border-radius: 8px;
      height: 48px;
      line-height: 48px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: linear-gradient(45deg, #3498db, #2980b9);
        color: #fff;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
      }

      &.is-active {
        background: linear-gradient(45deg, #e74c3c, #c0392b);
        color: #fff;
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
      }

      .el-icon {
        font-size: 18px;
        margin-right: 12px;
      }
    }

    :deep(.el-sub-menu) {
      .el-sub-menu__title {
        color: #ecf0f1;
        margin: 4px 8px;
        border-radius: 8px;
        height: 48px;
        line-height: 48px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          background: linear-gradient(45deg, #3498db, #2980b9);
          color: #fff;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .el-icon {
          font-size: 18px;
          margin-right: 12px;
        }

        .el-sub-menu__icon-arrow {
          color: #ecf0f1;
          font-size: 12px;
          transition: all 0.3s;
        }

        &:hover .el-sub-menu__icon-arrow {
          color: #fff;
        }
      }

      .el-menu {
        background: transparent;
        border: none;
        padding-left: 20px;

        .el-menu-item {
          margin: 2px 8px;
          border-radius: 6px;
          height: 40px;
          line-height: 40px;
          font-size: 14px;

          &:hover {
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: #fff;
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
          }

          &.is-active {
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: #fff;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
          }

          .el-icon {
            font-size: 16px;
            margin-right: 10px;
          }
        }
      }
    }
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; // 防止内容溢出
  height: 100vh;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 70px;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;

    .collapse-btn {
      margin-right: 24px;
      font-size: 20px;
      color: #2c3e50;
      transition: all 0.3s;

      &:hover {
        color: #3498db;
        transform: translateY(-1px);
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 12px 16px;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: rgba(52, 152, 219, 0.1);

      &:hover {
        background: rgba(52, 152, 219, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
      }

      .username {
        margin: 0 8px;
        font-size: 15px;
        font-weight: 500;
        color: #2c3e50;
      }

      .user-role {
        font-size: 12px;
        color: #7f8c8d;
        background: rgba(52, 152, 219, 0.2);
        padding: 2px 8px;
        border-radius: 10px;
        margin-left: 4px;
      }
    }
  }
}

.main-content {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  height: calc(100vh - 70px);
  min-height: 0;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(52, 152, 219, 0.5);
    border-radius: 4px;

    &:hover {
      background: rgba(52, 152, 219, 0.7);
    }
  }
}
</style>
