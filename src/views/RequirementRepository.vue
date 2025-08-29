<template>
  <div class="requirement-repository-container">
    <!-- 搜索栏 -->
    <el-card class="search-container" shadow="never">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索需求名称或描述"
          clearable
          @clear="searchRequirements"
          @keyup.enter="searchRequirements"
        />
        <el-button type="primary" @click="searchRequirements">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </el-card>

    <!-- 需求文档列表 -->
    <el-card class="table-card" shadow="never">
      <!-- 头部 -->
      <template #header>
        <div class="card-header">
          <span class="card-title">我的需求文档</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            新增需求
          </el-button>
        </div>
      </template>

      <!-- 表格 -->
      <div class="table-container">
        <el-table
          :data="filteredRequirements"
          v-loading="loading"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="template_id" label="需求ID" width="120" />
          <el-table-column prop="template_name" label="需求名称" width="200" />
          <el-table-column prop="context" label="需求描述" min-width="200">
            <template #default="{ row }">
              <el-tooltip
                :content="row.context || '暂无描述'"
                placement="top"
                :show-after="500"
              >
                <span class="description-text">
                  {{ row.context || "暂无描述" }}
                </span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="publisher" label="创建者" width="120" />
          <el-table-column prop="published_at" label="创建时间" width="180" />
          <el-table-column prop="last_modified" label="修改时间" width="180" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 'active' ? 'success' : 'info'"
                size="small"
              >
                {{ row.status === "active" ? "有效" : "已归档" }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- 操作栏 -->
          <el-table-column label="操作" width="320" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <!-- <el-button size="small" @click="viewRequirement(row)">
                  <el-icon><View /></el-icon>查看
                </el-button> -->
                <el-button size="small" @click="editRequirement(row)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button size="small" @click="downloadRequirement(row)">
                  <el-icon><Download /></el-icon>下载
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="deleteRequirement(row)"
                >
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 需求编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="需求名称" prop="template_name">
          <el-input
            v-model="formData.template_name"
            placeholder="请输入需求名称"
          />
        </el-form-item>
        <el-form-item label="需求描述" prop="context">
          <el-input
            v-model="formData.context"
            type="textarea"
            :rows="3"
            placeholder="请输入需求描述"
          />
        </el-form-item>
        <el-form-item label="需求内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入需求内容，使用{变量名}格式定义变量"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 需求查看弹窗 -->
    <el-dialog
      title="需求文档详情"
      v-model="viewDialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="requirement-detail">
        <div class="detail-header">
          <h3>{{ selectedRequirement?.template_name }}</h3>
          <p class="description">{{ selectedRequirement?.context }}</p>
        </div>
        <div class="detail-content">
          <div class="content-display">
            <div class="content-text" v-html="formattedContent"></div>
          </div>
        </div>
        <div class="detail-meta">
          <p><strong>创建者：</strong>{{ selectedRequirement?.publisher }}</p>
          <p>
            <strong>创建时间：</strong>{{ selectedRequirement?.published_at }}
          </p>
          <p>
            <strong>修改时间：</strong>{{ selectedRequirement?.last_modified }}
          </p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button
            type="primary"
            @click="editRequirement(selectedRequirement)"
          >
            编辑
          </el-button>

          <el-button
            type="warning"
            @click="downloadRequirement(selectedRequirement)"
          >
            下载
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { createApp, ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Plus,
  View,
  Edit,
  CopyDocument,
  Download,
  Delete,
} from "@element-plus/icons-vue";

export default {
  name: "RequirementRepository",
  setup() {
    // 需求数据
    const requirements = ref([]);
    // 过滤后的需求数据
    const filteredRequirements = ref([]);
    // 加载状态
    const loading = ref(true);
    // 搜索关键字
    const searchKeyword = ref("");
    // 分页数据
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0,
    });
    // 对话框可见性
    const dialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    // 对话框标题
    const dialogTitle = ref("新增需求");
    // 选中的需求
    const selectedRequirement = ref(null);
    // 表单数据
    const formData = reactive({
      template_id: "",
      template_name: "",
      context: "",
      content: "",
      status: "active",
    });
    // 表单引用
    const formRef = ref(null);
    // 表单规则
    const formRules = {
      template_name: [
        { required: true, message: "请输入需求名称", trigger: "blur" },
        {
          min: 2,
          max: 50,
          message: "需求名称长度在 2 到 50 个字符",
          trigger: "blur",
        },
      ],
      context: [{ required: true, message: "请输入需求描述", trigger: "blur" }],
      content: [{ required: true, message: "请输入需求内容", trigger: "blur" }],
    };

    // 状态选项
    const statusOptions = [
      { label: "有效", value: "active" },
      { label: "已归档", value: "archived" },
    ];

    // 模拟数据 - 从localStorage获取或使用默认数据
    const getMockRequirements = () => {
      const savedRequirements = localStorage.getItem("myRequirements");
      if (savedRequirements) {
        return JSON.parse(savedRequirements);
      }
      return [
        {
          template_id: 1001,
          template_name: "用户登录功能需求",
          context: "实现用户登录认证功能",
          content:
            "需要实现用户{用户名}的登录功能，包括{密码验证}和{登录状态管理}。",
          publisher: "user",
          published_at: "2025-01-15 10:30:00",
          last_modified: "2025-01-15 10:30:00",
          status: "active",
        },
        {
          template_id: 1002,
          template_name: "数据库表设计需求",
          context: "设计用户管理相关数据表",
          content: "需要设计{表名}表，包含字段{字段集合}，主要用于{表用途}。",
          publisher: "user",
          published_at: "2025-01-16 14:20:00",
          last_modified: "2025-01-16 14:20:00",
          status: "active",
        },
      ];
    };

    // 保存数据到localStorage
    const saveRequirements = (data) => {
      localStorage.setItem("myRequirements", JSON.stringify(data));
    };

    // 格式化内容显示
    const formattedContent = computed(() => {
      if (!selectedRequirement.value?.content) return "";

      return selectedRequirement.value.content.replace(
        /\{([^}]+)\}/g,
        '<span class="highlight">{$1}</span>'
      );
    });

    // 初始化数据
    const initData = () => {
      loading.value = true;
      // 模拟API请求延迟
      setTimeout(() => {
        requirements.value = getMockRequirements();
        filteredRequirements.value = requirements.value;
        pagination.total = requirements.value.length;
        loading.value = false;
      }, 500);
    };

    // 搜索需求
    const searchRequirements = () => {
      loading.value = true;
      // 模拟搜索
      setTimeout(() => {
        if (!searchKeyword.value) {
          filteredRequirements.value = requirements.value;
        } else {
          const keyword = searchKeyword.value.toLowerCase();
          filteredRequirements.value = requirements.value.filter(
            (req) =>
              req.template_name.toLowerCase().includes(keyword) ||
              req.context.toLowerCase().includes(keyword) ||
              req.content.toLowerCase().includes(keyword)
          );
        }
        pagination.total = filteredRequirements.value.length;
        pagination.currentPage = 1;
        loading.value = false;
      }, 300);
    };

    // 处理分页变化
    const handleCurrentChange = (currentPage) => {
      pagination.currentPage = currentPage;
    };

    // 处理每页数量变化
    const handleSizeChange = (pageSize) => {
      pagination.pageSize = pageSize;
      pagination.currentPage = 1;
    };

    // 打开新增需求对话框
    const openAddDialog = () => {
      dialogTitle.value = "新增需求";
      // 重置表单数据
      Object.assign(formData, {
        template_id: "",
        template_name: "",
        context: "",
        content: "",
        status: "active",
      });
      dialogVisible.value = true;
    };

    // 查看需求详情
    const viewRequirement = (requirement) => {
      selectedRequirement.value = requirement;
      viewDialogVisible.value = true;
    };

    // 编辑需求
    const editRequirement = (requirement) => {
      dialogTitle.value = "编辑需求";
      // 填充表单数据
      Object.assign(formData, {
        template_id: requirement.template_id,
        template_name: requirement.template_name,
        context: requirement.context,
        content: requirement.content,
        status: requirement.status,
      });
      dialogVisible.value = true;
    };

    // 提交表单
    const submitForm = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          if (formData.template_id) {
            // 编辑需求
            const index = requirements.value.findIndex(
              (req) => req.template_id === formData.template_id
            );
            if (index !== -1) {
              const updatedRequirement = {
                ...requirements.value[index],
                template_name: formData.template_name,
                context: formData.context,
                content: formData.content,
                status: formData.status,
                last_modified: new Date().toLocaleString(),
              };

              requirements.value[index] = updatedRequirement;
              filteredRequirements.value = [...requirements.value];
              saveRequirements(requirements.value);
              ElMessage.success("需求更新成功");
            }
          } else {
            // 新增需求
            const newRequirement = {
              ...formData,
              template_id: Date.now(),
              publisher: "user",
              published_at: new Date().toLocaleString(),
              last_modified: new Date().toLocaleString(),
            };
            requirements.value.unshift(newRequirement);
            filteredRequirements.value = [...requirements.value];
            pagination.total = requirements.value.length;
            saveRequirements(requirements.value);
            ElMessage.success("需求添加成功");
          }
          dialogVisible.value = false;
        } else {
          ElMessage.error("请正确填写表单");
          return false;
        }
      });
    };

    // 下载需求
    const downloadRequirement = (requirement) => {
      const text = `${requirement.template_name}\n\n${requirement.context}\n\n${requirement.content}`;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${
        requirement.template_name
      }-${new Date().toLocaleDateString()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      ElMessage.success("需求文档下载成功");
    };

    // 删除需求
    const deleteRequirement = (requirement) => {
      ElMessageBox.confirm(
        `确定要删除需求 "${requirement.template_name}" 吗？此操作不可恢复。`,
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          const index = requirements.value.findIndex(
            (req) => req.template_id === requirement.template_id
          );
          if (index !== -1) {
            requirements.value.splice(index, 1);
            filteredRequirements.value = [...requirements.value];
            pagination.total = requirements.value.length;
            saveRequirements(requirements.value);
            ElMessage.success("需求删除成功");
          }
        })
        .catch(() => {
          // 用户取消删除
        });
    };

    // 切换需求状态
    const toggleStatus = (requirement) => {
      const newStatus = requirement.status === "active" ? "archived" : "active";
      const action = newStatus === "active" ? "激活" : "归档";

      ElMessageBox.confirm(
        `确定要${action}需求 "${requirement.template_name}" 吗？`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info",
        }
      )
        .then(() => {
          const index = requirements.value.findIndex(
            (req) => req.template_id === requirement.template_id
          );
          if (index !== -1) {
            requirements.value[index].status = newStatus;
            requirements.value[index].last_modified =
              new Date().toLocaleString();
            filteredRequirements.value = [...requirements.value];
            saveRequirements(requirements.value);
            ElMessage.success(`需求已${action}`);
          }
        })
        .catch(() => {
          // 用户取消操作
        });
    };

    // 组件挂载时初始化数据
    onMounted(() => {
      initData();
    });

    return {
      filteredRequirements,
      loading,
      searchKeyword,
      pagination,
      dialogVisible,
      viewDialogVisible,
      dialogTitle,
      selectedRequirement,
      formData,
      formRef,
      formRules,
      statusOptions,
      formattedContent,
      searchRequirements,
      handleCurrentChange,
      handleSizeChange,
      openAddDialog,
      viewRequirement,
      editRequirement,
      submitForm,

      downloadRequirement,
      deleteRequirement,
      toggleStatus,
    };
  },
};
</script>

<style scoped>
.requirement-repository-container {
  padding: 0px 20px 20px 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 搜索样式 */
.search-container {
  margin-bottom: 20px;
  padding: 13px;
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-start;
}

.search-bar .el-input {
  width: 300px;
}

/* 列表样式 */
.table-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
}

.table-container {
  padding: 10px 0;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.description-text {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 需求详情样式 */
.requirement-detail {
  padding: 20px 0;
}

.detail-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-header h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 18px;
}

.detail-header .description {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.detail-content {
  margin-bottom: 20px;
}

.content-display {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e8eaed;
}

.content-text {
  font-size: 14px;
  line-height: 1.8;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-word;
}

.content-text .highlight {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  color: #92400e;
}

.detail-meta {
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.detail-meta p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.detail-meta strong {
  color: #2c3e50;
}
</style>
