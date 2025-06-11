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
const GAODE_KEY = '3e266c3a1cc478bc9146cfaa0550844a'; // 👉 替换为你的实际 key
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时缓存有效期

// 获取地理编码（带缓存）
const getGeocode = async (address: string) => {
  const cacheKey = `amap_geocode_${address}`;
  
  // 尝试从缓存获取
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      return data;
    }
  }

  // 无有效缓存时调用API
  const res = await fetch(
    `https://restapi.amap.com/v3/geocode/geo?key=${GAODE_KEY}&address=${encodeURIComponent(address)}`
  );
  const json = await res.json();
  
  if (json.geocodes && json.geocodes.length > 0) {
    // 缓存结果
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
    // Step 1: 获取地理编码（带缓存）
    const geocodeData = await getGeocode(props.place);
    if (!geocodeData || !geocodeData.geocodes || geocodeData.geocodes.length === 0) {
      error.value = `未找到地点：${props.place}`;
      return;
    }

    const location = geocodeData.geocodes[0].location; // "114.032921,22.617417"
    const [lng, lat] = location.split(',');

    // Step 2: 加载 JS SDK（仅在首次）
    if (!(window as any).AMap) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${GAODE_KEY}`;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    // Step 3: 创建地图实例
    const AMap = (window as any).AMap;
    const map = new AMap.Map(mapContainer.value, {
      center: [parseFloat(lng), parseFloat(lat)],
      zoom: 17,
    });

    // Step 4: 添加标记
    const marker = new AMap.Marker({
      position: [parseFloat(lng), parseFloat(lat)],
      title: props.place,
    });
    map.add(marker);
  } catch (e) {
    error.value = '地图加载失败，请检查网络或API KEY配置';
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