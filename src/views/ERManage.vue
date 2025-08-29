<template>
  <div class="er-manage">
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>ER仓库</h3>
          <span class="subtitle">管理数据库设计描述</span>
        </div>
      </template>

      <div class="manage-content">
        <!-- ER模型列表 -->
        <ERModelList
          @edit="handleEdit"
          @preview="handlePreview"
          @delete="handleDelete"
        />

        <!-- ER模型编辑器对话框 -->
        <ERModelEditor
          :visible="editorVisible"
          :model-data="currentModel"
          @update:visible="editorVisible = $event"
          @success="handleEditorSuccess"
        />

        <!-- ER模型预览对话框 -->
        <ERModelPreview
          :visible="previewVisible"
          :model-data="currentModel"
          @update:visible="previewVisible = $event"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import ERModelList from "../components/er/ERModelList.vue";
import ERModelEditor from "../components/er/ERModelEditor.vue";
import ERModelPreview from "../components/er/ERModelPreview.vue";

// 对话框状态
const editorVisible = ref(false);
const previewVisible = ref(false);

// 当前操作的模型数据
const currentModel = ref(null);

// 编辑ER模型
const handleEdit = (model) => {
  currentModel.value = model;
  editorVisible.value = true;
};

// 预览ER模型
const handlePreview = (model) => {
  currentModel.value = model;
  previewVisible.value = true;
};

// 删除ER模型
const handleDelete = (model) => {
  console.log("删除ER模型:", model);
  ElMessage.success("删除成功");
  // 可以在这里添加其他删除后的处理逻辑
};

// 编辑器提交成功
const handleEditorSuccess = () => {
  ElMessage.success("操作成功");
  editorVisible.value = false;
};
</script>

<style scoped lang="scss">
.er-manage {
  height: 100%;
  padding: 20px;

  .main-card {
    height: 100%;

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        margin: 0;
        color: #303133;
        font-size: 18px;
        font-weight: 600;
      }

      .subtitle {
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .manage-content {
    height: calc(100% - 60px);
  }
}
</style>
