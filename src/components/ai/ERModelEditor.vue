<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="85%"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <div class="er-model-editor">
             <el-form
         ref="formRef"
         :model="form"
         :rules="rules"
         label-width="100px"
       >
        <el-form-item label="模型标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入ER模型标题"
          />
        </el-form-item>
        
        <el-form-item label="模型描述" prop="description">
          <el-input
            v-model="form.description"
            placeholder="请输入ER模型描述"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        
        <!-- 数据库设计表格编辑 -->
        <el-form-item label="数据库设计" prop="json_data">
          <div class="tables-editor">
            <div class="editor-header">
              <span class="label">数据库设计表格</span>
              <div class="editor-tools">
                <el-button size="small" @click="handleFormatJson">格式化JSON</el-button>
                <el-button size="small" @click="handleSyncToJson">同步到JSON</el-button>
              </div>
            </div>
            
            <!-- 表格编辑区域 -->
            <div class="tables-content" v-if="parsedData">
              <!-- 实体表格 -->
              <div v-if="editableEntities.length > 0" class="entities-section">
                <h6>实体表设计</h6>
                <div v-for="(entity, entityIndex) in editableEntities" :key="entityIndex" class="entity-table">
                  <div class="table-header">
                    <el-input
                      v-model="entity.name"
                      placeholder="实体名称"
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
                  
                  <!-- 属性表格 -->
                  <el-table :data="entity.attributes" border stripe class="attribute-table">
                    <el-table-column label="字段名" width="120">
                      <template #default="{ row, $index }">
                        <el-input
                          v-model="row.name"
                          placeholder="字段名"
                          size="small"
                          @input="handleAttributeChange"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="数据类型" width="130">
                      <template #default="{ row }">
                        <el-input
                          v-model="row.type"
                          placeholder="如：varchar(255)、int、decimal(10,2)、PK、FK、json、uuid、timestamp、enum('active','inactive')等"
                          size="small"
                          @input="handleAttributeChange"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="描述" min-width="150">
                      <template #default="{ row }">
                        <el-input
                          v-model="row.description"
                          placeholder="字段描述"
                          size="small"
                          @input="handleAttributeChange"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="70" align="center">
                      <template #default="{ $index }">
                        <el-button
                          type="danger"
                          size="small"
                          @click="removeAttribute(entityIndex, $index)"
                          :icon="Delete"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                  
                  <!-- 添加属性按钮 -->
                  <div class="add-button">
                    <el-button
                      type="primary"
                      size="small"
                      @click="addAttribute(entityIndex)"
                      :icon="Plus"
                    >
                      添加字段
                    </el-button>
                  </div>
                </div>
                
                <!-- 添加实体按钮 -->
                <div class="add-entity-button">
                  <el-button
                    type="primary"
                    @click="addEntity"
                    :icon="Plus"
                  >
                    添加实体
                  </el-button>
                </div>
              </div>
              
              <!-- 关系表格 -->
              <div v-if="editableRelationships.length > 0" class="relationships-section">
                <h6>关系表设计</h6>
                <el-table :data="editableRelationships" border stripe class="relationship-table">
                  <el-table-column label="关系名称" width="120">
                    <template #default="{ row }">
                      <el-input
                        v-model="row.name"
                        placeholder="关系名称"
                        size="small"
                        @input="handleRelationshipChange"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="源实体" width="100">
                    <template #default="{ row }">
                      <el-select
                        v-model="row.from"
                        placeholder="源实体"
                        size="small"
                        @change="handleRelationshipChange"
                      >
                        <el-option
                          v-for="entity in editableEntities"
                          :key="entity.name"
                          :label="entity.name"
                          :value="entity.name"
                        />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="目标实体" width="100">
                    <template #default="{ row }">
                      <el-select
                        v-model="row.to"
                        placeholder="目标实体"
                        size="small"
                        @change="handleRelationshipChange"
                      >
                        <el-option
                          v-for="entity in editableEntities"
                          :key="entity.name"
                          :label="entity.name"
                          :value="entity.name"
                        />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="关系类型" width="100">
                    <template #default="{ row }">
                      <el-select
                        v-model="row.type"
                        placeholder="关系类型"
                        size="small"
                        @change="handleRelationshipChange"
                      >
                        <el-option label="一对一" value="one-to-one" />
                        <el-option label="一对多" value="one-to-many" />
                        <el-option label="多对一" value="many-to-one" />
                        <el-option label="多对多" value="many-to-many" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="70" align="center">
                    <template #default="{ $index }">
                      <el-button
                        type="danger"
                        size="small"
                        @click="removeRelationship($index)"
                        :icon="Delete"
                      />
                    </template>
                  </el-table-column>
                </el-table>
                
                <!-- 添加关系按钮 -->
                <div class="add-button">
                  <el-button
                    type="primary"
                    size="small"
                    @click="addRelationship"
                    :icon="Plus"
                  >
                    添加关系
                  </el-button>
                </div>
              </div>
            </div>
            
            <!-- JSON编辑器 -->
            <div class="json-editor">
              <div class="editor-header">
                <span class="label">JSON数据</span>
              </div>
              <el-input
                v-model="form.json_data"
                type="textarea"
                :rows="15"
                placeholder="请输入JSON数据..."
                class="json-textarea"
                @input="handleJsonChange"
              />
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="设计描述" prop="content">
          <div class="content-editor">
            <div class="editor-header">
              <span class="label">数据库设计描述</span>
              <div class="editor-tools">
                <el-button size="small" @click="handlePreview">预览</el-button>
              </div>
            </div>
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="10"
              placeholder="请输入数据库设计描述内容..."
              class="content-textarea"
            />
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="设计描述预览"
      width="600px"
      append-to-body
    >
      <div class="preview-content">
        <div class="preview-text" v-html="formattedPreview"></div>
      </div>
    </el-dialog>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

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

