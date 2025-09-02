<template>
  <div class="er-model-selector">
    <el-card class="selector-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h5>选择ER模型</h5>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索ER模型名称..."
            size="small"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <div class="model-list">
        <div
          v-for="model in filteredModels"
          :key="model.id"
          class="model-item"
          :class="{ active: selectedModel && selectedModel.id === model.id }"
          @click="handleModelSelect(model)"
        >
          <div class="model-info">
            <div class="model-name">{{ model.erName }}</div>
            <div class="model-desc">{{ model.description || "暂无描述" }}</div>
            <div class="model-meta">
              <span class="entity-count"
                >{{ model.entityCount || 0 }} 个实体</span
              >
              <span class="create-time">{{
                formatTime(model.createTime)
              }}</span>
            </div>
          </div>
          <div class="model-actions">
            <el-button
              size="small"
              type="primary"
              @click.stop="handleModelSelect(model)"
            >
              选择
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredModels.length === 0" class="empty-state">
          <el-empty description="暂无ER模型" :image-size="100">
            <template #description>
              <p>
                {{ searchKeyword ? "未找到匹配的ER模型" : "请先创建ER模型" }}
              </p>
            </template>
          </el-empty>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";

// Props
const props = defineProps({
  selectedModel: {
    type: Object,
    default: null,
  },
});

// Emits
const emit = defineEmits(["update:selected-model"]);

// 响应式数据
const searchKeyword = ref("");
const erModels = ref([]);

// 计算属性
const filteredModels = computed(() => {
  if (!searchKeyword.value) {
    return erModels.value;
  }
  return erModels.value.filter(
    (model) =>
      model.erName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (model.description &&
        model.description
          .toLowerCase()
          .includes(searchKeyword.value.toLowerCase()))
  );
});

// 方法
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
};

const handleModelSelect = (model) => {
  emit("update:selected-model", model);
};

const formatTime = (timestamp) => {
  if (!timestamp) return "未知时间";
  const date = new Date(timestamp);
  return date.toLocaleDateString("zh-CN");
};

// 模拟数据
const loadMockData = () => {
  erModels.value = [
    {
      id: 1,
      erName: "学生管理系统ER模型",
      description: "包含学生、课程、教师、班级等实体的ER模型",
      entityCount: 5,
      createTime: "2024-01-15T10:00:00Z",
      erJson: JSON.stringify({
        entities: [
          {
            name: "Student",
            attributes: ["id", "name", "age", "class", "major", "email"],
          },
          {
            name: "Course",
            attributes: ["id", "title", "credits", "teacher", "semester"],
          },
          {
            name: "Teacher",
            attributes: ["id", "name", "department", "position", "email"],
          },
          {
            name: "Class",
            attributes: ["id", "name", "grade", "major", "student_count"],
          },
          {
            name: "Grade",
            attributes: ["id", "student_id", "course_id", "score", "semester"],
          },
        ],
      }),
    },
    {
      id: 2,
      erName: "电商系统ER模型",
      description: "包含用户、商品、订单、购物车等实体的ER模型",
      entityCount: 8,
      createTime: "2024-01-10T14:30:00Z",
      erJson: JSON.stringify({
        entities: [
          {
            name: "User",
            attributes: [
              "id",
              "username",
              "email",
              "phone",
              "address",
              "create_time",
            ],
          },
          {
            name: "Product",
            attributes: [
              "id",
              "name",
              "price",
              "stock",
              "category",
              "description",
            ],
          },
          {
            name: "Order",
            attributes: [
              "id",
              "user_id",
              "total_amount",
              "status",
              "create_time",
            ],
          },
          {
            name: "OrderItem",
            attributes: ["id", "order_id", "product_id", "quantity", "price"],
          },
          {
            name: "Cart",
            attributes: ["id", "user_id", "product_id", "quantity", "add_time"],
          },
          {
            name: "Category",
            attributes: ["id", "name", "parent_id", "level", "sort_order"],
          },
          {
            name: "Review",
            attributes: [
              "id",
              "user_id",
              "product_id",
              "rating",
              "comment",
              "create_time",
            ],
          },
          {
            name: "Payment",
            attributes: [
              "id",
              "order_id",
              "amount",
              "method",
              "status",
              "pay_time",
            ],
          },
        ],
      }),
    },
    {
      id: 3,
      erName: "人力资源系统ER模型",
      description: "包含员工、部门、职位、薪资等实体的ER模型",
      entityCount: 6,
      createTime: "2024-01-05T09:15:00Z",
      erJson: JSON.stringify({
        entities: [
          {
            name: "Employee",
            attributes: [
              "id",
              "name",
              "email",
              "phone",
              "hire_date",
              "department_id",
              "position_id",
            ],
          },
          {
            name: "Department",
            attributes: ["id", "name", "manager_id", "location", "description"],
          },
          {
            name: "Position",
            attributes: [
              "id",
              "title",
              "level",
              "salary_range",
              "requirements",
            ],
          },
          {
            name: "Salary",
            attributes: [
              "id",
              "employee_id",
              "base_salary",
              "bonus",
              "deductions",
              "month",
            ],
          },
          {
            name: "Attendance",
            attributes: [
              "id",
              "employee_id",
              "date",
              "check_in",
              "check_out",
              "status",
            ],
          },
          {
            name: "Training",
            attributes: [
              "id",
              "name",
              "description",
              "duration",
              "cost",
              "trainer",
            ],
          },
        ],
      }),
    },
  ];
};

// 生命周期
onMounted(() => {
  loadMockData();
});
</script>

<style scoped lang="scss">
.er-model-selector {
  .selector-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;

      h5 {
        margin: 0;
        color: #2c3e50;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
      }

      .search-input {
        width: 250px;
      }
    }
  }

  .model-list {
    max-height: 400px;
    overflow-y: auto;

    .model-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin-bottom: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
      }

      &.active {
        border-color: #409eff;
        background-color: #f0f9ff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
      }

      .model-info {
        flex: 1;
        margin-right: 16px;

        .model-name {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .model-desc {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .model-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #909399;

          .entity-count {
            background: #f0f9ff;
            color: #409eff;
            padding: 2px 8px;
            border-radius: 12px;
          }

          .create-time {
            color: #909399;
          }
        }
      }

      .model-actions {
        flex-shrink: 0;
      }
    }
  }

  .empty-state {
    padding: 40px 0;
    text-align: center;

    :deep(.el-empty__description) {
      color: #909399;
      font-size: 14px;
    }
  }
}
</style>
