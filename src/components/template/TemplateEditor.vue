<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="900px"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <div class="template-editor">
      <!-- 模板描述 -->
      <div class="form-section">
        <h4>模板上下文描述</h4>
        <el-input
          v-model="form.context"
          placeholder="请输入模板上下文描述"
          :rows="2"
          type="textarea"
        />
      </div>

      <!-- 文本编辑器区域 -->
      <div class="form-section">
        <div class="editor-header">
          <h4>模板内容</h4>
          <div class="editor-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>选中文字后右键选择"设为变量"</span>
          </div>
        </div>
        
        <div class="text-editor-container">
          <div
            ref="editorRef"
            class="text-editor"
            contenteditable="true"
            @input="handleTextInput"
            @paste="handleTextInput"
            @cut="handleTextInput"
            @mouseup="handleMouseUp"
            @keydown="handleKeyDown"
            @contextmenu="handleContextMenu"
          ></div>
          
          <!-- 变量定义面板 -->
          <div class="variables-panel">
            <div class="panel-header">
              <h5>变量定义</h5>
              <el-button size="small" @click="clearVariables" :disabled="!form.variables.length">
                清空
              </el-button>
            </div>
            
            <div class="variables-list">
              <div
                v-for="(variable, index) in form.variables"
                :key="index"
                class="variable-item"
              >
                <div class="variable-header">
                  <span class="variable-name">{{ variable.name }}</span>
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeVariable(index)"
                    :icon="Delete"
                  >
                    删除
                  </el-button>
                </div>
                <el-input
                  v-model="variable.desc"
                  placeholder="变量描述"
                  size="small"
                />
                <div class="variable-preview" v-if="variable.value">
                  <span class="label">默认值：</span>
                  <span class="text">{{ variable.value }}</span>
                </div>
              </div>
              
              <div v-if="!form.variables.length" class="empty-tip">
                暂无变量，请选中文字后设为变量
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="form-section" v-if="form.variables.length">
        <h4>模板预览</h4>
        <div class="preview-container">
          <pre>{{ previewText }}</pre>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-show="contextMenuVisible"
      class="context-menu"
      :style="contextMenuStyle"
      @click.stop
    >
      <div class="menu-item" @click="setAsVariable">
        <el-icon><EditPen /></el-icon>
        设为变量
      </div>
    </div>

    <!-- 变量命名对话框 -->
    <el-dialog
      v-model="variableDialogVisible"
      title="设置变量"
      width="400px"
      append-to-body
    >
      <el-form :model="variableForm" label-width="80px">
        <el-form-item label="变量名">
          <el-input
            v-model="variableForm.name"
            placeholder="请输入变量名"
            @keyup.enter="confirmVariable"
          />
        </el-form-item>
        <el-form-item label="变量描述">
          <el-input
            v-model="variableForm.desc"
            placeholder="请输入变量描述"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="默认值">
          <el-input
            v-model="variableForm.value"
            placeholder="请输入默认值（可选）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="variableDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmVariable">确定</el-button>
        </span>
      </template>
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
import { EditPen, Delete, InfoFilled } from '@element-plus/icons-vue'
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

const editorRef = ref()
const submitLoading = ref(false)

// 表单数据
const form = reactive({
  context: '',
  variables: []
})

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuStyle = reactive({
  left: '0px',
  top: '0px'
})
const selectedText = ref('')
const selectionRange = ref(null)
// 选中的位置信息
const selectedPosition = ref({
  start: 0,
  end: 0,
  text: ''
})

// 变量对话框相关
const variableDialogVisible = ref(false)
const variableForm = reactive({
  name: '',
  desc: '',
  originalText: '',
  value: ''  // 新增value字段，默认为空
})

// 对话框标题
const dialogTitle = computed(() => {
  return props.templateData ? '编辑模板' : '新增模板'
})

// 预览文本
const previewText = computed(() => {
  // 直接返回编辑器中的文本，因为变量占位符已经在编辑器中正确设置了
  // 不需要再次替换，避免重复添加大括号
  return editorRef.value?.innerText || ''
})

// 监听visible变化，初始化编辑器
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await nextTick()
    initEditor()
  }
})

