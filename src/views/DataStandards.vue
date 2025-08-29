<template>
  <div class="data-standards">
    <div class="main-container">
      <!-- 左侧：ER模型选择区域 -->
      <div class="er-section">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon><Files /></el-icon>
            ER模型选择
          </h3>
        </div>

        <!-- 搜索框 -->
        <div class="search-container">
          <el-input
            v-model="searchForm.erName"
            placeholder="搜索ER模型..."
            clearable
            @input="searchERModels"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- ER模型列表 -->
        <div class="er-list">
          <div
            v-for="er in erModels"
            :key="er.erId"
            class="er-card"
            :class="{ active: selectedER?.erId === er.erId }"
            @click="selectER(er)"
          >
            <div class="er-header">
              <div class="er-name">
                <el-icon><Document /></el-icon>
                {{ er.erName }}
              </div>
              <el-tag type="info" size="small">{{ er.erId }}</el-tag>
            </div>
            <div class="er-preview">{{ er.description.slice(0, 80) }}...</div>
            <div class="er-meta">
              <span>{{ er.updateAt }}</span>
              <span>实体数: {{ JSON.parse(er.erJson).entities.length }}</span>
            </div>
          </div>

          <div v-if="erModels.length === 0" class="empty-state">
            <el-icon><Search /></el-icon>
            <p>未找到匹配的ER模型</p>
            <el-button type="primary" @click="resetSearch">清空搜索</el-button>
          </div>
        </div>
      </div>

      <!-- 右侧：数据标准展示区域 -->
      <div class="standards-section">
        <div v-if="selectedER" class="standards-container">
          <!-- 头部信息 -->
          <div class="standards-header">
            <div class="er-info">
              <h3 class="current-er-name">
                <el-icon><DataAnalysis /></el-icon>
                {{ selectedER.erName }}
              </h3>
              <p class="er-description">{{ selectedER.description }}</p>
            </div>
            <div class="action-buttons">
              <el-button
                type="primary"
                @click="generateDataStandards"
                :loading="generating"
                :disabled="!selectedER"
              >
                <el-icon><MagicStick /></el-icon>
                生成数据标准
              </el-button>
            </div>
          </div>

          <!-- 数据标准展示 -->
          <div class="standards-content">
            <el-card class="standards-card">
              <template #header>
                <div class="card-header">
                  <el-icon><DataAnalysis /></el-icon>
                  <span>数据标准</span>
                  <div class="card-actions" v-if="dataStandard">
                    <el-button type="text" size="small" @click="copyStandards">
                      <el-icon><CopyDocument /></el-icon>复制
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      @click="downloadStandards"
                    >
                      <el-icon><Download /></el-icon>下载
                    </el-button>
                  </div>
                </div>
              </template>

              <div class="standards-display">
                <div v-if="dataStandard" class="standards-info">
                  <div class="info-item">
                    <label>标准ID:</label>
                    <span>{{ dataStandard.standardId }}</span>
                  </div>
                  <div class="info-item">
                    <label>标准名称:</label>
                    <span>{{ dataStandard.standardName }}</span>
                  </div>
                  <div class="info-item">
                    <label>描述:</label>
                    <span>{{ dataStandard.description }}</span>
                  </div>
                </div>

                <div class="standards-json">
                  <div class="json-header">
                    <span>标准JSON</span>
                    <el-button type="text" size="small" @click="toggleJsonView">
                      {{ showFormattedJson ? "收起" : "展开" }}
                    </el-button>
                  </div>
                  <div
                    v-if="dataStandard"
                    class="json-content"
                    :class="{ expanded: showFormattedJson }"
                  >
                    <pre v-if="showFormattedJson">{{ formattedJson }}</pre>
                    <div v-else class="json-preview">
                      {{
                        dataStandard.standardJson
                          ? "点击展开查看完整JSON"
                          : "暂无数据"
                      }}
                    </div>
                  </div>
                  <div v-else class="no-data">
                    <el-icon><Document /></el-icon>
                    <p>请选择ER模型并点击"生成数据标准"</p>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-standards">
          <div class="empty-content">
            <el-icon class="empty-icon"><DataAnalysis /></el-icon>
            <h3>请选择一个ER模型</h3>
            <p>从左侧选择一个ER模型，然后生成对应的数据标准</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  Files,
  Document,
  Search,
  Refresh,
  DataAnalysis,
  MagicStick,
  CopyDocument,
  Download,
} from "@element-plus/icons-vue";
// import { getERModels, generateStandards } from "@/api/data-standards";

