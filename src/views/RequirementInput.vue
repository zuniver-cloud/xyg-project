<template>
  <div class="requirement-input">
    <div class="main-container">
      <!-- 左侧：模板选择区域 -->
      <div class="template-section">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon><Files /></el-icon>
            需求模板库
          </h3>
          <div class="template-tabs">
            <el-button
              :type="showMyTemplates ? 'default' : 'primary'"
              size="small"
              @click="showMyTemplates = false"
            >
              系统模板
            </el-button>
            <el-button
              :type="showMyTemplates ? 'primary' : 'default'"
              size="small"
              @click="showMyTemplates = true"
            >
              我的需求
            </el-button>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-container">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索模板..."
            clearable
            @input="filterTemplates"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 模板列表 -->
        <div class="template-list">
          <div
            v-for="template in filteredTemplates"
            :key="template.template_id"
            class="template-card"
            :class="{
              active: currentTemplate?.template_id === template.template_id,
            }"
            @click="selectTemplate(template)"
          >
            <div class="template-header">
              <div class="template-name">
                <el-icon><Document /></el-icon>
                {{ template.template_name }}
              </div>
              <el-tag v-if="template.is_custom" type="success" size="small"
                >自定义</el-tag
              >
            </div>
            <div class="template-preview">
              {{ template.json_text.raw_text.slice(0, 80) }}...
            </div>
            <div class="template-meta">
              <span>{{ template.published_at }}</span>
              <span>发布者: {{ template.publisher }}</span>
            </div>
          </div>

          <div v-if="filteredTemplates.length === 0" class="empty-state">
            <el-icon><Search /></el-icon>
            <p>未找到匹配的模板</p>
            <el-button type="primary" @click="searchKeyword = ''"
              >清空搜索</el-button
            >
          </div>
        </div>
      </div>

      <!-- 右侧：需求编辑区域 -->
      <div class="editor-section">
        <div v-if="currentTemplate" class="editor-container">
          <!-- 编辑器头部 -->
          <div class="editor-header">
            <div class="template-info">
              <h3 class="current-template-name">
                <el-icon><Edit /></el-icon>
                {{ currentTemplate.template_name }}
              </h3>
            </div>
            <div class="action-buttons">
              <el-button
                type="primary"
                @click="previewRequirement"
                :disabled="!isFormValid"
              >
                <el-icon><View /></el-icon>预览文档
              </el-button>
              <el-button
                type="success"
                @click="saveToMyTemplates"
                :disabled="!isFormValid"
              >
                <el-icon><Star /></el-icon>保存到我的需求
              </el-button>
            </div>
          </div>

          <!-- 编辑器内容区域 -->
          <div class="editor-content">
            <!-- 模板内容展示和编辑 -->
            <div class="template-editor">
              <el-card class="template-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><EditPen /></el-icon>
                    <span>模板内容编辑</span>
                  </div>
                </template>
                <div class="template-content">
                  <div class="content-text">
                    <span v-for="(part, index) in parsedTemplate" :key="index">
                      <template v-if="part.type === 'text'">
                        {{ part.value }}
                      </template>
                      <template v-else>
                        <input
                          v-model="part.value"
                          :placeholder="part.placeholder"
                          :style="{
                            width:
                              getInputWidth(part.value || part.placeholder) +
                              'px',
                          }"
                          class="underline-input"
                          @input="updatePreview"
                        />
                      </template>
                    </span>
                  </div>
                </div>
              </el-card>
            </div>

            <!-- 实时预览 -->
            <div class="preview-section">
              <el-card class="preview-card">
                <template #header>
                  <div class="preview-header">
                    <div>
                      <el-icon><View /></el-icon> <span>实时预览</span>
                    </div>

                    <div class="preview-actions">
                      <el-button type="text" size="small" @click="copyPreview">
                        <el-icon><CopyDocument /></el-icon>复制
                      </el-button>
                      <el-button
                        type="text"
                        size="small"
                        @click="downloadDocument"
                      >
                        <el-icon><Download /></el-icon>下载
                      </el-button>
                    </div>
                  </div>
                </template>

                <div class="preview-content">
                  <div class="preview-text" v-html="formattedPreview"></div>
                </div>
              </el-card>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-editor">
          <div class="empty-content">
            <el-icon class="empty-icon"><Document /></el-icon>
            <h3>请选择一个模板开始编辑</h3>
            <p>从左侧选择一个需求模板，然后填写相关信息</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存需求对话框 -->
    <el-dialog v-model="saveDialogVisible" title="保存到我的需求" width="500px">
      <el-form :model="saveForm" :rules="saveRules" ref="saveFormRef">
        <el-form-item label="需求名称" prop="name">
          <el-input
            v-model="saveForm.name"
            placeholder="请输入需求名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="需求描述" prop="description">
          <el-input
            v-model="saveForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入需求描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSaveTemplate">保存</el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="需求文档预览"
      width="800px"
    >
      <div class="preview-dialog-content">
        <div class="preview-document" v-html="formattedPreview"></div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyPreview">复制文档</el-button>
        <el-button type="success" @click="downloadDocument">下载文档</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Document,
  Files,
  Search,
  Edit,
  View,
  Star,
  EditPen,
  CopyDocument,
  Download,
} from "@element-plus/icons-vue";

