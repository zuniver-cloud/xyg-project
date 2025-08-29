<template>
  <div class="requirement-display">
    <el-card class="display-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h4>需求详情</h4>
          <el-tag type="info">需求ID: {{ requirement.requirement_id }}</el-tag>
        </div>
      </template>

      <div class="display-content">
        <!-- 基本信息 -->
        <div class="info-section">
          <h5>基本信息</h5>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="需求描述">
              {{ requirement.context }}
            </el-descriptions-item>
            <el-descriptions-item label="模板ID">
              {{ requirement.template_id }}
            </el-descriptions-item>
            <el-descriptions-item label="创建用户">
              {{ requirement.user_id }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ requirement.updated_at }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 原始文本 -->
        <div class="text-section">
          <h5>原始文本</h5>
          <el-card shadow="never" class="text-card">
            <pre>{{ requirement.json_text?.raw_text || '暂无内容' }}</pre>
          </el-card>
        </div>

        <!-- 变量定义 -->
        <div class="variables-section">
          <h5>变量定义</h5>
          <el-table
            :data="requirement.json_text?.variables || []"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column prop="name" label="变量名" width="150" />
            <el-table-column prop="desc" label="变量描述" min-width="200" />
            <el-table-column prop="value" label="当前值" min-width="200">
              <template #default="{ row }">
                <el-tag type="success">{{ row.value }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>


      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  requirement: {
    type: Object,
    required: true
  }
})


</script>

<style scoped lang="scss">
.requirement-display {
  .display-card {
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
  
  .display-content {
    .info-section,
    .text-section,
    .variables-section {
      margin-bottom: 24px;
      
      h5 {
        margin: 0 0 12px 0;
        color: #303133;
        font-size: 14px;
        font-weight: 600;
      }
    }
    
    .text-card {
      min-height: 120px; // 增加最小高度，与数据库设计描述框对齐
      
      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
        margin: 0;
        color: #606266;
        min-height: 100px; // 确保内容区域也有足够高度
      }
    }
    

  }
}
</style>
