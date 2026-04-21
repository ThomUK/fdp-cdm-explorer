<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import EntitySidebar from '@/components/EntitySidebar.vue';
import SearchPalette from '@/components/SearchPalette.vue';
import { useRoute } from 'vue-router';

const searchOpen = ref(false);
const route = useRoute();
</script>

<template>
  <AppHeader @open-search="searchOpen = true" />
  <div class="flex flex-1 min-h-0">
    <EntitySidebar v-if="route.name !== 'graph'" class="hidden md:block" />
    <main class="flex-1 min-w-0 overflow-auto">
      <router-view />
    </main>
  </div>
  <SearchPalette v-model:open="searchOpen" />
</template>