// 模板数据 - 模拟后端接口返回的数据结构
const templates = ref([
  {
    template_id: 101,
    template_name: "ER表设计模板",
    context: "该模板用于ER设计",
    json_text: {
      raw_text: "请设计一张{表名}表，包含字段{字段集合}。",
      variables: [
        { name: "表名", desc: "数据库表的名称", value: "" },
        { name: "字段集合", desc: "字段及数据类型", value: "" },
      ],
    },
    publisher: "admin",
    published_at: "2025-08-20 10:12:30",
    last_modified: "2025-08-20 11:45:10",
  },
  {
    template_id: 102,
    template_name: "通用需求模板",
    context: "适用于一般软件功能需求描述",
    json_text: {
      raw_text:
        "这是{需求名称}的需求说明书，开发人员需要完成{开发任务}，并在{截止日期}前交付。项目负责人为{负责人}，优先级为{优先级}。",
      variables: [
        { name: "需求名称", desc: "请输入需求名称", value: "" },
        { name: "开发任务", desc: "请详细描述开发任务", value: "" },
        { name: "截止日期", desc: "请选择截止日期", value: "" },
        { name: "负责人", desc: "请输入负责人姓名", value: "" },
        { name: "优先级", desc: "请选择优先级", value: "" },
      ],
    },
    publisher: "admin",
    published_at: "2025-01-15 09:30:00",
    last_modified: "2025-01-15 09:30:00",
  },
  {
    template_id: 103,
    template_name: "接口需求模板",
    context: "适用于API接口功能需求描述",
    json_text: {
      raw_text:
        "接口{接口名称}的功能描述如下：{接口功能}。输入参数包括{参数说明}，返回结果为{返回值说明}。接口地址为{接口地址}，请求方式为{请求方式}。",
      variables: [
        { name: "接口名称", desc: "请输入接口名称", value: "" },
        { name: "接口功能", desc: "请描述接口功能", value: "" },
        { name: "参数说明", desc: "请说明输入参数", value: "" },
        { name: "返回值说明", desc: "请说明返回值", value: "" },
        { name: "接口地址", desc: "请输入接口地址", value: "" },
        { name: "请求方式", desc: "请选择请求方式", value: "" },
      ],
    },
    publisher: "admin",
    published_at: "2025-01-10 08:15:00",
    last_modified: "2025-01-10 08:15:00",
  },
]);

// 我的需求
const myRequirements = ref([]);

// 响应式数据
const searchKeyword = ref("");
const currentTemplate = ref(null);
const parsedTemplate = ref([]);
const showMyTemplates = ref(false);
const saveDialogVisible = ref(false);
const previewDialogVisible = ref(false);
const saveForm = ref({ name: "", description: "" });
const saveFormRef = ref(null);

const saveRules = {
  name: [
    { required: true, message: "请输入模板名称", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "模板名称长度在 2 到 50 个字符",
      trigger: "blur",
    },
  ],
};

// 计算属性
const filteredTemplates = computed(() => {
  const templateList = showMyTemplates.value
    ? myRequirements.value
    : templates.value;
  if (!searchKeyword.value) return templateList;

  return templateList.filter(
    (template) =>
      template.template_name
        .toLowerCase()
        .includes(searchKeyword.value.toLowerCase()) ||
      template.json_text.raw_text
        .toLowerCase()
        .includes(searchKeyword.value.toLowerCase()) ||
      template.context
        ?.toLowerCase()
        .includes(searchKeyword.value.toLowerCase())
  );
});

const isFormValid = computed(() => {
  return parsedTemplate.value.every(
    (part) =>
      part.type === "text" ||
      (part.value && part.value.toString().trim() !== "")
  );
});

const formattedPreview = computed(() => {
  if (!currentTemplate.value) return "";

  return parsedTemplate.value
    .map((part) => {
      if (part.type === "text") {
        return part.value;
      } else {
        const value = part.value || `[${part.placeholder}]`;
        return `<span class="highlight">${value}</span>`;
      }
    })
    .join("");
});

