<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑数据标准"
    width="800px"
    :before-close="handleClose"
  >
    <div class="editor-content">
      <el-form
        ref="formRef"
        :model="editingStandard"
        :rules="formRules"
        label-width="120px"
        class="standard-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标准名称" prop="name">
              <el-input
                v-model="editingStandard.name"
                placeholder="请输入标准名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标准描述" prop="description">
              <el-input
                v-model="editingStandard.description"
                placeholder="请输入标准描述"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">标准内容</el-divider>

        <el-form-item label="标准内容" prop="content">
          <el-input
            v-model="editingStandard.content"
            type="textarea"
            :rows="8"
            placeholder="请输入数据标准内容..."
          />
        </el-form-item>

        <el-divider content-position="left">其他信息</el-divider>

        <el-form-item label="更新时间" prop="updateAt">
          <el-input
            v-model="editingStandard.updateAt"
            placeholder="更新时间"
            readonly
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { updateStandard } from "@/api/standard";

// 定义props和emits
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  standardData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:visible", "success"]);

// 计算属性：控制对话框显示
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

// 响应式数据
const editingStandard = ref({});
const formRef = ref(null);
const saving = ref(false);

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: "请输入标准名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  description: [{ required: true, message: "请输入标准描述", trigger: "blur" }],
  content: [{ required: true, message: "请输入标准内容", trigger: "blur" }],
};

// 监听标准数据变化，初始化编辑数据
watch(
  () => props.standardData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      editingStandard.value = {
        ...newData,
        updateAt: new Date().toLocaleString(),
      };
    } else {
      // 创建新的标准
      editingStandard.value = {
        name: "",
        description: "",
        content: "",
        updateAt: new Date().toLocaleString(),
      };
    }
  },
  { immediate: true }
);

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 保存数据标准
const handleSave = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    saving.value = true;

    // 调用真实API保存数据标准
    const response = await updateStandard({
      standardId: editingStandard.value.id,
      standardName: editingStandard.value.name,
      description: editingStandard.value.description || "",
      standardJson: editingStandard.value.content,
    });

    if (response.code === 0 || response.code === "0") {
      // 更新修改时间
      editingStandard.value.updateAt = new Date().toLocaleString();

      // 发送成功事件
      emit("success", { ...editingStandard.value });

      // 关闭对话框
      dialogVisible.value = false;

      ElMessage.success("数据标准保存成功");
    } else {
      ElMessage.error(response.msg || "保存失败");
    }
  } catch (error) {
    console.error("Save standard error:", error);
    if (error !== "cancel") {
      ElMessage.error("保存失败，请检查表单");
    }
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped lang="scss">
.editor-content {
  .standard-form {
    .el-divider {
      margin: 20px 0;

      :deep(.el-divider__text) {
        font-size: 14px;
        font-weight: 600;
        color: #606266;
      }
    }

    .el-form-item {
      margin-bottom: 20px;
    }

    .el-textarea {
      :deep(.el-textarea__inner) {
        font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
        font-size: 13px;
        line-height: 1.5;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
  padding-top: 20px;
}
</style>
