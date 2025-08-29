<template>
  <div class="action-buttons">
    <el-card class="buttons-card" shadow="never">
      <div class="buttons-content">
        <div class="buttons-left">
          <el-button
            type="primary"
            :loading="saveLoading"
            @click="handleSaveToRepository"
          >
            <el-icon><Download /></el-icon>
            保存到需求仓库
          </el-button>
          
          <el-button
            type="success"
            :loading="generateLoading"
            @click="handleGenerateER"
          >
            <el-icon><MagicStick /></el-icon>
            生成ER模型
          </el-button>
          

        </div>
        

      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, MagicStick } from '@element-plus/icons-vue'

const props = defineProps({
  requirement: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save-to-repository', 'generate-er'])

// 加载状态
const saveLoading = ref(false)
const generateLoading = ref(false)

// 保存到需求仓库
const handleSaveToRepository = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要将修改后的需求保存到需求仓库吗？',
      '确认保存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    saveLoading.value = true
    emit('save-to-repository', props.requirement)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Save error:', error)
      ElMessage.error('保存失败')
    }
  } finally {
    saveLoading.value = false
  }
}

// 生成ER模型
const handleGenerateER = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要基于当前需求生成ER模型吗？',
      '确认生成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    generateLoading.value = true
    emit('generate-er', props.requirement)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Generate error:', error)
      ElMessage.error('生成失败')
    }
  } finally {
    generateLoading.value = false
  }
}


</script>

<style scoped lang="scss">
.action-buttons {
  .buttons-card {
    .buttons-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      
      .buttons-left {
        display: flex;
        gap: 12px;
      }
    }
  }
}
</style>
