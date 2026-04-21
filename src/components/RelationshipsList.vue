<script setup lang="ts">
import type { Relationship } from '@/types';
import { useCdmStore } from '@/stores/cdm';
import { computed } from 'vue';

const props = defineProps<{ entityName: string; relationships: Relationship[] }>();

const store = useCdmStore();

const inbound = computed(() => store.inboundByTarget[props.entityName] ?? []);

function exists(name: string): boolean {
  return Boolean(store.byName[name]);
}
</script>

<template>
  <section class="grid gap-6 md:grid-cols-2">
    <div>
      <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
        Outbound ({{ relationships.length }})
      </h2>
      <ul class="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
        <li v-for="r in relationships" :key="r.name" class="px-3 py-2 text-sm flex items-center gap-2">
          <span class="font-mono text-slate-900 truncate">{{ r.name }}</span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0"
            :class="r.cardinality === 'many' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'"
          >
            {{ r.cardinality }}
          </span>
          <span class="text-slate-400 shrink-0">→</span>
          <router-link
            v-if="exists(r.target)"
            :to="{ name: 'entity', params: { name: r.target } }"
            class="text-[#005eb8] hover:underline font-medium ml-auto"
          >
            {{ r.target }}
          </router-link>
          <span v-else class="text-slate-500 ml-auto">{{ r.target }}</span>
        </li>
        <li v-if="!relationships.length" class="px-3 py-3 text-xs text-slate-400">No outbound relationships.</li>
      </ul>
    </div>
    <div>
      <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
        Inbound ({{ inbound.length }})
      </h2>
      <ul class="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
        <li v-for="r in inbound" :key="r.from + ':' + r.name" class="px-3 py-2 text-sm flex items-center gap-2">
          <router-link
            :to="{ name: 'entity', params: { name: r.from } }"
            class="text-[#005eb8] hover:underline font-medium"
          >
            {{ r.from }}
          </router-link>
          <span class="text-slate-400">·</span>
          <span class="font-mono text-slate-700 truncate">{{ r.name }}</span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide ml-auto shrink-0"
            :class="r.cardinality === 'many' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'"
          >
            {{ r.cardinality }}
          </span>
        </li>
        <li v-if="!inbound.length" class="px-3 py-3 text-xs text-slate-400">Not referenced by any other entity.</li>
      </ul>
    </div>
  </section>
</template>
