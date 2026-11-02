import { createApp } from 'vue'

if (import.meta.env.VITE_STATIC_PREVIEW === 'true') {
  Promise.all([
    import('./preview/StaticPreview.vue'),
    import('./preview/preview.css')
  ]).then(([{ default: StaticPreview }]) => {
    createApp(StaticPreview).mount('#app')
  })
} else {
  Promise.all([
    import('pinia'),
    import('./App.vue'),
    import('./router'),
    import('./index.css'),
    import('leaflet/dist/leaflet.css'),
    import('leaflet.markercluster/dist/MarkerCluster.css'),
    import('leaflet.markercluster/dist/MarkerCluster.Default.css'),
    import('@/utils/storage'),
    import('@/stores/app'),
    import('@/data/regions')
  ]).then(([
    { createPinia },
    { default: App },
    { default: router },
    ,
    ,
    ,
    ,
    { applyTheme, loadSettings },
    { useAppStore },
    { ensureSettlementsLoaded }
  ]) => {
    applyTheme(loadSettings().theme)

    const app = createApp(App)
    app.use(createPinia())
    app.use(router)

    const store = useAppStore()
    Promise.all([store.initApp(), ensureSettlementsLoaded()]).finally(() => {
      app.mount('#app')
    })
  })
}
