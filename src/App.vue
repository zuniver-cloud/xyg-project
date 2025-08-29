<script setup>
// App组件逻辑
</script>

<template>
  <router-view />
</template>

<style>
#app {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  min-width: 100vw;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial,
    sans-serif;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  min-width: 100vw;
}

html {
  overflow: hidden;
  min-height: 100vh;
  min-width: 100vw;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #3498db, #2980b9);
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #2980b9, #1f5f8b);
}

/* Element Plus 组件优化 */
.el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.el-card__body {
  flex: 1;
  overflow: auto;
  padding: 16px 24px;
}

.el-table {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.el-table__body-wrapper {
  overflow-y: auto;
}

.el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.el-input .el-input__wrapper,
.el-select .el-input__wrapper {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.el-input .el-input__wrapper:hover,
.el-select .el-input__wrapper:hover {
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.el-input .el-input__wrapper.is-focus,
.el-select .el-input__wrapper.is-focus {
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.25);
}

.el-tag {
  border-radius: 8px;
  font-weight: 500;
}

.el-pagination .el-pager li {
  border-radius: 8px;
  transition: all 0.3s;
}

.el-pagination .el-pager li:hover {
  background: rgba(52, 152, 219, 0.2);
  transform: translateY(-2px);
}

.el-pagination .el-pager li.active {
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: #fff;
}
</style>