const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref()

// 提交加载状态
const submitLoading = ref(false)

// 预览对话框
const previewVisible = ref(false)

// 可编辑的实体和关系数据
const editableEntities = ref([])
const editableRelationships = ref([])

// 表单数据
const form = reactive({
  title: '',
  description: '',
  content: '',
  json_data: ''
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入模型标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入模型描述', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入数据库设计描述', trigger: 'blur' }
  ],
  json_data: [
    { required: true, message: '请输入JSON数据', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value && value.trim()) {
          try {
            JSON.parse(value)
            callback()
          } catch (error) {
            callback(new Error('JSON格式错误'))
          }
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 对话框标题
const dialogTitle = computed(() => {
  return props.modelData ? '编辑ER模型' : '新增ER模型'
})

// 解析JSON数据
const parsedData = computed(() => {
  if (!form.json_data) return null
  
  try {
    const jsonData = typeof form.json_data === 'string' 
      ? JSON.parse(form.json_data) 
      : form.json_data
    
    return jsonData
  } catch (error) {
    return null
  }
})

// 格式化预览内容
const formattedPreview = computed(() => {
  if (!form.content) return '暂无内容'
  
  // 简单的格式化处理
  let formatted = form.content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  return formatted
})

// 监听visible变化，初始化表单
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initForm()
  }
})

// 监听JSON数据变化，更新表格
watch(() => form.json_data, (newVal) => {
  if (newVal) {
    initializeData()
  }
})

// 初始化表单
const initForm = () => {
  if (props.modelData) {
    // 编辑模式
    form.title = props.modelData.title || ''
    form.description = props.modelData.description || ''
    form.content = props.modelData.content || ''
    form.json_data = props.modelData.json_data || ''
  } else {
    // 新增模式
    form.title = ''
    form.description = ''
    form.content = ''
    form.json_data = ''
  }
  
  // 初始化表格数据
  nextTick(() => {
    initializeData()
  })
}

// 初始化数据
const initializeData = () => {
  if (!parsedData.value) {
    editableEntities.value = []
    editableRelationships.value = []
    return
  }
  
  // 初始化实体数据
  editableEntities.value = (parsedData.value.entities || []).map(entity => ({
    name: entity.name || '',
    attributes: (entity.attribute || []).map(attr => ({
      name: attr.name || '',
      type: attr.type || '',
      description: attr.description || '',
      constraints: attr.constraints || [],
      notNull: attr.notNull || false,
      unique: attr.unique || false,
      defaultValue: attr.defaultValue || null,
      check: attr.check || null
    }))
  }))
  
  // 初始化关系数据
  editableRelationships.value = (parsedData.value.relationship || []).map(rel => ({
    name: rel.name || '',
    from: rel.from || '',
    to: rel.to || '',
    type: rel.type || 'one-to-many',
    attributes: rel.attributes || [],
    constraints: rel.constraints || null
  }))
}

// 更新JSON数据
const updateJsonFromTables = () => {
  const jsonData = {
    entities: editableEntities.value.map(entity => ({
      name: entity.name,
      attribute: entity.attributes.map(attr => ({
        name: attr.name,
        type: attr.type,
        description: attr.description,
        constraints: attr.constraints,
        notNull: attr.notNull,
        unique: attr.unique,
        defaultValue: attr.defaultValue,
        check: attr.check
      }))
    })),
    relationship: editableRelationships.value.map(rel => ({
      name: rel.name,
      from: rel.from,
      to: rel.to,
      type: rel.type,
      attributes: rel.attributes,
      constraints: rel.constraints
    }))
  }
  
  form.json_data = JSON.stringify(jsonData, null, 2)
}

// 添加实体
const addEntity = () => {
  editableEntities.value.push({
    name: '',
    attributes: []
  })
}

// 删除实体
const removeEntity = (index) => {
  editableEntities.value.splice(index, 1)
  updateJsonFromTables()
}

// 添加属性
const addAttribute = (entityIndex) => {
  editableEntities.value[entityIndex].attributes.push({
    name: '',
    type: '',
    description: '',
    constraints: [],
    notNull: false,
    unique: false,
    defaultValue: null,
    check: null
  })
}