// 初始化编辑器
const initEditor = () => {
  if (props.templateData) {
    // 编辑模式
    form.context = props.templateData.context || ''
    
    // 直接使用原始文本，保持变量占位符
    const rawText = props.templateData.json_text?.raw_text || ''
    editorRef.value.innerHTML = rawText
    
    // 为现有变量添加位置信息
    form.variables = (props.templateData.json_text?.variables || []).map(variable => {
      const variablePlaceholder = `{${variable.name}}`
      const index = rawText.indexOf(variablePlaceholder)
      return {
        ...variable,
        originalText: variable.name, // 使用变量名作为原始文本
        position: {
          start: index,
          end: index + variablePlaceholder.length
        }
      }
    })
    
    console.log('初始化编辑器 - 编辑模式:', {
      rawText,
      variables: form.variables
    })
  } else {
    // 新增模式
    form.context = ''
    editorRef.value.innerHTML = ''
    form.variables = []
  }
}

// 处理文本输入
const handleTextInput = () => {
  // 检查文本是否被清空，如果是则清空变量
  const text = editorRef.value?.innerText || ''
  if (!text.trim()) {
    form.variables = []
    return
  }
  
  // 检查变量是否还存在于文本中，如果不存在则移除
  form.variables = form.variables.filter(variable => {
    // 检查变量占位符是否存在
    return text.includes(`{${variable.name}}`)
  })
}

// 处理鼠标抬起事件
const handleMouseUp = () => {
  const selection = window.getSelection()
  if (selection.toString().trim()) {
    const selectedTextContent = selection.toString().trim()
    selectedText.value = selectedTextContent
    selectionRange.value = selection.getRangeAt(0)
    
    // 计算选中文本在编辑器中的位置
    const range = selection.getRangeAt(0)
    
    // 创建一个临时范围来计算位置
    const tempRange = document.createRange()
    tempRange.setStart(editorRef.value, 0)
    tempRange.setEnd(range.startContainer, range.startOffset)
    
    const start = tempRange.toString().length
    const end = start + selectedTextContent.length
    
    selectedPosition.value = {
      start,
      end,
      text: selectedTextContent
    }
    
    console.log('选中位置:', selectedPosition.value)
    console.log('选中文本:', selectedTextContent)
    console.log('编辑器文本:', editorRef.value.innerText)
  }
}

// 处理键盘事件
const handleKeyDown = (e) => {
  // 可以在这里添加其他快捷键功能
}

// 处理右键菜单
const handleContextMenu = (e) => {
  e.preventDefault()
  if (selectedText.value) {
    contextMenuStyle.left = e.clientX + 'px'
    contextMenuStyle.top = e.clientY + 'px'
    contextMenuVisible.value = true
  }
}

// 点击其他地方隐藏右键菜单
const hideContextMenu = () => {
  contextMenuVisible.value = false
}

// 设为变量
const setAsVariable = () => {
  hideContextMenu()
  showVariableDialog()
}

// 显示变量对话框
const showVariableDialog = () => {
  variableForm.name = selectedText.value
  variableForm.desc = ''
  variableForm.originalText = selectedText.value
  variableDialogVisible.value = true
}

