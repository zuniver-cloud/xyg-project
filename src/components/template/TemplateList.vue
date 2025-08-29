<template>
  <div class="template-list">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入关键词搜索模板"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch" :icon="Search">
            搜索
          </el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 模板列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>需求模板列表</span>
          <el-button type="primary" @click="handleAdd" :icon="Plus">
            新增模板
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="templateList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="template_id" label="模板ID" width="100" />
        <el-table-column prop="context" label="模板描述" min-width="200" />
        <el-table-column prop="release_user" label="发布用户" width="120" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="handleEdit(row)"
                :icon="Edit"
              >
                编辑
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="handlePreview(row)"
                :icon="View"
              >
                预览
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="handleFill(row)"
                :icon="EditPen"
              >
                填充
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
                :icon="Delete"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, View, EditPen, Delete } from '@element-plus/icons-vue'
import { getTemplateList, deleteTemplate } from '../../api/template'

const emit = defineEmits(['add', 'edit', 'preview', 'fill'])

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 模板列表
const templateList = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

// 获取模板列表
const fetchTemplateList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      keyword: searchForm.keyword || undefined
    }
    
    // 模拟API调用
    const mockResponse = {
      code: 200,
      msg: '查询成功',
      data: {
        total: 52,
        page: 1,
        page_size: 10,
        list: [
          {
            template_id: 101,
            context: '该模板用于ER设计',
            release_user: 'admin',
            created_at: '2025-08-21 15:00:00'
          },
          {
            template_id: 102,
            context: '该模板用于API接口定义',
            release_user: 'admin',
            created_at: '2025-08-21 15:10:00'
          }
        ]
      }
    }
    
    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // const response = await getTemplateList(params)
    
    // 测试阶段：使用模拟数据
    const response = mockResponse
    
    if (response.code === 200) {
      templateList.value = response.data.list
      pagination.total = response.data.total
      pagination.page = response.data.page
      pagination.page_size = response.data.page_size
    }
  } catch (error) {
    console.error('Fetch template list error:', error)
    ElMessage.error('获取模板列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchTemplateList()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  handleSearch()
}

// 新增模板
const handleAdd = () => {
  emit('add')
}

// 编辑模板
const handleEdit = (row) => {
  emit('edit', row)
}

// 预览模板
const handlePreview = (row) => {
  emit('preview', row)
}

// 填充模板
const handleFill = (row) => {
  emit('fill', row)
}

// 删除模板
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除模板 ${row.template_id} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // await deleteTemplate(row.template_id)
    
    // 模拟删除操作
    const index = templateList.value.findIndex(t => t.template_id === row.template_id)
    if (index > -1) {
      templateList.value.splice(index, 1)
    }
    
    ElMessage.success('删除成功')
    fetchTemplateList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete template error:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.page_size = size
  fetchTemplateList()
}

const handleCurrentChange = (current) => {
  pagination.page = current
  fetchTemplateList()
}

onMounted(() => {
  fetchTemplateList()
})
</script>

<style scoped lang="scss">
.template-list {
  .search-card {
    margin-bottom: 20px;
  }
  
  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
      white-space: nowrap;
      
      .el-button {
        flex-shrink: 0;
      }
    }
  }
}
</style>
