<script setup lang="ts">
import { useCdmStore } from '@/stores/cdm';
import { computed } from 'vue';

const store = useCdmStore();

const grouped = computed(() => {
  const map: Record<string, typeof store.entities> = {};
  for (const e of store.entities) {
    const letter = e.name[0].toUpperCase();
    (map[letter] ||= []).push(e);
  }
  return Object.keys(map)
    .sort()
    .map((letter) => ({ letter, entities: map[letter] }));
});
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">FDP Canonical Data Model Explorer</h1>
      <p class="mt-2 text-slate-600 max-w-3xl">
        Browse the {{ store.entityCount }} entities, {{ store.propertyCount.toLocaleString() }} properties and
        {{ store.relationshipCount }} relationships of the NHS England Federated Data Platform
        <a :href="store.meta.repoUrl" target="_blank" rel="noopener" class="underline text-[#005eb8]">Canonical Data Model</a>.
        Click an entity to see its properties and links, or use
        <kbd class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono">⌘K</kbd>
        / <kbd class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono">Ctrl K</kbd>
        to search.
      </p>
      <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span class="px-2 py-1 rounded bg-slate-100 text-slate-500">Model version {{ store.meta.version }}</span>
        <span class="px-2 py-1 rounded bg-slate-100 text-slate-500">
          Data fetched {{ new Date(store.meta.fetchedAt).toISOString().split('T')[0] }}
        </span>
        <a
          :href="store.meta.schemaYamlUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:border-[#005eb8] hover:text-[#005eb8]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-3.5 h-3.5" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>
          Schema YAML
        </a>
        <a
          :href="store.meta.pdfUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:border-[#005eb8] hover:text-[#005eb8]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-3.5 h-3.5" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm6.5 9v-3h1V9h-2v4h1zm-4-3h1v3h-1v-3zm.5-1h1.5a1 1 0 011 1v1a1 1 0 01-1 1H7v1H6v-4h1zm0 2h1v-1H7v1zm6 0a1 1 0 00-1-1v3a1 1 0 001-1v-1z" clip-rule="evenodd" /></svg>
          Data spec (PDF)
        </a>
      </div>
    </header>

    <section v-for="group in grouped" :key="group.letter" class="mb-6">
      <h2 class="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-2">{{ group.letter }}</h2>
      <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <router-link
          v-for="e in group.entities"
          :key="e.name"
          :to="{ name: 'entity', params: { name: e.name } }"
          class="block border border-slate-200 rounded-lg bg-white hover:border-[#005eb8] hover:shadow-sm transition px-3 py-2.5"
        >
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900 truncate">{{ e.name }}</span>
            <span class="text-[10px] text-slate-400 font-mono">{{ e.properties.length }}p · {{ e.relationships.length }}r</span>
          </div>
          <p v-if="e.description" class="mt-1 text-xs text-slate-500 line-clamp-2">{{ e.description }}</p>
        </router-link>
      </div>
    </section>
  </div>
</template>
