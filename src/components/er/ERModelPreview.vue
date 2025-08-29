<template>
  <el-dialog
    :model-value="visible"
    title="ER模型预览"
    width="85%"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <div class="er-model-preview" v-if="modelData">
      <!-- 基本信息 -->
      <div class="info-section">
        <h5>基本信息</h5>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模型ID">
            {{ modelData.er_model_id }}
          </el-descriptions-item>
          <el-descriptions-item label="模型标题">
            {{ modelData.title }}
          </el-descriptions-item>
          <el-descriptions-item label="模型描述">
            {{ modelData.description }}
          </el-descriptions-item>
          <el-descriptions-item label="创建用户">
            {{ modelData.user_id }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ modelData.created_at }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ modelData.updated_at }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 数据库设计表格 -->
      <div class="tables-section" v-if="parsedData">
        <h5>数据库设计表格</h5>
        <el-card shadow="never" class="tables-card">
          <!-- 实体表格 -->
          <div v-if="parsedData.entities && parsedData.entities.length > 0" class="entities-section">
            <h6>实体表设计</h6>
            <div v-for="(entity, entityIndex) in parsedData.entities" :key="entityIndex" class="entity-table">
              <div class="entity-header">
                <h4>{{ entity.name }}</h4>
              </div>
              <el-table :data="entity.attribute" border stripe class="attribute-table">
                <el-table-column label="字段英文名" min-width="200" align="left">
                  <template #default="{ row }">
                    <span>{{ row['字段英文名'] || row.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="字段中文名" min-width="200" align="left">
                  <template #default="{ row }">
                    <span>{{ row['字段中文名'] || row.description || row.name }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          
          <!-- 关系表格 -->
          <div v-if="parsedData.relationship && parsedData.relationship.length > 0" class="relationships-section">
            <h6>关系表设计</h6>
            <el-table :data="parsedData.relationship" border stripe class="relationship-table">
              <el-table-column label="关系名称" min-width="180" align="left">
                <template #default="{ row }">
                  <span>{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="源实体" min-width="150" align="left">
                <template #default="{ row }">
                  <span>{{ row.from }}</span>
                </template>
              </el-table-column>
              <el-table-column label="目标实体" min-width="150" align="left">
                <template #default="{ row }">
                  <span>{{ row.to }}</span>
                </template>
              </el-table-column>
              <el-table-column label="关系类型" min-width="150" align="center">
                <template #default="{ row }">
                  <el-tag :type="getRelationshipTypeColor(row.type)" size="small">
                    {{ getRelationshipTypeText(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="约束" min-width="200" align="left">
                <template #default="{ row }">
                  <span>{{ row.constraints }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>

      <!-- 数据库设计描述 -->
      <div class="content-section">
        <h5>数据库设计描述</h5>
        <el-card shadow="never" class="content-card">
          <div class="content-text" v-html="formattedContent"></div>
        </el-card>
      </div>

      <!-- JSON数据 -->
      <div class="json-section">
        <h5>JSON数据</h5>
        <el-card shadow="never" class="json-card">
          <pre class="json-text">{{ formattedJson }}</pre>
        </el-card>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="暂无数据" />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  modelData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'edit'])

// 解析JSON数据
const parsedData = computed(() => {
  if (!props.modelData?.json_data) return null
  
  try {
    const jsonData = typeof props.modelData.json_data === 'string' 
      ? JSON.parse(props.modelData.json_data) 
      : props.modelData.json_data
    
    return jsonData
  } catch (error) {
    console.error('JSON解析失败:', error)
    return null
  }
})

// 格式化内容
const formattedContent = computed(() => {
  if (!props.modelData?.content) return '暂无内容'
  
  // 格式化处理
  let formatted = props.modelData.content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(.+)$/gm, '<p>$1</p>') // 将每行包装为段落
  
  return formatted
})

// 格式化JSON数据
const formattedJson = computed(() => {
  if (!props.modelData?.json_data) return '暂无JSON数据'
  
  try {
    // 如果是字符串，尝试解析为JSON对象再格式化
    const jsonData = typeof props.modelData.json_data === 'string' 
      ? JSON.parse(props.modelData.json_data) 
      : props.modelData.json_data
    
    return JSON.stringify(jsonData, null, 2)
  } catch (error) {
    // 如果解析失败，直接显示原始数据
    return props.modelData.json_data
  }
})

// 获取关系类型颜色
const getRelationshipTypeColor = (type) => {
  const colorMap = {
    '1:1': 'success',
    '1:N': 'warning',
    'N:1': 'info',
    'M:N': 'danger',
    'one-to-one': 'success',
    'one-to-many': 'warning',
    'many-to-one': 'info',
    'many-to-many': 'danger'
  }
  return colorMap[type] || 'default'
}

// 获取关系类型文本
const getRelationshipTypeText = (type) => {
  const textMap = {
    '1:1': '一对一',
    '1:N': '一对多',
    'N:1': '多对一',
    'M:N': '多对多',
    'one-to-one': '一对一',
    'one-to-many': '一对多',
    'many-to-one': '多对一',
    'many-to-many': '多对多'
  }
  return textMap[type] || type
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}

// 编辑
const handleEdit = () => {
  emit('edit', props.modelData)
  handleClose()
}
</script>

<style scoped lang="scss">
.er-model-preview {
  max-height: 65vh;
  overflow-y: auto;
  
  .info-section,
  .tables-section,
  .content-section,
  .json-section {
    margin-bottom: 24px;
    
    h5 {
      margin: 0 0 12px 0;
      color: #303133;
      font-size: 14px;
      font-weight: 600;
    }
  }
  
  .tables-card {
    .entities-section, .relationships-section {
      margin-bottom: 24px;
      
      h6 {
        margin: 0 0 12px 0;
        color: #606266;
        font-size: 13px;
        font-weight: 600;
      }
    }
    
    .relationships-section {
      border: 1px solid #ebeef5;
      border-radius: 4px;
      overflow: hidden;
      
      h6 {
        margin: 0;
        padding: 12px 16px;
        background-color: #f5f7fa;
        border-bottom: 1px solid #ebeef5;
      }
      
      .relationship-table {
        margin: 0 !important;
        padding: 0 !important;
        
        :deep(.el-table) {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        :deep(.el-table__header-wrapper) {
          margin: 0 !important;
          padding: 0 !important;
          
          .el-table__header {
            margin: 0 !important;
            padding: 0 !important;
            
            th {
              background-color: #f5f7fa;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        }
        
        :deep(.el-table__body-wrapper) {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        :deep(.el-table__body) {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        :deep(.el-table__cell) {
          padding: 8px 12px !important;
          text-align: left !important;
          vertical-align: middle !important;
        }
        
        :deep(.el-table__header) {
          .el-table__cell {
            padding: 8px 12px !important;
            text-align: left !important;
            vertical-align: middle !important;
            font-weight: 600 !important;
          }
        }
        
        :deep(.el-table__body) {
          .el-table__cell {
            padding: 8px 12px !important;
            text-align: left !important;
            vertical-align: middle !important;
          }
        }
      }
    }
    
    .entity-table {
      margin-bottom: 16px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      overflow: hidden;
      
      .entity-header {
        background-color: #f5f7fa;
        padding: 12px 16px;
        border-bottom: 1px solid #ebeef5;
        margin: 0;
        
        h4 {
          margin: 0;
          color: #303133;
          font-size: 14px;
          font-weight: 600;
        }
      }
      
      .attribute-table {
        margin: 0 !important;
        padding: 0 !important;
        
        :deep(.el-table) {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        :deep(.el-table__header-wrapper) {
          margin: 0 !important;
          padding: 0 !important;
          
          .el-table__header {
            margin: 0 !important;
            padding: 0 !important;
            
            th {
              background-color: #f5f7fa;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        }
        
        :deep(.el-table__body-wrapper) {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        :deep(.el-table__body) {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        :deep(.el-table__cell) {
          padding: 8px 12px !important;
          text-align: left !important;
          vertical-align: middle !important;
        }
        
        :deep(.el-table__header) {
          .el-table__cell {
            padding: 8px 12px !important;
            text-align: left !important;
            vertical-align: middle !important;
            font-weight: 600 !important;
          }
        }
        
        :deep(.el-table__body) {
          .el-table__cell {
            padding: 8px 12px !important;
            text-align: left !important;
            vertical-align: middle !important;
          }
        }
      }
    }
    
    // 全局表格占满容器样式
    :deep(.attribute-table) {
      width: 100% !important;
      
      .el-table {
        width: 100% !important;
        table-layout: fixed !important;
      }
      
      .el-table__header-wrapper,
      .el-table__body-wrapper {
        width: 100% !important;
      }
    }
    
    :deep(.relationship-table) {
      width: 100% !important;
      
      .el-table {
        width: 100% !important;
        table-layout: fixed !important;
      }
      
      .el-table__header-wrapper,
      .el-table__body-wrapper {
        width: 100% !important;
      }
    }
    
    .constraints {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }
  
  .content-card {
    .content-text {
      line-height: 1.6;
      color: #303133;
      
      p {
        margin: 0 0 8px 0;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
      
      strong {
        font-weight: 600;
        color: #409eff;
      }
      
      em {
        font-style: italic;
        color: #67c23a;
      }
    }
  }
  
  .json-card {
    .json-text {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.4;
      margin: 0;
      color: #606266;
      background-color: #fafafa;
      padding: 12px;
      border-radius: 4px;
      max-height: 400px;
      overflow-y: auto;
    }
  }
}

.empty-state {
  padding: 40px 0;
}

.dialog-footer {
  .el-button {
    .el-icon {
      margin-right: 4px;
    }
  }
}
</style>


