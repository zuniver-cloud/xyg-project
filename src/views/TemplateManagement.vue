<template>
  <div class="template-management">
    <!-- 权限检查 -->
    <div v-if="!hasPermission" class="permission-denied">
      <el-result
        icon="warning"
        title="权限不足"
        sub-title="您没有权限访问模板管理功能"
      >
        <template #extra>
          <el-button type="primary" @click="goToDashboard">返回首页</el-button>
        </template>
      </el-result>
    </div>

    <!-- 主要内容 -->
    <div v-else>
      <!-- 模板列表 -->
      <TemplateList
        @add="handleAdd"
        @edit="handleEdit"
        @preview="handlePreview"
      />

      <!-- 模板编辑器对话框 -->
      <TemplateEditor
        :visible="formVisible"
        :template-data="currentTemplate"
        @update:visible="formVisible = $event"
        @success="handleFormSuccess"
      />

      <!-- 模板预览对话框 -->
      <TemplatePreview
        :visible="previewVisible"
        :template-data="currentTemplate"
        @update:visible="previewVisible = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import TemplateList from "../components/template/TemplateList.vue";
import TemplateEditor from "../components/template/TemplateEditor.vue";
import TemplatePreview from "../components/template/TemplatePreview.vue";

const router = useRouter();

// 权限检查
const hasPermission = computed(() => {
  const userRole = localStorage.getItem("userRole") || "user";
  return userRole === "admin";
});

// 对话框状态
const formVisible = ref(false);
const previewVisible = ref(false);

// 当前操作的模板数据
const currentTemplate = ref(null);

// 返回首页
const goToDashboard = () => {
  const userRole = localStorage.getItem("userRole") || "user";
  if (userRole === "admin") {
    router.push("/user-management");
  } else {
    router.push("/requirement-management/input");
  }
};

// 新增模板
const handleAdd = () => {
  currentTemplate.value = null;
  formVisible.value = true;
};

// 编辑模板
const handleEdit = (template) => {
  currentTemplate.value = template;
  formVisible.value = true;
};

// 预览模板
const handlePreview = (template) => {
  console.log("TemplateManagement: 接收到的模板数据:", template);
  currentTemplate.value = template;
  previewVisible.value = true;
};

// 表单提交成功
const handleFormSuccess = () => {
  ElMessage.success("操作成功");
  // 可以在这里刷新列表
};

onMounted(() => {
  if (!hasPermission.value) {
    ElMessage.error("您没有权限访问模板管理功能");
  }
});
</script>

<style scoped lang="scss">
.template-management {
  height: 100%;

  .permission-denied {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
