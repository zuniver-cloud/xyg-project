<template>
  <div class="data-generator">
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>数据标准生成</h3>
          <span class="subtitle">选择ER模型并生成数据标准</span>
        </div>
      </template>

      <div class="generator-content">
        <!-- ER模型选择区域 -->
        <ERModelSelector
          :selected-model="selectedERModel"
          @update:selected-model="selectedERModel = $event"
        />

        <!-- ER模型详情和数据标准生成区域 -->
        <div v-if="selectedERModel && !showDataStandards" class="model-section">
          <ERModelDisplay :model="selectedERModel" class="model-display" />

          <!-- 生成数据标准按钮 -->
          <div class="action-buttons">
            <el-button
              type="primary"
              size="large"
              :loading="generating"
              @click="handleGenerateDataStandards"
            >
              <el-icon v-if="!generating"><Cpu /></el-icon>
              {{ generating ? "生成中..." : "生成数据标准" }}
            </el-button>
          </div>
        </div>

        <!-- 数据标准结果展示和编辑 -->
        <div v-if="showDataStandards && dataStandards" class="result-section">
          <DataStandardsParser
            :data-standards="dataStandards"
            :er-model="selectedERModel"
            @save-to-repository="handleSaveToRepository"
            class="standards-parser"
          />

          <!-- 返回按钮 -->
          <div class="back-actions">
            <el-button @click="handleBackToModel">
              <el-icon><Back /></el-icon>
              返回模型选择
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!selectedERModel" class="empty-state">
          <el-empty description="请先选择一个ER模型" :image-size="200">
            <template #description>
              <p>从ER模型列表中选择一个模型开始生成数据标准</p>
            </template>
          </el-empty>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { Back, Cpu } from "@element-plus/icons-vue";
import ERModelSelector from "../components/er/ERModelSelector.vue";
import ERModelDisplay from "../components/er/ERModelDisplay.vue";
import DataStandardsParser from "../components/ai/DataStandardsParser.vue";

// 选中的ER模型
const selectedERModel = ref(null);

// 数据标准生成结果
const dataStandards = ref(null);
const showDataStandards = ref(false);
const generating = ref(false);

// 生成数据标准
const handleGenerateDataStandards = async () => {
  if (!selectedERModel.value) {
    ElMessage.warning("请先选择ER模型");
    return;
  }

  generating.value = true;

  try {
    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 根据接口文档格式生成模拟数据标准
    const mockStandards = generateMockDataStandards(selectedERModel.value);

    dataStandards.value = mockStandards;
    showDataStandards.value = true;
    ElMessage.success("数据标准生成成功");
  } catch (error) {
    ElMessage.error("数据标准生成失败");
    console.error("Generate standards error:", error);
  } finally {
    generating.value = false;
  }
};

// 生成模拟数据标准
const generateMockDataStandards = (erModel) => {
  try {
    const erData = JSON.parse(erModel.erJson);
    const standards = [];

    erData.entities.forEach((entity, index) => {
      const fieldList = entity.attributes.map((attr, attrIndex) => {
        // 根据字段名生成合适的数据标准
        const fieldStandard = generateFieldStandard(attr, entity.name);
        return {
          字段英文名: attr.toUpperCase(),
          字段中文名: getChineseFieldName(attr),
          字段类型: getFieldType(attr),
          长度: getFieldLength(attr),
          小数: getFieldDecimal(attr),
          数据标准: fieldStandard.dataStandard,
          security_level: fieldStandard.securityLevel,
          category_1: fieldStandard.category1,
          category_2: fieldStandard.category2,
          category_3: fieldStandard.category3,
          category_4: fieldStandard.category4 || "/",
          category_5: fieldStandard.category5 || "/",
        };
      });

      standards.push({
        实体名: entity.name,
        字段列表: fieldList,
      });
    });

    return standards;
  } catch (error) {
    console.error("Error generating mock standards:", error);
    return [];
  }
};

// 辅助函数：生成字段标准
const generateFieldStandard = (fieldName, entityName) => {
  const fieldLower = fieldName.toLowerCase();

  if (fieldLower.includes("id")) {
    return {
      dataStandard: {
        来源: "is2010/F-PMS-系统标识管理",
        类型: "标识",
        长度: "20",
        精度: "0",
        格式: "数字或字符串",
      },
      securityLevel: 1,
      category1: "系统数据",
      category2: "标识信息",
      category3: "主键标识",
    };
  } else if (fieldLower.includes("name") || fieldLower.includes("title")) {
    return {
      dataStandard: {
        来源: "is2010/F-PMS-基础信息管理",
        类型: "文本",
        长度: "100",
        精度: "0",
        格式: "UTF-8字符串",
      },
      securityLevel: 2,
      category1: "业务数据",
      category2: "基本信息",
      category3: "名称信息",
    };
  } else if (fieldLower.includes("email")) {
    return {
      dataStandard: {
        来源: "is2010/F-PMS-联系信息管理",
        类型: "邮箱",
        长度: "255",
        精度: "0",
        格式: "email格式",
      },
      securityLevel: 3,
      category1: "个人数据",
      category2: "联系信息",
      category3: "电子邮箱",
    };
  } else if (fieldLower.includes("phone")) {
    return {
      dataStandard: {
        来源: "is2010/F-PMS-联系信息管理",
        类型: "电话",
        长度: "20",
        精度: "0",
        格式: "数字格式",
      },
      securityLevel: 3,
      category1: "个人数据",
      category2: "联系信息",
      category3: "电话号码",
    };
  } else if (fieldLower.includes("date") || fieldLower.includes("time")) {
    return {
      dataStandard: {
        来源: "is2010/F-PMS-时间管理",
        类型: "日期时间",
        长度: "19",
        精度: "0",
        格式: "YYYY-MM-DD HH:mm:ss",
      },
      securityLevel: 1,
      category1: "系统数据",
      category2: "时间信息",
      category3: "业务时间",
    };
  } else if (
    fieldLower.includes("price") ||
    fieldLower.includes("salary") ||
    fieldLower.includes("amount")
  ) {
    return {
      dataStandard: {
        来源: "is2010/F-PMS-金融数据管理",
        类型: "金额",
        长度: "15",
        精度: "2",
        格式: "数值格式",
      },
      securityLevel: 2,
      category1: "财务数据",
      category2: "金额信息",
      category3: "业务金额",
    };
  } else {
    return {
      dataStandard: {
        来源: "is2010/F-PMS-通用数据管理",
        类型: "文本",
        长度: "255",
        精度: "0",
        格式: "通用格式",
      },
      securityLevel: 1,
      category1: "业务数据",
      category2: "通用信息",
      category3: "业务字段",
    };
  }
};

