<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCdmStore } from '@/stores/cdm';

const store = useCdmStore();
const filter = ref('');

const visible = computed(() => {
  const q = filter.value.trim().toLowerCase();
  if (!q) return store.entities;
  return store.entities.filter((e) => e.name.toLowerCase().includes(q));
});
</script>

<template>
  <aside class="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
    <div class="p-3 border-b border-slate-100">
      <input
        v-model="filter"
        type="search"
        placeholder="Filter entities…"
        class="w-full px-2 py-1.5 text-sm rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005eb8]/30 focus:border-[#005eb8]"
      />
    </div>
    <div class="flex-1 overflow-auto">
      <ul class="py-1 text-sm">
        <li v-for="e in visible" :key="e.name">
          <router-link
            :to="{ name: 'entity', params: { name: e.name } }"
            class="flex items-center justify-between gap-2 px-3 py-1.5 hover:bg-slate-50"
            active-class="bg-[#005eb8]/10 text-[#004280] font-medium"
          >
            <span class="truncate">{{ e.name }}</span>
            <span class="text-[10px] text-slate-400 shrink-0">{{ e.relationships.length }}</span>
          </router-link>
        </li>
        <li v-if="!visible.length" class="px-3 py-2 text-xs text-slate-400">No matches.</li>
      </ul>
    </div>
    <div class="px-3 py-2 text-[11px] text-slate-500 border-t border-slate-100">
      {{ store.entityCount }} entities · {{ store.relationshipCount }} links
    </div>
  </aside>
</template>
