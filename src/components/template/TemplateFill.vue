<template>
  <el-dialog
    :model-value="visible"
    title="模板填充"
    width="800px"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <div class="template-fill" v-loading="loading">
      <div class="template-info">
        <h4>模板信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板ID">{{ templateData.template_id }}</el-descriptions-item>
          <el-descriptions-item label="模板描述">{{ templateData.context }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="original-text">
        <h4>原始文本</h4>
        <el-card shadow="never" class="text-card">
          <pre>{{ templateData.json_content?.raw_text || '暂无内容' }}</pre>
        </el-card>
      </div>
      
      <div class="variable-fill">
        <h4>变量填写</h4>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item
            v-for="variable in templateData.json_content?.variables || []"
            :key="variable.name"
            :label="variable.name"
            :prop="`values.${variable.name}`"
          >
            <el-input
              v-model="form.values[variable.name]"
              :placeholder="`请输入${variable.desc}`"
              :rows="3"
              type="textarea"
            />
            <div class="variable-desc">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ variable.desc }}</span>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="preview-result" v-if="filledText">
        <h4>填充结果预览</h4>
        <el-card shadow="never" class="result-card">
          <pre>{{ filledText }}</pre>
        </el-card>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          提交并进入ER生成
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { fillTemplate } from '../../api/template'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  templateData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const loading = ref(false)
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  values: {}
})

// 表单验证规则
const rules = computed(() => {
  const rules = {}
  if (props.templateData?.json_content?.variables) {
    props.templateData.json_content.variables.forEach(variable => {
      rules[`values.${variable.name}`] = [
        { required: true, message: `请输入${variable.desc}`, trigger: 'blur' }
      ]
    })
  }
  return rules
})

// 填充后的文本
const filledText = computed(() => {
  if (!props.templateData?.json_content?.raw_text || !form.values) {
    return ''
  }
  
  let result = props.templateData.json_content.raw_text
  Object.keys(form.values).forEach(key => {
    const value = form.values[key]
    if (value) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }
  })
  
  return result
})

// 监听visible变化，初始化表单
watch(() => props.visible, (newVal) => {
  if (newVal && props.templateData) {
    initForm()
  }
})

// 初始化表单
const initForm = () => {
  // 清空表单
  Object.keys(form.values).forEach(key => {
    delete form.values[key]
  })
  
  // 初始化变量值
  if (props.templateData?.json_content?.variables) {
    props.templateData.json_content.variables.forEach(variable => {
      form.values[variable.name] = ''
    })
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const submitData = {
      values: form.values
    }
    
    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // const response = await fillTemplate(props.templateData.template_id, submitData)
    
    // 测试阶段：模拟响应
    const response = {
      code: 200,
      msg: '提交成功，已进入 ER 生成模块',
      data: {
        next_module: 'ER生成',
        template_id: props.templateData.template_id,
        filled_text: filledText.value
      }
    }
    
    if (response.code === 200) {
      ElMessage.success(response.msg)
      emit('success', response.data)
      handleClose()
    }
  } catch (error) {
    console.error('Submit template fill error:', error)
    if (error !== 'cancel') {
      ElMessage.error('提交失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.template-fill {
  .template-info,
  .original-text,
  .variable-fill,
  .preview-result {
    margin-bottom: 24px;
    
    h4 {
      margin: 0 0 12px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .text-card,
  .result-card {
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
  
  .variable-desc {
    display: flex;
    align-items: center;
    margin-top: 5px;
    color: #909399;
    font-size: 12px;
    
    .el-icon {
      margin-right: 5px;
      color: #409eff;
    }
  }
  
  .preview-result {
    .result-card {
      background: #f0f9ff;
      border: 1px solid #b3d8ff;
      
      pre {
        color: #2c3e50;
        font-weight: 500;
      }
    }
  }
}
</style>