// 辅助函数：获取中文字段名
const getChineseFieldName = (fieldName) => {
  const nameMap = {
    id: "标识",
    name: "名称",
    title: "标题",
    email: "邮箱",
    phone: "电话",
    address: "地址",
    age: "年龄",
    class: "班级",
    major: "专业",
    course: "课程",
    credits: "学分",
    teacher: "教师",
    semester: "学期",
    grade: "成绩",
    department: "部门",
    position: "职位",
    salary: "薪资",
    hire_date: "入职日期",
    manager: "经理",
    location: "位置",
    price: "价格",
    stock: "库存",
    category: "分类",
    description: "描述",
    customer: "客户",
    order: "订单",
    total: "总计",
    status: "状态",
    quantity: "数量",
    date: "日期",
  };

  const fieldLower = fieldName.toLowerCase();
  for (const [key, value] of Object.entries(nameMap)) {
    if (fieldLower.includes(key)) {
      return fieldLower.includes("_id") ? `${value}标识` : value;
    }
  }
  return fieldName;
};

// 辅助函数：获取字段类型
const getFieldType = (fieldName) => {
  const fieldLower = fieldName.toLowerCase();
  if (fieldLower.includes("id")) return "BIGINT";
  if (fieldLower.includes("date") || fieldLower.includes("time"))
    return "DATETIME";
  if (
    fieldLower.includes("price") ||
    fieldLower.includes("salary") ||
    fieldLower.includes("amount")
  )
    return "DECIMAL";
  if (
    fieldLower.includes("age") ||
    fieldLower.includes("credits") ||
    fieldLower.includes("stock") ||
    fieldLower.includes("quantity")
  )
    return "INT";
  return "VARCHAR";
};

// 辅助函数：获取字段长度
const getFieldLength = (fieldName) => {
  const fieldLower = fieldName.toLowerCase();
  if (fieldLower.includes("id")) return "20字符";
  if (fieldLower.includes("email")) return "255字符";
  if (fieldLower.includes("phone")) return "20字符";
  if (fieldLower.includes("address") || fieldLower.includes("description"))
    return "500字符";
  if (fieldLower.includes("name") || fieldLower.includes("title"))
    return "100字符";
  if (
    fieldLower.includes("price") ||
    fieldLower.includes("salary") ||
    fieldLower.includes("amount")
  )
    return "15,2";
  if (
    fieldLower.includes("age") ||
    fieldLower.includes("credits") ||
    fieldLower.includes("stock") ||
    fieldLower.includes("quantity")
  )
    return "11";
  return "255字符";
};

// 辅助函数：获取小数位数
const getFieldDecimal = (fieldName) => {
  const fieldLower = fieldName.toLowerCase();
  if (
    fieldLower.includes("price") ||
    fieldLower.includes("salary") ||
    fieldLower.includes("amount")
  )
    return 2;
  return null;
};

// 保存到仓库
const handleSaveToRepository = (standards) => {
  console.log("保存数据标准到仓库:", standards);
  ElMessage.success("数据标准已保存到仓库");
};

// 返回模型选择
const handleBackToModel = () => {
  showDataStandards.value = false;
  dataStandards.value = null;
};
</script>

<style scoped lang="scss">
.data-generator {
  height: 100%;
  padding: 20px;
  box-sizing: border-box;

  .main-card {
    height: 100%;

    .card-header {
      display: flex;
      flex-direction: column;
      gap: 8px;

      h3 {
        margin: 0;
        color: #2c3e50;
        font-size: 20px;
        font-weight: 600;
      }

      .subtitle {
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .generator-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .model-section {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .model-display {
        flex: 1;
      }

      .action-buttons {
        display: flex;
        justify-content: center;
        padding: 20px 0;
        border-top: 1px solid #e4e7ed;
      }
    }

    .result-section {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .standards-parser {
        flex: 1;
      }

      .back-actions {
        display: flex;
        justify-content: center;
        padding: 20px 0;
        border-top: 1px solid #e4e7ed;
      }
    }

    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.el-empty__description) {
        color: #909399;
        font-size: 14px;
      }
    }
  }
}
</style>
