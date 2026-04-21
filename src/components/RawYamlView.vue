<script setup lang="ts">
import { computed, ref } from 'vue';
import hljs from 'highlight.js/lib/core';
import yamlLang from 'highlight.js/lib/languages/yaml';
import { useCdmStore } from '@/stores/cdm';

hljs.registerLanguage('yaml', yamlLang);

const props = defineProps<{ entityName: string }>();

const store = useCdmStore();
const open = ref(false);
const copied = ref(false);

const raw = computed(() => store.getRawYaml(props.entityName) ?? '');

const highlighted = computed(() => {
  if (!raw.value) return '';
  try {
    return hljs.highlight(raw.value, { language: 'yaml' }).value;
  } catch {
    return raw.value;
  }
});

async function copy() {
  if (!raw.value) return;
  try {
    await navigator.clipboard.writeText(raw.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <section>
    <div class="flex items-center gap-2 mb-2">
      <button
        type="button"
        class="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1 hover:text-slate-900"
        @click="open = !open"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          class="w-3.5 h-3.5 transition-transform"
          :class="{ 'rotate-90': open }"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clip-rule="evenodd"
          />
        </svg>
        Raw OpenAPI YAML
      </button>
      <button
        v-if="open && raw"
        type="button"
        class="ml-auto text-xs text-slate-500 hover:text-slate-800 underline"
        @click="copy"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </div>
    <pre
      v-if="open"
      class="border border-slate-200 rounded-lg bg-slate-50 p-4 overflow-auto text-xs leading-relaxed max-h-96"
    ><code class="language-yaml" v-html="highlighted" /></pre>
  </section>
</template>
