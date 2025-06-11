<template>
  <div>
    <div ref="mapContainer" class="map-container" v-show="mapReady"></div>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
const props = defineProps<{ place: string }>();

let L: any = null;
const map = ref<any>(null);
const mapContainer = ref<HTMLDivElement | null>(null);
const mapReady = ref(false);
const error = ref('');

onMounted(async () => {
  if (!props.place) {
    error.value = '未提供地点';
    return;
  }

  await searchAndShowMap(props.place);
});

async function searchAndShowMap(query: string) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!data || data.length === 0) {
      error.value = `未找到地点：${query}`;
      return;
    }

    const { lat, lon, display_name } = data[0];

    await nextTick();
    if (!L) L = await import('leaflet');

    mapReady.value = true;

    if (!map.value) {
      map.value = L.map(mapContainer.value!).setView([lat, lon], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value);
    } else {
      map.value.setView([lat, lon], 16);
    }

    L.marker([lat, lon]).addTo(map.value).bindPopup(display_name).openPopup();
  } catch (e) {
    error.value = '地图加载失败，请稍后再试';
  }
}
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
