<template>
  <div class="requirement-management">
    <!-- 子页面内容 -->
    <div class="sub-page-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// 需求管理父级组件，子页面内容通过左侧菜单切换
</script>

<style scoped lang="scss">
.requirement-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .sub-page-content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