// 响应式数据
const searchForm = ref({
  erName: "",
});
const erModels = ref([]);
const selectedER = ref(null);
const dataStandard = ref(null);
const generating = ref(false);
const showFormattedJson = ref(false);

// 计算属性
const formattedJson = computed(() => {
  if (!dataStandard.value?.standardJson) return "";
  try {
    return JSON.stringify(JSON.parse(dataStandard.value.standardJson), null, 2);
  } catch (error) {
    return dataStandard.value.standardJson;
  }
});

// 模拟ER模型数据
const mockERModels = [
  {
    erId: "1",
    erName: "图书管理系统",
    description: "一个完整的图书管理系统ER模型，包含用户、图书、借阅等实体",
    erJson: JSON.stringify({
      entities: [
        { name: "用户", fields: ["用户ID", "用户名", "密码", "邮箱"] },
        { name: "图书", fields: ["图书ID", "书名", "作者", "ISBN", "分类"] },
        {
          name: "借阅记录",
          fields: ["借阅ID", "用户ID", "图书ID", "借阅日期", "归还日期"],
        },
      ],
    }),
    updateAt: "2025-01-15",
  },
  {
    erId: "2",
    erName: "电商系统",
    description: "电商平台的ER模型，包含商品、订单、用户、支付等核心实体",
    erJson: JSON.stringify({
      entities: [
        {
          name: "商品",
          fields: ["商品ID", "商品名称", "价格", "库存", "分类"],
        },
        {
          name: "订单",
          fields: ["订单ID", "用户ID", "订单状态", "创建时间", "总金额"],
        },
        { name: "用户", fields: ["用户ID", "用户名", "手机号", "地址"] },
        {
          name: "支付",
          fields: ["支付ID", "订单ID", "支付方式", "支付金额", "支付状态"],
        },
      ],
    }),
    updateAt: "2025-01-14",
  },
  {
    erId: "3",
    erName: "学生管理系统",
    description: "学校学生信息管理系统的ER模型",
    erJson: JSON.stringify({
      entities: [
        { name: "学生", fields: ["学号", "姓名", "性别", "年龄", "班级"] },
        { name: "课程", fields: ["课程ID", "课程名称", "学分", "授课教师"] },
        { name: "成绩", fields: ["成绩ID", "学号", "课程ID", "分数", "学期"] },
      ],
    }),
    updateAt: "2025-01-13",
  },
  {
    erId: "4",
    erName: "医院管理系统",
    description: "医院信息管理系统的ER模型",
    erJson: JSON.stringify({
      entities: [
        {
          name: "患者",
          fields: ["患者ID", "姓名", "性别", "年龄", "联系电话"],
        },
        { name: "医生", fields: ["医生ID", "姓名", "科室", "职称", "专长"] },
        {
          name: "病历",
          fields: ["病历ID", "患者ID", "医生ID", "诊断结果", "处方"],
        },
      ],
    }),
    updateAt: "2025-01-12",
  },
  {
    erId: "5",
    erName: "仓库管理系统",
    description: "企业仓库管理系统的ER模型",
    erJson: JSON.stringify({
      entities: [
        {
          name: "商品",
          fields: ["商品ID", "商品名称", "规格", "单位", "供应商"],
        },
        {
          name: "库存",
          fields: ["库存ID", "商品ID", "仓库ID", "数量", "状态"],
        },
        {
          name: "入库单",
          fields: ["入库单ID", "商品ID", "数量", "入库日期", "操作员"],
        },
      ],
    }),
    updateAt: "2025-01-11",
  },
];