// 生成纯文本内容，用于保存
const plainTextContent = computed(() => {
  if (!currentTemplate.value) return "";

  return parsedTemplate.value
    .map((part) => {
      if (part.type === "text") {
        return part.value;
      } else {
        return part.value || `[${part.placeholder}]`;
      }
    })
    .join("");
});

// 方法
const filterTemplates = () => {
  // 搜索逻辑已在计算属性中处理
};

const selectTemplate = (template) => {
  currentTemplate.value = template;
  parseTemplate(template.json_text.raw_text);
};

const parseTemplate = (content) => {
  parsedTemplate.value = [];

  // 使用正则表达式解析模板内容，处理 {变量名} 格式
  const regex = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // 添加文本部分
    if (match.index > lastIndex) {
      parsedTemplate.value.push({
        type: "text",
        value: content.slice(lastIndex, match.index),
      });
    }

    // 添加输入部分
    parsedTemplate.value.push({
      type: "input",
      placeholder: match[1],
      value: "",
    });

    lastIndex = regex.lastIndex;
  }

  // 添加剩余的文本部分
  if (lastIndex < content.length) {
    parsedTemplate.value.push({
      type: "text",
      value: content.slice(lastIndex),
    });
  }
};

const updatePreview = () => {
  // 预览更新逻辑已在计算属性中处理
};

// 计算输入框宽度，使其等于文字的长度
const getInputWidth = (text) => {
  if (!text) return 80; // 最小宽度

  // 创建一个临时元素来测量文字宽度
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font =
    '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  const textWidth = context.getTextMetrics
    ? context.getTextMetrics(text).width
    : context.measureText(text).width;

  // 返回文字宽度加上一些padding，确保有足够空间
  return Math.max(textWidth + 24, 80);
};

const previewRequirement = () => {
  if (!isFormValid.value) {
    ElMessage.warning("请先填写完整的表单信息");
    return;
  }
  previewDialogVisible.value = true;
};

const saveToMyTemplates = () => {
  if (!isFormValid.value) {
    ElMessage.warning("请先填写完整的表单信息");
    return;
  }

  saveForm.value.name = `${
    currentTemplate.value.template_name
  } - ${new Date().toLocaleDateString()}`;
  saveForm.value.description = "";
  saveDialogVisible.value = true;
};

const confirmSaveTemplate = async () => {
  try {
    await saveFormRef.value.validate();

    const newRequirement = {
      template_id: Date.now(),
      template_name: saveForm.value.name,
      context: saveForm.value.description,
      json_text: {
        raw_text: plainTextContent.value,
        variables: parsedTemplate.value
          .filter((part) => part.type === "input")
          .map((part) => ({
            name: part.placeholder,
            desc: part.placeholder,
            value: part.value,
          })),
      },
      publisher: "user",
      published_at: new Date().toLocaleDateString(),
      last_modified: new Date().toLocaleDateString(),
      is_custom: true,
    };

    myRequirements.value.unshift(newRequirement);
    saveDialogVisible.value = false;
    ElMessage.success("需求已保存到我的需求库");
  } catch (error) {
    console.error("保存需求失败:", error);
  }
};

const copyPreview = async () => {
  try {
    await navigator.clipboard.writeText(plainTextContent.value);
    ElMessage.success("已复制到剪贴板");
  } catch (error) {
    ElMessage.error("复制失败，请手动复制");
  }
};

const downloadDocument = () => {
  const blob = new Blob([plainTextContent.value], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${
    currentTemplate.value.template_name
  }-${new Date().toLocaleDateString()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  ElMessage.success("文档下载成功");
};
</script>

<style scoped lang="scss">
.requirement-input {
  height: calc(100vh - 102px);
}

.main-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08);
  height: 100%;
}

.template-section {
  flex: 4;
  height: 100%;
  padding: 24px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
  overflow: hidden;
  box-sizing: border-box;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-shrink: 0;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      display: flex;
      align-items: center;
      margin: 0;

      .el-icon {
        margin-right: 8px;
        font-size: 18px;
        color: #409eff;
      }
    }

    .template-tabs {
      display: flex;
      gap: 6px;
    }
  }

  .search-container {
    margin-bottom: 15px;
    flex-shrink: 0;
  }

  .template-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    padding-top: 5px;
    /* 隐藏滚动条 */
    &::-webkit-scrollbar {
      width: 0;
      display: none;
    }

    .template-card {
      margin-bottom: 12px;
      padding: 16px;
      border: 1px solid #e8eaed;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #fff;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
        transform: translateY(-1px);
      }

      &.active {
        border-color: #409eff;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
      }

      .template-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .template-name {
          display: flex;
          align-items: center;
          font-weight: 600;

          .el-icon {
            margin-right: 8px;
            color: #67c23a;
          }
        }
      }

      .template-preview {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 8px;
      }

      .template-meta {
        font-size: 12px;
        color: #999;
        display: flex;
        justify-content: space-between;
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 0;
      color: #999;

      .el-icon {
        font-size: 40px;
        margin-bottom: 10px;
      }

      p {
        margin-bottom: 20px;
      }
    }
  }
}