// 确认变量
const confirmVariable = () => {
  if (!variableForm.name.trim()) {
    ElMessage.error('请输入变量名')
    return
  }
  
  if (!variableForm.desc.trim()) {
    ElMessage.error('请输入变量描述')
    return
  }
  
  // 检查变量名是否重复
  const existingIndex = form.variables.findIndex(v => v.name === variableForm.name)
  if (existingIndex !== -1) {
    ElMessage.error('变量名已存在')
    return
  }
  
  // 检查是否选择了已经存在的变量位置
  const existingVariable = form.variables.find(v => 
    v.position && 
    v.position.start === selectedPosition.value.start && 
    v.position.end === selectedPosition.value.end
  )
  if (existingVariable) {
    ElMessage.error('该位置已经被设置为变量')
    return
  }
  
  // 检查是否选择了变量占位符
  const text = editorRef.value.innerText
  const selectedTextInPosition = text.substring(selectedPosition.value.start, selectedPosition.value.end)
  if (selectedTextInPosition.startsWith('{') && selectedTextInPosition.endsWith('}')) {
    ElMessage.error('不能选择已经存在的变量占位符')
    return
  }
  
  // 添加变量
  form.variables.push({
    name: variableForm.name,
    desc: variableForm.desc,
    originalText: variableForm.originalText,
    value: variableForm.value,  // 添加默认值
    position: {
      start: selectedPosition.value.start,
      end: selectedPosition.value.end
    }
  })
  
  // 使用位置信息进行精确替换
  if (editorRef.value) {
    const text = editorRef.value.innerText
    
    // 验证选中的文本是否在指定位置
    const selectedTextInPosition = text.substring(selectedPosition.value.start, selectedPosition.value.end)
    if (selectedTextInPosition !== variableForm.originalText) {
      console.error('位置验证失败:', {
        expected: variableForm.originalText,
        actual: selectedTextInPosition,
        position: selectedPosition.value
      })
      ElMessage.error('变量设置失败，请重新选择')
      return
    }
    
    const before = text.substring(0, selectedPosition.value.start)
    const after = text.substring(selectedPosition.value.end)
    const newText = before + `{${variableForm.name}}` + after
    editorRef.value.innerText = newText
    
    // 更新后续变量的位置信息
    const offset = `{${variableForm.name}}`.length - variableForm.originalText.length
    form.variables.forEach(variable => {
      if (variable.position && variable.position.start > selectedPosition.value.start) {
        variable.position.start += offset
        variable.position.end += offset
      }
    })
    
    console.log('变量添加成功:', {
      name: variableForm.name,
      position: selectedPosition.value,
      newText: newText
    })
  }
  
  variableDialogVisible.value = false
  selectedText.value = ''
}

// 删除变量
const removeVariable = (index) => {
  const variable = form.variables[index]
  
  // 使用位置信息进行精确替换
  if (editorRef.value && variable.position) {
    const text = editorRef.value.innerText
    
    // 查找变量占位符在文本中的实际位置
    const variablePlaceholder = `{${variable.name}}`
    const placeholderIndex = text.indexOf(variablePlaceholder)
    
    if (placeholderIndex !== -1) {
      // 将变量占位符替换回变量名（原始选择的文本）
      const before = text.substring(0, placeholderIndex)
      const after = text.substring(placeholderIndex + variablePlaceholder.length)
      const newText = before + variable.name + after
      editorRef.value.innerText = newText
      
      // 更新后续变量的位置信息
      const offset = variable.name.length - variablePlaceholder.length
      form.variables.forEach((v, i) => {
        if (i !== index && v.position && v.position.start > placeholderIndex) {
          v.position.start += offset
          v.position.end += offset
        }
      })
    }
  }
  
  // 从变量列表中删除
  form.variables.splice(index, 1)
  
  // 强制更新预览
  nextTick(() => {
    // 触发响应式更新
    console.log('删除变量后预览文本:', previewText.value)
  })
  
  console.log('删除变量成功:', {
    variableName: variable.name,
    remainingVariables: form.variables.length
  })
}

