<template>
  <div class="er-model-display">
    <el-card class="display-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h5>ER模型详情</h5>
          <div class="model-meta">
            <el-tag type="info" size="small"
              >{{ model.entityCount || 0 }} 个实体</el-tag
            >
            <el-tag type="success" size="small">{{
              formatTime(model.createTime)
            }}</el-tag>
          </div>
        </div>
      </template>

      <div class="model-content">
        <!-- 基本信息 -->
        <div class="basic-info">
          <h6>基本信息</h6>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="模型名称">{{
              model.erName
            }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              formatTime(model.createTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="实体数量">{{
              model.entityCount || 0
            }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{
              model.description || "暂无描述"
            }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 实体详情 -->
        <div class="entities-info">
          <h6>实体详情</h6>
          <div v-if="parsedEntities.length > 0" class="entities-list">
            <div
              v-for="(entity, index) in parsedEntities"
              :key="index"
              class="entity-item"
            >
              <div class="entity-header">
                <h6 class="entity-name">{{ entity.name }}</h6>
                <span class="attribute-count"
                  >{{ entity.attributes.length }} 个属性</span
                >
              </div>
              <div class="attributes-list">
                <el-tag
                  v-for="attr in entity.attributes"
                  :key="attr"
                  size="small"
                  class="attribute-tag"
                  :type="getAttributeType(attr)"
                >
                  {{ attr }}
                </el-tag>
              </div>
            </div>
          </div>
          <div v-else class="empty-entities">
            <el-empty description="暂无实体信息" :image-size="80" />
          </div>
        </div>

        <!-- 原始JSON -->
        <div class="json-info">
          <h6>原始数据</h6>
          <el-card shadow="never" class="json-card">
            <div class="json-header">
              <span class="json-size"
                >JSON大小: {{ formatJsonSize(model.erJson) }}</span
              >
              <el-button size="small" @click="toggleJsonExpanded">
                {{ isJsonExpanded ? "收起" : "展开" }}
              </el-button>
            </div>
            <div v-show="isJsonExpanded" class="json-content">
              <pre class="json-text">{{ formatJson(model.erJson) }}</pre>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Props
const props = defineProps({
  model: {
    type: Object,
    required: true,
  },
});

// 响应式数据
const isJsonExpanded = ref(false);

// 计算属性
const parsedEntities = computed(() => {
  if (!props.model.erJson) return [];
  try {
    const data = JSON.parse(props.model.erJson);
    return data.entities || [];
  } catch (error) {
    console.error("解析ER JSON失败:", error);
    return [];
  }
});

// 方法
const formatTime = (timestamp) => {
  if (!timestamp) return "未知时间";
  const date = new Date(timestamp);
  return date.toLocaleString("zh-CN");
};

const formatJsonSize = (jsonString) => {
  if (!jsonString) return "0 B";
  const size = new Blob([jsonString]).size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatJson = (jsonString) => {
  if (!jsonString) return "";
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    return jsonString;
  }
};

const getAttributeType = (attr) => {
  const attrLower = attr.toLowerCase();
  if (attrLower.includes("id")) return "danger";
  if (attrLower.includes("name") || attrLower.includes("title"))
    return "primary";
  if (attrLower.includes("email")) return "warning";
  if (attrLower.includes("phone")) return "warning";
  if (attrLower.includes("date") || attrLower.includes("time")) return "info";
  if (
    attrLower.includes("price") ||
    attrLower.includes("salary") ||
    attrLower.includes("amount")
  )
    return "success";
  return "info";
};

const toggleJsonExpanded = () => {
  isJsonExpanded.value = !isJsonExpanded.value;
};
</script>

<style scoped lang="scss">
.er-model-display {
  .display-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h5 {
        margin: 0;
        color: #2c3e50;
        font-size: 14px;
        font-weight: 600;
      }

      .model-meta {
        display: flex;
        gap: 8px;
      }
    }
  }

  .model-content {
    .basic-info,
    .entities-info,
    .json-info {
      margin-bottom: 24px;

      h6 {
        margin: 0 0 16px 0;
        color: #2c3e50;
        font-size: 13px;
        font-weight: 600;
        padding-bottom: 8px;
        border-bottom: 1px solid #e4e7ed;
      }
    }

    .entities-list {
      .entity-item {
        margin-bottom: 20px;
        padding: 16px;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        background: #fafafa;

        .entity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .entity-name {
            margin: 0;
            color: #2c3e50;
            font-size: 14px;
            font-weight: 600;
          }

          .attribute-count {
            font-size: 12px;
            color: #909399;
            background: #f0f9ff;
            color: #409eff;
            padding: 2px 8px;
            border-radius: 12px;
          }
        }

        .attributes-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .attribute-tag {
            margin: 0;
          }
        }
      }
    }

    .empty-entities {
      padding: 40px 0;
      text-align: center;
    }

    .json-card {
      .json-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .json-size {
          font-size: 12px;
          color: #909399;
        }
      }

      .json-content {
        .json-text {
          margin: 0;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
          font-size: 11px;
          line-height: 1.5;
          color: #2c3e50;
          background: #f8f9fa;
          padding: 12px;
          border-radius: 4px;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 300px;
          overflow-y: auto;
        }
      }
    }
  }
}
</style>
