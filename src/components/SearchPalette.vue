<script setup lang="ts">
import { computed, nextTick, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useSearch, type SearchHit } from '@/composables/useSearch';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>();

const query = ref('');
const active = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);
const { search } = useSearch();
const router = useRouter();

const results = computed<SearchHit[]>(() => search(query.value, 40));

watch(
  () => props.open,
  async (open) => {
    if (open) {
      query.value = '';
      active.value = 0;
      await nextTick();
      inputRef.value?.focus();
    }
  },
);

watch(query, () => {
  active.value = 0;
});

function close() {
  emit('update:open', false);
}

function go(hit: SearchHit) {
  router.push({ name: 'entity', params: { name: hit.entity } });
  close();
}

function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    emit('update:open', !props.open);
    return;
  }
  if (!props.open) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    active.value = Math.min(active.value + 1, Math.max(results.value.length - 1, 0));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    active.value = Math.max(active.value - 1, 0);
  } else if (e.key === 'Enter') {
    const hit = results.value[active.value];
    if (hit) {
      e.preventDefault();
      go(hit);
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-slate-900/40 backdrop-blur-sm"
      @click.self="close"
    >
      <div class="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div class="border-b border-slate-100 px-3 py-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="w-4 h-4 text-slate-400" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Search entities, properties, relationships…"
            class="flex-1 py-1.5 text-sm outline-none bg-transparent"
          />
          <button class="text-xs text-slate-400 hover:text-slate-600" @click="close">Esc</button>
        </div>

        <ul class="max-h-[60vh] overflow-auto divide-y divide-slate-50">
          <li v-if="!query.trim()" class="px-4 py-6 text-sm text-slate-400 text-center">
            Start typing to search.
          </li>
          <li v-else-if="!results.length" class="px-4 py-6 text-sm text-slate-400 text-center">
            No matches.
          </li>
          <li
            v-for="(r, i) in results"
            :key="r.kind + ':' + r.label + i"
            :class="[
              'px-3 py-2 cursor-pointer flex items-center gap-3',
              i === active ? 'bg-[#005eb8]/10' : 'hover:bg-slate-50',
            ]"
            @mouseenter="active = i"
            @click="go(r)"
          >
            <span
              class="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide font-medium shrink-0"
              :class="{
                'bg-sky-100 text-sky-700': r.kind === 'entity',
                'bg-violet-100 text-violet-700': r.kind === 'property',
                'bg-emerald-100 text-emerald-700': r.kind === 'relationship',
              }"
            >
              {{ r.kind }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="font-mono text-sm text-slate-900 truncate">{{ r.label }}</div>
              <div v-if="r.detail" class="text-xs text-slate-500 truncate">{{ r.detail }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>
