<template>
  <button @click="navigate" class="nav-button">
    打开高德地图导航：{{ name || place }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  place: string;
  name?: string;
}>();

const GAODE_KEY = '3e266c3a1cc478bc9146cfaa0550844a'; // 必须填你高德 Web API 的 key

const navigate = async () => {
  try {
    const res = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?key=${GAODE_KEY}&address=${encodeURIComponent(props.place)}`
    );
    const json = await res.json();

    if (!json.geocodes || json.geocodes.length === 0) {
      alert(`未找到地址：${props.place}`);
      return;
    }

    const location = json.geocodes[0].location;
    const [lng, lat] = location.split(',');

    // 构造高德 URI（适配 App）
    const url = `androidamap://route?sourceApplication=街机导航&dlat=${lat}&dlon=${lng}&dname=${encodeURIComponent(props.name ?? props.place)}&dev=0&t=0`;

    // iOS 也支持：iosamap://route?...
    // 兜底用 H5 页面跳转（在微信/浏览器中也能打开）
    const fallback = `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(props.name ?? props.place)}&key=${GAODE_KEY}`;

    // 优先打开原生 App 协议
    if (/android|iphone|ipad/i.test(navigator.userAgent)) {
      window.location.href = url;

      // 设置一个延迟跳转兜底页面（避免无 App 的情况）
      setTimeout(() => {
        window.location.href = fallback;
      }, 2000);
    } else {
      // PC端直接跳 fallback 网页导航
      window.open(fallback, '_blank');
    }
  } catch (e) {
    alert('导航失败，请稍后重试');
  }
};
</script>

<style scoped>
.nav-button {
  display: inline-block;
  margin-top: 1em;
  padding: 0.6em 1.2em;
  background-color: #1677ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
}
.nav-button:hover {
  background-color: #409eff;
}
</style>
