import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { applyTheme, loadSettings } from '@/utils/storage';
import { useAppStore } from '@/stores/app';
import { ensureSettlementsLoaded } from '@/data/regions';
applyTheme(loadSettings().theme);
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
const store = useAppStore();
Promise.all([store.initApp(), ensureSettlementsLoaded()]).finally(() => {
    app.mount('#app');
});
//# sourceMappingURL=main.js.map