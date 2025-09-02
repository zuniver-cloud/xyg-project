<template>
  <div class="data-standards">
    <!-- 子页面内容 -->
    <div class="sub-page-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// 布局组件，用于子路由
</script>

<style scoped lang="scss">
.data-standards {
  height: 100%;

  .sub-page-content {
    height: 100%;
  }
}
</style>
