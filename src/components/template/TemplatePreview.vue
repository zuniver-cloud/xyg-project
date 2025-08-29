<template>
  <el-dialog
    :model-value="visible"
    title="模板预览"
    width="700px"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <div class="template-preview" v-loading="loading">
      <div class="preview-section">
        <h4>模板信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板ID">{{ templateData.template_id }}</el-descriptions-item>
          <el-descriptions-item label="发布用户">{{ templateData.release_user }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ templateData.created_at }}</el-descriptions-item>
          <el-descriptions-item label="模板描述" :span="2">{{ templateData.context }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="preview-section">
        <h4>原始文本</h4>
        <el-card shadow="never" class="text-card">
          <pre>{{ templateData.json_content?.raw_text || '暂无内容' }}</pre>
        </el-card>
      </div>
      
      <div class="preview-section">
        <h4>变量定义</h4>
        <el-table
          :data="templateData.json_content?.variables || []"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="name" label="变量名" width="150" />
          <el-table-column prop="desc" label="变量描述" />
        </el-table>
      </div>
      
      <div class="preview-section">
        <h4>使用示例</h4>
        <el-card shadow="never" class="example-card">
          <p>用户可以通过以下方式使用此模板：</p>
          <ol>
            <li>点击"填充"按钮</li>
            <li>为每个变量填写具体值</li>
            <li>系统将自动生成完整的文本内容</li>
            <li>生成的文本可用于后续的ER生成或其他模块</li>
          </ol>
        </el-card>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleFill">使用此模板</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getTemplate } from '../../api/template'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  templateId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:visible', 'fill'])

const loading = ref(false)
const templateData = ref({})

// 监听visible变化，获取模板详情
watch(() => props.visible, async (newVal) => {
  if (newVal && props.templateId) {
    await fetchTemplateDetail()
  }
})

// 获取模板详情
const fetchTemplateDetail = async () => {
  loading.value = true
  try {
    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // const response = await getTemplate(props.templateId)
    
    // 测试阶段：模拟响应
    const response = {
      code: 200,
      msg: '查询成功',
      data: {
        template_id: props.templateId,
        context: '该模板用于ER设计',
        json_content: {
          raw_text: '请设计一张 {表名} 表，包含字段 {字段集合}。',
          variables: [
            { name: '表名', desc: '数据库表的名称' },
            { name: '字段集合', desc: '字段及数据类型说明' }
          ]
        },
        release_user: 'admin',
        created_at: '2025-08-21 15:00:00'
      }
    }
    
    if (response.code === 200) {
      templateData.value = response.data
    } else {
      ElMessage.error(response.msg || '获取模板详情失败')
    }
  } catch (error) {
    console.error('Fetch template detail error:', error)
    ElMessage.error('获取模板详情失败')
  } finally {
    loading.value = false
  }
}

// 使用模板
const handleFill = () => {
  emit('fill', templateData.value)
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  templateData.value = {}
}
</script>

<style scoped lang="scss">
.template-preview {
  .preview-section {
    margin-bottom: 24px;
    
    h4 {
      margin: 0 0 12px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }
    
    .text-card {
      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
        margin: 0;
        color: #606266;
      }
    }
    
    .example-card {
      p {
        margin: 0 0 12px 0;
        color: #606266;
      }
      
      ol {
        margin: 0;
        padding-left: 20px;
        color: #606266;
        
        li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