// 方法
const searchERModels = async () => {
  try {
    // 模拟API请求延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filteredModels = [...mockERModels];

    // 按名称筛选
    if (searchForm.value.erName) {
      filteredModels = filteredModels.filter((model) =>
        model.erName
          .toLowerCase()
          .includes(searchForm.value.erName.toLowerCase())
      );
    }

    erModels.value = filteredModels;
  } catch (error) {
    console.error("查询ER模型失败:", error);
    ElMessage.error("查询ER模型失败");
  }
};

const resetSearch = () => {
  searchForm.value.erName = "";
  searchERModels();
};

const selectER = (er) => {
  selectedER.value = er;
  dataStandard.value = null;
  showFormattedJson.value = false;
};

const generateDataStandards = async () => {
  if (!selectedER.value) {
    ElMessage.warning("请先选择一个ER模型");
    return;
  }

  generating.value = true;
  try {
    // 模拟API请求延迟
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 根据选择的ER模型生成模拟数据标准
    const erData = JSON.parse(selectedER.value.erJson);
    const standardId = `STD_${Date.now()}`;
    const standardName = `${selectedER.value.erName}数据标准`;

    // 生成数据标准JSON
    const standardJson = {
      standardId: standardId,
      standardName: standardName,
      description: `基于${selectedER.value.erName}的数据标准规范`,
      version: "1.0",
      createTime: new Date().toISOString(),
      entities: erData.entities.map((entity) => ({
        entityName: entity.name,
        entityCode: entity.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
        fields: entity.fields.map((field) => ({
          fieldName: field,
          fieldCode: field.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
          dataType: getDataTypeByFieldName(field),
          isRequired: field.includes("ID") || field.includes("名称"),
          description: `${field}字段`,
          maxLength: getMaxLengthByFieldName(field),
        })),
      })),
      rules: [
        {
          ruleId: "RULE_001",
          ruleName: "主键规则",
          description: "所有ID字段必须为主键，不允许为空",
          type: "PRIMARY_KEY",
        },
        {
          ruleId: "RULE_002",
          ruleName: "命名规则",
          description: "字段名称必须使用中文，字段代码使用英文大写",
          type: "NAMING",
        },
        {
          ruleId: "RULE_003",
          ruleName: "数据类型规则",
          description: "根据字段名称自动推断数据类型",
          type: "DATA_TYPE",
        },
      ],
    };

    dataStandard.value = {
      standardId: standardId,
      standardName: standardName,
      description: `基于${selectedER.value.erName}的数据标准规范`,
      standardJson: JSON.stringify(standardJson, null, 2),
    };

    ElMessage.success("数据标准生成成功");
  } catch (error) {
    console.error("生成数据标准失败:", error);
    ElMessage.error("生成数据标准失败");
  } finally {
    generating.value = false;
  }
};

// 根据字段名称推断数据类型
const getDataTypeByFieldName = (fieldName) => {
  if (fieldName.includes("ID")) return "VARCHAR(32)";
  if (
    fieldName.includes("名称") ||
    fieldName.includes("书名") ||
    fieldName.includes("商品名")
  )
    return "VARCHAR(100)";
  if (fieldName.includes("密码")) return "VARCHAR(64)";
  if (fieldName.includes("邮箱")) return "VARCHAR(50)";
  if (fieldName.includes("手机号") || fieldName.includes("电话"))
    return "VARCHAR(20)";
  if (
    fieldName.includes("价格") ||
    fieldName.includes("金额") ||
    fieldName.includes("分数")
  )
    return "DECIMAL(10,2)";
  if (
    fieldName.includes("数量") ||
    fieldName.includes("库存") ||
    fieldName.includes("年龄")
  )
    return "INT";
  if (fieldName.includes("日期") || fieldName.includes("时间"))
    return "DATETIME";
  if (fieldName.includes("状态")) return "VARCHAR(20)";
  if (
    fieldName.includes("描述") ||
    fieldName.includes("结果") ||
    fieldName.includes("处方")
  )
    return "TEXT";
  return "VARCHAR(50)";
};

