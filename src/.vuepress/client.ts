import { defineClientConfig } from 'vuepress/client';
import ArcadeMap from './components/ArcadeMap.vue';
import NavigateButton from './components/NavigateButton.vue';
import SubwayRoute from './components/SubwayRoute.vue';
import 'leaflet/dist/leaflet.css';

export default defineClientConfig({
  enhance: ({ app, router, siteData }) => {
    app.component("ArcadeMap", ArcadeMap);
    app.component('NavigateButton', NavigateButton);
    app.component('SubwayRoute', SubwayRoute)
  },
});
