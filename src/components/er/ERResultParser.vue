<template>
  <div class="er-result-parser">
    <el-card class="parser-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h4>ER模型解析结果</h4>
          <div class="header-actions">
            <el-button @click="handlePreview" size="small">
              <el-icon><View /></el-icon>
              预览
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
              <h5>原始数据（可编辑）</h5>
              <el-card shadow="never" class="json-card">
                <el-input
                  v-model="editableJson"
                  type="textarea"
                  :rows="70"
                  placeholder="原始JSON数据..."
                  class="json-editor"
                  @input="handleJsonChange"
                />
                <div class="json-actions">
                  <el-button size="small" @click="syncToTables" type="success">
                    同步到表格
                  </el-button>
                </div>
              </el-card>
            </div>
          </el-col>

          <!-- 右侧：数据库设计表格 -->
          <el-col :span="12" class="tables-column">
            <div class="result-section">
              <h5>数据库设计表格（可编辑）</h5>
              <el-card shadow="never" class="result-card">
                <!-- 实体表格 -->
                <div v-if="editableEntities.length > 0" class="entities-section">
                  <h6>实体表设计</h6>
                  <div v-for="(entity, entityIndex) in editableEntities" :key="entityIndex" class="entity-table">
                    <div class="table-header">
                      <el-input
                        v-model="entity.name"
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
                    
                    <!-- 属性表格 -->
                    <el-table :data="entity.attributes" border stripe class="attribute-table">
                      <el-table-column label="字段英文名" min-width="200" align="left">
                        <template #default="{ row, $index }">
                          <el-input
                            v-model="row['字段英文名']"
                            placeholder="字段英文名"
                            size="small"
                            @input="handleAttributeChange"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column label="字段中文名" min-width="200" align="left">
                        <template #default="{ row }">
                          <el-input
                            v-model="row['字段中文名']"
                            placeholder="字段中文名"
                            size="small"
                            @input="handleAttributeChange"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="100" align="center">
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
                    <div class="add-attribute">
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
                  <div class="add-entity">
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
                    <el-table-column label="关系名称" min-width="180" align="left">
                      <template #default="{ row }">
                        <el-input
                          v-model="row.name"
                          placeholder="关系名称"
                          size="small"
                          @input="handleRelationshipChange"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="源实体" min-width="150" align="left">
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
                    <el-table-column label="目标实体" min-width="150" align="left">
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
                    <el-table-column label="关系类型" min-width="150" align="center">
                      <template #default="{ row }">
                        <el-select
                          v-model="row.type"
                          placeholder="关系类型"
                          size="small"
                          @change="handleRelationshipChange"
                        >
                          <el-option label="一对一" value="1:1" />
                          <el-option label="一对多" value="1:N" />
                          <el-option label="多对一" value="N:1" />
                          <el-option label="多对多" value="M:N" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100" align="center">
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
                  <div class="add-relationship">
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
                
                <!-- 设计说明 -->
                <div class="design-description">
                  <h6>设计说明</h6>
                  <el-input
                    v-model="editableDescription"
                    type="textarea"
                    :rows="25"
                    placeholder="请输入数据库设计说明..."
                    class="description-editor"
                  />
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 保存按钮 -->
      <div class="save-section">
        <el-button type="primary" @click="handleSaveToRepository" :loading="saveLoading">
          <el-icon><FolderAdd /></el-icon>
          保存到ER模型仓库
        </el-button>
      </div>
    </el-card>
    
    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="数据库设计预览"
      width="1000px"
    >
      <div class="preview-content">
        <!-- 实体表格预览 -->
        <div v-if="editableEntities.length > 0" class="preview-entities">
          <h4>实体表设计</h4>
          <div v-for="(entity, index) in editableEntities" :key="index" class="preview-entity">
            <h5>{{ entity.name }}</h5>
            <p>{{ entity.description }}</p>
            <el-table :data="entity.attributes" border size="small" class="preview-table">
              <el-table-column prop="name" label="字段名" width="120" />
              <el-table-column prop="type" label="数据类型" width="100" />
              <el-table-column prop="description" label="字段说明" />
              <el-table-column prop="constraints" label="约束" width="80" />
            </el-table>
          </div>
        </div>
        
        <!-- 关系表格预览 -->
        <div v-if="editableRelationships.length > 0" class="preview-relationships">
          <h4>关系表设计</h4>
          <el-table :data="editableRelationships" border size="small" class="preview-table">
            <el-table-column prop="name" label="关系名称" width="120" />
            <el-table-column prop="from" label="源实体" width="100" />
            <el-table-column prop="to" label="目标实体" width="100" />
            <el-table-column prop="type" label="关系类型" width="100" />
            <el-table-column prop="description" label="关系说明" />
          </el-table>
        </div>
        
        <!-- 设计说明预览 -->
        <div v-if="editableDescription" class="preview-description">
          <h4>设计说明</h4>
          <div class="description-text" v-html="formattedPreview"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { View, FolderAdd, Delete, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  erData: {
    type: Object,
    required: true
  },
  requirement: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save-to-repository'])

// 可编辑的描述内容
const editableDescription = ref('')

// 可编辑的JSON内容
const editableJson = ref('')

// 可编辑的实体数据
const editableEntities = ref([])

// 可编辑的关系数据
const editableRelationships = ref([])

// 预览对话框
const previewVisible = ref(false)

// 保存加载状态
const saveLoading = ref(false)

// 初始化数据
const initializeData = (data) => {
  if (!data) return
  
  // 初始化实体数据 - 支持简化格式和复杂格式
  editableEntities.value = (data.entities || []).map(entity => ({
    name: entity.name || '',
    attributes: (entity.attribute || []).map(attr => {
      // 检查是否为简化格式（只有字段英文名和字段中文名）
      if (attr['字段英文名'] && attr['字段中文名']) {
        return {
          "字段英文名": attr['字段英文名'] || '',
          "字段中文名": attr['字段中文名'] || ''
        }
      } else {
        // 兼容复杂格式，转换为简化格式
        return {
          "字段英文名": attr.name || '',
          "字段中文名": attr.description || attr.name || ''
        }
      }
    })
  }))
  
  // 初始化关系数据
  editableRelationships.value = (data.relationship || []).map(rel => ({
    name: rel.name || '',
    from: rel.from || '',
    to: rel.to || '',
    type: rel.type || '1:N',
    attributes: rel.attributes || [],
    constraints: rel.constraints || null
  }))
  
  // 生成描述
  const summary = generateSummary(editableEntities.value, editableRelationships.value)
  editableDescription.value = formatDescription(editableEntities.value, editableRelationships.value, summary)
  
  // 更新JSON
  updateJsonFromTables()
}

// 从表格数据更新JSON
const updateJsonFromTables = () => {
  const jsonData = {
    ...props.erData,
    entities: editableEntities.value.map(entity => ({
      name: entity.name,
      attribute: entity.attributes.map(attr => ({
        "字段英文名": attr['字段英文名'] || '',
        "字段中文名": attr['字段中文名'] || ''
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
  
  editableJson.value = JSON.stringify(jsonData, null, 2)
}

// 从JSON更新表格数据
const updateTablesFromJson = () => {
  try {
    const jsonData = JSON.parse(editableJson.value)
    initializeData(jsonData)
  } catch (error) {
    console.error('JSON解析错误:', error)
    ElMessage.error('JSON格式错误，请检查后重试')
  }
}

// JSON变化处理
const handleJsonChange = () => {
  // 可以添加防抖处理
}

// 实体变化处理
const handleEntityChange = () => {
  updateJsonFromTables()
  updateDescription()
}

// 属性变化处理
const handleAttributeChange = () => {
  updateJsonFromTables()
  updateDescription()
}

// 关系变化处理
const handleRelationshipChange = () => {
  updateJsonFromTables()
  updateDescription()
}

// 更新描述
const updateDescription = () => {
  const summary = generateSummary(editableEntities.value, editableRelationships.value)
  editableDescription.value = formatDescription(editableEntities.value, editableRelationships.value, summary)
}

// 添加实体
const addEntity = () => {
  editableEntities.value.push({
    name: `新实体${editableEntities.value.length + 1}`,
    attributes: []
  })
  handleEntityChange()
}

// 删除实体
const removeEntity = (index) => {
  editableEntities.value.splice(index, 1)
  handleEntityChange()
}

// 添加属性
const addAttribute = (entityIndex) => {
  editableEntities.value[entityIndex].attributes.push({
    "字段英文名": `field_${editableEntities.value[entityIndex].attributes.length + 1}`,
    "字段中文名": `新字段${editableEntities.value[entityIndex].attributes.length + 1}`
  })
  handleAttributeChange()
}

// 删除属性
const removeAttribute = (entityIndex, attributeIndex) => {
  editableEntities.value[entityIndex].attributes.splice(attributeIndex, 1)
  handleAttributeChange()
}

// 添加关系
const addRelationship = () => {
  editableRelationships.value.push({
    name: `新关系${editableRelationships.value.length + 1}`,
    from: '',
    to: '',
    type: 'one-to-many',
    attributes: [],
    constraints: null
  })
  handleRelationshipChange()
}

// 删除关系
const removeRelationship = (index) => {
  editableRelationships.value.splice(index, 1)
  handleRelationshipChange()
}



// 同步到表格
const syncToTables = () => {
  updateTablesFromJson()
  ElMessage.success('已同步到表格')
}

// 获取类型描述
const getTypeDescription = (type) => {
  if (!type) return '未设置'
  
  const typeMap = {
    'PK': '主键',
    'FK': '外键',
    'string': '字符串类型',
    'int': '整数类型',
    'decimal': '小数类型',
    'datetime': '日期时间类型',
    'boolean': '布尔类型',
    'text': '文本类型',
    'varchar': '可变长度字符串',
    'char': '固定长度字符串',
    'enum': '枚举类型',
    'json': 'JSON类型',
    'timestamp': '时间戳类型',
    'date': '日期类型',
    'time': '时间类型',
    'blob': '二进制类型',
    'longtext': '长文本类型',
    'mediumtext': '中等文本类型',
    'tinyint': '小整数类型',
    'bigint': '大整数类型',
    'float': '浮点数类型',
    'double': '双精度浮点数类型',
    'uuid': 'UUID类型',
    'money': '货币类型',
    'serial': '自增序列',
    'bigserial': '大自增序列',
    'array': '数组类型',
    'xml': 'XML类型',
    'bytea': '二进制数据',
    'interval': '时间间隔',
    'point': '几何点',
    'line': '几何线',
    'polygon': '几何多边形',
    'circle': '几何圆',
    'box': '几何矩形'
  }  

  // 处理带参数的类型，如 varchar(100)、decimal(10,2)
  if (type.includes('(')) {
    const baseType = type.split('(')[0]
    const params = type.match(/\(([^)]+)\)/)?.[1] || ''
    const baseDesc = typeMap[baseType] || baseType
    return `${baseDesc}（${params}）`
  }

  // 处理枚举类型，如 enum('active','inactive')
  if (type.toLowerCase().startsWith('enum')) {
    return '枚举类型'
  }

  // 处理自定义类型
  return typeMap[type] || type
}

// 获取关系类型描述
const getRelationshipTypeDescription = (type) => {
  const typeMap = {
    'one-to-one': '一对一',
    'one-to-many': '一对多',
    'many-to-one': '多对一',
    'many-to-many': '多对多'
  }
  return typeMap[type] || type
}

// 解析字段约束信息
const parseFieldConstraints = (attr) => {
  const constraints = []
  
  // 主键约束
  if (attr.type === 'PK' || attr.constraints?.includes('PRIMARY KEY')) {
    constraints.push('主键')
  }
  
  // 外键约束
  if (attr.type === 'FK' || attr.constraints?.includes('FOREIGN KEY')) {
    constraints.push('外键')
  }
  
  // 非空约束
  if (attr.notNull || attr.constraints?.includes('NOT NULL')) {
    constraints.push('非空')
  }
  
  // 唯一约束
  if (attr.unique || attr.constraints?.includes('UNIQUE')) {
    constraints.push('唯一')
  }
  
  // 默认值
  if (attr.defaultValue) {
    constraints.push(`默认: ${attr.defaultValue}`)
  }
  
  // 检查约束
  if (attr.check) {
    constraints.push(`检查: ${attr.check}`)
  }
  
  return constraints.join(', ')
}

// 增强的实体描述生成
const generateEntityDescription = (entity) => {
  const attributes = entity.attributes || []
  
  if (attributes.length === 0) {
    return `${entity.name}表暂无字段定义`
  }
  
  // 生成字段描述 - 支持简化格式
  const attributeDescriptions = attributes.map(attr => {
    // 检查是否为简化格式
    if (attr['字段英文名'] && attr['字段中文名']) {
      return `${attr['字段英文名']}(${attr['字段中文名']})`
    } else {
      // 兼容复杂格式
      const typeDesc = getTypeDescription(attr.type)
      const constraints = parseFieldConstraints(attr)
      const constraintText = constraints ? ` [${constraints}]` : ''
      return `${attr.name}（${typeDesc}${constraintText}）`
    }
  })

  return `${entity.name}表包含${attributes.length}个字段：${attributeDescriptions.join('、')}`
}

// 增强的关系描述生成
const generateRelationshipDescription = (rel) => {
  const typeDesc = getRelationshipTypeDescription(rel.type)
  
  // 处理复杂关系属性
  const relationshipDetails = []
  
  if (rel.from === rel.to) {
    // 自关联关系
    relationshipDetails.push(`${rel.from}表存在自关联关系`)
  } else {
    // 普通关系
    relationshipDetails.push(`${rel.from}与${rel.to}之间的关联`)
  }
  
  relationshipDetails.push(`关系类型为${typeDesc}`)
  
  // 添加关系属性
  if (rel.attributes) {
    const attrList = rel.attributes.map(attr => `${attr.name}(${attr.type})`).join('、')
    relationshipDetails.push(`包含字段：${attrList}`)
  }
  
  if (rel.constraints) {
    relationshipDetails.push(`约束：${rel.constraints}`)
  }
  
  return `${rel.name}：${relationshipDetails.join('，')}`
}

// 增强的总结生成
const generateSummary = (entities, relationships) => {
  const entityCount = entities.length
  const relationshipCount = relationships.length
  
  // 统计字段总数
  const totalFields = entities.reduce((sum, entity) => sum + (entity.attributes?.length || 0), 0)
  
  // 统计关系类型
  const relationshipTypes = {}
  relationships.forEach(rel => {
    relationshipTypes[rel.type] = (relationshipTypes[rel.type] || 0) + 1
  })
  
  let summary = `根据需求分析，系统包含${entityCount}个实体表和${relationshipCount}个关系，共计${totalFields}个字段。`
  
  if (entityCount > 0) {
    const entityNames = entities.map(e => e.name).join('、')
    summary += `主要实体包括：${entityNames}。`
  }
  
  if (relationshipCount > 0) {
    const relTypeSummary = Object.entries(relationshipTypes)
      .map(([type, count]) => `${getRelationshipTypeDescription(type)}：${count}个`)
      .join('、')
    summary += `关系分布：${relTypeSummary}。`
  }
  
  return summary
}

// 格式化描述为纯文本
const formatDescription = (entities, relationships, summary) => {
  let text = ''
  
  // 总结
  text += `📋 设计总结\n`
  text += `${summary}\n\n`
  
  // 实体描述
  if (entities.length > 0) {
    text += `🏗️ 实体表设计\n`
    
    entities.forEach((entity, index) => {
      text += `${index + 1}. ${entity.name}表：\n`
      text += `${generateEntityDescription(entity)}\n\n`
    })
  }
  
  // 关系描述
  if (relationships.length > 0) {
    text += `🔗 关系设计\n`
    
    relationships.forEach((rel, index) => {
      text += `${index + 1}. ${generateRelationshipDescription(rel)}\n\n`
    })
  }
  
  return text.trim()
}

// 监听erData变化，初始化数据
watch(() => props.erData, (newData) => {
  if (newData) {
    initializeData(newData)
  }
}, { immediate: true })

// 格式化预览内容
const formattedPreview = computed(() => {
  if (!editableDescription.value) return '暂无内容'
  
  // 简单的格式化处理
  let formatted = editableDescription.value
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  return formatted
})

// 预览
const handlePreview = () => {
  if (!editableDescription.value.trim()) {
    ElMessage.warning('请先输入内容')
    return
  }
  previewVisible.value = true
}

// 保存到ER模型仓库
const handleSaveToRepository = async () => {
  if (!editableDescription.value.trim()) {
    ElMessage.warning('请先输入描述内容')
    return
  }
  
  if (!editableJson.value.trim()) {
    ElMessage.warning('请先输入JSON数据')
    return
  }
  
  // 验证JSON格式
  let parsedJson
  try {
    parsedJson = JSON.parse(editableJson.value)
  } catch (error) {
    ElMessage.error('JSON格式错误，请检查后重试')
    return
  }
  
  try {
    saveLoading.value = true
    
    // 将复杂的JSON数据转换为后端期望的简化格式
    const simplifiedEntities = parsedJson.entities?.map(entity => ({
      name: entity.name,
      attribute: entity.attributes?.map(attr => ({
        "字段英文名": attr.name,
        "字段中文名": attr.description || attr.name
      })) || []
    })) || []
    
    const simplifiedRelationships = parsedJson.relationships?.map(rel => ({
      name: rel.name,
      from: rel.sourceEntity,
      to: rel.targetEntity,
      type: rel.type
    })) || []
    
    const erModelData = {
      erId: props.erData?.erId || null,
      erName: props.requirement ? `${props.requirement.requirement_name} - ER模型` : 'ER模型',
      userID: '1000000', // TODO: 从用户状态获取
      description: editableDescription.value,
      erJson: {
        entities: simplifiedEntities,
        relationship: simplifiedRelationships
      }
    }
    
    emit('save-to-repository', erModelData)
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}


</script>

<style scoped lang="scss">
.er-result-parser {
  .parser-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h4 {
        margin: 0;
        color: #303133;
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
    .content-row {
      min-height: 600px;
      
      .json-column, .tables-column {
        height: 100%;
      }
    }
    
    .json-section, .result-section {
      height: 100%;
      
      h5 {
        margin: 0 0 12px 0;
        color: #303133;
        font-size: 14px;
        font-weight: 600;
      }
    }
    
    .json-card, .result-card {
      height: calc(100% - 40px);
      
      .json-editor {
        height: calc(100% - 50px);
        
        :deep(.el-textarea__inner) {
          height: 100% !important;
          resize: none;
        }
      }
      
      .json-actions {
        margin-top: 12px;
        display: flex;
        gap: 8px;
      }
    }
    
    .entities-section, .relationships-section {
      margin-bottom: 24px;
      
      h6 {
        margin: 0 0 12px 0;
        color: #606266;
        font-size: 13px;
        font-weight: 600;
      }
    }
    
    .entity-table {
      margin-bottom: 16px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      padding: 12px;
      
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .entity-name-input {
          flex: 1;
          margin-right: 12px;
        }
      }
      
      .attribute-table {
        margin-bottom: 12px;
      }
      
      .add-attribute {
        text-align: center;
        padding: 8px 0;
      }
    }
    
    .add-entity {
      text-align: center;
      padding: 16px 0;
      border: 2px dashed #dcdfe6;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    
    .relationship-table {
      margin-bottom: 12px;
    }
    
    .add-relationship {
      text-align: center;
      padding: 8px 0;
    }
    
    .design-description {
      h6 {
        margin: 0 0 12px 0;
        color: #606266;
        font-size: 13px;
        font-weight: 600;
      }
    }
  }
  
  .parser-content {
    .content-row {
      min-height: 600px;
      
      .json-column, .tables-column {
        height: 100%;
      }
    }
    
    .json-section, .result-section {
      height: 100%;
      
      h5 {
        margin: 0 0 12px 0;
        color: #303133;
        font-size: 14px;
        font-weight: 600;
      }
    }
    
    .json-card, .result-card {
      height: calc(100% - 40px);
      
      .json-editor {
        height: calc(100% - 50px);
        
        :deep(.el-textarea__inner) {
          height: 100% !important;
          resize: none;
        }
      }
      
      .json-actions {
        margin-top: 12px;
        display: flex;
        gap: 8px;
      }
    }
    
    .entities-section, .relationships-section {
      margin-bottom: 24px;
      
      h6 {
        margin: 0 0 12px 0;
        color: #606266;
        font-size: 13px;
        font-weight: 600;
      }
    }
    
    .entity-table {
      margin-bottom: 16px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      padding: 12px;
      
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .entity-name-input {
          flex: 1;
          margin-right: 12px;
        }
      }
      
      .attribute-table {
        margin-bottom: 12px;
      }
      
      .add-attribute {
        text-align: center;
        padding: 8px 0;
      }
    }
    
    .add-entity {
      text-align: center;
      padding: 16px 0;
      border: 2px dashed #dcdfe6;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    
    .relationship-table {
      margin-bottom: 12px;
    }
    
    .add-relationship {
      text-align: center;
      padding: 8px 0;
    }
    
    .design-description {
      h6 {
        margin: 0 0 12px 0;
        color: #606266;
        font-size: 13px;
        font-weight: 600;
      }
    }
  }
  
  .save-section {
    margin-top: 20px;
    text-align: center;
    padding: 16px 0;
    border-top: 1px solid #ebeef5;
  }
}

// 预览对话框样式
.preview-content {
  .preview-entities, .preview-relationships, .preview-description {
    margin-bottom: 24px;
    
    h4 {
      margin: 0 0 12px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .preview-entity {
    margin-bottom: 16px;
    
    h5 {
      margin: 0 0 8px 0;
      color: #606266;
      font-size: 14px;
      font-weight: 600;
    }
    
    p {
      margin: 0 0 8px 0;
      color: #909399;
      font-size: 12px;
    }
  }
  
  .preview-table {
    margin-bottom: 12px;
  }
  
  .description-text {
    line-height: 1.6;
    color: #606266;
  }
}

// 全局表格对齐样式 - 占满容器
:deep(.attribute-table) {
  width: 100% !important;
  
  .el-table {
    width: 100% !important;
    table-layout: fixed !important;
  }
  
  .el-table__cell {
    padding: 8px 12px !important;
    text-align: left !important;
    vertical-align: middle !important;
    box-sizing: border-box !important;
  }
  
  .el-table__header {
    width: 100% !important;
    
    .el-table__cell {
      padding: 8px 12px !important;
      text-align: left !important;
      vertical-align: middle !important;
      font-weight: 600 !important;
      box-sizing: border-box !important;
    }
  }
  
  .el-table__body {
    width: 100% !important;
    
    .el-table__cell {
      padding: 8px 12px !important;
      text-align: left !important;
      vertical-align: middle !important;
      box-sizing: border-box !important;
    }
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
  
  .el-table__cell {
    padding: 8px 12px !important;
    text-align: left !important;
    vertical-align: middle !important;
    box-sizing: border-box !important;
  }
  
  .el-table__header {
    width: 100% !important;
    
    .el-table__cell {
      padding: 8px 12px !important;
      text-align: left !important;
      vertical-align: middle !important;
      font-weight: 600 !important;
      box-sizing: border-box !important;
    }
  }
  
  .el-table__body {
    width: 100% !important;
    
    .el-table__cell {
      padding: 8px 12px !important;
      text-align: left !important;
      vertical-align: middle !important;
      box-sizing: border-box !important;
    }
  }
  
  .el-table__header-wrapper,
  .el-table__body-wrapper {
    width: 100% !important;
  }
}
</style>
