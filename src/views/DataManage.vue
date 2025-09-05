<template>
  <div class="data-manage">
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>数据标准仓库</h3>
          <span class="subtitle">管理已生成的数据标准</span>
        </div>
      </template>

      <div class="manage-content">
        <!-- 数据标准列表 -->
        <DataStandardsList
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
          @refresh="handleRefresh"
        />
      </div>
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="数据标准详情"
      width="800px"
      :before-close="handleCloseViewDialog"
    >
      <div v-if="currentStandard" class="standard-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标准名称">
            {{ currentStandard.name }}
          </el-descriptions-item>
          <el-descriptions-item label="标准描述">
            {{ currentStandard.description || "暂无描述" }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ currentStandard.updateAt }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="standard-content">
          <h4>标准内容</h4>
          <el-input
            v-model="currentStandard.content"
            type="textarea"
            :rows="10"
            readonly
          />
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentStandard)">
            编辑
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑数据标准对话框 -->
    <DataStandardEditor
      v-model:visible="editorVisible"
      :standard-data="currentStandard"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import DataStandardsList from "../components/ai/DataStandardsList.vue";
import DataStandardEditor from "../components/ai/DataStandardEditor.vue";

const viewDialogVisible = ref(false);
const editorVisible = ref(false);
const currentStandard = ref(null);

const handleView = (row) => {
  currentStandard.value = row;
  viewDialogVisible.value = true;
};

const handleEdit = (row) => {
  currentStandard.value = row;
  editorVisible.value = true;
};

const handleDelete = (row) => {
  ElMessage.success("删除成功");
};

const handleEditSuccess = (updatedStandard) => {
  // 更新当前查看的标准数据
  if (
    currentStandard.value &&
    currentStandard.value.id === updatedStandard.id
  ) {
    Object.assign(currentStandard.value, updatedStandard);
  }

  // 通知列表组件刷新数据
  // 这里可以通过事件总线或者重新获取数据来更新列表
  ElMessage.success("数据标准更新成功");
};

const handleCloseViewDialog = () => {
  viewDialogVisible.value = false;
  currentStandard.value = null;
};

const handleRefresh = () => {
  // 刷新数据标准列表
  // 这里可以重新获取数据或者通知子组件刷新
  ElMessage.success("数据已刷新");
};
</script>

<style scoped lang="scss">
.data-manage {
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
