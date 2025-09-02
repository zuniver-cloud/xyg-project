<template>
  <div class="data-standards-parser">
    <el-card class="parser-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h4>数据标准结果</h4>
          <div class="header-actions">
            <el-button @click="handlePreview" size="small">
              <el-icon><View /></el-icon>
              预览
            </el-button>
            <el-button @click="handleCopy" size="small">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
            <el-button @click="handleDownload" size="small">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
          </div>
        </div>
      </template>

      <div class="parser-content">
        <!-- 左右分栏布局 -->
        <el-row :gutter="20" class="content-row">
          <!-- 左侧：可编辑的原始JSON -->
          <el-col :span="12" class="json-column">
            <div class="json-section">
              <h5>数据标准JSON（可编辑）</h5>
              <el-card shadow="never" class="json-card">
                <el-input
                  v-model="editableJson"
                  type="textarea"
                  placeholder="数据标准JSON数据..."
                  class="json-editor"
                  @input="handleJsonChange"
                />
                <div class="json-actions">
                  <el-button size="small" @click="formatJson" type="success">
                    格式化
                  </el-button>
                  <el-button size="small" @click="validateJson" type="warning">
                    验证
                  </el-button>
                  <el-button size="small" @click="syncToTables" type="primary">
                    同步到表格
                  </el-button>
                </div>
              </el-card>
            </div>
          </el-col>

          <!-- 右侧：数据标准表格 -->
          <el-col :span="12" class="tables-column">
            <div class="result-section">
              <h5>数据标准表格（可编辑）</h5>
              <el-card shadow="never" class="result-card">
                <!-- 实体表格 -->
                <div
                  v-if="editableEntities.length > 0"
                  class="entities-section"
                >
                  <div class="entities-list">
                    <div
                      v-for="(entity, entityIndex) in editableEntities"
                      :key="entityIndex"
                      class="entity-table"
                    >
                      <div class="table-header">
                        <el-input
                          v-model="entity.实体名"
                          placeholder="实体名称"
                          size="small"
                          class="entity-name-input"
                          @input="handleEntityChange"
                        />
                        <el-button
                          type="danger"
                          size="small"
                          @click="removeEntity(entityIndex)"
                          :icon="Delete"
                        >
                          删除实体
                        </el-button>
                      </div>

                      <!-- 字段信息Tabs -->
                      <div class="field-tabs-container">
                        <el-tabs
                          v-model="entity.activeTab"
                          type="border-card"
                          class="field-tabs"
                        >
                          <!-- 基础字段信息Tab -->
                          <el-tab-pane label="基础字段信息" name="basic">
                            <div class="tab-content">
                              <el-table
                                :data="entity.字段列表"
                                border
                                stripe
                                class="field-table"
                                size="small"
                              >
                                <el-table-column
                                  label="字段英文名"
                                  min-width="120"
                                >
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.字段英文名"
                                      placeholder="字段英文名"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column
                                  label="字段中文名"
                                  min-width="120"
                                >
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.字段中文名"
                                      placeholder="字段中文名"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column
                                  label="字段类型"
                                  min-width="100"
                                >
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.字段类型"
                                      placeholder="字段类型"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column label="长度" min-width="80">
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.长度"
                                      placeholder="长度"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column label="小数" min-width="60">
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.小数"
                                      placeholder="小数"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column
                                  label="操作"
                                  width="80"
                                  align="center"
                                >
                                  <template #default="{ $index }">
                                    <el-button
                                      type="danger"
                                      size="small"
                                      @click="removeField(entityIndex, $index)"
                                      :icon="Delete"
                                    >
                                      删除
                                    </el-button>
                                  </template>
                                </el-table-column>
                              </el-table>
                            </div>
                          </el-tab-pane>

                          <!-- 分类信息Tab -->
                          <el-tab-pane label="分类信息" name="category">
                            <div class="tab-content">
                              <el-table
                                :data="entity.字段列表"
                                border
                                stripe
                                class="field-table"
                                size="small"
                              >
                                <el-table-column
                                  label="安全级别"
                                  min-width="100"
                                >
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.security_level"
                                      placeholder="安全级别"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column label="分类1" min-width="120">
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.category_1"
                                      placeholder="分类1"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column label="分类2" min-width="120">
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.category_2"
                                      placeholder="分类2"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column label="分类3" min-width="120">
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.category_3"
                                      placeholder="分类3"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column label="分类4" min-width="120">
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.category_4"
                                      placeholder="分类4"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                                <el-table-column label="分类5" min-width="120">
                                  <template #default="{ row }">
                                    <el-input
                                      v-model="row.category_5"
                                      placeholder="分类5"
                                      size="small"
                                      @input="handleFieldChange"
                                    />
                                  </template>
                                </el-table-column>
                              </el-table>
                            </div>
                          </el-tab-pane>

                          <!-- 数据标准Tab -->
                          <el-tab-pane label="数据标准" name="standard">
                            <div class="tab-content">
                              <el-table
                                :data="entity.字段列表"
                                border
                                stripe
                                class="field-table"
                                size="small"
                              >
                                <el-table-column label="来源" min-width="200">
                                  <template #default="{ row }">
                                    <span class="field-value">{{
                                      row.数据标准?.来源 || "-"
                                    }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column label="类型" min-width="100">
                                  <template #default="{ row }">
                                    <span class="field-value">{{
                                      row.数据标准?.类型 || "-"
                                    }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column label="长度" min-width="80">
                                  <template #default="{ row }">
                                    <span class="field-value">{{
                                      row.数据标准?.长度 || "-"
                                    }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column label="精度" min-width="80">
                                  <template #default="{ row }">
                                    <span class="field-value">{{
                                      row.数据标准?.精度 || "-"
                                    }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column label="格式" min-width="120">
                                  <template #default="{ row }">
                                    <span class="field-value">{{
                                      row.数据标准?.格式 || "-"
                                    }}</span>
                                  </template>
                                </el-table-column>
                              </el-table>
                            </div>
                          </el-tab-pane>
                        </el-tabs>
                      </div>

                      <!-- 添加字段按钮 -->
                      <div class="add-field">
                        <el-button
                          size="small"
                          @click="addField(entityIndex)"
                          type="success"
                        >
                          <el-icon><Plus /></el-icon>
                          添加字段
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 添加实体按钮 -->
                <div class="add-entity">
                  <el-button @click="addEntity" type="primary">
                    <el-icon><Plus /></el-icon>
                    添加实体
                  </el-button>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>

        <!-- 底部操作按钮 -->
        <div class="bottom-actions">
          <el-button @click="handleSave" type="success" size="large">
            <el-icon><Check /></el-icon>
            保存到仓库
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="数据标准预览"
      width="80%"
      :before-close="handleClosePreview"
    >
      <div class="preview-content">
        <pre class="preview-json">{{ formattedJson }}</pre>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleSave">保存到仓库</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  View,
  DocumentCopy,
  Download,
  Delete,
  Plus,
  Check,
} from "@element-plus/icons-vue";

// Props
const props = defineProps({
  dataStandards: {
    type: Array,
    required: true,
  },
  erModel: {
    type: Object,
    required: true,
  },
});

// Emits
const emit = defineEmits(["save-to-repository"]);

// 响应式数据
const editableJson = ref("");
const editableEntities = ref([]);
const previewDialogVisible = ref(false);

// 计算属性
const formattedJson = computed(() => {
  try {
    return JSON.stringify(editableEntities.value, null, 2);
  } catch {
    return "JSON格式错误";
  }
});

// 监听数据标准变化
watch(
  () => props.dataStandards,
  (newStandards) => {
    if (newStandards) {
      editableEntities.value = JSON.parse(JSON.stringify(newStandards));
      // 为每个实体添加activeTab属性
      editableEntities.value.forEach((entity) => {
        if (!entity.activeTab) {
          entity.activeTab = "basic";
        }
      });
      editableJson.value = JSON.stringify(newStandards, null, 2);
    }
  },
  { immediate: true }
);

// 方法
const handleJsonChange = () => {
  try {
    const parsed = JSON.parse(editableJson.value);
    editableEntities.value = parsed;
  } catch (error) {
    // JSON格式错误时不更新表格
  }
};

const handleEntityChange = () => {
  // 实体名称变化时更新JSON
  editableJson.value = JSON.stringify(editableEntities.value, null, 2);
};

const handleFieldChange = () => {
  // 字段变化时更新JSON
  editableJson.value = JSON.stringify(editableEntities.value, null, 2);
};

const formatJson = () => {
  try {
    const parsed = JSON.parse(editableJson.value);
    editableJson.value = JSON.stringify(parsed, null, 2);
    ElMessage.success("JSON格式化完成");
  } catch (error) {
    ElMessage.error("JSON格式错误，无法格式化");
  }
};

const validateJson = () => {
  try {
    JSON.parse(editableJson.value);
    ElMessage.success("JSON格式验证通过");
  } catch (error) {
    ElMessage.error(`JSON格式错误: ${error.message}`);
  }
};

const syncToTables = () => {
  try {
    const parsed = JSON.parse(editableJson.value);
    editableEntities.value = parsed;
    ElMessage.success("数据已同步到表格");
  } catch (error) {
    ElMessage.error("JSON格式错误，无法同步");
  }
};

const addEntity = () => {
  const newEntity = {
    实体名: "新实体",
    字段列表: [],
    activeTab: "basic", // 默认选中基础字段信息tab
  };
  editableEntities.value.push(newEntity);
  editableJson.value = JSON.stringify(editableEntities.value, null, 2);
};

const removeEntity = (entityIndex) => {
  ElMessageBox.confirm(
    `确定要删除实体"${editableEntities.value[entityIndex].实体名}"吗？`,
    "确认删除",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      editableEntities.value.splice(entityIndex, 1);
      editableJson.value = JSON.stringify(editableEntities.value, null, 2);
      ElMessage.success("实体删除成功");
    })
    .catch(() => {
      // 用户取消
    });
};

const addField = (entityIndex) => {
  const newField = {
    字段英文名: "NEW_FIELD",
    字段中文名: "新字段",
    字段类型: "VARCHAR",
    长度: "255字符",
    小数: null,
    数据标准: {
      来源: "is2010/F-PMS-通用数据管理",
      类型: "文本",
      长度: "255",
      精度: "0",
      格式: "通用格式",
    },
    security_level: 1,
    category_1: "业务数据",
    category_2: "通用信息",
    category_3: "业务字段",
    category_4: "/",
    category_5: "/",
  };
  editableEntities.value[entityIndex].字段列表.push(newField);
  editableJson.value = JSON.stringify(editableEntities.value, null, 2);
};

const removeField = (entityIndex, fieldIndex) => {
  const fieldName =
    editableEntities.value[entityIndex].字段列表[fieldIndex].字段中文名;
  ElMessageBox.confirm(`确定要删除字段"${fieldName}"吗？`, "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      editableEntities.value[entityIndex].字段列表.splice(fieldIndex, 1);
      editableJson.value = JSON.stringify(editableEntities.value, null, 2);
      ElMessage.success("字段删除成功");
    })
    .catch(() => {
      // 用户取消
    });
};

const handlePreview = () => {
  previewDialogVisible.value = true;
};

const handleClosePreview = () => {
  previewDialogVisible.value = false;
};

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(editableJson.value);
    ElMessage.success("数据标准已复制到剪贴板");
  } catch {
    ElMessage.error("复制失败，请手动复制");
  }
};

