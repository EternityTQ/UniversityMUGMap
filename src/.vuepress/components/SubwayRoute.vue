<template>
  <div class="subway-box">
    <div v-if="loading">🚇 正在规划路线，请稍候...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="steps.length">
      <h3>推荐地铁路线：</h3>
      <ul>
        <li v-for="(step, index) in steps" :key="index">
          <span v-if="step.type === 'railway'">
            🚇 搭乘 <strong>{{ step.railway.name }}</strong> 从 {{ step.railway.departure_stop.name }} 到 {{ step.railway.arrival_stop.name }}
          </span>
          <span v-else-if="step.type === 'walk'">
            🚶 步行 {{ step.distance }} 米
          </span>
        </li>
      </ul>
      <p>预计耗时：{{ duration }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  from: string;
  to: string;
  city: string; // 城市名或城市编码
}>();

const GAODE_KEY = '3e266c3a1cc478bc9146cfaa0550844a'; // 替换为你的 key

const loading = ref(true);
const error = ref('');
const steps = ref<any[]>([]);
const duration = ref('');

const getSubwayRoute = async () => {
  try {
    // Step 1: 调用换乘规划接口
    const res = await fetch(
      `https://restapi.amap.com/v3/direction/transit/integrated?key=${GAODE_KEY}&origin=&destination=&city=${props.city}&strategy=0&nightflag=0&origin_place=${encodeURIComponent(props.from)}&destination_place=${encodeURIComponent(props.to)}`
    );

    const data = await res.json();

    if (!data.route || !data.route.transits || data.route.transits.length === 0) {
      error.value = `未找到从「${props.from}」到「${props.to}」的地铁路线`;
      return;
    }

    const bestRoute = data.route.transits[0];
    steps.value = bestRoute.segments.map((seg: any) => {
      return seg.railway ? { type: 'railway', railway: seg.railway } : { type: 'walk', distance: seg.walk?.distance || 0 };
    });
    duration.value = Math.round(Number(bestRoute.duration) / 60) + ' 分钟';

  } catch (e) {
    error.value = '请求失败，可能是网络或参数问题';
  } finally {
    loading.value = false;
  }
};

onMounted(getSubwayRoute);
</script>

<style scoped>
.subway-box {
  background: #f8f9fc;
  padding: 1em;
  border-left: 4px solid #409eff;
  border-radius: 8px;
  margin-top: 1em;
}
.error {
  color: red;
}
</style>
