<template>
  <div>
    <div ref="mapContainer" class="map-container"></div>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{ place: string }>();

const mapContainer = ref<HTMLDivElement | null>(null);
const error = ref('');
// VuePress 环境变量访问方式
const GAODE_KEY = '	3e266c3a1cc478bc9146cfaa0550844a';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// 获取地理编码（带缓存）
const getGeocode = async (address: string) => {
  if (!GAODE_KEY) {
    throw new Error('API Key未配置');
  }
  
  const cacheKey = `amap_geocode_${address}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      return data;
    }
  }

  const res = await fetch(
    `https://restapi.amap.com/v3/geocode/geo?key=${GAODE_KEY}&address=${encodeURIComponent(address)}`
  );
  const json = await res.json();
  
  if (json.geocodes?.length > 0) {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: json,
      timestamp: Date.now()
    }));
    return json;
  }
  
  return null;
};

onMounted(async () => {
  if (typeof window === 'undefined') return;

  try {
    // API Key 安全检查
    if (!GAODE_KEY) {
      error.value = '高德地图API Key未配置';
      return;
    }

    const geocodeData = await getGeocode(props.place);
    if (!geocodeData?.geocodes?.length) {
      error.value = `未找到地点：${props.place}`;
      return;
    }

    const [lng, lat] = geocodeData.geocodes[0].location.split(',');

    // 动态加载SDK
    if (!(window as any).AMap) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${GAODE_KEY}`;
        script.onload = resolve;
        script.onerror = () => reject(new Error('地图SDK加载失败'));
        document.head.appendChild(script);
      });
    }

    // 创建地图实例
    const map = new (window as any).AMap.Map(mapContainer.value, {
      center: [parseFloat(lng), parseFloat(lat)],
      zoom: 17,
    });

    // 添加标记
    map.add(new (window as any).AMap.Marker({
      position: [parseFloat(lng), parseFloat(lat)],
      title: props.place,
    }));
  } catch (e: any) {
    error.value = `地图加载失败: ${e.message || '请检查网络连接'}`;
  }
});
</script>

<style scoped>
.map-container {
  height: 400px;
  width: 100%;
  margin-top: 1em;
  border: 1px solid #ccc;
}
.error {
  color: red;
  margin-top: 1em;
}
</style>