const handleDownload = () => {
  try {
    const dataStr = editableJson.value;
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `data_standards_${
      props.erModel.erName
    }_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    ElMessage.success("文件下载已开始");
  } catch (error) {
    ElMessage.error("下载失败");
  }
};

const handleSave = () => {
  try {
    // 验证JSON格式
    const parsed = JSON.parse(editableJson.value);
    emit("save-to-repository", parsed);
    // 移除这里的消息提示，由父组件处理
  } catch (error) {
    ElMessage.error("JSON格式错误，无法保存");
  }
};

// 生命周期
onMounted(() => {
  // 组件初始化
});
</script>

<style scoped lang="scss">
.data-standards-parser {
  height: 100%;

  .parser-card {
    height: 100%;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        color: #2c3e50;
        font-size: 16px;
        font-weight: 600;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .parser-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .content-row {
      flex: 1;
      min-height: 0;

      .json-column,
      .tables-column {
        height: 100%;
        display: flex;
        flex-direction: column;

        .json-section,
        .result-section {
          height: 100%;
          display: flex;
          flex-direction: column;

          h5 {
            margin: 0 0 16px 0;
            color: #2c3e50;
            font-size: 14px;
            font-weight: 600;
          }

          .json-card,
          .result-card {
            flex: 1;
            display: flex;
            flex-direction: column;

            .json-editor {
              height: 550px;

              :deep(.el-textarea__inner) {
                height: 100% !important;
                resize: none;
                font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
                font-size: 12px;
                line-height: 1.6;
              }
            }

            .json-actions {
              margin-top: 16px;
              display: flex;
              gap: 8px;
            }
          }
        }
      }

      .tables-column {
        .entities-section {
          margin-bottom: 20px;

          h6 {
            margin: 0 0 12px 0;
            color: #2c3e50;
            font-size: 13px;
            font-weight: 600;
          }

          .entities-list {
            max-height: 550px;
            overflow-y: auto;
            padding-right: 8px;

            // 自定义滚动条样式
            &::-webkit-scrollbar {
              width: 6px;
            }

            &::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 3px;
            }

            &::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 3px;

              &:hover {
                background: #a8a8a8;
              }
            }
          }

          .entity-table {
            margin-bottom: 20px;
            border: 1px solid #e4e7ed;
            border-radius: 6px;
            overflow: hidden;

            .table-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px;
              background: #f8f9fa;
              border-bottom: 1px solid #e4e7ed;

              .entity-name-input {
                width: 200px;
              }
            }

            // 字段信息Tabs样式
            .field-tabs-container {
              margin: 16px 0;

              .field-tabs {
                :deep(.el-tabs__content) {
                  padding: 16px;
                }

                .tab-content {
                  .field-table {
                    :deep(.el-table__body) {
                      .el-input {
                        .el-input__wrapper {
                          padding: 4px 8px;
                        }
                      }
                    }
                  }
                }
              }
            }

            // 只读字段值样式
            .field-value {
              font-size: 13px;
              color: #2c3e50;
              background: #f0f9ff;
              padding: 8px 12px;
              border-radius: 4px;
              border: 1px solid #b3d8ff;
              min-height: 32px;
              display: flex;
              align-items: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .add-field {
              padding: 12px;
              text-align: center;
              border-top: 1px solid #e4e7ed;
            }
          }
        }

        .add-entity {
          text-align: center;
          padding: 20px 0;
          border-top: 1px solid #e4e7ed;
        }
      }
    }

    .bottom-actions {
      margin-top: 20px;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e4e7ed;
    }
  }
}

// 预览对话框样式
.preview-content {
  max-height: 60vh;
  overflow-y: auto;

  .preview-json {
    margin: 0;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 12px;
    line-height: 1.6;
    color: #2c3e50;
    background: #f8f9fa;
    padding: 16px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