// 删除属性
const removeAttribute = (entityIndex, attrIndex) => {
  editableEntities.value[entityIndex].attributes.splice(attrIndex, 1)
  updateJsonFromTables()
}

// 添加关系
const addRelationship = () => {
  editableRelationships.value.push({
    name: '',
    from: '',
    to: '',
    type: 'one-to-many',
    attributes: [],
    constraints: null
  })
}

// 删除关系
const removeRelationship = (index) => {
  editableRelationships.value.splice(index, 1)
  updateJsonFromTables()
}

// 实体变化处理
const handleEntityChange = () => {
  updateJsonFromTables()
}

// 属性变化处理
const handleAttributeChange = () => {
  updateJsonFromTables()
}

// 关系变化处理
const handleRelationshipChange = () => {
  updateJsonFromTables()
}

// JSON变化处理
const handleJsonChange = () => {
  initializeData()
}

// 格式化JSON
const handleFormatJson = () => {
  try {
    const jsonData = JSON.parse(form.json_data)
    form.json_data = JSON.stringify(jsonData, null, 2)
    ElMessage.success('JSON格式化成功')
  } catch (error) {
    ElMessage.error('JSON格式错误')
  }
}

// 同步到JSON
const handleSyncToJson = () => {
  updateJsonFromTables()
  ElMessage.success('已同步到JSON')
}

// 预览
const handlePreview = () => {
  if (!form.content.trim()) {
    ElMessage.warning('请先输入内容')
    return
  }
  previewVisible.value = true
}



// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    const submitData = {
      title: form.title,
      description: form.description,
      content: form.content,
      json_data: form.json_data
    }
    
    // 模拟API调用
    const mockResponse = {
      code: 200,
      msg: props.modelData ? '修改成功' : '新增成功',
      data: {
        er_model_id: props.modelData ? props.modelData.er_model_id : Date.now()
      }
    }
    
    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // let response
    // if (props.modelData) {
    //   response = await updateERModel(props.modelData.er_model_id, submitData)
    // } else {
    //   response = await createERModel(submitData)
    // }
    
    const response = mockResponse
    
    if (response.code === 200) {
      ElMessage.success(response.msg)
      emit('success')
      handleClose()
    }
  } catch (error) {
    console.error('Submit ER model error:', error)
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  previewVisible.value = false
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.er-model-editor {
  // 确保内容不会溢出对话框
  max-width: 100%;
  max-height: 65vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 16px; // 减少左右内边距
  
  .tables-editor {
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .label {
        font-weight: 600;
        color: #303133;
        font-size: 14px;
      }
      
      .editor-tools {
        display: flex;
        gap: 12px;
      }
    }
    
    .tables-content {
      margin-bottom: 24px;
      
      .entities-section, .relationships-section {
        margin-bottom: 32px;
        
        h6 {
          margin: 0 0 16px 0;
          color: #606266;
          font-size: 14px;
          font-weight: 600;
        }
      }
      
      .entity-table {
        margin-bottom: 20px;
        border: 1px solid #ebeef5;
        border-radius: 6px;
        padding: 16px;
        background-color: #fafafa;
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          
          .entity-name-input {
            flex: 1;
            margin-right: 16px;
          }
        }
        
        .attribute-table {
          margin-bottom: 16px;
        }
      }
      
      .add-button, .add-entity-button {
        margin-top: 16px;
      }
    }
    
    .json-editor {
      .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        .label {
          font-weight: 600;
          color: #303133;
          font-size: 14px;
        }
      }
      
      .json-textarea {
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }
    }
  }
  
  .content-editor,
  .json-editor {
    width: 100%; // 确保编辑器占满可用宽度
    
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .label {
        font-weight: 600;
        color: #303133;
        font-size: 14px;
      }
      
      .editor-tools {
        display: flex;
        gap: 12px;
      }
    }
  }
  
  .content-editor {
    .content-textarea {
      width: 100%; // 确保文本框占满可用宽度
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      
      .el-textarea__inner {
        min-height: 400px; // 增加最小高度
        min-width: 500px; // 减小最小宽度
        max-width: 1000px; // 设置最大宽度，避免过宽
        resize: both; // 允许双向拉伸
        overflow: auto; // 显示滚动条
      }
    }
  }
  
  .json-editor {
    .json-textarea {
      width: 100%; // 确保文本框占满可用宽度
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      
      .el-textarea__inner {
        min-height: 400px; // 增加最小高度
        min-width: 600px; // 减小最小宽度
        max-width: 1000px; // 设置最大宽度，避免过宽
        resize: both; // 允许双向拉伸
        overflow: auto; // 显示滚动条
      }
    }
  }
}

.preview-content {
  .preview-text {
    line-height: 1.6;
    color: #303133;
    
    strong {
      font-weight: 600;
    }
    
    em {
      font-style: italic;
    }
  }
}
</style>
