<template>
  <div class="requirement-editor">
    <el-card class="editor-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h4>需求编辑</h4>
        </div>
      </template>

      <div class="editor-content">
        <!-- 变量编辑表单 -->
        <div class="variables-form">
          <h5>变量编辑</h5>
          <el-form
            ref="formRef"
            :model="form"
            label-width="120px"
            class="variables-form-content"
          >
            <el-form-item
              v-for="(variable, index) in form.variables"
              :key="index"
              :label="variable.name"
              :prop="`variables.${index}.value`"
              :rules="[
                { required: true, message: `请输入${variable.name}的值`, trigger: 'blur' }
              ]"
            >
              <div class="variable-item">
                <el-input
                  v-model="variable.value"
                  :placeholder="`请输入${variable.name}的值`"
                  @input="handleVariableChange"
                  @change="handleVariableChange"
                />
                <div class="variable-info">
                  <el-tag size="small" type="info">{{ variable.desc }}</el-tag>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 实时预览 -->
        <div class="preview-section">
          <h5>实时预览</h5>
          <el-card shadow="never" class="preview-card">
            <pre>{{ previewText }}</pre>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  requirement: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:requirement'])

// 表单引用
const formRef = ref()

// 表单数据
const form = ref({
  variables: []
})

// 初始化表单
const initForm = () => {
  console.log('初始化表单:', props.requirement?.json_text?.variables)
  if (props.requirement?.json_text?.variables) {
    form.value.variables = props.requirement.json_text.variables.map(v => ({
      ...v
    }))
  }
}

// 监听需求变化，初始化表单
watch(() => props.requirement, (newRequirement) => {
  console.log('RequirementEditor: requirement changed', newRequirement)
  if (newRequirement) {
    initForm()
  }
}, { immediate: true, deep: true })

// 监听表单变量变化，更新预览
watch(() => form.value.variables, (newVariables) => {
  console.log('RequirementEditor: variables changed', newVariables)
}, { deep: true })

// 变量值变化处理
const handleVariableChange = () => {
  console.log('变量值变化:', form.value.variables)
  // 更新父组件的需求数据
  const updatedRequirement = {
    ...props.requirement,
    json_text: {
      ...props.requirement.json_text,
      variables: form.value.variables
    }
  }
  emit('update:requirement', updatedRequirement)
}



// 计算预览文本
const previewText = computed(() => {
  if (!props.requirement?.json_text?.raw_text) {
    return '暂无内容'
  }

  let text = props.requirement.json_text.raw_text
  const variables = form.value.variables || []

  variables.forEach(variable => {
    const placeholder = `{${variable.name}}`
    const value = variable.value || variable.name
    text = text.replace(new RegExp(placeholder, 'g'), value)
  })

  return text
})
</script>

<style scoped lang="scss">
.requirement-editor {
  .editor-card {
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
    }
  }
  
  .editor-content {
    display: flex;
    gap: 20px;
    height: 100%;
    
    .variables-form {
      flex: 1;
      
      h5 {
        margin: 0 0 16px 0;
        color: #303133;
        font-size: 14px;
        font-weight: 600;
      }
      
      .variables-form-content {
        .variable-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
          
          .variable-info {
            display: flex;
            justify-content: flex-start;
          }
        }
      }
    }
    
    .preview-section {
      flex: 1;
      
      h5 {
        margin: 0 0 16px 0;
        color: #303133;
        font-size: 14px;
        font-weight: 600;
      }
      
      .preview-card {
        height: calc(100% - 40px);
        overflow-y: auto;
        
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
          color: #2c3e50;
        }
      }
    }
  }
}
</style>
