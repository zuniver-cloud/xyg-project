<template>
  <div class="data-standards-list">
    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h4>数据标准列表</h4>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索数据标准"
              clearable
              @input="handleSearch"
              style="width: 200px; margin-right: 12px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button @click="handleRefresh" :icon="Refresh"> 刷新 </el-button>
          </div>
        </div>
      </template>

      <div class="list-content">
        <el-table
          v-loading="loading"
          :data="standardsList"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="name" label="标准名称" min-width="200" />
          <el-table-column prop="type" label="标准类型" width="120">
            <template #default="{ row }">
              <el-tag :type="row.type === 'basic' ? 'primary' : 'success'">
                {{ row.type === "basic" ? "基础标准" : "高级标准" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="requirement"
            label="关联需求"
            min-width="150"
          />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === "active" ? "已启用" : "已停用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleView(row)"
                  :icon="View"
                >
                  查看
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  @click="handleEdit(row)"
                  :icon="Edit"
                >
                  编辑
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
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, View, Edit, Delete } from "@element-plus/icons-vue";

const emit = defineEmits(["view", "edit", "delete"]);

// 搜索关键词
const searchKeyword = ref("");

// 加载状态
const loading = ref(false);

// 数据标准列表
const standardsList = ref([]);

// 分页配置
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0,
});

// 模拟数据
const mockData = [
  {
    id: 1,
    name: "用户管理数据标准",
    type: "basic",
    requirement: "用户管理系统需求",
    createTime: "2024-01-15 10:30:00",
    status: "active",
    content: "用户管理相关数据标准内容...",
  },
  {
    id: 2,
    name: "订单管理数据标准",
    type: "advanced",
    requirement: "订单管理系统需求",
    createTime: "2024-01-16 14:20:00",
    status: "active",
    content: "订单管理相关数据标准内容...",
  },
  {
    id: 3,
    name: "库存管理数据标准",
    type: "basic",
    requirement: "库存管理系统需求",
    createTime: "2024-01-17 09:15:00",
    status: "inactive",
    content: "库存管理相关数据标准内容...",
  },
  {
    id: 4,
    name: "财务管理数据标准",
    type: "advanced",
    requirement: "财务管理系统需求",
    createTime: "2024-01-18 16:45:00",
    status: "active",
    content: "财务管理相关数据标准内容...",
  },
  {
    id: 5,
    name: "客户管理数据标准",
    type: "basic",
    requirement: "客户管理系统需求",
    createTime: "2024-01-19 11:20:00",
    status: "active",
    content: "客户管理相关数据标准内容...",
  },
];

// 获取数据标准列表
const fetchStandardsList = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 模拟搜索过滤
    let filteredData = [...mockData];
    if (searchKeyword.value) {
      filteredData = mockData.filter(
        (item) =>
          item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          item.requirement
            .toLowerCase()
            .includes(searchKeyword.value.toLowerCase())
      );
    }

    // 模拟分页
    const start = (pagination.page - 1) * pagination.page_size;
    const end = start + pagination.page_size;
    standardsList.value = filteredData.slice(start, end);
    pagination.total = filteredData.length;
  } catch (error) {
    console.error("Fetch standards list error:", error);
    ElMessage.error("获取数据标准列表失败");
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  pagination.page = 1;
  fetchStandardsList();
};

// 刷新
const handleRefresh = () => {
  searchKeyword.value = "";
  pagination.page = 1;
  fetchStandardsList();
};

// 查看数据标准
const handleView = (row) => {
  emit("view", row);
};

// 编辑数据标准
const handleEdit = (row) => {
  emit("edit", row);
};

// 删除数据标准
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除数据标准 "${row.name}" 吗？`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // await deleteDataStandard(row.id)

    emit("delete", row);
    // 移除这里的成功提示，由父组件处理
    fetchStandardsList();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Delete data standard error:", error);
      ElMessage.error("删除失败");
    }
  }
};

// 分页处理
const handleSizeChange = (size) => {
  pagination.page_size = size;
  pagination.page = 1;
  fetchStandardsList();
};

const handleCurrentChange = (current) => {
  pagination.page = current;
  fetchStandardsList();
};

onMounted(() => {
  fetchStandardsList();
});
</script>

<style scoped lang="scss">
.data-standards-list {
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
