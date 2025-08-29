<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="800px"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="模板描述" prop="context">
        <el-input
          v-model="form.context"
          placeholder="请输入模板描述"
          :rows="3"
          type="textarea"
        />
      </el-form-item>
      
      <el-form-item label="原始文本" prop="json_content.raw_text">
        <el-input
          v-model="form.json_content.raw_text"
          placeholder="请输入原始文本，使用 {变量名} 格式定义变量"
          :rows="4"
          type="textarea"
        />
        <div class="form-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>使用 {变量名} 格式定义变量，例如：请设计一张 {表名} 表，包含字段 {字段集合}。</span>
        </div>
      </el-form-item>
      
      <el-form-item label="变量定义" prop="json_content.variables">
        <div class="variables-container">
          <div
            v-for="(variable, index) in form.json_content.variables"
            :key="index"
            class="variable-item"
          >
            <el-row :gutter="10">
              <el-col :span="8">
                <el-input
                  v-model="variable.name"
                  placeholder="变量名"
                  @input="validateVariables"
                />
              </el-col>
              <el-col :span="12">
                <el-input
                  v-model="variable.desc"
                  placeholder="变量描述"
                />
              </el-col>
              <el-col :span="4">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeVariable(index)"
                  :icon="Delete"
                >
                  删除
                </el-button>
              </el-col>
            </el-row>
          </div>
          
          <el-button
            type="primary"
            @click="addVariable"
            :icon="Plus"
            style="margin-top: 10px;"
          >
            添加变量
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    
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
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, InfoFilled } from '@element-plus/icons-vue'
import { createTemplate, updateTemplate } from '../../api/template'

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

const formRef = ref()
const submitLoading = ref(false)

// 表单数据
const form = reactive({
  context: '',
  json_content: {
    raw_text: '',
    variables: []
  }
})

// 表单验证规则
const rules = {
  context: [
    { required: true, message: '请输入模板描述', trigger: 'blur' }
  ],
  'json_content.raw_text': [
    { required: true, message: '请输入原始文本', trigger: 'blur' }
  ],
  'json_content.variables': [
    { 
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少添加一个变量'))
          return
        }
        
        for (let i = 0; i < value.length; i++) {
          const variable = value[i]
          if (!variable.name || !variable.name.trim()) {
            callback(new Error(`第${i + 1}个变量名不能为空`))
            return
          }
          if (!variable.desc || !variable.desc.trim()) {
            callback(new Error(`第${i + 1}个变量描述不能为空`))
            return
          }
        }
        
        // 检查变量名是否重复
        const names = value.map(v => v.name.trim())
        const uniqueNames = [...new Set(names)]
        if (names.length !== uniqueNames.length) {
          callback(new Error('变量名不能重复'))
          return
        }
        
        callback()
      },
      trigger: 'blur'
    }
  ]
}

// 对话框标题
const dialogTitle = computed(() => {
  return props.templateData ? '编辑模板' : '新增模板'
})

// 监听visible变化，初始化表单
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initForm()
  }
})

// 初始化表单
const initForm = () => {
  if (props.templateData) {
    // 编辑模式
    Object.assign(form, {
      context: props.templateData.context || '',
      json_content: {
        raw_text: props.templateData.json_content?.raw_text || '',
        variables: [...(props.templateData.json_content?.variables || [])]
      }
    })
  } else {
    // 新增模式
    Object.assign(form, {
      context: '',
      json_content: {
        raw_text: '',
        variables: []
      }
    })
  }
}

// 添加变量
const addVariable = () => {
  form.json_content.variables.push({
    name: '',
    desc: ''
  })
}

// 删除变量
const removeVariable = (index) => {
  form.json_content.variables.splice(index, 1)
}

// 验证变量
const validateVariables = () => {
  // 自动验证变量名是否与原始文本中的变量匹配
  const rawText = form.json_content.raw_text
  const variables = form.json_content.variables
  
  if (rawText && variables.length > 0) {
    const textVariables = rawText.match(/\{([^}]+)\}/g) || []
    const textVarNames = textVariables.map(v => v.slice(1, -1))
    
    // 检查是否所有文本中的变量都在变量列表中定义
    const definedVarNames = variables.map(v => v.name.trim()).filter(name => name)
    const missingVars = textVarNames.filter(name => !definedVarNames.includes(name))
    
    if (missingVars.length > 0) {
      console.warn('原始文本中的变量未在变量列表中定义:', missingVars)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const submitData = {
      context: form.context,
      json_content: {
        raw_text: form.json_content.raw_text,
        variables: form.json_content.variables
      }
    }
    
    let response
    if (props.templateData) {
      // 编辑模式
      // TODO: 前后端联测时，取消注释以下真实API调用代码
      // response = await updateTemplate(props.templateData.template_id, submitData)
      
      // 测试阶段：模拟响应
      response = { code: 200, msg: '修改成功' }
    } else {
      // 新增模式
      submitData.release_user = 'admin'
      // TODO: 前后端联测时，取消注释以下真实API调用代码
      // response = await createTemplate(submitData)
      
      // 测试阶段：模拟响应
      response = { code: 200, msg: '新增成功', data: { template_id: Date.now() } }
    }
    
    if (response.code === 200) {
      ElMessage.success(response.msg)
      emit('success')
      handleClose()
    }
  } catch (error) {
    console.error('Submit template form error:', error)
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
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
.variables-container {
  .variable-item {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background: #fafafa;
  }
}

.form-tip {
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
</style>
