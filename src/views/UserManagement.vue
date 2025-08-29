<template>
  <div class="user-management-container">
    <!-- 搜索栏 -->
    <el-card class="search-container" shadow="never">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索统一认证号、用户名或角色"
          clearable
          @clear="searchUsers"
          @keyup.enter="searchUsers"
        />
        <el-button type="primary" @click="searchUsers">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </el-card>
    <!-- 用户列表 -->
    <el-card class="table-card" shadow="never">
      <!-- 头部 -->
      <template #header>
        <div class="card-header">
          <span class="card-title">用户列表</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>

      <!-- 表格 -->
      <div class="table-container">
        <el-table
          :data="filteredUsers"
          v-loading="loading"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="id" label="用户ID" width="120" />
          <el-table-column prop="use_id" label="统一认证号" width="150" />
          <el-table-column prop="username" label="用户名" width="150" />
          <el-table-column label="密码" width="150">
            <template #default="{ row }">
              {{ row.password ? "********" : "" }}
            </template>
          </el-table-column>
          <el-table-column label="角色" width="120">
            <template #default="{ row }">
              {{ formatRole(row.role) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 'active' ? 'success' : 'info'"
                size="small"
              >
                {{ row.status === "active" ? "激活" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- 操作栏 -->
          <el-table-column label="操作" width="270" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button size="small" @click="openEditDialog(row)"
                  >编辑</el-button
                >
                <el-button
                  size="small"
                  :type="row.status === 'active' ? 'warning' : 'success'"
                  @click="toggleStatus(row)"
                >
                  {{ row.status === "active" ? "禁用" : "激活" }}
                </el-button>
                <el-button size="small" type="danger" @click="deleteUser(row)">
                  删除
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
    <!-- 用户编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="统一认证号" prop="use_id">
          <el-input v-model="formData.use_id" placeholder="请输入统一认证号" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item :label="formData.id ? '新密码' : '密码'" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            :placeholder="formData.id ? '留空则不修改密码' : '请输入新密码'"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select
            v-model="formData.role"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
  </div>
</template>

<script>
import { createApp, ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus } from "@element-plus/icons-vue";

export default {
  name: "UserManagement",
  setup() {
    // 用户数据
    const users = ref([]);
    // 过滤后的用户数据
    const filteredUsers = ref([]);
    // 加载状态
    const loading = ref(true);
    // 搜索关键字
    const searchKeyword = ref("");
    // 分页数据
    const pagination = reactive({
      currentPage: 1,
      pageSize: 5,
      total: 10,
    });
    // 对话框可见性
    const dialogVisible = ref(false);
    // 对话框标题
    const dialogTitle = ref("添加用户");
    // 表单数据
    const formData = reactive({
      id: "",
      use_id: "",
      username: "",
      password: "",
      role: "",
      status: "active",
    });
    // 表单引用
    const formRef = ref(null);
    // 表单规则
    const formRules = {
      use_id: [
        { required: true, message: "请输入统一认证号", trigger: "blur" },
        {
          min: 6,
          max: 20,
          message: "统一认证号长度在 6 到 20 个字符",
          trigger: "blur",
        },
        {
          pattern: /^[a-zA-Z0-9_-]+$/,
          message: "统一认证号只能包含字母、数字、下划线和连字符",
          trigger: "blur",
        },
      ],
      username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        {
          min: 3,
          max: 20,
          message: "用户名长度在 3 到 20 个字符",
          trigger: "blur",
        },
      ],
      password: [
        {
          required: true,
          message: "请输入密码",
          trigger: "blur",
          validator: (rule, value, callback) => {
            // 编辑时密码可以为空（表示不修改密码）
            if (formData.id && !value) {
              callback();
            } else if (!formData.id && !value) {
              callback(new Error("请输入密码"));
            } else if (value.length < 6) {
              callback(new Error("密码长度不能少于6位"));
            } else {
              callback();
            }
          },
        },
      ],
      role: [{ required: true, message: "请选择角色", trigger: "change" }],
    };

    // 角色选项
    const roleOptions = [
      { label: "管理员", value: "admin" },
      { label: "用户", value: "user" },
    ];

    // 状态选项
    const statusOptions = [
      { label: "激活", value: "active" },
      { label: "禁用", value: "inactive" },
    ];

    // 模拟数据
    const mockUsers = [
      {
        id: 1,
        use_id: "admin_001",
        username: "admin",
        password: "admin123",
        role: "admin",
        status: "active",
      },
      {
        id: 2,
        use_id: "editor_001",
        username: "editor1",
        password: "editor123",
        role: "editor",
        status: "active",
      },
      {
        id: 3,
        use_id: "user_001",
        username: "user1",
        password: "user123",
        role: "user",
        status: "inactive",
      },
      {
        id: 4,
        use_id: "user_002",
        username: "user2",
        password: "user123",
        role: "user",
        status: "active",
      },
      {
        id: 5,
        use_id: "editor_002",
        username: "editor2",
        password: "editor123",
        role: "editor",
        status: "inactive",
      },
    ];

    // 初始化数据
    const initData = () => {
      loading.value = true;
      // 模拟API请求延迟
      setTimeout(() => {
        users.value = mockUsers;
        filteredUsers.value = mockUsers;
        pagination.total = mockUsers.length;
        loading.value = false;
      }, 500);
    };

    // 搜索用户
    const searchUsers = () => {
      loading.value = true;
      // 模拟搜索
      setTimeout(() => {
        if (!searchKeyword.value) {
          filteredUsers.value = users.value;
        } else {
          const keyword = searchKeyword.value.toLowerCase();
          filteredUsers.value = users.value.filter(
            (user) =>
              user.use_id.toLowerCase().includes(keyword) ||
              user.username.toLowerCase().includes(keyword) ||
              user.role.toLowerCase().includes(keyword)
          );
        }
        pagination.total = filteredUsers.value.length;
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

    // 打开添加用户对话框
    const openAddDialog = () => {
      dialogTitle.value = "添加用户";
      // 重置表单数据
      Object.assign(formData, {
        id: "",
        use_id: "",
        username: "",
        password: "",
        role: "",
        status: "active",
      });
      dialogVisible.value = true;
    };

    // 打开编辑用户对话框
    const openEditDialog = (user) => {
      dialogTitle.value = "编辑用户";
      // 填充表单数据（不填充密码）
      Object.assign(formData, {
        id: user.id,
        use_id: user.use_id,
        username: user.username,
        password: "",
        role: user.role,
        status: user.status,
      });
      dialogVisible.value = true;
    };

    // 提交表单
    const submitForm = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          if (formData.id) {
            // 编辑用户
            const index = users.value.findIndex(
              (user) => user.id === formData.id
            );
            if (index !== -1) {
              const updatedUser = {
                ...users.value[index],
                use_id: formData.use_id,
                username: formData.username,
                role: formData.role,
                status: formData.status,
              };

              // 只有在密码不为空时才更新密码
              if (formData.password) {
                updatedUser.password = formData.password;
              }

              users.value[index] = updatedUser;
              filteredUsers.value = [...users.value];
              ElMessage.success("用户信息更新成功");
            }
          } else {
            // 添加用户
            const newUser = {
              ...formData,
              id: Math.max(...users.value.map((user) => user.id)) + 1,
            };
            users.value.unshift(newUser);
            filteredUsers.value = [...users.value];
            pagination.total = users.value.length;
            ElMessage.success("用户添加成功");
          }
          dialogVisible.value = false;
        } else {
          ElMessage.error("请正确填写表单");
          return false;
        }
      });
    };

    // 删除用户
    const deleteUser = (user) => {
      ElMessageBox.confirm(
        `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          const index = users.value.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            users.value.splice(index, 1);
            filteredUsers.value = [...users.value];
            pagination.total = users.value.length;
            ElMessage.success("用户删除成功");
          }
        })
        .catch(() => {
          // 用户取消删除
        });
    };

    // 切换用户状态
    const toggleStatus = (user) => {
      const newStatus = user.status === "active" ? "inactive" : "active";
      const action = newStatus === "active" ? "激活" : "禁用";

      ElMessageBox.confirm(
        `确定要${action}用户 "${user.username}" 吗？`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info",
        }
      )
        .then(() => {
          const index = users.value.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            users.value[index].status = newStatus;
            filteredUsers.value = [...users.value];
            ElMessage.success(`用户已${action}`);
          }
        })
        .catch(() => {
          // 用户取消操作
        });
    };

    // 格式化角色显示
    const formatRole = (role) => {
      const roleMap = {
        admin: "管理员",
        editor: "编辑",
        user: "用户",
      };
      return roleMap[role] || role;
    };

    // 组件挂载时初始化数据
    onMounted(() => {
      initData();
    });

    return {
      filteredUsers,
      loading,
      searchKeyword,
      pagination,
      dialogVisible,
      dialogTitle,
      formData,
      formRef,
      formRules,
      roleOptions,
      statusOptions,
      searchUsers,
      handleCurrentChange,
      handleSizeChange,
      openAddDialog,
      openEditDialog,
      submitForm,
      deleteUser,
      toggleStatus,
      formatRole,
    };
  },
};
</script>

<style scoped>
.user-management-container {
  padding: 0px 20px 20px 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
/* 搜索样式  */
.search-container {
  margin-bottom: 20px; /* 卡片和表格之间留空 */
  padding: 13px; /* 卡片内边距 */
}

.search-bar {
  display: flex;
  gap: 12px; /* 输入框和按钮的间距 */
  align-items: center; /* 垂直居中 */
  justify-content: flex-start; /* 左对齐 */
}

.search-bar .el-input {
  width: 300px; /* 固定输入框宽度 */
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
  gap: 8px; /* 按钮间距 */
}

.status-active {
  color: #67c23a;
  font-weight: 500;
}

.status-inactive {
  color: #909399;
}

.operation-buttons {
  display: flex;
  gap: 10px;
}
.status-active {
  color: #67c23a;
}
.status-inactive {
  color: #909399;
}
</style>
