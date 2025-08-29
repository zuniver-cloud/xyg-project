<template>
  <div class="er-generator">
    <el-card class="main-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h3>ER模型生成</h3>
          <span class="subtitle">选择需求并生成ER模型</span>
        </div>
      </template>

      <div class="generator-content">
        <!-- 需求选择区域 -->
        <RequirementSelector
          :selected-requirement="selectedRequirement"
          @update:selected-requirement="selectedRequirement = $event"
        />

        <!-- 需求显示和编辑区域 -->
        <div
          v-if="selectedRequirement && !showResult"
          class="requirement-section"
        >
          <RequirementDisplay
            :requirement="selectedRequirement"
            class="requirement-display"
          />

          <RequirementEditor
            :requirement="selectedRequirement"
            @update:requirement="handleRequirementUpdate"
            class="requirement-editor"
          />

          <!-- 操作按钮 -->
          <ActionButtons
            :requirement="selectedRequirement"
            @save-to-repository="handleSaveToRepository"
            @generate-er="handleGenerateER"
            class="action-buttons"
          />
        </div>

        <!-- ER结果解析 -->
        <div v-if="showResult && erResult" class="result-section">
          <ERResultParser
            :er-data="erResult"
            :requirement="selectedRequirement"
            @save-to-repository="handleSaveToERRepository"
            class="er-result-parser"
          />

          <!-- 返回按钮 -->
          <div class="back-actions">
            <el-button @click="handleBackToEdit">
              <el-icon><Back /></el-icon>
              返回编辑
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-empty description="请先选择一个需求" :image-size="200">
            <template #description>
              <p>从需求仓库中选择一个需求开始生成ER模型</p>
            </template>
          </el-empty>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Back } from "@element-plus/icons-vue";
import RequirementSelector from "../components/er/RequirementSelector.vue";
import RequirementDisplay from "../components/er/RequirementDisplay.vue";
import RequirementEditor from "../components/er/RequirementEditor.vue";
import ActionButtons from "../components/er/ActionButtons.vue";
import ERResultParser from "../components/er/ERResultParser.vue";

// 选中的需求
const selectedRequirement = ref(null);

// ER生成结果
const erResult = ref(null);
const showResult = ref(false);

// 需求选择处理
const handleRequirementSelected = (requirement) => {
  console.log("选中需求:", requirement);
  ElMessage.success("需求选择成功");
};

// 需求更新处理
const handleRequirementUpdate = (updatedRequirement) => {
  console.log("ERGenerator: 需求更新", updatedRequirement);
  selectedRequirement.value = updatedRequirement;
};

// 保存到需求仓库
const handleSaveToRepository = async (requirement) => {
  try {
    console.log("保存到需求仓库:", requirement);
    // TODO: 调用API保存到需求仓库
    ElMessage.success("需求已保存到仓库");
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败");
  }
};

// 生成ER模型
const handleGenerateER = async (requirement) => {
  try {
    console.log("生成ER模型:", requirement);

    // 提取变量值用于生成
    const requirementArray = requirement.json_text.variables.map(
      (variable) => variable.value || variable.desc
    );

    // 模拟API调用 - 生成ER模型（完全按照接口文档格式）
    const mockERResult = {
      erId: "temp_12345",
      erName: requirement.requirement_name,
      description: `基于需求'${requirement.requirement_name}'生成的数据库设计`,
      entities: [
        {
          name: "member",
          attribute: [
            { 字段英文名: "memberid", 字段中文名: "会员id" },
            { 字段英文名: "grade", 字段中文名: "等级" },
          ],
        },
        {
          name: "order",
          attribute: [
            { 字段英文名: "orderID", 字段中文名: "订单ID" },
            { 字段英文名: "orderNumber", 字段中文名: "订单号" },
            { 字段英文名: "createTime", 字段中文名: "创建时间" },
            { 字段英文名: "updateTime", 字段中文名: "修改时间" },
          ],
        },
      ],
      relationship: [
        {
          name: "创建",
          from: "member",
          to: "订单",
          type: "1:N",
        },
      ],
      created_at: "2025-01-20 16:00:00",
    };

    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // const response = await generateERModel({
    //   template_id: 1,
    //   userId: "1000003",
    //   requirement: requirementArray
    // })
    // const mockERResult = response.data

    erResult.value = mockERResult;
    showResult.value = true;
    ElMessage.success("ER模型生成成功");

    // 生成成功后，不自动保存，让用户编辑后再保存
  } catch (error) {
    console.error("生成失败:", error);
    ElMessage.error("ER模型生成失败");
  }
};

// 返回编辑
const handleBackToEdit = () => {
  showResult.value = false;
  erResult.value = null;
};

// 保存到ER模型仓库
const handleSaveToERRepository = async (erModelData) => {
  try {
    console.log("保存到ER模型仓库:", erModelData);

    // TODO: 前后端联测时，取消注释以下真实API调用代码
    // await createERModel(erModelData)

    ElMessage.success("ER模型已保存到仓库");
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存到ER模型仓库失败");
  }
};
</script>

<style scoped lang="scss">
.er-generator {
  height: 100%;
  padding: 20px;

  .main-card {
    height: 100%;

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;

      h3 {
        margin: 0;
        color: #303133;
        font-size: 18px;
        font-weight: 600;
      }

      .subtitle {
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .generator-content {
    height: calc(100% - 60px);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .requirement-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;

    .requirement-display {
      flex: 0 0 auto;
    }

    .requirement-editor {
      flex: 1;
    }

    .action-buttons {
      flex: 0 0 auto;
    }
  }

  .result-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;

    .er-result-parser {
      flex: 1;
    }

    .back-actions {
      flex: 0 0 auto;
      display: flex;
      justify-content: center;
      padding: 16px 0;
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    p {
      color: #909399;
      margin: 0;
    }
  }
}
</style>