.editor-section {
  flex: 6;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
  min-height: 0;
  box-sizing: border-box;

  .editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow: hidden;
    min-height: 0;

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 16px;
      flex-shrink: 0;

      .template-info {
        flex: 1;
        margin-right: 20px;

        .current-template-name {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          display: flex;
          align-items: center;
          margin: 0 0 8px 0;

          .el-icon {
            margin-right: 8px;
            font-size: 20px;
            color: #409eff;
          }
        }
      }
    }

    .editor-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow: hidden;
      min-height: 0;

      .template-editor {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;

        .template-card {
          flex: 1;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;

          :deep(.el-card__header) {
            padding: 10px;
            flex-shrink: 0;
          }

          :deep(.el-card__body) {
            padding: 10px;
            background: #f8fafc;
            flex: 1;
            overflow: hidden;
            min-height: 0;
            display: flex;
            flex-direction: column;
            text-align: left;
          }

          .card-header {
            display: flex;
            align-items: center;
            flex-shrink: 0;

            .el-icon {
              margin-right: 8px;
              font-size: 16px;
              color: #409eff;
            }

            span {
              font-size: 15px;
              font-weight: 600;
              color: #2c3e50;
            }
          }

          .template-content {
            flex: 1;
            border-radius: 10px;
            padding: 10px;
            overflow-y: auto;
            overflow-x: auto;
            min-height: 0;
            background: #f8fafc;
            text-align: left;

            /* 隐藏滚动条 */
            &::-webkit-scrollbar {
              width: 0;
              display: none;
            }

            .content-text {
              font-size: 15px;
              line-height: 1.8;
              color: #2c3e50;
              white-space: pre-wrap;
              word-break: break-word;
              text-align: left;

              .underline-input {
                display: inline-block;
                border: none;
                border-bottom: 2px solid #409eff;
                background: transparent;
                outline: none;
                font-size: 15px;
                color: #2c3e50;
                padding: 2px 4px;
                margin: 0 2px;
                min-width: 60px;
                width: auto;
                text-align: center;
                transition: border-bottom-color 0.3s ease;

                &:focus {
                  border-bottom-color: #67c23a;
                }

                &::placeholder {
                  color: #c0c4cc;
                  font-style: italic;
                  text-align: center;
                }
              }
            }
          }
        }
      }

      .preview-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;

        .preview-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          min-height: 0;

          :deep(.el-card__header) {
            padding: 10px;
            flex-shrink: 0;
          }

          :deep(.el-card__body) {
            padding: 10px;
            background: #f8fafc;
            flex: 1;
            overflow: hidden;
            min-height: 0;
            display: flex;
            flex-direction: column;
            text-align: left;
          }

          .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;

            .el-icon {
              margin-right: 8px;
              font-size: 16px;
              color: #409eff;
            }

            span {
              font-size: 15px;
              font-weight: 600;
              color: #2c3e50;
            }

            .preview-actions {
              display: flex;
              gap: 8px;
            }
          }

          .preview-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 20px;
            background: #f8fafc;
            min-height: 0;
            border-radius: 8px;
            text-align: left;

            /* 隐藏滚动条 */
            &::-webkit-scrollbar {
              width: 0;
              display: none;
            }

            .preview-text {
              font-size: 14px;
              color: #2c3e50;
              line-height: 1.8;
              white-space: pre-wrap;
              word-break: break-word;
              text-align: left;

              .highlight {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                padding: 3px 8px;
                border-radius: 6px;
                font-weight: 500;
                color: #92400e;
                box-shadow: 0 1px 3px rgba(146, 64, 14, 0.2);
              }
            }
          }
        }
      }
    }
  }

  .empty-editor {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fafbfc;

    .empty-content {
      text-align: center;
      padding: 40px;

      .empty-icon {
        font-size: 64px;
        color: #cbd5e0;
        margin-bottom: 20px;
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #4a5568;
        margin-bottom: 12px;
      }

      p {
        font-size: 14px;
        color: #718096;
        margin-bottom: 0;
        line-height: 1.6;
      }
    }
  }
}

.preview-dialog-content {
  padding: 20px;

  .preview-document {
    font-size: 14px;
    color: #333;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;

    .highlight {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
      color: #92400e;
    }
  }
}
</style>
