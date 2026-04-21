<script setup lang="ts">
import { computed } from 'vue';
import { useCdmStore } from '@/stores/cdm';

defineEmits<{ (e: 'open-search'): void }>();

const store = useCdmStore();
const fetchedLabel = computed(() => {
  const d = new Date(store.meta.fetchedAt);
  return Number.isNaN(d.getTime()) ? store.meta.fetchedAt : d.toISOString().split('T')[0];
});
</script>

<template>
  <header class="border-b border-slate-200 bg-white sticky top-0 z-30">
    <div class="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-4">
      <router-link to="/" class="flex items-center gap-2 font-semibold text-slate-900">
        <span class="inline-flex items-center justify-center w-7 h-7 rounded bg-[#005eb8] text-white text-xs font-bold">CDM</span>
        <span>FDP Explorer</span>
      </router-link>

      <nav class="hidden sm:flex items-center gap-1 text-sm ml-2">
        <router-link to="/" class="px-3 py-1.5 rounded hover:bg-slate-100" active-class="bg-slate-100 text-slate-900" exact-active-class="bg-slate-100">Entities</router-link>
        <router-link to="/graph" class="px-3 py-1.5 rounded hover:bg-slate-100" active-class="bg-slate-100 text-slate-900">Graph</router-link>
      </nav>

      <button
        type="button"
        class="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
        @click="$emit('open-search')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 opacity-70" fill="currentColor"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" /></svg>
        <span class="hidden sm:inline">Search</span>
        <kbd class="hidden sm:inline px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-500">⌘K</kbd>
      </button>

      <div class="hidden lg:flex items-center gap-2 text-xs text-slate-500">
        <span class="px-2 py-1 rounded bg-slate-100">v{{ store.meta.version }}</span>
        <span>fetched {{ fetchedLabel }}</span>
        <a :href="store.meta.sourceUrl" target="_blank" rel="noopener" class="underline hover:text-slate-700">source</a>
      </div>
    </div>
  </header>
</template>
