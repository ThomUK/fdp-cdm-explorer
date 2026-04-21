<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Property } from '@/types';

const props = defineProps<{ properties: Property[] }>();

const filter = ref('');

const rows = computed(() => {
  const q = filter.value.trim().toLowerCase();
  if (!q) return props.properties;
  return props.properties.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q),
  );
});

const LINK_RE = /(https?:\/\/[^\s)]+)/g;

function renderDescription(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(LINK_RE, (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
}

function formatType(p: Property): string {
  if (p.type === 'array') return `array<${p.itemType ?? 'unknown'}>`;
  return p.type;
}
</script>

<template>
  <section>
    <div class="flex items-center justify-between gap-3 mb-2">
      <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">
        Properties <span class="text-slate-400 font-normal">({{ rows.length }}/{{ properties.length }})</span>
      </h2>
      <input
        v-model="filter"
        type="search"
        placeholder="Filter properties…"
        class="px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005eb8]/30 focus:border-[#005eb8] w-56"
      />
    </div>
    <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-600 text-left">
          <tr>
            <th class="px-3 py-2 font-medium w-1/4">Name</th>
            <th class="px-3 py-2 font-medium w-40">Type</th>
            <th class="px-3 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in rows" :key="p.name" class="border-t border-slate-100 align-top">
            <td class="px-3 py-2 font-mono text-[13px] text-slate-900">
              {{ p.name }}
              <span v-if="p.required" class="ml-1 text-[10px] text-rose-600 font-sans">required</span>
            </td>
            <td class="px-3 py-2 text-slate-600">
              <span class="font-mono text-xs">{{ formatType(p) }}</span>
              <span v-if="p.format" class="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{{ p.format }}</span>
              <span v-if="p.nullable" class="ml-1 text-[10px] text-slate-400">nullable</span>
            </td>
            <td class="px-3 py-2 text-slate-700 prose-cdm" v-html="p.description ? renderDescription(p.description) : '<span class=&quot;text-slate-300&quot;>—</span>'" />
          </tr>
          <tr v-if="!rows.length">
            <td colspan="3" class="px-3 py-6 text-center text-slate-400 text-sm">No properties match.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
