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
        <a :href="store.meta.sourceUrl" target="_blank" rel="noopener" class="underline text-[#005eb8]">Canonical Data Model</a>.
        Click an entity to see its properties and links, or use
        <kbd class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono">⌘K</kbd>
        / <kbd class="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono">Ctrl K</kbd>
        to search.
      </p>
      <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span class="px-2 py-1 rounded bg-slate-100">Model version {{ store.meta.version }}</span>
        <span class="px-2 py-1 rounded bg-slate-100">
          Data fetched {{ new Date(store.meta.fetchedAt).toISOString().split('T')[0] }}
        </span>
        <router-link to="/graph" class="px-2 py-1 rounded bg-[#005eb8] text-white hover:bg-[#004280]">
          Open relationship graph →
        </router-link>
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
