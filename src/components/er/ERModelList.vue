<template>
  <div class="er-model-list">
    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
                     <h4>ER仓库列表</h4>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索ER模型"
              clearable
              @input="handleSearch"
              style="width: 200px; margin-right: 12px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button @click="handleRefresh" :icon="Refresh">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div class="list-content">
        <el-table
          v-loading="loading"
          :data="modelList"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="erName" label="模型名称" min-width="200" />
          <el-table-column prop="description" label="模型描述" min-width="250" />
          <el-table-column prop="updateAt" label="更新时间" width="180" />
          <el-table-column label="操作" width="280" fixed="right">
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
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, View, Delete } from '@element-plus/icons-vue'

const emit = defineEmits(['edit', 'preview', 'delete'])

// 搜索关键词
const searchKeyword = ref('')

// 加载状态
const loading = ref(false)

// 模型列表
const modelList = ref([])

// 分页
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

// 获取ER模型列表
const fetchModelList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    const mockResponse = {
      code: 0,
      msg: '查询成功',
      data: {
        record: [
          {
            erId: 10,
            erName: '图书管理系统',
            description: '示例模型',
            updateAt: '2025-08-15',
            content: '这是一个图书管理系统的数据库设计，包含图书、用户、借阅等核心实体...',
            json_data: JSON.stringify({
              entities: [
                {
                  name: "图书",
                  attribute: [
                    { "name": "图书ID", "type": "PK" },
                    { "name": "书名", "type": "varchar(200)" },
                    { "name": "作者", "type": "varchar(100)" },
                    { "name": "ISBN", "type": "varchar(20)" },
                    { "name": "出版社", "type": "varchar(100)" },
                    { "name": "出版日期", "type": "date" },
                    { "name": "库存数量", "type": "int" }
                  ]
                },
                {
                  name: "用户",
                  attribute: [
                    { "name": "用户ID", "type": "PK" },
                    { "name": "用户名", "type": "varchar(50)" },
                    { "name": "邮箱", "type": "varchar(100)" },
                    { "name": "注册时间", "type": "datetime" }
                  ]
                }
              ],
              relationship: [
                {
                  name: "借阅",
                  from: "用户",
                  to: "图书",
                  type: "many-to-many"
                }
              ]
            }, null, 2)
          },
          {
            erId: 11,
            erName: '会员订单系统ER模型',
            description: '基于会员管理需求的数据库设计',
            updateAt: '2025-08-20',
            content: '会员订单系统的数据库设计，包含会员、订单、商品等核心实体...',
            json_data: JSON.stringify({
              entities: [
                {
                  name: "会员",
                  attribute: [
                    { "name": "会员ID", "type": "PK" },
                    { "name": "用户名", "type": "varchar(50)" },
                    { "name": "邮箱", "type": "varchar(100)" },
                    { "name": "会员等级", "type": "enum('普通','银卡','金卡')" }
                  ]
                },
                {
                  name: "订单",
                  attribute: [
                    { "name": "订单ID", "type": "PK" },
                    { "name": "会员ID", "type": "FK" },
                    { "name": "订单金额", "type": "decimal(10,2)" },
                    { "name": "创建时间", "type": "datetime" }
                  ]
                }
              ],
              relationship: [
                {
                  name: "创建订单",
                  from: "会员",
                  to: "订单",
                  type: "one-to-many"
                }
              ]
            }, null, 2)
          },
          {
            erId: 12,
            erName: '电商系统ER模型',
            description: '电商平台的数据库设计',
            updateAt: '2025-08-21',
            content: '电商系统的数据库设计，包含商品、订单、用户等核心实体...',
            json_data: JSON.stringify({
              entities: [
                {
                  name: "商品",
                  attribute: [
                    { "name": "商品ID", "type": "PK" },
                    { "name": "商品名称", "type": "varchar(200)" },
                    { "name": "价格", "type": "decimal(10,2)" },
                    { "name": "库存", "type": "int" }
                  ]
                },
                {
                  name: "订单",
                  attribute: [
                    { "name": "订单ID", "type": "PK" },
                    { "name": "用户ID", "type": "FK" },
                    { "name": "总金额", "type": "decimal(10,2)" },
                    { "name": "状态", "type": "enum('待付款','已付款','已发货','已完成')" }
                  ]
                }
              ],
              relationship: [
                {
                  name: "购买",
                  from: "用户",
                  to: "商品",
                  type: "many-to-many"
                }
              ]
            }, null, 2)
          }
        ],
        total: 25,
        pageNum: 1,
        pageSize: 10
      }
    }

    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // const response = await getERModelList({
    //   page: pagination.page,
    //   page_size: pagination.page_size,
    //   keyword: searchKeyword.value || undefined
    // })

    const response = mockResponse

    if (response.code === 0) {
      modelList.value = response.data.record
      pagination.total = response.data.total
      pagination.page = response.data.pageNum
      pagination.page_size = response.data.pageSize
    }
  } catch (error) {
    console.error('Fetch ER model list error:', error)
    ElMessage.error('获取ER模型列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  fetchModelList()
}

// 刷新
const handleRefresh = () => {
  fetchModelList()
}



// 编辑模型
const handleEdit = (row) => {
  emit('edit', row)
}

// 预览模型
const handlePreview = (row) => {
  emit('preview', row)
}

// 删除模型
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除ER模型 "${row.erName || row.title}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // await deleteERModel(row.erId || row.er_model_id)
    
    emit('delete', row)
    // 移除这里的成功提示，由父组件处理
    fetchModelList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete ER model error:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.page_size = size
  fetchModelList()
}

const handleCurrentChange = (current) => {
  pagination.page = current
  fetchModelList()
}

onMounted(() => {
  fetchModelList()
})
</script>

<style scoped lang="scss">
.er-model-list {
  .list-card {
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
        align-items: center;
      }
    }
  }
  
  .list-content {
    .action-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
      white-space: nowrap;
      
      .el-button {
        flex-shrink: 0;
      }
    }
    
    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
