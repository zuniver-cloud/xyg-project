<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <img src="../assets/icbc.png" alt="Logo" />
        </div>
        <h2>智能设计助手</h2>
        <p>基于大模型能力的物理表结构设计系统</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
        </el-form-item>

        <!-- 开发环境显示测试账号 -->
        <el-form-item v-if="isDev">
          <el-alert title="测试账号" type="info" :closable="false" show-icon>
            <template #default>
              <div style="font-size: 12px; line-height: 1.5">
                <div>管理员：admin / 123456</div>
                <div>普通用户：user / 123456</div>
              </div>
            </template>
          </el-alert>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-btn"
          >
            {{ loading ? "登录中..." : "登录" }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="register-link">
            还没有账号？<el-link type="primary" @click="goToRegister"
              >立即注册</el-link
            >
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { ElMessage } from "element-plus";

const router = useRouter();
const userStore = useUserStore();

const loginFormRef = ref();
const loading = ref(false);
const isDev = import.meta.env.DEV;

const loginForm = reactive({
  username: "",
  password: "",
  remember: false,
});

const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
};

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate();
    loading.value = true;

    const response = await userStore.login(loginForm);
    ElMessage.success("登录成功");

    // 根据用户角色跳转到不同的页面
    const userRole = response.userInfo.role;
    if (userRole === "admin") {
      router.push("/user-management");
    } else {
      router.push("/requirement-management/input");
    }
  } catch (error) {
    console.error("Login error:", error);
    ElMessage.error(error.message || "登录失败");
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  router.push("/register");
};
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  width: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    margin-bottom: 16px;

    img {
      width: 48px;
      height: 48px;
      border-radius: 8px;
    }
  }

  h2 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.login-form {
  .login-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }

  .register-link {
    text-align: center;
    font-size: 14px;
    color: #606266;
  }
}
</style>