// 清空变量
const clearVariables = () => {
  // 恢复所有原始文本（按位置倒序处理，避免位置偏移）
  if (editorRef.value) {
    let text = editorRef.value.innerText
    const sortedVariables = [...form.variables].sort((a, b) => {
      return (b.position?.start || 0) - (a.position?.start || 0)
    })
    
    sortedVariables.forEach(variable => {
      if (variable.position) {
        const before = text.substring(0, variable.position.start)
        const after = text.substring(variable.position.start + `{${variable.name}}`.length)
        text = before + variable.name + after
      }
    })
    
    editorRef.value.innerText = text
  }
  
  form.variables = []
  
  // 强制更新预览
  nextTick(() => {
    console.log('清空变量后预览文本:', previewText.value)
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    if (!form.context.trim()) {
      ElMessage.error('请输入模板描述')
      return
    }
    
    if (!editorRef.value?.innerText.trim()) {
      ElMessage.error('请输入模板内容')
      return
    }
    
    submitLoading.value = true
    
    const submitData = {
      context: form.context,
      json_text: {
        raw_text: previewText.value,
        variables: form.variables.map(variable => ({
          name: variable.name,
          desc: variable.desc,
          value: variable.value || ""
        }))
      },
      publisher: 'admin'
    }
    
    // 打印提交的数据格式，用于调试
    console.log('提交给后端的数据格式：', JSON.stringify(submitData, null, 2))
    
    let response
    if (props.templateData) {
      // 编辑模式
      response = { code: 200, msg: '修改成功' }
    } else {
      // 新增模式
      response = { code: 200, msg: '新增成功', data: { template_id: Date.now() } }
    }
    
    if (response.code === 200) {
      ElMessage.success(response.msg)
      emit('success')
      handleClose()
    }
  } catch (error) {
    console.error('Submit template error:', error)
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  hideContextMenu()
  variableDialogVisible.value = false
}

// 监听全局点击事件，隐藏右键菜单
document.addEventListener('click', hideContextMenu)
</script>

<style scoped lang="scss">
.template-editor {
  .form-section {
    margin-bottom: 24px;
    
    h4 {
      margin: 0 0 12px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .editor-tips {
      display: flex;
      align-items: center;
      color: #409eff;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 12px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
      border: 1px solid #b3d8ff;
      border-radius: 6px;
      margin-bottom: 8px;
      
      .el-icon {
        margin-right: 8px;
        color: #409eff;
        font-size: 16px;
      }
    }
  }
  
  .text-editor-container {
    display: flex;
    gap: 16px;
    height: 400px;
    
    .text-editor {
      flex: 1;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 12px;
      font-size: 16px;
      line-height: 1.6;
      outline: none;
      resize: none;
      overflow-y: auto;
      
      &:focus {
        border-color: #409eff;
      }
      
      &::selection {
        background-color: #409eff;
        color: white;
      }
    }
    
    .variables-panel {
      width: 300px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-bottom: 1px solid #dcdfe6;
        background: #f5f7fa;
        
        h5 {
          margin: 0;
          color: #303133;
          font-size: 14px;
        }
      }
      
      .variables-list {
        padding: 12px;
        max-height: 350px;
        overflow-y: auto;
        
        .variable-item {
          margin-bottom: 12px;
          padding: 12px;
          border: 2px solid #e4e7ed;
          border-radius: 8px;
          background: linear-gradient(135deg, #fafafa 0%, #f5f7fa 100%);
          transition: all 0.2s ease;
          
          &:hover {
            border-color: #409eff;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
            transform: translateY(-1px);
          }
          
          .variable-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            
            .variable-name {
              font-weight: 600;
              color: #409eff;
              font-size: 15px;
              padding: 4px 8px;
              background: rgba(64, 158, 255, 0.1);
              border-radius: 4px;
              border: 1px solid rgba(64, 158, 255, 0.2);
            }
          }
          
          .variable-preview {
            margin-top: 8px;
            font-size: 12px;
            
            .label {
              color: #909399;
            }
            
            .text {
              color: #606266;
              font-style: italic;
            }
          }
        }
        
        .empty-tip {
          text-align: center;
          color: #909399;
          font-size: 14px;
          padding: 30px 20px;
          background: #fafafa;
          border: 2px dashed #e4e7ed;
          border-radius: 6px;
          margin: 10px 0;
          
          &::before {
            content: "📝";
            display: block;
            font-size: 24px;
            margin-bottom: 8px;
          }
        }
      }
    }
  }
  
  .preview-container {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 12px;
    background: #f0f9ff;
    
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Courier New', monospace;
      font-size: 16px;
      line-height: 1.5;
      color: #2c3e50;
    }
  }
}

.context-menu {
  position: fixed;
  z-index: 3000;
  background: white;
  border: 2px solid #409eff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
  min-width: 160px;
  
  .menu-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    transition: all 0.2s ease;
    
    &:hover {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      color: white;
      transform: translateX(2px);
    }
    
    .el-icon {
      margin-right: 10px;
      color: #409eff;
      font-size: 18px;
      transition: color 0.2s ease;
    }
    
    &:hover .el-icon {
      color: white;
    }
  }
}
</style>
