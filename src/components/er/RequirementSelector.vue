<template>
  <div class="requirement-selector">
    <el-card class="selector-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h4>需求选择</h4>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索需求"
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

      <div class="selector-content">
        <el-table
          v-loading="loading"
          :data="requirementList"
          border
          stripe
          highlight-current-row
          @current-change="handleRowChange"
          style="width: 100%"
        >
          <el-table-column prop="requirement_id" label="需求ID" width="100" />
          <el-table-column prop="requirement_name" label="需求名称" min-width="150" />
          <el-table-column prop="requirement" label="需求描述" min-width="200" />
          <el-table-column prop="create_at" label="创建时间" width="180" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="handleSelect(row)"
              >
                选择
              </el-button>
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
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  selectedRequirement: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:selectedRequirement', 'requirement-selected'])

// 搜索关键词
const searchKeyword = ref('')

// 加载状态
const loading = ref(false)

// 需求列表
const requirementList = ref([])

// 分页
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

// 获取需求列表
const fetchRequirementList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    const mockResponse = {
      code: 0,
      msg: '查询成功',
      data: {
        total: 30,
        page: 1,
        page_size: 10,
        requirements: [
          {
            requirement_id: 1,
            user_id: 2001,
            requirement_name: '会员订单管理系统需求',
            template_id: 1,
            requirement: '需要一个会员订单管理系统，包含会员管理、订单管理、商品管理等功能',
            context: '我们公司需要开发一个会员订单管理系统，主要功能包括：1. 会员注册、登录、信息管理；2. 商品展示、搜索、购买；3. 订单创建、支付、跟踪；4. 会员等级、积分管理',
            json_text: {
              raw_text: '请设计一张 {表名} 表，字段为 {字段集合}，并且添加备注 {备注}。',
              variables: [
                { "name": "表名", "desc": "数据库表的名称", "value": "商品表" },
                { "name": "字段集合", "desc": "字段及数据类型说明", "value": "商品ID、商品名称、价格、库存" },
                { "name": "备注", "desc": "额外的说明信息", "value": "用于商品信息管理" }
              ]
            },
            status: 'active',
            create_at: '2025-08-20 17:00:00',
            updated_at: '2025-8-20 17:00:00'
          },
          {
            requirement_id: 2,
            user_id: 2002,
            requirement_name: '图书管理系统需求',
            requirement: '需要一个图书管理系统，包含图书管理、借阅管理、用户管理等功能',
            context: '我们图书馆需要开发一个图书管理系统，主要功能包括：1. 图书信息管理；2. 借阅记录管理；3. 用户管理；4. 图书分类管理',
            json_text: {
              raw_text: '请设计一张 {表名} 表，字段为 {字段集合}，并且添加备注 {备注}。',
              variables: [
                { "name": "表名", "desc": "数据库表的名称", "value": "图书表" },
                { "name": "字段集合", "desc": "字段及数据类型说明", "value": "图书ID、书名、作者、ISBN、出版社" },
                { "name": "备注", "desc": "额外的说明信息", "value": "用于图书信息管理" }
              ]
            },
            status: 'active',
            create_at: '2025-08-19 16:00:00',
            updated_at: '2025-8-19 16:00:00'
          }
        ]
      }
    }

    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // const response = await getRequirementList({
    //   page: pagination.page,
    //   page_size: pagination.page_size,
    //   keyword: searchKeyword.value || undefined
    // })

    const response = mockResponse

    if (response.code === 0) {
      requirementList.value = response.data.requirements
      pagination.total = response.data.total
      pagination.page = response.data.page
      pagination.page_size = response.data.page_size
    }
  } catch (error) {
    console.error('Fetch requirement list error:', error)
    ElMessage.error('获取需求列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  fetchRequirementList()
}

// 刷新
const handleRefresh = () => {
  fetchRequirementList()
}

// 选择需求
const handleSelect = (row) => {
  emit('update:selectedRequirement', row)
}

// 表格行选择变化
const handleRowChange = (row) => {
  if (row) {
    handleSelect(row)
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.page_size = size
  fetchRequirementList()
}

const handleCurrentChange = (current) => {
  pagination.page = current
  fetchRequirementList()
}

onMounted(() => {
  fetchRequirementList()
})
</script>

<style scoped lang="scss">
.requirement-selector {
  .selector-card {
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
  
  .selector-content {
    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
