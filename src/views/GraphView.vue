<script setup lang="ts">
import { ref, computed } from 'vue';
import RelationshipGraph from '@/components/RelationshipGraph.vue';
import { useCdmStore } from '@/stores/cdm';

const store = useCdmStore();
const focus = ref<string>('');

const focusOptions = computed(() => store.entities.map((e) => e.name));
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-57px)]">
    <div class="px-4 py-2 border-b border-slate-200 bg-white flex items-center gap-3 text-sm">
      <label class="text-slate-600">Focus:</label>
      <select
        v-model="focus"
        class="px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#005eb8]/30"
      >
        <option value="">All {{ store.entityCount }} entities</option>
        <option v-for="n in focusOptions" :key="n" :value="n">{{ n }}</option>
      </select>
      <span class="text-xs text-slate-500">Double-click a node to open its detail page. Drag to pan, scroll to zoom.</span>
    </div>
    <div class="flex-1 min-h-0 bg-slate-50">
      <RelationshipGraph :focus="focus || undefined" />
    </div>
  </div>
</template>
