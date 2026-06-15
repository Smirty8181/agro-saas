<template>
  <div class="min-h-screen bg-field-gradient text-[#342d1e]">
    <RouterView v-slot="{ Component }">
      <component :is="layoutEnabled ? LayoutShell : Component">
        <template v-if="layoutEnabled" #default>
          <component :is="Component" />
        </template>
      </component>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LayoutShell from '@/components/LayoutShell.vue'

const route = useRoute()
const layoutEnabled = computed(() => route.meta.layout !== 'empty')
</script>