// 根据字段名称推断最大长度
const getMaxLengthByFieldName = (fieldName) => {
  if (fieldName.includes("ID")) return 32;
  if (
    fieldName.includes("名称") ||
    fieldName.includes("书名") ||
    fieldName.includes("商品名")
  )
    return 100;
  if (fieldName.includes("密码")) return 64;
  if (fieldName.includes("邮箱")) return 50;
  if (fieldName.includes("手机号") || fieldName.includes("电话")) return 20;
  if (fieldName.includes("状态")) return 20;
  return 50;
};

const toggleJsonView = () => {
  showFormattedJson.value = !showFormattedJson.value;
};

const copyStandards = async () => {
  if (!dataStandard.value) return;

  try {
    const text = formattedJson.value;
    await navigator.clipboard.writeText(text);
    ElMessage.success("已复制到剪贴板");
  } catch (error) {
    ElMessage.error("复制失败，请手动复制");
  }
};

const downloadStandards = () => {
  if (!dataStandard.value) return;

  const text = formattedJson.value;
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `数据标准_${
    selectedER.value.erName
  }_${new Date().toLocaleDateString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  ElMessage.success("数据标准下载成功");
};

// 生命周期
onMounted(() => {
  searchERModels();
});
</script>

<style scoped lang="scss">
.data-standards {
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

.er-section {
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
  }

  .search-container {
    margin-bottom: 15px;
    flex-shrink: 0;
  }

  .er-list {
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

    .er-card {
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

      .er-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .er-name {
          display: flex;
          align-items: center;
          font-weight: 600;

          .el-icon {
            margin-right: 8px;
            color: #67c23a;
          }
        }
      }

      .er-preview {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 8px;
      }

      .er-meta {
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

.standards-section {
  flex: 6;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
  min-height: 0;
  box-sizing: border-box;

  .standards-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px;
    overflow: hidden;
    min-height: 0;

    .standards-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-shrink: 0;

      .er-info {
        flex: 1;

        .current-er-name {
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

        .er-description {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
      }

      .action-buttons {
        flex-shrink: 0;
      }
    }

    .standards-content {
      flex: 1;
      overflow: hidden;
      min-height: 0;

      .standards-card {
        height: 100%;
        display: flex;
        flex-direction: column;

        :deep(.el-card__body) {
          flex: 1;
          overflow: auto;
          padding: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          span {
            font-weight: 600;
            color: #2c3e50;
          }

          .card-actions {
            display: flex;
            gap: 8px;
          }
        }

        .standards-display {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;

          .standards-info {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e8eaed;

            .info-item {
              display: flex;
              align-items: center;

              label {
                font-weight: 600;
                color: #2c3e50;
                min-width: 80px;
                margin-right: 12px;
              }

              span {
                color: #666;
              }
            }
          }

          .standards-json {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;

            .json-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e8eaed;

              span {
                font-weight: 600;
                color: #2c3e50;
              }
            }

            .json-content {
              flex: 1;
              overflow: auto;
              background: #f8fafc;
              border: 1px solid #e8eaed;
              border-radius: 8px;
              padding: 16px;

              &.expanded {
                pre {
                  margin: 0;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                  font-family: "Courier New", monospace;
                  font-size: 12px;
                  line-height: 1.5;
                  color: #2c3e50;
                }
              }

              .json-preview {
                color: #999;
                font-style: italic;
                text-align: center;
                padding: 20px;
              }
            }

            .no-data {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #999;
              text-align: center;

              .el-icon {
                font-size: 48px;
                margin-bottom: 16px;
              }

              p {
                margin: 0;
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }

  .empty-standards {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;

    .empty-content {
      text-align: center;
      color: #999;

      .empty-icon {
        font-size: 64px;
        margin-bottom: 24px;
        color: #ddd;
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: #666;
      }

      p {
        font-size: 14px;
        margin: 0;
        color: #999;
      }
    }
  }
}
</style>
